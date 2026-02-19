import { Shield, Users, Database, Key, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Configuracoes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerenciamento do sistema e usuários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-elegant space-y-4">
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
            {[
              { name: "Dra. Damski", role: "Responsável Técnico", color: "bg-primary/10 text-primary" },
              { name: "Julia Santos", role: "Recepcionista", color: "bg-info/10 text-info" },
              { name: "Admin Sistema", role: "Administrador", color: "bg-gold/10 text-gold-dark" },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-burgundy flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <Badge className={`text-[10px] ${user.color} border-0`}>{user.role}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">Editar</Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full">Adicionar Usuário</Button>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-elegant space-y-4">
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

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-elegant space-y-4">
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

        {/* Database */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-elegant space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
              <Database className="w-4.5 h-4.5 text-info" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Banco de Dados</h2>
              <p className="text-xs text-muted-foreground">PostgreSQL</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Para ativar o backend com banco de dados, autenticação e storage, habilite o <span className="font-medium text-foreground">Lovable Cloud</span>.</p>
            <p className="text-xs">Isso permitirá persistir dados, gerenciar usuários e habilitar todas as funcionalidades do sistema.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
