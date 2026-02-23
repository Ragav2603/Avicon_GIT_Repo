import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AdoptionScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
}

const AdoptionScoreGauge = ({ 
  score, 
  size = 'md', 
  showLabel = true, 
  label = 'Overall Score',
  animate = true 
}: AdoptionScoreGaugeProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Needs Attention';
    return 'Critical';
  };

  const dimensions = {
    sm: { size: 100, stroke: 8, radius: 42, fontSize: 'text-2xl' },
    md: { size: 160, stroke: 12, radius: 70, fontSize: 'text-4xl' },
    lg: { size: 200, stroke: 14, radius: 88, fontSize: 'text-5xl' },
  };

  const { size: svgSize, stroke, radius, fontSize } = dimensions[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className={getScoreColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className={cn('font-bold text-foreground', fontSize)}
            initial={animate ? { opacity: 0, scale: 0.5 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {score}%
          </motion.span>
          {showLabel && size !== 'sm' && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
        </div>
      </div>
      {showLabel && (
        <div className="mt-2 text-center">
          <span className={cn('text-sm font-medium', getScoreColor(score))}>
            {getScoreStatus(score)}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdoptionScoreGauge;
