import { supabase } from "@/integrations/supabase/client";

export interface HoleriteSignatureRecord {
  dentista_id: string;
  periodo_key: string;
  periodo_label: string;
  assinatura_data_url: string;
  signed_by_user_id: string;
  signed_at: string;
}

const invoke = async <T>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke<T>("holerite-assinatura", { body });
  if (error) throw error;
  return data as T;
};

export const holeriteAssinaturaService = {
  async listar(dentistaIds: string[], periodoKey: string): Promise<Record<string, HoleriteSignatureRecord>> {
    if (dentistaIds.length === 0 || !periodoKey) return {};

    const data = await invoke<{ signatures: HoleriteSignatureRecord[] }>({
      action: "list",
      dentista_ids: dentistaIds,
      periodo_key: periodoKey,
    });

    return (data.signatures || []).reduce<Record<string, HoleriteSignatureRecord>>((acc, item) => {
      acc[item.dentista_id] = item;
      return acc;
    }, {});
  },

  async salvar(input: {
    dentistaId: string;
    periodoKey: string;
    periodoLabel: string;
    assinaturaDataUrl: string;
  }): Promise<HoleriteSignatureRecord> {
    const data = await invoke<{ signature: HoleriteSignatureRecord }>({
      action: "save",
      dentista_id: input.dentistaId,
      periodo_key: input.periodoKey,
      periodo_label: input.periodoLabel,
      assinatura_data_url: input.assinaturaDataUrl,
    });

    return data.signature;
  },

  async revogar(input: { dentistaId: string; periodoKey: string; periodoLabel: string }): Promise<void> {
    await invoke<{ success: boolean }>({
      action: "revoke",
      dentista_id: input.dentistaId,
      periodo_key: input.periodoKey,
      periodo_label: input.periodoLabel,
    });
  },
};