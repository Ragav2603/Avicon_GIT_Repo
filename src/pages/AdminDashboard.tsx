import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, KeyRound, Globe, Plus, Trash2, LogOut, Loader2, 
  RefreshCw, Users, Calendar, Check, X, UserPlus, Mail, Building, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

type InviteCode = {
  id: string;
  code: string;
  role: 'airline' | 'vendor' | 'consultant';
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

type ApprovedDomain = {
  id: string;
  domain: string;
  role: 'airline' | 'vendor' | 'consultant';
  description: string | null;
  is_active: boolean;
  created_at: string;
};

type SignupRequest = {
  id: string;
  email: string;
  company_name: string;
  requested_role: 'airline' | 'vendor' | 'consultant';
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const AdminDashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [domains, setDomains] = useState<ApprovedDomain[]>([]);
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // New invite code form
  const [newCode, setNewCode] = useState('');
  const [newCodeRole, setNewCodeRole] = useState<'airline' | 'consultant'>('airline');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState('100');
  const [newCodeExpires, setNewCodeExpires] = useState('');
  const [creatingCode, setCreatingCode] = useState(false);

  // New domain form
  const [newDomain, setNewDomain] = useState('');
  const [newDomainRole, setNewDomainRole] = useState<'airline' | 'consultant'>('airline');
  const [newDomainDesc, setNewDomainDesc] = useState('');
  const [creatingDomain, setCreatingDomain] = useState(false);

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
        supabase.from('invite_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('approved_domains').select('*').order('created_at', { ascending: false }),
        supabase.from('signup_requests').select('*').order('created_at', { ascending: false })
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

  const handleApproveRequest = async (request: SignupRequest) => {
    try {
      // Update the request status
      const { error } = await supabase
        .from('signup_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: 'Request Approved',
        description: `${request.email} has been approved. They will receive an invite email.`,
      });
      fetchData();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (request: SignupRequest) => {
    try {
      const { error } = await supabase
        .from('signup_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: 'Request Rejected',
        description: `${request.email}'s request has been rejected.`,
      });
      fetchData();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const deleteSignupRequest = async (id: string) => {
    try {
      const { error } = await supabase.from('signup_requests').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Signup request removed' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete request', variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const createInviteCode = async () => {
    if (!newCode.trim()) {
      toast({ title: 'Error', description: 'Please enter a code', variant: 'destructive' });
      return;
    }

    setCreatingCode(true);
    try {
      const { error } = await supabase.from('invite_codes').insert({
        code: newCode.toUpperCase().trim(),
        role: newCodeRole,
        max_uses: newCodeMaxUses ? parseInt(newCodeMaxUses) : null,
        expires_at: newCodeExpires || null,
        created_by: user?.id
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Invite code created' });
      setNewCode('');
      setNewCodeMaxUses('100');
      setNewCodeExpires('');
      fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message?.includes('duplicate') ? 'Code already exists' : 'Failed to create code', 
        variant: 'destructive' 
      });
    } finally {
      setCreatingCode(false);
    }
  };

  const toggleCodeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update code', variant: 'destructive' });
    }
  };

  const deleteInviteCode = async (id: string) => {
    try {
      const { error } = await supabase.from('invite_codes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Invite code removed' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete code', variant: 'destructive' });
    }
  };

  const createDomain = async () => {
    if (!newDomain.trim()) {
      toast({ title: 'Error', description: 'Please enter a domain', variant: 'destructive' });
      return;
    }

    setCreatingDomain(true);
    try {
      const { error } = await supabase.from('approved_domains').insert({
        domain: newDomain.toLowerCase().trim(),
        role: newDomainRole,
        description: newDomainDesc || null,
        created_by: user?.id
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Domain added' });
      setNewDomain('');
      setNewDomainDesc('');
      fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message?.includes('duplicate') ? 'Domain already exists' : 'Failed to add domain', 
        variant: 'destructive' 
      });
    } finally {
      setCreatingDomain(false);
    }
  };

  const toggleDomainStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('approved_domains')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update domain', variant: 'destructive' });
    }
  };

  const deleteDomain = async (id: string) => {
    try {
      const { error } = await supabase.from('approved_domains').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Domain removed' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete domain', variant: 'destructive' });
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
            <Link to="/consultant-dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Admin Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage signups, invite codes, and approved domains
              </p>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={loadingData}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {signupRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
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
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Signup Requests
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review and approve user registration requests
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requester</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : signupRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No signup requests yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      signupRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{request.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              {request.company_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {request.requested_role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(request.created_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status === 'approved'
                                  ? 'default'
                                  : request.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {request.status === 'approved' && <Check className="h-3 w-3 mr-1" />}
                              {request.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {request.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleApproveRequest(request)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive hover:bg-destructive/10"
                                  onClick={() => handleRejectRequest(request)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteSignupRequest(request.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Invite Codes Tab */}
            <TabsContent value="codes" className="space-y-6">
              {/* Create New Code */}
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Invite Code
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={newCode} 
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        placeholder="INVITE123"
                      />
                      <Button variant="outline" size="icon" onClick={generateCode} title="Generate">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newCodeRole} onValueChange={(v: 'airline' | 'consultant') => setNewCodeRole(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airline">Airline</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Uses</Label>
                    <Input 
                      type="number" 
                      value={newCodeMaxUses} 
                      onChange={(e) => setNewCodeMaxUses(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expires</Label>
                    <Input 
                      type="date" 
                      value={newCodeExpires} 
                      onChange={(e) => setNewCodeExpires(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={createInviteCode} disabled={creatingCode} className="w-full">
                      {creatingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Codes Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : inviteCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No invite codes yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      inviteCodes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell className="font-mono font-medium">{code.code}</TableCell>
                          <TableCell className="capitalize">{code.role}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {code.current_uses}/{code.max_uses || '∞'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {code.expires_at ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3" />
                                {new Date(code.expires_at).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => toggleCodeStatus(code.id, code.is_active)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                code.is_active 
                                  ? 'bg-green-500/10 text-green-600' 
                                  : 'bg-red-500/10 text-red-600'
                              }`}
                            >
                              {code.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {code.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteInviteCode(code.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Domains Tab */}
            <TabsContent value="domains" className="space-y-6">
              {/* Create New Domain */}
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Approved Domain
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Users with email addresses from approved domains can register without an invite code.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Input 
                      value={newDomain} 
                      onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                      placeholder="company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newDomainRole} onValueChange={(v: 'airline' | 'consultant') => setNewDomainRole(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airline">Airline</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      value={newDomainDesc} 
                      onChange={(e) => setNewDomainDesc(e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={createDomain} disabled={creatingDomain} className="w-full">
                      {creatingDomain ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Domain'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Domains Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : domains.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No approved domains yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      domains.map((domain) => (
                        <TableRow key={domain.id}>
                          <TableCell className="font-mono">{domain.domain}</TableCell>
                          <TableCell className="capitalize">{domain.role}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {domain.description || '-'}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => toggleDomainStatus(domain.id, domain.is_active)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                domain.is_active 
                                  ? 'bg-green-500/10 text-green-600' 
                                  : 'bg-red-500/10 text-red-600'
                              }`}
                            >
                              {domain.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {domain.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteDomain(domain.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
