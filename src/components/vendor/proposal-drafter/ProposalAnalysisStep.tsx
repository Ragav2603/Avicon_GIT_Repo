import { motion } from "framer-motion";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProposalAnalysisStepProps {
  progress: number;
  status: string;
}

const ProposalAnalysisStep = ({ progress, status }: ProposalAnalysisStepProps) => {
  return (
    <motion.div
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
          <p className="text-muted-foreground">{status}</p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">
            {progress}% complete
          </p>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Scanning for Deal Breakers', done: progress >= 60 },
            { label: 'Matching Requirements', done: progress >= 40 },
            { label: 'Generating Answers', done: progress >= 80 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
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
  );
};

export default ProposalAnalysisStep;
