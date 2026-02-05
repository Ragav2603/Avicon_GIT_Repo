import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, FileText, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AuditResult {
  audit_id: string;
  overall_score: number;
  summary: string;
  recommendations: {
    tool_name: string;
    score: number;
    recommendation: string;
  }[];
}

interface AuditResultsCardProps {
  result: AuditResult;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-500/10 border-green-500/20';
  if (score >= 50) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
};

const getScoreIcon = (score: number) => {
  if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (score >= 50) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
};

const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

export const AuditResultsCard = ({ result }: AuditResultsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Overall Score Card */}
      <div className={`p-6 rounded-xl border ${getScoreBg(result.overall_score)}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Circular Score */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 mx-auto md:mx-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  className="text-muted/30"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <motion.circle
                  className={getScoreColor(result.overall_score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  initial={{ strokeDasharray: '0 352' }}
                  animate={{
                    strokeDasharray: `${(result.overall_score / 100) * 352} 352`,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(result.overall_score)}`}>
                  {result.overall_score}
                </span>
                <span className="text-xs text-muted-foreground">out of 100</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Overall Adoption Score</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
          </div>
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detailed Recommendations
          </h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool Name</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="w-[50%]">Recommendation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.recommendations.map((rec, index) => (
              <motion.tr
                key={rec.tool_name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-border last:border-0"
              >
                <TableCell className="font-medium">{rec.tool_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 min-w-[120px]">
                    {getScoreIcon(rec.score)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${getScoreColor(rec.score)}`}>
                          {rec.score}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${getProgressColor(rec.score)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${rec.score}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Audit ID Footer */}
      <div className="text-center">
        <Badge variant="outline" className="text-xs">
          Audit ID: {result.audit_id}
        </Badge>
      </div>
    </motion.div>
  );
};
