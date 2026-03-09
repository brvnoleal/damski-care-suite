/**
 * Camada de serviço — Despesas
 * Operações CRUD via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";

export interface Despesa {
  id: string;
  descricao: string;
  categoria?: string;
  fornecedor?: string;
  valor: number;
  forma_pagamento?: string;
  vencimento: string;
  observacoes?: string;
  status: "pendente" | "pago" | "atrasado";
  created_at?: string;
}

const mapRow = (row: any): Despesa => ({
  id: row.id,
  descricao: row.descricao,
  categoria: row.categoria || undefined,
  fornecedor: row.fornecedor || undefined,
  valor: Number(row.valor),
  forma_pagamento: row.forma_pagamento || undefined,
  vencimento: row.vencimento,
  observacoes: row.observacoes || undefined,
  status: row.status,
  created_at: row.created_at,
});

export const despesaService = {
  listar: async (): Promise<Despesa[]> => {
    const { data, error } = await supabase.from("despesa").select("*").order("vencimento", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  criar: async (dados: Omit<Despesa, "id" | "created_at">): Promise<Despesa> => {
    const { data, error } = await supabase.from("despesa").insert(dados).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  excluir: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("despesa").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
