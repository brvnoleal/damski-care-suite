import { useState } from "react";
import { Shield, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  responsavel_tecnico: "Responsável Técnico",
  recepcionista: "Recepcionista",
  super_admin: "Super Admin",
};

const roleColors: Record<AppRole, string> = {
  admin: "bg-accent text-primary",
  responsavel_tecnico: "bg-primary/10 text-primary",
  recepcionista: "bg-info/10 text-info",
  super_admin: "bg-destructive/10 text-destructive",
};

const assignableRoles: AppRole[] = ["admin", "responsavel_tecnico", "recepcionista"];

interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  nome: string;
}

export const ControleAcessoSection = () => {
  const queryClient = useQueryClient();

  const [editItem, setEditItem] = useState<UserWithRole | null>(null);
  const [editRole, setEditRole] = useState<AppRole>("recepcionista");

  const [addOpen, setAddOpen] = useState(false);
  const [newNome, setNewNome] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCpf, setNewCpf] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("recepcionista");
  const [creating, setCreating] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const { data: isAdminData } = useQuery({
    queryKey: ["current_user_is_admin"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
  });
  const isAdmin = !!isAdminData;

  const { data: usersWithRoles = [], isLoading } = useQuery({
    queryKey: ["user_roles_with_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role, profiles(nome)");
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        role: row.role as AppRole,
        nome: row.profiles?.nome || "Sem nome",
      })) as UserWithRole[];
    },
    enabled: isAdmin,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles_with_profiles"] });
      toast.success("Perfil atualizado com sucesso!");
      setEditItem(null);
    },
    onError: () => toast.error("Erro ao atualizar perfil."),
  });

  const handleEditSave = () => {
    if (!editItem) return;
    updateRoleMutation.mutate({ id: editItem.id, role: editRole });
  };

  const handleCreateUser = async () => {
    if (!newNome || !newEmail || !newCpf || !newRole) {
      toast.error("Preencha todos os campos.");
      return;
    }
    const cpfDigits = newCpf.replace(/\D/g, "");
    if (cpfDigits.length < 6) {
      toast.error("CPF deve ter pelo menos 6 dígitos.");
      return;
    }
    setCreating(true);
    try {
      const response = await supabase.functions.invoke("create-user", {
        body: { nome: newNome, email: newEmail, cpf: newCpf, role: newRole },
      });
      // Quando a função responde com status != 2xx, o SDK coloca o body em response.error.context
      if (response.error) {
        let msg = response.error.message;
        const ctx: any = (response.error as any).context;
        try {
          if (ctx) {
            const parsed = typeof ctx.json === "function"
              ? await ctx.json()
              : ctx.body
                ? await new Response(ctx.body).json()
                : null;
            if (parsed?.error) msg = parsed.error;
          }
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      if (response.data?.error) throw new Error(response.data.error);
      const tempPassword = response.data?.password as string | undefined;
      setGeneratedPassword(tempPassword || null);
      toast.success(`Usuário ${newNome} criado com sucesso.`);
      queryClient.invalidateQueries({ queryKey: ["user_roles_with_profiles"] });
      setAddOpen(false);
      setNewNome("");
      setNewEmail("");
      setNewCpf("");
      setNewRole("recepcionista");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário.");
    } finally {
      setCreating(false);
    }
  };


  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  if (!isAdmin) {
    return (
      <LiquidGlassCard draggable={false} className="p-6 text-center">
        <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-sm font-semibold text-foreground">Acesso Restrito</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Apenas administradores podem gerenciar usuários.
        </p>
      </LiquidGlassCard>
    );
  }

  return (
    <LiquidGlassCard draggable={false} className="p-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Controle de Acesso</h2>
              <p className="text-xs text-muted-foreground">Perfis e permissões dos usuários do sistema</p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : usersWithRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum usuário com perfil atribuído.</p>
        ) : (
          <div className="space-y-3">
            {usersWithRoles.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">
                      {user.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.nome}</p>
                    <Badge className={`text-[10px] ${roleColors[user.role]} border-0`}>
                      {roleLabels[user.role]}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setEditItem(user);
                    setEditRole(user.role);
                  }}
                >
                  Editar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ResponsiveDialog
        open={editItem !== null}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
        title="Editar Perfil de Acesso"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditItem(null)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button onClick={handleEditSave} disabled={updateRoleMutation.isPending} className="flex-1 sm:flex-none">
              Salvar
            </Button>
          </>
        }
      >
        {editItem && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Usuário: <span className="font-medium text-foreground">{editItem.nome}</span>
            </p>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabels[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </ResponsiveDialog>

      <ResponsiveDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Novo Usuário"
        description="Preencha os dados para criar um novo usuário."
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={creating} className="flex-1 sm:flex-none">
              {creating ? "Criando..." : "Criar Usuário"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={newNome} onChange={(e) => setNewNome(e.target.value)} placeholder="Dr(a). Nome" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input
              value={newCpf}
              onChange={(e) => setNewCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            <p className="text-xs text-muted-foreground">
              Uma senha temporária aleatória será gerada e exibida uma única vez após a criação.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Perfil de acesso</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={!!generatedPassword}
        onOpenChange={(o) => !o && setGeneratedPassword(null)}
        title="Senha temporária gerada"
        footer={<Button onClick={() => setGeneratedPassword(null)} className="flex-1 sm:flex-none">Fechar</Button>}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Copie e compartilhe com o usuário de forma segura. Esta senha não será exibida novamente. O usuário deve
            alterá-la no primeiro acesso.
          </p>
          <div className="flex items-center gap-2">
            <Input readOnly value={generatedPassword ?? ""} className="font-mono" />
            <Button
              variant="outline"
              onClick={() => {
                if (generatedPassword) {
                  navigator.clipboard.writeText(generatedPassword);
                  toast.success("Senha copiada.");
                }
              }}
            >
              Copiar
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </LiquidGlassCard>
  );
};

export default ControleAcessoSection;
