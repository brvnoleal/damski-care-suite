/**
 * Camada de serviço — Dentistas
 * Abstrai operações CRUD. Atualmente usa dados mock.
 */
import { Dentista } from "@/types";
import { mockDentistas } from "@/data/mockDentistas";

let dentistas: Dentista[] = [...mockDentistas];

export const dentistaService = {
  listar: (): Dentista[] => {
    return [...dentistas];
  },

  buscarPorId: (id: string): Dentista | undefined => {
    return dentistas.find((d) => d.id === id);
  },

  criar: (dados: Omit<Dentista, "id" | "created_at">): Dentista => {
    const novo: Dentista = {
      ...dados,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    };
    dentistas = [...dentistas, novo];
    return novo;
  },

  atualizar: (id: string, dados: Partial<Dentista>): Dentista | null => {
    const index = dentistas.findIndex((d) => d.id === id);
    if (index === -1) return null;
    dentistas[index] = { ...dentistas[index], ...dados };
    dentistas = [...dentistas];
    return dentistas[index];
  },

  excluir: (id: string): boolean => {
    const len = dentistas.length;
    dentistas = dentistas.filter((d) => d.id !== id);
    return dentistas.length < len;
  },
};
