import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Lightbulb, 
  CheckCircle, 
  XCircle,
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RecommendationType = 'critical' | 'warning' | 'success' | 'info';

interface AIRecommendationCardProps {
  type: RecommendationType;
  title: string;
  description: string;
  action?: string;
  onActionClick?: () => void;
  delay?: number;
}

const AIRecommendationCard = ({
  type,
  title,
  description,
  action,
  onActionClick,
  delay = 0,
}: AIRecommendationCardProps) => {
  const config = {
    critical: {
      icon: XCircle,
      bgClass: 'bg-destructive/5',
      borderClass: 'border-destructive/20',
      iconClass: 'text-destructive',
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-warning/5',
      borderClass: 'border-warning/20',
      iconClass: 'text-warning',
    },
    success: {
      icon: CheckCircle,
      bgClass: 'bg-success/5',
      borderClass: 'border-success/20',
      iconClass: 'text-success',
    },
    info: {
      icon: Lightbulb,
      bgClass: 'bg-primary/5',
      borderClass: 'border-primary/20',
      iconClass: 'text-primary',
    },
  };

  const { icon: Icon, bgClass, borderClass, iconClass } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'p-4 rounded-xl border',
        bgClass,
        borderClass
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconClass)} />
        <div className="flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {action && onActionClick && (
            <Button
              variant="link"
              size="sm"
              onClick={onActionClick}
              className="p-0 h-auto mt-2 text-primary"
            >
              {action}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AIRecommendationCard;
