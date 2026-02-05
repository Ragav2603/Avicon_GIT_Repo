import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Recommendation {
  tool_name: string;
  score: number;
  recommendation: string;
  utilization_metric?: number;
  sentiment_score?: number;
}

interface RecommendationsTableProps {
  recommendations: Recommendation[];
}

const getScoreConfig = (score: number) => {
  if (score >= 80) {
    return {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-l-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (score >= 50) {
    return {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-l-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  return {
    icon: XCircle,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-l-rose-500',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
  };
};

export const RecommendationsTable = ({ recommendations }: RecommendationsTableProps) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          Detailed Recommendations
        </h3>
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI Generated
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold w-[200px]">Tool Name</TableHead>
            <TableHead className="font-semibold w-[120px]">Metrics</TableHead>
            <TableHead className="font-semibold w-[100px]">Score</TableHead>
            <TableHead className="font-semibold">Recommendation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recommendations.map((rec, index) => {
            const config = getScoreConfig(rec.score);
            const Icon = config.icon;

            return (
              <motion.tr
                key={rec.tool_name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`border-l-4 ${config.borderColor} hover:bg-muted/30 transition-colors`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <span className="font-medium text-foreground">{rec.tool_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {rec.utilization_metric !== undefined && (
                      <p className="text-muted-foreground">
                        Util: <span className="font-medium text-foreground tabular-nums">{rec.utilization_metric}%</span>
                      </p>
                    )}
                    {rec.sentiment_score !== undefined && (
                      <p className="text-muted-foreground">
                        Sent: <span className="font-medium text-foreground tabular-nums">{rec.sentiment_score}/10</span>
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={config.badgeBg}>
                    {rec.score}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rec.recommendation}
                  </p>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
