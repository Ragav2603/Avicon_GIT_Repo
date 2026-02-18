import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Loader2,
  Undo2,
  Archive,
  Calendar,
  Bot,
  ScrollText,
  Pencil,
  Send,
  Save,
  X,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import VendorDashboardLayout from '@/components/vendor/VendorDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  rfp_id: string;
  pitch_text: string | null;
  ai_score: number | null;
  response_status: string | null;
  status: string | null;
  created_at: string;
  rfp?: {
    title: string;
    deadline: string | null;
    status: string | null;
  };
}

const VendorProposalsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [retractingId, setRetractingId] = useState<string | null>(null);
  const [retractLoading, setRetractLoading] = useState(false);
  const [resubmittingId, setResubmittingId] = useState<string | null>(null);
  const [cancellingDraftId, setCancellingDraftId] = useState<string | null>(null);
  const [cancelDraftLoading, setCancelDraftLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('drafts');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPitch, setEditedPitch] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          rfp:rfps!left(title, deadline, status)
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data as Submission[]) || []);
    } catch (error: unknown) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error loading proposals',
        description: error instanceof Error ? error.message : 'Failed to load your proposals.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDraft = async () => {
    if (!cancellingDraftId) return;
    setCancelDraftLoading(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: 'withdrawn' })
        .eq('id', cancellingDraftId);
      if (error) throw error;
      toast({ title: 'Draft Cancelled', description: 'Your draft proposal has been discarded.' });
      // Close sheet if the cancelled draft was open
      if (selectedSubmission?.id === cancellingDraftId) {
        setSelectedSubmission(null);
        setIsEditing(false);
      }
      fetchSubmissions();
    } catch (error) {
      console.error('Error cancelling draft:', error);
      toast({ title: 'Error', description: 'Failed to cancel the draft. Please try again.', variant: 'destructive' });
    } finally {
      setCancelDraftLoading(false);
      setCancellingDraftId(null);
    }
  };

  const handleRetractProposal = async () => {
    if (!retractingId) return;
    
    setRetractLoading(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: 'withdrawn' })
        .eq('id', retractingId);

      if (error) throw error;

      toast({
        title: "Proposal Retracted",
        description: "Your proposal has been withdrawn. You can resubmit if the RFP is still open.",
      });
      
      fetchSubmissions();
    } catch (error) {
      console.error('Error retracting proposal:', error);
      toast({
        title: "Error",
        description: "Failed to retract the proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRetractLoading(false);
      setRetractingId(null);
    }
  };

  const handleResubmit = async (submissionId: string) => {
    setResubmittingId(submissionId);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: 'submitted' })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Proposal Resubmitted",
        description: "Your proposal is active again and visible to the airline.",
      });
      setActiveTab('submitted');
      fetchSubmissions();
    } catch (error) {
      console.error('Error resubmitting proposal:', error);
      toast({
        title: "Error",
        description: "Failed to resubmit the proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResubmittingId(null);
    }
  };

  const openSheet = (submission: Submission) => {
    setSelectedSubmission(submission);
    setEditedPitch(submission.pitch_text || '');
    setIsEditing(submission.status === 'draft');
  };

  const handleSaveDraft = async () => {
    if (!selectedSubmission) return;
    setSavingDraft(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ pitch_text: editedPitch, status: 'draft' })
        .eq('id', selectedSubmission.id);
      if (error) throw error;
      toast({ title: 'Draft Saved', description: 'Your draft has been saved.' });
      setSelectedSubmission({ ...selectedSubmission, pitch_text: editedPitch, status: 'draft' });
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save draft.', variant: 'destructive' });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!selectedSubmission) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ pitch_text: editedPitch, status: 'submitted' })
        .eq('id', selectedSubmission.id);
      if (error) throw error;
      toast({ title: 'Proposal Submitted!', description: 'Your proposal has been sent to the airline.' });
      setSelectedSubmission({ ...selectedSubmission, pitch_text: editedPitch, status: 'submitted' });
      setIsEditing(false);
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to submit proposal.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string | null, submissionStatus: string | null) => {
    if (submissionStatus === 'withdrawn') {
      return (
        <Badge className="bg-muted text-muted-foreground border-muted">
          <Archive className="h-3 w-3 mr-1" />
          Withdrawn
        </Badge>
      );
    }
    
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'shortlisted':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Shortlisted
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  const draftSubmissions = submissions.filter(s => s.status === 'draft');
  const submittedSubmissions = submissions.filter(s => s.status !== 'draft' && s.status !== 'withdrawn');
  const withdrawnSubmissions = submissions.filter(s => s.status === 'withdrawn');

  if (loading) {
    return (
      <VendorDashboardLayout title="My Proposals" subtitle="Track your submitted proposals">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorDashboardLayout>
    );
  }

  const renderSubmissionCard = (submission: Submission, index: number) => {
    const isWithdrawn = submission.status === 'withdrawn';
    
    return (
      <motion.div
        key={submission.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`p-6 rounded-xl border bg-card transition-colors ${
          isWithdrawn 
            ? 'border-border opacity-60 bg-muted/30' 
            : 'border-border hover:border-primary/30'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`font-semibold text-lg ${isWithdrawn ? 'text-muted-foreground' : 'text-foreground'}`}>
                {submission.rfp?.title || 'Unknown RFP'}
              </h3>
              {submission.status === 'draft' ? (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  <Pencil className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              ) : (
                getStatusBadge(submission.response_status, submission.status)
              )}
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {submission.pitch_text ? `${submission.pitch_text.substring(0, 150)}...` : 'No content yet — click Edit to start writing.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {submission.status === 'draft' ? 'Created' : 'Submitted'}: {new Date(submission.created_at).toLocaleDateString()}
              </span>
              {submission.ai_score && (
                <span className={`font-medium ${
                  isWithdrawn ? 'text-muted-foreground' :
                  submission.ai_score >= 80 ? 'text-green-500' :
                  submission.ai_score >= 60 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  AI Score: {submission.ai_score}%
                </span>
              )}
              {submission.rfp?.deadline && (
                <span className="text-muted-foreground">
                  RFP Deadline: {new Date(submission.rfp.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {!isWithdrawn && submission.status === 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setCancellingDraftId(submission.id)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel Draft
              </Button>
            )}
            {!isWithdrawn && submission.status !== 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setRetractingId(submission.id)}
              >
                <Undo2 className="h-4 w-4 mr-1" />
                Retract
              </Button>
            )}
            {isWithdrawn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResubmit(submission.id)}
                disabled={resubmittingId === submission.id}
              >
                {resubmittingId === submission.id ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Resubmit
              </Button>
            )}
            <Button
              variant={submission.status === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => openSheet(submission)}
            >
              {submission.status === 'draft' ? (
                <><Pencil className="h-4 w-4 mr-2" />Edit & Submit</>
              ) : (
                <><ExternalLink className="h-4 w-4 mr-2" />View Details</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
    <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
      <Icon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <VendorDashboardLayout title="My Proposals" subtitle="Track your submitted proposals">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {submissions.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You haven't submitted any proposals yet</p>
            <Button className="mt-4" onClick={() => window.location.href = '/vendor-dashboard'}>
              Browse Opportunities
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="drafts" className="gap-2">
                <Pencil className="h-4 w-4" />
                Drafts ({draftSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="submitted" className="gap-2">
                <FileText className="h-4 w-4" />
                Submitted ({submittedSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="withdrawn" className="gap-2">
                <Archive className="h-4 w-4" />
                Withdrawn ({withdrawnSubmissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drafts" className="space-y-4">
              {draftSubmissions.length === 0 ? (
                <EmptyState icon={Pencil} message="No draft proposals" />
              ) : (
                draftSubmissions.map((submission, index) => renderSubmissionCard(submission, index))
              )}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4">
              {submittedSubmissions.length === 0 ? (
                <EmptyState icon={FileText} message="No submitted proposals" />
              ) : (
                submittedSubmissions.map((submission, index) => renderSubmissionCard(submission, index))
              )}
            </TabsContent>

            <TabsContent value="withdrawn" className="space-y-4">
              {withdrawnSubmissions.length === 0 ? (
                <EmptyState icon={Archive} message="No withdrawn proposals" />
              ) : (
                withdrawnSubmissions.map((submission, index) => renderSubmissionCard(submission, index))
              )}
            </TabsContent>
          </Tabs>
        )}
      </motion.div>

      {/* Proposal Detail / Edit Sheet */}
      <Sheet open={!!selectedSubmission} onOpenChange={(open) => { if (!open) { setSelectedSubmission(null); setIsEditing(false); } }}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col overflow-hidden p-0">
          {selectedSubmission && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
                <SheetTitle className="text-xl">{selectedSubmission.rfp?.title || 'Proposal Details'}</SheetTitle>
                <SheetDescription>
                  {selectedSubmission.status === 'draft' ? 'Draft — not yet submitted' : `Submitted on ${new Date(selectedSubmission.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}`}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {/* Status + Edit toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    {selectedSubmission.status === 'draft' ? (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        <Pencil className="h-3 w-3 mr-1" /> Draft
                      </Badge>
                    ) : (
                      getStatusBadge(selectedSubmission.response_status, selectedSubmission.status)
                    )}
                  </div>
                  {selectedSubmission.status !== 'withdrawn' && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  )}
                  {isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditedPitch(selectedSubmission.pitch_text || ''); }}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {selectedSubmission.status === 'draft' ? 'Created' : 'Submitted'}
                    </div>
                    <p className="text-sm font-medium">{new Date(selectedSubmission.created_at).toLocaleDateString()}</p>
                  </div>
                  {selectedSubmission.rfp?.deadline && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> RFP Deadline
                      </div>
                      <p className="text-sm font-medium">{new Date(selectedSubmission.rfp.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* AI Score */}
                {selectedSubmission.ai_score !== null && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Bot className="h-4 w-4 text-primary" /> AI Evaluation Score
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${selectedSubmission.ai_score >= 80 ? 'bg-green-500' : selectedSubmission.ai_score >= 60 ? 'bg-yellow-500' : 'bg-destructive'}`}
                            style={{ width: `${selectedSubmission.ai_score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${selectedSubmission.ai_score >= 80 ? 'text-green-600' : selectedSubmission.ai_score >= 60 ? 'text-yellow-600' : 'text-destructive'}`}>
                          {selectedSubmission.ai_score}%
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Pitch text — editable or read-only */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ScrollText className="h-4 w-4 text-primary" />
                    Your Proposal
                  </div>
                  {isEditing ? (
                    <Textarea
                      value={editedPitch}
                      onChange={(e) => setEditedPitch(e.target.value)}
                      placeholder="Write your proposal here..."
                      className="min-h-[280px] text-sm leading-relaxed resize-none"
                    />
                  ) : (
                    <div className="rounded-lg bg-muted/50 border border-border p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                      {selectedSubmission.pitch_text || 'No content yet — click Edit to start writing.'}
                    </div>
                  )}
                </div>

                {/* Airline response */}
                {!isEditing && selectedSubmission.response_status && selectedSubmission.response_status !== 'pending' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Airline Response</p>
                      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground italic">
                        No message provided.
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Edit action buttons */}
              {isEditing && (
                <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setCancellingDraftId(selectedSubmission.id)}
                    disabled={savingDraft || submitting}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Draft
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleSaveDraft} disabled={savingDraft || submitting}>
                    {savingDraft ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Draft
                  </Button>
                  <Button className="flex-1" onClick={handleSubmitProposal} disabled={submitting || savingDraft || !editedPitch.trim()}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Submit
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Retract Confirmation Dialog */}
      <AlertDialog open={!!retractingId} onOpenChange={(open) => !open && setRetractingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retract this proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to retract this pitch? You can resubmit later if the RFP is still open.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={retractLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRetractProposal}
              disabled={retractLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {retractLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Retracting...</>
              ) : (
                <><Undo2 className="h-4 w-4 mr-2" />Retract Proposal</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Draft Confirmation Dialog */}
      <AlertDialog open={!!cancellingDraftId} onOpenChange={(open) => !open && setCancellingDraftId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this draft proposal? It will be discarded and moved to Withdrawn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelDraftLoading}>Keep Draft</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelDraft}
              disabled={cancelDraftLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelDraftLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cancelling...</>
              ) : (
                <><XCircle className="h-4 w-4 mr-2" />Cancel Draft</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VendorDashboardLayout>
  );
};

export default VendorProposalsPage;
