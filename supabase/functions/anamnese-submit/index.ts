// Edge Function: anamnese-submit
// Pública. Recebe respostas + assinatura. Se paciente_id fornecido (após validação),
// vincula nova versão. Caso contrário, cria paciente e a anamnese na mesma transação lógica.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PacienteNovoSchema = z.object({
  nome: z.string().min(3).max(150),
  cpf: z.string().min(11).max(14),
  data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  telefone: z.string().max(20).optional().default(""),
  email: z.string().email().max(150).optional().or(z.literal("")).default(""),
  instagram: z.string().max(60).optional(),
  cep: z.string().max(10).optional(),
  estado: z.string().max(2).optional(),
  cidade: z.string().max(100).optional(),
  bairro: z.string().max(100).optional(),
  rua: z.string().max(200).optional(),
  numero: z.string().max(20).optional(),
  complemento: z.string().max(100).optional(),
});

const BodySchema = z.object({
  clinica_id: z.string().uuid(),
  paciente_id: z.string().uuid().nullable().optional(),
  paciente_novo: PacienteNovoSchema.nullable().optional(),
  respostas: z.record(z.any()),
  assinatura_paciente: z.string().min(50, "Assinatura obrigatória"),
  origem: z.enum(["link_publico", "link_individual", "tablet_recepcao", "interno"]).default("link_publico"),
  token: z.string().uuid().nullable().optional(),
});

function onlyDigits(s: string) { return (s || "").replace(/\D/g, ""); }
function formatCpf(d: string) {
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Dados inválidos", detalhes: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = parsed.data;
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Confirma clínica
    const { data: clinica } = await admin.from("clinica").select("id, status").eq("id", body.clinica_id).maybeSingle();
    if (!clinica || clinica.status !== "ativo") {
      return new Response(JSON.stringify({ error: "Clínica inválida" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Valida token (se fornecido)
    let tokenRow: any = null;
    if (body.token) {
      const { data: t } = await admin.from("anamnese_token").select("*").eq("token", body.token).maybeSingle();
      if (!t || t.clinica_id !== body.clinica_id) {
        return new Response(JSON.stringify({ error: "Token inválido" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (t.used_at) {
        return new Response(JSON.stringify({ error: "Token já utilizado" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (new Date(t.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Token expirado" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      tokenRow = t;
    }

    let pacienteId = body.paciente_id ?? null;

    // Garante vínculo do token ao paciente: se o token foi emitido para um paciente
    // específico, não permitir submeter anamnese para um paciente diferente.
    if (tokenRow?.paciente_id) {
      if (pacienteId && pacienteId !== tokenRow.paciente_id) {
        return new Response(JSON.stringify({ error: "Paciente não corresponde ao token" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      pacienteId = tokenRow.paciente_id;
    }

    // Cria paciente se necessário
    if (!pacienteId) {
      if (!body.paciente_novo) {
        return new Response(JSON.stringify({ error: "Dados de paciente ausentes" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const pn = body.paciente_novo;
      const cpfDigits = onlyDigits(pn.cpf);
      if (cpfDigits.length !== 11) {
        return new Response(JSON.stringify({ error: "CPF inválido" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const cpfFmt = formatCpf(cpfDigits);

      // Evita duplicidade
      const { data: dup } = await admin
        .from("paciente").select("id")
        .eq("clinica_id", body.clinica_id)
        .or(`cpf.eq.${cpfFmt},cpf.eq.${cpfDigits}`)
        .maybeSingle();
      if (dup) {
        return new Response(JSON.stringify({ error: "Paciente já cadastrado com este CPF. Use o fluxo de identificação." }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: novo, error: errIns } = await admin.from("paciente").insert({
        clinica_id: body.clinica_id,
        nome: pn.nome,
        cpf: cpfFmt,
        data_nascimento: pn.data_nascimento,
        telefone: pn.telefone || null,
        email: pn.email || null,
        instagram: pn.instagram || null,
        cep: pn.cep || null,
        estado: pn.estado || null,
        cidade: pn.cidade || null,
        bairro: pn.bairro || null,
        rua: pn.rua || null,
        numero: pn.numero || null,
        complemento: pn.complemento || null,
        status: "ativo",
      }).select("id").single();
      if (errIns) throw errIns;
      pacienteId = novo.id;
    } else {
      // Valida que paciente pertence à clínica
      const { data: p } = await admin.from("paciente").select("id").eq("id", pacienteId).eq("clinica_id", body.clinica_id).maybeSingle();
      if (!p) {
        return new Response(JSON.stringify({ error: "Paciente não encontrado nesta clínica" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Determina próxima versão
    const { count } = await admin.from("paciente_anamnese")
      .select("id", { count: "exact", head: true }).eq("paciente_id", pacienteId!);
    const versao = (count ?? 0) + 1;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const ua = req.headers.get("user-agent") || null;

    const { data: anamnese, error: errAnamnese } = await admin.from("paciente_anamnese").insert({
      clinica_id: body.clinica_id,
      paciente_id: pacienteId,
      versao,
      respostas: body.respostas,
      assinatura_paciente: body.assinatura_paciente,
      assinatura_ip: ip,
      assinatura_user_agent: ua,
      origem: body.origem,
      token_id: tokenRow?.id ?? null,
    }).select("id").single();
    if (errAnamnese) throw errAnamnese;

    if (tokenRow) {
      await admin.from("anamnese_token").update({ used_at: new Date().toISOString(), paciente_id: pacienteId }).eq("id", tokenRow.id);
    }

    return new Response(JSON.stringify({ success: true, paciente_id: pacienteId, anamnese_id: anamnese.id, versao }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Erro inesperado" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
