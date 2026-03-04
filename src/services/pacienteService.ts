/**
 * Camada de serviço — Pacientes
 * Abstrai operações CRUD. Atualmente usa dados mock.
 * Preparado para integração com banco de dados relacional (PostgreSQL via Lovable Cloud).
 */
import { Paciente } from "@/types";
import { mockPacientes } from "@/data/mockPacientes";
import { notificationStore } from "@/stores/notificationStore";

let pacientes: Paciente[] = [...mockPacientes];

export const pacienteService = {
  listar: (): Paciente[] => {
    return [...pacientes];
  },

  buscarPorId: (id: string): Paciente | undefined => {
    return pacientes.find((p) => p.id === id);
  },

  criar: (dados: Omit<Paciente, "id" | "created_at">): Paciente => {
    const novo: Paciente = {
      ...dados,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    };
    pacientes = [...pacientes, novo];
    notificationStore.add("create", "paciente", "Novo paciente cadastrado", `${novo.nome} foi adicionado ao sistema.`);
    return novo;
  },

  atualizar: (id: string, dados: Partial<Paciente>): Paciente | null => {
    const index = pacientes.findIndex((p) => p.id === id);
    if (index === -1) return null;
    pacientes[index] = { ...pacientes[index], ...dados };
    pacientes = [...pacientes];
    notificationStore.add("update", "paciente", "Paciente atualizado", `${pacientes[index].nome} teve dados alterados.`);
    return pacientes[index];
  },

  excluir: (id: string): boolean => {
    const paciente = pacientes.find((p) => p.id === id);
    const len = pacientes.length;
    pacientes = pacientes.filter((p) => p.id !== id);
    if (pacientes.length < len && paciente) {
      notificationStore.add("delete", "paciente", "Paciente excluído", `${paciente.nome} foi removido do sistema.`);
    }
    return pacientes.length < len;
  },
};
