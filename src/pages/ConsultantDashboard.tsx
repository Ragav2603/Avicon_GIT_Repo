import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Plus,
  RefreshCw,
  ClipboardCheck,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ConsultantControlTowerLayout from '@/components/layout/ConsultantControlTowerLayout';
import { AuditStatsCards } from '@/components/consultant/AuditStatsCards';
import { AuditsTable } from '@/components/consultant/AuditsTable';
import { AuditEmptyState } from '@/components/consultant/AuditEmptyState';
import { NewAuditForm } from '@/components/consultant/NewAuditForm';
import CSVUploader from '@/components/consultant/CSVUploader';

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
      const { data: auditsData, error: auditsError } = await supabase
        .from('adoption_audits')
        .select('*')
        .order('created_at', { ascending: false });

      if (auditsError) throw auditsError;

      if (!auditsData || auditsData.length === 0) {
        setAudits([]);
        return;
      }

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
    navigate(`/consultant-dashboard/audit/${result.audit_id}`);
  };

  if (loading || role !== 'consultant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <ConsultantControlTowerLayout 
      title="Digital Adoption Audits" 
      subtitle="Evaluate airline software ecosystems and generate AI-powered recommendations"
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchAudits}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            onClick={() => setIsNewAuditOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Audit
          </Button>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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

      {/* New Audit Dialog */}
      <Dialog open={isNewAuditOpen} onOpenChange={setIsNewAuditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              New Digital Adoption Audit
            </DialogTitle>
            <DialogDescription>
              Enter tool metrics manually or upload usage data from a CSV file.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="gap-2">
                <Plus className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="csv" className="gap-2">
                <Upload className="h-4 w-4" />
                CSV Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="mt-4">
              <NewAuditForm 
                onAuditComplete={handleAuditComplete}
                onCancel={() => setIsNewAuditOpen(false)}
              />
            </TabsContent>
            
            <TabsContent value="csv" className="mt-4">
              <CSVUploader
                onUploadComplete={handleAuditComplete}
                onCancel={() => setIsNewAuditOpen(false)}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </ConsultantControlTowerLayout>
  );
};

export default ConsultantDashboard;
