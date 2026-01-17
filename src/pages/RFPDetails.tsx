import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, ArrowLeft, Loader2, FileText, Users, Clock, 
  DollarSign, Calendar, User, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  airline_id: string;
}

interface Requirement {
  id: string;
  requirement_text: string;
  is_mandatory: boolean | null;
  weight: number | null;
}

interface Submission {
  id: string;
  vendor_id: string;
  pitch_text: string | null;
  created_at: string;
  ai_score: number | null;
  vendor_name: string | null;
  vendor_email: string | null;
}

const RFPDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!role) {
        navigate('/onboarding');
      } else if (role !== 'airline') {
        navigate(`/${role}-dashboard`);
      }
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;

      setLoadingData(true);
      try {
        // Fetch RFP details
        const { data: rfpData, error: rfpError } = await supabase
          .from('rfps')
          .select('*')
          .eq('id', id)
          .eq('airline_id', user.id)
          .single();

        if (rfpError) throw rfpError;
        setRfp(rfpData);

        // Fetch requirements
        const { data: reqData } = await supabase
          .from('rfp_requirements')
          .select('*')
          .eq('rfp_id', id)
          .order('is_mandatory', { ascending: false });

        setRequirements(reqData || []);

        // Fetch submissions with vendor info
        const { data: subData } = await supabase
          .from('submissions')
          .select('*')
          .eq('rfp_id', id)
          .order('created_at', { ascending: false });

        // Get vendor profiles for each submission
        const submissionsWithVendors = await Promise.all(
          (subData || []).map(async (sub) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('company_name, email')
              .eq('id', sub.vendor_id)
              .single();

            // Generate dummy AI score if not present (random 0-100)
            const aiScore = sub.ai_score ?? Math.floor(Math.random() * 101);

            return {
              ...sub,
              ai_score: aiScore,
              vendor_name: profile?.company_name || 'Unknown Vendor',
              vendor_email: profile?.email || null,
            };
          })
        );

        setSubmissions(submissionsWithVendors);
      } catch (error) {
        console.error('Error fetching RFP details:', error);
        navigate('/airline-dashboard');
      } finally {
        setLoadingData(false);
      }
    };

    if (user && role === 'airline') {
      fetchData();
    }
  }, [user, role, id, navigate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-600 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    return 'bg-red-500/20 text-red-600 border-red-500/30';
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">RFP not found</p>
          <Button className="mt-4" onClick={() => navigate('/airline-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Plane className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">
              Avi<span className="gradient-text">Con</span>
            </span>
          </Link>
          
          <Button variant="outline" size="sm" onClick={() => navigate('/airline-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* RFP Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {rfp.title}
              </h1>
              <Badge variant={rfp.status === 'open' ? 'default' : 'secondary'}>
                {rfp.status || 'open'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2 max-w-3xl">{rfp.description}</p>
            
            <div className="flex flex-wrap gap-6 mt-4 text-sm">
              {rfp.budget_max && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Budget: <span className="text-foreground font-medium">${rfp.budget_max.toLocaleString()}</span>
                </span>
              )}
              {rfp.deadline && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Deadline: <span className="text-foreground font-medium">{new Date(rfp.deadline).toLocaleDateString()}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Posted: {new Date(rfp.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                {submissions.length} submissions
              </span>
            </div>
          </div>

          {/* Requirements */}
          {requirements.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Badge variant={req.is_mandatory ? 'default' : 'secondary'} className="mt-0.5">
                        {req.is_mandatory ? 'Required' : 'Optional'}
                      </Badge>
                      <span className="text-foreground flex-1">{req.requirement_text}</span>
                      {req.weight && req.weight > 1 && (
                        <span className="text-xs text-muted-foreground">Weight: {req.weight}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submissions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Vendor Submissions ({submissions.length})
            </h2>

            {submissions.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No submissions yet. Vendors will appear here once they pitch.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {submissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {submission.vendor_name}
                                </h3>
                                {submission.vendor_email && (
                                  <p className="text-sm text-muted-foreground">{submission.vendor_email}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="bg-muted/50 rounded-lg p-4 mb-3">
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Pitch:</h4>
                              <p className="text-foreground whitespace-pre-wrap">
                                {submission.pitch_text || 'No pitch text provided'}
                              </p>
                            </div>

                            <p className="text-sm text-muted-foreground">
                              Submitted {new Date(submission.created_at).toLocaleDateString()} at{' '}
                              {new Date(submission.created_at).toLocaleTimeString()}
                            </p>
                          </div>

                          {/* AI Score Badge */}
                          <div className="flex flex-col items-center gap-1">
                            <div className={`px-4 py-3 rounded-xl border ${getScoreColor(submission.ai_score || 0)}`}>
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-2xl font-bold">{submission.ai_score}</span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">AI Score</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default RFPDetails;