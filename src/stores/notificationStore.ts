/**
 * Store global de notificações do sistema.
 * Persiste em localStorage e registra criações, atualizações, exclusões
 * e alertas de vencimento de insumos (15 e 5 dias).
 */

export type NotificationType = "create" | "update" | "delete" | "alert";
export type NotificationModule = "paciente" | "dentista" | "agendamento" | "insumo" | "sessao" | "financeiro";

export interface AppNotification {
  id: string;
  type: NotificationType;
  module: NotificationModule;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  /** chave de deduplicação para alertas recorrentes */
  dedupeKey?: string;
}

type Listener = () => void;

const STORAGE_KEY = "app_notifications_v2";
const MAX_ITEMS = 200;

function load(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_ITEMS)));
  } catch {
    /* ignore */
  }
}

let notifications: AppNotification[] = load();

const listeners: Set<Listener> = new Set();

function emit() {
  persist();
  listeners.forEach((fn) => fn());
}

import { Plus, Pencil, Trash2, AlertTriangle, type LucideIcon } from "lucide-react";

const iconMap: Record<NotificationType, LucideIcon> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  alert: AlertTriangle,
};

const moduleLabel: Record<NotificationModule, string> = {
  paciente: "Paciente",
  dentista: "Dentista",
  agendamento: "Agendamento",
  insumo: "Insumo",
  sessao: "Sessão",
  financeiro: "Financeiro",
};

function pushNotification(n: Omit<AppNotification, "id" | "timestamp" | "read"> & { read?: boolean }) {
  if (n.dedupeKey && notifications.some((x) => x.dedupeKey === n.dedupeKey)) {
    return;
  }
  const item: AppNotification = {
    id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    read: n.read ?? false,
    ...n,
  };
  notifications = [item, ...notifications].slice(0, MAX_ITEMS);
  emit();
}

interface InsumoLike {
  id: string;
  nome: string;
  lote: string;
  validade: string | null;
  sem_validade: boolean;
  quantidade: number;
}

function daysUntil(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateIso + "T00:00:00");
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const notificationStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },

  getSnapshot(): AppNotification[] {
    return notifications;
  },

  getUnreadCount(): number {
    return notifications.filter((n) => !n.read).length;
  },

  add(type: NotificationType, module: NotificationModule, title: string, description: string) {
    pushNotification({ type, module, title, description });
  },

  /**
   * Gera alertas para insumos a vencer em 15 e 5 dias.
   * Deduplica via chave por insumo + threshold.
   */
  syncInsumoAlerts(insumos: InsumoLike[]) {
    // Respeita as preferências de alertas configuradas em Configurações.
    try {
      const raw = localStorage.getItem("app_alert_prefs_v1");
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.pausarTodas) return;
        if (p?.toggles?.insumos_vencimento === false) return;
      }
    } catch { /* ignore */ }

    const thresholds = [15, 5];
    let changed = false;
    insumos.forEach((insumo) => {
      if (insumo.sem_validade || !insumo.validade) return;
      const diff = daysUntil(insumo.validade);
      thresholds.forEach((t) => {
        if (diff <= t && diff >= 0) {
          const key = `insumo:${insumo.id}:exp${t}`;
          if (!notifications.some((n) => n.dedupeKey === key)) {
            const item: AppNotification = {
              id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
              type: "alert",
              module: "insumo",
              title: `${insumo.nome} vence em ${diff} dia${diff === 1 ? "" : "s"}`,
              description: `Lote ${insumo.lote} — ${insumo.quantidade} em estoque. Vencimento em ${new Date(insumo.validade + "T00:00:00").toLocaleDateString("pt-BR")}.`,
              timestamp: new Date().toISOString(),
              read: false,
              dedupeKey: key,
            };
            notifications = [item, ...notifications].slice(0, MAX_ITEMS);
            changed = true;
          }
        }
      });
    });
    if (changed) emit();
  },

  markAllRead() {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    emit();
  },

  markRead(id: string) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    emit();
  },

  clear() {
    notifications = [];
    emit();
  },

  getIcon(type: NotificationType) {
    return iconMap[type];
  },

  getModuleLabel(module: NotificationModule) {
    return moduleLabel[module];
  },
};
