import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Building2, Store, UserCog, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type RoleOption = {
  id: 'airline' | 'vendor' | 'consultant';
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  dashboard: string;
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
    dashboard: '/airline-dashboard'
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
    dashboard: '/vendor-dashboard'
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
    dashboard: '/consultant-dashboard'
  }
];

const Onboarding = () => {
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, role, loading, setUserRole } = useAuth();
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

  const handleRoleSelect = async (roleOption: RoleOption) => {
    setSelectedRole(roleOption);
    setIsSubmitting(true);

    try {
      const { error } = await setUserRole(roleOption.id);
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to set your role. Please try again.',
          variant: 'destructive',
        });
        setSelectedRole(null);
      } else {
        toast({
          title: 'Welcome to AviCon!',
          description: `Your ${roleOption.title} account is ready.`,
        });
        
        // Small delay for toast to show
        setTimeout(() => {
          navigate(roleOption.dashboard);
        }, 500);
      }
    } finally {
      setIsSubmitting(false);
    }
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
              Avi<span className="gradient-text">Con</span>
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
              onClick={() => handleRoleSelect(roleOption)}
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
                inline-flex p-4 rounded-xl mb-6 transition-colors
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
          You can always change your role later in your account settings.
        </motion.p>
      </main>
    </div>
  );
};

export default Onboarding;
