import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VendorDashboardLayout from '@/components/vendor/VendorDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Submission {
  id: string;
  rfp_id: string;
  pitch_text: string | null;
  ai_score: number | null;
  response_status: string | null;
  created_at: string;
  rfp?: {
    title: string;
    deadline: string | null;
    status: string | null;
  };
}

const VendorProposalsPage = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status: string | null) => {
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

  if (loading) {
    return (
      <VendorDashboardLayout title="My Proposals" subtitle="Track your submitted proposals">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorDashboardLayout>
    );
  }

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
          submissions.map((submission, index) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground text-lg">
                      {submission.rfp?.title || 'Unknown RFP'}
                    </h3>
                    {getStatusBadge(submission.response_status)}
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

                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </VendorDashboardLayout>
  );
};

export default VendorProposalsPage;
