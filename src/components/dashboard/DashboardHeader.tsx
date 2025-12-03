import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  user: User | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        
        {/* Search */}
        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari surat, pengirim..."
            className="w-64 pl-9 bg-muted/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* New Letter Button */}
        <Button variant="hero" size="sm" className="hidden sm:flex gap-2">
          <Plus className="w-4 h-4" />
          Surat Baru
        </Button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-muted transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-medium text-primary-foreground">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">Admin Instansi</p>
          </div>
        </button>
      </div>
    </header>
  );
}
