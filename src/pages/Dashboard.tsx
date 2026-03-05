import { Link } from "react-router-dom";
import {
  Users, Calendar, Package, FileCheck, DollarSign, TrendingUp,
  Clock, AlertTriangle, CheckCircle2, ArrowUpRight, Syringe,
  ChevronRight, Activity, Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ───────── Mock Data ───────── */

const kpis = [
  { label: "Pacientes Ativos", value: "148", change: "+12", icon: Users, color: "primary" as const },
  { label: "Sessões Hoje", value: "8", change: "3 concluídas", icon: Calendar, color: "info" as const },
  { label: "Faturamento Mensal", value: "R$ 47.800", change: "+18%", icon: DollarSign, color: "success" as const },
  { label: "Taxa de Retorno", value: "82%", change: "+5%", icon: TrendingUp, color: "gold" as const },
];

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20" },
  info: { bg: "bg-info/10", text: "text-info", ring: "ring-info/20" },
  success: { bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  gold: { bg: "bg-[hsl(var(--gold))]/10", text: "text-[hsl(var(--gold))]", ring: "ring-[hsl(var(--gold))]/20" },
};

const todayAgenda = [
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
  { name: "Anestésico Articaína", lot: "AN2024-312", expiry: "12/03/2026", daysLeft: 8 },
];

const pendingSignatures = [
  { session: "#1247", patient: "Maria Silva", proc: "Harmonização facial", date: "03/03" },
  { session: "#1245", patient: "João Oliveira", proc: "Lente de contato dental", date: "02/03" },
  { session: "#1243", patient: "Ana Costa", proc: "Toxina Botulínica", date: "01/03" },
  { session: "#1240", patient: "Pedro Santos", proc: "Preenchimento Labial", date: "28/02" },
];

const topProcedures = [
  { name: "Harmonização Facial", count: 32, revenue: "R$ 19.200", pct: 100 },
  { name: "Toxina Botulínica", count: 28, revenue: "R$ 11.200", pct: 87 },
  { name: "Clareamento Dental", count: 18, revenue: "R$ 5.400", pct: 56 },
  { name: "Lente de Contato", count: 12, revenue: "R$ 8.400", pct: 37 },
  { name: "Preenchimento Labial", count: 10, revenue: "R$ 6.000", pct: 31 },
];

const recentActivity = [
  { icon: Syringe, text: "Sessão de Harmonização concluída — Maria Silva", time: "há 25 min", type: "session" },
  { icon: Users, text: "Novo paciente cadastrado — Ricardo Nunes", time: "há 1h", type: "patient" },
  { icon: DollarSign, text: "Pagamento recebido — R$ 1.200 via PIX", time: "há 2h", type: "payment" },
  { icon: Package, text: "Lote AH2024-089 próximo do vencimento", time: "há 3h", type: "alert" },
  { icon: FileCheck, text: "TCLE assinado digitalmente — João Oliveira", time: "há 4h", type: "doc" },
];

/* ───────── Component ───────── */

const Dashboard = () => {
  const completedCount = todayAgenda.filter((s) => s.status === "concluída").length;
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}, Dra. Damski</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link to="/agendamentos">
          <Button size="sm" className="gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Ver Agenda Completa
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const colors = colorMap[kpi.color];
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-border bg-card p-5 shadow-elegant hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[13px] text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs font-medium text-success">{kpi.change}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg)}>
                  <kpi.icon className={cn("w-5 h-5", colors.text)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Agenda + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda do Dia - takes 2 cols */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-elegant">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Agenda de Hoje</h2>
              <Badge variant="outline" className="text-[10px] ml-1">{completedCount}/{todayAgenda.length}</Badge>
            </div>
            <Link to="/agendamentos" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {todayAgenda.map((s, i) => {
              const isDone = s.status === "concluída";
              const isCurrent = !isDone && i === completedCount;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 transition-colors",
                    isCurrent && "bg-primary/5",
                    isDone && "opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    isDone ? "bg-success" : isCurrent ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                  )} />
                  <span className="text-xs font-mono font-semibold w-11 text-muted-foreground">{s.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", isDone ? "text-muted-foreground line-through" : "text-foreground")}>{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.proc}</p>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      <Clock className="w-3 h-3 mr-1" /> {s.time}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Atividade Recente */}
          <div className="rounded-xl border border-border bg-card shadow-elegant">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Atividade Recente</h2>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <a.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{a.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: 3 panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Procedimentos Populares */}
        <div className="rounded-xl border border-border bg-card shadow-elegant">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Star className="w-4 h-4 text-[hsl(var(--gold))]" />
            <h2 className="text-sm font-semibold text-foreground">Top Procedimentos</h2>
          </div>
          <div className="p-5 space-y-4">
            {topProcedures.map((p, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.count}x</span>
                </div>
                <Progress value={p.pct} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground">{p.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insumos Críticos */}
        <div className="rounded-xl border border-border bg-card shadow-elegant">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">Insumos Críticos</h2>
            </div>
            <Link to="/insumos" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {criticalSupplies.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  s.daysLeft <= 0 ? "bg-destructive" : s.daysLeft <= 5 ? "bg-warning" : "bg-success"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">Lote {s.lot} · Venc. {s.expiry}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] shrink-0",
                    s.daysLeft <= 0 ? "text-destructive border-destructive/30" : s.daysLeft <= 5 ? "text-warning border-warning/30" : "text-muted-foreground"
                  )}
                >
                  {s.daysLeft <= 0 ? "Vencido" : `${s.daysLeft}d`}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Pendentes de Assinatura */}
        <div className="rounded-xl border border-border bg-card shadow-elegant">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">Pendentes de Assinatura</h2>
            </div>
            <Badge variant="outline" className="text-[10px] text-warning border-warning/30">{pendingSignatures.length}</Badge>
          </div>
          <div className="divide-y divide-border">
            {pendingSignatures.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                  <FileCheck className="w-3.5 h-3.5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.patient}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.proc} · {s.date}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1 shrink-0">
                  Assinar <ArrowUpRight className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
