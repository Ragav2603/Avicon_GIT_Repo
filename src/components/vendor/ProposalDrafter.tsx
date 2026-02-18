import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileUp, 
  Loader2, 
  CheckCircle2, 
  FileText,
  X,
  Sparkles,
  Shield,
  ChevronRight,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  deadline: string | null;
}

interface Requirement {
  id: string;
  requirement_text: string;
  is_mandatory: boolean | null;
  weight: number | null;
}

interface ProposalDrafterProps {
  rfp: RFP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = 'upload' | 'analyzing' | 'editor';

interface GapAnalysisItem {
  requirementId: string;
  status: 'met' | 'partial' | 'missing';
  finding: string;
  recommendation: string;
}

interface AIAnalysisResult {
  complianceScore: number;
  gapAnalysis: GapAnalysisItem[];
  draftProposal: string;
  dealBreakers: string[];
  strengths: string[];
}

const ProposalDrafter = ({ rfp, open, onOpenChange, onSuccess }: ProposalDrafterProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [_analyzing, setAnalyzing] = useState(false);
  const [_uploading, setUploading] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [draftContent, setDraftContent] = useState('');
  const [complianceScore, setComplianceScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [_gapAnalysis, setGapAnalysis] = useState<GapAnalysisItem[]>([]);
  const [_dealBreakers, setDealBreakers] = useState<string[]>([]);
  const [_strengths, setStrengths] = useState<string[]>([]);
  const [_aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (rfp && open) {
      fetchRequirements();
    }
  }, [rfp, open]);

  useEffect(() => {
    // Reset state when dialog opens
    if (open) {
      setStep('upload');
      setUploadedFiles([]);
      setAnalyzeProgress(0);
      setDraftContent('');
      setComplianceScore(0);
      setGapAnalysis([]);
      setDealBreakers([]);
      setStrengths([]);
      setAiError(null);
    }
  }, [open]);

  // Recalculate compliance score when content changes (add keyword bonus)
  useEffect(() => {
    if (draftContent && complianceScore > 0) {
      const keywords = ['security', 'compliance', 'soc2', 'iso', 'encryption', 'uptime', 'api', 'integration', 'cloud', 'redundancy'];
      const found = keywords.filter(k => draftContent.toLowerCase().includes(k));
      const bonus = Math.min(10, found.length);
      // Don't go below AI score, only add bonus
      setComplianceScore(prev => Math.min(100, prev + bonus));
    }
  }, [draftContent]);

  const fetchRequirements = async () => {
    if (!rfp) return;

    const { data } = await supabase
      .from('rfp_requirements')
      .select('*')
      .eq('rfp_id', rfp.id);

    if (data && data.length > 0) {
      setRequirements(data);
    } else {
      // Mock requirements if none exist
      setRequirements([
        { id: '1', requirement_text: 'Cloud-native architecture with 99.9% uptime SLA', is_mandatory: true, weight: 20 },
        { id: '2', requirement_text: 'SOC2 Type II and ISO 27001 compliance', is_mandatory: true, weight: 25 },
        { id: '3', requirement_text: 'US-based data residency with encryption at rest', is_mandatory: true, weight: 20 },
        { id: '4', requirement_text: 'RESTful API with comprehensive documentation', is_mandatory: false, weight: 15 },
        { id: '5', requirement_text: 'Training and 24/7 support included', is_mandatory: false, weight: 10 },
        { id: '6', requirement_text: 'Implementation within 16 weeks', is_mandatory: false, weight: 10 },
      ]);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    setUploadedFiles(prev => [...prev, ...Array.from(files)]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = async () => {
    if (!rfp || !user) return;
    
    setStep('analyzing');
    setAnalyzing(true);
    setAiError(null);

    const updateProgress = (progress: number, status: string) => {
      setAnalyzeProgress(progress);
      setAnalyzeStatus(status);
    };

    try {
      let filePath: string | null = null;

      // Step 1: Upload file if provided
      if (uploadedFiles.length > 0) {
        setUploading(true);
        await updateProgress(10, 'Uploading document...');
        
        const file = uploadedFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("user_uploads")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        setUploading(false);
      }

      await updateProgress(30, 'Connecting to AI Writer...');

      // Step 2: Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      // Step 3: Call generate-draft if we have a file, otherwise use analyze-proposal
      if (filePath) {
        await updateProgress(50, 'AI Writer working...');

        const response = await fetch(
          "https://aavlayzfaafuwquhhbcx.supabase.co/functions/v1/generate-draft",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file_path: filePath,
              check_type: "proposal_draft",
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Analysis failed (${response.status})`);
        }

        const draftData = await response.json();

        await updateProgress(80, 'Generating proposal...');

        // Combine pitch_summary and proposed_solution into draft content
        const fullDraft = `${draftData.pitch_summary || ""}\n\n---\n\n${draftData.proposed_solution || ""}`;
        setDraftContent(fullDraft);
        setComplianceScore(75); // Default score, will be updated by analyze-proposal

        await updateProgress(90, 'Running compliance check...');

        // Also run the analyze-proposal for gap analysis
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-proposal', {
          body: {
            rfpTitle: rfp.title,
            rfpDescription: rfp.description,
            requirements: requirements,
            uploadedDocsSummary: `Vendor uploaded: ${uploadedFiles.map(f => f.name).join(', ')}`,
          },
        });

        if (!analysisError && analysisData && !analysisData.error) {
          setComplianceScore(analysisData.complianceScore || 75);
          setGapAnalysis(analysisData.gapAnalysis || []);
          setDealBreakers(analysisData.dealBreakers || []);
          setStrengths(analysisData.strengths || []);
        }
      } else {
        // No file uploaded - just run analyze-proposal
        await updateProgress(50, 'Analyzing requirements...');

        const { data, error } = await supabase.functions.invoke('analyze-proposal', {
          body: {
            rfpTitle: rfp.title,
            rfpDescription: rfp.description,
            requirements: requirements,
          },
        });

        if (error) throw error;

        await updateProgress(80, 'Generating draft...');

        if (data.error) {
          throw new Error(data.error);
        }

        const result = data as AIAnalysisResult;
        setComplianceScore(result.complianceScore || 75);
        setGapAnalysis(result.gapAnalysis || []);
        setDealBreakers(result.dealBreakers || []);
        setStrengths(result.strengths || []);
        setDraftContent(result.draftProposal || '');
      }

      await updateProgress(100, 'Complete!');
      await new Promise(resolve => setTimeout(resolve, 300));

      setStep('editor');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze. Please try again.';
      console.error('AI analysis error:', error);
      setAiError(message);
      toast({
        title: 'Analysis Failed',
        description: message,
        variant: 'destructive',
      });
      setStep('editor');
    } finally {
      setAnalyzing(false);
      setUploading(false);
    }
  };

  const skipUpload = () => {
    // Skip directly to the editor without any AI analysis
    setDraftContent('');
    setComplianceScore(0);
    setStep('editor');
  };

  const handleSaveDraft = async () => {
    if (!user || !rfp) return;
    setSubmitting(true);
    try {
      // Try to update existing draft first
      const { data: existing } = await supabase
        .from('submissions')
        .select('id')
        .eq('rfp_id', rfp.id)
        .eq('vendor_id', user.id)
        .maybeSingle();

      let error;
      if (existing) {
        // Update existing record
        const result = await supabase
          .from('submissions')
          .update({
            pitch_text: draftContent,
            ai_score: complianceScore,
            status: 'draft',
          })
          .eq('id', existing.id);
        error = result.error;
      } else {
        // Insert new draft
        const result = await supabase
          .from('submissions')
          .insert({
            rfp_id: rfp.id,
            vendor_id: user.id,
            pitch_text: draftContent,
            ai_score: complianceScore,
            status: 'draft',
          });
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Draft Saved",
        description: "Your draft has been saved. You can continue editing anytime.",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Save Failed",
        description: "Could not save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !rfp) return;

    // Enforce minimum pitch length before hitting the DB constraint
    const trimmed = draftContent.trim();
    if (trimmed.length > 0 && trimmed.length < 10) {
      toast({
        title: "Proposal too short",
        description: "Please write at least 10 characters before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Check for an existing submission (draft or otherwise) to avoid duplicate key errors
      const { data: existing } = await supabase
        .from('submissions')
        .select('id')
        .eq('rfp_id', rfp.id)
        .eq('vendor_id', user.id)
        .maybeSingle();

      let error;
      if (existing) {
        const result = await supabase
          .from('submissions')
          .update({
            pitch_text: draftContent,
            ai_score: complianceScore,
            status: 'submitted',
          })
          .eq('id', existing.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('submissions')
          .insert({
            rfp_id: rfp.id,
            vendor_id: user.id,
            pitch_text: draftContent,
            ai_score: complianceScore,
            status: 'submitted',
          });
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Proposal Submitted!",
        description: "Your proposal has been sent to the airline for review.",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      const message = error instanceof Error ? error.message : 'Please try again later.';
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Proposal Drafter: {rfp?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Upload */}
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full p-6 flex flex-col"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Upload Source Documents</h3>
                  <p className="text-muted-foreground">
                    Upload previous proposals, API docs, or capability statements to auto-generate your response
                  </p>
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex-1 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-4 cursor-pointer bg-muted/30"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <div className="p-4 rounded-full bg-primary/10">
                    <FileUp className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Drop files here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF, DOCX, or TXT files up to 10MB
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1" onClick={skipUpload}>
                    Skip & Start Manually
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={startAnalysis}
                    disabled={uploadedFiles.length === 0}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze & Generate
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Analyzing */}
            {step === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center p-6"
              >
                <div className="w-full max-w-md space-y-8">
                  <div className="text-center">
                    <div className="relative inline-flex mb-6">
                      <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
                      <div className="relative p-4 bg-primary/10 rounded-full">
                        <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">AI Analysis in Progress</h3>
                    <p className="text-muted-foreground">{analyzeStatus}</p>
                  </div>

                  <div className="space-y-2">
                    <Progress value={analyzeProgress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {analyzeProgress}% complete
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Scanning for Deal Breakers', done: analyzeProgress >= 60 },
                      { label: 'Matching Requirements', done: analyzeProgress >= 40 },
                      { label: 'Generating Answers', done: analyzeProgress >= 80 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.done ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        )}
                        <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Editor */}
            {step === 'editor' && (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                {/* Compliance Score Bar */}
                <div className="px-6 py-3 bg-muted/50 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium">Compliance Score:</span>
                    <span className={`text-2xl font-bold ${getScoreColor(complianceScore)}`}>
                      {complianceScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Auto-updates as you edit</span>
                  </div>
                </div>

                {/* Split View */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Left: Requirements */}
                  <div className="w-1/2 border-r border-border overflow-y-auto p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      RFP Requirements
                    </h4>
                    <div className="space-y-3">
                      {requirements.map((req) => (
                        <div
                          key={req.id}
                          onClick={() => setSelectedRequirement(req.id === selectedRequirement ? null : req.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedRequirement === req.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm">{req.requirement_text}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {req.is_mandatory && (
                                  <Badge variant="destructive" className="text-xs">
                                    Mandatory
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  Weight: {req.weight}%
                                </Badge>
                              </div>
                            </div>
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Draft Editor */}
                  <div className="w-1/2 flex flex-col p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Your Draft Response
                    </h4>
                    <Textarea
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      placeholder="Start typing your proposal..."
                      className="flex-1 resize-none text-sm min-h-0"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border flex items-center justify-between">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Back to Upload
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={submitting}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || !draftContent}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Submit Proposal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalDrafter;
