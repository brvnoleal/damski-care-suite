import { Users, Calendar, Package, FileCheck, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";
import AlertCard from "@/components/AlertCard";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da clínica — Damski Odonto
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pacientes Ativos"
          value={148}
          icon={Users}
          trend={{ value: "+12 este mês", positive: true }}
        />

        <StatCard
          title="Sessões Hoje"
          value={8}
          subtitle="3 concluídas"
          icon={Calendar}
          variant="gold"
        />

        <StatCard
          title="Pendentes de Assinatura"
          value={5}
          subtitle="Últimos 7 dias"
          icon={FileCheck}
          variant="warning"
        />

        <StatCard
          title="Insumos Críticos"
          value={3}
          subtitle="Vencimento próximo"
          icon={Package}
          variant="warning"
        />
      </div>

      {/* 3 colunas alinhadas e com mesmo tamanho */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <section className="rounded-xl border border-border bg-card p-5 shadow-elegant min-h-[460px] h-full flex flex-col">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Alertas e Notificações
          </h2>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            <AlertCard
              type="expiry"
              title="Ácido Hialurônico — Lote AH2024-089"
              description="Validade em 15 dias. 3 unidades em estoque."
              time="Há 2h"
            />

            <AlertCard
              type="signature"
              title="Sessão #1247 — Maria Silva"
              description="Evolução de harmonização facial pendente de assinatura digital."
              time="Há 4h"
            />

            <AlertCard
              type="compliance"
              title="Não conformidade — Prontuário #0892"
              description="TCLE não anexado. Bloqueio de finalização ativo."
              time="Ontem"
            />

            <AlertCard
              type="expiry"
              title="Toxina Botulínica — Lote TB2024-156"
              description="Validade em 22 dias. 8 unidades em estoque."
              time="Ontem"
            />

            <AlertCard
              type="signature"
              title="Sessão #1245 — João Oliveira"
              description="Procedimento de lente de contato dental pendente de assinatura."
              time="2 dias"
            />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-elegant min-h-[460px] h-full flex flex-col">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Conformidade
          </h2>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">RDC 1.002/2025</p>
              <p className="text-xs text-muted-foreground">Sistema em conformidade</p>
            </div>
          </div>

          <div className="space-y-3 mt-4 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prontuários completos</span>
              <span className="font-medium text-foreground">94%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-success rounded-full h-2" style={{ width: "94%" }} />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Assinaturas em dia</span>
              <span className="font-medium text-foreground">87%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-warning rounded-full h-2" style={{ width: "87%" }} />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rastreabilidade de lotes</span>
              <span className="font-medium text-foreground">100%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-success rounded-full h-2" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Último backup: hoje às 03:00</p>
            <p className="text-xs text-muted-foreground">Logs de auditoria: 1.247 registros</p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-elegant min-h-[460px] h-full flex flex-col">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Próximos Agendamentos
          </h3>
          <div className="space-y-2.5 flex-1">
            {[
              { time: "09:00", name: "Ana Costa", proc: "Toxina Botulínica" },
              { time: "10:30", name: "Pedro Santos", proc: "Preenchimento Labial" },
              { time: "14:00", name: "Carla Dias", proc: "Lente de Contato Dental" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-xs font-mono text-primary font-semibold w-12">
                  {item.time}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.proc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
