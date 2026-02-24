import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, KeyRound, Globe, LogOut, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InviteCode, ApprovedDomain, SignupRequest } from '@/types/admin';
import { InviteCodesManager } from '@/components/admin/InviteCodesManager';
import { ApprovedDomainsManager } from '@/components/admin/ApprovedDomainsManager';
import { SignupRequestsManager } from '@/components/admin/SignupRequestsManager';

const AdminDashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [domains, setDomains] = useState<ApprovedDomain[]>([]);
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
      fetchData();
    }
  }, [role]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [codesRes, domainsRes, requestsRes] = await Promise.all([
        supabase.from('invite_codes').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('approved_domains').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('signup_requests').select('*').order('created_at', { ascending: false }).limit(200)
      ]);

      if (codesRes.data) setInviteCodes(codesRes.data as InviteCode[]);
      if (domainsRes.data) setDomains(domainsRes.data as ApprovedDomain[]);
      if (requestsRes.data) setSignupRequests(requestsRes.data as SignupRequest[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">AviCon Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, invite codes, and platform settings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {signupRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {inviteCodes.filter(c => c.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Codes</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {domains.filter(d => d.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved Domains</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Signups
                {signupRequests.filter(r => r.status === 'pending').length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {signupRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="codes" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Invite Codes
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Email Domains
              </TabsTrigger>
            </TabsList>

            {/* Signup Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <SignupRequestsManager
                signupRequests={signupRequests}
                loadingData={loadingData}
                onUpdate={fetchData}
                userId={user?.id}
              />
            </TabsContent>

            {/* Invite Codes Tab */}
            <TabsContent value="codes" className="space-y-6">
              <InviteCodesManager
                inviteCodes={inviteCodes}
                loadingData={loadingData}
                onUpdate={fetchData}
                userId={user?.id}
              />
            </TabsContent>

            {/* Domains Tab */}
            <TabsContent value="domains" className="space-y-6">
              <ApprovedDomainsManager
                domains={domains}
                loadingData={loadingData}
                onUpdate={fetchData}
                userId={user?.id}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
