import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { procedimentoConsultaLabels } from "@/types";

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

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  info: { bg: "bg-info/10", text: "text-info" },
  success: { bg: "bg-success/10", text: "text-success" },
  gold: { bg: "bg-[hsl(var(--gold))]/10", text: "text-[hsl(var(--gold))]" },
};

const CHART_COLORS = [
  "hsl(239, 84%, 67%)", "hsl(217, 91%, 60%)", "hsl(160, 84%, 39%)",
  "hsl(40, 60%, 55%)", "hsl(345, 45%, 45%)",
];

const glassTooltip = {
  background: "var(--glass-bg-strong)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--glass-border)",
  borderRadius: "0.75rem",
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const glassTooltipText = { color: "hsl(var(--foreground))" };

const Dashboard = () => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";

  const [kpis, setKpis] = useState([
    { label: "Pacientes Ativos", value: "—", change: "carregando...", icon: Users, color: "primary" as const, trend: "neutral" },
    { label: "Sessões Hoje", value: "—", change: "", icon: Calendar, color: "info" as const, trend: "neutral" },
    { label: "Insumos Críticos", value: "—", change: "", icon: Package, color: "gold" as const, trend: "neutral" },
    { label: "Consultas Semana", value: "—", change: "", icon: FileCheck, color: "success" as const, trend: "up" },
  ]);

  const [consultasPorStatus, setConsultasPorStatus] = useState<{name: string; value: number; color: string}[]>([]);
  const [sessionsWeekly, setSessionsWeekly] = useState<{day: string; sessoes: number}[]>([]);
  const [topProcedures, setTopProcedures] = useState<{name: string; count: number}[]>([]);
  const [nextAppointments, setNextAppointments] = useState<{time: string; patient: string; proc: string; status: string}[]>([]);
  const [criticalSupplies, setCriticalSupplies] = useState<{name: string; lot: string; expiry: string; daysLeft: number}[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const today = now.toISOString().split("T")[0];
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 5);

      const [pacRes, todayRes, weekRes, insumoRes] = await Promise.all([
        supabase.from("paciente").select("id", { count: "exact" }).eq("status", "ativo"),
        supabase.from("agendamento").select("*").eq("data", today),
        supabase.from("agendamento").select("*, paciente:paciente_id(nome)").gte("data", weekStart.toISOString().split("T")[0]).lte("data", weekEnd.toISOString().split("T")[0]),
        supabase.from("insumo").select("*"),
      ]);

      const pacCount = pacRes.count || 0;
      const todayAg = todayRes.data || [];
      const weekAg = weekRes.data || [];
      const insumos = insumoRes.data || [];

      const todayDone = todayAg.filter((a: any) => a.status === "realizado").length;
      const criticalCount = insumos.filter((i: any) => {
        const d = Math.ceil((new Date(i.validade).getTime() - now.getTime()) / 86400000);
        return d <= 15;
      }).length;
      const weekConfirmed = weekAg.filter((a: any) => a.status === "confirmado").length;

      setKpis([
        { label: "Pacientes Ativos", value: String(pacCount), change: "", icon: Users, color: "primary", trend: "up" },
        { label: "Sessões Hoje", value: String(todayAg.length), change: `${todayDone} concluídas`, icon: Calendar, color: "info", trend: "neutral" },
        { label: "Insumos Críticos", value: String(criticalCount), change: "", icon: Package, color: "gold", trend: "neutral" },
        { label: "Consultas Semana", value: String(weekAg.length), change: `${weekConfirmed} confirmadas`, icon: FileCheck, color: "success", trend: "up" },
      ]);

      // Consultas por status
      const confirmed = weekAg.filter((a: any) => a.status === "confirmado").length;
      const pending = weekAg.filter((a: any) => a.status === "agendado").length;
      const cancelled = weekAg.filter((a: any) => a.status === "cancelado").length;
      setConsultasPorStatus([
        { name: "Confirmadas", value: confirmed, color: "hsl(160, 84%, 39%)" },
        { name: "Aguardando", value: pending, color: "hsl(40, 60%, 55%)" },
        { name: "Canceladas", value: cancelled, color: "hsl(345, 45%, 45%)" },
      ]);

      // Sessions weekly
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const dayCounts: Record<number, number> = {};
      weekAg.forEach((a: any) => {
        const d = new Date(a.data + "T00:00:00").getDay();
        dayCounts[d] = (dayCounts[d] || 0) + 1;
      });
      setSessionsWeekly([1, 2, 3, 4, 5, 6].map((d) => ({ day: days[d], sessoes: dayCounts[d] || 0 })));

      // Top procedures
      const procCounts: Record<string, number> = {};
      weekAg.forEach((a: any) => { procCounts[a.procedimento] = (procCounts[a.procedimento] || 0) + 1; });
      const sorted = Object.entries(procCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      setTopProcedures(sorted.map(([name, count]) => ({ name: (procedimentoConsultaLabels as any)[name] || name, count })));

      // Next appointments (today, future times)
      const futureToday = todayAg
        .filter((a: any) => a.status !== "cancelado")
        .sort((a: any, b: any) => a.horario.localeCompare(b.horario))
        .slice(0, 5);

      if (futureToday.length > 0) {
        const pacIds = [...new Set(futureToday.map((a: any) => a.paciente_id))];
        const { data: pacs } = await supabase.from("paciente").select("id, nome").in("id", pacIds);
        const pacMap = Object.fromEntries((pacs || []).map((p: any) => [p.id, p.nome]));
        setNextAppointments(futureToday.map((a: any) => ({
          time: a.horario.slice(0, 5),
          patient: pacMap[a.paciente_id] || "—",
          proc: (procedimentoConsultaLabels as any)[a.procedimento] || a.procedimento,
          status: a.status,
        })));
      }

      // Critical supplies
      const critical = insumos
        .map((i: any) => ({
          name: i.nome, lot: i.lote,
          expiry: new Date(i.validade).toLocaleDateString("pt-BR"),
          daysLeft: Math.ceil((new Date(i.validade).getTime() - now.getTime()) / 86400000),
        }))
        .filter((i) => i.daysLeft <= 15)
        .sort((a, b) => a.daysLeft - b.daysLeft);
      setCriticalSupplies(critical);
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{greeting}, Dra. Damski</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-success/10 text-success border-success/20 text-[11px]">
            <Activity className="w-3 h-3 mr-1" /> Clínica aberta
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {kpis.map((kpi, i) => {
          const colors = colorMap[kpi.color];
          return (
            <motion.div key={kpi.label} {...fadeUp(i * 0.08)}>
              <LiquidGlassCard className="p-3 sm:p-5" draggable={false}>
                <div className="flex items-start justify-between gap-1">
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <p className="text-[10px] sm:text-[13px] text-muted-foreground font-medium truncate">{kpi.label}</p>
                    <p className="text-lg sm:text-2xl font-display font-bold text-foreground">{kpi.value}</p>
                    <p className={cn("text-[9px] sm:text-xs font-medium truncate", kpi.trend === "up" ? "text-success" : "text-muted-foreground")}>
                      {kpi.change}
                    </p>
                  </div>
                  <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0", colors.bg)}>
                    <kpi.icon className={cn("w-3.5 h-3.5 sm:w-5 sm:h-5", colors.text)} />
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
        <motion.div {...scaleIn(0.35)} className="lg:col-span-2">
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Consultas da Semana</h2>
              </div>
              <Badge variant="outline" className="text-[10px]">{consultasPorStatus.reduce((s, c) => s + c.value, 0)} total</Badge>
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={consultasPorStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={28} strokeWidth={2} stroke="rgba(255,255,255,0.1)">
                    {consultasPorStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [`${v}`, name]} contentStyle={glassTooltip} labelStyle={glassTooltipText} itemStyle={glassTooltipText} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                {consultasPorStatus.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground">{s.name}: <span className="font-semibold text-foreground">{s.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div {...scaleIn(0.45)} className="lg:col-span-3">
          <LiquidGlassCard className="overflow-hidden" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Agenda</h2>
              </div>
              <Link to="/agendamentos" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Ver completa <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <iframe
              src="https://calendar.google.com/calendar/embed?src=brunolealcavalcante%40gmail.com&ctz=America%2FSao_Paulo"
              className="w-full border-0 dark:invert dark:hue-rotate-180"
              height="240"
              scrolling="no"
              title="Google Calendar"
            />
          </LiquidGlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <motion.div {...fadeUp(0.5)}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/10">
              <Clock className="w-4 h-4 text-info" />
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">Sessões da Semana</h2>
            </div>
            <div className="p-3 sm:p-4 flex-1">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={sessionsWeekly} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={glassTooltip} labelStyle={glassTooltipText} itemStyle={glassTooltipText} formatter={(v: number) => [`${v}`, "Sessões"]} />
                  <Bar dataKey="sessoes" radius={[6, 6, 0, 0]} barSize={22}>
                    {sessionsWeekly.map((entry, i) => (
                      <Cell key={i} fill={entry.sessoes === Math.max(...sessionsWeekly.map(s => s.sessoes)) ? "hsl(239, 84%, 67%)" : "hsl(239, 84%, 67%, 0.35)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div {...fadeUp(0.6)}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/10">
              <Star className="w-4 h-4 text-[hsl(var(--gold))]" />
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">Top Procedimentos</h2>
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col items-center justify-center">
              {topProcedures.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={topProcedures} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25} strokeWidth={2} stroke="rgba(255,255,255,0.1)">
                        {topProcedures.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number, name: string) => [`${v}x`, name]} contentStyle={glassTooltip} labelStyle={glassTooltipText} itemStyle={glassTooltipText} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                    {topProcedures.map((p, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Sem dados esta semana</p>
              )}
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div {...fadeUp(0.7)} className="sm:col-span-2 lg:col-span-1">
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-primary" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Próximos Atendimentos</h2>
              </div>
              <Badge variant="outline" className="text-[10px]">{nextAppointments.length}</Badge>
            </div>
            <div className="divide-y divide-white/5 flex-1 overflow-y-auto max-h-[220px]">
              {nextAppointments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum atendimento hoje</p>
              )}
              {nextAppointments.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 sm:px-5 py-2.5">
                  <span className="text-xs font-mono font-semibold text-primary w-10 shrink-0">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.patient}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.proc}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", a.status === "confirmado" ? "text-success border-success/30" : "text-warning border-warning/30")}>
                    {a.status === "confirmado" ? "✓" : "⏳"}
                  </Badge>
                </div>
              ))}
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>

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
              {criticalSupplies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum insumo crítico</p>
              )}
              {criticalSupplies.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", s.daysLeft <= 0 ? "bg-destructive" : s.daysLeft <= 5 ? "bg-warning" : "bg-success")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">Lote {s.lot} · Venc. {s.expiry}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", s.daysLeft <= 0 ? "text-destructive border-destructive/30" : "text-warning border-warning/30")}>
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
                <h2 className="text-sm font-semibold text-foreground">Receita da Semana</h2>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-2xl font-bold text-foreground">
                R$ {(() => {
                  // Will be computed from state
                  return "—";
                })()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Baseado nos agendamentos realizados</p>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
