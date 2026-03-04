/**
 * Camada de serviço — Agendamentos
 * Abstrai operações CRUD. Atualmente usa dados mock.
 */
import { Agendamento } from "@/types";
import { mockAgendamentos } from "@/data/mockAgendamentos";

let agendamentos: Agendamento[] = [...mockAgendamentos];

export const agendamentoService = {
  listar: (): Agendamento[] => {
    return [...agendamentos];
  },

  buscarPorId: (id: string): Agendamento | undefined => {
    return agendamentos.find((a) => a.id === id);
  },

  criar: (dados: Omit<Agendamento, "id" | "created_at">): Agendamento => {
    const novo: Agendamento = {
      ...dados,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    };
    agendamentos = [...agendamentos, novo];
    return novo;
  },

  atualizar: (id: string, dados: Partial<Agendamento>): Agendamento | null => {
    const index = agendamentos.findIndex((a) => a.id === id);
    if (index === -1) return null;
    agendamentos[index] = { ...agendamentos[index], ...dados };
    agendamentos = [...agendamentos];
    return agendamentos[index];
  },

  excluir: (id: string): boolean => {
    const len = agendamentos.length;
    agendamentos = agendamentos.filter((a) => a.id !== id);
    return agendamentos.length < len;
  },
};
