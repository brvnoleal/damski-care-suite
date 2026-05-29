/**
 * Camada de serviço — Odontograma
 * Procedimentos odontológicos por dente (FDI).
 */
import { supabase } from "@/integrations/supabase/client";
import type { OdontogramaProcedimento, OdontogramaStatus, ToothState } from "@/types";

const TABLE = "odontograma_procedimento";

const mapRow = (row: any): OdontogramaProcedimento => ({
  id: row.id,
  paciente_id: row.paciente_id,
  dente: row.dente,
  status: row.status,
  procedimento: row.procedimento,
  valor: Number(row.valor || 0),
  dentista_id: row.dentista_id || undefined,
  observacoes: row.observacoes || undefined,
  data: row.data,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const odontogramaService = {
  listarPorPaciente: async (pacienteId: string): Promise<OdontogramaProcedimento[]> => {
    const { data, error } = await supabase
      .from(TABLE as any)
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  listarPorDente: async (
    pacienteId: string,
    dente: number
  ): Promise<OdontogramaProcedimento[]> => {
    const { data, error } = await supabase
      .from(TABLE as any)
      .select("*")
      .eq("paciente_id", pacienteId)
      .eq("dente", dente)
      .order("data", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  criar: async (
    payload: Omit<OdontogramaProcedimento, "id" | "created_at" | "updated_at">
  ): Promise<OdontogramaProcedimento> => {
    const { data, error } = await supabase
      .from(TABLE as any)
      .insert(payload as any)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  atualizar: async (
    id: string,
    payload: Partial<OdontogramaProcedimento>
  ): Promise<OdontogramaProcedimento> => {
    const { data, error } = await supabase
      .from(TABLE as any)
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  remover: async (id: string): Promise<void> => {
    const { error } = await supabase.from(TABLE as any).delete().eq("id", id);
    if (error) throw error;
  },
};

/**
 * Calcula o estado visual de cada dente a partir da lista de procedimentos.
 * Prioridade: removido > em_andamento > concluido > neutro.
 */
export const computeToothStates = (
  procedimentos: OdontogramaProcedimento[]
): Record<number, ToothState> => {
  const map: Record<number, ToothState> = {};
  for (const p of procedimentos) {
    const current = map[p.dente] || "neutro";
    const next = statusToState(p.status);
    map[p.dente] = mergeState(current, next);
  }
  return map;
};

const statusToState = (s: OdontogramaStatus): ToothState => {
  switch (s) {
    case "removido":
      return "removido";
    case "em_andamento":
      return "em_andamento";
    case "concluido":
      return "concluido";
    default:
      return "neutro";
  }
};

const priority: Record<ToothState, number> = {
  neutro: 0,
  concluido: 1,
  em_andamento: 2,
  removido: 3,
};

const mergeState = (a: ToothState, b: ToothState): ToothState =>
  priority[b] >= priority[a] ? b : a;
