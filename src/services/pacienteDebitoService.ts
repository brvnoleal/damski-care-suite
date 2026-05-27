/**
 * Camada de serviço — Débitos do paciente
 */
import { supabase } from "@/integrations/supabase/client";

export interface PacienteDebito {
  id: string;
  paciente_id: string;
  descricao: string;
  valor: number;
  forma_pagamento?: string | null;
  data_vencimento: string;
  modalidade: "avista" | "parcelado";
  parcelas: number;
  status: "pendente" | "pago" | "atrasado";
  created_at?: string;
}

const mapRow = (row: any): PacienteDebito => ({
  id: row.id,
  paciente_id: row.paciente_id,
  descricao: row.descricao,
  valor: Number(row.valor),
  forma_pagamento: row.forma_pagamento,
  data_vencimento: row.data_vencimento,
  modalidade: row.modalidade,
  parcelas: row.parcelas,
  status: row.status,
  created_at: row.created_at,
});

export const pacienteDebitoService = {
  listarPorPaciente: async (pacienteId: string): Promise<PacienteDebito[]> => {
    const { data, error } = await (supabase as any)
      .from("paciente_debito")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("data_vencimento", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  criar: async (dados: Omit<PacienteDebito, "id" | "created_at" | "status"> & { status?: PacienteDebito["status"] }): Promise<PacienteDebito> => {
    const { data, error } = await (supabase as any)
      .from("paciente_debito")
      .insert(dados)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  },
};
