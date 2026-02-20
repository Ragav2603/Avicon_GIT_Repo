import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolUsageBarProps {
  name: string;
  vendor?: string;
  adoption: number;
  status?: 'healthy' | 'warning' | 'critical';
  delay?: number;
}

const ToolUsageBar = ({ 
  name, 
  vendor, 
  adoption, 
  status,
  delay = 0 
}: ToolUsageBarProps) => {
  const getProgressColor = (adoption: number) => {
    if (adoption >= 80) return 'bg-success';
    if (adoption >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  const getTextColor = (adoption: number) => {
    if (adoption >= 80) return 'text-success';
    if (adoption >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusIcon = () => {
    const derivedStatus = status || (adoption >= 80 ? 'healthy' : adoption >= 50 ? 'warning' : 'critical');
    
    switch (derivedStatus) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="p-5 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium text-foreground">{name}</p>
            {vendor && <p className="text-sm text-muted-foreground">{vendor}</p>}
          </div>
        </div>
        <span className={cn('text-lg font-bold', getTextColor(adoption))}>
          {adoption}%
        </span>
      </div>
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${adoption}%` }}
          transition={{ delay: delay + 0.1, duration: 0.5, ease: 'easeOut' }}
          className={cn('absolute inset-y-0 left-0 rounded-full', getProgressColor(adoption))}
        />
      </div>
    </motion.div>
  );
};

export default ToolUsageBar;
