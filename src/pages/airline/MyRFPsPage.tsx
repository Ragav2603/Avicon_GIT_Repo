import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FolderKanban, Calendar, Loader2, Ban } from "lucide-react";
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
  open: 'bg-green-100 text-green-700',
  draft: 'bg-amber-100 text-amber-700',
  review: 'bg-blue-100 text-blue-700',
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
  const [extractedData, setExtractedData] = useState<PrefillData | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects = [], isLoading: loadingProjects } = useUserProjects();
  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const updateStatus = useUpdateProjectStatus();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/auth");
      else if (!role) navigate("/onboarding");
      else if (role !== "airline") navigate(`/${role}-dashboard`);
    }
  }, [user, role, loading, navigate]);

  const handleAICreate = (data: PrefillData) => {
    setExtractedData(data);
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
      { onSettled: () => setWithdrawingId(null) }
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
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      actions={
        <Button onClick={() => setShowSmartCreator(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New RFP
        </Button>
      }
    >
      {/* Header Stats */}
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="outline" className="text-muted-foreground">
          {filteredProjects.length} Total
        </Badge>
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          {filteredProjects.filter(r => r.status === "open").length} Active
        </Badge>
      </div>

      {/* Data Table */}
      {loadingProjects ? (
        <div className="flex items-center justify-center py-12 bg-card rounded-md border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-md border border-border">
          <FolderKanban className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-2">No RFPs Yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Create your first RFP to start receiving vendor proposals.
          </p>
          <Button onClick={() => setShowSmartCreator(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First RFP
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-md border border-border overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr,100px,120px,120px,80px] gap-4 px-6 py-2.5 bg-muted/50 border-b border-border">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Title</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-center">Status</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Deadline</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Created</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Actions</span>
          </div>

          {filteredProjects.map((project, index) => {
            const isClosed = project.status === 'closed';

            return (
              <div
                key={project.id}
                className={`sm:grid sm:grid-cols-[1fr,100px,120px,120px,80px] gap-4 px-6 py-3 flex flex-col hover:bg-muted/30 transition-colors ${
                  !isClosed ? 'cursor-pointer' : 'opacity-60'
                } ${index !== filteredProjects.length - 1 ? "border-b border-border" : ""}`}
                onClick={() => !isClosed && navigate(`/airline-dashboard/projects/${project.id}`)}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{project.title}</p>
                </div>

                <div className="sm:flex sm:justify-center w-full sm:w-auto">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_STYLES[project.status] || STATUS_STYLES.draft
                  }`}>
                    {STATUS_LABELS[project.status] || project.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-muted-foreground">
                    {project.due_date ? new Date(project.due_date).toLocaleDateString() : '—'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(project.created_at!).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-right">
                  {!isClosed && project.status !== 'draft' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWithdrawingId(project.id);
                      }}
                    >
                      <Ban className="h-3 w-3 mr-1" />
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SmartRFPCreator
        open={showSmartCreator}
        onOpenChange={setShowSmartCreator}
        onManualCreate={handleManualCreate}
        onAICreate={handleAICreate}
      />

      <CreateProjectWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        prefillData={extractedData}
        onSuccess={() => setExtractedData(null)}
      />

      <AlertDialog open={!!withdrawingId} onOpenChange={(open) => !open && setWithdrawingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw this RFP?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will close the RFP. Vendors will no longer be able to submit proposals.
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
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Withdrawing...</>
              ) : (
                <><Ban className="h-4 w-4 mr-2" />Withdraw Project</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ControlTowerLayout>
  );
};

export default MyRFPsPage;
