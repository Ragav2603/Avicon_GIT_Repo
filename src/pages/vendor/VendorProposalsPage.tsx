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
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState('active');

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
          rfp:rfps(title, deadline, status)
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: string | null, submissionStatus: string | null) => {
    // Check if withdrawn first
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

  const activeSubmissions = submissions.filter(s => s.status !== 'withdrawn');
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
              {getStatusBadge(submission.response_status, submission.status)}
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {submission.pitch_text?.substring(0, 150)}...
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Submitted: {new Date(submission.created_at).toLocaleDateString()}
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
            {!isWithdrawn && (
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
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

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
              <TabsTrigger value="active" className="gap-2">
                <FileText className="h-4 w-4" />
                Active ({activeSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="withdrawn" className="gap-2">
                <Archive className="h-4 w-4" />
                Withdrawn ({withdrawnSubmissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeSubmissions.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active proposals</p>
                </div>
              ) : (
                activeSubmissions.map((submission, index) => renderSubmissionCard(submission, index))
              )}
            </TabsContent>

            <TabsContent value="withdrawn" className="space-y-4">
              {withdrawnSubmissions.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
                  <Archive className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No withdrawn proposals</p>
                </div>
              ) : (
                withdrawnSubmissions.map((submission, index) => renderSubmissionCard(submission, index))
              )}
            </TabsContent>
          </Tabs>
        )}
      </motion.div>

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
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retracting...
                </>
              ) : (
                <>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Retract Proposal
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VendorDashboardLayout>
  );
};

export default VendorProposalsPage;
