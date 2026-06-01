/**
 * Camada de serviço — Agendamentos
 * Operações CRUD via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";
import { Agendamento } from "@/types";
import { notificationStore } from "@/stores/notificationStore";

const mapRow = (row: any): Agendamento => ({
  id: row.id,
  data: row.data,
  horario: typeof row.horario === "string" ? row.horario.slice(0, 5) : row.horario,
  horario_fim: row.horario_fim ? (typeof row.horario_fim === "string" ? row.horario_fim.slice(0, 5) : row.horario_fim) : undefined,
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
    const { data, error } = await supabase.from("agendamento").select("*").order("data", { ascending: false }).order("horario", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  buscarPorId: async (id: string): Promise<Agendamento | null> => {
    const { data, error } = await supabase.from("agendamento").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  criar: async (dados: Omit<Agendamento, "id" | "created_at">): Promise<Agendamento> => {
    const payload: any = { ...dados, horario_fim: dados.horario_fim ? dados.horario_fim : null };
    const { data, error } = await supabase.from("agendamento").insert(payload).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  criarVarios: async (lista: Omit<Agendamento, "id" | "created_at">[]): Promise<Agendamento[]> => {
    const payload = lista.map((d) => ({ ...d, horario_fim: d.horario_fim ? d.horario_fim : null }));
    const { data, error } = await supabase.from("agendamento").insert(payload).select();
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  atualizar: async (id: string, dados: Partial<Agendamento>): Promise<Agendamento | null> => {
    const { created_at, id: _, ...updateData } = dados as any;
    if ("horario_fim" in updateData) updateData.horario_fim = updateData.horario_fim ? updateData.horario_fim : null;
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
