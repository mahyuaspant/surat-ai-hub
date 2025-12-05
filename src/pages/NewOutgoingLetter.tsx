import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserInstitution } from "@/hooks/useUserInstitution";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect } from "react";
import { User } from "@supabase/supabase-js";

const NewOutgoingLetter = () => {
  const navigate = useNavigate();
  const { institutionId, loading: institutionLoading } = useUserInstitution();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    letter_number: "",
    recipient: "",
    subject: "",
    content: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const generateLetterNumber = () => {
    const date = new Date();
    const num = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `SK-${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${num}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!institutionId) {
      toast.error("Anda belum terdaftar di instansi manapun");
      return;
    }

    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("outgoing_letters").insert({
      letter_number: formData.letter_number || generateLetterNumber(),
      recipient: formData.recipient,
      subject: formData.subject,
      content: formData.content,
      institution_id: institutionId,
      created_by: user?.id,
      status: "review",
    });

    if (error) {
      toast.error("Gagal membuat surat");
      console.error(error);
    } else {
      toast.success("Surat berhasil dibuat");
      navigate("/dashboard/outgoing");
    }
    
    setSubmitting(false);
  };

  if (loading || institutionLoading) {
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/outgoing")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Buat Surat Keluar</h1>
                <p className="text-muted-foreground">Buat surat keluar baru untuk instansi Anda</p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 max-w-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nomor Surat</label>
                  <Input
                    placeholder="Kosongkan untuk generate otomatis"
                    value={formData.letter_number}
                    onChange={(e) => setFormData({ ...formData, letter_number: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Penerima *</label>
                  <Input
                    required
                    placeholder="Nama penerima surat"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Perihal *</label>
                  <Input
                    required
                    placeholder="Perihal surat"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Isi Surat *</label>
                  <Textarea
                    required
                    placeholder="Tulis isi surat di sini..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/dashboard/outgoing")}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={submitting} className="gap-2">
                    <Send className="w-4 h-4" />
                    {submitting ? "Menyimpan..." : "Simpan Surat"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NewOutgoingLetter;
