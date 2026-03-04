/**
 * Store global de notificações do sistema.
 * Registra toda criação, edição e exclusão de registros, além de alertas de insumos.
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
}

type Listener = () => void;

let notifications: AppNotification[] = [
  // Notificações iniciais (mock)
  {
    id: "n1",
    type: "alert",
    module: "insumo",
    title: "Ácido Hialurônico próximo ao vencimento",
    description: "Lote AH2024-089 vence em 15 dias. 3 unidades em estoque.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "n2",
    type: "create",
    module: "agendamento",
    title: "Novo agendamento criado",
    description: "Ana Costa — Toxina Botulínica em 10/03 às 09:00.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "n3",
    type: "update",
    module: "paciente",
    title: "Cadastro de paciente atualizado",
    description: "Maria Silva — dados atualizados.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
];

const listeners: Set<Listener> = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

const iconMap: Record<NotificationType, string> = {
  create: "➕",
  update: "✏️",
  delete: "🗑️",
  alert: "⚠️",
};

const moduleLabel: Record<NotificationModule, string> = {
  paciente: "Paciente",
  dentista: "Dentista",
  agendamento: "Agendamento",
  insumo: "Insumo",
  sessao: "Sessão",
  financeiro: "Financeiro",
};

export const notificationStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getAll(): AppNotification[] {
    return [...notifications];
  },

  getUnreadCount(): number {
    return notifications.filter((n) => !n.read).length;
  },

  add(type: NotificationType, module: NotificationModule, title: string, description: string) {
    const n: AppNotification = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
      type,
      module,
      title,
      description,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications = [n, ...notifications];
    emit();
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
