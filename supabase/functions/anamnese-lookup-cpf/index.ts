// Edge Function: anamnese-lookup-cpf
// Pública (sem JWT). Recebe { cpf, clinica_id } e retorna se o paciente existe.
// Aplica rate limit por CPF/clínica via tabela anamnese_tentativa.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  cpf: z.string().min(11).max(14),
  clinica_id: z.string().uuid(),
});

function onlyDigits(s: string) {
  return (s || "").replace(/\D/g, "");
}

function isValidCpf(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i], 10) * (10 - i);
  let c1 = 11 - (sum % 11);
  if (c1 > 9) c1 = 0;
  if (c1 !== parseInt(d[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i], 10) * (11 - i);
  let c2 = 11 - (sum % 11);
  if (c2 > 9) c2 = 0;
  return c2 === parseInt(d[10], 10);
}

function maskNome(nome: string): string {
  const parts = (nome || "").trim().split(/\s+/);
  if (parts.length === 0) return "***";
  const first = parts[0];
  const last = parts[parts.length - 1];
  const maskedFirst = first.length <= 2 ? first : first[0] + "*".repeat(Math.max(2, first.length - 2)) + first.slice(-1);
  const maskedLast = parts.length > 1 ? " " + last[0] + "***" : "";
  return maskedFirst + maskedLast;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
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
    const { cpf, clinica_id } = parsed.data;
    if (!isValidCpf(cpf)) {
      return new Response(JSON.stringify({ error: "CPF inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Confirma clínica ativa
    const { data: clinica } = await admin.from("clinica").select("id, nome, status").eq("id", clinica_id).maybeSingle();
    if (!clinica || (clinica.status !== "ativa" && clinica.status !== "ativo")) {
      return new Response(JSON.stringify({ error: "Clínica não encontrada" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit
    const cpfDigits = onlyDigits(cpf);
    const cpfHash = await sha256Hex(`${clinica_id}:${cpfDigits}`);
    const { data: tent } = await admin
      .from("anamnese_tentativa").select("*")
      .eq("clinica_id", clinica_id).eq("cpf_hash", cpfHash).maybeSingle();

    if (tent?.bloqueado_ate && new Date(tent.bloqueado_ate) > new Date()) {
      return new Response(JSON.stringify({ error: "Muitas tentativas. Tente novamente mais tarde." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cpfFormatted = `${cpfDigits.slice(0,3)}.${cpfDigits.slice(3,6)}.${cpfDigits.slice(6,9)}-${cpfDigits.slice(9,11)}`;

    const { data: paciente } = await admin
      .from("paciente").select("id, nome, data_nascimento")
      .eq("clinica_id", clinica_id)
      .or(`cpf.eq.${cpfFormatted},cpf.eq.${cpfDigits}`)
      .maybeSingle();

    return new Response(JSON.stringify({
      clinica_nome: clinica.nome,
      existe: Boolean(paciente),
      nome_mascarado: paciente ? maskNome(paciente.nome) : null,
      ano_nascimento: paciente?.data_nascimento ? new Date(paciente.data_nascimento).getUTCFullYear() : null,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Erro inesperado" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
