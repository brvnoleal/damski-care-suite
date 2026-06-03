// Edge function: validação server-side de upload de fotos clínicas.
// Recebe multipart/form-data, valida MIME real (magic bytes), tamanho e
// extensão antes de mover ao bucket privado `paciente-fotos`.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const BUCKET = "paciente-fotos";

const sniff = (buf: Uint8Array): string | null => {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  return null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const pacienteId = String(form.get("paciente_id") || "");
    const categoria = String(form.get("categoria") || "outro");
    const descricao = form.get("descricao") ? String(form.get("descricao")) : null;

    if (!file || !pacienteId) {
      return new Response(JSON.stringify({ error: "file e paciente_id obrigatórios" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!/^[0-9a-f-]{36}$/i.test(pacienteId)) {
      return new Response(JSON.stringify({ error: "paciente_id inválido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!["antes", "depois", "durante", "outro"].includes(categoria)) {
      return new Response(JSON.stringify({ error: "categoria inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (file.size > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "arquivo excede 8MB" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!ALLOWED.has(file.type)) {
      return new Response(JSON.stringify({ error: "tipo MIME não permitido" }), { status: 415, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const real = sniff(bytes);
    if (!real || real !== file.type) {
      return new Response(JSON.stringify({ error: "conteúdo do arquivo não corresponde ao MIME declarado" }), { status: 415, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const extMap: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    const ext = extMap[real];
    const path = `${pacienteId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: real,
      upsert: false,
    });
    if (upErr) {
      return new Response(JSON.stringify({ error: upErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: row, error: insErr } = await supabase
      .from("paciente_foto")
      .insert({
        paciente_id: pacienteId,
        storage_path: path,
        nome_arquivo: file.name.slice(0, 200),
        categoria,
        descricao,
        data: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (insErr) {
      await supabase.storage.from(BUCKET).remove([path]);
      return new Response(JSON.stringify({ error: insErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, foto: row }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
