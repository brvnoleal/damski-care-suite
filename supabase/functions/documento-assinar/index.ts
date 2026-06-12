import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const assinatura = typeof body?.assinatura === "string" ? body.assinatura : "";
    if (!token) {
      return json({ error: "parametros_invalidos" }, 400);
    }
    const ALLOWED_PREFIXES = ["data:image/png;base64,", "data:image/jpeg;base64,", "data:image/webp;base64,"];
    const prefix = ALLOWED_PREFIXES.find((p) => assinatura.startsWith(p));
    if (!prefix) {
      return json({ error: "tipo_invalido" }, 400);
    }
    if (assinatura.length > 600_000) {
      return json({ error: "assinatura_muito_grande" }, 400);
    }
    // Verify magic bytes match declared MIME
    try {
      const b64 = assinatura.slice(prefix.length);
      const head = atob(b64.slice(0, 24));
      const b = new Uint8Array([...head].map((c) => c.charCodeAt(0)));
      const isPng = b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
      const isJpeg = b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
      const isWebp = b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
      const declared = prefix.includes("png") ? "png" : prefix.includes("jpeg") ? "jpeg" : "webp";
      const matches = (declared === "png" && isPng) || (declared === "jpeg" && isJpeg) || (declared === "webp" && isWebp);
      if (!matches) return json({ error: "tipo_invalido" }, 400);
    } catch {
      return json({ error: "tipo_invalido" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: t, error } = await admin
      .from("paciente_documento_token")
      .select("id, documento_id, used_at, expires_at")
      .eq("token", token)
      .maybeSingle();
    if (error) return json({ error: "erro_interno" }, 500);
    if (!t) return json({ error: "link_invalido" }, 404);
    if (t.used_at) return json({ error: "link_usado" }, 410);
    if (new Date(t.expires_at) < new Date()) return json({ error: "link_expirado" }, 410);

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      null;
    const ua = req.headers.get("user-agent") || null;
    const agora = new Date().toISOString();

    const { error: ue } = await admin
      .from("paciente_documento")
      .update({
        status: "assinado",
        assinatura_paciente_dataurl: assinatura,
        assinado_em: agora,
        assinado_ip: ip,
        assinado_user_agent: ua,
      })
      .eq("id", t.documento_id);
    if (ue) { console.error("documento-assinar update:", ue); return json({ error: "erro_interno" }, 500); }

    await admin
      .from("paciente_documento_token")
      .update({ used_at: agora })
      .eq("id", t.id);

    return json({ ok: true });
  } catch (e) {
    console.error("documento-assinar error:", e);
    return json({ error: "erro_interno" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
