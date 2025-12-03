import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Mail,
  Send,
  Users,
  FileText,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  Building2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Surat Masuk", url: "/dashboard/incoming", icon: Mail },
  { title: "Surat Keluar", url: "/dashboard/outgoing", icon: Send },
  { title: "Disposisi", url: "/dashboard/disposition", icon: Users },
];

const toolsMenuItems = [
  { title: "AI Assistant", url: "/dashboard/ai", icon: Sparkles },
  { title: "Template Surat", url: "/dashboard/templates", icon: FileText },
];

const settingsMenuItems = [
  { title: "Pengaturan", url: "/dashboard/settings", icon: Settings },
  { title: "Bantuan", url: "/dashboard/help", icon: HelpCircle },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil keluar");
    navigate("/");
  };

  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center">
            <Mail className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sidebar-foreground">
              Surat<span className="text-sidebar-primary">AI</span>
            </span>
            <span className="text-[10px] text-sidebar-foreground/50 -mt-0.5">Digital Correspondence</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Instance Info */}
        <div className="mx-2 mb-4 p-3 rounded-lg bg-sidebar-accent">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sidebar-primary" />
            <span className="text-sm font-medium text-sidebar-foreground">Demo Instansi</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Paket Professional</p>
        </div>

        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Lainnya</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
