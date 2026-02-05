import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, 
  BarChart3, 
  Bell, 
  User, 
  LogOut, 
  ChevronLeft,
  Menu,
  X,
  Search,
  Settings,
  Users,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

interface ConsultantControlTowerLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const navItems = [
  { id: "audits", label: "Adoption Audits", icon: ClipboardCheck, path: "/consultant-dashboard" },
  { id: "clients", label: "Clients", icon: Users, path: "/consultant-dashboard/clients" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/consultant-dashboard/analytics" },
  { id: "settings", label: "Settings", icon: Settings, path: "/consultant-dashboard/settings" },
];

const ConsultantControlTowerLayout = ({ children, title, subtitle, actions }: ConsultantControlTowerLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const notifications = [
    { id: 1, text: "New audit request from Delta Airlines", time: "15 min ago" },
    { id: 2, text: "Audit report ready for United", time: "1 hour ago" },
  ];

  const currentPath = location.pathname;
  const activeItem = navItems.find(item => currentPath.startsWith(item.path)) || navItems[0];

  return (
    <div className="min-h-screen bg-muted/30 flex w-full">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/">
            <Logo size="sm" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                  2
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start py-3">
                  <span className="text-sm">{n.text}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.email?.charAt(0).toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                <Link to="/">
                  <Logo size="sm" />
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-sidebar-foreground">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Role Badge Mobile */}
              <div className="px-4 py-3 border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                  <Stethoscope className="h-4 w-4" />
                  <span className="text-sm font-medium">Consultant Portal</span>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      activeItem.id === item.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex fixed top-0 left-0 bottom-0 flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <Link to="/">
              <Logo size="sm" />
            </Link>
          )}
          {sidebarCollapsed && (
            <Link to="/" className="mx-auto">
              <Logo size="sm" asLink={false} />
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent", sidebarCollapsed && "mx-auto")}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Role Badge */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              <Stethoscope className="h-4 w-4" />
              <span className="text-sm font-medium">Consultant Portal</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                activeItem.id === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                sidebarCollapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className={cn("p-3 border-t border-sidebar-border", sidebarCollapsed && "flex justify-center")}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {user?.email?.charAt(0).toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
                <p className="text-xs text-sidebar-foreground/60">Consultant</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-sidebar-foreground hover:bg-sidebar-accent">
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300 pt-16 lg:pt-0",
        sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
      )}>
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 bg-background border-b border-border sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search audits, clients..." 
                className="pl-10 bg-muted/50 border-0"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {actions}
            
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                    2
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-2 border-b border-border">
                  <p className="font-semibold">Notifications</p>
                </div>
                {notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start py-3 cursor-pointer">
                    <span className="text-sm">{n.text}</span>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user?.email?.charAt(0).toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden xl:block">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/consultant-dashboard/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Header */}
        <div className="px-4 lg:px-8 py-6 border-b border-border bg-background">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="lg:hidden">{actions}</div>}
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ConsultantControlTowerLayout;
