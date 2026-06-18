import { supabase } from "@/integrations/supabase/client";

export interface AgendamentoInsumo {
  id: string;
  agendamento_id: string;
  insumo_id: string;
  quantidade: number;
  insumo_nome?: string;
  insumo_unidade?: string | null;
  estoque_atual?: number;
}

export const agendamentoInsumoService = {
  listarPorAgendamento: async (agendamentoId: string): Promise<AgendamentoInsumo[]> => {
    const { data, error } = await supabase
      .from("agendamento_insumo")
      .select("id, agendamento_id, insumo_id, quantidade, insumo:insumo_id(nome, unidade_medida, quantidade)")
      .eq("agendamento_id", agendamentoId);
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      agendamento_id: r.agendamento_id,
      insumo_id: r.insumo_id,
      quantidade: r.quantidade,
      insumo_nome: r.insumo?.nome,
      insumo_unidade: r.insumo?.unidade_medida,
      estoque_atual: r.insumo?.quantidade,
    }));
  },

  /**
   * Substitui os insumos do agendamento pela lista informada.
   * O trigger no banco cuida da baixa/restituição de estoque.
   */
  sincronizar: async (
    agendamento_id: string,
    itens: { insumo_id: string; quantidade: number }[]
  ): Promise<void> => {
    const { error: delErr } = await supabase
      .from("agendamento_insumo")
      .delete()
      .eq("agendamento_id", agendamento_id);
    if (delErr) throw delErr;
    const validos = itens.filter((i) => i.insumo_id && i.quantidade > 0);
    if (validos.length === 0) return;
    const payload = validos.map((i) => ({
      agendamento_id,
      insumo_id: i.insumo_id,
      quantidade: i.quantidade,
    }));
    const { error } = await supabase.from("agendamento_insumo").insert(payload as any);
    if (error) throw error;
  },
};
