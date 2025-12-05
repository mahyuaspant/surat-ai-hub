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
  Send, 
  Sparkles, 
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useUserInstitution } from "@/hooks/useUserInstitution";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type LetterStatus = Database["public"]["Enums"]["letter_status"];

interface IncomingLetter {
  id: string;
  ticket_number: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  created_at: string | null;
  status: LetterStatus | null;
}

const statusConfig: Record<LetterStatus, { label: string; class: string }> = {
  received: { label: "Diterima", class: "status-pending" },
  review: { label: "Review", class: "status-review" },
  disposition: { label: "Disposisi", class: "status-progress" },
  in_progress: { label: "Diproses", class: "status-progress" },
  completed: { label: "Selesai", class: "status-complete" },
  archived: { label: "Arsip", class: "status-archive" },
};

export function IncomingLettersTable() {
  const [letters, setLetters] = useState<IncomingLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dispositionDialog, setDispositionDialog] = useState<IncomingLetter | null>(null);
  const [dispositionData, setDispositionData] = useState({ instructions: "", deadline: "" });
  const [submitting, setSubmitting] = useState(false);
  const { institutionId } = useUserInstitution();

  const fetchLetters = async () => {
    if (!institutionId) {
      setLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from("incoming_letters")
      .select("id, ticket_number, sender_name, sender_email, subject, created_at, status")
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat surat masuk");
      console.error(error);
    } else {
      setLetters(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLetters();
  }, [institutionId]);

  const handleCreateDisposition = async () => {
    if (!dispositionDialog || !dispositionData.instructions.trim()) return;
    
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("dispositions").insert({
      letter_id: dispositionDialog.id,
      from_user_id: user.id,
      to_user_id: user.id,
      instructions: dispositionData.instructions,
      deadline: dispositionData.deadline || null,
    });

    if (error) {
      toast.error("Gagal membuat disposisi");
      console.error(error);
    } else {
      toast.success("Disposisi berhasil dibuat");
      await supabase
        .from("incoming_letters")
        .update({ status: "disposition" })
        .eq("id", dispositionDialog.id);
      
      setDispositionDialog(null);
      setDispositionData({ instructions: "", deadline: "" });
      fetchLetters();
    }
    setSubmitting(false);
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
            <h2 className="text-lg font-display font-semibold text-foreground">Surat Masuk Terbaru</h2>
            <p className="text-sm text-muted-foreground">Kelola surat masuk instansi Anda</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-input"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(letters.map(l => l.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>No. Tiket</TableHead>
                <TableHead>Pengirim</TableHead>
                <TableHead className="hidden md:table-cell">Perihal</TableHead>
                <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {letters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Belum ada surat masuk
                  </TableCell>
                </TableRow>
              ) : (
                letters.map((letter) => (
                  <TableRow key={letter.id} className="group">
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="rounded border-input"
                        checked={selectedRows.includes(letter.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows([...selectedRows, letter.id]);
                          } else {
                            setSelectedRows(selectedRows.filter(id => id !== letter.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{letter.ticket_number}</TableCell>
                    <TableCell>{letter.sender_name}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {letter.subject}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {letter.created_at && new Date(letter.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <span className={`status-badge ${statusConfig[letter.status || "received"].class}`}>
                        {statusConfig[letter.status || "received"].label}
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
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => setDispositionDialog(letter)}>
                            <Send className="w-4 h-4" />
                            Disposisi
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Sparkles className="w-4 h-4" />
                            Ringkas dengan AI
                          </DropdownMenuItem>
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
            Menampilkan {letters.length} surat
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

      <Dialog open={!!dispositionDialog} onOpenChange={() => setDispositionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Disposisi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Surat:</p>
              <p className="text-foreground font-medium">{dispositionDialog?.subject}</p>
              <p className="text-sm text-muted-foreground">dari {dispositionDialog?.sender_name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Instruksi *</label>
              <Textarea 
                value={dispositionData.instructions}
                onChange={(e) => setDispositionData({ ...dispositionData, instructions: e.target.value })}
                placeholder="Tulis instruksi disposisi..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Deadline</label>
              <Input 
                type="date"
                value={dispositionData.deadline}
                onChange={(e) => setDispositionData({ ...dispositionData, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispositionDialog(null)}>
              Batal
            </Button>
            <Button onClick={handleCreateDisposition} disabled={submitting || !dispositionData.instructions.trim()}>
              {submitting ? "Membuat..." : "Buat Disposisi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
