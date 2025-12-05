import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Eye, 
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Disposition {
  id: string;
  instructions: string;
  status: string | null;
  deadline: string | null;
  created_at: string | null;
  response: string | null;
  letter_id: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Menunggu", class: "status-pending" },
  in_progress: { label: "Dikerjakan", class: "status-progress" },
  completed: { label: "Selesai", class: "status-complete" },
};

export function DispositionsTable() {
  const [dispositions, setDispositions] = useState<Disposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisposition, setSelectedDisposition] = useState<Disposition | null>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDispositions();
  }, []);

  const fetchDispositions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("dispositions")
      .select("*")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat disposisi");
      console.error(error);
    } else {
      setDispositions(data || []);
    }
    setLoading(false);
  };

  const handleRespond = async () => {
    if (!selectedDisposition || !response.trim()) return;
    
    setSubmitting(true);
    const { error } = await supabase
      .from("dispositions")
      .update({ 
        response: response.trim(),
        status: "completed"
      })
      .eq("id", selectedDisposition.id);

    if (error) {
      toast.error("Gagal mengirim tanggapan");
    } else {
      toast.success("Tanggapan berhasil dikirim");
      setSelectedDisposition(null);
      setResponse("");
      fetchDispositions();
    }
    setSubmitting(false);
  };

  const handleMarkInProgress = async (id: string) => {
    const { error } = await supabase
      .from("dispositions")
      .update({ status: "in_progress" })
      .eq("id", id);

    if (error) {
      toast.error("Gagal mengupdate status");
    } else {
      toast.success("Status diperbarui");
      fetchDispositions();
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Disposisi</h2>
            <p className="text-sm text-muted-foreground">Tugas disposisi yang perlu ditindaklanjuti</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Instruksi</TableHead>
                <TableHead className="hidden md:table-cell">Deadline</TableHead>
                <TableHead className="hidden sm:table-cell">Dibuat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Tidak ada disposisi
                  </TableCell>
                </TableRow>
              ) : (
                dispositions.map((disposition) => (
                  <TableRow key={disposition.id} className="group">
                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-foreground">{disposition.instructions}</p>
                      {disposition.response && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Tanggapan: {disposition.response}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {disposition.deadline ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm">
                            {new Date(disposition.deadline).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {disposition.created_at && new Date(disposition.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <span className={`status-badge ${statusConfig[disposition.status || "pending"].class}`}>
                        {statusConfig[disposition.status || "pending"].label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" />
                            Lihat Surat
                          </DropdownMenuItem>
                          {disposition.status === "pending" && (
                            <DropdownMenuItem className="gap-2" onClick={() => handleMarkInProgress(disposition.id)}>
                              <Clock className="w-4 h-4" />
                              Tandai Dikerjakan
                            </DropdownMenuItem>
                          )}
                          {disposition.status !== "completed" && (
                            <DropdownMenuItem className="gap-2" onClick={() => setSelectedDisposition(disposition)}>
                              <MessageSquare className="w-4 h-4" />
                              Beri Tanggapan
                            </DropdownMenuItem>
                          )}
                          {disposition.status === "in_progress" && (
                            <DropdownMenuItem className="gap-2 text-green-600" onClick={() => {
                              setSelectedDisposition(disposition);
                            }}>
                              <CheckCircle2 className="w-4 h-4" />
                              Selesaikan
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {dispositions.length} disposisi
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="w-8 bg-primary text-primary-foreground hover:bg-primary/90">
              1
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedDisposition} onOpenChange={() => setSelectedDisposition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tanggapan Disposisi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Instruksi:</p>
              <p className="text-foreground">{selectedDisposition?.instructions}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tanggapan Anda</label>
              <Textarea 
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Tulis tanggapan atau hasil tindak lanjut..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDisposition(null)}>
              Batal
            </Button>
            <Button onClick={handleRespond} disabled={submitting || !response.trim()}>
              {submitting ? "Mengirim..." : "Kirim Tanggapan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
