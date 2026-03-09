/**
 * Camada de serviço — Insumos
 * Operações CRUD via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";

export interface Insumo {
  id: string;
  nome: string;
  fabricante: string;
  lote: string;
  validade: string;
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
  quantidade: row.quantidade,
  pacientes_vinculados: row.pacientes_vinculados,
  created_at: row.created_at,
});

export const insumoService = {
  listar: async (): Promise<Insumo[]> => {
    const { data, error } = await supabase.from("insumo").select("*").order("validade");
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  criar: async (dados: Omit<Insumo, "id" | "created_at">): Promise<Insumo> => {
    const { data, error } = await supabase.from("insumo").insert(dados).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  atualizar: async (id: string, dados: Partial<Insumo>): Promise<Insumo | null> => {
    const { created_at, id: _, ...updateData } = dados as any;
    const { data, error } = await supabase.from("insumo").update({ ...updateData, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  excluir: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("insumo").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
