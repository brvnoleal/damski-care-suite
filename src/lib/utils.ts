import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mascara CPF para exibição conforme LGPD: mostra apenas os 3 primeiros dígitos.
 * Ex.: "123.456.789-12" -> "123.***.***-**"
 */
export function maskCpf(cpf?: string | null): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 3) return cpf;
  return `${digits.slice(0, 3)}.***.***-**`;
}
