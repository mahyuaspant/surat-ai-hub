import { Check, Sparkles, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description: "Untuk instansi kecil yang baru memulai",
    price: "Gratis",
    period: "selamanya",
    icon: Sparkles,
    features: [
      "100 surat per bulan",
      "1 admin instansi",
      "3 user instansi",
      "Form publik basic",
      "Email notifikasi",
      "Support komunitas",
    ],
    cta: "Mulai Gratis",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Professional",
    description: "Untuk instansi yang berkembang",
    price: "Rp 299.000",
    period: "/bulan",
    icon: Building2,
    features: [
      "Unlimited surat",
      "5 admin instansi",
      "20 user instansi",
      "AI pembaca & pembuat surat",
      "Tanda tangan digital",
      "QR code validasi",
      "Custom branding",
      "Priority support",
    ],
    cta: "Pilih Professional",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Untuk organisasi besar",
    price: "Hubungi Kami",
    period: "",
    icon: Crown,
    features: [
      "Semua fitur Professional",
      "Unlimited admin & user",
      "API akses",
      "SSO / LDAP integration",
      "On-premise deployment",
      "SLA 99.9%",
      "Dedicated account manager",
      "Training & onboarding",
    ],
    cta: "Hubungi Sales",
    variant: "secondary" as const,
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Harga Transparan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Pilih Paket yang
            <span className="gradient-text"> Sesuai Kebutuhan</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Mulai gratis, upgrade sesuai pertumbuhan instansi Anda.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl bg-card border transition-all duration-300 animate-fade-up ${
                plan.popular 
                  ? 'border-primary shadow-lg shadow-primary/10 scale-105' 
                  : 'border-border hover:border-primary/30 hover:shadow-md'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-semibold text-primary-foreground">
                    Paling Populer
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                plan.popular 
                  ? 'bg-gradient-to-br from-primary to-accent' 
                  : 'bg-muted'
              }`}>
                <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary-foreground' : 'text-foreground'}`} />
              </div>

              {/* Plan Info */}
              <h3 className="text-xl font-display font-semibold text-foreground mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-display font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/auth?mode=register">
                <Button variant={plan.variant} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
