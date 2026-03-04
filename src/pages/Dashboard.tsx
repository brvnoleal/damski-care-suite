import { useState } from "react";
import { Users, Calendar, Package, FileCheck, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import AlertCard from "@/components/AlertCard";
import { Button } from "@/components/ui/button";

const alerts = [
  { type: "expiry" as const, title: "Ácido Hialurônico — Lote AH2024-089", description: "Validade em 15 dias. 3 unidades em estoque.", time: "Há 2h" },
  { type: "signature" as const, title: "Sessão #1247 — Maria Silva", description: "Evolução de harmonização facial pendente de assinatura digital.", time: "Há 4h" },
  { type: "compliance" as const, title: "Não conformidade — Prontuário #0892", description: "TCLE não anexado. Bloqueio de finalização ativo.", time: "Ontem" },
  { type: "expiry" as const, title: "Toxina Botulínica — Lote TB2024-156", description: "Validade em 22 dias. 8 unidades em estoque.", time: "Ontem" },
  { type: "signature" as const, title: "Sessão #1245 — João Oliveira", description: "Procedimento de lente de contato dental pendente de assinatura.", time: "2 dias" },
  { type: "compliance" as const, title: "Registro incompleto — Sessão #1240", description: "Fotos clínicas não anexadas ao prontuário.", time: "3 dias" },
];

const ALERTS_PER_PAGE = 3;

const Dashboard = () => {
  const [alertPage, setAlertPage] = useState(0);
  const totalPages = Math.ceil(alerts.length / ALERTS_PER_PAGE);
  const pagedAlerts = alerts.slice(alertPage * ALERTS_PER_PAGE, (alertPage + 1) * ALERTS_PER_PAGE);

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
        <StatCard title="Pacientes Ativos" value={148} icon={Users} trend={{ value: "+12 este mês", positive: true }} />
        <StatCard title="Sessões Hoje" value={8} subtitle="3 concluídas" icon={Calendar} variant="gold" />
        <StatCard title="Pendentes de Assinatura" value={5} subtitle="Últimos 7 dias" icon={FileCheck} variant="warning" />
        <StatCard title="Insumos Críticos" value={3} subtitle="Vencimento próximo" icon={Package} variant="warning" />
      </div>

      {/* 3 colunas alinhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Alertas com paginação */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-elegant h-[380px] flex flex-col">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Alertas
          </h2>
          <div className="space-y-3 flex-1">
            {pagedAlerts.map((a, i) => (
              <AlertCard key={alertPage * ALERTS_PER_PAGE + i} type={a.type} title={a.title} description={a.description} time={a.time} />
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
            <span className="text-xs text-muted-foreground">
              {alertPage + 1} / {totalPages}
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={alertPage === 0} onClick={() => setAlertPage(alertPage - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={alertPage >= totalPages - 1} onClick={() => setAlertPage(alertPage + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Conformidade */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-elegant h-[380px] flex flex-col">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Conformidade
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">RDC 1.002/2025</p>
              <p className="text-xs text-muted-foreground">Sistema em conformidade</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {[
              { label: "Prontuários completos", value: "94%", width: "94%", color: "bg-success" },
              { label: "Assinaturas em dia", value: "87%", width: "87%", color: "bg-warning" },
              { label: "Rastreabilidade de lotes", value: "100%", width: "100%", color: "bg-success" },
              { label: "TCLEs anexados", value: "91%", width: "91%", color: "bg-success" },
              { label: "Fotos clínicas registradas", value: "78%", width: "78%", color: "bg-warning" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`${item.color} rounded-full h-2`} style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Próximos Agendamentos */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-elegant h-[380px] flex flex-col">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Próximos Agendamentos
          </h3>
          <div className="space-y-2.5 flex-1">
            {[
              { time: "09:00", name: "Ana Costa", proc: "Toxina Botulínica" },
              { time: "10:30", name: "Pedro Santos", proc: "Preenchimento Labial" },
              { time: "14:00", name: "Carla Dias", proc: "Lente de Contato Dental" },
              { time: "15:30", name: "Lucas Mendes", proc: "Clareamento Dental" },
              { time: "16:45", name: "Fernanda Lima", proc: "Harmonização Facial" },
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
