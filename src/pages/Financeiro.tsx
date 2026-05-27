import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Receipt, CalendarCheck, CheckCircle2,
  UserCheck, ClipboardList, Download, Plus,
} from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { despesaService } from "@/services/despesaService";
import { procedimentoConsultaLabels, formaPagamentoLabels } from "@/types";

const pagamentoColors = ["hsl(160 84% 39%)", "hsl(239 84% 67%)", "hsl(38 92% 50%)", "hsl(0 72% 51%)", "hsl(280 60% 55%)"];
const procedimentoColors = [
  "hsl(239 84% 67%)", "hsl(160 84% 39%)", "hsl(38 92% 50%)", "hsl(0 72% 51%)",
  "hsl(280 60% 55%)", "hsl(199 89% 48%)", "hsl(340 82% 60%)", "hsl(48 96% 53%)",
  "hsl(173 80% 40%)", "hsl(262 83% 58%)", "hsl(15 86% 55%)", "hsl(120 50% 45%)",
];

const faturamentoConfig: ChartConfig = {
  receita: { label: "Receita", color: "hsl(var(--primary))" },
  despesas: { label: "Despesas", color: "hsl(var(--destructive))" },
};
const procedimentoConfig: ChartConfig = { valor: { label: "Valor", color: "hsl(var(--primary))" } };

const Relatorios = () => {
  const [periodo, setPeriodo] = useState("mensal");
  const [despesaOpen, setDespesaOpen] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState({ descricao: "", categoria: "", fornecedor: "", valor: "", formaPagamento: "", vencimento: "", observacoes: "" });
  const [loading, setLoading] = useState(true);

  // Visão Geral
  const [totalConsultas, setTotalConsultas] = useState(0);
  const [taxaConfirmacao, setTaxaConfirmacao] = useState(0);
  const [taxaComparecimento, setTaxaComparecimento] = useState(0);
  const [procStatus, setProcStatus] = useState<{ status: string; valor: number }[]>([]);
  const [procPorTipo, setProcPorTipo] = useState<{ procedimento: string; valor: number }[]>([]);

  // Financeiro
  const [receitaTotal, setReceitaTotal] = useState(0);
  const [despesaTotal, setDespesaTotal] = useState(0);
  const [faturamentoMensal, setFaturamentoMensal] = useState<{ mes: string; receita: number; despesas: number }[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<{ forma: string; valor: number; porcentagem: number; qtd: number }[]>([]);
  const [entradas, setEntradas] = useState<any[]>([]);
  const [saidas, setSaidas] = useState<any[]>([]);
  const [pacientesAtendidos, setPacientesAtendidos] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [agRes, despRes, pacRes] = await Promise.all([
          supabase.from("agendamento").select("*"),
          supabase.from("despesa").select("*"),
          supabase.from("paciente").select("id, nome"),
        ]);

        const agendamentos = agRes.data || [];
        const despesas = despRes.data || [];
        const pacientes = pacRes.data || [];
        const pacMap = Object.fromEntries(pacientes.map((p: any) => [p.id, p.nome]));

        // ============ Visão Geral ============
        const total = agendamentos.length;
        const confirmadosOuRealizados = agendamentos.filter((a: any) => a.status === "confirmado" || a.status === "realizado").length;
        const realizados = agendamentos.filter((a: any) => a.status === "realizado");
        const cancelados = agendamentos.filter((a: any) => a.status === "cancelado").length;
        const baseComparecimento = realizados.length + cancelados;

        setTotalConsultas(total);
        setTaxaConfirmacao(total > 0 ? Math.round((confirmadosOuRealizados / total) * 100) : 0);
        setTaxaComparecimento(baseComparecimento > 0 ? Math.round((realizados.length / baseComparecimento) * 100) : 0);

        // Procedimentos por tipo (pendentes + concluídos, excluindo cancelados)
        const ativosParaProc = agendamentos.filter((a: any) => a.status !== "cancelado");
        const pendentes = agendamentos.filter((a: any) => a.status === "agendado" || a.status === "confirmado").length;
        const concluidos = realizados.length;
        setProcStatus([
          { status: "Pendentes", valor: pendentes },
          { status: "Concluídos", valor: concluidos },
        ]);

        const tipoTotals: Record<string, number> = {};
        ativosParaProc.forEach((a: any) => {
          const label = (procedimentoConsultaLabels as any)[a.procedimento] || a.procedimento;
          tipoTotals[label] = (tipoTotals[label] || 0) + 1;
        });
        setProcPorTipo(
          Object.entries(tipoTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([procedimento, valor]) => ({ procedimento, valor })),
        );

        // ============ Financeiro ============
        const totalReceita = realizados.reduce((s: number, a: any) => s + Number(a.valor), 0);
        const totalDespesa = despesas.reduce((s: number, d: any) => s + Number(d.valor), 0);
        setReceitaTotal(totalReceita);
        setDespesaTotal(totalDespesa);

        const pacAtend = new Set(realizados.map((a: any) => a.paciente_id)).size;
        setPacientesAtendidos(pacAtend);

        // Monthly chart
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const monthlyData: Record<string, { receita: number; despesas: number; idx: number }> = {};
        realizados.forEach((a: any) => {
          const d = new Date(a.data + "T00:00:00");
          const m = months[d.getMonth()];
          if (!monthlyData[m]) monthlyData[m] = { receita: 0, despesas: 0, idx: d.getMonth() };
          monthlyData[m].receita += Number(a.valor);
        });
        despesas.forEach((d: any) => {
          const dt = new Date(d.vencimento + "T00:00:00");
          const m = months[dt.getMonth()];
          if (!monthlyData[m]) monthlyData[m] = { receita: 0, despesas: 0, idx: dt.getMonth() };
          monthlyData[m].despesas += Number(d.valor);
        });
        const chartData = Object.entries(monthlyData)
          .sort((a, b) => a[1].idx - b[1].idx)
          .map(([mes, data]) => ({ mes, receita: data.receita, despesas: data.despesas }));
        setFaturamentoMensal(chartData);

        // Formas de pagamento (entradas)
        const payTotals: Record<string, { valor: number; qtd: number }> = {};
        realizados.forEach((a: any) => {
          const label = (formaPagamentoLabels as any)[a.forma_pagamento] || a.forma_pagamento;
          if (!payTotals[label]) payTotals[label] = { valor: 0, qtd: 0 };
          payTotals[label].valor += Number(a.valor);
          payTotals[label].qtd += 1;
        });
        const payArr = Object.entries(payTotals).sort((a, b) => b[1].valor - a[1].valor);
        const payTotal = payArr.reduce((s, [, v]) => s + v.valor, 0);
        setFormasPagamento(payArr.map(([forma, v]) => ({
          forma, valor: v.valor, qtd: v.qtd, porcentagem: payTotal > 0 ? Math.round((v.valor / payTotal) * 100) : 0,
        })));

        // Entradas
        const ent = realizados
          .sort((a: any, b: any) => b.data.localeCompare(a.data))
          .map((a: any) => ({
            id: a.id,
            paciente: pacMap[a.paciente_id] || "—",
            procedimento: (procedimentoConsultaLabels as any)[a.procedimento] || a.procedimento,
            valor: Number(a.valor),
            forma: (formaPagamentoLabels as any)[a.forma_pagamento] || a.forma_pagamento,
            data: new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR"),
          }));
        setEntradas(ent);

        // Saídas
        const sai = despesas
          .sort((a: any, b: any) => b.vencimento.localeCompare(a.vencimento))
          .map((d: any) => ({
            id: d.id,
            descricao: d.descricao,
            categoria: d.categoria || "—",
            fornecedor: d.fornecedor || "—",
            valor: Number(d.valor),
            forma: d.forma_pagamento ? ((formaPagamentoLabels as any)[d.forma_pagamento] || d.forma_pagamento) : "—",
            vencimento: new Date(d.vencimento + "T00:00:00").toLocaleDateString("pt-BR"),
            status: d.status,
          }));
        setSaidas(sai);
      } catch (err) {
        console.error("Erro ao carregar relatórios:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const lucroLiquido = receitaTotal - despesaTotal;
  const ticketMedio = pacientesAtendidos > 0 ? Math.round(receitaTotal / pacientesAtendidos) : 0;

  const handleDespesaChange = (field: string, value: string) => setNovaDespesa((prev) => ({ ...prev, [field]: value }));

  const handleSalvarDespesa = async () => {
    if (!novaDespesa.descricao || !novaDespesa.valor || !novaDespesa.vencimento) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    try {
      await despesaService.criar({
        descricao: novaDespesa.descricao,
        categoria: novaDespesa.categoria || undefined,
        fornecedor: novaDespesa.fornecedor || undefined,
        valor: parseFloat(novaDespesa.valor),
        forma_pagamento: novaDespesa.formaPagamento || undefined,
        vencimento: novaDespesa.vencimento,
        observacoes: novaDespesa.observacoes || undefined,
        status: "pendente",
      });
      toast.success("Despesa cadastrada com sucesso!");
      setNovaDespesa({ descricao: "", categoria: "", fornecedor: "", valor: "", formaPagamento: "", vencimento: "", observacoes: "" });
      setDespesaOpen(false);
      window.location.reload();
    } catch {
      toast.error("Erro ao salvar despesa.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">Insights operacionais e financeiros da clínica</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /><span className="hidden sm:inline">Exportar</span></Button>
          <Dialog open={despesaOpen} onOpenChange={setDespesaOpen}>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Despesa</DialogTitle>
                <DialogDescription>Cadastre uma nova despesa do consultório.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Descrição *</Label><Input placeholder="Ex: Aluguel, Material..." value={novaDespesa.descricao} onChange={(e) => handleDespesaChange("descricao", e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={novaDespesa.categoria} onValueChange={(v) => handleDespesaChange("categoria", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aluguel">Aluguel</SelectItem>
                        <SelectItem value="material">Material Odontológico</SelectItem>
                        <SelectItem value="folha">Folha de Pagamento</SelectItem>
                        <SelectItem value="utilidades">Utilidades</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Fornecedor</Label><Input placeholder="Nome do fornecedor" value={novaDespesa.fornecedor} onChange={(e) => handleDespesaChange("fornecedor", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Valor (R$) *</Label><Input type="number" placeholder="0,00" value={novaDespesa.valor} onChange={(e) => handleDespesaChange("valor", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <Select value={novaDespesa.formaPagamento} onValueChange={(v) => handleDespesaChange("formaPagamento", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="debito">Cartão de Débito</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Vencimento *</Label><Input type="date" value={novaDespesa.vencimento} onChange={(e) => handleDespesaChange("vencimento", e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Observações</Label><Textarea rows={3} value={novaDespesa.observacoes} onChange={(e) => handleDespesaChange("observacoes", e.target.value)} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDespesaOpen(false)}>Cancelar</Button>
                <Button onClick={handleSalvarDespesa}>Salvar Despesa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="visao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visao">Visão Geral</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        {/* ========== VISÃO GERAL ========== */}
        <TabsContent value="visao" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <LiquidGlassCard draggable={false} className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Consultas</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{totalConsultas}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Agendadas</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center"><CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /></div>
              </div>
            </LiquidGlassCard>
            <LiquidGlassCard draggable={false} className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Taxa de Confirmação</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{taxaConfirmacao}%</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Consultas confirmadas</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" /></div>
              </div>
            </LiquidGlassCard>
            <LiquidGlassCard draggable={false} className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Comparecimento</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{taxaComparecimento}%</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Taxa de presença</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center"><UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /></div>
              </div>
            </LiquidGlassCard>
            <LiquidGlassCard draggable={false} className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Procedimentos</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{procStatus.reduce((s, p) => s + p.valor, 0)}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Pendentes + Concluídos</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-warning/10 flex items-center justify-center"><ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-warning" /></div>
              </div>
            </LiquidGlassCard>
          </div>

          <LiquidGlassCard className="overflow-hidden" draggable={false}>
            <div className="p-5 pb-2">
              <h3 className="text-base font-semibold text-foreground">Procedimentos por Tipo</h3>
              <p className="text-sm text-muted-foreground">Distribuição dos procedimentos da clínica (pendentes + concluídos)</p>
            </div>
            <div className="px-5 pb-5">
              {procPorTipo.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                  Nenhum procedimento registrado.
                </div>
              ) : (
                <ChartContainer config={procedimentoConfig} className="h-[320px] w-full">
                  <PieChart>
                    <Pie data={procPorTipo} dataKey="valor" nameKey="procedimento" cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} label={(e: any) => `${e.procedimento}: ${e.valor}`}>
                      {procPorTipo.map((_, index) => <Cell key={index} fill={procedimentoColors[index % procedimentoColors.length]} />)}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent nameKey="procedimento" />} />
                  </PieChart>
                </ChartContainer>
              )}
            </div>
          </LiquidGlassCard>
        </TabsContent>


        {/* ========== FINANCEIRO ========== */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <LiquidGlassCard draggable={false} className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Receita Total</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">R$ {receitaTotal.toLocaleString("pt-BR")}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center"><DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /></div>
              </div>
            </LiquidGlassCard>
            <LiquidGlassCard draggable={false} className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Despesas</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">R$ {despesaTotal.toLocaleString("pt-BR")}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" /></div>
              </div>
            </LiquidGlassCard>
            <LiquidGlassCard draggable={false} className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Lucro Líquido</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">R$ {lucroLiquido.toLocaleString("pt-BR")}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-success/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" /></div>
              </div>
            </LiquidGlassCard>
            <LiquidGlassCard draggable={false} className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Ticket Médio</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">R$ {ticketMedio.toLocaleString("pt-BR")}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Por paciente</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /></div>
              </div>
            </LiquidGlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <LiquidGlassCard className="lg:col-span-2 overflow-hidden" draggable={false}>
              <div className="p-5 pb-2">
                <h3 className="text-base font-semibold text-foreground">Receita vs Despesas</h3>
                <p className="text-sm text-muted-foreground">Por mês</p>
              </div>
              <div className="px-5 pb-5">
                <ChartContainer config={faturamentoConfig} className="h-[300px] w-full">
                  <AreaChart data={faturamentoMensal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fillDespesas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="mes" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
                    <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" fill="url(#fillReceita)" strokeWidth={2} />
                    <Area type="monotone" dataKey="despesas" stroke="hsl(var(--destructive))" fill="url(#fillDespesas)" strokeWidth={2} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="overflow-hidden" draggable={false}>
              <div className="p-5 pb-2">
                <h3 className="text-base font-semibold text-foreground">Formas de Pagamento</h3>
                <p className="text-sm text-muted-foreground">Distribuição por método</p>
              </div>
              <div className="px-5 pb-5">
                <ChartContainer config={procedimentoConfig} className="h-[220px] w-full">
                  <PieChart>
                    <Pie data={formasPagamento} dataKey="valor" nameKey="forma" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {formasPagamento.map((_, index) => <Cell key={index} fill={pagamentoColors[index % pagamentoColors.length]} />)}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2 mt-2">
                  {formasPagamento.slice(0, 5).map((item, i) => (
                    <div key={item.forma} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: pagamentoColors[i % pagamentoColors.length] }} />
                        <span className="text-muted-foreground">{item.forma}</span>
                      </div>
                      <span className="font-medium text-foreground">{item.porcentagem}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          <LiquidGlassCard className="overflow-hidden" draggable={false}>
            <div className="p-5 pb-2">
              <h3 className="text-base font-semibold text-foreground">Detalhamento de Entradas</h3>
              <p className="text-sm text-muted-foreground">Receitas por forma de pagamento</p>
            </div>
            <div className="px-5 pb-5 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Qtd. Transações</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>% do Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formasPagamento.map((f) => (
                    <TableRow key={f.forma}>
                      <TableCell className="font-medium">{f.forma}</TableCell>
                      <TableCell className="text-muted-foreground">{f.qtd}</TableCell>
                      <TableCell>R$ {f.valor.toLocaleString("pt-BR")}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[11px]">{f.porcentagem}%</Badge></TableCell>
                    </TableRow>
                  ))}
                  {formasPagamento.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sem entradas registradas</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="overflow-hidden" draggable={false}>
            <div className="p-5 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Histórico de Saídas</h3>
                <p className="text-sm text-muted-foreground">Despesas registradas</p>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setDespesaOpen(true)}><Plus className="w-4 h-4" /><span className="hidden sm:inline">Adicionar</span> Despesa</Button>
            </div>
            <div className="px-5 pb-5 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                    <TableHead className="hidden md:table-cell">Fornecedor</TableHead>
                    <TableHead className="hidden md:table-cell">Forma</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saidas.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.descricao}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{s.categoria}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{s.fornecedor}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{s.forma}</TableCell>
                      <TableCell className="text-muted-foreground">{s.vencimento}</TableCell>
                      <TableCell>R$ {s.valor.toLocaleString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "pago" ? "default" : s.status === "atrasado" ? "destructive" : "secondary"} className="text-[11px] capitalize">{s.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {saidas.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Sem despesas registradas</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </LiquidGlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
