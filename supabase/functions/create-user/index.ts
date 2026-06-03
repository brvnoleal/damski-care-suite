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

    // Caller must be admin of a clínica (or super_admin)
    const { data: callerMembership } = await supabaseAdmin
      .from("clinica_membro")
      .select("clinica_id, role")
      .eq("user_id", caller.id)
      .maybeSingle();

    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _user_id: caller.id });

    if (!isSuper && (!callerMembership || callerMembership.role !== "admin")) {
      throw new Error("Apenas administradores podem criar usuários");
    }

    const { nome, email, cpf, role, clinica_id: bodyClinicaId } = await req.json();

    if (!nome || !email || !cpf || !role) {
      throw new Error("Campos obrigatórios: nome, email, cpf, role");
    }

    const allowedRoles = ["admin", "responsavel_tecnico", "recepcionista"];
    if (!allowedRoles.includes(role)) {
      throw new Error("Papel inválido");
    }

    // Super admin can target any clínica; regular admin can only create in own clínica
    const targetClinicaId = isSuper ? (bodyClinicaId ?? callerMembership?.clinica_id) : callerMembership!.clinica_id;
    if (!targetClinicaId) throw new Error("clinica_id não definido");

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length < 6) throw new Error("CPF inválido");

    // Random temporary password (16 chars, URL-safe)
    const randomBytes = new Uint8Array(12);
    crypto.getRandomValues(randomBytes);
    const password = btoa(String.fromCharCode(...randomBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    });
    if (createError) throw createError;

    const { error: membroError } = await supabaseAdmin
      .from("clinica_membro")
      .insert({ user_id: newUser.user.id, clinica_id: targetClinicaId, role });
    if (membroError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw membroError;
    }

    return new Response(
      JSON.stringify({ success: true, user_id: newUser.user.id, password }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
