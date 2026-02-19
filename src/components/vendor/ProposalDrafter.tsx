import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProposalUploadStep from "./proposal-drafter/ProposalUploadStep";
import ProposalAnalysisStep from "./proposal-drafter/ProposalAnalysisStep";
import ProposalEditorStep from "./proposal-drafter/ProposalEditorStep";
import { RFP, Requirement, Step, AIAnalysisResult, GapAnalysisItem } from "./proposal-drafter/types";

interface ProposalDrafterProps {
  rfp: RFP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
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
  const [baseScore, setBaseScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [_gapAnalysis, setGapAnalysis] = useState<GapAnalysisItem[]>([]);
  const [_dealBreakers, setDealBreakers] = useState<string[]>([]);
  const [_strengths, setStrengths] = useState<string[]>([]);
  const [_aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
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
      setBaseScore(0);
      setGapAnalysis([]);
      setDealBreakers([]);
      setStrengths([]);
      setAiError(null);
    }
  }, [open]);

  const complianceScore = useMemo(() => {
    if (baseScore === 0) return 0;
    const keywords = ['security', 'compliance', 'soc2', 'iso', 'encryption', 'uptime', 'api', 'integration', 'cloud', 'redundancy'];
    const found = keywords.filter(k => (draftContent || '').toLowerCase().includes(k));
    const bonus = Math.min(10, found.length);
    return Math.min(100, baseScore + bonus);
  }, [baseScore, draftContent]);


  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    setUploadedFiles(prev => [...prev, ...Array.from(files)]);
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
        setBaseScore(75); // Default score, will be updated by analyze-proposal

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
          setBaseScore(analysisData.complianceScore || 75);
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
        setBaseScore(result.complianceScore || 75);
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
    setBaseScore(0);
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
            {step === 'upload' && (
              <ProposalUploadStep
                key="upload"
                uploadedFiles={uploadedFiles}
                onUpload={handleFileUpload}
                onRemove={removeFile}
                onStartAnalysis={startAnalysis}
                onSkip={skipUpload}
              />
            )}

            {step === 'analyzing' && (
              <ProposalAnalysisStep
                key="analyzing"
                progress={analyzeProgress}
                status={analyzeStatus}
              />
            )}

            {step === 'editor' && (
              <ProposalEditorStep
                key="editor"
                complianceScore={complianceScore}
                requirements={requirements}
                selectedRequirement={selectedRequirement}
                onSelectRequirement={setSelectedRequirement}
                draftContent={draftContent}
                onDraftChange={setDraftContent}
                onBack={() => setStep('upload')}
                onSave={handleSaveDraft}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalDrafter;
