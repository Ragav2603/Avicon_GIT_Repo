import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Loader2, LayoutDashboard, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ControlTowerLayout from "@/components/layout/ControlTowerLayout";
import ConsultingRequestForm from "@/components/ConsultingRequestForm";
import AdoptionScoreGauge from "@/components/audit/AdoptionScoreGauge";
import ToolUsageBar from "@/components/audit/ToolUsageBar";
import AIRecommendationCard from "@/components/audit/AIRecommendationCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const mockTools = [
  { name: "CloudSync Pro", adoption: 87, status: "healthy" as const, vendor: "TechCorp" },
  { name: "DataPipeline Suite", adoption: 62, status: "warning" as const, vendor: "DataStream Inc" },
  { name: "AeroAnalytics", adoption: 91, status: "healthy" as const, vendor: "SkyTech" },
  { name: "CrewScheduler 3.0", adoption: 34, status: "critical" as const, vendor: "FlightOps Co" },
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

  const overallScore = Math.round(mockTools.reduce((acc, t) => acc + t.adoption, 0) / mockTools.length);

  return (
    <ControlTowerLayout 
      title="Adoption Audits" 
      subtitle="Monitor tool adoption and ROI across your organization"
    >
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate("/airline-dashboard")}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-3.5 h-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Adoption Audits</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Overall Score Gauge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-8 mb-8 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Gauge */}
          <div className="flex justify-center lg:justify-start">
            <AdoptionScoreGauge score={overallScore} size="lg" />
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
            <ToolUsageBar
              key={tool.name}
              name={tool.name}
              vendor={tool.vendor}
              adoption={tool.adoption}
              status={tool.status}
              delay={0.05 * index + 0.2}
            />
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
          <AIRecommendationCard
            type="critical"
            title="Decommission CrewScheduler 3.0"
            description="Usage is at 34%. Consider migrating to a more adopted solution or scheduling training."
            action="View alternatives"
            onActionClick={() => {}}
            delay={0.35}
          />
          <AIRecommendationCard
            type="warning"
            title="Schedule Training for DataPipeline"
            description="Adoption at 62% - targeted training could improve utilization by 20%."
            action="Schedule now"
            onActionClick={() => {}}
            delay={0.4}
          />
          <AIRecommendationCard
            type="success"
            title="AeroAnalytics performing well"
            description="Adoption at 91% exceeds targets. Consider expanding license for additional teams."
            delay={0.45}
          />
          <AIRecommendationCard
            type="info"
            title="Q2 Review Due"
            description="Schedule your quarterly adoption review to track progress against KPIs."
            action="Schedule review"
            onActionClick={() => {}}
            delay={0.5}
          />
        </div>
      </motion.div>

      {/* Consulting Help */}
      <ConsultingRequestForm variant="card" />
    </ControlTowerLayout>
  );
};

export default AdoptionTrackerPage;
