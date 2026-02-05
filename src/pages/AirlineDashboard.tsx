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
import { supabase } from "@/integrations/supabase/client";
import ControlTowerLayout from "@/components/layout/ControlTowerLayout";
import CreateProjectWizard from "@/components/rfp/CreateProjectWizard";
import ConsultingRequestForm from "@/components/ConsultingRequestForm";

interface RequestProject {
  id: string;
  title: string;
  status: string | null;
  created_at: string;
  submission_count?: number;
}

const AirlineDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [projects, setProjects] = useState<RequestProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalSubmissions: 0,
    avgScore: 0,
  });

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

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoadingProjects(true);
    try {
      const { data: projectData, error } = await supabase
        .from("rfps")
        .select("*")
        .eq("airline_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const projectsWithCounts = await Promise.all(
        (projectData || []).map(async (project) => {
          const { count } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("rfp_id", project.id);
          return { ...project, submission_count: count || 0 };
        })
      );

      setProjects(projectsWithCounts);

      // Calculate stats
      const { count: totalProjects } = await supabase
        .from("rfps")
        .select("*", { count: "exact", head: true })
        .eq("airline_id", user.id);

      const { count: activeProjects } = await supabase
        .from("rfps")
        .select("*", { count: "exact", head: true })
        .eq("airline_id", user.id)
        .eq("status", "open");

      setStats({
        totalProjects: totalProjects || 0,
        activeProjects: activeProjects || 0,
        totalSubmissions: projectsWithCounts.reduce((acc, p) => acc + (p.submission_count || 0), 0),
        avgScore: 78, // Mock for now
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (user && role === "airline") {
      fetchProjects();
    }
  }, [user, role]);


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
        <Button onClick={() => setShowProjectWizard(true)} size="sm">
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
            onClick={() => setShowProjectWizard(true)}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">New Request Project</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a template or start from scratch
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
            <Button onClick={() => setShowProjectWizard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Request Project
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr,auto,auto,auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Project Name</span>
              <span className="text-center w-24">Status</span>
              <span className="text-center w-32">Vendor Matches</span>
              <span className="text-center w-24">Due Date</span>
            </div>
            
            {projects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => navigate(`/rfp/${project.id}`)}
                className={`sm:grid sm:grid-cols-[1fr,auto,auto,auto] gap-4 p-4 sm:px-6 flex flex-col items-start hover:bg-muted/30 cursor-pointer transition-colors ${
                  index !== projects.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{project.title}</p>
                    <p className="text-sm text-muted-foreground sm:hidden">
                      {project.submission_count} submissions
                    </p>
                  </div>
                </div>
                
                <div className="sm:flex sm:justify-center w-full sm:w-24">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    project.status === 'open' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : project.status === 'scoring'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {project.status === 'open' ? 'Live' : project.status === 'scoring' ? 'Scoring' : project.status || 'Draft'}
                  </span>
                </div>
                
                <div className="hidden sm:flex sm:justify-center sm:items-center w-32">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(project.submission_count || 0, 3) }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                    {(project.submission_count || 0) > 3 && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-medium text-primary">
                        +{(project.submission_count || 0) - 3}
                      </div>
                    )}
                    {(project.submission_count || 0) === 0 && (
                      <span className="text-xs text-muted-foreground">No matches</span>
                    )}
                  </div>
                </div>
                
                <div className="hidden sm:flex sm:justify-center sm:items-center w-24 text-sm text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* New Request Project Wizard */}
      <CreateProjectWizard
        open={showProjectWizard}
        onOpenChange={setShowProjectWizard}
        onSuccess={fetchProjects}
      />
    </ControlTowerLayout>
  );
};

export default AirlineDashboard;
