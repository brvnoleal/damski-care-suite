import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number | string;
  onChange: (value: number) => void;
}

/**
 * Input monetário pt-BR.
 * - Aceita apenas dígitos, vírgula e ponto.
 * - Ao perder o foco, formata como "N,NN" (ex.: 500 -> 500,00).
 * - Emite valor numérico para o componente pai.
 */
const parseNumeric = (raw: string): number => {
  if (!raw) return 0;
  const cleaned = raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const formatBRL = (n: number): string =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const toDisplay = (v: number | string): string => {
  if (v === "" || v === null || v === undefined) return "";
  const n = typeof v === "number" ? v : parseNumeric(v);
  if (!n) return typeof v === "string" ? v : "";
  return formatBRL(n);
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, onBlur, onFocus, placeholder = "0,00", ...props }, ref) => {
    const [display, setDisplay] = React.useState<string>(() => toDisplay(value));
    const [focused, setFocused] = React.useState(false);

    React.useEffect(() => {
      if (!focused) setDisplay(toDisplay(value));
    }, [value, focused]);

    return (
      <Input
        {...props}
        ref={ref}
        inputMode="decimal"
        placeholder={placeholder}
        className={cn(className)}
        value={display}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d.,]/g, "");
          setDisplay(raw);
          onChange(parseNumeric(raw));
        }}
        onBlur={(e) => {
          setFocused(false);
          const n = parseNumeric(display);
          setDisplay(n ? formatBRL(n) : "");
          onChange(n);
          onBlur?.(e);
        }}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
