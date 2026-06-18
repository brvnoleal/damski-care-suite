import { useEffect, useState } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { odontogramaService } from "@/services/odontogramaService";
import { dentistaService } from "@/services/dentistaService";
import type {
  Dentista,
  OdontogramaProcedimento,
  OdontogramaStatus,
  ProcedimentoOdonto,
} from "@/types";
import {
  odontogramaStatusLabels,
  procedimentoOdontoLabels,
} from "@/types";
import { ProcedimentoCombobox } from "@/components/ProcedimentoCombobox";


interface ToothProcedureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: string;
  dente: number | null;
  onChange: () => void;
}

const initialForm = {
  status: "pendente" as OdontogramaStatus,
  procedimento: "restauracao" as ProcedimentoOdonto,
  dentista_id: "",
  observacoes: "",
};

export const ToothProcedureDialog = ({
  open,
  onOpenChange,
  pacienteId,
  dente,
  onChange,
}: ToothProcedureDialogProps) => {
  const [historico, setHistorico] = useState<OdontogramaProcedimento[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !dente) return;
    setForm(initialForm);
    setLoading(true);
    Promise.all([
      odontogramaService.listarPorDente(pacienteId, dente),
      dentistaService.listar(),
    ])
      .then(([hist, dts]) => {
        setHistorico(hist);
        setDentistas(dts.filter((d) => d.status === "ativo"));
      })
      .catch((e) => toast({ title: "Erro ao carregar", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [open, dente, pacienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dente) return;
    setSaving(true);
    try {
      await odontogramaService.criar({
        paciente_id: pacienteId,
        dente,
        status: form.status,
        procedimento: form.procedimento,
        valor: 0,
        dentista_id: form.dentista_id || undefined,
        observacoes: form.observacoes || undefined,
        data: new Date().toISOString().slice(0, 10),
      });
      toast({ title: "Procedimento registrado", description: `Dente ${dente}` });
      const hist = await odontogramaService.listarPorDente(pacienteId, dente);
      setHistorico(hist);
      setForm(initialForm);
      onChange();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await odontogramaService.remover(id);
      if (dente) {
        const hist = await odontogramaService.listarPorDente(pacienteId, dente);
        setHistorico(hist);
      }
      onChange();
      toast({ title: "Procedimento removido" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const statusBadgeVariant = (s: OdontogramaStatus) => {
    if (s === "concluido") return "default";
    if (s === "em_andamento") return "secondary";
    if (s === "removido") return "destructive";
    return "outline";
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dente ? `Dente ${dente}` : "Dente"}
      description="Registre o procedimento realizado neste dente."
      className="sm:max-w-[560px]"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Status do Procedimento</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as OdontogramaStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(odontogramaStatusLabels) as [OdontogramaStatus, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Procedimento</Label>
            <ProcedimentoCombobox
              value={form.procedimento}
              onChange={(v) => setForm({ ...form, procedimento: v as ProcedimentoOdonto })}
              allowCustom
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Profissional</Label>
          <Select value={form.dentista_id} onValueChange={(v) => setForm({ ...form, dentista_id: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {dentistas.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Observações</Label>
          <Textarea
            rows={2}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            placeholder="Detalhes do procedimento..."
          />
        </div>
        <Button type="submit" disabled={saving} className="w-full">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Registrar procedimento
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-sm font-semibold mb-2">Histórico do dente</h4>
        {loading ? (
          <p className="text-xs text-muted-foreground">Carregando…</p>
        ) : historico.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum procedimento registrado.</p>
        ) : (
          <ul className="space-y-2 max-h-[200px] overflow-y-auto">
            {historico.map((p) => {
              const dt = dentistas.find((d) => d.id === p.dentista_id);
              return (
                <li key={p.id} className="flex items-start justify-between gap-2 p-2 rounded-md bg-muted/40">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{procedimentoOdontoLabels[p.procedimento as ProcedimentoOdonto] || p.procedimento}</span>
                      <Badge variant={statusBadgeVariant(p.status)} className="text-[10px]">{odontogramaStatusLabels[p.status]}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(p.data).toLocaleDateString("pt-BR")} {dt && `• ${dt.nome}`}
                    </p>
                    {p.observacoes && <p className="text-[11px] text-muted-foreground mt-1">{p.observacoes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="text-destructive hover:opacity-70 p-1"
                    aria-label="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ResponsiveDialog>
  );
};
