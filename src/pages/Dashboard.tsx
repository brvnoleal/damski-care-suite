import { Link } from "react-router-dom";
import {
  Users, Calendar, Package, FileCheck, DollarSign, TrendingUp,
  AlertTriangle, ArrowUpRight,
  ChevronRight, Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* ───────── Mock Data ───────── */

const kpis = [
  { label: "Pacientes Ativos", value: "148", change: "+12", icon: Users, color: "primary" as const },
  { label: "Sessões Hoje", value: "8", change: "3 concluídas", icon: Calendar, color: "info" as const },
  { label: "Insumos Críticos", value: "4", change: "1 vencido", icon: Package, color: "warning" as const },
  { label: "Taxa de Retorno", value: "82%", change: "+5%", icon: TrendingUp, color: "gold" as const },
];

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20" },
  info: { bg: "bg-info/10", text: "text-info", ring: "ring-info/20" },
  success: { bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  gold: { bg: "bg-[hsl(var(--gold))]/10", text: "text-[hsl(var(--gold))]", ring: "ring-[hsl(var(--gold))]/20" },
};


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



/* ───────── Component ───────── */

const Dashboard = () => {
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const colors = colorMap[kpi.color];
          return (
            <div
              key={kpi.label}
              className="rounded-2xl glass glass-hover p-5"
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

      {/* Weekly Calendar */}
      <WeeklyCalendar />

      {/* Bottom Row: 3 panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Procedimentos Populares */}
        <div className="rounded-2xl glass glass-hover overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--glass-border)]">
            <Star className="w-4 h-4 text-[hsl(var(--gold))]" />
            <h2 className="text-sm font-semibold text-foreground">Top Procedimentos</h2>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProcedures} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={95}
                  tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}x`, "Sessões"]}
                  contentStyle={{
                    background: "var(--glass-bg-strong)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                  {topProcedures.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insumos Críticos */}
        <div className="rounded-2xl glass glass-hover overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]">
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
        <div className="rounded-2xl glass glass-hover overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]">
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
