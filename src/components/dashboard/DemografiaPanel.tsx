/**
 * Painel de Demografia dos Pacientes — exibido no Início.
 * Mostra distribuição por sexo, faixa etária e top profissões.
 */
import { useEffect, useMemo, useState } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";
import { pacienteService } from "@/services/pacienteService";
import type { Paciente } from "@/types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const SEXO_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--muted-foreground))",
];

const DemografiaPanel = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await pacienteService.listar();
        setPacientes(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const demografia = useMemo(() => {
    const base = pacientes;
    const total = base.length;
    const calcIdade = (iso?: string) => {
      if (!iso) return null;
      const dt = new Date(iso + "T00:00:00");
      if (isNaN(dt.getTime())) return null;
      const now = new Date();
      let age = now.getFullYear() - dt.getFullYear();
      const mo = now.getMonth() - dt.getMonth();
      if (mo < 0 || (mo === 0 && now.getDate() < dt.getDate())) age--;
      return age;
    };
    const sexoMap: Record<string, number> = {};
    const faixaMap: Record<string, number> = { "0-17": 0, "18-29": 0, "30-44": 0, "45-59": 0, "60+": 0, "—": 0 };
    const profMap: Record<string, number> = {};
    let somaIdade = 0;
    let countIdade = 0;
    base.forEach((p) => {
      const s = (p.sexo || "Não informado").trim() || "Não informado";
      sexoMap[s] = (sexoMap[s] || 0) + 1;
      const idade = calcIdade(p.data_nascimento);
      if (idade != null) {
        somaIdade += idade;
        countIdade++;
        const f = idade < 18 ? "0-17" : idade < 30 ? "18-29" : idade < 45 ? "30-44" : idade < 60 ? "45-59" : "60+";
        faixaMap[f]++;
      } else {
        faixaMap["—"]++;
      }
      const pr = (p.profissao || "Não informada").trim() || "Não informada";
      profMap[pr] = (profMap[pr] || 0) + 1;
    });
    const topProfissoes = Object.entries(profMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const idadeMedia = countIdade > 0 ? Math.round(somaIdade / countIdade) : 0;
    const sexoChart = Object.entries(sexoMap).map(([name, value]) => ({ name, value }));
    const faixaChart = Object.entries(faixaMap).map(([name, value]) => ({ name, value }));
    const profChart = topProfissoes.map(([name, value]) => ({ name, value }));
    return { total, sexoMap, idadeMedia, sexoChart, faixaChart, profChart };
  }, [pacientes]);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Demografia dos Pacientes</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <LiquidGlassCard className="p-5" draggable={false}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Por sexo</h3>
            {demografia.total === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados.</p>
            ) : (
              <>
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={demografia.sexoChart}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {demografia.sexoChart.map((_, i) => (
                          <Cell key={i} fill={SEXO_COLORS[i % SEXO_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number, n: string) => [`${v} pacientes`, n]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 mt-3">
                  {Object.entries(demografia.sexoMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => {
                      const pct = demografia.total > 0 ? Math.round((v / demografia.total) * 100) : 0;
                      return (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-foreground">{k}</span>
                          <span className="text-muted-foreground">
                            {v} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </LiquidGlassCard>

          <LiquidGlassCard className="p-5" draggable={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Por faixa etária</h3>
              <Badge variant="outline">Média: {demografia.idadeMedia} anos</Badge>
            </div>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer>
                <BarChart data={demografia.faixaChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => [`${v} pacientes`, "Quantidade"]} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="p-5" draggable={false}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Top profissões</h3>
            {demografia.profChart.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados.</p>
            ) : (
              <div style={{ width: "100%", height: Math.max(180, demografia.profChart.length * 26) }}>
                <ResponsiveContainer>
                  <BarChart
                    data={demografia.profChart}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${v} pacientes`, "Quantidade"]} />
                    <Bar dataKey="value" fill="hsl(var(--success))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </LiquidGlassCard>
        </div>
      )}
    </section>
  );
};

export default DemografiaPanel;
