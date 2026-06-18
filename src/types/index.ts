// ============================================
// Tipos do domínio — SaaS Odonto SaaS
// Arquitetura em camadas: Types → Services → Pages
// ============================================

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  rg?: string;
  emissor?: string;
  sexo?: string;
  estado_civil?: string;
  situacao_profissional?: string;
  plano?: string;
  numero_plano?: string;
  numero_prontuario?: string;
  telefone: string;
  email: string;
  instagram?: string;
  data_nascimento: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  ponto_referencia?: string;
  avatar_url?: string;
  status: "ativo" | "inativo";
  created_at?: string;
}

export interface Dentista {
  id: string;
  nome: string;
  especialidade: string;
  cro: string;
  telefone?: string;
  email?: string;
  instagram?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  ponto_referencia?: string;
  status: "ativo" | "inativo";
  created_at?: string;
}

export type ProcedimentoConsulta =
  | "limpeza"
  | "restauracao"
  | "extracao"
  | "canal"
  | "clareamento"
  | "ortodontia"
  | "implante"
  | "protese"
  | "avaliacao"
  | "retorno"
  | "urgencia"
  | "outro";

export const procedimentoConsultaLabels: Record<ProcedimentoConsulta, string> = {
  limpeza: "Limpeza",
  restauracao: "Restauração",
  extracao: "Extração",
  canal: "Tratamento de Canal",
  clareamento: "Clareamento",
  ortodontia: "Ortodontia",
  implante: "Implante",
  protese: "Prótese",
  avaliacao: "Avaliação",
  retorno: "Retorno",
  urgencia: "Urgência",
  outro: "Outro",
};

export type FormaPagamento = "pix" | "credito" | "debito" | "dinheiro" | "boleto";

export const formaPagamentoLabels: Record<FormaPagamento, string> = {
  pix: "PIX",
  credito: "Cartão de Crédito",
  debito: "Cartão de Débito",
  dinheiro: "Dinheiro",
  boleto: "Boleto",
};

export interface Agendamento {
  id: string;
  data: string;
  horario: string;
  horario_fim?: string;
  paciente_id: string;
  dentista_id: string;
  procedimento: ProcedimentoConsulta | string;
  status: "agendado" | "confirmado" | "realizado" | "cancelado" | "nao_compareceu";
  valor: number;
  forma_pagamento: FormaPagamento;
  parcelas: number;
  status_pagamento: "pendente" | "pago";
  observacoes?: string;
  created_at?: string;
}

export interface Procedimento {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
}

// ============================================
// Odontograma
// ============================================

export type OdontogramaStatus = "pendente" | "em_andamento" | "concluido" | "removido";

export const odontogramaStatusLabels: Record<OdontogramaStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  removido: "Removido",
};

export type ProcedimentoOdonto =
  | "restauracao"
  | "canal"
  | "extracao"
  | "coroa"
  | "implante"
  | "limpeza"
  | "selante"
  | "clareamento"
  | "aparelho"
  | "protese"
  | "faceta"
  | "nucleo"
  | "onlay_inlay"
  | "avaliacao"
  | "outro";

export const procedimentoOdontoLabels: Record<ProcedimentoOdonto, string> = {
  restauracao: "Restauração",
  canal: "Tratamento de Canal",
  extracao: "Extração",
  coroa: "Coroa",
  implante: "Implante",
  limpeza: "Limpeza / Profilaxia",
  selante: "Selante",
  clareamento: "Clareamento",
  aparelho: "Aparelho Ortodôntico",
  protese: "Prótese",
  faceta: "Faceta",
  nucleo: "Núcleo",
  onlay_inlay: "Onlay / Inlay",
  avaliacao: "Avaliação",
  outro: "Outro",
};

export type ToothState = "neutro" | "em_andamento" | "concluido" | "removido";

export interface OdontogramaProcedimento {
  id: string;
  paciente_id: string;
  dente: number;
  status: OdontogramaStatus;
  procedimento: string; // ProcedimentoOdonto, mas armazenado como string para flexibilidade
  valor: number;
  dentista_id?: string;
  observacoes?: string;
  data: string;
  created_at?: string;
  updated_at?: string;
}

export interface Pagamento {
  id: string;
  agendamento_id: string;
  valor_pago: number;
  forma_pagamento: "pix" | "credito" | "debito" | "dinheiro" | "boleto";
  data_pagamento: string;
}
