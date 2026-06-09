/**
 * Camada de serviço — Documentos do paciente (modelos, emissão e tokens).
 */
import { supabase } from "@/integrations/supabase/client";
import {
  MODELOS_PADRAO,
  TipoDocumento,
  renderTemplate,
} from "@/lib/documentoTemplates";

export interface DocumentoModelo {
  id: string;
  clinica_id: string;
  tipo: TipoDocumento;
  nome: string;
  conteudo: string;
  requer_assinatura_paciente: boolean;
  requer_assinatura_responsavel: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PacienteDocumento {
  id: string;
  clinica_id: string;
  paciente_id: string;
  modelo_id: string | null;
  tipo: TipoDocumento;
  titulo: string;
  conteudo_renderizado: string;
  status: "pendente" | "assinado" | "expirado" | "cancelado";
  assinatura_paciente_dataurl: string | null;
  assinado_em: string | null;
  expira_em: string;
  created_at: string;
}

export const documentoService = {
  // ----- Modelos -----
  listarModelos: async (): Promise<DocumentoModelo[]> => {
    const { data, error } = await supabase
      .from("documento_modelo" as any)
      .select("*")
      .order("tipo")
      .order("nome");
    if (error) throw error;
    return (data || []) as unknown as DocumentoModelo[];
  },

  /** Garante que a clínica tenha os 4 modelos padrão; cria os que faltarem. */
  garantirModelosPadrao: async (clinicaId: string): Promise<void> => {
    const { data: existentes } = await supabase
      .from("documento_modelo" as any)
      .select("tipo")
      .eq("clinica_id", clinicaId);
    const jaTem = new Set(((existentes as any[]) || []).map((m) => m.tipo));
    const faltantes = MODELOS_PADRAO.filter((m) => !jaTem.has(m.tipo));
    if (!faltantes.length) return;
    const payload = faltantes.map((m) => ({
      clinica_id: clinicaId,
      tipo: m.tipo,
      nome: m.nome,
      conteudo: m.conteudo,
      requer_assinatura_paciente: m.requer_assinatura_paciente,
    }));
    const { error } = await supabase
      .from("documento_modelo" as any)
      .insert(payload as any);
    if (error) throw error;
  },

  criarModelo: async (input: {
    tipo: TipoDocumento;
    nome: string;
    conteudo: string;
    requer_assinatura_paciente: boolean;
  }): Promise<DocumentoModelo> => {
    const { data, error } = await supabase
      .from("documento_modelo" as any)
      .insert(input as any)
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as DocumentoModelo;
  },

  atualizarModelo: async (
    id: string,
    input: Partial<{
      nome: string;
      conteudo: string;
      requer_assinatura_paciente: boolean;
      ativo: boolean;
    }>,
  ): Promise<void> => {
    const { error } = await supabase
      .from("documento_modelo" as any)
      .update(input as any)
      .eq("id", id);
    if (error) throw error;
  },

  excluirModelo: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("documento_modelo" as any)
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  // ----- Documentos do paciente -----
  listarPorPaciente: async (pacienteId: string): Promise<PacienteDocumento[]> => {
    const { data, error } = await supabase
      .from("paciente_documento" as any)
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as PacienteDocumento[];
  },

  /**
   * Emite documento para o paciente: renderiza variáveis, cria registro e token público.
   * Retorna o link público.
   */
  emitir: async (input: {
    pacienteId: string;
    modelo: DocumentoModelo | null;
    tipoPersonalizado?: TipoDocumento;
    titulo: string;
    conteudoBruto: string;
    diasValidade: number;
    requerAssinaturaPaciente: boolean;
  }): Promise<{ documento: PacienteDocumento; url: string; token: string }> => {
    // Carrega dados de paciente e clínica para render
    const { data: paciente, error: pe } = await supabase
      .from("paciente")
      .select("*")
      .eq("id", input.pacienteId)
      .maybeSingle();
    if (pe) throw pe;
    if (!paciente) throw new Error("Paciente não encontrado.");

    const { data: membro } = await supabase
      .from("clinica_membro")
      .select("clinica_id")
      .maybeSingle();
    const clinicaId = membro?.clinica_id;
    if (!clinicaId) throw new Error("Clínica não identificada.");

    const { data: clinica } = await supabase
      .from("clinica")
      .select("*")
      .eq("id", clinicaId)
      .maybeSingle();

    const conteudoRenderizado = renderTemplate(input.conteudoBruto, {
      paciente: paciente as any,
      clinica: {
        nome: (clinica as any)?.nome,
        cnpj: (clinica as any)?.cnpj,
        telefone: (clinica as any)?.telefone,
        email: (clinica as any)?.email,
      },
    });

    const tipo: TipoDocumento =
      input.modelo?.tipo ?? input.tipoPersonalizado ?? "personalizado";

    const expira = new Date();
    expira.setDate(expira.getDate() + Math.max(1, input.diasValidade));

    const { data: doc, error: de } = await supabase
      .from("paciente_documento" as any)
      .insert({
        paciente_id: input.pacienteId,
        modelo_id: input.modelo?.id ?? null,
        tipo,
        titulo: input.titulo,
        conteudo_renderizado: conteudoRenderizado,
        status: input.requerAssinaturaPaciente ? "pendente" : "assinado",
        assinado_em: input.requerAssinaturaPaciente ? null : new Date().toISOString(),
        expira_em: expira.toISOString(),
      } as any)
      .select("*")
      .single();
    if (de) throw de;

    const documento = doc as unknown as PacienteDocumento;
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

    const { error: te } = await supabase
      .from("paciente_documento_token" as any)
      .insert({
        documento_id: documento.id,
        token,
        expires_at: expira.toISOString(),
      } as any);
    if (te) throw te;

    const url = `${window.location.origin}/d/${token}`;
    return { documento, url, token };
  },

  cancelar: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("paciente_documento" as any)
      .update({ status: "cancelado" } as any)
      .eq("id", id);
    if (error) throw error;
  },

  /** Recupera o token ativo de um documento (se existir). */
  obterTokenAtivo: async (documentoId: string): Promise<string | null> => {
    const { data } = await supabase
      .from("paciente_documento_token" as any)
      .select("token, used_at, expires_at")
      .eq("documento_id", documentoId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const row = data as any;
    if (!row) return null;
    if (row.used_at) return null;
    if (new Date(row.expires_at) < new Date()) return null;
    return row.token as string;
  },
};
