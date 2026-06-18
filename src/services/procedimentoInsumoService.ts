import { supabase } from "@/integrations/supabase/client";

export interface ProcedimentoInsumo {
  id: string;
  procedimento_id: string;
  insumo_id: string;
  quantidade: number;
  // joined
  insumo_nome?: string;
  insumo_unidade?: string | null;
  estoque_atual?: number;
}

export const procedimentoInsumoService = {
  listarPorProcedimento: async (procedimentoId: string): Promise<ProcedimentoInsumo[]> => {
    const { data, error } = await supabase
      .from("procedimento_insumo")
      .select("id, procedimento_id, insumo_id, quantidade, insumo:insumo_id(nome, unidade_medida, quantidade)")
      .eq("procedimento_id", procedimentoId);
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      procedimento_id: r.procedimento_id,
      insumo_id: r.insumo_id,
      quantidade: r.quantidade,
      insumo_nome: r.insumo?.nome,
      insumo_unidade: r.insumo?.unidade_medida,
      estoque_atual: r.insumo?.quantidade,
    }));
  },

  listarPorProcedimentoNome: async (nome: string): Promise<ProcedimentoInsumo[]> => {
    const { data: proc, error: pErr } = await supabase
      .from("procedimento")
      .select("id")
      .eq("nome", nome)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!proc) return [];
    return procedimentoInsumoService.listarPorProcedimento(proc.id);
  },

  adicionar: async (procedimento_id: string, insumo_id: string, quantidade: number): Promise<ProcedimentoInsumo> => {
    const { data, error } = await supabase
      .from("procedimento_insumo")
      .insert({ procedimento_id, insumo_id, quantidade } as any)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  atualizar: async (id: string, quantidade: number): Promise<void> => {
    const { error } = await supabase.from("procedimento_insumo").update({ quantidade }).eq("id", id);
    if (error) throw error;
  },

  remover: async (id: string): Promise<void> => {
    const { error } = await supabase.from("procedimento_insumo").delete().eq("id", id);
    if (error) throw error;
  },
};
