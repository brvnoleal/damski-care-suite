import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number | string;
  onChange: (value: number) => void;
}

/**
 * Input monetário pt-BR com máscara de centavos em tempo real.
 * Cada dígito digitado é interpretado como centavo:
 * - "5"      -> "0,05"
 * - "50"     -> "0,50"
 * - "500"    -> "5,00"
 * - "50000"  -> "500,00"
 * Emite o valor numérico (reais) para o componente pai.
 */
const onlyDigits = (s: string) => s.replace(/\D/g, "");

const centsToBRL = (cents: number): string => {
  const n = cents / 100;
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const valueToCents = (v: number | string): number => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, placeholder = "0,00", ...props }, ref) => {
    const [display, setDisplay] = React.useState<string>(() => {
      const c = valueToCents(value);
      return c ? centsToBRL(c) : "";
    });

    React.useEffect(() => {
      const c = valueToCents(value);
      const formatted = c ? centsToBRL(c) : "";
      setDisplay((prev) => {
        // Evita sobrescrever enquanto o usuário digita o mesmo valor
        if (valueToCents(prev.replace(/\./g, "").replace(",", ".")) === c) return prev;
        return formatted;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
      <Input
        {...props}
        ref={ref}
        inputMode="numeric"
        placeholder={placeholder}
        className={cn(className)}
        value={display}
        onChange={(e) => {
          const digits = onlyDigits(e.target.value);
          if (!digits) {
            setDisplay("");
            onChange(0);
            return;
          }
          const cents = parseInt(digits, 10);
          setDisplay(centsToBRL(cents));
          onChange(cents / 100);
        }}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
