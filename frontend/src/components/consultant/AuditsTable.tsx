import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Eye, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Audit {
  id: string;
  airline_id: string;
  airline_name?: string;
  audit_date: string | null;
  overall_score: number | null;
  created_at: string;
}

interface AuditsTableProps {
  audits: Audit[];
  isLoading?: boolean;
}

const getScoreBadge = (score: number | null) => {
  if (score === null) return null;
  
  if (score >= 80) {
    return (
      <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/15">
        {score}%
      </Badge>
    );
  }
  if (score >= 50) {
    return (
      <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/15">
        {score}%
      </Badge>
    );
  }
  return (
    <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15">
      {score}%
    </Badge>
  );
};

export const AuditsTable = ({ audits, isLoading = false }: AuditsTableProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (audits.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
    >
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-accent" />
          Recent Audits
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Airline</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Overall Score</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {audits.map((audit, index) => (
            <motion.tr
              key={audit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/consultant-dashboard/audit/${audit.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-accent">
                      {(audit.airline_name || 'Unknown')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-foreground">
                    {audit.airline_name || 'Unknown Airline'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {audit.audit_date
                  ? format(new Date(audit.audit_date), 'MMM d, yyyy')
                  : format(new Date(audit.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {getScoreBadge(audit.overall_score)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/consultant-dashboard/audit/${audit.id}`);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};
