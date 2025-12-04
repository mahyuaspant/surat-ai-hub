import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SignatureWorkflow } from "@/components/signature/SignatureWorkflow";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LetterData {
  id: string;
  letterNumber: string;
  subject: string;
  recipient: string;
  content: string;
  createdAt: string;
  status: string;
}

export default function SignLetter() {
  const { letterId } = useParams<{ letterId: string }>();
  const navigate = useNavigate();
  
  const [letter, setLetter] = useState<LetterData | null>(null);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [letterId]);

  const fetchData = async () => {
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate("/auth");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", authUser.id)
        .maybeSingle();

      setUser({
        id: authUser.id,
        name: profile?.full_name || authUser.email || "User",
      });

      // Get letter data
      if (letterId) {
        const { data: letterData, error } = await supabase
          .from("outgoing_letters")
          .select("*")
          .eq("id", letterId)
          .maybeSingle();

        if (error) throw error;

        if (letterData) {
          setLetter({
            id: letterData.id,
            letterNumber: letterData.letter_number,
            subject: letterData.subject,
            recipient: letterData.recipient,
            content: letterData.content,
            createdAt: letterData.created_at,
            status: letterData.status,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data surat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignComplete = async (signatureData: {
    signatureImageUrl: string;
    signatureHash: string;
    documentHash: string;
    signedAt: string;
  }) => {
    if (!letter || !user) return;

    try {
      // Save signature to database
      const { error: sigError } = await supabase
        .from("digital_signatures")
        .insert({
          letter_id: letter.id,
          user_id: user.id,
          signature_image_url: signatureData.signatureImageUrl,
          signature_hash: signatureData.signatureHash,
          signed_at: signatureData.signedAt,
        });

      if (sigError) throw sigError;

      // Update letter with hash and signed status
      const { error: updateError } = await supabase
        .from("outgoing_letters")
        .update({
          document_hash: signatureData.documentHash,
          is_signed: true,
          status: "completed",
        })
        .eq("id", letter.id);

      if (updateError) throw updateError;

      toast.success("Surat berhasil ditandatangani dan disimpan");
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Gagal menyimpan tanda tangan");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Demo mode if no letter ID
  const demoLetter: LetterData = letter || {
    id: "demo-001",
    letterNumber: "OUT/2024/001",
    subject: "Permohonan Kerjasama Program CSR",
    recipient: "PT. Maju Bersama Indonesia",
    content: `Dengan hormat,

Bersama surat ini kami mengajukan permohonan kerjasama dalam program Corporate Social Responsibility (CSR) yang akan dilaksanakan pada tahun 2024.

Program ini bertujuan untuk meningkatkan kesejahteraan masyarakat di wilayah sekitar perusahaan melalui berbagai kegiatan sosial dan pendidikan.

Kami berharap dapat berdiskusi lebih lanjut mengenai bentuk kerjasama yang dapat dilakukan.

Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.

Hormat kami,
[Tanda Tangan Digital]`,
    createdAt: new Date().toISOString(),
    status: "review",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-semibold text-lg">
                Tanda Tangan Surat
              </h1>
              <p className="text-sm text-muted-foreground">
                {demoLetter.letterNumber}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <SignatureWorkflow
          letter={demoLetter}
          userId={user?.id || "demo-user"}
          userName={user?.name || "Demo User"}
          onSignComplete={handleSignComplete}
        />
      </main>
    </div>
  );
}
