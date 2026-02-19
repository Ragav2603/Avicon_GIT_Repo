import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button.tsx";
import { Menu, X, LogOut } from "lucide-react";
import Logo from "@/components/Logo.tsx";
import { useAuth } from "@/hooks/useAuth.tsx";

const DesktopAuthButtons = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (role) {
      case 'airline': return '/airline-dashboard';
      case 'vendor': return '/vendor-dashboard';
      case 'consultant': return '/consultant-dashboard';
      default: return '/onboarding';
    }
  };

  if (user) {
    return (
      <div className="hidden lg:flex items-center gap-4">
        <Link to={getDashboardLink()}>
          <Button variant="ghost">Dashboard</Button>
        </Link>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-4">
      <Link to="/auth">
        <Button variant="secondary">Sign In</Button>
      </Link>
    </div>
  );
};

const MobileAuthButtons = ({ setIsOpen }: { setIsOpen: (open: boolean) => void }) => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (role) {
      case 'airline': return '/airline-dashboard';
      case 'vendor': return '/vendor-dashboard';
      case 'consultant': return '/consultant-dashboard';
      default: return '/onboarding';
    }
  };

  if (user) {
    return (
      <div className="flex flex-col gap-3 pt-4 border-t border-border">
        <Link to={getDashboardLink()} onClick={() => setIsOpen(false)}>
          <Button variant="ghost" className="w-full justify-center">
            Dashboard
          </Button>
        </Link>
        <Button variant="outline" className="w-full justify-center" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-4 border-t border-border">
      <Link to="/auth" onClick={() => setIsOpen(false)}>
        <Button variant="secondary" className="w-full justify-center">
          Sign In
        </Button>
      </Link>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: "RFP Marketplace", href: "#smart-procurement" },
    { name: "Adoption Ops", href: "#adoption" },
    { name: "How It Works", href: "#how-it-works" },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    
    if (location.pathname !== '/') {
      navigate('/' + href);
      setIsOpen(false);
      return;
    }
    
    const element = document.getElementById(targetId);
    if (element) {
      const navHeight = 80;
      // deno-lint-ignore no-window
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      // deno-lint-ignore no-window
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth',
      });
    }
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <DesktopAuthButtons />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="block text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                >
                  {link.name}
                </a>
              ))}
              <MobileAuthButtons setIsOpen={setIsOpen} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
