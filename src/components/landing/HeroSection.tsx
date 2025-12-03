import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap, FileText } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/20 via-primary/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-accent/20 via-accent/5 to-transparent blur-3xl" />
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-[10%] w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/10 animate-float opacity-60" />
      <div className="absolute top-1/3 right-[15%] w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-xl border border-accent/10 animate-float opacity-60" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 left-[20%] w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/10 animate-float opacity-60" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by AI Gemini</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Kelola Persuratan
            <br />
            <span className="gradient-text">Lebih Cerdas</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Platform persuratan digital berbasis AI untuk instansi modern. 
            Buat, kelola, dan lacak surat dengan mudah dan aman.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/auth?mode=register">
              <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                Mulai Gratis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="#demo">
              <Button variant="hero-outline" size="xl" className="gap-2 w-full sm:w-auto">
                <Sparkles className="w-5 h-5" />
                Coba AI Demo
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Tanda Tangan Digital</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">AI Pembuat Surat</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">QR Code Validasi</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 max-w-5xl mx-auto animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-accent/20 rounded-2xl blur-3xl opacity-50" />
            
            {/* Preview Card */}
            <div className="relative glass-card p-2 rounded-2xl shadow-xl">
              <div className="bg-secondary rounded-xl overflow-hidden">
                {/* Mock Browser Bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-sidebar-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-status-pending/60" />
                    <div className="w-3 h-3 rounded-full bg-status-complete/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-sidebar-accent text-xs text-sidebar-foreground/60">
                      dashboard.suratai.id
                    </div>
                  </div>
                </div>
                
                {/* Mock Dashboard Content */}
                <div className="flex h-[300px] sm:h-[400px]">
                  {/* Sidebar */}
                  <div className="hidden sm:block w-56 bg-sidebar border-r border-sidebar-border p-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
                      <span className="text-sm font-semibold text-sidebar-foreground">SuratAI</span>
                    </div>
                    <div className="space-y-1">
                      {["Dashboard", "Surat Masuk", "Surat Keluar", "Disposisi", "AI Assistant"].map((item, i) => (
                        <div 
                          key={item}
                          className={`px-3 py-2 rounded-lg text-sm ${i === 1 ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground/60'}`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 p-4 sm:p-6 bg-background">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-48 bg-muted rounded mt-2 animate-pulse" />
                      </div>
                      <div className="h-9 w-28 bg-primary/20 rounded-lg animate-pulse" />
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {[
                        { label: "Total Surat", value: "1,234" },
                        { label: "Menunggu", value: "56" },
                        { label: "Diproses", value: "23" },
                        { label: "Selesai", value: "1,155" },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-xl bg-card border border-border">
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                          <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Table Preview */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground">
                        <div>No. Surat</div>
                        <div>Pengirim</div>
                        <div className="hidden sm:block">Perihal</div>
                        <div>Status</div>
                      </div>
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-t border-border">
                          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                          <div className="hidden sm:block h-3 w-32 bg-muted rounded animate-pulse" />
                          <div className="h-5 w-16 bg-primary/20 rounded-full animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
