import { Mail, Clock, CheckCircle2, Archive, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Total Surat",
    value: "1,234",
    change: "+12%",
    changeType: "positive",
    icon: Mail,
    color: "from-primary to-accent",
  },
  {
    label: "Menunggu Review",
    value: "56",
    change: "+3",
    changeType: "neutral",
    icon: Clock,
    color: "from-status-pending to-amber-400",
  },
  {
    label: "Sedang Diproses",
    value: "23",
    change: "-2",
    changeType: "positive",
    icon: TrendingUp,
    color: "from-status-review to-blue-400",
  },
  {
    label: "Selesai Bulan Ini",
    value: "89",
    change: "+15%",
    changeType: "positive",
    icon: CheckCircle2,
    color: "from-status-complete to-emerald-400",
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-all duration-300 animate-fade-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              stat.changeType === "positive" 
                ? "bg-status-complete/10 text-status-complete" 
                : "bg-muted text-muted-foreground"
            }`}>
              {stat.change}
            </span>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
