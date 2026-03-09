/**
 * Camada de serviço — Pacientes
 * Operações CRUD via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";
import { Paciente } from "@/types";

const mapRow = (row: any): Paciente => ({
  id: row.id,
  nome: row.nome,
  cpf: row.cpf,
  telefone: row.telefone || "",
  email: row.email || "",
  instagram: row.instagram || undefined,
  data_nascimento: row.data_nascimento,
  cep: row.cep || undefined,
  estado: row.estado || undefined,
  cidade: row.cidade || undefined,
  bairro: row.bairro || undefined,
  rua: row.rua || undefined,
  numero: row.numero || undefined,
  complemento: row.complemento || undefined,
  ponto_referencia: row.ponto_referencia || undefined,
  status: row.status,
  created_at: row.created_at,
});

export const pacienteService = {
  listar: async (): Promise<Paciente[]> => {
    const { data, error } = await supabase.from("paciente").select("*").order("nome");
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  buscarPorId: async (id: string): Promise<Paciente | null> => {
    const { data, error } = await supabase.from("paciente").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  criar: async (dados: Omit<Paciente, "id" | "created_at">): Promise<Paciente> => {
    const { data, error } = await supabase.from("paciente").insert(dados).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  atualizar: async (id: string, dados: Partial<Paciente>): Promise<Paciente | null> => {
    const { created_at, id: _, ...updateData } = dados as any;
    const { data, error } = await supabase.from("paciente").update({ ...updateData, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  excluir: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("paciente").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
