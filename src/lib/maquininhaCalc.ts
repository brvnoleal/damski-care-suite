/**
 * Cálculo automático de taxas de maquininhas sobre recebimentos.
 * Usa, por padrão, a primeira maquininha marcada como ativa em Configurações,
 * mas aceita uma maquininha explícita (útil para testes determinísticos).
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
  /** Número efetivo de parcelas (sempre 1 para PIX/débito). */
  parcelasEfetivas: number;
  /** Valor de cada parcela (R$). */
  valorParcela: number;
}

const getMaquininhaAtiva = (): MaquininhaConfig | null => {
  const items = maquininhasStore.load();
  return items.find((m) => m.ativa) || null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export const calcularTaxa = (
  valor: number,
  forma: FormaPagamento | string | null | undefined,
  parcelas: number = 1,
  maquininhaOverride?: MaquininhaConfig | null,
): TaxaResultado => {
  const base = Math.max(0, Number(valor) || 0);
  const m = maquininhaOverride !== undefined ? maquininhaOverride : getMaquininhaAtiva();

  // PIX e débito sempre 1 parcela; crédito entre 1 e 12.
  const parcelasEfetivas =
    forma === "credito" ? Math.max(1, Math.min(12, Math.floor(Number(parcelas) || 1))) : 1;

  let taxaPercent = 0;
  if (m && base > 0) {
    if (forma === "pix") taxaPercent = Number(m.taxa.pix) || 0;
    else if (forma === "debito") taxaPercent = Number(m.taxa.debito) || 0;
    else if (forma === "credito") taxaPercent = Number(m.taxa.credito?.[parcelasEfetivas]) || 0;
  }
  // Sanidade: taxa não pode ser negativa nem >100%.
  taxaPercent = Math.max(0, Math.min(100, taxaPercent));

  const valorTaxa = round2((base * taxaPercent) / 100);
  const valorLiquido = round2(base - valorTaxa);
  const valorParcela = parcelasEfetivas > 0 ? round2(base / parcelasEfetivas) : 0;

  return { maquininha: m ?? null, taxaPercent, valorTaxa, valorLiquido, parcelasEfetivas, valorParcela };
};

export const formatBRL = (n: number) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
