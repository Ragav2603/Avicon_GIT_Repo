import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Users, Building2, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ConsultantControlTowerLayout from '@/components/layout/ConsultantControlTowerLayout';
import { format } from 'date-fns';

interface Client {
  id: string;
  company_name: string | null;
  email: string | null;
  created_at: string;
  audit_count: number;
}

const ClientsPage = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clients, setClients] = useState<Client[]>([]);
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
    if (role === 'consultant') {
      fetchClients();
    }
  }, [role]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      // Get all audits for this consultant
      const { data: auditsData, error: auditsError } = await supabase
        .from('adoption_audits')
        .select('airline_id')
        .eq('consultant_id', user?.id);

      if (auditsError) throw auditsError;

      if (!auditsData || auditsData.length === 0) {
        setClients([]);
        return;
      }

      // Count audits per airline
      const auditCounts: Record<string, number> = {};
      auditsData.forEach((a) => {
        auditCounts[a.airline_id] = (auditCounts[a.airline_id] || 0) + 1;
      });

      const airlineIds = Object.keys(auditCounts);

      // Get profile info for airlines
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, company_name, email, created_at')
        .in('id', airlineIds);

      if (profilesError) throw profilesError;

      const clientList: Client[] = (profilesData || []).map((p) => ({
        id: p.id,
        company_name: p.company_name,
        email: p.email,
        created_at: p.created_at,
        audit_count: auditCounts[p.id] || 0,
      }));

      setClients(clientList);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load clients.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || role !== 'consultant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ConsultantControlTowerLayout 
      title="Clients" 
      subtitle="Manage your airline clients and their audit history"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Clients Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Complete your first adoption audit to see your client list here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(client.company_name || client.email || 'C').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {client.company_name || 'Unknown Company'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {client.email}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(client.created_at), 'MMM yyyy')}</span>
                    </div>
                    <Badge variant="secondary">
                      {client.audit_count} audit{client.audit_count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </ConsultantControlTowerLayout>
  );
};

export default ClientsPage;
