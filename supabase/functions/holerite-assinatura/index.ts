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

type Action = "list" | "save" | "revoke";

const isSignatureDataUrl = (value: unknown) =>
  typeof value === "string" &&
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) &&
  value.length <= 750_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autenticado" }, 401);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    const caller = userData?.user;
    if (userError || !caller) return json({ error: "Sessão inválida ou expirada" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = body.action as Action;
    const periodoKey = String(body.periodo_key || "").trim();

    if (!periodoKey || periodoKey.length > 120) return json({ error: "Período inválido" }, 400);

    const { data: membership } = await supabaseAdmin
      .from("clinica_membro")
      .select("clinica_id, role")
      .eq("user_id", caller.id)
      .maybeSingle();

    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _user_id: caller.id });
    if (!isSuper && !membership?.clinica_id) return json({ error: "Usuário sem clínica vinculada" }, 403);

    const canManageRole = isSuper || ["admin", "responsavel_tecnico"].includes(String(membership?.role || ""));

    if (action === "list") {
      const dentistaIds = Array.isArray(body.dentista_ids)
        ? body.dentista_ids.filter((id) => typeof id === "string")
        : [];

      if (dentistaIds.length === 0 || dentistaIds.length > 100) {
        return json({ signatures: [] });
      }

      const dentistaQuery = supabaseAdmin
        .from("dentista")
        .select("id, clinica_id")
        .in("id", dentistaIds);

      if (!isSuper) dentistaQuery.eq("clinica_id", membership.clinica_id);

      const { data: dentistas, error: dentistaError } = await dentistaQuery;
      if (dentistaError) return json({ error: "Falha ao validar profissionais" }, 500);

      const allowedIds = (dentistas || []).map((d: any) => d.id);
      if (allowedIds.length === 0) return json({ signatures: [] });

      const { data: logs, error: logsError } = await supabaseAdmin
        .from("audit_log")
        .select("action, entity_id, diff, created_at")
        .eq("entity", "holerite_assinatura")
        .in("entity_id", allowedIds)
        .order("created_at", { ascending: false })
        .limit(500);

      if (logsError) return json({ error: "Falha ao carregar assinaturas" }, 500);

      const latest = new Map<string, any>();
      for (const log of logs || []) {
        const diff = (log as any).diff || {};
        if (diff.periodo_key !== periodoKey) continue;
        const dentistaId = (log as any).entity_id;
        if (!latest.has(dentistaId)) latest.set(dentistaId, log);
      }

      const signatures = [...latest.entries()]
        .filter(([, log]) => log.action === "SIGN")
        .map(([dentistaId, log]) => {
          const diff = log.diff || {};
          return {
            dentista_id: dentistaId,
            periodo_key: diff.periodo_key,
            periodo_label: diff.periodo_label,
            assinatura_data_url: diff.assinatura_data_url,
            signed_by_user_id: diff.signed_by_user_id,
            signed_at: diff.signed_at || log.created_at,
          };
        });

      return json({ signatures });
    }

    if (action !== "save" && action !== "revoke") return json({ error: "Ação inválida" }, 400);

    const dentistaId = String(body.dentista_id || "").trim();
    const periodoLabel = String(body.periodo_label || "").trim().slice(0, 160);
    if (!dentistaId || !periodoLabel) return json({ error: "Dados obrigatórios ausentes" }, 400);

    const { data: dentista, error: dentistaError } = await supabaseAdmin
      .from("dentista")
      .select("id, clinica_id, user_id")
      .eq("id", dentistaId)
      .maybeSingle();

    if (dentistaError || !dentista) return json({ error: "Profissional não encontrado" }, 404);

    const sameClinic = isSuper || dentista.clinica_id === membership?.clinica_id;
    const isOwner = dentista.user_id === caller.id;
    if (!sameClinic || (!canManageRole && !isOwner)) return json({ error: "Sem permissão para assinar este holerite" }, 403);

    if (action === "save" && !isSignatureDataUrl(body.assinatura_data_url)) {
      return json({ error: "Assinatura inválida" }, 400);
    }

    const now = new Date().toISOString();
    const diff = action === "save"
      ? {
          periodo_key: periodoKey,
          periodo_label: periodoLabel,
          assinatura_data_url: body.assinatura_data_url,
          signed_by_user_id: caller.id,
          signed_at: now,
          user_agent: req.headers.get("user-agent") || null,
        }
      : {
          periodo_key: periodoKey,
          periodo_label: periodoLabel,
          revoked_by_user_id: caller.id,
          revoked_at: now,
          user_agent: req.headers.get("user-agent") || null,
        };

    const { error: auditError } = await supabaseAdmin.from("audit_log").insert({
      clinica_id: dentista.clinica_id,
      user_id: caller.id,
      action: action === "save" ? "SIGN" : "REVOKE",
      entity: "holerite_assinatura",
      entity_id: dentistaId,
      diff,
    });

    if (auditError) return json({ error: "Falha ao registrar assinatura" }, 500);

    if (action === "revoke") return json({ success: true });

    return json({
      signature: {
        dentista_id: dentistaId,
        periodo_key: periodoKey,
        periodo_label: periodoLabel,
        assinatura_data_url: body.assinatura_data_url,
        signed_by_user_id: caller.id,
        signed_at: now,
      },
    });
  } catch (error) {
    console.error("holerite-assinatura erro inesperado:", error);
    return json({ error: "Erro inesperado" }, 500);
  }
});