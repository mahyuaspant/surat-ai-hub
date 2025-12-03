import { useState } from "react";
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

// Mock data
const letters = [
  {
    id: "SM-2024-001",
    sender: "PT. Maju Bersama",
    subject: "Permohonan Izin Kegiatan",
    date: "2024-01-15",
    status: "pending",
  },
  {
    id: "SM-2024-002",
    sender: "Dinas Pendidikan",
    subject: "Undangan Rapat Koordinasi",
    date: "2024-01-14",
    status: "review",
  },
  {
    id: "SM-2024-003",
    sender: "CV. Karya Mandiri",
    subject: "Pengajuan Kerjasama",
    date: "2024-01-13",
    status: "progress",
  },
  {
    id: "SM-2024-004",
    sender: "Kementerian PUPR",
    subject: "Laporan Bulanan",
    date: "2024-01-12",
    status: "complete",
  },
  {
    id: "SM-2024-005",
    sender: "Bank Indonesia",
    subject: "Pemberitahuan Regulasi",
    date: "2024-01-11",
    status: "archive",
  },
];

const statusConfig = {
  pending: { label: "Menunggu", class: "status-pending" },
  review: { label: "Dalam Review", class: "status-review" },
  progress: { label: "Diproses", class: "status-progress" },
  complete: { label: "Selesai", class: "status-complete" },
  archive: { label: "Arsip", class: "status-archive" },
};

export function IncomingLettersTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-up" style={{ animationDelay: "0.2s" }}>
      {/* Header */}
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

      {/* Table */}
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
              <TableHead>Pengirim</TableHead>
              <TableHead className="hidden md:table-cell">Perihal</TableHead>
              <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {letters.map((letter) => (
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
                <TableCell className="font-medium text-foreground">{letter.id}</TableCell>
                <TableCell>{letter.sender}</TableCell>
                <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                  {letter.subject}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {new Date(letter.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <span className={`status-badge ${statusConfig[letter.status as keyof typeof statusConfig].class}`}>
                    {statusConfig[letter.status as keyof typeof statusConfig].label}
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
                      <DropdownMenuItem className="gap-2">
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan 1-5 dari 1,234 surat
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="w-8 bg-primary text-primary-foreground hover:bg-primary/90">
            1
          </Button>
          <Button variant="outline" size="sm" className="w-8">2</Button>
          <Button variant="outline" size="sm" className="w-8">3</Button>
          <Button variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
