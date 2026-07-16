/**
 * Recibo de Pagamento (Holerite / Pró-labore) por dentista.
 * - Cabeçalho com razão social + CNPJ da clínica (Configurações → Perfil do Consultório).
 * - Lista detalhada das comissões do período como "Proventos".
 * - Permite assinatura digital, persistida no Supabase para auditoria.
 */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { SignaturePad } from "@/components/SignaturePad";
import { toast } from "sonner";
import { Pen, FileCheck2, RotateCcw, Loader2 } from "lucide-react";
import {
  holeriteAssinaturaService,
  type HoleriteSignatureRecord,
} from "@/services/holeriteAssinaturaService";

export interface HoleriteDetalhe {
  id: string;
  data: string;
  procedimento: string;
  valor: number;
  base: string;
  comissao: number;
}

export interface HoleriteData {
  dentistaId: string;
  dentistaNome: string;
  dentistaCro?: string;
  dentistaCpf?: string;
  especialidade?: string;
  consultasPagas: number;
  valorAtendido: number;
  comissaoTotal: number;
  detalhes: HoleriteDetalhe[];
}

interface ClinicProfile {
  documento?: string;
  razaoSocial?: string;
  nome?: string;
  telefone?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

const fmtBRL = (n: number) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const HoleriteDialog = ({
  open,
  onOpenChange,
  holerite,
  periodoKey,
  periodoLabel,
  signature,
  onSigned,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  holerite: HoleriteData | null;
  periodoKey: string;
  periodoLabel: string;
  signature?: HoleriteSignatureRecord | null;
  onSigned?: (signature: HoleriteSignatureRecord | null) => void;
}) => {
  const [clinic, setClinic] = useState<ClinicProfile>({});
  const [sig, setSig] = useState<string>("");
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem("clinic_profile");
      if (raw) setClinic(JSON.parse(raw));
    } catch {}
  }, [open]);

  useEffect(() => {
    if (!open || !holerite) return;
    setSig(signature?.assinatura_data_url || "");
    setSignedAt(signature?.signed_at || null);
  }, [open, holerite, periodoKey, signature]);

  const totais = useMemo(() => {
    if (!holerite) return { proventos: 0, descontos: 0, liquido: 0 };
    const proventos = holerite.comissaoTotal;
    const descontos = 0; // pró-labore: sem encargos automáticos
    return { proventos, descontos, liquido: proventos - descontos };
  }, [holerite]);

  const handleAssinar = async () => {
    if (!holerite || !sig) {
      toast.error("Desenhe sua assinatura antes de salvar");
      return;
    }
    setSaving(true);
    try {
      const saved = await holeriteAssinaturaService.salvar({
        dentistaId: holerite.dentistaId,
        periodoKey,
        periodoLabel,
        assinaturaDataUrl: sig,
      });
      setSig(saved.assinatura_data_url);
      setSignedAt(saved.signed_at);
      toast.success("Holerite assinado");
      onSigned?.(saved);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar assinatura do holerite");
    } finally {
      setSaving(false);
    }
  };

  const handleRevogar = async () => {
    if (!holerite) return;
    setSaving(true);
    try {
      await holeriteAssinaturaService.revogar({
        dentistaId: holerite.dentistaId,
        periodoKey,
        periodoLabel,
      });
      setSig("");
      setSignedAt(null);
      onSigned?.(null);
      toast.success("Assinatura removida");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao remover assinatura do holerite");
    } finally {
      setSaving(false);
    }
  };

  if (!holerite) return null;

  const razao = clinic.razaoSocial || clinic.nome || "—";
  const cnpj = clinic.documento || "—";
  const endereco = [clinic.rua, clinic.numero, clinic.bairro, clinic.cidade && `${clinic.cidade}/${clinic.estado || ""}`]
    .filter(Boolean)
    .join(", ");

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Recibo de Pagamento (Holerite)"
      description={`Pró-labore — ${periodoLabel}`}
      className="sm:max-w-2xl"
    >
      <div className="p-5 space-y-4 text-sm">
        {/* Cabeçalho da empresa */}
        <div className="rounded-md border border-border/60 p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Empregador</p>
              <p className="font-semibold text-foreground">{razao}</p>
              <p className="text-xs text-muted-foreground">CNPJ: {cnpj}</p>
              {endereco && <p className="text-xs text-muted-foreground mt-0.5">{endereco}</p>}
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Recibo de Pagamento
              </p>
              <p className="text-xs text-muted-foreground">Referente ao período</p>
              <p className="font-semibold text-foreground">{periodoLabel}</p>
            </div>
          </div>
        </div>

        {/* Dados do dentista */}
        <div className="rounded-md border border-border/60 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Nome</p>
            <p className="font-medium text-foreground">{holerite.dentistaNome}</p>
            {holerite.dentistaCpf && (
              <p className="text-xs text-muted-foreground">CPF: {holerite.dentistaCpf}</p>
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Função</p>
            <p className="font-medium text-foreground">
              {holerite.especialidade || "Cirurgião-Dentista"}
            </p>
            {holerite.dentistaCro && (
              <p className="text-xs text-muted-foreground">{holerite.dentistaCro}</p>
            )}
          </div>
        </div>

        {/* Proventos / Descontos */}
        <div className="rounded-md border border-border/60 overflow-hidden">
          <div className="grid grid-cols-12 bg-muted/40 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            <div className="col-span-1">Cód.</div>
            <div className="col-span-5">Descrição</div>
            <div className="col-span-2">Referência</div>
            <div className="col-span-2 text-right">Proventos</div>
            <div className="col-span-2 text-right">Descontos</div>
          </div>
          <div className="divide-y divide-border/40">
            {holerite.detalhes
              .slice()
              .sort((a, b) => a.data.localeCompare(b.data))
              .map((d, i) => (
                <div key={d.id} className="grid grid-cols-12 px-3 py-2 text-xs items-start">
                  <div className="col-span-1 text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
                  <div className="col-span-5 text-foreground">
                    <p className="font-medium">{d.procedimento}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(d.data + "T00:00:00").toLocaleDateString("pt-BR")} ·{" "}
                      {fmtBRL(d.valor)}
                    </p>
                  </div>
                  <div className="col-span-2 text-muted-foreground">{d.base}</div>
                  <div className="col-span-2 text-right text-foreground">
                    {d.comissao > 0 ? fmtBRL(d.comissao) : "—"}
                  </div>
                  <div className="col-span-2 text-right text-muted-foreground">—</div>
                </div>
              ))}
          </div>
          <div className="grid grid-cols-12 bg-muted/30 px-3 py-2 text-xs border-t border-border/60">
            <div className="col-span-8 text-right text-muted-foreground">Total dos Vencimentos</div>
            <div className="col-span-2 text-right font-semibold text-foreground">
              {fmtBRL(totais.proventos)}
            </div>
            <div className="col-span-2 text-right font-semibold text-foreground">
              {fmtBRL(totais.descontos)}
            </div>
          </div>
          <div className="grid grid-cols-12 bg-primary/10 px-3 py-2 text-sm border-t border-border/60">
            <div className="col-span-10 text-right font-semibold text-foreground">LÍQUIDO →</div>
            <div className="col-span-2 text-right font-bold text-foreground">
              {fmtBRL(totais.liquido)}
            </div>
          </div>
        </div>

        {/* Base de cálculo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded border border-border/40 p-2">
            <p className="text-[10px] uppercase text-muted-foreground">Consultas pagas</p>
            <p className="font-semibold text-foreground">{holerite.consultasPagas}</p>
          </div>
          <div className="rounded border border-border/40 p-2">
            <p className="text-[10px] uppercase text-muted-foreground">Valor atendido</p>
            <p className="font-semibold text-foreground">{fmtBRL(holerite.valorAtendido)}</p>
          </div>
          <div className="rounded border border-border/40 p-2 col-span-2">
            <p className="text-[10px] uppercase text-muted-foreground">
              Declaração
            </p>
            <p className="text-[11px] text-foreground">
              Declaro ter recebido a importância líquida discriminada neste recibo.
            </p>
          </div>
        </div>

        {/* Assinatura */}
        <div className="rounded-md border border-border/60 p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-semibold text-foreground">Assinatura do Profissional</p>
            {signedAt && (
              <span className="text-[11px] text-success inline-flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" /> Assinado em{" "}
                {new Date(signedAt).toLocaleString("pt-BR")}
              </span>
            )}
          </div>
          {signedAt && sig ? (
            <div className="rounded-md border border-border/40 bg-background p-2">
              <img src={sig} alt="Assinatura" className="max-h-32 mx-auto" />
            </div>
          ) : (
            <SignaturePad value={sig} onChange={setSig} height={140} />
          )}
          <div className="flex gap-2 justify-end">
            {signedAt ? (
              <Button variant="outline" size="sm" onClick={handleRevogar} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Refazer assinatura
              </Button>
            ) : (
              <Button size="sm" onClick={handleAssinar} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pen className="w-3.5 h-3.5" />}
                Salvar assinatura
              </Button>
            )}
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
