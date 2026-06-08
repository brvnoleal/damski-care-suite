/**
 * Serviço de Anamnese — operações autenticadas (lado clínica).
 * O preenchimento público é feito via edge functions.
 */
import { supabase } from "@/integrations/supabase/client";

export interface AnamneseRecord {
  id: string;
  paciente_id: string;
  clinica_id: string;
  versao: number;
  respostas: Record<string, any>;
  assinatura_paciente: string;
  assinatura_ip: string | null;
  assinatura_user_agent: string | null;
  assinatura_em: string;
  origem: "link_publico" | "link_individual" | "tablet_recepcao" | "interno";
  token_id: string | null;
  created_at: string;
}

export interface AnamneseToken {
  id: string;
  clinica_id: string;
  paciente_id: string | null;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export const anamneseService = {
  async listarPorPaciente(pacienteId: string): Promise<AnamneseRecord[]> {
    const { data, error } = await supabase
      .from("paciente_anamnese")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("versao", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as AnamneseRecord[];
  },

  async gerarTokenIndividual(pacienteId: string | null): Promise<AnamneseToken> {
    const { data, error } = await supabase
      .from("anamnese_token")
      .insert({ paciente_id: pacienteId } as any)
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as AnamneseToken;
  },
};
