import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Insumo, insumoService } from "@/services/insumoService";
import { procedimentoInsumoService } from "@/services/procedimentoInsumoService";

export interface ConsultaInsumoItem {
  insumo_id: string;
  quantidade: number;
}

interface Props {
  procedimentoNome: string;
  value: ConsultaInsumoItem[];
  onChange: (items: ConsultaInsumoItem[]) => void;
  /** Reseta presets quando o procedimento muda */
  resetKey?: string;
}

/**
 * Editor de insumos consumidos em uma consulta.
 * Quando o procedimento muda, carrega automaticamente os insumos pré-cadastrados.
 * O usuário pode adicionar, editar quantidade ou remover insumos.
 */
export const ConsultaInsumosEditor = ({ procedimentoNome, value, onChange, resetKey }: Props) => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [lastLoadedProc, setLastLoadedProc] = useState<string | null>(null);

  useEffect(() => {
    insumoService.listar().then(setInsumos).catch(() => {});
  }, []);

  // Carrega presets quando o procedimento muda (apenas se a lista estiver vazia ou for outro proc)
  useEffect(() => {
    if (!procedimentoNome) return;
    if (lastLoadedProc === procedimentoNome) return;
    setLoadingPresets(true);
    procedimentoInsumoService
      .listarPorProcedimentoNome(procedimentoNome)
      .then((presets) => {
        if (presets.length > 0) {
          onChange(presets.map((p) => ({ insumo_id: p.insumo_id, quantidade: p.quantidade })));
        }
        setLastLoadedProc(procedimentoNome);
      })
      .catch(() => {})
      .finally(() => setLoadingPresets(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procedimentoNome, resetKey]);

  const insumoMap = useMemo(() => {
    const m: Record<string, Insumo> = {};
    insumos.forEach((i) => (m[i.id] = i));
    return m;
  }, [insumos]);

  const adicionar = () => {
    onChange([...value, { insumo_id: "", quantidade: 1 }]);
  };

  const atualizar = (idx: number, patch: Partial<ConsultaInsumoItem>) => {
    const next = value.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };

  const remover = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2 border border-border/40 rounded-lg p-3 bg-card/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <Label className="text-xs font-semibold uppercase tracking-wider">
            Insumos da Consulta
          </Label>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={adicionar} className="h-7 gap-1">
          <Plus className="w-3 h-3" /> Adicionar
        </Button>
      </div>

      {loadingPresets && (
        <p className="text-[11px] text-muted-foreground">Carregando insumos do procedimento...</p>
      )}

      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          Nenhum insumo. Use "Adicionar" ou cadastre insumos no procedimento.
        </p>
      ) : (
        <div className="space-y-2">
          {value.map((item, idx) => {
            const insumo = insumoMap[item.insumo_id];
            const excedeEstoque = insumo && item.quantidade > insumo.quantidade;
            return (
              <div key={idx} className="grid grid-cols-[1fr_90px_auto] gap-2 items-end">
                <div>
                  <Select
                    value={item.insumo_id}
                    onValueChange={(v) => atualizar(idx, { insumo_id: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione um insumo" />
                    </SelectTrigger>
                    <SelectContent>
                      {insumos.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.nome} <span className="text-muted-foreground text-xs">(estoque: {i.quantidade})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {excedeEstoque && (
                    <p className="text-[10px] text-destructive mt-1">
                      Excede o estoque atual ({insumo.quantidade}).
                    </p>
                  )}
                </div>
                <Input
                  type="number"
                  min={1}
                  className="h-9"
                  value={item.quantidade}
                  onChange={(e) => atualizar(idx, { quantidade: Math.max(1, parseInt(e.target.value) || 1) })}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-destructive"
                  onClick={() => remover(idx)}
                  aria-label="Remover insumo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        Ao salvar a consulta, a quantidade abaixo será descontada automaticamente do estoque.
      </p>
    </div>
  );
};
