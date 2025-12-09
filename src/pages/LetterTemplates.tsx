import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserInstitution } from "@/hooks/useUserInstitution";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { 
  Plus, 
  FileText, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Settings, 
  Image as ImageIcon,
  X,
  Loader2,
  Save
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface LetterTemplate {
  id: string;
  name: string;
  description: string | null;
  content: string;
  category: string | null;
  created_at: string;
}

interface LetterheadSettings {
  id?: string;
  logo_url: string | null;
  institution_name: string;
  address: string | null;
  contact: string | null;
  custom_header: string | null;
}

const LetterTemplates = () => {
  const navigate = useNavigate();
  const { institutionId, loading: institutionLoading } = useUserInstitution();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [letterhead, setLetterhead] = useState<LetterheadSettings>({
    logo_url: null,
    institution_name: "",
    address: null,
    contact: null,
    custom_header: null,
  });
  const [savingLetterhead, setSavingLetterhead] = useState(false);
  
  // Template form state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    content: "",
    category: "",
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
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
    setLoading(true);
    const { data, error } = await supabase
      .from("letter_templates")
      .select("*")
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      toast.error("Gagal memuat template");
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const fetchLetterhead = async () => {
    const { data, error } = await supabase
      .from("letterhead_settings")
      .select("*")
      .eq("institution_id", institutionId)
      .single();

    if (data) {
      setLetterhead(data);
    } else if (error && error.code !== "PGRST116") {
      console.error("Error fetching letterhead:", error);
    }
  };

  const handleSaveLetterhead = async () => {
    if (!institutionId) return;
    
    setSavingLetterhead(true);
    
    const letterheadData = {
      institution_id: institutionId,
      ...letterhead,
    };

    const { error } = letterhead.id
      ? await supabase
          .from("letterhead_settings")
          .update(letterheadData)
          .eq("id", letterhead.id)
      : await supabase
          .from("letterhead_settings")
          .insert(letterheadData);

    if (error) {
      console.error("Error saving letterhead:", error);
      toast.error("Gagal menyimpan KOP surat");
    } else {
      toast.success("KOP surat berhasil disimpan");
      fetchLetterhead();
    }
    setSavingLetterhead(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran logo maksimal 2MB");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `letterhead/${institutionId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("letters")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error("Gagal upload logo");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("letters")
      .getPublicUrl(fileName);

    setLetterhead({ ...letterhead, logo_url: urlData.publicUrl });
    toast.success("Logo berhasil diupload");
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Masukkan jenis surat yang ingin dibuat");
      return;
    }

    setGeneratingAi(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-letter", {
        body: { prompt: aiPrompt, type: "template" },
      });

      if (error) throw error;

      if (data?.content) {
        setTemplateForm({
          ...templateForm,
          content: data.content,
          name: templateForm.name || aiPrompt,
        });
        toast.success("Konten berhasil di-generate!");
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message || "Gagal generate konten");
    }
    
    setGeneratingAi(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      toast.error("Nama dan konten template wajib diisi");
      return;
    }

    setSavingTemplate(true);
    
    const templateData = {
      institution_id: institutionId,
      name: templateForm.name,
      description: templateForm.description || null,
      content: templateForm.content,
      category: templateForm.category || null,
      created_by: user?.id,
    };

    const { error } = editingTemplate
      ? await supabase
          .from("letter_templates")
          .update(templateData)
          .eq("id", editingTemplate.id)
      : await supabase
          .from("letter_templates")
          .insert(templateData);

    if (error) {
      console.error("Error saving template:", error);
      toast.error("Gagal menyimpan template");
    } else {
      toast.success("Template berhasil disimpan");
      setTemplateDialogOpen(false);
      resetTemplateForm();
      fetchTemplates();
    }
    
    setSavingTemplate(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from("letter_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus template");
    } else {
      toast.success("Template berhasil dihapus");
      fetchTemplates();
    }
  };

  const openEditTemplate = (template: LetterTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || "",
      content: template.content,
      category: template.category || "",
    });
    setTemplateDialogOpen(true);
  };

  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: "", description: "", content: "", category: "" });
    setAiPrompt("");
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Template Surat</h1>
                <p className="text-muted-foreground">Kelola KOP surat dan template untuk instansi Anda</p>
              </div>
            </div>

            <Tabs defaultValue="templates" className="space-y-6">
              <TabsList>
                <TabsTrigger value="templates" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Template
                </TabsTrigger>
                <TabsTrigger value="letterhead" className="gap-2">
                  <Settings className="w-4 h-4" />
                  KOP Surat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <div className="flex justify-end">
                  <Dialog open={templateDialogOpen} onOpenChange={(open) => {
                    setTemplateDialogOpen(open);
                    if (!open) resetTemplateForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Buat Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTemplate ? "Edit Template" : "Buat Template Baru"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        {/* AI Generation Section */}
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                          <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium text-sm">Generate dengan AI</span>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Contoh: Surat Permohonan Ijin Tempat"
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                            />
                            <Button 
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
                          <label className="text-sm font-medium">Nama Template *</label>
                          <Input
                            placeholder="Nama template surat"
                            value={templateForm.name}
                            onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Deskripsi</label>
                          <Input
                            placeholder="Deskripsi singkat template"
                            value={templateForm.description}
                            onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Kategori</label>
                          <Input
                            placeholder="Contoh: Perizinan, Undangan, dll"
                            value={templateForm.category}
                            onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Konten Template *</label>
                          <Textarea
                            placeholder="Isi konten template surat..."
                            value={templateForm.content}
                            onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                            rows={12}
                          />
                          <p className="text-xs text-muted-foreground">
                            Gunakan placeholder seperti [NAMA], [TANGGAL], [ALAMAT] untuk bagian yang perlu diisi
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                            Batal
                          </Button>
                          <Button onClick={handleSaveTemplate} disabled={savingTemplate} className="gap-2">
                            <Save className="w-4 h-4" />
                            {savingTemplate ? "Menyimpan..." : "Simpan Template"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Template List */}
                {templates.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Belum ada template</h3>
                    <p className="text-muted-foreground mb-4">Buat template surat pertama Anda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div 
                        key={template.id} 
                        className="bg-card rounded-xl border border-border p-4 space-y-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">{template.name}</h3>
                            {template.category && (
                              <span className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full mt-1">
                                {template.category}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditTemplate(template)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-3 font-mono bg-muted/50 p-2 rounded">
                          {template.content.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="letterhead" className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 max-w-2xl space-y-6">
                  <div className="flex items-center gap-4">
                    <Settings className="w-6 h-6 text-primary" />
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Pengaturan KOP Surat</h2>
                      <p className="text-sm text-muted-foreground">Atur tampilan header untuk semua surat keluar</p>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Logo Instansi</label>
                    <div className="flex items-center gap-4">
                      {letterhead.logo_url ? (
                        <div className="relative">
                          <img 
                            src={letterhead.logo_url} 
                            alt="Logo" 
                            className="w-20 h-20 object-contain border border-border rounded-lg"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full"
                            onClick={() => setLetterhead({ ...letterhead, logo_url: null })}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Logo akan ditampilkan di sebelah kiri teks KOP. Maksimal 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Instansi *</label>
                    <Input
                      placeholder="Nama instansi"
                      value={letterhead.institution_name}
                      onChange={(e) => setLetterhead({ ...letterhead, institution_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alamat</label>
                    <Textarea
                      placeholder="Alamat lengkap instansi"
                      value={letterhead.address || ""}
                      onChange={(e) => setLetterhead({ ...letterhead, address: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kontak</label>
                    <Input
                      placeholder="Telepon, Email, Website"
                      value={letterhead.contact || ""}
                      onChange={(e) => setLetterhead({ ...letterhead, contact: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Teks Tambahan</label>
                    <Textarea
                      placeholder="Teks tambahan untuk KOP surat (opsional)"
                      value={letterhead.custom_header || ""}
                      onChange={(e) => setLetterhead({ ...letterhead, custom_header: e.target.value })}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Teks tambahan yang akan ditampilkan di bawah informasi kontak
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preview KOP</label>
                    <div className="border border-border rounded-lg p-6 bg-white">
                      <div className="flex items-start gap-4">
                        {letterhead.logo_url && (
                          <img 
                            src={letterhead.logo_url} 
                            alt="Logo" 
                            className="w-16 h-16 object-contain"
                          />
                        )}
                        <div className="flex-1 text-center">
                          <h3 className="text-lg font-bold text-gray-900 uppercase">
                            {letterhead.institution_name || "NAMA INSTANSI"}
                          </h3>
                          {letterhead.address && (
                            <p className="text-sm text-gray-600">{letterhead.address}</p>
                          )}
                          {letterhead.contact && (
                            <p className="text-sm text-gray-600">{letterhead.contact}</p>
                          )}
                          {letterhead.custom_header && (
                            <p className="text-sm text-gray-500 mt-1">{letterhead.custom_header}</p>
                          )}
                        </div>
                      </div>
                      <div className="border-b-2 border-gray-900 mt-4" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveLetterhead} disabled={savingLetterhead} className="gap-2">
                      <Save className="w-4 h-4" />
                      {savingLetterhead ? "Menyimpan..." : "Simpan KOP Surat"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LetterTemplates;
