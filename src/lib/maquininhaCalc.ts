/**
 * Cálculo automático de taxas de maquininhas sobre recebimentos.
 * Usa a primeira maquininha marcada como ativa em Configurações.
 */
import { maquininhasStore, type MaquininhaConfig } from "@/lib/configuracoesPrefs";
import type { FormaPagamento } from "@/types";

export interface TaxaResultado {
  /** Maquininha usada no cálculo (null se nenhuma ativa ou forma sem taxa). */
  maquininha: MaquininhaConfig | null;
  /** Taxa percentual aplicada (0..100). */
  taxaPercent: number;
  /** Valor descontado (R$). */
  valorTaxa: number;
  /** Valor líquido após desconto (R$). */
  valorLiquido: number;
}

const getMaquininhaAtiva = (): MaquininhaConfig | null => {
  const items = maquininhasStore.load();
  return items.find((m) => m.ativa) || null;
};

export const calcularTaxa = (
  valor: number,
  forma: FormaPagamento | string | null | undefined,
  parcelas: number = 1,
): TaxaResultado => {
  const base = Number(valor) || 0;
  const m = getMaquininhaAtiva();
  let taxaPercent = 0;
  if (m) {
    if (forma === "pix") taxaPercent = m.taxa.pix || 0;
    else if (forma === "debito") taxaPercent = m.taxa.debito || 0;
    else if (forma === "credito") {
      const p = Math.max(1, Math.min(12, Number(parcelas) || 1));
      taxaPercent = m.taxa.credito?.[p] || 0;
    }
  }
  const valorTaxa = +((base * taxaPercent) / 100).toFixed(2);
  const valorLiquido = +(base - valorTaxa).toFixed(2);
  return { maquininha: m, taxaPercent, valorTaxa, valorLiquido };
};

export const formatBRL = (n: number) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
