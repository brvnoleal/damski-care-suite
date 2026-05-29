import { useState } from "react";
import { Shield, Users, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import PerfilConsultorio from "@/components/configuracoes/PerfilConsultorio";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  responsavel_tecnico: "Responsável Técnico",
  recepcionista: "Recepcionista",
};

const roleColors: Record<AppRole, string> = {
  admin: "bg-accent text-primary",
  responsavel_tecnico: "bg-primary/10 text-primary",
  recepcionista: "bg-info/10 text-info",
};

interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  nome: string;
}

const Configuracoes = () => {
  const queryClient = useQueryClient();

  const [editItem, setEditItem] = useState<UserWithRole | null>(null);
  const [editRole, setEditRole] = useState<AppRole>("recepcionista");

  // Add user dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [newNome, setNewNome] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCpf, setNewCpf] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("recepcionista");
  const [creating, setCreating] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const { data: isAdminData, isLoading: isLoadingRole } = useQuery({
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
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("id", id);
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
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke("create-user", {
        body: { nome: newNome, email: newEmail, cpf: newCpf, role: newRole },
      });

      if (response.error) throw new Error(response.error.message);
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

  if (isLoadingRole) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LiquidGlassCard draggable={false} className="p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground">Acesso Restrito</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Apenas administradores podem acessar as configurações do sistema.
          </p>
        </LiquidGlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerenciamento do sistema e usuários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerfilConsultorio />


        {/* Users */}
        <LiquidGlassCard draggable={false} className="p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Controle de Acesso</h2>
                  <p className="text-xs text-muted-foreground">Perfis e permissões</p>
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
                          {user.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
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
                      onClick={() => { setEditItem(user); setEditRole(user.role); }}
                    >
                      Editar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </LiquidGlassCard>

        {/* Security */}
        <LiquidGlassCard draggable={false} className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-success" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Segurança & Conformidade</h2>
                <p className="text-xs text-muted-foreground">Criptografia, backup e auditoria</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Criptografia de dados", status: "Ativo", ok: true },
                { label: "Backup automático semanal", status: "Ativo", ok: true },
                { label: "Logs de auditoria", status: "Ativo", ok: true },
                { label: "Versionamento de registros", status: "Ativo", ok: true },
                { label: "Exclusão definitiva", status: "Bloqueada", ok: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <Badge className={item.ok ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>

        {/* Notifications */}
        <LiquidGlassCard draggable={false} className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                <Bell className="w-4.5 h-4.5 text-warning" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Alertas Automáticos</h2>
                <p className="text-xs text-muted-foreground">Notificações e avisos</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5">
                <span className="text-foreground">Vencimento de insumos (15 dias)</span>
                <span className="text-success text-xs font-medium">Ativo</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-foreground">Sessões pendentes de assinatura</span>
                <span className="text-success text-xs font-medium">Ativo</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-foreground">Campos obrigatórios não preenchidos</span>
                <span className="text-success text-xs font-medium">Ativo</span>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={editItem !== null} onOpenChange={(open) => { if (!open) setEditItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil de Acesso</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Usuário: <span className="font-medium text-foreground">{editItem.nome}</span>
              </p>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as AppRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(roleLabels) as AppRole[]).map(r => (
                      <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button>
            <Button onClick={handleEditSave} disabled={updateRoleMutation.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input value={newNome} onChange={(e) => setNewNome(e.target.value)} placeholder="Dr(a). Nome" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={newCpf}
                onChange={(e) => setNewCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              <p className="text-xs text-muted-foreground">Uma senha temporária aleatória será gerada e exibida uma única vez após a criação.</p>
            </div>
            <div className="space-y-2">
              <Label>Perfil de acesso</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(roleLabels) as AppRole[]).map(r => (
                    <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser} disabled={creating}>
              {creating ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated password dialog */}
      <Dialog open={!!generatedPassword} onOpenChange={(o) => !o && setGeneratedPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Senha temporária gerada</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Copie e compartilhe com o usuário de forma segura. Esta senha não será exibida novamente.
              O usuário deve alterá-la no primeiro acesso.
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
          <DialogFooter>
            <Button onClick={() => setGeneratedPassword(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Configuracoes;
