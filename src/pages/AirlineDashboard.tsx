import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderKanban,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserProjects } from "@/hooks/useProjects";
import ControlTowerLayout from "@/components/layout/ControlTowerLayout";
import SmartRFPCreator from "@/components/dashboard/SmartRFPCreator";
import CreateProjectWizard from "@/components/rfp/CreateProjectWizard";

interface ExtractedData {
  title: string;
  description: string;
  requirements?: { text: string; is_mandatory: boolean; weight: number }[];
  budget?: number | null;
}

const AirlineDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [showSmartCreator, setShowSmartCreator] = useState(false);
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const { data: projects = [], isLoading: loadingProjects } = useUserProjects();

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'open').length,
    totalSubmissions: 0,
    avgScore: 78,
  };

  const userName = user?.email?.split('@')[0] || 'there';

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

  const handleAICreate = (data: ExtractedData) => {
    setExtractedData(data);
    setShowSmartCreator(false);
    setShowProjectWizard(true);
  };

  const handleManualCreate = () => {
    setShowProjectWizard(true);
  };

  if (loading || role !== "airline") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "TOTAL RFPS", value: stats.totalProjects, trend: null },
    { label: "ACTIVE RFPS", value: stats.activeProjects, trend: null },
    { label: "TOTAL SUBMISSIONS", value: stats.totalSubmissions, trend: null },
    { label: "AVG. AI SCORE", value: `${stats.avgScore}%`, trend: "+3%" },
  ];

  return (
    <ControlTowerLayout
      title="Control Tower"
      subtitle={`Good morning, ${userName}. You have ${stats.activeProjects} active RFPs.`}
      actions={
        <Button onClick={() => setShowSmartCreator(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New RFP
        </Button>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-md border border-border p-5"
          >
            <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">
              {card.label}
            </p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {card.value}
            </p>
            {card.trend && (
              <p className="text-xs text-green-600 mt-1">{card.trend}</p>
            )}
          </div>
        ))}
      </div>

      {/* Active RFPs Table */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <div className="px-6 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Active RFPs</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/airline-dashboard/rfps")}>
            View all
          </Button>
        </div>

        {loadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No RFPs yet. Create your first one!</p>
            <Button onClick={() => setShowSmartCreator(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New RFP
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr,100px,120px] gap-4 px-6 py-2.5 bg-muted/50 border-b border-border">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Project</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-center">Status</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Created</span>
            </div>

            {projects.slice(0, 5).map((project, index) => (
              <div
                key={project.id}
                onClick={() => navigate(`/airline-dashboard/projects/${project.id}`)}
                className={`sm:grid sm:grid-cols-[1fr,100px,120px] gap-4 px-6 py-3 flex flex-col items-start hover:bg-muted/30 cursor-pointer transition-colors ${
                  index !== Math.min(projects.length, 5) - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{project.title}</p>
                </div>

                <div className="sm:flex sm:justify-center w-full sm:w-auto">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'open'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'draft'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {project.status === 'open' ? 'Live' : project.status === 'draft' ? 'Draft' : project.status || 'Draft'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(project.created_at!).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart RFP Creator */}
      <SmartRFPCreator
        open={showSmartCreator}
        onOpenChange={setShowSmartCreator}
        onManualCreate={handleManualCreate}
        onAICreate={handleAICreate}
      />

      {/* New RFP Wizard */}
      <CreateProjectWizard
        open={showProjectWizard}
        onOpenChange={setShowProjectWizard}
        prefillData={extractedData}
        onSuccess={() => setExtractedData(null)}
      />
    </ControlTowerLayout>
  );
};

export default AirlineDashboard;
