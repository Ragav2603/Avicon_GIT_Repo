import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, 
  LogOut, 
  Loader2, 
  Settings, 
  Plus,
  RefreshCw,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuditStatsCards } from '@/components/consultant/AuditStatsCards';
import { AuditsTable } from '@/components/consultant/AuditsTable';
import { AuditEmptyState } from '@/components/consultant/AuditEmptyState';
import { NewAuditForm } from '@/components/consultant/NewAuditForm';

interface Audit {
  id: string;
  airline_id: string;
  airline_name?: string;
  audit_date: string | null;
  overall_score: number | null;
  created_at: string;
}

const ConsultantDashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!role) {
        navigate('/onboarding');
      } else if (role !== 'consultant') {
        navigate(`/${role}-dashboard`);
      }
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (role === 'consultant') {
      fetchAudits();
    }
  }, [role]);

  const fetchAudits = async () => {
    setIsLoading(true);
    try {
      // Fetch all audits sorted by date
      const { data: auditsData, error: auditsError } = await supabase
        .from('adoption_audits')
        .select('*')
        .order('created_at', { ascending: false });

      if (auditsError) throw auditsError;

      if (!auditsData || auditsData.length === 0) {
        setAudits([]);
        return;
      }

      // Fetch profiles for airline names
      const airlineIds = [...new Set(auditsData.map((a) => a.airline_id))];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, company_name, email')
        .in('id', airlineIds);

      const profilesMap: Record<string, string> = {};
      if (profilesData) {
        profilesData.forEach((p) => {
          profilesMap[p.id] = p.company_name || p.email || 'Unknown';
        });
      }

      // Merge with airline names
      const auditsWithNames: Audit[] = auditsData.map((audit) => ({
        ...audit,
        airline_name: profilesMap[audit.airline_id] || 'Unknown Airline',
      }));

      setAudits(auditsWithNames);
    } catch (error: any) {
      console.error('Error fetching audits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audits.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuditComplete = (result: any) => {
    setIsNewAuditOpen(false);
    // Navigate to the new audit detail page
    navigate(`/consultant-dashboard/audit/${result.audit_id}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || role !== 'consultant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Calculate stats
  const totalAudits = audits.length;
  const averageScore = totalAudits > 0
    ? Math.round(
        audits.reduce((sum, a) => sum + (a.overall_score || 0), 0) / totalAudits
      )
    : 0;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const thisMonthCount = audits.filter(
    (a) => new Date(a.created_at) >= thisMonth
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Plane className="h-8 w-8 text-accent" />
            <span className="text-xl font-bold">
              Avi<span className="text-accent">Con</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <ClipboardCheck className="h-8 w-8 text-accent" />
                Digital Adoption Audits
              </h1>
              <p className="text-muted-foreground">
                Evaluate airline software ecosystems and generate AI-powered recommendations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchAudits}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                size="sm" 
                className="bg-accent hover:bg-accent/90"
                onClick={() => setIsNewAuditOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Audit
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <AuditStatsCards
              totalAudits={totalAudits}
              averageScore={averageScore}
              thisMonthCount={thisMonthCount}
              isLoading={isLoading}
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <AuditsTable audits={[]} isLoading={true} />
          ) : audits.length === 0 ? (
            <AuditEmptyState onNewAudit={() => setIsNewAuditOpen(true)} />
          ) : (
            <AuditsTable audits={audits} />
          )}
        </motion.div>
      </main>

      {/* New Audit Dialog */}
      <Dialog open={isNewAuditOpen} onOpenChange={setIsNewAuditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ClipboardCheck className="h-5 w-5 text-accent" />
              New Digital Adoption Audit
            </DialogTitle>
            <DialogDescription>
              Enter airline details and tool metrics to generate an AI-powered adoption analysis.
            </DialogDescription>
          </DialogHeader>
          <NewAuditForm 
            onAuditComplete={handleAuditComplete}
            onCancel={() => setIsNewAuditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultantDashboard;
