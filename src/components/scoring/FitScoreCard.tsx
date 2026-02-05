import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FitScoreCardProps {
  fitScore: number;
  dealBreakerFlags: string[];
  weightedScores?: Record<string, number>;
  showDetails?: boolean;
}

const FitScoreCard = ({ fitScore, dealBreakerFlags, weightedScores, showDetails = true }: FitScoreCardProps) => {
  const hasDealBreakers = dealBreakerFlags.length > 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusBadge = () => {
    if (hasDealBreakers) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Deal Breaker Detected
        </Badge>
      );
    }
    if (fitScore >= 80) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          High Fit
        </Badge>
      );
    }
    if (fitScore >= 60) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
          <AlertTriangle className="h-3 w-3" />
          Partial Fit
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/10 text-red-600 border-red-500/20 gap-1">
        <XCircle className="h-3 w-3" />
        Low Fit
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        hasDealBreakers 
          ? 'border-red-500/30 bg-red-500/5' 
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">AI Fit Score</span>
            {getStatusBadge()}
          </div>
          
          {/* Score Display */}
          <div className="flex items-end gap-3 mb-3">
            <span className={`text-4xl font-bold tabular-nums ${getScoreColor(fitScore)}`}>
              {fitScore}
            </span>
            <span className="text-lg text-muted-foreground mb-1">/100</span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fitScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`absolute inset-y-0 left-0 ${getScoreBgColor(fitScore)}`}
            />
          </div>

          {/* Deal Breaker Flags */}
          {showDetails && hasDealBreakers && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Missing Critical Requirements:</span>
              </div>
              <ul className="space-y-1">
                {dealBreakerFlags.map((flag, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground bg-red-500/10 px-3 py-2 rounded"
                  >
                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{flag.replace('[DEAL BREAKER] ', '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Score Breakdown */}
          {showDetails && weightedScores && Object.keys(weightedScores).length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Weighted Score Breakdown</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(weightedScores).slice(0, 5).map(([reqId, score]) => (
                  <Tooltip key={reqId}>
                    <TooltipTrigger>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        score >= 80 ? 'bg-green-500/10 text-green-600' :
                        score >= 60 ? 'bg-amber-500/10 text-amber-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {score}%
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Requirement Score: {score}%</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FitScoreCard;
