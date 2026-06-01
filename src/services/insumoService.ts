/**
 * Camada de serviço — Insumos
 * Operações CRUD via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";
import { notificationStore } from "@/stores/notificationStore";

export type InsumoCategoria = "epi" | "instrumento" | "material_consumo" | "medicamento" | "outros";

export const insumoCategoriaLabels: Record<InsumoCategoria, string> = {
  epi: "EPI",
  instrumento: "Instrumento",
  material_consumo: "Material de Consumo",
  medicamento: "Medicamento",
  outros: "Outros",
};

export type InsumoUnidadeMedida = "caixa" | "cartela" | "mililitros" | "pacote" | "rolo" | "unidade";

export const insumoUnidadeMedidaLabels: Record<InsumoUnidadeMedida, string> = {
  caixa: "Caixa",
  cartela: "Cartela",
  mililitros: "Mililitros",
  pacote: "Pacote",
  rolo: "Rolo",
  unidade: "Unidade",
};

export interface Insumo {
  id: string;
  nome: string;
  fabricante: string;
  lote: string;
  validade: string | null;
  sem_validade: boolean;
  categoria?: InsumoCategoria | null;
  unidade_medida?: InsumoUnidadeMedida | null;
  quantidade: number;
  pacientes_vinculados: number;
  created_at?: string;
}

const mapRow = (row: any): Insumo => ({
  id: row.id,
  nome: row.nome,
  fabricante: row.fabricante,
  lote: row.lote,
  validade: row.validade,
  sem_validade: !!row.sem_validade,
  categoria: row.categoria ?? null,
  unidade_medida: row.unidade_medida ?? null,
  quantidade: row.quantidade,
  pacientes_vinculados: row.pacientes_vinculados,
  created_at: row.created_at,
});

export const insumoService = {
  listar: async (): Promise<Insumo[]> => {
    const { data, error } = await supabase.from("insumo").select("*").order("validade", { nullsFirst: false });
    if (error) throw error;
    const lista = (data || []).map(mapRow);
    notificationStore.syncInsumoAlerts(lista);
    return lista;
  },

  criar: async (dados: Omit<Insumo, "id" | "created_at">): Promise<Insumo> => {
    const { data, error } = await supabase.from("insumo").insert(dados as any).select().single();
    if (error) throw error;
    const item = mapRow(data);
    notificationStore.add("create", "insumo", "Insumo cadastrado", `${item.nome} — lote ${item.lote}.`);
    return item;
  },

  atualizar: async (id: string, dados: Partial<Insumo>): Promise<Insumo | null> => {
    const { created_at, id: _, ...updateData } = dados as any;
    const { data, error } = await supabase.from("insumo").update({ ...updateData, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    if (data) {
      const item = mapRow(data);
      notificationStore.add("update", "insumo", "Insumo atualizado", `${item.nome} — lote ${item.lote}.`);
      return item;
    }
    return null;
  },

  excluir: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("insumo").delete().eq("id", id);
    if (error) throw error;
    notificationStore.add("delete", "insumo", "Insumo removido", "Um registro de insumo foi excluído.");
    return true;
  },
};
