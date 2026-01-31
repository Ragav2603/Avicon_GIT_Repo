import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
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

  return (
    <DashboardLayout title="Adoption Tracker" subtitle="Monitor tool adoption and ROI across your organization">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <p className="text-sm text-muted-foreground">Overall Adoption</p>
          <p className="text-3xl font-bold text-foreground mt-1">68.5%</p>
          <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +5.2% this month
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <p className="text-sm text-muted-foreground">Tools Tracked</p>
          <p className="text-3xl font-bold text-foreground mt-1">4</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <p className="text-sm text-muted-foreground">Healthy Tools</p>
          <p className="text-3xl font-bold text-green-500 mt-1">2</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <p className="text-sm text-muted-foreground">Need Attention</p>
          <p className="text-3xl font-bold text-amber-500 mt-1">2</p>
        </motion.div>
      </div>

      {/* Tools List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border overflow-hidden mb-8"
      >
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-secondary" />
            Tool Adoption Overview
          </h3>
        </div>
        
        <div className="divide-y divide-border">
          {mockTools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.5 }}
              className="p-4 hover:bg-muted/30 transition-colors"
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
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 rounded-full ${getProgressColor(tool.adoption)}`}
                  style={{ width: `${tool.adoption}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Consulting Help */}
      <ConsultingRequestForm variant="card" />
    </DashboardLayout>
  );
};

export default AdoptionTrackerPage;
