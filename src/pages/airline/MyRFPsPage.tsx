import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, FolderKanban, Clock, Calendar, Loader2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useUserProjects, useUpdateProjectStatus } from "@/hooks/useProjects";
import ControlTowerLayout from "@/components/layout/ControlTowerLayout";
import SmartRFPCreator from "@/components/dashboard/SmartRFPCreator";
import CreateProjectWizard from "@/components/rfp/CreateProjectWizard";
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

interface PrefillData {
  title: string;
  description: string;
  requirements?: { text: string; is_mandatory: boolean; weight: number }[];
  budget?: number | null;
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  closed: 'bg-muted text-muted-foreground',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Live',
  draft: 'Draft',
  review: 'In Review',
  closed: 'Closed',
};

const MyRFPsPage = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [showSmartCreator, setShowSmartCreator] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [extractedData, setExtractedData] = useState<PrefillData | null>(null); // New State
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const { data: projects = [], isLoading: loadingProjects } = useUserProjects();
  const updateStatus = useUpdateProjectStatus();

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

  const handleAICreate = (data: PrefillData) => { // Removed underscore
    setExtractedData(data); // Store data
    setShowSmartCreator(false);
    setShowWizard(true);
  };

  const handleManualCreate = () => {
    setShowWizard(true);
  };

  const handleWithdrawProject = () => {
    if (!withdrawingId) return;
    updateStatus.mutate(
      { id: withdrawingId, status: 'closed' },
      {
        onSettled: () => setWithdrawingId(null),
      }
    );
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
      title="RFPs"
      subtitle="Manage and review your RFPs"
      actions={
        <Button onClick={() => setShowSmartCreator(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New RFP
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
          <h3 className="text-lg font-semibold text-foreground mb-2">No RFPs Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first RFP to start receiving vendor proposals. Use AI extraction to speed up the process!
          </p>
          <Button onClick={() => setShowSmartCreator(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First RFP
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project, index) => {
            const isClosed = project.status === 'closed';

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 bg-card rounded-xl border transition-all group ${isClosed
                    ? 'border-border opacity-60 bg-muted/30'
                    : 'border-border hover:border-primary/50 cursor-pointer shadow-sm'
                  }`}
                onClick={() => !isClosed && navigate(`/airline-dashboard/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold text-lg ${isClosed
                          ? 'text-muted-foreground'
                          : 'text-foreground group-hover:text-primary transition-colors'
                        }`}>
                        {project.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[project.status] || STATUS_STYLES.draft
                        }`}>
                        {STATUS_LABELS[project.status] || project.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {project.due_date && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Deadline: {new Date(project.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(project.created_at!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Withdraw Button */}
                  {!isClosed && project.status !== 'draft' && (
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

      {/* Create Project Wizard */}
      <CreateProjectWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        prefillData={extractedData}
        onSuccess={() => setExtractedData(null)}
      />

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={!!withdrawingId} onOpenChange={(open) => !open && setWithdrawingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw this RFP?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will close the RFP.
              Vendors will no longer be able to submit proposals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatus.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdrawProject}
              disabled={updateStatus.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateStatus.isPending ? (
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
