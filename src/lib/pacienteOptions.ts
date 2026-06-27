// Opções de indicação e etiquetas do paciente

export const INDICACAO_OPTIONS: { value: string; label: string; pessoa?: boolean }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "google", label: "Google" },
  { value: "site", label: "Site / Outras Redes" },
  { value: "amigo", label: "Amigo", pessoa: true },
  { value: "conhecido", label: "Conhecido", pessoa: true },
  { value: "familiar", label: "Familiar", pessoa: true },
];

export const INDICACAO_LABELS: Record<string, string> = Object.fromEntries(
  INDICACAO_OPTIONS.map((o) => [o.value, o.label]),
);

export const indicacaoExigeNome = (value?: string) =>
  !!value && ["amigo", "conhecido", "familiar"].includes(value);

export type TagPaciente = "primeira_consulta" | "retorno" | "cirurgia" | "paciente_finalizado";

export const TAG_OPTIONS: { value: TagPaciente; label: string; className: string }[] = [
  { value: "primeira_consulta", label: "Primeira Consulta", className: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-300" },
  { value: "retorno", label: "Retorno", className: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300" },
  { value: "cirurgia", label: "Cirurgia", className: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-300" },
  { value: "paciente_finalizado", label: "Paciente Finalizado", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300" },
];

export const TAG_LABELS: Record<string, string> = Object.fromEntries(
  TAG_OPTIONS.map((t) => [t.value, t.label]),
);

export const tagClassName = (value: string): string =>
  TAG_OPTIONS.find((t) => t.value === value)?.className ||
  "bg-muted text-foreground border-border";
