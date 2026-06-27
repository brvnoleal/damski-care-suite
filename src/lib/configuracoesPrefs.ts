/**
 * Preferências locais de configurações:
 * - Alertas automáticos (pausa de notificações)
 * - Taxas de maquininhas (PIX, débito e crédito por parcela)
 */

// ===================== Alertas =====================
export type AlertKey = "insumos_vencimento" | "assinaturas_pendentes" | "campos_obrigatorios";

export interface AlertPrefs {
  pausarTodas: boolean;
  toggles: Record<AlertKey, boolean>;
}

const ALERTS_KEY = "app_alert_prefs_v1";

const DEFAULT_ALERTS: AlertPrefs = {
  pausarTodas: false,
  toggles: {
    insumos_vencimento: true,
    assinaturas_pendentes: true,
    campos_obrigatorios: true,
  },
};

export const alertPrefs = {
  load(): AlertPrefs {
    try {
      const raw = localStorage.getItem(ALERTS_KEY);
      if (!raw) return DEFAULT_ALERTS;
      const parsed = JSON.parse(raw);
      return {
        pausarTodas: !!parsed.pausarTodas,
        toggles: { ...DEFAULT_ALERTS.toggles, ...(parsed.toggles || {}) },
      };
    } catch {
      return DEFAULT_ALERTS;
    }
  },
  save(prefs: AlertPrefs) {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent("alert-prefs-changed"));
  },
  isEnabled(key: AlertKey): boolean {
    const p = alertPrefs.load();
    if (p.pausarTodas) return false;
    return p.toggles[key] !== false;
  },
};

// ===================== Maquininhas =====================
export interface MaquininhaTaxa {
  pix: number;
  debito: number;
  /** índice = parcelas (1..12); índice 0 ignorado */
  credito: number[];
}

export interface MaquininhaConfig {
  id: string;
  nome: string;
  ativa: boolean;
  taxa: MaquininhaTaxa;
}

const MAQUININHAS_KEY = "app_maquininhas_v1";

export const MAQUININHAS_PADRAO: { id: string; nome: string }[] = [
  { id: "cielo", nome: "Cielo" },
  { id: "rede", nome: "Rede" },
  { id: "stone", nome: "Stone" },
  { id: "getnet", nome: "GetNet" },
  { id: "pagseguro", nome: "PagSeguro" },
  { id: "mercadopago", nome: "Mercado Pago" },
  { id: "sumup", nome: "SumUp" },
  { id: "ton", nome: "Ton" },
  { id: "infinitepay", nome: "InfinitePay" },
  { id: "safrapay", nome: "SafraPay" },
];

export const emptyTaxa = (): MaquininhaTaxa => ({
  pix: 0,
  debito: 0,
  credito: Array.from({ length: 13 }, () => 0),
});

export const maquininhasStore = {
  load(): MaquininhaConfig[] {
    try {
      const raw = localStorage.getItem(MAQUININHAS_KEY);
      if (!raw) {
        return MAQUININHAS_PADRAO.map((m) => ({ ...m, ativa: false, taxa: emptyTaxa() }));
      }
      const parsed = JSON.parse(raw) as MaquininhaConfig[];
      // garante todas as maquininhas padrão presentes
      const map = new Map(parsed.map((m) => [m.id, m]));
      return MAQUININHAS_PADRAO.map((m) => {
        const existing = map.get(m.id);
        if (existing) {
          return {
            ...existing,
            taxa: {
              pix: existing.taxa?.pix ?? 0,
              debito: existing.taxa?.debito ?? 0,
              credito: Array.from({ length: 13 }, (_, i) => existing.taxa?.credito?.[i] ?? 0),
            },
          };
        }
        return { ...m, ativa: false, taxa: emptyTaxa() };
      });
    } catch {
      return MAQUININHAS_PADRAO.map((m) => ({ ...m, ativa: false, taxa: emptyTaxa() }));
    }
  },
  save(items: MaquininhaConfig[]) {
    localStorage.setItem(MAQUININHAS_KEY, JSON.stringify(items));
  },
};
