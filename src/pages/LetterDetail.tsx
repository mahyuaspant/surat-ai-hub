import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useUserInstitution } from "@/hooks/useUserInstitution";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  FileText,
  Download,
  PenTool,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface LetterData {
  id: string;
  letter_number: string;
  subject: string;
  recipient: string;
  content: string;
  status: string;
  is_signed: boolean;
  created_at: string;
  created_by: string | null;
  document_hash: string | null;
  qr_code_url: string | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  position: string | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  review: { label: "Menunggu Persetujuan", className: "bg-amber-500/10 text-amber-600" },
  in_progress: { label: "Diproses", className: "bg-blue-500/10 text-blue-600" },
  disposition: { label: "Disposisi", className: "bg-purple-500/10 text-purple-600" },
  completed: { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600" },
};

const LetterDetail = () => {
  const { letterId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [letter, setLetter] = useState<LetterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { institutionId } = useUserInstitution();

  const [dispositionForm, setDispositionForm] = useState({
    to_user_id: "",
    instructions: "",
    deadline: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  useEffect(() => {
    if (letterId) {
      fetchLetter();
    }
  }, [letterId]);

  useEffect(() => {
    if (institutionId) {
      fetchUsers();
    }
  }, [institutionId]);

  const fetchLetter = async () => {
    const { data, error } = await supabase
      .from("outgoing_letters")
      .select("*")
      .eq("id", letterId)
      .single();

    if (error) {
      console.error("Error fetching letter:", error);
      toast.error("Gagal memuat data surat");
    } else {
      setLetter(data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, position")
      .eq("institution_id", institutionId);

    if (!error && data) {
      setUsers(data);
    }
  };

  const handleSendDisposition = async () => {
    if (!dispositionForm.to_user_id || !dispositionForm.instructions) {
      toast.error("Pilih penerima dan isi instruksi");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("dispositions").insert({
      letter_id: letterId,
      from_user_id: user?.id,
      to_user_id: dispositionForm.to_user_id,
      instructions: dispositionForm.instructions,
      deadline: dispositionForm.deadline || null,
    });

    if (error) {
      console.error("Error creating disposition:", error);
      toast.error("Gagal mengirim disposisi");
    } else {
      // Update letter status to disposition
      await supabase
        .from("outgoing_letters")
        .update({ status: "disposition" })
        .eq("id", letterId);

      toast.success("Disposisi berhasil dikirim");
      setDialogOpen(false);
      fetchLetter();
    }

    setSubmitting(false);
  };

  const handleDownload = () => {
    // Generate downloadable content
    const content = `
SURAT KELUAR
============

Nomor Surat: ${letter?.letter_number}
Tanggal: ${letter?.created_at ? format(new Date(letter.created_at), "dd MMMM yyyy", { locale: id }) : "-"}
Penerima: ${letter?.recipient}
Perihal: ${letter?.subject}

Isi Surat:
${letter?.content}

${letter?.document_hash ? `\nHash Dokumen: ${letter.document_hash}` : ""}
${letter?.is_signed ? "\n[SURAT INI TELAH DITANDATANGANI SECARA DIGITAL]" : ""}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${letter?.letter_number?.replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Surat berhasil diunduh");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!letter) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-muted/30">
          <DashboardSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold text-foreground">Surat tidak ditemukan</h2>
              <Button className="mt-4" onClick={() => navigate("/dashboard/outgoing")}>
                Kembali ke Daftar Surat
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const status = statusConfig[letter.status] || statusConfig.draft;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-h-screen">
          <DashboardHeader user={user} />
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/outgoing")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {letter.letter_number}
                  </h1>
                  <p className="text-muted-foreground">{letter.subject}</p>
                </div>
              </div>
              <Badge className={status.className}>{status.label}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Letter Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Isi Surat</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{letter.content}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {letter.status === "review" && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Send className="w-4 h-4" />
                          Kirim Disposisi
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Kirim Disposisi</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Kepada *</label>
                            <Select
                              value={dispositionForm.to_user_id}
                              onValueChange={(value) =>
                                setDispositionForm({ ...dispositionForm, to_user_id: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih penerima disposisi" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((u) => (
                                  <SelectItem key={u.user_id} value={u.user_id}>
                                    {u.full_name} {u.position ? `- ${u.position}` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Instruksi *</label>
                            <Textarea
                              placeholder="Instruksi disposisi..."
                              value={dispositionForm.instructions}
                              onChange={(e) =>
                                setDispositionForm({ ...dispositionForm, instructions: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Deadline</label>
                            <input
                              type="datetime-local"
                              className="w-full px-3 py-2 border border-border rounded-md bg-background"
                              value={dispositionForm.deadline}
                              onChange={(e) =>
                                setDispositionForm({ ...dispositionForm, deadline: e.target.value })
                              }
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                              Batal
                            </Button>
                            <Button onClick={handleSendDisposition} disabled={submitting}>
                              {submitting ? "Mengirim..." : "Kirim Disposisi"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {(letter.status === "disposition" || letter.status === "in_progress") && !letter.is_signed && (
                    <Button className="gap-2" onClick={() => navigate(`/sign/${letter.id}`)}>
                      <PenTool className="w-4 h-4" />
                      Tanda Tangani
                    </Button>
                  )}

                  {letter.is_signed && (
                    <Button className="gap-2" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                      Download Surat
                    </Button>
                  )}
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Informasi Surat</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Penerima</dt>
                      <dd className="font-medium text-foreground">{letter.recipient}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Tanggal Dibuat</dt>
                      <dd className="font-medium text-foreground">
                        {format(new Date(letter.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Status Tanda Tangan</dt>
                      <dd className="flex items-center gap-2">
                        {letter.is_signed ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-600">Sudah ditandatangani</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-amber-600">Belum ditandatangani</span>
                          </>
                        )}
                      </dd>
                    </div>
                    {letter.document_hash && (
                      <div>
                        <dt className="text-muted-foreground">Hash Dokumen</dt>
                        <dd className="font-mono text-xs text-foreground break-all">
                          {letter.document_hash.substring(0, 32)}...
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Timeline */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Surat Dibuat</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(letter.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                        </p>
                      </div>
                    </div>
                    {letter.status !== "review" && letter.status !== "draft" && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Disposisi Dikirim</p>
                          <p className="text-xs text-muted-foreground">Menunggu penandatanganan</p>
                        </div>
                      </div>
                    )}
                    {letter.is_signed && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Ditandatangani</p>
                          <p className="text-xs text-muted-foreground">Surat sudah final</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LetterDetail;