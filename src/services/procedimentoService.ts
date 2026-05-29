import { supabase } from "@/integrations/supabase/client";

export interface ProcedimentoRecord {
  id: string;
  nome: string;
  plano: string | null;
  especialidade: string | null;
  preco: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProcedimentoInput {
  nome: string;
  plano?: string | null;
  especialidade?: string | null;
  preco: number;
}

export const procedimentoService = {
  async list(): Promise<ProcedimentoRecord[]> {
    const { data, error } = await supabase
      .from("procedimento")
      .select("*")
      .order("nome", { ascending: true });
    if (error) throw error;
    return (data || []) as ProcedimentoRecord[];
  },

  async create(input: ProcedimentoInput): Promise<ProcedimentoRecord> {
    const { data, error } = await supabase
      .from("procedimento")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as ProcedimentoRecord;
  },

  async update(id: string, input: ProcedimentoInput): Promise<ProcedimentoRecord> {
    const { data, error } = await supabase
      .from("procedimento")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ProcedimentoRecord;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("procedimento").delete().eq("id", id);
    if (error) throw error;
  },
};
