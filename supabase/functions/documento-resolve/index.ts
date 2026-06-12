import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    if (!token) return json({ error: "parametros_invalidos" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: t, error } = await admin
      .from("paciente_documento_token")
      .select("documento_id, used_at, expires_at")
      .eq("token", token)
      .maybeSingle();
    if (error) { console.error("documento-resolve token:", error); return json({ error: "erro_interno" }, 500); }
    if (!t) return json({ error: "link_invalido" }, 404);
    if (t.used_at) return json({ error: "link_usado" }, 410);
    if (new Date(t.expires_at) < new Date()) return json({ error: "link_expirado" }, 410);

    const { data: doc, error: de } = await admin
      .from("paciente_documento")
      .select("id, titulo, tipo, conteudo_renderizado, status, paciente_id, clinica_id")
      .eq("id", t.documento_id)
      .maybeSingle();
    if (de || !doc) return json({ error: "documento_indisponivel" }, 404);
    if (doc.status === "cancelado") return json({ error: "documento_cancelado" }, 410);

    const [{ data: p }, { data: c }] = await Promise.all([
      admin.from("paciente").select("nome").eq("id", doc.paciente_id).maybeSingle(),
      admin.from("clinica").select("nome").eq("id", doc.clinica_id).maybeSingle(),
    ]);

    return json({
      documento_id: doc.id,
      titulo: doc.titulo,
      tipo: doc.tipo,
      conteudo: doc.conteudo_renderizado,
      ja_assinado: doc.status === "assinado",
      paciente_nome: p?.nome ?? null,
      clinica_nome: c?.nome ?? null,
    });
  } catch (e) {
    console.error("documento-resolve error:", e);
    return json({ error: "erro_interno" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
