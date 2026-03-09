/**
 * Camada de serviço — Dentistas
 * Operações CRUD via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";
import { Dentista } from "@/types";

const mapRow = (row: any): Dentista => ({
  id: row.id,
  nome: row.nome,
  especialidade: row.especialidade,
  cro: row.cro,
  telefone: row.telefone || undefined,
  email: row.email || undefined,
  instagram: row.instagram || undefined,
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

export const dentistaService = {
  listar: async (): Promise<Dentista[]> => {
    const { data, error } = await supabase.from("dentista").select("*").order("nome");
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  buscarPorId: async (id: string): Promise<Dentista | null> => {
    const { data, error } = await supabase.from("dentista").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  criar: async (dados: Omit<Dentista, "id" | "created_at">): Promise<Dentista> => {
    const { data, error } = await supabase.from("dentista").insert(dados).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  atualizar: async (id: string, dados: Partial<Dentista>): Promise<Dentista | null> => {
    const { created_at, id: _, ...updateData } = dados as any;
    const { data, error } = await supabase.from("dentista").update({ ...updateData, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  excluir: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("dentista").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
