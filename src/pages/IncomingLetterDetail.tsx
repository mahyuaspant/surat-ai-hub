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
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  User as UserIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Database } from "@/integrations/supabase/types";

type LetterStatus = Database["public"]["Enums"]["letter_status"];

interface IncomingLetterData {
  id: string;
  ticket_number: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  subject: string;
  content: string | null;
  status: LetterStatus | null;
  file_url: string | null;
  ai_summary: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  position: string | null;
}

interface Disposition {
  id: string;
  instructions: string;
  status: string | null;
  response: string | null;
  deadline: string | null;
  created_at: string;
  from_user: { full_name: string; position: string | null } | null;
  to_user: { full_name: string; position: string | null } | null;
}

const statusConfig: Record<LetterStatus, { label: string; className: string }> = {
  received: { label: "Diterima", className: "bg-amber-500/10 text-amber-600" },
  review: { label: "Review", className: "bg-blue-500/10 text-blue-600" },
  disposition: { label: "Disposisi", className: "bg-purple-500/10 text-purple-600" },
  in_progress: { label: "Diproses", className: "bg-cyan-500/10 text-cyan-600" },
  completed: { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600" },
  archived: { label: "Arsip", className: "bg-muted text-muted-foreground" },
};

const IncomingLetterDetail = () => {
  const { letterId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [letter, setLetter] = useState<IncomingLetterData | null>(null);
  const [dispositions, setDispositions] = useState<Disposition[]>([]);
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
      fetchDispositions();
    }
  }, [letterId]);

  useEffect(() => {
    if (institutionId) {
      fetchUsers();
    }
  }, [institutionId]);

  const fetchLetter = async () => {
    const { data, error } = await supabase
      .from("incoming_letters")
      .select("*")
      .eq("id", letterId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching letter:", error);
      toast.error("Gagal memuat data surat");
    } else {
      setLetter(data);
    }
    setLoading(false);
  };

  const fetchDispositions = async () => {
    const { data, error } = await supabase
      .from("dispositions")
      .select(`
        id,
        instructions,
        status,
        response,
        deadline,
        created_at,
        from_user_id,
        to_user_id
      `)
      .eq("letter_id", letterId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch user profiles for each disposition
      const enrichedDispositions = await Promise.all(
        data.map(async (d) => {
          const [fromRes, toRes] = await Promise.all([
            supabase.from("profiles").select("full_name, position").eq("user_id", d.from_user_id).maybeSingle(),
            supabase.from("profiles").select("full_name, position").eq("user_id", d.to_user_id).maybeSingle(),
          ]);
          return {
            ...d,
            from_user: fromRes.data,
            to_user: toRes.data,
          };
        })
      );
      setDispositions(enrichedDispositions);
    }
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
      await supabase
        .from("incoming_letters")
        .update({ status: "disposition" })
        .eq("id", letterId);

      toast.success("Disposisi berhasil dikirim");
      setDialogOpen(false);
      setDispositionForm({ to_user_id: "", instructions: "", deadline: "" });
      fetchLetter();
      fetchDispositions();
    }

    setSubmitting(false);
  };

  const handleUpdateStatus = async (newStatus: LetterStatus) => {
    const { error } = await supabase
      .from("incoming_letters")
      .update({ status: newStatus })
      .eq("id", letterId);

    if (error) {
      toast.error("Gagal mengubah status");
    } else {
      toast.success("Status berhasil diubah");
      fetchLetter();
    }
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
              <Button className="mt-4" onClick={() => navigate("/dashboard/incoming")}>
                Kembali ke Daftar Surat
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const status = statusConfig[letter.status || "received"];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-h-screen">
          <DashboardHeader user={user} />
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/incoming")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {letter.ticket_number}
                  </h1>
                  <p className="text-muted-foreground">{letter.subject}</p>
                </div>
              </div>
              <Badge className={status.className}>{status.label}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Letter Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sender Info */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Informasi Pengirim
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <dt className="text-muted-foreground">Nama</dt>
                        <dd className="font-medium text-foreground">{letter.sender_name}</dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium text-foreground">{letter.sender_email}</dd>
                      </div>
                    </div>
                    {letter.sender_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <dt className="text-muted-foreground">Telepon</dt>
                          <dd className="font-medium text-foreground">{letter.sender_phone}</dd>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <dt className="text-muted-foreground">Tanggal Masuk</dt>
                        <dd className="font-medium text-foreground">
                          {format(new Date(letter.created_at), "dd MMMM yyyy, HH:mm", { locale: localeId })}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Content */}
                {letter.content && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-4">Isi Surat</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{letter.content}</p>
                  </div>
                )}

                {/* AI Summary */}
                {letter.ai_summary && (
                  <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="text-primary">✨</span>
                      Ringkasan AI
                    </h3>
                    <p className="text-muted-foreground">{letter.ai_summary}</p>
                  </div>
                )}

                {/* File Attachment */}
                {letter.file_url && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-4">Lampiran</h3>
                    <a
                      href={letter.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat Lampiran
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Dispositions History */}
                {dispositions.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-4">Riwayat Disposisi</h3>
                    <div className="space-y-4">
                      {dispositions.map((d) => (
                        <div key={d.id} className="border-l-2 border-primary/30 pl-4 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm">
                              <span className="font-medium text-foreground">
                                {d.from_user?.full_name || "Unknown"}
                              </span>
                              <span className="text-muted-foreground"> → </span>
                              <span className="font-medium text-foreground">
                                {d.to_user?.full_name || "Unknown"}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {d.status === "completed" ? "Selesai" : d.status === "pending" ? "Pending" : d.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{d.instructions}</p>
                          {d.deadline && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Deadline: {format(new Date(d.deadline), "dd MMM yyyy", { locale: localeId })}
                            </p>
                          )}
                          {d.response && (
                            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Respons:</p>
                              <p className="text-sm text-foreground">{d.response}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(d.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
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

                  {letter.status !== "completed" && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleUpdateStatus("completed")}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Tandai Selesai
                    </Button>
                  )}
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Status Surat</h3>
                  <Select
                    value={letter.status || "received"}
                    onValueChange={(value) => handleUpdateStatus(value as LetterStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Diterima</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="disposition">Disposisi</SelectItem>
                      <SelectItem value="in_progress">Diproses</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="archived">Arsip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timeline */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Surat Diterima</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(letter.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                        </p>
                      </div>
                    </div>

                    {dispositions.map((d, idx) => (
                      <div key={d.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Disposisi ke {d.to_user?.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(d.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {letter.status === "completed" && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Selesai</p>
                          <p className="text-xs text-muted-foreground">Surat telah diproses</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Statistik</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Disposisi</dt>
                      <dd className="font-medium text-foreground">{dispositions.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Disposisi Pending</dt>
                      <dd className="font-medium text-foreground">
                        {dispositions.filter((d) => d.status === "pending").length}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Disposisi Selesai</dt>
                      <dd className="font-medium text-foreground">
                        {dispositions.filter((d) => d.status === "completed").length}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default IncomingLetterDetail;