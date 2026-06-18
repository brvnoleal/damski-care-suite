import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Insumo, insumoService } from "@/services/insumoService";
import {
  procedimentoInsumoService,
  ProcedimentoInsumo,
} from "@/services/procedimentoInsumoService";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedimentoId: string | null;
  procedimentoNome: string;
}

export const ProcedimentoInsumosDialog = ({ open, onOpenChange, procedimentoId, procedimentoNome }: Props) => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [vinculados, setVinculados] = useState<ProcedimentoInsumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [novoInsumo, setNovoInsumo] = useState<string>("");
  const [novaQtd, setNovaQtd] = useState<number>(1);

  useEffect(() => {
    if (!open || !procedimentoId) return;
    setLoading(true);
    Promise.all([insumoService.listar(), procedimentoInsumoService.listarPorProcedimento(procedimentoId)])
      .then(([ins, vinc]) => {
        setInsumos(ins);
        setVinculados(vinc);
      })
      .catch(() => toast.error("Erro ao carregar insumos"))
      .finally(() => setLoading(false));
  }, [open, procedimentoId]);

  const adicionar = async () => {
    if (!procedimentoId || !novoInsumo) {
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

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Insumos — ${procedimentoNome}`}
      description="Vincule insumos que serão automaticamente carregados ao agendar uma consulta com este procedimento."
      footer={
        <Button onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
          Fechar
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-border/40 p-3 bg-card/40 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
              <Button size="sm" onClick={adicionar} className="h-9 gap-1">
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Insumos vinculados
            </p>
            {vinculados.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum insumo vinculado ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {vinculados.map((v) => (
                  <div key={v.id} className="grid grid-cols-[1fr_90px_auto] gap-2 items-center">
                    <div>
                      <p className="text-sm font-medium">{v.insumo_nome}</p>
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
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-destructive"
                      onClick={() => remover(v.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
};
