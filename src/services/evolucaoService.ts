/**
 * Camada de serviço — Evoluções clínicas do paciente
 */
import { supabase } from "@/integrations/supabase/client";

export interface Evolucao {
  id: string;
  paciente_id: string;
  dentista_id?: string | null;
  data: string;
  conteudo: string;
  created_at?: string;
  dentista_nome?: string;
}

const mapRow = (row: any): Evolucao => ({
  id: row.id,
  paciente_id: row.paciente_id,
  dentista_id: row.dentista_id,
  data: row.data,
  conteudo: row.conteudo,
  created_at: row.created_at,
  dentista_nome: row.dentista?.nome,
});

export const evolucaoService = {
  listarPorPaciente: async (pacienteId: string): Promise<Evolucao[]> => {
    const { data, error } = await (supabase as any)
      .from("evolucao")
      .select("*, dentista:dentista_id(nome)")
      .eq("paciente_id", pacienteId)
      .order("data", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  criar: async (dados: Omit<Evolucao, "id" | "created_at" | "dentista_nome">): Promise<Evolucao> => {
    const { data, error } = await (supabase as any)
      .from("evolucao")
      .insert(dados)
      .select("*, dentista:dentista_id(nome)")
      .single();
    if (error) throw error;
    return mapRow(data);
  },
};
