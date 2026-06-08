import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, AlertTriangle, ChevronRight, Star, Activity,
  DollarSign, UserPlus, CalendarDays, CreditCard, Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell,
  XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { FadeIn } from "@/components/FadeIn";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { supabase } from "@/integrations/supabase/client";
import { procedimentoConsultaLabels } from "@/types";

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  info: { bg: "bg-info/10", text: "text-info" },
  success: { bg: "bg-success/10", text: "text-success" },
  warning: { bg: "bg-warning/10", text: "text-warning" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive" },
} as const;

const CHART_COLORS = [
  "hsl(239, 84%, 67%)", "hsl(217, 91%, 60%)", "hsl(160, 84%, 39%)",
  "hsl(40, 60%, 55%)", "hsl(345, 45%, 45%)",
];

const glassTooltip = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  fontSize: 12,
  color: "hsl(var(--foreground))",
  boxShadow: "0 4px 12px -2px rgba(6, 20, 27, 0.08)",
};
const glassTooltipText = { color: "hsl(var(--foreground))" };

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlFull = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type KpiColor = keyof typeof colorMap;
type Kpi = { label: string; value: string; change: string; icon: any; color: KpiColor };

const Dashboard = () => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const loadName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("nome").eq("id", user.id).maybeSingle();
      const nome = profile?.nome?.trim() || (user.user_metadata as any)?.nome || (user.user_metadata as any)?.full_name || user.email?.split("@")[0] || "";
      const cleanNome = nome.replace(/^\s*(Dra\.?|Dr\.?|Sr\.?|Sra\.?|Prof\.?|Eng\.?)\s+/i, "");
      setDisplayName(cleanNome.split(" ")[0]);
    };
    loadName();
  }, []);

  const [kpis, setKpis] = useState<Kpi[]>([
    { label: "Consultas Hoje", value: "—", change: "carregando...", icon: Calendar, color: "primary" },
    { label: "Faturamento do Mês", value: "—", change: "", icon: DollarSign, color: "success" },
    { label: "Novos Pacientes do Mês", value: "—", change: "", icon: UserPlus, color: "info" },
    { label: "Insumos Críticos", value: "—", change: "", icon: AlertTriangle, color: "warning" },
    { label: "Agenda do Dia", value: "—", change: "", icon: CalendarDays, color: "primary" },
    { label: "Pagamentos Atrasados", value: "—", change: "", icon: CreditCard, color: "destructive" },
    { label: "Tratamentos em Andamento", value: "—", change: "", icon: Activity, color: "info" },
    { label: "Top Procedimento", value: "—", change: "", icon: Star, color: "success" },
  ]);

  const [agendaHoje, setAgendaHoje] = useState<{ time: string; patient: string; proc: string; status: string }[]>([]);
  const [insumosCriticos, setInsumosCriticos] = useState<{ name: string; lot: string; expiry: string; daysLeft: number }[]>([]);
  const [atrasados, setAtrasados] = useState<{ patient: string; desc: string; valor: number; vencimento: string; dias: number }[]>([]);
  const [tratamentos, setTratamentos] = useState<{ patient: string; proximo: string; proc: string }[]>([]);
  const [topProcs, setTopProcs] = useState<{ name: string; count: number }[]>([]);
  const [faturamentoMensal, setFaturamentoMensal] = useState<{ semana: string; valor: number }[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const today = now.toISOString().split("T")[0];
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

      const [todayRes, insumoRes, monthAgRes, novosPacRes, debitoRes, futureAgRes] = await Promise.all([
        supabase.from("agendamento").select("*").eq("data", today).order("horario"),
        supabase.from("insumo").select("*"),
        supabase.from("agendamento").select("valor,procedimento,status,data").gte("data", monthStart).lte("data", monthEnd),
        supabase.from("paciente").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
        supabase.from("paciente_debito").select("valor,data_vencimento,status,descricao,paciente_id"),
        supabase.from("agendamento").select("paciente_id,data,horario,procedimento,status").gte("data", today).order("data").order("horario"),
      ]);

      const todayAg = todayRes.data || [];
      const insumos = insumoRes.data || [];
      const monthAg = monthAgRes.data || [];
      const debitos = debitoRes.data || [];
      const futureAg = futureAgRes.data || [];

      // Pacientes referenciados
      const pacIds = Array.from(new Set([
        ...todayAg.map((a: any) => a.paciente_id),
        ...debitos.map((d: any) => d.paciente_id),
        ...futureAg.map((a: any) => a.paciente_id),
      ].filter(Boolean)));
      const pacMap: Record<string, string> = {};
      if (pacIds.length) {
        const { data: pacs } = await supabase.from("paciente").select("id,nome").in("id", pacIds);
        (pacs || []).forEach((p: any) => { pacMap[p.id] = p.nome; });
      }

      // --- KPIs ---
      const todayDone = todayAg.filter((a: any) => a.status === "realizado").length;
      const todayRemaining = todayAg.filter((a: any) => !["realizado", "cancelado"].includes(a.status)).length;
      const criticos = insumos.filter((i: any) =>
        Math.ceil((new Date(i.validade).getTime() - now.getTime()) / 86400000) <= 15
      );
      const faturamento = monthAg
        .filter((a: any) => a.status === "realizado")
        .reduce((s: number, a: any) => s + Number(a.valor || 0), 0);
      const realizadasMes = monthAg.filter((a: any) => a.status === "realizado").length;
      const novosPacientes = novosPacRes.count || 0;
      const atrasadosList = debitos
        .filter((d: any) => d.status !== "pago" && new Date(d.data_vencimento) < new Date(today))
        .map((d: any) => ({
          patient: pacMap[d.paciente_id] || "—",
          desc: d.descricao || "Pagamento",
          valor: Number(d.valor || 0),
          vencimento: new Date(d.data_vencimento).toLocaleDateString("pt-BR"),
          dias: Math.ceil((new Date(today).getTime() - new Date(d.data_vencimento).getTime()) / 86400000),
        }))
        .sort((a, b) => b.dias - a.dias);
      const totalAtrasado = atrasadosList.reduce((s, d) => s + d.valor, 0);
      const tratamentosMap: Record<string, { proximo: string; proc: string }> = {};
      futureAg
        .filter((a: any) => ["agendado", "confirmado"].includes(a.status))
        .forEach((a: any) => {
          if (!tratamentosMap[a.paciente_id]) {
            tratamentosMap[a.paciente_id] = {
              proximo: `${new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR")} ${a.horario.slice(0, 5)}`,
              proc: (procedimentoConsultaLabels as any)[a.procedimento] || a.procedimento,
            };
          }
        });
      const tratamentosList = Object.entries(tratamentosMap)
        .map(([pid, info]) => ({ patient: pacMap[pid] || "—", ...info }))
        .slice(0, 8);

      const procCount: Record<string, number> = {};
      monthAg.forEach((a: any) => { procCount[a.procedimento] = (procCount[a.procedimento] || 0) + 1; });
      const sortedProcs = Object.entries(procCount).sort((a, b) => b[1] - a[1]);
      const topProc = sortedProcs[0];
      const topProcLabel = topProc ? ((procedimentoConsultaLabels as any)[topProc[0]] || topProc[0]) : "—";

      // Faturamento por semana do mês
      const semanas: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      monthAg.filter((a: any) => a.status === "realizado").forEach((a: any) => {
        const day = new Date(a.data + "T00:00:00").getDate();
        const w = Math.min(5, Math.ceil(day / 7));
        semanas[w] += Number(a.valor || 0);
      });

      // --- States ---
      setKpis([
        { label: "Consultas Hoje", value: String(todayAg.length), change: `${todayDone} realizadas`, icon: Calendar, color: "primary" },
        { label: "Faturamento do Mês", value: brl(faturamento), change: `${realizadasMes} consulta${realizadasMes !== 1 ? "s" : ""}`, icon: DollarSign, color: "success" },
        { label: "Novos Pacientes do Mês", value: String(novosPacientes), change: now.toLocaleDateString("pt-BR", { month: "long" }), icon: UserPlus, color: "info" },
        { label: "Insumos Críticos", value: String(criticos.length), change: criticos.length ? "≤ 15 dias" : "tudo em dia", icon: AlertTriangle, color: "warning" },
        { label: "Agenda do Dia", value: String(todayRemaining), change: `${todayAg.length} total hoje`, icon: CalendarDays, color: "primary" },
        { label: "Pagamentos Atrasados", value: String(atrasadosList.length), change: totalAtrasado ? brl(totalAtrasado) : "em dia", icon: CreditCard, color: "destructive" },
        { label: "Tratamentos em Andamento", value: String(Object.keys(tratamentosMap).length), change: "pacientes ativos", icon: Activity, color: "info" },
        { label: "Top Procedimento", value: topProcLabel, change: topProc ? `${topProc[1]}x no mês` : "sem dados", icon: Star, color: "success" },
      ]);

      setAgendaHoje(todayAg.map((a: any) => ({
        time: a.horario.slice(0, 5),
        patient: pacMap[a.paciente_id] || "—",
        proc: (procedimentoConsultaLabels as any)[a.procedimento] || a.procedimento,
        status: a.status,
      })));

      setInsumosCriticos(
        criticos
          .map((i: any) => ({
            name: i.nome, lot: i.lote,
            expiry: new Date(i.validade).toLocaleDateString("pt-BR"),
            daysLeft: Math.ceil((new Date(i.validade).getTime() - now.getTime()) / 86400000),
          }))
          .sort((a, b) => a.daysLeft - b.daysLeft)
      );

      setAtrasados(atrasadosList);
      setTratamentos(tratamentosList);
      setTopProcs(sortedProcs.slice(0, 5).map(([name, count]) => ({
        name: (procedimentoConsultaLabels as any)[name] || name, count,
      })));
      setFaturamentoMensal(
        Object.entries(semanas).map(([w, v]) => ({ semana: `Sem ${w}`, valor: v }))
      );
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{greeting}, {displayName}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Badge className="bg-success/10 text-success border-success/20 text-[11px]">
          <Activity className="w-3 h-3 mr-1" /> Clínica aberta
        </Badge>
      </div>

      {/* 8 indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {kpis.map((kpi, i) => {
          const colors = colorMap[kpi.color];
          return (
            <FadeIn key={kpi.label} delay={i * 0.05} className="h-full">
              <LiquidGlassCard className="p-3 sm:p-5 h-full" draggable={false}>
                <div className="flex items-start justify-between gap-1 h-full">
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <p className="text-[10px] sm:text-[13px] text-muted-foreground font-medium truncate">{kpi.label}</p>
                    <p className="text-base sm:text-xl font-display font-bold text-foreground truncate">{kpi.value}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground font-medium truncate min-h-[1rem] sm:min-h-[1.25rem]">
                      {kpi.change || "\u00A0"}
                    </p>
                  </div>
                  <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0", colors.bg)}>
                    <kpi.icon className={cn("w-3.5 h-3.5 sm:w-5 sm:h-5", colors.text)} />
                  </div>
                </div>
              </LiquidGlassCard>
            </FadeIn>
          );
        })}
      </div>

      {/* Detalhes em cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Agenda do Dia */}
        <FadeIn delay={0.1}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Agenda do Dia</h2>
              </div>
              <Link to="/agenda" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Ver agenda <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-white/5 flex-1 overflow-y-auto max-h-[300px]">
              {agendaHoje.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma consulta hoje</p>
              )}
              {agendaHoje.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 sm:px-5 py-2.5">
                  <span className="text-xs font-mono font-semibold text-primary w-10 shrink-0">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.patient}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.proc}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] shrink-0 capitalize",
                    a.status === "realizado" ? "text-success border-success/30" :
                    a.status === "confirmado" ? "text-primary border-primary/30" :
                    a.status === "cancelado" ? "text-destructive border-destructive/30" :
                    "text-warning border-warning/30"
                  )}>
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </LiquidGlassCard>
        </FadeIn>

        {/* Pagamentos Atrasados */}
        <FadeIn delay={0.15}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-destructive" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Pagamentos Atrasados</h2>
              </div>
              <Link to="/financeiro" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Financeiro <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-white/5 flex-1 overflow-y-auto max-h-[300px]">
              {atrasados.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum pagamento atrasado</p>
              )}
              {atrasados.map((d, i) => (
                <div key={i} className="flex items-center gap-3 px-4 sm:px-5 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.patient}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{d.desc} · venc. {d.vencimento}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-destructive">{brlFull(d.valor)}</p>
                    <p className="text-[10px] text-muted-foreground">{d.dias}d atraso</p>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlassCard>
        </FadeIn>

        {/* Insumos Críticos */}
        <FadeIn delay={0.2}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Insumos Críticos</h2>
              </div>
              <Link to="/insumos" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-white/5 flex-1 overflow-y-auto max-h-[300px]">
              {insumosCriticos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum insumo crítico</p>
              )}
              {insumosCriticos.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-4 sm:px-5 py-2.5">
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
        </FadeIn>

        {/* Tratamentos em Andamento */}
        <FadeIn delay={0.25}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-info" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Tratamentos em Andamento</h2>
              </div>
              <Link to="/pacientes" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Pacientes <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-white/5 flex-1 overflow-y-auto max-h-[300px]">
              {tratamentos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Sem tratamentos ativos</p>
              )}
              {tratamentos.map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-4 sm:px-5 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.patient}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{t.proc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {t.proximo}
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlassCard>
        </FadeIn>

        {/* Faturamento do Mês */}
        <FadeIn delay={0.3}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-success" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Faturamento do Mês</h2>
              </div>
              <Link to="/financeiro" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Detalhes <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3 sm:p-4 flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={faturamentoMensal} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="semana" tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => brl(Number(v))} />
                  <Tooltip contentStyle={glassTooltip} labelStyle={glassTooltipText} itemStyle={glassTooltipText} formatter={(v: number) => [brlFull(v), "Faturamento"]} />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={32} fill="hsl(160, 84%, 39%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </LiquidGlassCard>
        </FadeIn>

        {/* Top Procedimentos */}
        <FadeIn delay={0.35}>
          <LiquidGlassCard className="overflow-hidden flex flex-col h-full" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-success" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Top Procedimentos</h2>
              </div>
              <Badge variant="outline" className="text-[10px]">no mês</Badge>
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col items-center justify-center">
              {topProcs.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={topProcs} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={32} strokeWidth={2} stroke="rgba(255,255,255,0.1)">
                        {topProcs.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number, name: string) => [`${v}x`, name]} contentStyle={glassTooltip} labelStyle={glassTooltipText} itemStyle={glassTooltipText} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                    {topProcs.map((p, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                        <span className="text-[10px] text-muted-foreground">{p.name} <span className="font-semibold text-foreground">({p.count})</span></span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground py-6">Sem dados neste mês</p>
              )}
            </div>
          </LiquidGlassCard>
        </FadeIn>
      </div>
    </div>
  );
};

export default Dashboard;
