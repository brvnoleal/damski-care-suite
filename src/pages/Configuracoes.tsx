import { Shield, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import PerfilConsultorio from "@/components/configuracoes/PerfilConsultorio";
import { FadeIn } from "@/components/FadeIn";

const Configuracoes = () => {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">Preferências e parâmetros do sistema</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerfilConsultorio />

          {/* Security */}
          <LiquidGlassCard draggable={false} className="p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-success" />
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
                    <Badge
                      className={
                        item.ok
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }
                    >
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
                  <Bell className="w-4 h-4 text-warning" />
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
      </FadeIn>
    </div>
  );
};

export default Configuracoes;
