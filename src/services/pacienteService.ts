/**
 * Camada de serviço — Pacientes
 * Abstrai operações CRUD. Atualmente usa dados mock.
 * Preparado para integração com banco de dados relacional (PostgreSQL via Lovable Cloud).
 */
import { Paciente } from "@/types";
import { mockPacientes } from "@/data/mockPacientes";

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
    return novo;
  },

  atualizar: (id: string, dados: Partial<Paciente>): Paciente | null => {
    const index = pacientes.findIndex((p) => p.id === id);
    if (index === -1) return null;
    pacientes[index] = { ...pacientes[index], ...dados };
    pacientes = [...pacientes];
    return pacientes[index];
  },

  excluir: (id: string): boolean => {
    const len = pacientes.length;
    pacientes = pacientes.filter((p) => p.id !== id);
    return pacientes.length < len;
  },
};
