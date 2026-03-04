import { Users, Calendar, Package, FileCheck } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";

const todaySessions = [
  { time: "09:00", name: "Ana Costa", proc: "Toxina Botulínica", status: "concluída" },
  { time: "10:30", name: "Pedro Santos", proc: "Preenchimento Labial", status: "concluída" },
  { time: "11:00", name: "Julia Ramos", proc: "Clareamento", status: "concluída" },
  { time: "14:00", name: "Carla Dias", proc: "Lente de Contato Dental", status: "agendado" },
  { time: "15:30", name: "Lucas Mendes", proc: "Clareamento Dental", status: "agendado" },
  { time: "16:00", name: "Beatriz Alves", proc: "Avaliação", status: "agendado" },
  { time: "16:45", name: "Fernanda Lima", proc: "Harmonização Facial", status: "agendado" },
  { time: "17:30", name: "Ricardo Nunes", proc: "Profilaxia", status: "agendado" },
];

const criticalSupplies = [
  { name: "Fio PDO Espiculado", lot: "PDO2024-067", expiry: "28/02/2026", daysLeft: -4 },
  { name: "Ácido Hialurônico 20mg/ml", lot: "AH2024-089", expiry: "08/03/2026", daysLeft: 4 },
  { name: "Toxina Botulínica 100U", lot: "TB2024-156", expiry: "10/03/2026", daysLeft: 6 },
];

const pendingSignatures = [
  { session: "#1247", patient: "Maria Silva", proc: "Harmonização facial", date: "03/03" },
  { session: "#1245", patient: "João Oliveira", proc: "Lente de contato dental", date: "02/03" },
  { session: "#1243", patient: "Ana Costa", proc: "Toxina Botulínica", date: "01/03" },
  { session: "#1240", patient: "Pedro Santos", proc: "Preenchimento Labial", date: "28/02" },
  { session: "#1238", patient: "Carla Dias", proc: "Clareamento Dental", date: "27/02" },
];

const SessionsHover = () => (
  <div className="p-3 space-y-2">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Sessões de hoje</p>
    {todaySessions.map((s, i) => (
      <div key={i} className="flex items-center gap-2 px-1 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
        <span className="text-xs font-mono text-primary font-semibold w-10">{s.time}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
          <p className="text-xs text-muted-foreground truncate">{s.proc}</p>
        </div>
        <Badge variant="outline" className={s.status === "concluída" ? "text-success border-success/30 text-[10px]" : "text-muted-foreground text-[10px]"}>
          {s.status}
        </Badge>
      </div>
    ))}
  </div>
);

const SuppliesHover = () => (
  <div className="p-3 space-y-2">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Vencimento em até 7 dias</p>
    {criticalSupplies.map((s, i) => (
      <div key={i} className="flex items-center gap-2 px-1 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
          <p className="text-xs text-muted-foreground">Lote {s.lot} · {s.expiry}</p>
        </div>
        <Badge variant="outline" className={s.daysLeft <= 0 ? "text-destructive border-destructive/30 text-[10px]" : "text-warning border-warning/30 text-[10px]"}>
          {s.daysLeft <= 0 ? "Vencido" : `${s.daysLeft}d`}
        </Badge>
      </div>
    ))}
  </div>
);

const SignaturesHover = () => (
  <div className="p-3 space-y-2">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Pendentes de assinatura</p>
    {pendingSignatures.map((s, i) => (
      <div key={i} className="flex items-center gap-2 px-1 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
        <span className="text-xs font-mono text-warning font-semibold w-12">{s.session}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{s.patient}</p>
          <p className="text-xs text-muted-foreground truncate">{s.proc}</p>
        </div>
        <span className="text-[10px] text-muted-foreground">{s.date}</span>
      </div>
    ))}
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da clínica — Damski Odonto
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pacientes Ativos" value={148} icon={Users} trend={{ value: "+12 este mês", positive: true }} />
        <StatCard title="Sessões Hoje" value={8} subtitle="3 concluídas" icon={Calendar} variant="gold" hoverContent={<SessionsHover />} />
        <StatCard title="Pendentes de Assinatura" value={5} subtitle="Últimos 7 dias" icon={FileCheck} variant="warning" hoverContent={<SignaturesHover />} />
        <StatCard title="Insumos Críticos" value={3} subtitle="Vencimento próximo" icon={Package} variant="warning" hoverContent={<SuppliesHover />} />
      </div>
    </div>
  );
};

export default Dashboard;
