import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autenticado");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) throw new Error("Não autenticado");

    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _user_id: caller.id });
    if (!isSuper) throw new Error("Acesso negado");

    const {
      clinica_nome,
      clinica_cnpj,
      clinica_email,
      clinica_telefone,
      admin_nome,
      admin_email,
      admin_cpf,
    } = await req.json();

    if (!clinica_nome || !admin_nome || !admin_email || !admin_cpf) {
      throw new Error("Campos obrigatórios faltando");
    }

    // 1. Create clínica
    const { data: clinica, error: clinicaError } = await supabaseAdmin
      .from("clinica")
      .insert({
        nome: clinica_nome,
        cnpj: clinica_cnpj || null,
        email: clinica_email || null,
        telefone: clinica_telefone || null,
        status: "ativa",
      })
      .select()
      .single();
    if (clinicaError) throw clinicaError;

    // 2. Create admin user
    const randomBytes = new Uint8Array(12);
    crypto.getRandomValues(randomBytes);
    const password = btoa(String.fromCharCode(...randomBytes))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: admin_email,
      password,
      email_confirm: true,
      user_metadata: { nome: admin_nome },
    });
    if (createError) {
      await supabaseAdmin.from("clinica").delete().eq("id", clinica.id);
      throw createError;
    }

    // 3. Link as admin member
    const { error: membroError } = await supabaseAdmin
      .from("clinica_membro")
      .insert({ user_id: newUser.user.id, clinica_id: clinica.id, role: "admin" });
    if (membroError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      await supabaseAdmin.from("clinica").delete().eq("id", clinica.id);
      throw membroError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        clinica,
        admin: { user_id: newUser.user.id, email: admin_email, password },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("super-admin-create-clinica error:", error);
    return new Response(
      JSON.stringify({ error: "Erro inesperado ao criar clínica" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
