import { ReactNode, useState } from "react";
import { Bell, Search } from "lucide-react";
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

interface ControlTowerLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

const initialNotifications: Notification[] = [
  { id: 1, text: "New proposal from TechCorp", time: "5 min ago", unread: true },
  { id: 2, text: "AI Verification complete for Project #12", time: "1 hour ago", unread: true },
  { id: 3, text: "Deadline reminder: Cloud Migration", time: "2 hours ago", unread: false },
];

export function ControlTowerLayout({ 
  children, 
  title, 
  subtitle,
  actions 
}: ControlTowerLayoutProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const unreadCount = notifications.filter(n => n.unread).length;

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

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast({
      title: "All notifications marked as read",
    });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />
        
        <SidebarInset className="flex flex-col">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-6">
            {/* Left: Trigger + Page Info */}
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="h-9 w-9" />
              
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground leading-none">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Center: Search (hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search projects, vendors..." 
                  className="pl-9 bg-muted/50 border-transparent focus:border-border h-9"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {actions}
              
              {/* Notifications */}
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                      onClick={(e) => {
                        e.preventDefault();
                        markAllRead();
                      }}
                    >
                      Mark all read
                    </Button>
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
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="justify-center text-primary text-sm py-2.5 cursor-pointer"
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

              {/* User Avatar (hidden on mobile - shown in sidebar) */}
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
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default ControlTowerLayout;
