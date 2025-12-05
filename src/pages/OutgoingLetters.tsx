import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OutgoingLettersTable } from "@/components/dashboard/OutgoingLettersTable";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const OutgoingLetters = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-h-screen">
          <DashboardHeader user={user} />
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Surat Keluar</h1>
              <p className="text-muted-foreground">Kelola semua surat keluar instansi Anda</p>
            </div>
            <OutgoingLettersTable />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default OutgoingLetters;
