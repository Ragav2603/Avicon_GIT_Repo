import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, 
  LogOut, 
  Loader2, 
  Settings, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  RefreshCw,
  User,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { format } from 'date-fns';

interface Profile {
  email: string | null;
  company_name: string | null;
}

interface ConsultingRequest {
  id: string;
  user_id: string;
  problem_area: string;
  message: string;
  status: string;
  created_at: string;
  profile?: Profile;
}

const problemAreaLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  process: { label: 'Process', icon: <RefreshCw className="h-4 w-4" />, color: 'bg-blue-500/10 text-blue-500' },
  tooling: { label: 'Tooling', icon: <Settings className="h-4 w-4" />, color: 'bg-purple-500/10 text-purple-500' },
  strategy: { label: 'Strategy', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-amber-500/10 text-amber-500' },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', icon: <Clock className="h-3 w-3" />, variant: 'secondary' },
  in_progress: { label: 'In Progress', icon: <RefreshCw className="h-3 w-3" />, variant: 'default' },
  resolved: { label: 'Resolved', icon: <CheckCircle className="h-3 w-3" />, variant: 'outline' },
  closed: { label: 'Closed', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
};

const ConsultantDashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<ConsultingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ConsultingRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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
      fetchRequests();
    }
  }, [role]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // Fetch consulting requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('consulting_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (!requestsData || requestsData.length === 0) {
        setRequests([]);
        return;
      }

      // Fetch profiles for all user_ids using service role via admin endpoint
      // Since we're a consultant, we can view all requests but need to get profile info
      const userIds = [...new Set(requestsData.map((r) => r.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, company_name')
        .in('id', userIds);

      // Create a map of profiles - if we can't get profiles, still show requests
      const profilesMap: Record<string, Profile> = {};
      if (profilesData) {
        profilesData.forEach((p) => {
          profilesMap[p.id] = { email: p.email, company_name: p.company_name };
        });
      }

      // Merge profiles with requests
      const requestsWithProfiles: ConsultingRequest[] = requestsData.map((req) => ({
        ...req,
        profile: profilesMap[req.user_id],
      }));

      setRequests(requestsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consulting requests.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    setUpdatingStatus(requestId);
    try {
      const { error } = await supabase
        .from('consulting_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );

      toast({
        title: 'Status Updated',
        description: `Request status changed to ${statusConfig[newStatus]?.label || newStatus}.`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || role !== 'consultant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const inProgressCount = requests.filter((r) => r.status === 'in_progress').length;

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
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Consultant Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage consulting requests from airlines and vendors
              </p>
            </div>
            <Button onClick={fetchRequests} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{requests.length}</p>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Requests Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Consulting Requests
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No consulting requests yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Problem Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const area = problemAreaLabels[request.problem_area] || {
                      label: request.problem_area,
                      icon: <AlertCircle className="h-4 w-4" />,
                      color: 'bg-muted text-muted-foreground',
                    };
                    const status = statusConfig[request.status] || statusConfig.pending;

                    return (
                      <TableRow key={request.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {request.profile?.company_name || 'Unknown Company'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {request.profile?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={area.color}>
                            {area.icon}
                            <span className="ml-1">{area.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={request.status}
                            onValueChange={(value) => handleStatusUpdate(request.id, value)}
                            disabled={updatingStatus === request.id}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              {updatingStatus === request.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    {config.icon}
                                    <span>{config.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(request.created_at), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Request Details
            </DialogTitle>
            <DialogDescription>
              Submitted on{' '}
              {selectedRequest &&
                format(new Date(selectedRequest.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Requester</p>
                  <p className="text-foreground">
                    {selectedRequest.profile?.company_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profile?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Problem Area</p>
                  <Badge
                    variant="secondary"
                    className={
                      problemAreaLabels[selectedRequest.problem_area]?.color ||
                      'bg-muted text-muted-foreground'
                    }
                  >
                    {problemAreaLabels[selectedRequest.problem_area]?.label ||
                      selectedRequest.problem_area}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Update Status</p>
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) => {
                    handleStatusUpdate(selectedRequest.id, value);
                    setSelectedRequest((prev) => (prev ? { ...prev, status: value } : null));
                  }}
                  disabled={updatingStatus === selectedRequest.id}
                >
                  <SelectTrigger>
                    {updatingStatus === selectedRequest.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SelectValue />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {config.icon}
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultantDashboard;
