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
    { title: 'TOTAL AUDITS', value: totalAudits },
    { title: 'AVERAGE SCORE', value: averageScore > 0 ? `${averageScore}%` : '—' },
    { title: 'THIS MONTH', value: thisMonthCount },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="enterprise-card p-5">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="enterprise-card p-5 group"
        >
          <p className="text-[11px] font-semibold text-muted-foreground tracking-widest uppercase mb-2">
            {stat.title}
          </p>
          <p className="text-2xl font-bold font-mono text-foreground tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};
