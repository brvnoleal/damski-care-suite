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
  status: "ativo" | "inativo";
  created_at?: string;
}

export interface Agendamento {
  id: string;
  data: string;
  horario: string;
  paciente_id: string;
  dentista_id: string;
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
