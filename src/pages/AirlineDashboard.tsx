import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  FolderKanban,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  BarChart3,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserProjects } from "@/hooks/useProjects";
import ControlTowerLayout from "@/components/layout/ControlTowerLayout";
import CreateProjectWizard from "@/components/rfp/CreateProjectWizard";
import SmartRFPCreator from "@/components/dashboard/SmartRFPCreator";
import ConsultingRequestForm from "@/components/ConsultingRequestForm";

// Define shared interface if not imported
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
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null); // New State

  const { data: projects = [], isLoading: loadingProjects } = useUserProjects();

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'open').length,
    totalSubmissions: 0,
    avgScore: 78,
  };

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

  const userName = user?.email?.split('@')[0] || 'there';

  const statCards = [
    { label: "Total Projects", value: stats.totalProjects, icon: FolderKanban, color: "primary" },
    { label: "Active Projects", value: stats.activeProjects, icon: Clock, color: "green-500" },
    { label: "Total Submissions", value: stats.totalSubmissions, icon: Users, color: "accent" },
    { label: "Avg. AI Score", value: `${stats.avgScore}%`, icon: BarChart3, color: "warning" },
  ];

  return (
    <ControlTowerLayout
      title="Control Tower"
      subtitle={`Good morning, ${userName}. You have ${stats.activeProjects} active Request Projects.`}
      actions={
        <Button onClick={() => setShowSmartCreator(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Request Project
        </Button>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-start text-left justify-start hover:border-primary/50 hover:bg-primary/5"
            onClick={() => setShowSmartCreator(true)}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">New Request Project</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Use AI to extract from docs or start from scratch
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-start text-left justify-start hover:border-primary/50 hover:bg-primary/5"
            onClick={() => navigate("/airline-dashboard/rfps")}
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <FolderKanban className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">View Projects</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and review your active projects
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-start text-left justify-start hover:border-primary/50 hover:bg-primary/5"
            onClick={() => navigate("/airline-dashboard/adoption")}
          >
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground">Adoption Audits</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor tool adoption and ROI
            </p>
          </Button>
        </div>
      </motion.div>

      {/* Adoption Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Adoption Support</h2>
        </div>
        <ConsultingRequestForm variant="audit" />
      </motion.div>

      {/* Active Request Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Active Requests</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/airline-dashboard/rfps")}>
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {loadingProjects ? (
          <div className="flex items-center justify-center py-12 bg-card rounded-xl border border-border">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No Request Projects yet. Create your first one!</p>
            <Button onClick={() => setShowSmartCreator(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Request Project
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr,auto,auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Project Name</span>
              <span className="text-center w-24">Status</span>
              <span className="text-center w-24">Created</span>
            </div>

            {projects.slice(0, 5).map((project, index) => (
              <div
                key={project.id}
                onClick={() => navigate(`/airline/projects/${project.id}`)}
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

                <div className="hidden sm:flex sm:justify-center sm:items-center w-24 text-sm text-muted-foreground">
                  {new Date(project.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Smart RFP Creator Modal */}
      <SmartRFPCreator
        open={showSmartCreator}
        onOpenChange={setShowSmartCreator}
        onManualCreate={handleManualCreate}
        onAICreate={handleAICreate}
      />

      {/* New Request Project Wizard */}
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
