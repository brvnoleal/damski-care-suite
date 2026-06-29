import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Insumo, insumoService } from "@/services/insumoService";
import {
  procedimentoInsumoService,
  ProcedimentoInsumo,
} from "@/services/procedimentoInsumoService";

interface Props {
  procedimentoId: string | null;
}

export const ProcedimentoInsumosEditor = ({ procedimentoId }: Props) => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [vinculados, setVinculados] = useState<ProcedimentoInsumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [novoInsumo, setNovoInsumo] = useState<string>("");
  const [novaQtd, setNovaQtd] = useState<number>(1);

  useEffect(() => {
    if (!procedimentoId) {
      insumoService.listar().then(setInsumos).catch(() => {});
      setVinculados([]);
      return;
    }
    setLoading(true);
    Promise.all([
      insumoService.listar(),
      procedimentoInsumoService.listarPorProcedimento(procedimentoId),
    ])
      .then(([ins, vinc]) => {
        setInsumos(ins);
        setVinculados(vinc);
      })
      .catch(() => toast.error("Erro ao carregar insumos"))
      .finally(() => setLoading(false));
  }, [procedimentoId]);

  const adicionar = async () => {
    if (!procedimentoId) {
      toast.error("Salve o procedimento antes de vincular insumos.");
      return;
    }
    if (!novoInsumo) {
      toast.error("Selecione um insumo");
      return;
    }
    if (vinculados.some((v) => v.insumo_id === novoInsumo)) {
      toast.error("Insumo já vinculado");
      return;
    }
    try {
      await procedimentoInsumoService.adicionar(procedimentoId, novoInsumo, novaQtd);
      const atualizado = await procedimentoInsumoService.listarPorProcedimento(procedimentoId);
      setVinculados(atualizado);
      setNovoInsumo("");
      setNovaQtd(1);
      toast.success("Insumo vinculado");
    } catch (e: any) {
      toast.error(e.message || "Erro ao vincular insumo");
    }
  };

  const atualizarQtd = async (id: string, qtd: number) => {
    try {
      await procedimentoInsumoService.atualizar(id, qtd);
      setVinculados((prev) => prev.map((v) => (v.id === id ? { ...v, quantidade: qtd } : v)));
    } catch {
      toast.error("Erro ao atualizar quantidade");
    }
  };

  const remover = async (id: string) => {
    try {
      await procedimentoInsumoService.remover(id);
      setVinculados((prev) => prev.filter((v) => v.id !== id));
      toast.success("Insumo removido");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const disponivel = insumos.filter((i) => !vinculados.some((v) => v.insumo_id === i.id));

  if (!procedimentoId) {
    return (
      <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border/40 rounded-md">
        Salve o procedimento para vincular insumos.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border/40 p-3 bg-card/40 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Adicionar insumo
        </p>
        <div className="grid grid-cols-[1fr_90px_auto] gap-2 items-end">
          <Select value={novoInsumo} onValueChange={setNovoInsumo}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione um insumo" />
            </SelectTrigger>
            <SelectContent>
              {disponivel.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Todos os insumos já vinculados.
                </div>
              )}
              {disponivel.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={1}
            value={novaQtd}
            onChange={(e) => setNovaQtd(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-9"
          />
          <Button type="button" size="sm" onClick={adicionar} className="h-9 gap-1">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>
      </div>

      {vinculados.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3 text-center">
          Nenhum insumo vinculado.
        </p>
      ) : (
        <div className="space-y-2">
          {vinculados.map((v) => (
            <div key={v.id} className="grid grid-cols-[1fr_90px_auto] gap-2 items-center">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{v.insumo_nome}</p>
                <p className="text-[11px] text-muted-foreground">
                  Estoque atual: {v.estoque_atual}
                </p>
              </div>
              <Input
                type="number"
                min={1}
                value={v.quantidade}
                onChange={(e) => atualizarQtd(v.id, Math.max(1, parseInt(e.target.value) || 1))}
                className="h-9"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-destructive shrink-0"
                onClick={() => remover(v.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcedimentoInsumosEditor;
