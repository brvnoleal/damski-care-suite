import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const email = "brunolealcavalcante@gmail.com";
    const password = "Eusouamona2001!";
    const nome = "Bruno Leal Cavalcante";

    let userId: string | null = null;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { nome },
    });
    if (createErr) {
      // user may exist; look it up
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list.users.find((u) => u.email === email);
      if (!found) throw createErr;
      userId = found.id;
      await admin.auth.admin.updateUserById(found.id, { password, email_confirm: true });
    } else {
      userId = created.user.id;
    }

    await admin.from("profiles").upsert({ id: userId!, nome });
    await admin.from("user_roles").upsert(
      { user_id: userId!, role: "admin" },
      { onConflict: "user_id,role" }
    );

    return new Response(JSON.stringify({ ok: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
