import { useEffect, useState } from "react";
import { Mail, Clock, CheckCircle2, Send, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserInstitution } from "@/hooks/useUserInstitution";

interface Stats {
  totalIncoming: number;
  pendingReview: number;
  inProgress: number;
  totalOutgoing: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalIncoming: 0,
    pendingReview: 0,
    inProgress: 0,
    totalOutgoing: 0,
  });
  const [loading, setLoading] = useState(true);
  const { institutionId } = useUserInstitution();

  useEffect(() => {
    const fetchStats = async () => {
      if (!institutionId) {
        setLoading(false);
        return;
      }

      const [incomingResult, pendingResult, progressResult, outgoingResult] = await Promise.all([
        supabase.from("incoming_letters").select("id", { count: "exact", head: true }).eq("institution_id", institutionId),
        supabase.from("incoming_letters").select("id", { count: "exact", head: true }).eq("institution_id", institutionId).in("status", ["received", "review"]),
        supabase.from("incoming_letters").select("id", { count: "exact", head: true }).eq("institution_id", institutionId).in("status", ["disposition", "in_progress"]),
        supabase.from("outgoing_letters").select("id", { count: "exact", head: true }).eq("institution_id", institutionId),
      ]);

      setStats({
        totalIncoming: incomingResult.count || 0,
        pendingReview: pendingResult.count || 0,
        inProgress: progressResult.count || 0,
        totalOutgoing: outgoingResult.count || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, [institutionId]);

  const statsData = [
    {
      label: "Surat Masuk",
      value: stats.totalIncoming.toString(),
      icon: Mail,
      color: "from-primary to-accent",
    },
    {
      label: "Menunggu Review",
      value: stats.pendingReview.toString(),
      icon: Clock,
      color: "from-status-pending to-amber-400",
    },
    {
      label: "Sedang Diproses",
      value: stats.inProgress.toString(),
      icon: TrendingUp,
      color: "from-status-review to-blue-400",
    },
    {
      label: "Surat Keluar",
      value: stats.totalOutgoing.toString(),
      icon: Send,
      color: "from-status-complete to-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <div
          key={stat.label}
          className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-all duration-300 animate-fade-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <div>
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            )}
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
