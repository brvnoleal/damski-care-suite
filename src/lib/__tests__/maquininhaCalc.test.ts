import { describe, it, expect } from "vitest";
import { calcularTaxa } from "@/lib/maquininhaCalc";
import { emptyTaxa, type MaquininhaConfig } from "@/lib/configuracoesPrefs";

const buildMaq = (overrides?: Partial<MaquininhaConfig["taxa"]>): MaquininhaConfig => {
  const taxa = emptyTaxa();
  taxa.pix = 0.99;
  taxa.debito = 1.5;
  // crédito: 1x=3.15, 2x=3.99, 3x=4.5, 12x=12.5
  taxa.credito[1] = 3.15;
  taxa.credito[2] = 3.99;
  taxa.credito[3] = 4.5;
  taxa.credito[12] = 12.5;
  return {
    id: "test",
    nome: "Teste",
    ativa: true,
    taxa: { ...taxa, ...(overrides || {}) },
  };
};

describe("calcularTaxa", () => {
  const maq = buildMaq();

  it("PIX aplica taxa de PIX, força 1 parcela", () => {
    const r = calcularTaxa(1000, "pix", 4, maq);
    expect(r.parcelasEfetivas).toBe(1);
    expect(r.taxaPercent).toBe(0.99);
    expect(r.valorTaxa).toBe(9.9);
    expect(r.valorLiquido).toBe(990.1);
    expect(r.valorParcela).toBe(1000);
  });

  it("Débito aplica taxa de débito, força 1 parcela", () => {
    const r = calcularTaxa(500, "debito", 6, maq);
    expect(r.parcelasEfetivas).toBe(1);
    expect(r.taxaPercent).toBe(1.5);
    expect(r.valorTaxa).toBe(7.5);
    expect(r.valorLiquido).toBe(492.5);
    expect(r.valorParcela).toBe(500);
  });

  it("Crédito 1x usa taxa da parcela 1", () => {
    const r = calcularTaxa(1000, "credito", 1, maq);
    expect(r.parcelasEfetivas).toBe(1);
    expect(r.taxaPercent).toBe(3.15);
    expect(r.valorTaxa).toBe(31.5);
    expect(r.valorLiquido).toBe(968.5);
    expect(r.valorParcela).toBe(1000);
  });

  it("Crédito 3x divide o valor da parcela corretamente", () => {
    const r = calcularTaxa(900, "credito", 3, maq);
    expect(r.parcelasEfetivas).toBe(3);
    expect(r.taxaPercent).toBe(4.5);
    expect(r.valorTaxa).toBe(40.5);
    expect(r.valorLiquido).toBe(859.5);
    expect(r.valorParcela).toBe(300);
  });

  it("Crédito acima de 12 limita em 12x", () => {
    const r = calcularTaxa(1200, "credito", 50, maq);
    expect(r.parcelasEfetivas).toBe(12);
    expect(r.taxaPercent).toBe(12.5);
    expect(r.valorTaxa).toBe(150);
    expect(r.valorLiquido).toBe(1050);
    expect(r.valorParcela).toBe(100);
  });

  it("Crédito 0 ou negativo cai para 1x", () => {
    const r = calcularTaxa(100, "credito", 0, maq);
    expect(r.parcelasEfetivas).toBe(1);
    const r2 = calcularTaxa(100, "credito", -5, maq);
    expect(r2.parcelasEfetivas).toBe(1);
  });

  it("Dinheiro/boleto não aplicam taxa", () => {
    const r1 = calcularTaxa(1000, "dinheiro", 1, maq);
    expect(r1.taxaPercent).toBe(0);
    expect(r1.valorLiquido).toBe(1000);
    const r2 = calcularTaxa(1000, "boleto", 1, maq);
    expect(r2.taxaPercent).toBe(0);
    expect(r2.valorLiquido).toBe(1000);
  });

  it("Sem maquininha (null) zera a taxa", () => {
    const r = calcularTaxa(1000, "credito", 3, null);
    expect(r.maquininha).toBeNull();
    expect(r.taxaPercent).toBe(0);
    expect(r.valorTaxa).toBe(0);
    expect(r.valorLiquido).toBe(1000);
    expect(r.parcelasEfetivas).toBe(3);
    expect(r.valorParcela).toBeCloseTo(333.33, 2);
  });

  it("Valor 0 ou negativo retorna tudo zerado", () => {
    const r = calcularTaxa(0, "credito", 2, maq);
    expect(r.valorTaxa).toBe(0);
    expect(r.valorLiquido).toBe(0);
    expect(r.valorParcela).toBe(0);

    const r2 = calcularTaxa(-100, "pix", 1, maq);
    expect(r2.valorLiquido).toBe(0);
  });

  it("Taxa negativa ou >100 é normalizada", () => {
    const negTaxa = emptyTaxa();
    negTaxa.pix = -5;
    const m: MaquininhaConfig = { id: "x", nome: "X", ativa: true, taxa: negTaxa };
    const r = calcularTaxa(100, "pix", 1, m);
    expect(r.taxaPercent).toBe(0);

    const bigTaxa = emptyTaxa();
    bigTaxa.debito = 500;
    const m2: MaquininhaConfig = { id: "y", nome: "Y", ativa: true, taxa: bigTaxa };
    const r2 = calcularTaxa(100, "debito", 1, m2);
    expect(r2.taxaPercent).toBe(100);
    expect(r2.valorLiquido).toBe(0);
  });

  it("Líquido + Taxa = Valor original (consistência)", () => {
    [100, 250.5, 999.99, 1234.56].forEach((v) => {
      [1, 2, 6, 12].forEach((p) => {
        const r = calcularTaxa(v, "credito", p, maq);
        expect(Math.abs(r.valorLiquido + r.valorTaxa - v)).toBeLessThan(0.02);
      });
    });
  });

  it("Soma das parcelas é coerente com valor total", () => {
    const r = calcularTaxa(1000, "credito", 3, maq);
    // 3 * 333.33 = 999.99 — diferença de centavos aceitável
    expect(Math.abs(r.valorParcela * r.parcelasEfetivas - 1000)).toBeLessThan(0.05);
  });
});
