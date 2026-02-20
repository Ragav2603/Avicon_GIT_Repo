import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeConfig = {
  sm: { width: 80, strokeWidth: 6, fontSize: 'text-xl', labelSize: 'text-[10px]' },
  md: { width: 120, strokeWidth: 8, fontSize: 'text-3xl', labelSize: 'text-xs' },
  lg: { width: 180, strokeWidth: 10, fontSize: 'text-5xl', labelSize: 'text-sm' },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return { stroke: 'stroke-success', text: 'text-success', bg: 'bg-success/10' };
  if (score >= 50) return { stroke: 'stroke-warning', text: 'text-warning', bg: 'bg-warning/10' };
  return { stroke: 'stroke-destructive', text: 'text-destructive', bg: 'bg-destructive/10' };
};

export const ScoreGauge = ({ score, size = 'md', showLabel = true }: ScoreGaugeProps) => {
  const config = sizeConfig[size];
  const colors = getScoreColor(score);
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            strokeWidth={config.strokeWidth}
            className="stroke-muted/30"
            fill="none"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            strokeWidth={config.strokeWidth}
            className={colors.stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${config.fontSize} font-bold ${colors.text} tabular-nums`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {score}
          </motion.span>
          {showLabel && (
            <span className={`${config.labelSize} text-muted-foreground`}>
              out of 100
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
