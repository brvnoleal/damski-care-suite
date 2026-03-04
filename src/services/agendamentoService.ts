/**
 * Camada de serviço — Agendamentos
 * Abstrai operações CRUD. Atualmente usa dados mock.
 */
import { Agendamento } from "@/types";
import { mockAgendamentos } from "@/data/mockAgendamentos";
import { notificationStore } from "@/stores/notificationStore";

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
    notificationStore.add("create", "agendamento", "Novo agendamento criado", `Agendamento para ${novo.data} às ${novo.horario}.`);
    return novo;
  },

  atualizar: (id: string, dados: Partial<Agendamento>): Agendamento | null => {
    const index = agendamentos.findIndex((a) => a.id === id);
    if (index === -1) return null;
    agendamentos[index] = { ...agendamentos[index], ...dados };
    agendamentos = [...agendamentos];
    notificationStore.add("update", "agendamento", "Agendamento alterado", `Agendamento #${agendamentos[index].id} foi atualizado.`);
    return agendamentos[index];
  },

  excluir: (id: string): boolean => {
    const len = agendamentos.length;
    agendamentos = agendamentos.filter((a) => a.id !== id);
    if (agendamentos.length < len) {
      notificationStore.add("delete", "agendamento", "Agendamento excluído", `Agendamento #${id} foi removido.`);
    }
    return agendamentos.length < len;
  },
};
