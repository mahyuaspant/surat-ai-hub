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
  PenTool, 
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useUserInstitution } from "@/hooks/useUserInstitution";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type LetterStatus = Database["public"]["Enums"]["letter_status"];

const statusConfig: Record<LetterStatus, { label: string; class: string }> = {
  received: { label: "Diterima", class: "status-pending" },
  review: { label: "Review", class: "status-review" },
  disposition: { label: "Disposisi", class: "status-progress" },
  in_progress: { label: "Diproses", class: "status-progress" },
  completed: { label: "Selesai", class: "status-complete" },
  archived: { label: "Arsip", class: "status-archive" },
};

interface OutgoingLetter {
  id: string;
  letter_number: string;
  recipient: string;
  subject: string;
  created_at: string | null;
  status: LetterStatus | null;
  is_signed: boolean | null;
}

export function OutgoingLettersTable() {
  const [letters, setLetters] = useState<OutgoingLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { institutionId } = useUserInstitution();
  const navigate = useNavigate();

  useEffect(() => {
    if (!institutionId) return;
    
    const fetchLetters = async () => {
      const { data, error } = await supabase
        .from("outgoing_letters")
        .select("id, letter_number, recipient, subject, created_at, status, is_signed")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Gagal memuat surat keluar");
        console.error(error);
      } else {
        setLetters(data || []);
      }
      setLoading(false);
    };

    fetchLetters();
  }, [institutionId]);

  const handleSign = (letterId: string) => {
    navigate(`/sign/${letterId}`);
  };

  const handleViewDetail = (letterId: string) => {
    navigate(`/dashboard/letter/${letterId}`);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Surat Keluar</h2>
          <p className="text-sm text-muted-foreground">Kelola surat keluar instansi Anda</p>
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
          <Button size="sm" className="gap-2" onClick={() => navigate("/dashboard/outgoing/new")}>
            <Plus className="w-4 h-4" />
            Buat Surat
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
              <TableHead>No. Surat</TableHead>
              <TableHead>Penerima</TableHead>
              <TableHead className="hidden md:table-cell">Perihal</TableHead>
              <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>TTD</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {letters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Belum ada surat keluar
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
                  <TableCell className="font-medium text-foreground">{letter.letter_number}</TableCell>
                  <TableCell>{letter.recipient}</TableCell>
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
                    <span className={`status-badge ${statusConfig[letter.status || "review"].class}`}>
                      {statusConfig[letter.status || "review"].label}
                    </span>
                  </TableCell>
                  <TableCell>
                    {letter.is_signed ? (
                      <FileCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Belum</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => handleViewDetail(letter.id)}>
                          <Eye className="w-4 h-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        {!letter.is_signed && (
                          <DropdownMenuItem className="gap-2" onClick={() => handleSign(letter.id)}>
                            <PenTool className="w-4 h-4" />
                            Tanda Tangani
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
  );
}
