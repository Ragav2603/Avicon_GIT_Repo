import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, FolderKanban, Clock, Users, Calendar, Loader2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ControlTowerLayout from "@/components/layout/ControlTowerLayout";
import SmartRFPCreator from "@/components/dashboard/SmartRFPCreator";
import CreateRFPForm from "@/components/CreateRFPForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Requirement {
  text: string;
  is_mandatory: boolean;
  weight: number;
}

interface PrefillData {
  title: string;
  description: string;
  requirements?: Requirement[];
  budget?: number | null;
}

interface RequestProject {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  submission_count?: number;
}

const MyRFPsPage = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSmartCreator, setShowSmartCreator] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [prefillData, setPrefillData] = useState<PrefillData | null>(null);
  const [projects, setProjects] = useState<RequestProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

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
        .select("*, submissions(count)")
        .eq("airline_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const projectsWithCounts = (projectData || []).map((project) => ({
        ...project,
        submission_count: (project as any).submissions?.[0]?.count || 0,
      }));

      setProjects(projectsWithCounts);
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

  const handleAICreate = (extractedData: PrefillData) => {
    setPrefillData(extractedData);
    setShowSmartCreator(false);
    setShowManualForm(true);
  };

  const handleManualCreate = () => {
    setPrefillData(null);
    setShowManualForm(true);
  };

  const handleWithdrawProject = async () => {
    if (!withdrawingId) return;
    
    setWithdrawLoading(true);
    try {
      const { error } = await supabase
        .from('rfps')
        .update({ status: 'withdrawn' })
        .eq('id', withdrawingId);

      if (error) throw error;

      toast({
        title: "Project Withdrawn",
        description: "The Request Project has been removed from the marketplace.",
      });
      
      fetchProjects();
    } catch (error) {
      console.error('Error withdrawing project:', error);
      toast({
        title: "Error",
        description: "Failed to withdraw the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWithdrawLoading(false);
      setWithdrawingId(null);
    }
  };

  if (loading || role !== "airline") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ControlTowerLayout 
      title="Request Projects" 
      subtitle="Manage and review your projects"
      actions={
        <Button onClick={() => setShowSmartCreator(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Request Project
        </Button>
      }
    >
      {/* Header Stats */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant="outline" className="text-muted-foreground">
          {projects.length} Total
        </Badge>
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          {projects.filter(r => r.status === "open").length} Active
        </Badge>
      </div>

      {/* Project List */}
      {loadingProjects ? (
        <div className="flex items-center justify-center py-12 bg-card rounded-xl border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <FolderKanban className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first Request Project to start receiving vendor proposals. Use AI extraction to speed up the process!
          </p>
          <Button onClick={() => setShowSmartCreator(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project, index) => {
            const isWithdrawn = project.status === 'withdrawn';
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 bg-card rounded-xl border transition-all group ${
                  isWithdrawn 
                    ? 'border-border opacity-60 bg-muted/30' 
                    : 'border-border hover:border-primary/50 cursor-pointer shadow-sm'
                }`}
                onClick={() => !isWithdrawn && navigate(`/rfp/${project.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold text-lg ${
                        isWithdrawn 
                          ? 'text-muted-foreground' 
                          : 'text-foreground group-hover:text-primary transition-colors'
                      }`}>
                        {project.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        project.status === 'open' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : project.status === 'withdrawn'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {project.status === 'open' ? 'Live' : project.status === 'withdrawn' ? 'Withdrawn' : (project.status || 'Draft')}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {project.budget_max && (
                        <span className="text-muted-foreground">
                          Budget: <span className={isWithdrawn ? '' : 'text-foreground font-medium'}>${project.budget_max.toLocaleString()}</span>
                        </span>
                      )}
                      {project.deadline && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Deadline: {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {project.submission_count} submissions
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Withdraw Button */}
                  {!isWithdrawn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWithdrawingId(project.id);
                      }}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Withdraw
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Smart RFP Creator Modal */}
      <SmartRFPCreator
        open={showSmartCreator}
        onOpenChange={setShowSmartCreator}
        onManualCreate={handleManualCreate}
        onAICreate={handleAICreate}
      />

      {/* Manual Create Form */}
      <CreateRFPForm
        open={showManualForm}
        onOpenChange={setShowManualForm}
        onSuccess={fetchProjects}
        prefillData={prefillData}
      />

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={!!withdrawingId} onOpenChange={(open) => !open && setWithdrawingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw this Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will remove the Request Project from the Marketplace. 
              Vendors will no longer be able to submit proposals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={withdrawLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdrawProject}
              disabled={withdrawLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {withdrawLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Withdraw Project
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ControlTowerLayout>
  );
};

export default MyRFPsPage;
