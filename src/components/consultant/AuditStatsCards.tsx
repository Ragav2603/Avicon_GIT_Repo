import { motion } from 'framer-motion';
import { ClipboardCheck, TrendingUp, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditStatsCardsProps {
  totalAudits: number;
  averageScore: number;
  thisMonthCount: number;
  isLoading?: boolean;
}

export const AuditStatsCards = ({
  totalAudits,
  averageScore,
  thisMonthCount,
  isLoading = false,
}: AuditStatsCardsProps) => {
  const stats = [
    {
      title: 'Total Audits',
      value: totalAudits,
      icon: ClipboardCheck,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Average Score',
      value: averageScore > 0 ? `${averageScore}%` : '—',
      icon: TrendingUp,
      color: averageScore >= 80 ? 'text-emerald-600' : averageScore >= 50 ? 'text-amber-600' : 'text-rose-600',
      bgColor: averageScore >= 80 ? 'bg-emerald-50' : averageScore >= 50 ? 'bg-amber-50' : 'bg-rose-50',
    },
    {
      title: 'This Month',
      value: thisMonthCount,
      icon: Calendar,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
