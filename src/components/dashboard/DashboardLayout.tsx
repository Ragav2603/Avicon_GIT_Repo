import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Bell, 
  User, 
  LogOut, 
  ChevronLeft,
  Menu,
  X,
  Plane
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/airline-dashboard" },
  { id: "rfps", label: "My RFPs", icon: FileText, path: "/airline-dashboard/rfps" },
  { id: "matches", label: "Vendor Matches", icon: Users, path: "/airline-dashboard/matches" },
  { id: "adoption", label: "Adoption Tracker", icon: BarChart3, path: "/airline-dashboard/adoption" },
];

const initialNotifications: Notification[] = [
  { id: 1, text: "New proposal from TechCorp", time: "5 min ago", unread: true },
  { id: 2, text: "AI Verification complete for RFP #12", time: "1 hour ago", unread: true },
  { id: 3, text: "Deadline reminder: Cloud Migration RFP", time: "2 hours ago", unread: false },
];

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      toast({
        title: "Notification",
        description: notification.text,
      });
    }
  };

  const currentPath = location.pathname;
  const activeItem = navItems.find(item => item.path === currentPath) || navItems[0];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-secondary" />
            <span className="font-bold">AviCon</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {notifications.map((n) => (
                <DropdownMenuItem 
                  key={n.id} 
                  className="flex flex-col items-start py-3 cursor-pointer"
                  onClick={() => handleNotificationClick(n.id)}
                >
                  <div className="flex items-start gap-2 w-full">
                    {n.unread && (
                      <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                    <div className={n.unread ? "" : "ml-4"}>
                      <span className="text-sm">{n.text}</span>
                      <span className="text-xs text-muted-foreground block mt-0.5">{n.time}</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-secondary text-white text-sm">
              {user?.email?.charAt(0).toUpperCase() || "U"}
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
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-background border-r border-border z-50 flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <Link to="/" className="flex items-center gap-2">
                  <Plane className="h-6 w-6 text-secondary" />
                  <span className="font-bold">AviCon</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
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
                        ? "bg-secondary text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          "hidden lg:flex fixed top-0 left-0 bottom-0 flex-col bg-background border-r border-border transition-all duration-300 z-40",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-secondary" />
              <span className="font-bold text-lg">AviCon</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <Plane className="h-6 w-6 text-secondary mx-auto" />
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8", sidebarCollapsed && "mx-auto")}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                activeItem.id === item.id
                  ? "bg-secondary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                sidebarCollapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className={cn("p-3 border-t border-border", sidebarCollapsed && "flex justify-center")}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-white">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Airline Manager</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 pt-16 lg:pt-0",
        sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
      )}>
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 bg-background border-b border-border">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-2 border-b border-border">
                  <p className="font-semibold">Notifications</p>
                </div>
                {notifications.map((n) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    className="flex flex-col items-start py-3 cursor-pointer"
                    onClick={() => handleNotificationClick(n.id)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      {n.unread && (
                        <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                      <div className={n.unread ? "" : "ml-4"}>
                        <span className="text-sm">{n.text}</span>
                        <span className="text-xs text-muted-foreground block mt-0.5">{n.time}</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="justify-center text-secondary cursor-pointer"
                  onClick={() => {
                    toast({
                      title: "Coming soon",
                      description: "Full notification center is under development.",
                    });
                  }}
                >
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-white text-sm">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden xl:block">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
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

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
