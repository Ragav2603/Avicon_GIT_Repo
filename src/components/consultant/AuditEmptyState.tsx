import { motion } from 'framer-motion';
import { ClipboardCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditEmptyStateProps {
  onNewAudit: () => void;
}

export const AuditEmptyState = ({ onNewAudit }: AuditEmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-dashed border-border bg-card p-12 flex flex-col items-center justify-center text-center"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-full bg-accent/10 flex items-center justify-center">
          <ClipboardCheck className="h-12 w-12 text-accent/50" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
          <Plus className="h-4 w-4 text-success" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        No Audits Yet
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Start your first digital adoption audit to evaluate airline software ecosystems and generate AI-powered recommendations.
      </p>

      <Button onClick={onNewAudit} size="lg" className="bg-accent hover:bg-accent/90">
        <Plus className="h-5 w-5 mr-2" />
        Start Your First Audit
      </Button>
    </motion.div>
  );
};
