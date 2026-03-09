/**
 * Camada de serviço — Agendamentos
 * Operações CRUD via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";
import { Agendamento } from "@/types";

const mapRow = (row: any): Agendamento => ({
  id: row.id,
  data: row.data,
  horario: typeof row.horario === "string" ? row.horario.slice(0, 5) : row.horario,
  paciente_id: row.paciente_id,
  dentista_id: row.dentista_id,
  procedimento: row.procedimento,
  status: row.status,
  valor: Number(row.valor),
  forma_pagamento: row.forma_pagamento,
  parcelas: row.parcelas,
  observacoes: row.observacoes || undefined,
  created_at: row.created_at,
});

export const agendamentoService = {
  listar: async (): Promise<Agendamento[]> => {
    const { data, error } = await supabase.from("agendamento").select("*").order("data", { ascending: false }).order("horario", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  buscarPorId: async (id: string): Promise<Agendamento | null> => {
    const { data, error } = await supabase.from("agendamento").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  criar: async (dados: Omit<Agendamento, "id" | "created_at">): Promise<Agendamento> => {
    const { data, error } = await supabase.from("agendamento").insert(dados).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  atualizar: async (id: string, dados: Partial<Agendamento>): Promise<Agendamento | null> => {
    const { created_at, id: _, ...updateData } = dados as any;
    const { data, error } = await supabase.from("agendamento").update({ ...updateData, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  excluir: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("agendamento").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
