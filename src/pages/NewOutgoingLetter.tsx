import { useState, useEffect, useRef } from "react";
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
import { ArrowLeft, Send, Upload, X, FileText, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface LetterTemplate {
  id: string;
  name: string;
  content: string;
  category: string | null;
}

interface LetterheadSettings {
  logo_url: string | null;
  institution_name: string;
  address: string | null;
  contact: string | null;
  custom_header: string | null;
}

const NewOutgoingLetter = () => {
  const navigate = useNavigate();
  const { institutionId, loading: institutionLoading } = useUserInstitution();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Templates and AI
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [letterhead, setLetterhead] = useState<LetterheadSettings | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  
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

  useEffect(() => {
    if (institutionId) {
      fetchTemplates();
      fetchLetterhead();
    }
  }, [institutionId]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("letter_templates")
      .select("id, name, content, category")
      .eq("institution_id", institutionId)
      .order("name");
    
    if (data) setTemplates(data);
  };

  const fetchLetterhead = async () => {
    const { data } = await supabase
      .from("letterhead_settings")
      .select("*")
      .eq("institution_id", institutionId)
      .single();
    
    if (data) setLetterhead(data);
  };

  const generateLetterNumber = () => {
    const date = new Date();
    const num = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `SK-${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${num}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB");
        return;
      }
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Format file harus PDF atau DOC/DOCX");
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!file || !user) return null;
    
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${institutionId}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from("letters")
      .upload(fileName, file);
    
    setUploading(false);
    
    if (error) {
      console.error("Upload error:", error);
      toast.error("Gagal upload file");
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from("letters")
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const handleSelectTemplate = (template: LetterTemplate) => {
    setFormData({
      ...formData,
      content: template.content,
      subject: formData.subject || template.name,
    });
    toast.success(`Template "${template.name}" diterapkan`);
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Masukkan jenis surat yang ingin dibuat");
      return;
    }

    setGeneratingAi(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-letter", {
        body: { prompt: aiPrompt, type: "letter" },
      });

      if (error) throw error;

      if (data?.content) {
        setFormData({
          ...formData,
          content: data.content,
          subject: formData.subject || aiPrompt,
        });
        setAiPrompt("");
        toast.success("Konten surat berhasil di-generate!");
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message || "Gagal generate konten");
    }
    
    setGeneratingAi(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!institutionId) {
      toast.error("Anda belum terdaftar di instansi manapun");
      return;
    }

    setSubmitting(true);
    
    let fileUrl = null;
    if (file) {
      fileUrl = await uploadFile();
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("outgoing_letters").insert({
      letter_number: formData.letter_number || generateLetterNumber(),
      recipient: formData.recipient,
      subject: formData.subject,
      content: formData.content,
      institution_id: institutionId,
      created_by: user?.id,
      status: "review",
      file_url: fileUrl,
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Template & AI Section */}
                  <div className="flex flex-wrap gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <FileText className="w-4 h-4" />
                          Pilih Template
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64">
                        {templates.length === 0 ? (
                          <DropdownMenuItem disabled>
                            Belum ada template
                          </DropdownMenuItem>
                        ) : (
                          templates.map((template) => (
                            <DropdownMenuItem 
                              key={template.id}
                              onClick={() => handleSelectTemplate(template)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{template.name}</span>
                                {template.category && (
                                  <span className="text-xs text-muted-foreground">{template.category}</span>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/dashboard/templates")}>
                          <span className="text-primary">Kelola Template...</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* AI Generation */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-medium text-sm">Generate dengan AI</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Contoh: Surat Permohonan Ijin Kegiatan"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), generateWithAI())}
                      />
                      <Button 
                        type="button"
                        onClick={generateWithAI} 
                        disabled={generatingAi}
                        variant="secondary"
                      >
                        {generatingAi ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

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
                      rows={12}
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Lampiran (Opsional)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {!file ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                      >
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Klik untuk upload file PDF atau DOC
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maksimal 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                        <FileText className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/dashboard/outgoing")}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting || uploading} className="gap-2">
                      <Send className="w-4 h-4" />
                      {submitting || uploading ? "Menyimpan..." : "Simpan Surat"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Preview Panel */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Preview Surat</h3>
                <div className="bg-white rounded-lg border border-border p-6 text-sm">
                  {/* Letterhead Preview */}
                  {letterhead && (
                    <div className="mb-4 pb-4 border-b-2 border-gray-900">
                      <div className="flex items-start gap-3">
                        {letterhead.logo_url && (
                          <img 
                            src={letterhead.logo_url} 
                            alt="Logo" 
                            className="w-12 h-12 object-contain"
                          />
                        )}
                        <div className="flex-1 text-center">
                          <h4 className="font-bold text-gray-900 uppercase text-sm">
                            {letterhead.institution_name}
                          </h4>
                          {letterhead.address && (
                            <p className="text-xs text-gray-600">{letterhead.address}</p>
                          )}
                          {letterhead.contact && (
                            <p className="text-xs text-gray-600">{letterhead.contact}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Letter Content Preview */}
                  <div className="space-y-2 text-gray-700">
                    <p className="text-right text-xs">
                      {new Date().toLocaleDateString("id-ID", { 
                        day: "numeric", 
                        month: "long", 
                        year: "numeric" 
                      })}
                    </p>
                    {formData.letter_number && (
                      <p className="text-xs">No: {formData.letter_number}</p>
                    )}
                    {formData.recipient && (
                      <div className="text-xs">
                        <p>Kepada Yth.</p>
                        <p className="font-medium">{formData.recipient}</p>
                      </div>
                    )}
                    {formData.subject && (
                      <p className="text-xs mt-2">
                        <span className="font-medium">Perihal:</span> {formData.subject}
                      </p>
                    )}
                    {formData.content && (
                      <div className="mt-4 text-xs whitespace-pre-wrap leading-relaxed">
                        {formData.content.substring(0, 500)}
                        {formData.content.length > 500 && "..."}
                      </div>
                    )}
                  </div>
                </div>
                
                {!letterhead && (
                  <p className="text-xs text-muted-foreground text-center">
                    <a href="/dashboard/templates" className="text-primary hover:underline">
                      Atur KOP Surat
                    </a> untuk menampilkan header
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NewOutgoingLetter;
