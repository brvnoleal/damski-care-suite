/**
 * Camada de serviço — Comissões (matriz dentista × procedimento).
 * Base de cálculo definida: somente quando o pagamento da consulta está como "pago".
 */
import { supabase } from "@/integrations/supabase/client";

export type ComissaoTipo = "percentual" | "fixo";

export interface ComissaoRecord {
  id: string;
  clinica_id: string;
  dentista_id: string;
  procedimento_id: string;
  tipo: ComissaoTipo;
  valor: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ComissaoInput {
  dentista_id: string;
  procedimento_id: string;
  tipo: ComissaoTipo;
  valor: number;
  ativo?: boolean;
}

export const comissaoService = {
  async list(): Promise<ComissaoRecord[]> {
    const { data, error } = await supabase
      .from("comissao")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as ComissaoRecord[];
  },

  async upsert(input: ComissaoInput): Promise<ComissaoRecord> {
    const { data, error } = await supabase
      .from("comissao")
      .upsert(input as any, { onConflict: "clinica_id,dentista_id,procedimento_id" })
      .select()
      .single();
    if (error) throw error;
    return data as ComissaoRecord;
  },

  async update(id: string, patch: Partial<ComissaoInput>): Promise<ComissaoRecord> {
    const { data, error } = await supabase
      .from("comissao")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ComissaoRecord;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("comissao").delete().eq("id", id);
    if (error) throw error;
  },

  /**
   * Calcula o valor de comissão devido para uma consulta.
   * Regra acordada: só conta quando o pagamento está como "pago".
   */
  calcular({
    statusPagamento,
    valorConsulta,
    comissao,
  }: {
    statusPagamento: string;
    valorConsulta: number;
    comissao?: Pick<ComissaoRecord, "tipo" | "valor" | "ativo"> | null;
  }): number {
    if (!comissao || !comissao.ativo) return 0;
    if (statusPagamento !== "pago") return 0;
    if (comissao.tipo === "fixo") return Number(comissao.valor) || 0;
    return ((Number(valorConsulta) || 0) * (Number(comissao.valor) || 0)) / 100;
  },
};
