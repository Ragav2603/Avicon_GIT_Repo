import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Home, Bot, GitBranch, BookOpen, Calendar, FileText,
  LogOut, Settings, ChevronRight, Sparkles, BarChart3,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarProvider, SidebarTrigger, SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface PlatformLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/platform' },
  { label: 'Agents', icon: Bot, path: '/platform/agents' },
  { label: 'Workflows', icon: GitBranch, path: '/platform/workflows' },
  { label: 'Knowledge Base', icon: BookOpen, path: '/platform/knowledge-base' },
  { label: 'Meetings', icon: Calendar, path: '/platform/meetings' },
];

const VENDOR_NAV = [
  { label: 'Response', icon: FileText, path: '/platform/response' },
];

export default function PlatformLayout({ children, title, subtitle }: PlatformLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const userRole = profile?.role || 'airline';
  const isVendor = userRole === 'vendor';
  const userInitials = profile?.company_name
    ? profile.company_name.slice(0, 2).toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() || 'AV');

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const allNavItems = isVendor ? [...NAV_ITEMS, ...VENDOR_NAV] : NAV_ITEMS;

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border" aria-label="Platform navigation">
          <SidebarHeader className="p-4">
            <Link to="/platform" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-sidebar-foreground tracking-tight group-data-[collapsible=icon]:hidden">
                AviCon
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {allNavItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                      (item.path !== '/platform' && location.pathname.startsWith(item.path));
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }
                        >
                          <Link to={item.path}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <Separator className="mb-3" />
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold rounded-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">
                  {profile?.company_name || user?.email}
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 capitalize">{userRole}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-sidebar-foreground/40 hover:text-sidebar-foreground"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
            <SidebarTrigger className="h-9 w-9" />
            <div className="flex-1">
              <h1 className="text-base font-semibold text-foreground leading-none tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
