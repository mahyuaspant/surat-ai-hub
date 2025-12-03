import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  User, 
  Phone, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Building2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

const PublicForm = () => {
  const { slug } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    const ticket = `TKT-${Date.now().toString(36).toUpperCase()}`;
    setTicketNumber(ticket);
    setSubmitted(true);
    setLoading(false);
    toast.success("Surat berhasil dikirim!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-status-complete/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-status-complete" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Surat Berhasil Dikirim!
          </h1>
          <p className="text-muted-foreground mb-6">
            Terima kasih telah mengirim surat. Kami akan segera memproses surat Anda.
          </p>
          
          <div className="p-4 rounded-xl bg-card border border-border mb-6">
            <p className="text-sm text-muted-foreground mb-1">Nomor Tiket Anda</p>
            <p className="text-2xl font-display font-bold text-primary">{ticketNumber}</p>
          </div>

          <p className="text-sm text-muted-foreground">
            Email konfirmasi telah dikirim ke <strong>{formData.email}</strong>
          </p>

          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
              setFile(null);
            }}
          >
            Kirim Surat Lainnya
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-secondary py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-display font-bold text-secondary-foreground">
                {slug ? slug.replace(/-/g, ' ').toUpperCase() : "Demo Instansi"}
              </h1>
              <p className="text-sm text-secondary-foreground/60">Portal Persuratan Digital</p>
            </div>
          </div>
          <p className="text-secondary-foreground/80 max-w-md mx-auto">
            Kirim surat atau dokumen Anda melalui form di bawah ini. 
            Anda akan menerima nomor tiket untuk tracking status surat.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">Form Pengiriman Surat</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="pl-10"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP (Opsional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  className="pl-10"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Perihal / Keperluan *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Contoh: Permohonan Izin Kegiatan"
                  className="pl-10"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Pesan / Keterangan</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tuliskan keterangan tambahan jika diperlukan..."
                className="min-h-[100px]"
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload Dokumen (PDF, DOC, JPG)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  {file ? (
                    <p className="text-sm text-foreground font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Klik untuk upload atau drag & drop
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Maksimal 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Mengirim...
                </span>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Kirim Surat
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-2">Informasi</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Setelah mengirim, Anda akan menerima nomor tiket via email</li>
            <li>• Gunakan nomor tiket untuk melacak status surat</li>
            <li>• Waktu proses rata-rata: 1-3 hari kerja</li>
          </ul>
        </div>

        {/* Powered by */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <span className="font-semibold text-primary">SuratAI</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicForm;
