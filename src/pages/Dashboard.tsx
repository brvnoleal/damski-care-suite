import { Link } from "react-router-dom";
import {
  Users, Calendar, Package, FileCheck,
  AlertTriangle, ArrowUpRight, ChevronRight, Star, Activity,
  Smile, Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell,
  XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { motion } from "framer-motion";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
});

/* ───────── Mock Data ───────── */

const kpis = [
  { label: "Pacientes Ativos", value: "148", change: "+12 este mês", icon: Users, color: "primary" as const, trend: "up" },
  { label: "Sessões Hoje", value: "8", change: "3 concluídas", icon: Calendar, color: "info" as const, trend: "neutral" },
  { label: "Insumos Críticos", value: "4", change: "1 vencido", icon: Package, color: "gold" as const, trend: "neutral" },
  { label: "Consultas Semana", value: "45", change: "38 confirmadas", icon: FileCheck, color: "success" as const, trend: "up" },
];

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  info: { bg: "bg-info/10", text: "text-info" },
  success: { bg: "bg-success/10", text: "text-success" },
  gold: { bg: "bg-[hsl(var(--gold))]/10", text: "text-[hsl(var(--gold))]" },
};

const consultasPorStatus = [
  { name: "Confirmadas", value: 38, color: "hsl(160, 84%, 39%)" },
  { name: "Aguardando", value: 5, color: "hsl(40, 60%, 55%)" },
  { name: "Canceladas", value: 2, color: "hsl(345, 45%, 45%)" },
];

const sessionsWeekly = [
  { day: "Seg", sessoes: 6 },
  { day: "Ter", sessoes: 9 },
  { day: "Qua", sessoes: 7 },
  { day: "Qui", sessoes: 11 },
  { day: "Sex", sessoes: 8 },
  { day: "Sáb", sessoes: 4 },
];

const topProcedures = [
  { name: "Harmonização", count: 32, revenue: 19200 },
  { name: "Toxina Bot.", count: 28, revenue: 11200 },
  { name: "Clareamento", count: 18, revenue: 5400 },
  { name: "Lente Contato", count: 12, revenue: 8400 },
  { name: "Preench. Labial", count: 10, revenue: 6000 },
];

const CHART_COLORS = [
  "hsl(239, 84%, 67%)", "hsl(217, 91%, 60%)", "hsl(160, 84%, 39%)",
  "hsl(40, 60%, 55%)", "hsl(345, 45%, 45%)",
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

const nextAppointments = [
  { time: "14:00", patient: "Carla Dias", proc: "Lente de Contato Dental", sala: "Sala 1", status: "confirmado" },
  { time: "14:30", patient: "Marcos Lima", proc: "Profilaxia", sala: "Sala 3", status: "confirmado" },
  { time: "15:30", patient: "Lucas Mendes", proc: "Clareamento Dental", sala: "Sala 2", status: "aguardando" },
  { time: "16:00", patient: "Beatriz Alves", proc: "Avaliação", sala: "Sala 1", status: "confirmado" },
  { time: "16:45", patient: "Fernanda Lima", proc: "Harmonização Facial", sala: "Sala 3", status: "aguardando" },
];

const glassTooltip = {
  background: "var(--glass-bg-strong)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--glass-border)",
  borderRadius: "0.75rem",
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const glassTooltipText = {
  color: "hsl(var(--foreground))",
};

/* ───────── Component ───────── */

const Dashboard = () => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}, Dra. Damski</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-success/10 text-success border-success/20 text-[11px]">
            <Activity className="w-3 h-3 mr-1" /> Clínica aberta
          </Badge>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => {
          const colors = colorMap[kpi.color];
          return (
            <motion.div key={kpi.label} {...fadeUp(i * 0.08)}>
              <LiquidGlassCard className="p-4 sm:p-5" draggable={false}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] sm:text-[13px] text-muted-foreground font-medium">{kpi.label}</p>
                    <p className="text-xl sm:text-2xl font-display font-bold text-foreground">{kpi.value}</p>
                    <p className={cn("text-[10px] sm:text-xs font-medium", kpi.trend === "up" ? "text-success" : "text-muted-foreground")}>
                      {kpi.change}
                    </p>
                  </div>
                  <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center", colors.bg)}>
                    <kpi.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", colors.text)} />
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* ── Row 2: Consultas por Status + Google Calendar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div {...scaleIn(0.35)} className="lg:col-span-2">
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Consultas da Semana</h2>
              </div>
              <Badge variant="outline" className="text-[10px]">45 total</Badge>
            </div>
            <div className="p-4 flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={consultasPorStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    strokeWidth={2}
                    stroke="rgba(255,255,255,0.1)"
                  >
                    {consultasPorStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [`${v}`, name]} contentStyle={glassTooltip} labelStyle={glassTooltipText} itemStyle={glassTooltipText} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
                {consultasPorStatus.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] text-muted-foreground">{s.name}: <span className="font-semibold text-foreground">{s.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div {...scaleIn(0.45)} className="lg:col-span-3">
          <LiquidGlassCard className="overflow-hidden" draggable={false}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Agenda</h2>
              </div>
              <Link to="/agendamentos" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Ver completa <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <iframe
              src="https://calendar.google.com/calendar/embed?src=brunolealcavalcante%40gmail.com&ctz=America%2FSao_Paulo"
              className="w-full border-0"
              height="260"
              scrolling="no"
              title="Google Calendar"
            />
          </LiquidGlassCard>
        </motion.div>
      </div>

      {/* ── Row 3: Sessões da Semana + Top Procedimentos + Próximos Atendimentos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div {...fadeUp(0.5)}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
              <Clock className="w-4 h-4 text-info" />
              <h2 className="text-sm font-semibold text-foreground">Sessões da Semana</h2>
            </div>
            <div className="p-4 flex-1">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={sessionsWeekly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={glassTooltip} labelStyle={glassTooltipText} itemStyle={glassTooltipText} formatter={(v: number) => [`${v}`, "Sessões"]} />
                  <Bar dataKey="sessoes" radius={[6, 6, 0, 0]} barSize={28}>
                    {sessionsWeekly.map((_, i) => (
                      <Cell key={i} fill={i === 3 ? "hsl(239, 84%, 67%)" : "hsl(239, 84%, 67%, 0.35)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div {...fadeUp(0.6)}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
              <Star className="w-4 h-4 text-[hsl(var(--gold))]" />
              <h2 className="text-sm font-semibold text-foreground">Top Procedimentos</h2>
            </div>
            <div className="p-3 flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={topProcedures}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={32}
                    strokeWidth={2}
                    stroke="rgba(255,255,255,0.1)"
                  >
                    {topProcedures.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [`${v}x`, name]} contentStyle={glassTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                {topProcedures.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                    <span className="text-[10px] text-muted-foreground">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div {...fadeUp(0.7)}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Próximos Atendimentos</h2>
              </div>
              <Badge variant="outline" className="text-[10px]">{nextAppointments.length}</Badge>
            </div>
            <div className="divide-y divide-white/5 flex-1 overflow-y-auto">
              {nextAppointments.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="text-xs font-mono font-semibold text-primary w-10 shrink-0">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.patient}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.proc} · {a.sala}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] shrink-0",
                      a.status === "confirmado" ? "text-success border-success/30" : "text-warning border-warning/30"
                    )}
                  >
                    {a.status === "confirmado" ? "✓" : "⏳"}
                  </Badge>
                </div>
              ))}
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>

      {/* ── Row 4: Insumos Críticos + Pendentes de Assinatura ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div {...fadeUp(0.8)}>
          <LiquidGlassCard className="overflow-hidden" draggable={false}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h2 className="text-sm font-semibold text-foreground">Insumos Críticos</h2>
              </div>
              <Link to="/insumos" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {criticalSupplies.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
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
          </LiquidGlassCard>
        </motion.div>

        <motion.div {...fadeUp(0.9)}>
          <LiquidGlassCard className="overflow-hidden" draggable={false}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-warning" />
                <h2 className="text-sm font-semibold text-foreground">Pendentes de Assinatura</h2>
              </div>
              <Badge variant="outline" className="text-[10px] text-warning border-warning/30">{pendingSignatures.length}</Badge>
            </div>
            <div className="divide-y divide-white/5">
              {pendingSignatures.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
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
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
