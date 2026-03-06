import { useState } from "react";
import { Shield, Users, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const roles = [
  { value: "Responsável Técnico", color: "bg-primary/10 text-primary" },
  { value: "Recepcionista", color: "bg-info/10 text-info" },
  { value: "Administrador", color: "bg-gold/10 text-gold-dark" },
];

const getRoleColor = (role: string) => roles.find(r => r.value === role)?.color || "bg-muted text-muted-foreground";

const Configuracoes = () => {
  const [usuarios, setUsuarios] = useState([
    { name: "Dra. Damski", role: "Responsável Técnico" },
    { name: "Julia Santos", role: "Recepcionista" },
    { name: "Admin Sistema", role: "Administrador" },
  ]);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editRole, setEditRole] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoRole, setNovoRole] = useState("");

  const handleEditSave = () => {
    if (editIndex === null) return;
    setUsuarios(prev => prev.map((u, i) => i === editIndex ? { ...u, role: editRole } : u));
    toast.success("Perfil atualizado com sucesso!");
    setEditIndex(null);
  };

  const handleAddUser = () => {
    if (!novoNome.trim() || !novoRole) {
      toast.error("Preencha nome e perfil.");
      return;
    }
    setUsuarios(prev => [...prev, { name: novoNome.trim(), role: novoRole }]);
    toast.success("Usuário adicionado!");
    setNovoNome("");
    setNovoRole("");
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerenciamento do sistema e usuários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users */}
        <LiquidGlassCard draggable={false} className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Controle de Acesso</h2>
                <p className="text-xs text-muted-foreground">Perfis e permissões</p>
              </div>
            </div>

            <div className="space-y-3">
              {usuarios.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-burgundy flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <Badge className={`text-[10px] ${getRoleColor(user.role)} border-0`}>{user.role}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setEditIndex(i); setEditRole(user.role); }}>Editar</Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setAddOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Usuário
            </Button>
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
                { label: "Logs de auditoria", status: "1.247 registros", ok: true },
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
      <Dialog open={editIndex !== null} onOpenChange={(open) => { if (!open) setEditIndex(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil de Acesso</DialogTitle>
          </DialogHeader>
          {editIndex !== null && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Usuário: <span className="font-medium text-foreground">{usuarios[editIndex]?.name}</span></p>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditIndex(null)}>Cancelar</Button>
            <Button onClick={handleEditSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select value={novoRole} onValueChange={setNovoRole}>
                <SelectTrigger><SelectValue placeholder="Selecione o perfil" /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddUser}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Configuracoes;
