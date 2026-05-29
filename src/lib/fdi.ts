/**
 * Constantes da notação dentária FDI (ISO 3950).
 * Permanente: quadrantes 1-4 (11..18, 21..28, 41..48, 31..38)
 * Decíduo: quadrantes 5-8 (51..55, 61..65, 81..85, 71..75)
 *
 * Ordem visual (esquerda → direita, do ponto de vista de quem olha o paciente):
 *  Arco superior: Q1 invertido + Q2 normal  → 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
 *  Arco inferior: Q4 invertido + Q3 normal  → 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38
 */

export type ToothType = "incisivo" | "canino" | "premolar" | "molar";

export const UPPER_PERMANENT: number[] = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
];
export const LOWER_PERMANENT: number[] = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

export const UPPER_DECIDUO: number[] = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const LOWER_DECIDUO: number[] = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

export const ALL_PERMANENT = [...UPPER_PERMANENT, ...LOWER_PERMANENT];
export const ALL_DECIDUO = [...UPPER_DECIDUO, ...LOWER_DECIDUO];

/**
 * Tipo do dente pelo segundo dígito FDI.
 * 1-2 incisivo, 3 canino, 4-5 pré-molar, 6-8 molar.
 * Decíduo: 1-2 incisivo, 3 canino, 4-5 molar (sem pré-molares).
 */
export const getToothType = (fdi: number): ToothType => {
  const pos = fdi % 10;
  const quad = Math.floor(fdi / 10);
  const isDeciduo = quad >= 5;
  if (pos <= 2) return "incisivo";
  if (pos === 3) return "canino";
  if (isDeciduo) return "molar"; // decíduo: 4 e 5 são molares
  if (pos <= 5) return "premolar";
  return "molar";
};
