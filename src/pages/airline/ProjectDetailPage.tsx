import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Users,
  Clock,
  Loader2,
  ChevronRight,
  LayoutDashboard,
  Check,
  ShieldAlert,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useProject, useProjectSubmissions, useUpdateProject } from "@/hooks/useProjects";
import ControlTowerLayout from "@/components/layout/ControlTowerLayout";
import type { Requirement } from "@/types/projects";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  closed: "bg-muted text-muted-foreground",
};
const STATUS_LABELS: Record<string, string> = {
  open: "Live",
  draft: "Draft",
  review: "In Review",
  closed: "Closed",
};

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const updateProject = useUpdateProject();

  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: project, isLoading: loadingProject } = useProject(id);
  const { data: submissions = [], isLoading: loadingSubmissions } =
    useProjectSubmissions(id);

  useEffect(() => {
    if (project) {
      setEditTitle(project.title);
      setEditDeadline(project.due_date ? project.due_date.split("T")[0] : "");
      setEditDescription((project as { description?: string }).description ?? "");
    }
  }, [project]);

  const handleSaveEdit = () => {
    if (!id || !editTitle.trim()) return;
    updateProject.mutate(
      {
        id,
        updates: {
          title: editTitle.trim(),
          due_date: editDeadline ? new Date(editDeadline).toISOString() : undefined,
        },
      },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadingProject) {
    return (
      <ControlTowerLayout title="Project Details" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ControlTowerLayout>
    );
  }

  if (!project) {
    return (
      <ControlTowerLayout title="Not Found" subtitle="">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Project not found.</p>
          <Button onClick={() => navigate("/airline-dashboard/rfps")}>
            Back to My Projects
          </Button>
        </div>
      </ControlTowerLayout>
    );
  }

  const goals: Requirement[] = project.requirements.filter((r) => !r.mandatory);
  const dealBreakers: Requirement[] = project.requirements.filter((r) => r.mandatory);

  return (
    <ControlTowerLayout title={project.title} subtitle="Project Details & Submissions">
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
            <BreadcrumbLink
              onClick={() => navigate("/airline-dashboard/rfps")}
              className="cursor-pointer"
            >
              My RFPs
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-3.5 h-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[240px] truncate">
              {project.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Project Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  STATUS_STYLES[project.status] || STATUS_STYLES.draft
                }`}
              >
                {STATUS_LABELS[project.status] || project.status}
              </span>
              <Badge variant="outline" className="text-muted-foreground">
                {project.requirements.length} requirements
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm mt-2">
              {project.due_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Deadline:{" "}
                    <span className="text-foreground font-medium">
                      {new Date(project.due_date).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {project.status !== "closed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="shrink-0"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit RFP
            </Button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="requirements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requirements" className="gap-2">
            <FileText className="w-4 h-4" />
            Requirements
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <Users className="w-4 h-4" />
            Submissions{" "}
            {submissions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {submissions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Requirements Tab */}
        <TabsContent value="requirements">
          <div className="bg-card rounded-xl border border-border p-6 space-y-8">
            {/* Adoption Goals */}
            {goals.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Adoption Goals ({goals.length})
                </h3>
                <div className="space-y-2">
                  {goals.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/40 border border-border"
                    >
                      <p className="text-foreground text-sm flex-1">{req.text}</p>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        Weight {req.weight}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deal Breakers */}
            {dealBreakers.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                  Deal Breakers ({dealBreakers.length})
                </h3>
                <div className="space-y-2">
                  {dealBreakers.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <p className="text-foreground text-sm flex-1">{req.text}</p>
                      <Badge variant="destructive" className="shrink-0 text-xs">
                        Mandatory
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {goals.length === 0 && dealBreakers.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No requirements have been added to this project.
              </p>
            )}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions">
          {loadingSubmissions ? (
            <div className="flex items-center justify-center py-12 bg-card rounded-xl border border-border">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Submissions Yet</h3>
              <p className="text-muted-foreground">
                Vendors haven't submitted proposals for this project yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            sub.evaluation_status === "pass"
                              ? "default"
                              : sub.evaluation_status === "fail"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {sub.evaluation_status || "Pending"}
                        </Badge>
                        {sub.ai_score !== null && (
                          <span className="text-sm text-muted-foreground">
                            AI Score:{" "}
                            <span className="font-semibold text-foreground">
                              {sub.ai_score}%
                            </span>
                          </span>
                        )}
                      </div>
                      {sub.pitch_text && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {sub.pitch_text}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {sub.created_at
                        ? new Date(sub.created_at).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit RFP Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit RFP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="RFP title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-deadline">Deadline</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description of this RFP..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateProject.isPending || !editTitle.trim()}
            >
              {updateProject.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ControlTowerLayout>
  );
};

export default ProjectDetailPage;
