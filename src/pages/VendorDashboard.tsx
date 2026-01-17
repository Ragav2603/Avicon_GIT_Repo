import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Globe, LogOut, Loader2, Send, DollarSign, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import SubmitProposalForm from '@/components/SubmitProposalForm';

interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  airline_id: string;
  has_submitted?: boolean;
}

interface Requirement {
  id: string;
  requirement_text: string;
  is_mandatory: boolean | null;
  weight: number | null;
}

const VendorDashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loadingRfps, setLoadingRfps] = useState(true);
  const [selectedRfp, setSelectedRfp] = useState<RFP | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<Requirement[]>([]);
  const [showProposalForm, setShowProposalForm] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!role) {
        navigate('/onboarding');
      } else if (role !== 'vendor') {
        navigate(`/${role}-dashboard`);
      }
    }
  }, [user, role, loading, navigate]);

  const fetchRfps = async () => {
    if (!user) return;
    
    setLoadingRfps(true);
    try {
      // Get all open RFPs
      const { data: rfpData, error } = await supabase
        .from('rfps')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which ones vendor has already submitted to
      const { data: submissions } = await supabase
        .from('submissions')
        .select('rfp_id')
        .eq('vendor_id', user.id);

      const submittedRfpIds = new Set((submissions || []).map(s => s.rfp_id));

      const rfpsWithStatus = (rfpData || []).map(rfp => ({
        ...rfp,
        has_submitted: submittedRfpIds.has(rfp.id),
      }));

      setRfps(rfpsWithStatus);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
    } finally {
      setLoadingRfps(false);
    }
  };

  useEffect(() => {
    if (user && role === 'vendor') {
      fetchRfps();
    }
  }, [user, role]);

  const handleViewRfp = async (rfp: RFP) => {
    setSelectedRfp(rfp);
    
    // Fetch requirements
    const { data: requirements } = await supabase
      .from('rfp_requirements')
      .select('*')
      .eq('rfp_id', rfp.id);
    
    setSelectedRequirements(requirements || []);
    setShowProposalForm(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || role !== 'vendor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Global Opportunities
              </h1>
            </div>
            <p className="text-muted-foreground">
              Browse and respond to RFPs from airlines worldwide
            </p>
          </div>

          {/* RFP List */}
          {loadingRfps ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : rfps.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No open RFPs at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rfps.map((rfp, index) => (
                <motion.div
                  key={rfp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground text-lg">{rfp.title}</h3>
                        {rfp.has_submitted && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Submitted
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">{rfp.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                        {rfp.budget_max && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            Up to ${rfp.budget_max.toLocaleString()}
                          </span>
                        )}
                        {rfp.deadline && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Deadline: {new Date(rfp.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          Posted {new Date(rfp.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleViewRfp(rfp)}
                      disabled={rfp.has_submitted}
                      variant={rfp.has_submitted ? 'outline' : 'default'}
                    >
                      {rfp.has_submitted ? (
                        'Submitted'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Proposal
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Submit Proposal Modal */}
      <SubmitProposalForm
        rfp={selectedRfp}
        requirements={selectedRequirements}
        open={showProposalForm}
        onOpenChange={setShowProposalForm}
        onSuccess={fetchRfps}
      />
    </div>
  );
};

export default VendorDashboard;
