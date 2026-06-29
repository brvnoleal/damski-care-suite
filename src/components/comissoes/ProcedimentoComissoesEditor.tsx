/**
 * Editor de comissões por dentista, escopado a um procedimento.
 * - Permite ativar/configurar tipo (% ou R$ fixo) e valor por dentista.
 * - Persiste via comissaoService.upsert/remove. Auto-salva ao clicar em "Salvar" por linha,
 *   ou via saveAll() exposto por ref (usado no form de cadastro/edição).
 */
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dentistaService } from "@/services/dentistaService";
import { comissaoService, type ComissaoTipo } from "@/services/comissaoService";
import type { Dentista } from "@/types";
import { CommissionValueInput } from "./CommissionValueInput";

type Draft = { id?: string; tipo: ComissaoTipo; valor: string; ativo: boolean };

interface Props {
  procedimentoId: string | null;
  /** Quando true, esconde botões individuais (usado dentro de form que persiste tudo no Salvar) */
  inline?: boolean;
}

export interface ProcedimentoComissoesEditorHandle {
  /** Persiste todos os rascunhos com valor preenchido. Usar quando procedimentoId estiver disponível. */
  saveAll: (procedimentoId: string) => Promise<void>;
}

export const ProcedimentoComissoesEditor = forwardRef<ProcedimentoComissoesEditorHandle, Props>(
  ({ procedimentoId, inline = false }, ref) => {
    const [dentistas, setDentistas] = useState<Dentista[]>([]);
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const load = async (pid: string | null) => {
      setLoading(true);
      try {
        const ds = await dentistaService.listar();
        const ativos = ds.filter((d) => d.status === "ativo");
        setDentistas(ativos);

        const map: Record<string, Draft> = {};
        if (pid) {
          const all = await comissaoService.list();
          all
            .filter((c) => c.procedimento_id === pid)
            .forEach((c) => {
              map[c.dentista_id] = {
                id: c.id,
                tipo: c.tipo,
                valor: String(c.valor),
                ativo: c.ativo,
              };
            });
        }
        setDrafts(map);
      } catch (e: any) {
        toast.error(e.message || "Erro ao carregar comissões");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      load(procedimentoId);
    }, [procedimentoId]);

    const getDraft = (id: string): Draft =>
      drafts[id] || { tipo: "percentual", valor: "", ativo: true };

    const patch = (id: string, p: Partial<Draft>) =>
      setDrafts((prev) => {
        const cur = prev[id] || { tipo: "percentual", valor: "", ativo: true };
        return { ...prev, [id]: { ...cur, ...p } };
      });

    const handleSave = async (dentistaId: string, pid: string) => {
      const d = drafts[dentistaId];
      if (!d) return;
      const valor = Number(d.valor);
      if (Number.isNaN(valor) || valor < 0) {
        toast.error("Valor inválido");
        return;
      }
      setSavingId(dentistaId);
      try {
        const saved = await comissaoService.upsert({
          dentista_id: dentistaId,
          procedimento_id: pid,
          tipo: d.tipo,
          valor,
          ativo: d.ativo,
        });
        patch(dentistaId, { id: saved.id, valor: String(saved.valor) });
        toast.success("Comissão salva");
      } catch (e: any) {
        toast.error(e.message || "Erro ao salvar");
      } finally {
        setSavingId(null);
      }
    };

    const handleRemove = async (dentistaId: string) => {
      const d = drafts[dentistaId];
      if (d?.id) {
        try {
          await comissaoService.remove(d.id);
          toast.success("Comissão removida");
        } catch (e: any) {
          toast.error(e.message || "Erro ao remover");
          return;
        }
      }
      setDrafts((prev) => {
        const n = { ...prev };
        delete n[dentistaId];
        return n;
      });
    };

    useImperativeHandle(ref, () => ({
      async saveAll(pid: string) {
        const entries = Object.entries(drafts);
        for (const [dentistaId, d] of entries) {
          if (!d || d.valor === "") continue;
          const valor = Number(d.valor);
          if (Number.isNaN(valor) || valor < 0) continue;
          await comissaoService.upsert({
            dentista_id: dentistaId,
            procedimento_id: pid,
            tipo: d.tipo,
            valor,
            ativo: d.ativo,
          });
        }
      },
    }));

    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
        </div>
      );
    }

    if (dentistas.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Cadastre dentistas para configurar comissões.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {dentistas.map((d) => {
          const draft = getDraft(d.id);
          const isSaving = savingId === d.id;
          return (
            <div
              key={d.id}
              className="flex items-center gap-2 rounded-md border border-border/40 px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
                {d.especialidade && (
                  <p className="text-[11px] text-muted-foreground truncate">{d.especialidade}</p>
                )}
              </div>
              <Select
                value={draft.tipo}
                onValueChange={(v) => patch(d.id, { tipo: v as ComissaoTipo })}
              >
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentual">%</SelectItem>
                  <SelectItem value="fixo">R$ fixo</SelectItem>
                </SelectContent>
              </Select>
              <CommissionValueInput
                tipo={draft.tipo}
                value={draft.valor}
                onChange={(v) => patch(d.id, { valor: v })}
                className="w-[130px]"
                ariaLabel={`Valor de comissão para ${d.nome}`}
              />
              {!inline && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9"
                  onClick={() => procedimentoId && handleSave(d.id, procedimentoId)}
                  disabled={isSaving || !procedimentoId || draft.valor === ""}
                  aria-label="Salvar"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
              {(draft.id || draft.valor !== "") && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-destructive"
                  onClick={() => handleRemove(d.id)}
                  aria-label="Remover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);

ProcedimentoComissoesEditor.displayName = "ProcedimentoComissoesEditor";
