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
 * A cor do dente reflete o STATUS DO ÚLTIMO registro lançado naquele dente
 * (ordenado por data e, em caso de empate, por updated_at/created_at).
 * Regra especial: extração concluída marca o dente como "removido".
 */
export const computeToothStates = (
  procedimentos: OdontogramaProcedimento[]
): Record<number, ToothState> => {
  // Agrupa por dente e mantém apenas o registro mais recente
  const latestByTooth: Record<number, OdontogramaProcedimento> = {};
  for (const p of procedimentos) {
    const current = latestByTooth[p.dente];
    if (!current || compareRecency(p, current) > 0) {
      latestByTooth[p.dente] = p;
    }
  }

  const map: Record<number, ToothState> = {};
  for (const [dente, p] of Object.entries(latestByTooth)) {
    const isExtracaoConcluida =
      p.procedimento === "extracao" && p.status === "concluido";
    map[Number(dente)] = isExtracaoConcluida ? "removido" : statusToState(p.status);
  }
  return map;
};

const recencyKey = (p: OdontogramaProcedimento): number => {
  const ts = p.updated_at || p.created_at;
  const tsMs = ts ? new Date(ts).getTime() : 0;
  const dataMs = p.data ? new Date(p.data).getTime() : 0;
  // Prioriza a data clínica; usa timestamp como desempate
  return dataMs * 1e6 + (isNaN(tsMs) ? 0 : tsMs / 1000);
};

const compareRecency = (
  a: OdontogramaProcedimento,
  b: OdontogramaProcedimento
): number => recencyKey(a) - recencyKey(b);

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

