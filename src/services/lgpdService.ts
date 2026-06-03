/**
 * Camada de serviço — LGPD
 * Consentimentos, exportação (portabilidade) e anonimização (direito ao esquecimento).
 */
import { supabase } from "@/integrations/supabase/client";

export interface Consentimento {
  id: string;
  paciente_id: string;
  finalidade: string;
  versao: string;
  conteudo: string;
  aceito: boolean;
  aceito_em: string;
  revogado_em?: string | null;
}

export const lgpdService = {
  listarConsentimentos: async (pacienteId: string): Promise<Consentimento[]> => {
    const { data, error } = await supabase
      .from("paciente_consentimento" as any)
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as Consentimento[];
  },

  registrarConsentimento: async (input: {
    paciente_id: string;
    finalidade: string;
    conteudo: string;
    versao?: string;
  }): Promise<void> => {
    const { error } = await supabase.from("paciente_consentimento" as any).insert({
      paciente_id: input.paciente_id,
      finalidade: input.finalidade,
      conteudo: input.conteudo,
      versao: input.versao || "1.0",
      aceito: true,
    });
    if (error) throw error;
  },

  revogarConsentimento: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("paciente_consentimento" as any)
      .update({ aceito: false, revogado_em: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  exportarDados: async (pacienteId: string): Promise<any> => {
    const { data, error } = await supabase.rpc("exportar_dados_paciente" as any, {
      _paciente_id: pacienteId,
    });
    if (error) throw error;
    return data;
  },

  anonimizar: async (pacienteId: string): Promise<void> => {
    const { error } = await supabase.rpc("anonimizar_paciente" as any, {
      _paciente_id: pacienteId,
    });
    if (error) throw error;
  },
};
