import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Copy, FileText, Link2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { anamneseService, AnamneseRecord } from "@/services/anamneseService";
import { AnamneseFormFields } from "@/components/anamnese/AnamneseFormFields";

interface Props {
  pacienteId: string;
}

const formatDate = (iso: string) => new Date(iso).toLocaleString("pt-BR");

export const AnamneseTab = ({ pacienteId }: Props) => {
  const [items, setItems] = useState<AnamneseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [view, setView] = useState<AnamneseRecord | null>(null);

  const carregar = async () => {
    setLoading(true);
    try {
      setItems(await anamneseService.listarPorPaciente(pacienteId));
    } catch (e: any) {
      toast.error(e.message || "Erro ao carregar fichas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [pacienteId]);

  const gerarLink = async () => {
    setGerando(true);
    try {
      const t = await anamneseService.gerarTokenIndividual(pacienteId);
      const url = `${window.location.origin}/anamnese/t/${t.token}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link individual copiado", { description: "Válido por 7 dias." });
    } catch (e: any) {
      toast.error(e.message || "Falha ao gerar link");
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-foreground">Fichas de Anamnese</h3>
          <p className="text-xs text-muted-foreground">Histórico de fichas preenchidas pelo paciente.</p>
        </div>
        <Button onClick={gerarLink} disabled={gerando} className="gap-2">
          {gerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          Gerar link individual
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <LiquidGlassCard className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma ficha preenchida ainda. Compartilhe o link com o paciente.
        </LiquidGlassCard>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <LiquidGlassCard key={a.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Versão {a.versao}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.assinatura_em)}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">{a.origem.replace("_", " ")}</Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setView(a)}>Ver ficha</Button>
            </LiquidGlassCard>
          ))}
        </div>
      )}

      <ResponsiveDialog
        open={!!view}
        onOpenChange={(o) => !o && setView(null)}
        title={view ? `Ficha de Anamnese — v${view.versao}` : ""}
        description={view ? `Assinada em ${formatDate(view.assinatura_em)}` : ""}
      >
        {view && (
          <div className="space-y-6">
            <AnamneseFormFields values={view.respostas || {}} onChange={() => {}} readOnly />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Assinatura do paciente</p>
              {view.assinatura_paciente ? (
                <img src={view.assinatura_paciente} alt="Assinatura" className="bg-black/40 border border-white/10 rounded-md max-h-40" />
              ) : (
                <p className="text-xs text-muted-foreground">—</p>
              )}
              <p className="text-[10px] text-muted-foreground">
                IP: {view.assinatura_ip || "—"} · UA: {view.assinatura_user_agent?.slice(0, 60) || "—"}
              </p>
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};
