import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  FileText,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Requirement } from "./types";

interface ProposalEditorStepProps {
  complianceScore: number;
  requirements: Requirement[];
  selectedRequirement: string | null;
  onSelectRequirement: (id: string | null) => void;
  draftContent: string;
  onDraftChange: (content: string) => void;
  onBack: () => void;
  onSave: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
};

const ProposalEditorStep = ({
  complianceScore,
  requirements,
  selectedRequirement,
  onSelectRequirement,
  draftContent,
  onDraftChange,
  onBack,
  onSave,
  onSubmit,
  submitting,
}: ProposalEditorStepProps) => {
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
                onClick={() =>
                  onSelectRequirement(
                    req.id === selectedRequirement ? null : req.id
                  )
                }
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRequirement === req.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
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
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
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
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Start typing your proposal..."
            className="flex-1 resize-none text-sm min-h-0"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Upload
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSave} disabled={submitting}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={onSubmit} disabled={submitting || !draftContent}>
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
