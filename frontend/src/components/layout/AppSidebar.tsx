import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  LogOut,
  Plane
} from "lucide-react";
import { NavLink } from "@/components/NavLink.tsx";
import { useAuth } from "@/hooks/useAuth.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar.tsx";
import React from "react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AppSidebarProps {
  navItems: NavItem[];
  roleLabel?: string;
}

export function AppSidebar({ navItems, roleLabel = "User" }: AppSidebarProps) {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string, items: NavItem[]) => {
    // Exact match for the first/root item
    const rootUrl = items[0]?.url;
    if (path === rootUrl) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" aria-label="Main sidebar navigation">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">
                AviCon
              </span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                Control Tower
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url, navItems)}
                    tooltip={item.title}
                    className="h-10"
                  >
                    <NavLink 
                      to={item.url} 
                      end={item.url === navItems[0]?.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-white/10 text-white border-l-2 border-primary"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-2.5">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                {roleLabel}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full h-10 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
