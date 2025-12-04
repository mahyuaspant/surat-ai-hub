import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  FileText, 
  Calendar, 
  Hash,
  Building,
  User,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface LetterData {
  id: string;
  letter_number: string;
  subject: string;
  recipient: string;
  document_hash: string;
  is_signed: boolean;
  created_at: string;
  institution: {
    name: string;
    logo_url: string | null;
  } | null;
  signatures: {
    signed_at: string;
    signature_hash: string;
  }[];
}

export default function VerifyLetter() {
  const { letterId } = useParams<{ letterId: string }>();
  const [searchParams] = useSearchParams();
  const hashParam = searchParams.get("hash");

  const [letter, setLetter] = useState<LetterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyLetter();
  }, [letterId, hashParam]);

  const verifyLetter = async () => {
    if (!letterId) {
      setError("ID surat tidak valid");
      setIsLoading(false);
      return;
    }

    try {
      // Fetch letter data
      const { data, error: fetchError } = await supabase
        .from("outgoing_letters")
        .select(`
          id,
          letter_number,
          subject,
          recipient,
          document_hash,
          is_signed,
          created_at,
          institution:institutions(name, logo_url),
          signatures:digital_signatures(signed_at, signature_hash)
        `)
        .eq("id", letterId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("Surat tidak ditemukan");
        setIsLoading(false);
        return;
      }

      setLetter(data as LetterData);

      // Verify hash
      const hashValid = hashParam && data.document_hash === hashParam;
      setIsValid(hashValid && data.is_signed);

      // Log verification
      await supabase.from("letter_verifications").insert({
        letter_id: letterId,
        verification_hash: hashParam || "",
        is_valid: hashValid && data.is_signed,
      });

    } catch (err) {
      console.error("Verification error:", err);
      setError("Terjadi kesalahan saat memverifikasi surat");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Memverifikasi surat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive">Verifikasi Gagal</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-semibold text-lg">SuratKu</span>
            <span className="text-muted-foreground">| Verifikasi Surat</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Verification Status */}
        <Card className={`mb-6 ${isValid ? "border-green-500" : "border-amber-500"}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {isValid ? (
                <>
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                      Surat Terverifikasi
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Surat ini asli dan telah ditandatangani secara digital
                    </p>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Dokumen Valid
                  </Badge>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center animate-scale-in">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      Verifikasi Tidak Lengkap
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Surat ditemukan tetapi hash tidak cocok atau belum ditandatangani
                    </p>
                  </div>
                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Perlu Perhatian
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Letter Details */}
        {letter && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detail Surat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Institution */}
              {letter.institution && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Building className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-lg" />
                  <div>
                    <p className="text-sm text-muted-foreground">Instansi</p>
                    <p className="font-semibold">{letter.institution.name}</p>
                  </div>
                </div>
              )}

              {/* Letter Info */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nomor Surat</p>
                    <p className="font-medium">{letter.letter_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tanggal</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(letter.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Perihal</p>
                  <p className="font-medium">{letter.subject}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Penerima</p>
                  <p className="font-medium">{letter.recipient}</p>
                </div>
              </div>

              {/* Signature Info */}
              {letter.signatures && letter.signatures.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Informasi Tanda Tangan
                  </h4>
                  {letter.signatures.map((sig, index) => (
                    <div key={index} className="bg-muted/50 p-3 rounded-lg text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Ditandatangani:</span>
                        <span className="font-medium">
                          {new Date(sig.signed_at).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">Hash:</span>
                        <span className="font-mono text-xs break-all">
                          {sig.signature_hash}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Document Hash */}
              <div className="border-t pt-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Hash Dokumen
                  </p>
                  <p className="font-mono text-xs break-all text-muted-foreground">
                    {letter.document_hash || "Belum tersedia"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Verifikasi ini dilakukan secara real-time pada{" "}
          {new Date().toLocaleString("id-ID")}
        </p>
      </main>
    </div>
  );
}
