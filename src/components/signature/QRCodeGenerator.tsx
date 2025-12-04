import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, CheckCircle, Shield } from "lucide-react";

interface QRCodeGeneratorProps {
  letterId: string;
  letterNumber: string;
  documentHash: string;
  className?: string;
}

export function QRCodeGenerator({
  letterId,
  letterNumber,
  documentHash,
  className = "",
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const verificationUrl = `${window.location.origin}/verify/${letterId}?hash=${documentHash}`;

  useEffect(() => {
    generateQRCode();
  }, [letterId, documentHash]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const url = await QRCode.toDataURL(verificationUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#1e293b",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `qr-${letterNumber.replace(/\//g, "-")}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          QR Code Validasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          {isGenerating ? (
            <div className="w-64 h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Generating...</span>
            </div>
          ) : qrCodeUrl ? (
            <div className="relative">
              <img
                src={qrCodeUrl}
                alt="QR Code Validasi"
                className="w-64 h-64 rounded-lg border border-border"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">QR tidak tersedia</span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-foreground">No. Surat: {letterNumber}</p>
          <p className="text-xs text-muted-foreground break-all">
            Hash: {documentHash.substring(0, 16)}...{documentHash.substring(documentHash.length - 16)}
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-400">
            Scan QR code ini untuk memverifikasi keaslian surat secara online
          </p>
        </div>

        <Button
          onClick={downloadQRCode}
          disabled={!qrCodeUrl}
          variant="outline"
          className="w-full gap-2"
        >
          <Download className="w-4 h-4" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
}
