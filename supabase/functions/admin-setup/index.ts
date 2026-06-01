import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const result: Record<string, unknown> = {};

    if (action === "create_user") {
      const { email, password, nome, role } = body;
      // Check if exists
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === email);
      let userId: string;
      if (existing) {
        userId = existing.id;
        await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
        result.user = "updated";
      } else {
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nome: nome || email },
        });
        if (error) throw error;
        userId = data.user!.id;
        result.user = "created";
      }
      // Ensure profile
      await admin.from("profiles").upsert({ id: userId, nome: nome || email });
      // Ensure role
      await admin.from("user_roles").delete().eq("user_id", userId);
      await admin.from("user_roles").insert({ user_id: userId, role: role || "admin" });
      result.user_id = userId;
    } else if (action === "wipe_data") {
      const tables = [
        "paciente_foto",
        "paciente_debito",
        "odontograma_procedimento",
        "evolucao",
        "sessao",
        "agendamento",
        "paciente",
      ];
      for (const t of tables) {
        const { error, count } = await admin.from(t).delete({ count: "exact" }).not("id", "is", null);
        result[t] = error ? `error: ${error.message}` : `deleted ${count ?? "?"}`;
      }
      // Clear storage bucket
      try {
        const { data: files } = await admin.storage.from("paciente-fotos").list("", { limit: 1000 });
        if (files && files.length > 0) {
          const paths = files.map((f) => f.name);
          await admin.storage.from("paciente-fotos").remove(paths);
          result.storage_files_removed = paths.length;
        }
      } catch (e) {
        result.storage_error = String(e);
      }
    } else {
      return new Response(JSON.stringify({ error: "unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
