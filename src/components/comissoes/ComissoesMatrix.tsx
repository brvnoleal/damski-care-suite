/**
 * Matriz de comissões (Dentista × Procedimento).
 * Cada célula configura tipo (percentual/fixo) e valor por par dentista/procedimento.
 * Base de cálculo: comissão só é devida quando a consulta tem status_pagamento = "pago".
 */
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { dentistaService } from "@/services/dentistaService";
import { procedimentoService, type ProcedimentoRecord } from "@/services/procedimentoService";
import {
  comissaoService,
  type ComissaoRecord,
  type ComissaoTipo,
} from "@/services/comissaoService";
import type { Dentista } from "@/types";

type CellDraft = { tipo: ComissaoTipo; valor: string; id?: string; ativo: boolean };

const keyOf = (d: string, p: string) => `${d}::${p}`;

const ComissoesMatrix = () => {
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, CellDraft>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ds, ps, cs] = await Promise.all([
        dentistaService.listar(),
        procedimentoService.list(),
        comissaoService.list(),
      ]);
      setDentistas(ds.filter((d) => d.status === "ativo"));
      setProcedimentos(ps);
      const map: Record<string, CellDraft> = {};
      cs.forEach((c) => {
        map[keyOf(c.dentista_id, c.procedimento_id)] = {
          id: c.id,
          tipo: c.tipo,
          valor: String(c.valor),
          ativo: c.ativo,
        };
      });
      setDrafts(map);
    } catch (e: any) {
      toast({ title: "Erro ao carregar", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getDraft = (d: string, p: string): CellDraft =>
    drafts[keyOf(d, p)] || { tipo: "percentual", valor: "", ativo: true };

  const setDraft = (d: string, p: string, patch: Partial<CellDraft>) => {
    setDrafts((prev) => {
      const cur = prev[keyOf(d, p)] || { tipo: "percentual", valor: "", ativo: true };
      return { ...prev, [keyOf(d, p)]: { ...cur, ...patch } };
    });
  };

  const handleSave = async (dentistaId: string, procedimentoId: string) => {
    const k = keyOf(dentistaId, procedimentoId);
    const draft = drafts[k];
    if (!draft) return;
    const valor = Number(draft.valor);
    if (Number.isNaN(valor) || valor < 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    setSavingKey(k);
    try {
      const saved = await comissaoService.upsert({
        dentista_id: dentistaId,
        procedimento_id: procedimentoId,
        tipo: draft.tipo,
        valor,
        ativo: draft.ativo,
      });
      setDrafts((prev) => ({
        ...prev,
        [k]: { id: saved.id, tipo: saved.tipo, valor: String(saved.valor), ativo: saved.ativo },
      }));
      toast({ title: "Comissão salva" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const handleRemove = async (dentistaId: string, procedimentoId: string) => {
    const k = keyOf(dentistaId, procedimentoId);
    const id = drafts[k]?.id;
    if (!id) {
      setDrafts((prev) => {
        const n = { ...prev };
        delete n[k];
        return n;
      });
      return;
    }
    try {
      await comissaoService.remove(id);
      setDrafts((prev) => {
        const n = { ...prev };
        delete n[k];
        return n;
      });
      toast({ title: "Comissão removida" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const totalConfig = useMemo(
    () => Object.values(drafts).filter((d) => d.id).length,
    [drafts],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando comissões…
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Matriz de Comissões</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configure o valor (percentual ou fixo) que cada dentista recebe por procedimento.
              <br />
              <span className="text-xs">
                A comissão é apurada somente quando a consulta tem o status de pagamento como{" "}
                <strong>pago</strong>.
              </span>
            </p>
          </div>
          <Badge variant="secondary">{totalConfig} regras ativas</Badge>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {dentistas.length === 0 || procedimentos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Cadastre dentistas e procedimentos antes de configurar comissões.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Procedimento</TableHead>
                {dentistas.map((d) => (
                  <TableHead key={d.id} className="min-w-[260px] text-foreground">
                    {d.nome}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedimentos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-foreground align-top">
                    <div>{p.nome}</div>
                    {p.preco > 0 && (
                      <div className="text-xs text-muted-foreground">
                        R$ {Number(p.preco).toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  {dentistas.map((d) => {
                    const k = keyOf(d.id, p.id);
                    const draft = getDraft(d.id, p.id);
                    const isSaving = savingKey === k;
                    return (
                      <TableCell key={d.id} className="align-top">
                        <div className="flex items-center gap-1.5">
                          <Select
                            value={draft.tipo}
                            onValueChange={(v) =>
                              setDraft(d.id, p.id, { tipo: v as ComissaoTipo })
                            }
                          >
                            <SelectTrigger className="h-9 w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentual">%</SelectItem>
                              <SelectItem value="fixo">R$ fixo</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min={0}
                            step={draft.tipo === "percentual" ? "0.1" : "0.01"}
                            placeholder="0"
                            value={draft.valor}
                            onChange={(e) => setDraft(d.id, p.id, { valor: e.target.value })}
                            className="h-9 w-[100px]"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-9 w-9"
                            onClick={() => handleSave(d.id, p.id)}
                            disabled={isSaving || draft.valor === ""}
                            aria-label="Salvar"
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          {draft.id && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-destructive"
                              onClick={() => handleRemove(d.id, p.id)}
                              aria-label="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ComissoesMatrix;
