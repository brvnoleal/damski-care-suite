import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClinicaContext {
  clinicaId: string | null;
  clinicaNome: string | null;
  isSuperAdmin: boolean;
  loading: boolean;
}

export function useClinicaContext(): ClinicaContext {
  const [state, setState] = useState<ClinicaContext>({
    clinicaId: null,
    clinicaNome: null,
    isSuperAdmin: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setState({ clinicaId: null, clinicaNome: null, isSuperAdmin: false, loading: false });
        return;
      }
      const [{ data: membro }, { data: superFlag }] = await Promise.all([
        supabase.from("clinica_membro").select("clinica_id, clinica:clinica_id(nome)").eq("user_id", user.id).maybeSingle(),
        supabase.rpc("is_super_admin", { _user_id: user.id }),
      ]);
      if (cancelled) return;
      setState({
        clinicaId: membro?.clinica_id ?? null,
        clinicaNome: (membro?.clinica as any)?.nome ?? null,
        isSuperAdmin: Boolean(superFlag),
        loading: false,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
