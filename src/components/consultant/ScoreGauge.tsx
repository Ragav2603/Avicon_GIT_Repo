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
  if (score >= 80) return { stroke: 'stroke-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (score >= 50) return { stroke: 'stroke-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' };
  return { stroke: 'stroke-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' };
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
