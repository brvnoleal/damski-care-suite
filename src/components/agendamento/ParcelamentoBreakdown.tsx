/**
 * Exibe o detalhamento de parcelamento ao paciente: valor da parcela,
 * taxa aplicada da maquininha, total com juros e líquido recebido pela clínica.
 * Facilita o entendimento do paciente sobre o custo real do parcelamento.
 */
import { calcularTaxa, formatBRL } from "@/lib/maquininhaCalc";
import type { FormaPagamento } from "@/types";
import { Info } from "lucide-react";

interface Props {
  valor: number;
  forma: FormaPagamento | string;
  parcelas: number;
}

export const ParcelamentoBreakdown = ({ valor, forma, parcelas }: Props) => {
  const base = Number(valor) || 0;
  if (base <= 0) return null;

  // Aplica taxa só para formas eletrônicas
  if (forma !== "credito" && forma !== "debito" && forma !== "pix") return null;

  const { maquininha, taxaPercent, valorTaxa, valorLiquido, parcelasEfetivas, valorParcela } =
    calcularTaxa(base, forma, parcelas);
  const n = parcelasEfetivas;

  return (
    <div className="rounded-xl border border-border/50 bg-primary/5 p-3 text-sm space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
        <Info className="w-3.5 h-3.5" />
        Detalhamento do pagamento
      </div>
      <div className="flex justify-between"><span className="text-muted-foreground">Valor total:</span><span className="font-medium">{formatBRL(base)}</span></div>
      {n > 1 && (
        <div className="flex justify-between"><span className="text-muted-foreground">{n}x de:</span><span className="font-medium">{formatBRL(valorParcela)}</span></div>
      )}
      {maquininha ? (
        <>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Maquininha:</span><span>{maquininha.nome}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Taxa aplicada:</span><span className="text-warning">{taxaPercent.toFixed(2)}% ({formatBRL(valorTaxa)})</span></div>
          <div className="flex justify-between border-t border-border/40 pt-1.5 mt-1"><span className="text-muted-foreground">Líquido para a clínica:</span><span className="font-semibold text-success">{formatBRL(valorLiquido)}</span></div>
        </>
      ) : (
        <p className="text-[11px] text-muted-foreground">Configure uma maquininha ativa em Configurações para ver as taxas.</p>
      )}
    </div>
  );
};
