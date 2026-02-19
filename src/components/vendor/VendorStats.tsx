import { FileEdit, TrendingUp, XCircle, Clock } from "lucide-react";

interface VendorStatsProps {
  activeProposals: number;
  winRate: number;
  dealBreakerFails: number;
  avgResponseTime: string;
}

const VendorStats = ({ 
  activeProposals = 7, 
  winRate = 34, 
  dealBreakerFails = 3,
  avgResponseTime = "4.2 days"
}: Partial<VendorStatsProps>) => {
  const stats = [
    {
      label: "ACTIVE PROPOSALS",
      value: activeProposals,
      change: "+2 this week",
      changeType: "positive" as const,
    },
    {
      label: "WIN RATE",
      value: `${winRate}%`,
      change: "+5% vs last month",
      changeType: "positive" as const,
    },
    {
      label: "DEAL BREAKER FAILS",
      value: dealBreakerFails,
      change: "Missing ISO 27001",
      changeType: "negative" as const,
    },
    {
      label: "AVG RESPONSE TIME",
      value: avgResponseTime,
      change: "Industry avg: 6 days",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-5 rounded-md border border-border bg-card"
        >
          <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">
            {stat.label}
          </p>
          <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
          <p className={`text-xs mt-1 ${
            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  );
};

export default VendorStats;
