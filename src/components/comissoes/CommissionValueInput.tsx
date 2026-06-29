/**
 * Input que formata automaticamente o valor da comissão.
 * - tipo "percentual" → mostra sufixo "%" e até 2 casas
 * - tipo "fixo"       → mostra prefixo "R$" e máscara monetária pt-BR
 *
 * Mantém o valor numérico (string com ponto) no estado pai via onChange,
 * mas exibe sempre formatado para o usuário.
 */
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComissaoTipo } from "@/services/comissaoService";

interface Props {
  tipo: ComissaoTipo;
  value: string; // string numérica em formato "ponto" (ex.: "12.5")
  onChange: (raw: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

/** Extrai somente dígitos e converte centavos → string ponto */
const onlyDigits = (s: string) => s.replace(/\D+/g, "");

const formatPercent = (raw: string) => {
  if (!raw) return "";
  // raw é "12" ou "12.5" ou "12.50"
  const num = Number(raw);
  if (Number.isNaN(num)) return "";
  // pt-BR com até 2 casas
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const formatMoney = (raw: string) => {
  if (!raw) return "";
  const num = Number(raw);
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const CommissionValueInput = ({
  tipo,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  ariaLabel,
}: Props) => {
  const display = useMemo(() => {
    if (tipo === "fixo") return formatMoney(value);
    return formatPercent(value);
  }, [tipo, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = onlyDigits(e.target.value);
    if (!digits) {
      onChange("");
      return;
    }
    if (tipo === "fixo") {
      // trata como centavos
      const cents = parseInt(digits, 10);
      onChange((cents / 100).toFixed(2));
    } else {
      // percentual: trata digits/100 como casa decimal (ex.: 1250 → 12.50)
      const cents = parseInt(digits, 10);
      // limita 100% (digits de 0..10000)
      const clamped = Math.min(cents, 10000);
      onChange((clamped / 100).toString());
    }
  };

  return (
    <div className={cn("relative", className)}>
      {tipo === "fixo" && (
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          R$
        </span>
      )}
      <Input
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        placeholder={placeholder ?? (tipo === "fixo" ? "0,00" : "0")}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          "h-9",
          tipo === "fixo" ? "pl-8 pr-2 text-right" : "pr-7 text-right",
        )}
      />
      {tipo === "percentual" && (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          %
        </span>
      )}
    </div>
  );
};

export default CommissionValueInput;
