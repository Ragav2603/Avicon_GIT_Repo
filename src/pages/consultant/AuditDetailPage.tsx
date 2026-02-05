import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plane, 
  LogOut, 
  Loader2,
  Sparkles,
  Calendar,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScoreGauge } from '@/components/consultant/ScoreGauge';
import { RecommendationsTable } from '@/components/consultant/RecommendationsTable';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditItem {
  id: string;
  tool_name: string;
  utilization_metric: number | null;
  sentiment_score: number | null;
  calculated_score: number | null;
  recommendation: string | null;
}

interface AuditDetail {
  id: string;
  airline_id: string;
  airline_name?: string;
  audit_date: string | null;
  overall_score: number | null;
  created_at: string;
  audit_items: AuditItem[];
}

const AuditDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role, loading, signOut } = useAuth();
  const { toast } = useToast();
  
  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (id && role === 'consultant') {
      fetchAuditDetail();
    }
  }, [id, role]);

  const fetchAuditDetail = async () => {
    setIsLoading(true);
    try {
      // Fetch audit with items
      const { data, error } = await supabase
        .from('adoption_audits')
        .select('*, audit_items(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Try to fetch airline profile
      let airlineName = 'Unknown Airline';
      if (data?.airline_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, email')
          .eq('id', data.airline_id)
          .single();
        
        if (profile) {
          airlineName = profile.company_name || profile.email || 'Unknown Airline';
        }
      }

      setAudit({
        ...data,
        airline_name: airlineName,
      });
    } catch (error: any) {
      console.error('Error fetching audit:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

  // Generate AI summary from audit data
  const generateSummary = (score: number) => {
    if (score >= 80) {
      return 'The airline demonstrates strong digital tool adoption across evaluated systems. User engagement and satisfaction are high, indicating effective implementation strategies.';
    } else if (score >= 50) {
      return 'Overall digital adoption is satisfactory with opportunities for improvement. Some tools show strong engagement while others require attention to boost utilization.';
    } else {
      return 'Critical gaps exist in digital tool adoption. Immediate intervention is needed to address usability concerns and user resistance.';
    }
  };

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
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/consultant-dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64 rounded-xl" />
              <div className="lg:col-span-2">
                <Skeleton className="h-64 rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        ) : audit ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Audit Report
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {audit.airline_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {audit.audit_date
                      ? format(new Date(audit.audit_date), 'MMMM d, yyyy')
                      : format(new Date(audit.created_at), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs w-fit">
                Audit ID: {audit.id.slice(0, 8)}...
              </Badge>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Gauge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center shadow-sm"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Overall Score
                </h3>
                <ScoreGauge score={audit.overall_score || 0} size="lg" />
              </motion.div>

              {/* AI Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Executive Summary
                  </h3>
                  <Badge variant="outline" className="ml-auto text-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Generated
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {generateSummary(audit.overall_score || 0)}
                </p>
              </motion.div>
            </div>

            {/* Recommendations Table */}
            {audit.audit_items && audit.audit_items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <RecommendationsTable
                  recommendations={audit.audit_items.map((item) => ({
                    tool_name: item.tool_name,
                    score: item.calculated_score || 0,
                    recommendation: item.recommendation || 'No recommendation available.',
                    utilization_metric: item.utilization_metric || undefined,
                    sentiment_score: item.sentiment_score || undefined,
                  }))}
                />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Audit not found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AuditDetailPage;
