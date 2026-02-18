import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import ConsultingRequestForm from "@/components/ConsultingRequestForm";

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
    { label: "Total RFPs", value: stats.totalProjects, icon: FolderKanban, color: "primary" },
    { label: "Active RFPs", value: stats.activeProjects, icon: Clock, color: "green-500" },
    { label: "Total Submissions", value: stats.totalSubmissions, icon: Users, color: "accent" },
    { label: "Avg. AI Score", value: `${stats.avgScore}%`, icon: BarChart3, color: "warning" },
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
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-5 flex flex-col items-start gap-2 text-left"
            onClick={() => setShowSmartCreator(true)}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">New RFP</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Use AI to extract from docs or start from scratch
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-5 flex flex-col items-start gap-2 text-left"
            onClick={() => navigate("/airline-dashboard/matches")}
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Vendor Matches</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Browse AI-matched vendors for your projects
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-5 flex flex-col items-start gap-2 text-left"
            onClick={() => navigate("/airline-dashboard/rfps")}
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <FolderKanban className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">View RFPs</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Review and manage all your RFPs
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-5 flex flex-col items-start gap-2 text-left"
            onClick={() => navigate("/airline-dashboard/adoption")}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Adoption Tracker</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor vendor adoption metrics
            </p>
          </Button>
        </div>
      </motion.div>

      {/* Consulting Help */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <ConsultingRequestForm variant="audit" />
      </motion.div>

      {/* Active RFPs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Active RFPs</h2>
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
            <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No RFPs yet. Create your first one!</p>
            <Button onClick={() => setShowSmartCreator(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New RFP
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr,auto,auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Project Name</span>
              <span className="text-center w-24">Status</span>
            </div>

            {projects.slice(0, 5).map((project, index) => (
              <div
                key={project.id}
                onClick={() => navigate(`/airline-dashboard/projects/${project.id}`)}
                className={`sm:grid sm:grid-cols-[1fr,auto,auto] gap-4 p-4 sm:px-6 flex flex-col items-start hover:bg-muted/30 cursor-pointer transition-colors ${index !== Math.min(projects.length, 5) - 1 ? "border-b border-border" : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{project.title}</p>
                  </div>
                </div>

                <div className="sm:flex sm:justify-center w-full sm:w-24">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${project.status === 'open'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : project.status === 'draft'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                    {project.status === 'open' ? 'Live' : project.status === 'draft' ? 'Draft' : project.status || 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

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
