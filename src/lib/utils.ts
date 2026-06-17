import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Valida um CPF brasileiro via algoritmo dos dígitos verificadores.
 * Rejeita CPFs com todos os dígitos iguais (ex.: 111.111.111-11).
 */
export function isValidCpf(cpf?: string | null): boolean {
  if (!cpf) return false;
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  let weight = 10;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * weight;
    weight--;
  }
  let firstCheck = 11 - (sum % 11);
  if (firstCheck > 9) firstCheck = 0;
  if (parseInt(digits[9], 10) !== firstCheck) return false;

  sum = 0;
  weight = 11;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * weight;
    weight--;
  }
  let secondCheck = 11 - (sum % 11);
  if (secondCheck > 9) secondCheck = 0;
  if (parseInt(digits[10], 10) !== secondCheck) return false;

  return true;
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

/**
 * Gera um slug URL-friendly a partir de um texto (remove acentos, espaços e caracteres especiais).
 */
export function slugify(text?: string | null): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

