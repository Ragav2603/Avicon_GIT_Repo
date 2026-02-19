import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Building2, Store, UserCog, ArrowRight, Loader2, Check, KeyRound, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RoleOption = {
  id: 'airline' | 'vendor' | 'consultant';
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  dashboard: string;
  requiresInvite: boolean;
};

const roles: RoleOption[] = [
  {
    id: 'airline',
    title: 'Airline Manager',
    subtitle: 'Buyer',
    description: 'Streamline your procurement process with AI-powered vendor matching and RFP automation.',
    icon: <Building2 className="h-10 w-10" />,
    features: [
      'Post RFPs and get matched vendors',
      'AI-verified vendor submissions',
      'Digital adoption insights',
      'Procurement analytics'
    ],
    dashboard: '/airline-dashboard',
    requiresInvite: true
  },
  {
    id: 'vendor',
    title: 'Vendor',
    subtitle: 'Seller',
    description: 'Showcase your solutions to airlines worldwide and get qualified leads through smart matching.',
    icon: <Store className="h-10 w-10" />,
    features: [
      'Access to airline RFPs',
      'AI-powered pitch optimization',
      'Verified vendor badge',
      'Performance analytics'
    ],
    dashboard: '/vendor-dashboard',
    requiresInvite: false
  },
  {
    id: 'consultant',
    title: 'Consultant',
    subtitle: 'Advisor',
    description: 'Deliver data-driven adoption audits and strategic recommendations to your airline clients.',
    icon: <UserCog className="h-10 w-10" />,
    features: [
      'Adoption scoring tools',
      'Automated report generation',
      'Client management',
      'ROI analytics'
    ],
    dashboard: '/consultant-dashboard',
    requiresInvite: true
  }
];

const Onboarding = () => {
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState('');
  
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (role) {
        // Already has a role, redirect to dashboard
        const roleData = roles.find(r => r.id === role);
        navigate(roleData?.dashboard || '/');
      }
    }
  }, [user, role, loading, navigate]);

  const handleRoleClick = (roleOption: RoleOption) => {
    setSelectedRole(roleOption);
    setInviteError('');
    setInviteCode('');
    
    if (roleOption.requiresInvite) {
      setShowInviteModal(true);
    } else {
      submitRole(roleOption, undefined);
    }
  };

  const submitRole = async (roleOption: RoleOption, code: string | undefined) => {
    setIsSubmitting(true);
    setInviteError('');

    try {
      // Check if user already has a role before calling the function
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .limit(1);

      if (existingRoles && existingRoles.length > 0) {
        const existingRoleData = roles.find(r => r.id === existingRoles[0].role);
        toast({
          title: 'Role already assigned',
          description: `You are already registered as ${existingRoleData?.title || existingRoles[0].role}. Redirecting...`,
        });
        setTimeout(() => {
          window.location.href = existingRoleData?.dashboard || '/';
        }, 500);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-role`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ role: roleOption.id, inviteCode: code }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.existingRole) {
          const existingRoleData = roles.find(r => r.id === responseData.existingRole);
          window.location.href = existingRoleData?.dashboard || '/';
          return;
        }
        if (responseData.requiresInvite || responseData.message) {
          setInviteError(responseData.message || responseData.error);
          return;
        }
        throw new Error(responseData.error || 'Failed to verify role');
      }

      setShowInviteModal(false);
      
      // Send welcome email (non-blocking)
      supabase.functions.invoke('send-welcome-email', {
        body: { role: roleOption.id }
      }).catch(err => console.error('Failed to send welcome email:', err));
      
      toast({
        title: 'Welcome to AviCon!',
        description: `Your ${roleOption.title} account is ready.`,
      });
      
      setTimeout(() => {
        window.location.href = roleOption.dashboard;
      }, 500);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set your role. Please try again.';
      console.error('Role verification error:', error);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setSelectedRole(null);
      setShowInviteModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    if (!inviteCode.trim()) {
      setInviteError('Please enter an invite code');
      return;
    }
    
    submitRole(selectedRole, inviteCode.trim());
  };

  const closeModal = () => {
    setShowInviteModal(false);
    setSelectedRole(null);
    setInviteCode('');
    setInviteError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <Plane className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">
              Avi<span className="text-primary">Con</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select how you'll be using AviCon. This helps us personalize your experience and show you the right features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {roles.map((roleOption, index) => (
            <motion.button
              key={roleOption.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleRoleClick(roleOption)}
              disabled={isSubmitting}
              className={`
                relative group text-left p-8 rounded-2xl border-2 transition-all duration-300
                ${selectedRole?.id === roleOption.id 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
                  : 'border-border hover:border-primary/50 bg-card hover:bg-card/80'
                }
                ${isSubmitting && selectedRole?.id !== roleOption.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Invite badge */}
              {roleOption.requiresInvite && (
                <div className="absolute top-4 left-4 flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <KeyRound className="h-3 w-3" />
                  Invite Only
                </div>
              )}

              {/* Selection indicator */}
              {selectedRole?.id === roleOption.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-primary-foreground" />
                  )}
                </motion.div>
              )}

              {/* Icon */}
              <div className={`
                inline-flex p-4 rounded-xl mb-6 transition-colors mt-6
                ${selectedRole?.id === roleOption.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                }
              `}>
                {roleOption.icon}
              </div>

              {/* Title & Subtitle */}
              <div className="mb-4">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {roleOption.subtitle}
                </span>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {roleOption.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {roleOption.description}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                {roleOption.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Arrow */}
              <div className={`
                mt-8 flex items-center gap-2 text-sm font-medium transition-all
                ${selectedRole?.id === roleOption.id 
                  ? 'text-primary' 
                  : 'text-muted-foreground group-hover:text-primary'
                }
              `}>
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          Vendor accounts are open to all. Airline and Consultant roles require an invite code for verification.
        </motion.p>
      </main>

      {/* Invite Code Modal */}
      <AnimatePresence>
        {showInviteModal && selectedRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Enter Invite Code</h3>
                    <p className="text-sm text-muted-foreground">{selectedRole.title} verification</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                To register as {selectedRole.title === 'Airline Manager' ? 'an' : 'a'} {selectedRole.title}, 
                please enter your invite code. Contact your organization administrator if you don't have one.
              </p>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="Enter your invite code"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value.toUpperCase());
                      setInviteError('');
                    }}
                    className={inviteError ? 'border-destructive' : ''}
                    autoFocus
                    disabled={isSubmitting}
                  />
                  {inviteError && (
                    <p className="text-sm text-destructive">{inviteError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !inviteCode.trim()}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
