import { useState } from "react";
import { SignatureCanvas } from "./SignatureCanvas";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  PenTool, 
  QrCode, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  Hash
} from "lucide-react";
import { generateDocumentHash, generateSignatureHash } from "@/lib/crypto";
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

interface SignatureWorkflowProps {
  letter: LetterData;
  userId: string;
  userName: string;
  onSignComplete?: (signatureData: SignatureData) => void;
}

interface SignatureData {
  signatureImageUrl: string;
  signatureHash: string;
  documentHash: string;
  signedAt: string;
}

export function SignatureWorkflow({
  letter,
  userId,
  userName,
  onSignComplete,
}: SignatureWorkflowProps) {
  const [step, setStep] = useState<"preview" | "sign" | "complete">("preview");
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignatureSave = async (signatureImageUrl: string) => {
    setIsProcessing(true);
    
    try {
      const signedAt = new Date().toISOString();
      
      // Generate hashes
      const documentHash = await generateDocumentHash(
        letter.id,
        letter.letterNumber,
        letter.content,
        signedAt
      );
      
      const signatureHash = await generateSignatureHash(
        userId,
        letter.id,
        signatureImageUrl,
        signedAt
      );

      const data: SignatureData = {
        signatureImageUrl,
        signatureHash,
        documentHash,
        signedAt,
      };

      setSignatureData(data);
      setStep("complete");
      
      toast.success("Tanda tangan berhasil disimpan");
      onSignComplete?.(data);
    } catch (error) {
      console.error("Error processing signature:", error);
      toast.error("Gagal memproses tanda tangan");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <StepIndicator
          step={1}
          label="Preview"
          isActive={step === "preview"}
          isComplete={step === "sign" || step === "complete"}
        />
        <div className="w-12 h-0.5 bg-border" />
        <StepIndicator
          step={2}
          label="Tanda Tangan"
          isActive={step === "sign"}
          isComplete={step === "complete"}
        />
        <div className="w-12 h-0.5 bg-border" />
        <StepIndicator
          step={3}
          label="Selesai"
          isActive={step === "complete"}
          isComplete={false}
        />
      </div>

      {/* Letter Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Preview Surat Keluar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nomor Surat</p>
                <p className="font-medium">{letter.letterNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="outline">{letter.status}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tujuan</p>
                <p className="font-medium">{letter.recipient}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p className="font-medium">
                  {new Date(letter.createdAt).toLocaleDateString("id-ID", {
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
              <p className="text-sm text-muted-foreground">Isi Surat</p>
              <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                {letter.content}
              </div>
            </div>

            <Button onClick={() => setStep("sign")} className="w-full gap-2">
              <PenTool className="w-4 h-4" />
              Lanjut ke Tanda Tangan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Signature Step */}
      {step === "sign" && (
        <div className="space-y-4">
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <User className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-full" />
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-muted-foreground">
                    Menandatangani: {letter.letterNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <SignatureCanvas
            onSave={handleSignatureSave}
            onClear={() => {}}
          />

          <Button
            variant="outline"
            onClick={() => setStep("preview")}
            className="w-full"
            disabled={isProcessing}
          >
            Kembali ke Preview
          </Button>
        </div>
      )}

      {/* Complete Step */}
      {step === "complete" && signatureData && (
        <div className="space-y-6">
          <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                  Surat Berhasil Ditandatangani!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Surat keluar telah dibubuhkan tanda tangan digital dan siap dikirim
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Signature Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  Detail Tanda Tangan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={signatureData.signatureImageUrl}
                    alt="Tanda Tangan"
                    className="max-w-[200px] border border-border rounded-lg"
                  />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Penandatangan:</span>
                    <span className="font-medium">{userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Waktu:</span>
                    <span className="font-medium">
                      {new Date(signatureData.signedAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">Hash:</span>
                    <span className="font-mono text-xs break-all">
                      {signatureData.signatureHash.substring(0, 32)}...
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <QRCodeGenerator
              letterId={letter.id}
              letterNumber={letter.letterNumber}
              documentHash={signatureData.documentHash}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StepIndicator({
  step,
  label,
  isActive,
  isComplete,
}: {
  step: number;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
          isComplete
            ? "bg-primary text-primary-foreground"
            : isActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isComplete ? <CheckCircle className="w-5 h-5" /> : step}
      </div>
      <span
        className={`text-xs ${
          isActive || isComplete ? "text-foreground font-medium" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
