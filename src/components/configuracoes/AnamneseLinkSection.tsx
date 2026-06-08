import { useMemo, useState } from "react";
import { FileText, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { toast } from "sonner";
import { useClinicaContext } from "@/hooks/useClinicaContext";
import { anamneseService } from "@/services/anamneseService";

export const AnamneseLinkSection = () => {
  const { clinicaId, loading } = useClinicaContext();
  const [generating, setGenerating] = useState(false);

  const linkPublico = useMemo(() => {
    if (!clinicaId) return "";
    return `${window.location.origin}/anamnese/${clinicaId}`;
  }, [clinicaId]);

  const copiar = async () => {
    await navigator.clipboard.writeText(linkPublico);
    toast.success("Link público copiado");
  };

  const gerarTokenAvulso = async () => {
    setGenerating(true);
    try {
      const t = await anamneseService.gerarTokenIndividual(null);
      const url = `${window.location.origin}/anamnese/t/${t.token}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link de uso único copiado", { description: "Válido por 7 dias." });
    } catch (e: any) {
      toast.error(e.message || "Falha ao gerar link");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <LiquidGlassCard draggable={false} className="p-5">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Ficha de Anamnese</h2>
            <p className="text-xs text-muted-foreground">Link público para o paciente preencher antes da consulta</p>
          </div>
        </div>

        {loading || !clinicaId ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Link público da clínica (recepção/tablet):</p>
              <div className="flex gap-2">
                <Input readOnly value={linkPublico} className="text-xs" />
                <Button size="icon" variant="secondary" onClick={copiar} title="Copiar"><Copy className="w-4 h-4" /></Button>
                <Button size="icon" variant="secondary" asChild title="Abrir">
                  <a href={linkPublico} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                </Button>
              </div>
            </div>
            <Button onClick={gerarTokenAvulso} disabled={generating} variant="outline" className="gap-2 w-full">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Gerar link individual de uso único
            </Button>
            <p className="text-[11px] text-muted-foreground">
              O link individual expira em 7 dias e só pode ser usado uma vez. Útil para enviar via WhatsApp/e-mail a um paciente específico.
            </p>
          </div>
        )}
      </div>
    </LiquidGlassCard>
  );
};
