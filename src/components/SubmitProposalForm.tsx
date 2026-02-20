import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, FileText, Building2, Upload, X, File, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const proposalSchema = z.object({
  pitch_text: z.string().min(50, 'Proposal must be at least 50 characters').max(10000),
});

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  status: string | null;
  created_at: string;
  airline_id: string;
}

interface Requirement {
  id: string;
  requirement_text: string;
  is_mandatory: boolean | null;
  weight: number | null;
}

interface SubmitProposalFormProps {
  rfp: RFP | null;
  requirements: Requirement[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const SubmitProposalForm = ({ rfp, requirements, open, onOpenChange, onSuccess }: SubmitProposalFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pitchText, setPitchText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF, Word document, PowerPoint, or image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile || !user) return null;

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    setUploadProgress(30);

    const { data, error } = await supabase.storage
      .from('proposal-attachments')
      .upload(fileName, selectedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    setUploadProgress(100);

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload attachment');
    }

    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !rfp) {
      toast({ title: 'Error', description: 'Invalid state', variant: 'destructive' });
      return;
    }

    // Validate
    try {
      proposalSchema.parse({ pitch_text: pitchText });
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Check for existing submission
      const { data: existing } = await supabase
        .from('submissions')
        .select('id')
        .eq('rfp_id', rfp.id)
        .eq('vendor_id', user.id)
        .maybeSingle();

      if (existing) {
        toast({
          title: 'Already Submitted',
          description: 'You have already submitted a proposal for this RFP',
          variant: 'destructive',
        });
        return;
      }

      // Upload file if selected
      let attachmentUrl: string | null = null;
      if (selectedFile) {
        attachmentUrl = await uploadFile();
      }

      // Create submission
      const { error } = await supabase
        .from('submissions')
        .insert({
          rfp_id: rfp.id,
          vendor_id: user.id,
          pitch_text: pitchText,
          attachment_url: attachmentUrl,
        });

      if (error) throw error;

      // Send notification email to airline
      try {
        await supabase.functions.invoke('notify-proposal-submitted', {
          body: {
            rfp_id: rfp.id,
            vendor_name: profile?.company_name || 'A vendor',
            rfp_title: rfp.title,
          },
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the submission if email fails
      }

      toast({ title: 'Success', description: 'Proposal submitted successfully!' });
      setPitchText('');
      setSelectedFile(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit proposal';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!rfp) return null;

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-5 w-5" />;
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (['ppt', 'pptx'].includes(ext || '')) return <FileText className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Submit Proposal
          </DialogTitle>
        </DialogHeader>

        {/* RFP Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-foreground">{rfp.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{rfp.description}</p>
            </div>
          </div>
          
          {rfp.budget_max && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Budget up to:</span>
              <span className="font-medium">${rfp.budget_max.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Requirements */}
        {requirements.length > 0 && (
          <div className="space-y-2">
            <Label>Requirements to Address</Label>
            <div className="space-y-2">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-start gap-2 text-sm">
                  <Badge variant={req.is_mandatory ? 'default' : 'secondary'} className="mt-0.5">
                    {req.is_mandatory ? 'Required' : 'Optional'}
                  </Badge>
                  <span className="text-muted-foreground">{req.requirement_text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pitch */}
          <div className="space-y-2">
            <Label htmlFor="pitch">Your Proposal *</Label>
            <Textarea
              id="pitch"
              placeholder="Explain how your solution meets the requirements, your experience, pricing approach, and why you're the best fit..."
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              className={`min-h-[200px] ${errors.pitch_text ? 'border-destructive' : ''}`}
            />
            {errors.pitch_text && <p className="text-sm text-destructive">{errors.pitch_text}</p>}
            <p className="text-xs text-muted-foreground">
              {pitchText.length}/10000 characters
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attachment (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload a PDF, Word document, PowerPoint, or image (max 10MB)
            </p>
            
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                aria-label="Upload file attachment"
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX, PPT, PPTX, JPG, PNG
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                {getFileIcon()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
                  </div>
                ) : uploadProgress === 100 ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitProposalForm;
