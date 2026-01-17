import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, FileText, Building2 } from 'lucide-react';
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pitchText, setPitchText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

      // Create submission
      const { error } = await supabase
        .from('submissions')
        .insert({
          rfp_id: rfp.id,
          vendor_id: user.id,
          pitch_text: pitchText,
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Proposal submitted successfully!' });
      setPitchText('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit proposal',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rfp) return null;

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
