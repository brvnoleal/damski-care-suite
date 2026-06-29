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

// Tags aplicáveis a um agendamento (consulta). Reaproveita o vocabulário
// das etiquetas de paciente para consistência visual.
export type TagAgendamento = "primeira_consulta" | "cirurgia" | "paciente_finalizado";

export const AGENDAMENTO_TAG_OPTIONS: {
  value: TagAgendamento;
  label: string;
  className: string;
  dotClass: string;
  borderClass: string;
}[] = [
  {
    value: "primeira_consulta",
    label: "Primeira Consulta",
    className: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-300",
    dotClass: "bg-blue-500",
    borderClass: "border-l-blue-500",
  },
  {
    value: "cirurgia",
    label: "Cirurgia",
    className: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-300",
    dotClass: "bg-red-500",
    borderClass: "border-l-red-500",
  },
  {
    value: "paciente_finalizado",
    label: "Paciente Finalizado",
    className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
    borderClass: "border-l-emerald-500",
  },
];

export const AGENDAMENTO_TAG_LABELS: Record<string, string> = Object.fromEntries(
  AGENDAMENTO_TAG_OPTIONS.map((t) => [t.value, t.label]),
);

export const agendamentoTagClassName = (value: string): string =>
  AGENDAMENTO_TAG_OPTIONS.find((t) => t.value === value)?.className ||
  "bg-muted text-foreground border-border";

export const agendamentoTagDotClass = (value: string): string =>
  AGENDAMENTO_TAG_OPTIONS.find((t) => t.value === value)?.dotClass || "bg-muted-foreground";

export const agendamentoTagBorderClass = (value: string): string =>
  AGENDAMENTO_TAG_OPTIONS.find((t) => t.value === value)?.borderClass || "border-l-transparent";

// ---------- Etiquetas customizadas (persistidas em localStorage) ----------
export type CustomAgendamentoTag = { value: string; label: string; color: string };
const CUSTOM_TAGS_KEY = "agendamento_etiquetas_custom_v1";

export const getCustomAgendamentoTags = (): CustomAgendamentoTag[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_TAGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomAgendamentoTag = (label: string, color: string): CustomAgendamentoTag => {
  const list = getCustomAgendamentoTags();
  const value = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const tag: CustomAgendamentoTag = { value, label, color };
  list.push(tag);
  localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(list));
  return tag;
};

export const deleteCustomAgendamentoTag = (value: string) => {
  const list = getCustomAgendamentoTags().filter((t) => t.value !== value);
  localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(list));
};

export const resolveAgendamentoTagDisplay = (
  value: string,
): { label: string; style?: React.CSSProperties; className: string; dotStyle?: React.CSSProperties; dotClass?: string } => {
  const built = AGENDAMENTO_TAG_OPTIONS.find((t) => t.value === value);
  if (built) {
    return { label: built.label, className: built.className, dotClass: built.dotClass };
  }
  const custom = getCustomAgendamentoTags().find((t) => t.value === value);
  if (custom) {
    return {
      label: custom.label,
      className: "border",
      style: { backgroundColor: `${custom.color}26`, color: custom.color, borderColor: `${custom.color}55` },
      dotStyle: { backgroundColor: custom.color },
    };
  }
  return { label: value, className: "bg-muted text-foreground border-border" };
};

