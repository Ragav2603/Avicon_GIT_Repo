import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ControlTowerLayout from "@/components/layout/ControlTowerLayout";
import ConsultingRequestForm from "@/components/ConsultingRequestForm";

const mockTools = [
  { name: "CloudSync Pro", adoption: 87, status: "healthy", vendor: "TechCorp" },
  { name: "DataPipeline Suite", adoption: 62, status: "warning", vendor: "DataStream Inc" },
  { name: "AeroAnalytics", adoption: 91, status: "healthy", vendor: "SkyTech" },
  { name: "CrewScheduler 3.0", adoption: 34, status: "critical", vendor: "FlightOps Co" },
];

const AdoptionTrackerPage = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!role) {
        navigate("/onboarding");
      } else if (role !== "airline") {
        navigate(`/${role}-dashboard`);
      }
    }
  }, [user, role, loading, navigate]);

  if (loading || role !== "airline") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getProgressColor = (adoption: number) => {
    if (adoption >= 80) return "bg-green-500";
    if (adoption >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const overallScore = Math.round(mockTools.reduce((acc, t) => acc + t.adoption, 0) / mockTools.length);

  return (
    <ControlTowerLayout 
      title="Adoption Audits" 
      subtitle="Monitor tool adoption and ROI across your organization"
    >
      {/* Overall Score Gauge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-8 mb-8 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${overallScore * 4.4} 440`}
                  strokeLinecap="round"
                  className={overallScore >= 80 ? "text-green-500" : overallScore >= 50 ? "text-amber-500" : "text-red-500"}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{overallScore}%</span>
                <span className="text-sm text-muted-foreground">Overall Score</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold text-foreground">{mockTools.length}</p>
              <p className="text-sm text-muted-foreground">Tools Tracked</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{mockTools.filter(t => t.status === 'healthy').length}</p>
              <p className="text-sm text-muted-foreground">Healthy</p>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{mockTools.filter(t => t.status === 'warning').length}</p>
              <p className="text-sm text-muted-foreground">Warning</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{mockTools.filter(t => t.status === 'critical').length}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tools Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border overflow-hidden mb-8 shadow-sm"
      >
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Tool Adoption Breakdown
          </h3>
        </div>
        
        <div className="divide-y divide-border">
          {mockTools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index + 0.2 }}
              className="p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(tool.status)}
                  <div>
                    <p className="font-medium text-foreground">{tool.name}</p>
                    <p className="text-sm text-muted-foreground">{tool.vendor}</p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${
                  tool.adoption >= 80 ? "text-green-500" :
                  tool.adoption >= 50 ? "text-amber-500" : "text-red-500"
                }`}>
                  {tool.adoption}%
                </span>
              </div>
              <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${tool.adoption}%` }}
                  transition={{ delay: 0.1 * index + 0.3, duration: 0.5 }}
                  className={`absolute inset-y-0 left-0 rounded-full ${getProgressColor(tool.adoption)}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h3 className="font-semibold text-foreground mb-4">AI Recommendations</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Decommission CrewScheduler 3.0</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Usage is at 34%. Consider migrating to a more adopted solution or scheduling training.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Schedule Training for DataPipeline</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Adoption at 62% - targeted training could improve utilization by 20%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Consulting Help */}
      <ConsultingRequestForm variant="card" />
    </ControlTowerLayout>
  );
};

export default AdoptionTrackerPage;
