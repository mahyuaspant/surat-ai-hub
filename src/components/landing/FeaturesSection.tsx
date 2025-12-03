import { 
  Mail, 
  FileSearch, 
  Users, 
  PenTool, 
  QrCode, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Form Publik",
    description: "Terima surat dari publik dengan form yang dapat di-embed di website instansi Anda.",
    highlights: ["Embeddable iframe", "Notifikasi email otomatis", "Tracking nomor tiket"],
    color: "from-primary to-accent",
  },
  {
    icon: FileSearch,
    title: "AI Pembaca Surat",
    description: "AI membaca, merangkum, dan mengkategorikan surat masuk secara otomatis.",
    highlights: ["OCR dokumen", "Ringkasan otomatis", "Rekomendasi kategori"],
    color: "from-accent to-primary",
  },
  {
    icon: Users,
    title: "Sistem Disposisi",
    description: "Distribusikan surat ke tim dengan instruksi jelas dan tracking progress.",
    highlights: ["Assign ke user", "Tenggat waktu", "Notifikasi real-time"],
    color: "from-primary to-accent",
  },
  {
    icon: PenTool,
    title: "Tanda Tangan Digital",
    description: "Bubuhkan tanda tangan digital dengan log audit yang aman.",
    highlights: ["E-signature", "Audit trail", "Multi-signer"],
    color: "from-accent to-primary",
  },
  {
    icon: QrCode,
    title: "QR Code Validasi",
    description: "Setiap surat keluar memiliki QR code untuk verifikasi keaslian.",
    highlights: ["Verifikasi publik", "Hash dokumen", "Anti pemalsuan"],
    color: "from-primary to-accent",
  },
  {
    icon: Sparkles,
    title: "AI Generator Surat",
    description: "Buat surat formal dengan bantuan AI dalam hitungan detik.",
    highlights: ["Format Indonesia", "Multi template", "Editing real-time"],
    color: "from-accent to-primary",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Fitur Lengkap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Semua yang Anda Butuhkan untuk
            <span className="gradient-text"> Persuratan Digital</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Platform lengkap untuk mengelola persuratan instansi dengan teknologi AI modern.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {feature.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2">
                {feature.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>

              {/* Hover Arrow */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
