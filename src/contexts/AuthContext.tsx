import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { clearStoredAuthSession } from "@/lib/auth-session";

type AppRole = "admin" | "responsavel_tecnico" | "recepcionista";

interface Profile {
  id: string;
  nome: string;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.rpc("get_user_role", { _user_id: userId }),
      ]);

      setProfile(profileRes.data ? (profileRes.data as unknown as Profile) : null);
      setRole(roleRes.data ? (roleRes.data as unknown as AppRole) : null);
    } catch {
      setProfile(null);
      setRole(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const applySession = (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      void fetchUserData(nextUser.id).finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        applySession(nextSession);
      }
    );

    void supabase.auth.getSession()
      .then(({ data: { session } }) => {
        applySession(session);
      })
      .catch(() => {
        clearStoredAuthSession();
        applySession(null);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } finally {
      clearStoredAuthSession();
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
