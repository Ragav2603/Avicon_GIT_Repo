import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Plus, LogOut, Loader2, FileText, Users, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CreateRFPForm from '@/components/CreateRFPForm';

interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  submission_count?: number;
}

const AirlineDashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loadingRfps, setLoadingRfps] = useState(true);

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

  const fetchRfps = async () => {
    if (!user) return;
    
    setLoadingRfps(true);
    try {
      const { data: rfpData, error } = await supabase
        .from('rfps')
        .select('*')
        .eq('airline_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get submission counts
      const rfpsWithCounts = await Promise.all(
        (rfpData || []).map(async (rfp) => {
          const { count } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('rfp_id', rfp.id);
          return { ...rfp, submission_count: count || 0 };
        })
      );

      setRfps(rfpsWithCounts);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
    } finally {
      setLoadingRfps(false);
    }
  };

  useEffect(() => {
    if (user && role === 'airline') {
      fetchRfps();
    }
  }, [user, role]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || role !== 'airline') {
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome Airline Manager
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your RFPs and review vendor submissions
              </p>
            </div>
            <Button size="lg" onClick={() => setShowCreateForm(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Post New RFP
            </Button>
          </div>

          {/* RFP List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Your RFPs
            </h2>

            {loadingRfps ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : rfps.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No RFPs yet. Create your first one!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {rfps.map((rfp, index) => (
                  <motion.div
                    key={rfp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/rfp/${rfp.id}`)}
                    className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                            {rfp.title}
                          </h3>
                          <Badge variant={rfp.status === 'open' ? 'default' : 'secondary'}>
                            {rfp.status || 'open'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{rfp.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                          {rfp.budget_max && (
                            <span className="text-muted-foreground">
                              Budget: <span className="text-foreground font-medium">${rfp.budget_max.toLocaleString()}</span>
                            </span>
                          )}
                          {rfp.deadline && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              Deadline: {new Date(rfp.deadline).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {rfp.submission_count} submissions
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {new Date(rfp.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Create RFP Modal */}
      <CreateRFPForm 
        open={showCreateForm} 
        onOpenChange={setShowCreateForm}
        onSuccess={fetchRfps}
      />
    </div>
  );
};

export default AirlineDashboard;
