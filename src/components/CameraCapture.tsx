import { useEffect, useRef, useState } from "react";
import { Camera, X, RotateCcw, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
}

/**
 * Captura de foto via câmera do dispositivo usando MediaDevices.getUserMedia.
 * Funciona em desktops com webcam e em celulares (câmera traseira por padrão).
 */
export const CameraCapture = ({ open, onOpenChange, onCapture }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = async (mode: "environment" | "user") => {
    stop();
    setError(null);
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e: any) {
      setError(e?.message?.includes("Permission")
        ? "Permissão da câmera negada. Habilite o acesso nas configurações do navegador."
        : "Não foi possível acessar a câmera neste dispositivo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPreview(null);
      start(facing);
    } else {
      stop();
      setPreview(null);
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSnap = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setPreview(canvas.toDataURL("image/jpeg", 0.92));
  };

  const handleConfirm = async () => {
    if (!preview) return;
    const res = await fetch(preview);
    const blob = await res.blob();
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file);
    onOpenChange(false);
  };

  const handleSwitch = async () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    await start(next);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tirar foto"
      description="Posicione a imagem e capture."
      className="sm:max-w-[640px]"
    >
      <div className="space-y-3">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
          {loading && <Loader2 className="w-8 h-8 text-white animate-spin absolute" />}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <p className="text-xs text-center text-white/90">{error}</p>
            </div>
          )}
          {preview ? (
            <img src={preview} alt="Pré-visualização" className="w-full h-full object-contain" />
          ) : (
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {!preview ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={handleSwitch} disabled={!!error || loading}>
                <RotateCcw className="w-4 h-4 mr-1.5" /> Trocar câmera
              </Button>
              <Button type="button" onClick={handleSnap} disabled={!!error || loading}>
                <Camera className="w-4 h-4 mr-1.5" /> Capturar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4 mr-1.5" /> Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => setPreview(null)}>
                <RotateCcw className="w-4 h-4 mr-1.5" /> Refazer
              </Button>
              <Button type="button" onClick={handleConfirm}>
                <Check className="w-4 h-4 mr-1.5" /> Usar foto
              </Button>
            </>
          )}
        </div>
      </div>
    </ResponsiveDialog>
  );
};
