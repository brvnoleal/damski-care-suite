import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

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
    if (!authHeader) return json({ error: "Não autenticado (sem Authorization)" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error("auth.getUser falhou:", userErr);
      return json({ error: "Sessão inválida ou expirada. Faça login novamente." }, 401);
    }
    const caller = userData.user;

    const { data: callerMembership } = await supabaseAdmin
      .from("clinica_membro")
      .select("clinica_id, role")
      .eq("user_id", caller.id)
      .maybeSingle();

    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _user_id: caller.id });

    if (!isSuper && (!callerMembership || callerMembership.role !== "admin")) {
      return json({ error: "Apenas administradores podem criar usuários" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const { nome, email, cpf, role, clinica_id: bodyClinicaId } = body as Record<string, string>;

    if (!nome || !email || !cpf || !role) {
      return json({ error: "Campos obrigatórios: nome, email, cpf, role" }, 400);
    }

    const allowedRoles = isSuper
      ? ["admin", "responsavel_tecnico", "recepcionista"]
      : ["recepcionista"];
    if (!allowedRoles.includes(role)) {
      return json({ error: "Papel inválido para o seu nível de acesso" }, 403);
    }

    const targetClinicaId = isSuper ? (bodyClinicaId ?? callerMembership?.clinica_id) : callerMembership!.clinica_id;
    if (!targetClinicaId) return json({ error: "clinica_id não definido" }, 400);

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length < 6) return json({ error: "CPF inválido" }, 400);

    // Senha temporária = primeiros 6 dígitos do CPF (memória do projeto)
    const password = cpfDigits.slice(0, 6).padEnd(8, "0");

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    });
    if (createError) {
      console.error("createUser falhou:", createError);
      const msg = createError.message?.includes("already")
        ? "Já existe um usuário com este email."
        : (createError.message || "Falha ao criar usuário no Auth");
      return json({ error: msg }, 400);
    }

    const newUserId = newUser.user.id;

    const { error: membroError } = await supabaseAdmin
      .from("clinica_membro")
      .insert({ user_id: newUserId, clinica_id: targetClinicaId, role });
    if (membroError) {
      console.error("clinica_membro insert falhou:", membroError);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return json({ error: "Falha ao vincular usuário à clínica" }, 500);
    }

    // Se for admin ou responsável técnico, cria registro em dentista automaticamente
    if (role === "admin" || role === "responsavel_tecnico") {
      const croTag = "PENDENTE-" + newUserId.slice(0, 8);
      const { error: dErr } = await supabaseAdmin.from("dentista").insert({
        clinica_id: targetClinicaId,
        user_id: newUserId,
        nome,
        especialidade: "Não informado",
        cro: croTag,
        email,
        status: "ativo",
      });
      if (dErr) {
        console.error("dentista insert falhou (não bloqueia):", dErr);
      }
    }

    return json({ success: true, user_id: newUserId, password }, 200);
  } catch (error: any) {
    console.error("create-user erro inesperado:", error);
    return json({ error: "Erro inesperado" }, 500);
  }
});
