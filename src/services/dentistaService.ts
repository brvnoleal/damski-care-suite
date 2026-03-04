/**
 * Camada de serviço — Dentistas
 * Abstrai operações CRUD. Atualmente usa dados mock.
 */
import { Dentista } from "@/types";
import { mockDentistas } from "@/data/mockDentistas";
import { notificationStore } from "@/stores/notificationStore";

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
    notificationStore.add("create", "dentista", "Novo dentista cadastrado", `${novo.nome} foi adicionado.`);
    return novo;
  },

  atualizar: (id: string, dados: Partial<Dentista>): Dentista | null => {
    const index = dentistas.findIndex((d) => d.id === id);
    if (index === -1) return null;
    dentistas[index] = { ...dentistas[index], ...dados };
    dentistas = [...dentistas];
    notificationStore.add("update", "dentista", "Dentista atualizado", `${dentistas[index].nome} teve dados alterados.`);
    return dentistas[index];
  },

  excluir: (id: string): boolean => {
    const dentista = dentistas.find((d) => d.id === id);
    const len = dentistas.length;
    dentistas = dentistas.filter((d) => d.id !== id);
    if (dentistas.length < len && dentista) {
      notificationStore.add("delete", "dentista", "Dentista excluído", `${dentista.nome} foi removido.`);
    }
    return dentistas.length < len;
  },
};
