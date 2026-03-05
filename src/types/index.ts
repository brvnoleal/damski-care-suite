// ============================================
// Tipos do domínio — Damski Odonto SaaS
// Arquitetura em camadas: Types → Services → Pages
// ============================================

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
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

export interface Agendamento {
  id: string;
  data: string;
  horario: string;
  paciente_id: string;
  dentista_id: string;
  procedimento: ProcedimentoConsulta;
  status: "agendado" | "confirmado" | "realizado" | "cancelado";
  observacoes?: string;
  created_at?: string;
}

export interface Procedimento {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
}

export interface Pagamento {
  id: string;
  agendamento_id: string;
  valor_pago: number;
  forma_pagamento: "pix" | "credito" | "debito" | "dinheiro" | "boleto";
  data_pagamento: string;
}
