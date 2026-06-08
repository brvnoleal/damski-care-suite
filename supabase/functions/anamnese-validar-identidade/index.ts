// Edge Function: anamnese-validar-identidade
// Pública. Confirma identidade do paciente pelo nome + data de nascimento.
// Aplica rate limit de 3 tentativas / 15 min por CPF + clínica.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  cpf: z.string().min(11).max(14),
  clinica_id: z.string().uuid(),
  nome: z.string().min(2).max(150),
  data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function onlyDigits(s: string) { return (s || "").replace(/\D/g, ""); }
function normalize(s: string) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}
async function sha256Hex(input: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { cpf, clinica_id, nome, data_nascimento } = parsed.data;
    const cpfDigits = onlyDigits(cpf);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const cpfHash = await sha256Hex(`${clinica_id}:${cpfDigits}`);
    const { data: tent } = await admin
      .from("anamnese_tentativa").select("*")
      .eq("clinica_id", clinica_id).eq("cpf_hash", cpfHash).maybeSingle();

    if (tent?.bloqueado_ate && new Date(tent.bloqueado_ate) > new Date()) {
      return new Response(JSON.stringify({ error: "Bloqueado temporariamente. Tente novamente em 15 minutos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cpfFormatted = `${cpfDigits.slice(0,3)}.${cpfDigits.slice(3,6)}.${cpfDigits.slice(6,9)}-${cpfDigits.slice(9,11)}`;
    const { data: paciente } = await admin
      .from("paciente").select("id, nome, data_nascimento, clinica_id")
      .eq("clinica_id", clinica_id)
      .or(`cpf.eq.${cpfFormatted},cpf.eq.${cpfDigits}`)
      .maybeSingle();

    const valido = Boolean(
      paciente &&
      normalize(paciente.nome) === normalize(nome) &&
      paciente.data_nascimento === data_nascimento
    );

    // Atualiza contagem de tentativas
    if (!valido) {
      const tentativas = (tent?.tentativas ?? 0) + 1;
      const bloqueado_ate = tentativas >= 3 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      if (tent) {
        await admin.from("anamnese_tentativa").update({ tentativas, bloqueado_ate }).eq("id", tent.id);
      } else {
        await admin.from("anamnese_tentativa").insert({ clinica_id, cpf_hash: cpfHash, tentativas, bloqueado_ate });
      }
    } else if (tent) {
      await admin.from("anamnese_tentativa").update({ tentativas: 0, bloqueado_ate: null }).eq("id", tent.id);
    }

    return new Response(JSON.stringify({
      valido,
      paciente_id: valido ? paciente!.id : null,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Erro inesperado" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
