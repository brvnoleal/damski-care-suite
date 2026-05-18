/**
 * Camada de serviço — Sessões clínicas (atendimentos / evoluções)
 * Persistência via Supabase, RLS gated por role.
 */
import { supabase } from "@/integrations/supabase/client";

export interface Sessao {
  id: string;
  paciente_id: string;
  dentista_id?: string | null;
  agendamento_id?: string | null;
  data: string; // ISO yyyy-mm-dd
  procedimento: string;
  tecnica?: string | null;
  substancia_lote?: string | null;
  assinado: boolean;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SessaoComPaciente extends Sessao {
  paciente_nome?: string;
}

const mapRow = (row: any): Sessao => ({
  id: row.id,
  paciente_id: row.paciente_id,
  dentista_id: row.dentista_id,
  agendamento_id: row.agendamento_id,
  data: row.data,
  procedimento: row.procedimento,
  tecnica: row.tecnica,
  substancia_lote: row.substancia_lote,
  assinado: !!row.assinado,
  observacoes: row.observacoes,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const sessaoService = {
  listar: async (): Promise<SessaoComPaciente[]> => {
    const { data, error } = await supabase
      .from("sessao")
      .select("*, paciente:paciente_id(nome)")
      .order("data", { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...mapRow(row),
      paciente_nome: row.paciente?.nome,
    }));
  },

  listarPorPaciente: async (pacienteId: string): Promise<Sessao[]> => {
    const { data, error } = await supabase
      .from("sessao")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("data", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  criar: async (
    dados: Omit<Sessao, "id" | "created_at" | "updated_at">,
  ): Promise<Sessao> => {
    const { data, error } = await supabase
      .from("sessao")
      .insert(dados)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  atualizar: async (id: string, dados: Partial<Sessao>): Promise<Sessao> => {
    const { id: _, created_at, updated_at, ...payload } = dados as any;
    const { data, error } = await supabase
      .from("sessao")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  excluir: async (id: string): Promise<void> => {
    const { error } = await supabase.from("sessao").delete().eq("id", id);
    if (error) throw error;
  },
};
