import { motion } from "framer-motion";
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
      label: "Active Proposals",
      value: activeProposals,
      icon: FileEdit,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+2 this week",
      changeType: "positive" as const,
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: "+5% vs last month",
      changeType: "positive" as const,
    },
    {
      label: "Deal Breaker Fails",
      value: dealBreakerFails,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      change: "Missing ISO 27001",
      changeType: "negative" as const,
    },
    {
      label: "Avg Response Time",
      value: avgResponseTime,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      change: "Industry avg: 6 days",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            <p className={`text-xs mt-2 ${
              stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
            }`}>
              {stat.change}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default VendorStats;
