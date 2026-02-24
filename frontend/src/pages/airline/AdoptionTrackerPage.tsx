import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Loader2, LayoutDashboard, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ControlTowerLayout from "@/components/layout/ControlTowerLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const mockTools = [
  { name: "CloudSync Pro", adoption: 87, status: "healthy" as const, vendor: "TechCorp" },
  { name: "DataPipeline Suite", adoption: 62, status: "warning" as const, vendor: "DataStream Inc" },
  { name: "AeroAnalytics", adoption: 91, status: "healthy" as const, vendor: "SkyTech" },
  { name: "CrewScheduler 3.0", adoption: 34, status: "critical" as const, vendor: "FlightOps Co" },
];

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    healthy: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    critical: 'bg-destructive/10 text-destructive',
  };
  return styles[status] || 'bg-muted text-muted-foreground';
};

const recommendations = [
  { title: "Decommission CrewScheduler 3.0", description: "Usage is at 34%. Consider migrating to a more adopted solution or scheduling training.", action: "View alternatives" },
  { title: "Schedule Training for DataPipeline", description: "Adoption at 62% - targeted training could improve utilization by 20%.", action: "Schedule now" },
  { title: "AeroAnalytics performing well", description: "Adoption at 91% exceeds targets. Consider expanding license for additional teams.", action: null },
  { title: "Q2 Review Due", description: "Schedule your quarterly adoption review to track progress against KPIs.", action: "Schedule review" },
];

const AdoptionTrackerPage = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const actionMessages: Record<string, string> = {
    "View alternatives": "This feature is coming soon. You'll be able to browse alternative tools.",
    "Schedule now": "This feature is coming soon. You'll be able to schedule training sessions.",
    "Schedule review": "This feature is coming soon. You'll be able to schedule adoption reviews.",
  };

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/auth");
      else if (!role) navigate("/onboarding");
      else if (role !== "airline") navigate(`/${role}-dashboard`);
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
            <BreadcrumbLink onClick={() => navigate("/airline-dashboard")} className="flex items-center gap-1.5 cursor-pointer">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="w-3.5 h-3.5" /></BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Adoption Audits</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">OVERALL SCORE</p>
          <p className="text-2xl font-bold font-mono text-foreground">{overallScore}%</p>
        </div>
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">TOOLS TRACKED</p>
          <p className="text-2xl font-bold font-mono text-foreground">{mockTools.length}</p>
        </div>
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">HEALTHY</p>
          <p className="text-2xl font-bold font-mono text-success">{mockTools.filter(t => t.status === 'healthy').length}</p>
        </div>
        <div className="bg-card rounded-md border border-border p-5">
          <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">CRITICAL</p>
          <p className="text-2xl font-bold font-mono text-destructive">{mockTools.filter(t => t.status === 'critical').length}</p>
        </div>
      </div>

      {/* Tools Breakdown Table */}
      <div className="bg-card rounded-md border border-border overflow-hidden mb-6">
        <div className="px-6 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Tool Adoption Breakdown
          </h3>
        </div>
        
        {/* Table Header */}
        <div className="hidden sm:grid sm:grid-cols-[1fr,120px,100px,80px] gap-4 px-6 py-2.5 bg-muted/50 border-b border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tool</span>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Vendor</span>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Adoption</span>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-center">Status</span>
        </div>

        {mockTools.map((tool, index) => (
          <div
            key={tool.name}
            className={`sm:grid sm:grid-cols-[1fr,120px,100px,80px] gap-4 px-6 py-3 flex flex-col hover:bg-muted/30 transition-colors ${
              index !== mockTools.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div>
              <p className="text-sm font-medium text-foreground">{tool.name}</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground">{tool.vendor}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono font-semibold text-foreground">{tool.adoption}%</span>
            </div>
            <div className="flex justify-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(tool.status)}`}>
                {tool.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">AI Recommendations</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <div key={rec.title} className="p-4 rounded-md border border-border bg-card">
              <p className="text-sm font-medium text-foreground">{rec.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
              {rec.action && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-2 text-xs text-primary"
                  onClick={() => toast({ title: "Coming Soon", description: actionMessages[rec.action!] || "This feature is coming soon." })}
                >
                  {rec.action} →
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </ControlTowerLayout>
  );
};

export default AdoptionTrackerPage;
