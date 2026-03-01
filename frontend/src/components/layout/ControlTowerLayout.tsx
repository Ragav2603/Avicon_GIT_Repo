import { ReactNode } from "react";
import { Bell, Search, LayoutDashboard, FolderKanban, ClipboardCheck, Settings, X, BrainCircuit, Bot, GitBranch, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useToast } from "@/hooks/use-toast";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

const airlineNavItems = [
  { title: "Dashboard", url: "/airline-dashboard", icon: LayoutDashboard },
  { title: "RFPs", url: "/airline-dashboard/rfps", icon: FolderKanban },
  { title: "Adoption Audits", url: "/airline-dashboard/adoption", icon: ClipboardCheck },
  { title: "Knowledge Base", url: "/airline-dashboard/knowledge-base", icon: BrainCircuit },
  { title: "AI Agents", url: "/airline-dashboard/agents", icon: Bot },
  { title: "Workflows", url: "/airline-dashboard/workflows", icon: GitBranch },
  { title: "Meetings", url: "/airline-dashboard/meetings", icon: Calendar },
  { title: "Settings", url: "/airline-dashboard/settings", icon: Settings },
];

interface ControlTowerLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const airlineInitialNotifications: Notification[] = [
  { id: 201, text: "New proposal from TechCorp", time: "5 min ago", unread: true },
  { id: 202, text: "AI Verification complete for Project #12", time: "1 hour ago", unread: true },
  { id: 203, text: "Deadline reminder: Cloud Migration", time: "2 hours ago", unread: false },
];

export function ControlTowerLayout({
  children,
  title,
  subtitle,
  actions,
  searchValue,
  onSearchChange,
}: ControlTowerLayoutProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllRead: markAllReadHook } = useNotifications(airlineInitialNotifications);

  const handleNotificationClick = (id: number) => {
    markAsRead(id);
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      toast({ title: "Notification", description: notification.text });
    }
  };

  const handleMarkAllRead = () => {
    markAllReadHook();
    toast({ title: "All notifications marked as read" });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar navItems={airlineNavItems} roleLabel="Airline Manager" />

        <SidebarInset className="flex flex-col">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="h-9 w-9" />
              <div className="hidden sm:block">
                <h1 className="text-base font-semibold text-foreground leading-none tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects, vendors..."
                  className="pl-9 pr-8 bg-white border-border focus:border-primary h-9"
                  value={searchValue ?? ""}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => onSearchChange?.("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {actions}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="font-semibold text-sm">Notifications</p>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary/80" onClick={(e) => { e.preventDefault(); handleMarkAllRead(); }}>
                      Mark all read
                    </Button>
                  </div>
                  {notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start py-3 cursor-pointer" onClick={() => handleNotificationClick(n.id)}>
                      <div className="flex items-start gap-2 w-full">
                        {n.unread && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                        <div className={n.unread ? "" : "ml-4"}>
                          <span className="text-sm">{n.text}</span>
                          <span className="text-xs text-muted-foreground block mt-0.5">{n.time}</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-primary text-sm py-2.5 cursor-pointer" onClick={() => { toast({ title: "Coming soon", description: "Full notification center is under development." }); }}>
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Avatar className="h-9 w-9 hidden sm:flex">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Mobile Page Title */}
          <div className="sm:hidden px-4 py-3 border-b border-border bg-background">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default ControlTowerLayout;
