import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Requirement } from "./types";
import RequirementsList from "./RequirementsList";
import { calculateComplianceScore } from "./utils";

interface ProposalEditorStepProps {
  baseScore: number;
  requirements: Requirement[];
  selectedRequirement: string | null;
  onSelectRequirement: (id: string | null) => void;
  initialContent: string;
  onBack: (content: string) => void;
  onSave: (content: string, score: number) => void;
  onSubmit: (content: string, score: number) => void;
  submitting: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
};

const ProposalEditorStep = ({
  baseScore,
  requirements,
  selectedRequirement,
  onSelectRequirement,
  initialContent,
  onBack,
  onSave,
  onSubmit,
  submitting,
}: ProposalEditorStepProps) => {
  const [content, setContent] = useState(initialContent);

  const complianceScore = useMemo(() => {
    return calculateComplianceScore(baseScore, content);
  }, [baseScore, content]);

  return (
    <motion.div
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
          <span
            className={`text-2xl font-bold ${getScoreColor(complianceScore)}`}
          >
            {complianceScore}%
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span>Auto-updates as you edit</span>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        <RequirementsList
          requirements={requirements}
          selectedRequirement={selectedRequirement}
          onSelectRequirement={onSelectRequirement}
        />

        {/* Right: Draft Editor */}
        <div className="w-1/2 flex flex-col p-4">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Your Draft Response
          </h4>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your proposal..."
            className="flex-1 resize-none text-sm min-h-0"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <Button variant="outline" onClick={() => onBack(content)}>
          Back to Upload
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onSave(content, complianceScore)} disabled={submitting}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => onSubmit(content, complianceScore)} disabled={submitting || !content}>
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
  );
};

export default ProposalEditorStep;
