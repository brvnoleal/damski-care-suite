import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Receipt, CalendarCheck, CheckCircle2,
  UserCheck, ClipboardList, Download, Plus, Percent, Users, AlertTriangle,
} from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FadeIn } from "@/components/FadeIn";
import { despesaService } from "@/services/despesaService";
import { procedimentoConsultaLabels, formaPagamentoLabels } from "@/types";
import { exportMultiSheetXlsx, exportToXlsx } from "@/lib/exportXlsx";
import { ExportButton } from "@/components/ExportButton";
import { calcularTaxa, formatBRL } from "@/lib/maquininhaCalc";
import RelatoriosAvancados from "@/components/financeiro/RelatoriosAvancados";
import DemografiaPanel from "@/components/dashboard/DemografiaPanel";
import { PeriodoFilter, filtrarPorPeriodo, type PeriodoValue } from "@/components/financeiro/PeriodoFilter";

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

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  valueColor?: string;
  onExport?: () => void;
}
const KpiCard = ({ label, value, hint, icon: Icon, iconBg = "bg-primary/10", iconColor = "text-primary", valueColor = "text-foreground", onExport }: KpiCardProps) => (
  <LiquidGlassCard draggable={false} className="p-3 sm:p-4 relative">
    {onExport && (
      <button
        type="button"
        onClick={onExport}
        aria-label={`Exportar ${label}`}
        title="Baixar Excel"
        className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
      </button>
    )}
    <div className="flex items-center justify-between gap-2 pr-6">
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{label}</p>
        <p className={`text-sm sm:text-base lg:text-lg font-bold mt-1 truncate ${valueColor}`}>{value}</p>
        {hint && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{hint}</p>}
      </div>
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>
  </LiquidGlassCard>
);

const Relatorios = () => {
  const [periodo, setPeriodo] = useState<PeriodoValue>("365");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
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
  const [taxasTotal, setTaxasTotal] = useState(0);
  const [receitaLiquida, setReceitaLiquida] = useState(0);
  const [despesaTotal, setDespesaTotal] = useState(0);
  const [faturamentoMensal, setFaturamentoMensal] = useState<{ mes: string; receita: number; despesas: number }[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<{ forma: string; valor: number; porcentagem: number; qtd: number }[]>([]);
  const [entradas, setEntradas] = useState<any[]>([]);
  const [saidas, setSaidas] = useState<any[]>([]);
  const [pacientesAtendidos, setPacientesAtendidos] = useState(0);
  const [agendamentosPeriodo, setAgendamentosPeriodo] = useState<any[]>([]);
  const [criticalSupplies, setCriticalSupplies] = useState<{ name: string; lot: string; expiry: string; daysLeft: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [agRes, despRes, pacRes, insumoRes] = await Promise.all([
          supabase.from("agendamento").select("*"),
          supabase.from("despesa").select("*"),
          supabase.from("paciente").select("id, nome"),
          supabase.from("insumo").select("*"),
        ]);

        const nowDt = new Date();
        const critical = (insumoRes.data || [])
          .filter((i: any) => !i.sem_validade && i.validade)
          .map((i: any) => ({
            name: i.nome,
            lot: i.lote,
            expiry: new Date(i.validade).toLocaleDateString("pt-BR"),
            daysLeft: Math.ceil((new Date(i.validade).getTime() - nowDt.getTime()) / 86400000),
          }))
          .filter((i: any) => i.daysLeft >= 0 && i.daysLeft <= 15)
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft);
        setCriticalSupplies(critical);

        const agendamentos = filtrarPorPeriodo(agRes.data || [], "data", periodo, dataInicio, dataFim);
        const despesas = filtrarPorPeriodo(despRes.data || [], "vencimento", periodo, dataInicio, dataFim);
        const pacientes = pacRes.data || [];
        const pacMap = Object.fromEntries(pacientes.map((p: any) => [p.id, p.nome]));
        setAgendamentosPeriodo(agendamentos.map((a: any) => ({
          data: a.data,
          paciente: pacMap[a.paciente_id] || "—",
          procedimento: (procedimentoConsultaLabels as any)[a.procedimento] || a.procedimento,
          status: a.status,
          valor: Number(a.valor) || 0,
          forma_pagamento: (formaPagamentoLabels as any)[a.forma_pagamento] || a.forma_pagamento || "—",
        })));

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

        // Aplica cálculo automático de taxas (PIX/débito/crédito) sobre cada recebimento realizado
        let totalTaxas = 0;
        let totalLiquido = 0;
        const taxaPorReceita: Record<string, { taxa: number; liquido: number; parcelas: number }> = {};
        realizados.forEach((a: any) => {
          const r = calcularTaxa(Number(a.valor) || 0, a.forma_pagamento, Number(a.parcelas) || 1);
          taxaPorReceita[a.id] = { taxa: r.valorTaxa, liquido: r.valorLiquido, parcelas: r.parcelasEfetivas };
          totalTaxas += r.valorTaxa;
          totalLiquido += r.valorLiquido;
        });
        setReceitaTotal(totalReceita);
        setTaxasTotal(totalTaxas);
        setReceitaLiquida(totalLiquido);
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

        // Entradas — descritivo de procedimento + taxa + líquido
        const ent = realizados
          .sort((a: any, b: any) => b.data.localeCompare(a.data))
          .map((a: any) => {
            const t = taxaPorReceita[a.id] || { taxa: 0, liquido: Number(a.valor) || 0, parcelas: 1 };
            return {
              id: a.id,
              paciente: pacMap[a.paciente_id] || "—",
              procedimento: (procedimentoConsultaLabels as any)[a.procedimento] || a.procedimento,
              valor: Number(a.valor),
              forma: (formaPagamentoLabels as any)[a.forma_pagamento] || a.forma_pagamento,
              parcelas: t.parcelas,
              taxa: t.taxa,
              liquido: t.liquido,
              data: new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR"),
            };
          });
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
  }, [periodo, dataInicio, dataFim]);

  const lucroLiquido = receitaLiquida - despesaTotal;
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

  const periodoFilterProps = {
    periodo,
    onPeriodoChange: setPeriodo,
    dataInicio,
    dataFim,
    onDataInicioChange: setDataInicio,
    onDataFimChange: setDataFim,
  };

  const handleExportVisao = () => {
    exportMultiSheetXlsx(
      [
        {
          name: "Resumo",
          rows: [
            { Métrica: "Total de Consultas", Valor: totalConsultas },
            { Métrica: "Taxa de Confirmação (%)", Valor: taxaConfirmacao },
            { Métrica: "Taxa de Comparecimento (%)", Valor: taxaComparecimento },
          ],
        },
        { name: "Procedimentos por Tipo", rows: procPorTipo },
        { name: "Status Procedimentos", rows: procStatus },
      ],
      "relatorio-visao-geral",
    );
    toast.success("Visão geral exportada");
  };

  const handleExportFinanceiro = () => {
    exportMultiSheetXlsx(
      [
        {
          name: "Resumo",
          rows: [
            { Métrica: "Pacientes Atendidos", Valor: pacientesAtendidos },
            { Métrica: "Receita Bruta", Valor: receitaTotal },
            { Métrica: "Taxas de Maquininha", Valor: taxasTotal },
            { Métrica: "Receita Líquida", Valor: receitaLiquida },
            { Métrica: "Despesa Total", Valor: despesaTotal },
            { Métrica: "Lucro (Líquida − Despesas)", Valor: receitaLiquida - despesaTotal },
          ],
        },
        { name: "Faturamento Mensal", rows: faturamentoMensal },
        { name: "Formas Pagamento", rows: formasPagamento },
        { name: "Entradas", rows: entradas },
        { name: "Saidas", rows: saidas },
      ],
      "relatorio-financeiro",
    );
    toast.success("Financeiro exportado");
  };

  // ============ Per-card exports ============
  const exportConsultas = () => {
    exportToXlsx(
      agendamentosPeriodo.map((a) => ({
        Data: a.data,
        Paciente: a.paciente,
        Procedimento: a.procedimento,
        Status: a.status,
        "Forma Pagamento": a.forma_pagamento,
        Valor: a.valor,
      })),
      "card-consultas",
    );
    toast.success("Consultas exportadas");
  };
  const exportTaxaConfirmacao = () => {
    const confirmados = agendamentosPeriodo.filter((a) => a.status === "confirmado" || a.status === "realizado");
    exportToXlsx(
      [
        { Métrica: "Total", Valor: agendamentosPeriodo.length },
        { Métrica: "Confirmados + Realizados", Valor: confirmados.length },
        { Métrica: "Taxa (%)", Valor: taxaConfirmacao },
      ],
      "card-taxa-confirmacao",
    );
    toast.success("Exportado");
  };
  const exportComparecimento = () => {
    const realizados = agendamentosPeriodo.filter((a) => a.status === "realizado");
    const cancelados = agendamentosPeriodo.filter((a) => a.status === "cancelado");
    exportToXlsx(
      [
        { Métrica: "Realizados", Valor: realizados.length },
        { Métrica: "Cancelados", Valor: cancelados.length },
        { Métrica: "Taxa (%)", Valor: taxaComparecimento },
      ],
      "card-comparecimento",
    );
    toast.success("Exportado");
  };
  const exportProcedimentos = () => {
    exportToXlsx(procPorTipo, "card-procedimentos");
    toast.success("Procedimentos exportados");
  };
  const exportReceitaBruta = () => {
    exportToXlsx(
      entradas.map((e) => ({
        Data: e.data, Paciente: e.paciente, Procedimento: e.procedimento,
        Forma: e.forma, Parcelas: e.parcelas, Bruto: e.valor, Taxa: e.taxa, Líquido: e.liquido,
      })),
      "card-receita-bruta",
    );
    toast.success("Receita exportada");
  };
  const exportTaxasMaquininha = () => {
    exportToXlsx(
      entradas.filter((e) => e.taxa > 0).map((e) => ({
        Data: e.data, Paciente: e.paciente, Forma: e.forma, Parcelas: e.parcelas,
        Bruto: e.valor, Taxa: e.taxa, Líquido: e.liquido,
      })),
      "card-taxas-maquininha",
    );
    toast.success("Taxas exportadas");
  };
  const exportDespesas = () => {
    exportToXlsx(
      saidas.map((s) => ({
        Vencimento: s.vencimento, Descrição: s.descricao, Categoria: s.categoria,
        Fornecedor: s.fornecedor, Forma: s.forma, Valor: s.valor, Status: s.status,
      })),
      "card-despesas",
    );
    toast.success("Despesas exportadas");
  };
  const exportLucroLiquido = () => {
    exportToXlsx(
      [
        { Métrica: "Receita Bruta", Valor: receitaTotal },
        { Métrica: "Taxas Maquininha", Valor: taxasTotal },
        { Métrica: "Receita Líquida", Valor: receitaLiquida },
        { Métrica: "Despesa Total", Valor: despesaTotal },
        { Métrica: "Lucro Líquido", Valor: lucroLiquido },
      ],
      "card-lucro-liquido",
    );
    toast.success("Exportado");
  };
  const exportTicketMedio = () => {
    exportToXlsx(
      [
        { Métrica: "Receita Bruta", Valor: receitaTotal },
        { Métrica: "Pacientes Atendidos", Valor: pacientesAtendidos },
        { Métrica: "Ticket Médio", Valor: ticketMedio },
      ],
      "card-ticket-medio",
    );
    toast.success("Exportado");
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">Insights operacionais e financeiros da clínica</p>
        </div>
      </FadeIn>

      <ResponsiveDialog
        open={despesaOpen}
        onOpenChange={setDespesaOpen}
        title="Nova Despesa"
        description="Cadastre uma nova despesa do consultório."
        className="sm:max-w-[520px]"
        footer={
          <>
            <Button variant="outline" onClick={() => setDespesaOpen(false)} className="flex-1 sm:flex-none">Cancelar</Button>
            <Button onClick={handleSalvarDespesa} className="flex-1 sm:flex-none">Salvar Despesa</Button>
          </>
        }
      >
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
            <div className="space-y-2"><Label>Valor (R$) *</Label><CurrencyInput value={novaDespesa.valor} onChange={(n) => handleDespesaChange("valor", n ? String(n) : "")} /></div>
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
      </ResponsiveDialog>

      <Tabs defaultValue="visao" className="space-y-4">
        <div className="flex justify-center">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="visao" className="gap-1.5 text-xs">
              <ClipboardList className="w-3.5 h-3.5" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="pacientes" className="gap-1.5 text-xs">
              <UserCheck className="w-3.5 h-3.5" /> Pacientes
            </TabsTrigger>
            <TabsTrigger value="colaboradores" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" /> Colaboradores
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="gap-1.5 text-xs">
              <DollarSign className="w-3.5 h-3.5" /> Financeiro
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========== VISÃO GERAL ========== */}
        <TabsContent value="visao" className="space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <PeriodoFilter {...periodoFilterProps} />
            <ExportButton onExport={handleExportVisao} label="Exportar visão geral" tooltip="Baixar visão geral (Excel)" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard label="Consultas" value={totalConsultas} hint="Agendadas" icon={CalendarCheck} onExport={exportConsultas} />
            <KpiCard label="Taxa de Confirmação" value={`${taxaConfirmacao}%`} hint="Consultas confirmadas" icon={CheckCircle2} iconBg="bg-success/10" iconColor="text-success" onExport={exportTaxaConfirmacao} />
            <KpiCard label="Comparecimento" value={`${taxaComparecimento}%`} hint="Taxa de presença" icon={UserCheck} onExport={exportComparecimento} />
            <KpiCard label="Procedimentos" value={procStatus.reduce((s, p) => s + p.valor, 0)} hint="Pendentes + Concluídos" icon={ClipboardList} iconBg="bg-warning/10" iconColor="text-warning" onExport={exportProcedimentos} />
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
          <RelatoriosAvancados periodo={periodo} dataInicio={dataInicio} dataFim={dataFim} section="funil" />

          <LiquidGlassCard className="overflow-hidden" draggable={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h2 className="text-sm font-semibold text-foreground">Insumos Críticos</h2>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {criticalSupplies.length} item{criticalSupplies.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
              {criticalSupplies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum insumo crítico</p>
              )}
              {criticalSupplies.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-4 sm:px-5 py-2.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${s.daysLeft <= 0 ? "bg-destructive" : s.daysLeft <= 5 ? "bg-warning" : "bg-success"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">Lote {s.lot} · Venc. {s.expiry}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${s.daysLeft <= 0 ? "text-destructive border-destructive/30" : "text-warning border-warning/30"}`}>
                    {s.daysLeft <= 0 ? "Vencido" : `${s.daysLeft}d`}
                  </Badge>
                </div>
              ))}
            </div>
          </LiquidGlassCard>

        </TabsContent>

        {/* ========== PACIENTES ========== */}
        <TabsContent value="pacientes" className="space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <PeriodoFilter {...periodoFilterProps} />
          </div>
          <DemografiaPanel />
        </TabsContent>

        {/* ========== COLABORADORES ========== */}
        <TabsContent value="colaboradores" className="space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <PeriodoFilter {...periodoFilterProps} />
          </div>
          <RelatoriosAvancados periodo={periodo} dataInicio={dataInicio} dataFim={dataFim} section="holerite" />
        </TabsContent>

        {/* ========== FINANCEIRO ========== */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <PeriodoFilter {...periodoFilterProps} />
            <ExportButton onExport={handleExportFinanceiro} label="Exportar financeiro" tooltip="Baixar financeiro (Excel)" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <KpiCard label="Receita Bruta" value={`R$ ${receitaTotal.toLocaleString("pt-BR")}`} hint={`Líquido: ${formatBRL(receitaLiquida)}`} icon={DollarSign} onExport={exportReceitaBruta} />
            <KpiCard label="Taxas Maquininha" value={`R$ ${taxasTotal.toLocaleString("pt-BR")}`} hint="Descontadas auto." icon={Percent} iconBg="bg-warning/10" iconColor="text-warning" valueColor="text-warning" onExport={exportTaxasMaquininha} />
            <KpiCard label="Despesas" value={`R$ ${despesaTotal.toLocaleString("pt-BR")}`} icon={TrendingDown} iconBg="bg-destructive/10" iconColor="text-destructive" onExport={exportDespesas} />
            <KpiCard label="Lucro Líquido" value={`R$ ${lucroLiquido.toLocaleString("pt-BR")}`} icon={TrendingUp} iconBg="bg-success/10" iconColor="text-success" onExport={exportLucroLiquido} />
            <KpiCard label="Ticket Médio" value={`R$ ${ticketMedio.toLocaleString("pt-BR")}`} hint="Por paciente" icon={Receipt} onExport={exportTicketMedio} />
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
              <h3 className="text-base font-semibold text-foreground">Resumo por Forma de Pagamento</h3>
              <p className="text-sm text-muted-foreground">Distribuição das entradas pagas</p>
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
            <div className="p-5 pb-2">
              <h3 className="text-base font-semibold text-foreground">Detalhamento de Recebimentos</h3>
              <p className="text-sm text-muted-foreground">
                Cada consulta paga com descritivo do procedimento, taxa da maquininha aplicada e valor líquido recebido.
              </p>
            </div>
            <div className="px-5 pb-5 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead className="text-right">Parc.</TableHead>
                    <TableHead className="text-right">Bruto</TableHead>
                    <TableHead className="text-right">Taxa</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entradas.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Sem recebimentos registrados</TableCell></TableRow>
                  )}
                  {entradas.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{e.data}</TableCell>
                      <TableCell className="font-medium">{e.paciente}</TableCell>
                      <TableCell className="text-foreground">{e.procedimento}</TableCell>
                      <TableCell className="text-muted-foreground">{e.forma}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{e.parcelas}x</TableCell>
                      <TableCell className="text-right">{formatBRL(e.valor)}</TableCell>
                      <TableCell className="text-right text-warning">{e.taxa > 0 ? formatBRL(e.taxa) : "—"}</TableCell>
                      <TableCell className="text-right font-semibold text-success">{formatBRL(e.liquido)}</TableCell>
                    </TableRow>
                  ))}
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
          <RelatoriosAvancados periodo={periodo} dataInicio={dataInicio} dataFim={dataFim} section="dre" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
