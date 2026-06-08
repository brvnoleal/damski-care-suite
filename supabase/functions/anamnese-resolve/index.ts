import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : null;
    const clinicaIdIn = typeof body?.clinica_id === "string" ? body.clinica_id.trim() : null;

    if ((!token && !clinicaIdIn) || (token && clinicaIdIn)) {
      return json({ error: "parametros_invalidos" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let clinicaId = clinicaIdIn;
    let pacienteId: string | null = null;
    let origem: "link_publico" | "link_individual" = "link_publico";

    if (token) {
      origem = "link_individual";
      const { data: t, error } = await admin
        .from("anamnese_token")
        .select("clinica_id, paciente_id, expires_at, used_at")
        .eq("token", token)
        .maybeSingle();
      if (error) return json({ error: "erro_interno" }, 500);
      if (!t) return json({ error: "link_invalido" }, 404);
      if (t.used_at) return json({ error: "link_usado" }, 410);
      if (new Date(t.expires_at) < new Date()) return json({ error: "link_expirado" }, 410);
      clinicaId = t.clinica_id;
      pacienteId = t.paciente_id;
    }

    const { data: c, error: ce } = await admin
      .from("clinica")
      .select("id, nome, status")
      .eq("id", clinicaId!)
      .maybeSingle();
    if (ce) return json({ error: "erro_interno" }, 500);
    if (!c || (c.status !== "ativa" && c.status !== "ativo")) return json({ error: "clinica_indisponivel" }, 404);

    return json({
      clinica_id: c.id,
      clinica_nome: c.nome,
      paciente_id: pacienteId,
      origem,
    });
  } catch (e) {
    return json({ error: "erro_interno", detail: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
