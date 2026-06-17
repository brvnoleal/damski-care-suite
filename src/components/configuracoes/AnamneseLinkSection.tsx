import { useMemo } from "react";
import { FileText, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { toast } from "sonner";
import { useClinicaContext } from "@/hooks/useClinicaContext";
import { slugify } from "@/lib/utils";

export const AnamneseLinkSection = () => {
  const { clinicaNome, loading } = useClinicaContext();

  const slug = useMemo(() => slugify(clinicaNome), [clinicaNome]);
  const linkPublico = useMemo(() => {
    if (!slug) return "";
    return `${window.location.origin}/anamnese/${slug}`;
  }, [slug]);

  const copiar = async () => {
    await navigator.clipboard.writeText(linkPublico);
    toast.success("Link público copiado");
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

        {loading || !slug ? (
          <p className="text-sm text-muted-foreground">
            {loading ? "Carregando..." : "Cadastre o nome da clínica em Configurações para gerar o link."}
          </p>
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
            <p className="text-[11px] text-muted-foreground">
              Compartilhe este link para que o paciente preencha a ficha de anamnese antes da consulta.
            </p>
          </div>
        )}
      </div>
    </LiquidGlassCard>
  );
};
