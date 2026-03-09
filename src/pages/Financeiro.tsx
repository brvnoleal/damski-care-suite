import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt,
  Calendar, Filter, Download, ArrowUpRight, ArrowDownRight, Plus,
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

const pieColors = ["hsl(239 84% 67%)", "hsl(160 84% 39%)", "hsl(38 92% 50%)", "hsl(345 45% 40%)", "hsl(217 91% 60%)", "hsl(280 60% 55%)"];
const pagamentoColors = ["hsl(160 84% 39%)", "hsl(239 84% 67%)", "hsl(38 92% 50%)", "hsl(0 72% 51%)", "hsl(280 60% 55%)"];

const faturamentoConfig: ChartConfig = {
  receita: { label: "Receita", color: "hsl(var(--primary))" },
  despesas: { label: "Despesas", color: "hsl(var(--destructive))" },
};
const procedimentoConfig: ChartConfig = { valor: { label: "Valor", color: "hsl(var(--primary))" } };

const Financeiro = () => {
  const [periodo, setPeriodo] = useState("mensal");
  const [despesaOpen, setDespesaOpen] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState({ descricao: "", categoria: "", fornecedor: "", valor: "", formaPagamento: "", vencimento: "", observacoes: "" });
  const [loading, setLoading] = useState(true);

  // Data from Supabase
  const [receitaTotal, setReceitaTotal] = useState(0);
  const [despesaTotal, setDespesaTotal] = useState(0);
  const [faturamentoMensal, setFaturamentoMensal] = useState<{mes: string; receita: number; despesas: number}[]>([]);
  const [receitaPorProcedimento, setReceitaPorProcedimento] = useState<{procedimento: string; valor: number; porcentagem: number}[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<{forma: string; valor: number; porcentagem: number}[]>([]);
  const [ultimasTransacoes, setUltimasTransacoes] = useState<any[]>([]);
  const [contasAPagar, setContasAPagar] = useState<any[]>([]);

  useEffect(() => {
    const loadFinanceiro = async () => {
      try {
        const [agRes, despRes, pacRes] = await Promise.all([
          supabase.from("agendamento").select("*").in("status", ["realizado", "confirmado", "agendado"]),
          supabase.from("despesa").select("*"),
          supabase.from("paciente").select("id, nome"),
        ]);

        const agendamentos = agRes.data || [];
        const despesas = despRes.data || [];
        const pacientes = pacRes.data || [];
        const pacMap = Object.fromEntries(pacientes.map((p: any) => [p.id, p.nome]));

        // Revenue = sum of valor from realized appointments
        const realizados = agendamentos.filter((a: any) => a.status === "realizado");
        const totalReceita = realizados.reduce((s: number, a: any) => s + Number(a.valor), 0);
        const totalDespesa = despesas.reduce((s: number, d: any) => s + Number(d.valor), 0);
        setReceitaTotal(totalReceita);
        setDespesaTotal(totalDespesa);

        // Monthly chart (last 3 months)
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const monthlyData: Record<string, {receita: number; despesas: number}> = {};
        realizados.forEach((a: any) => {
          const m = months[new Date(a.data + "T00:00:00").getMonth()];
          if (!monthlyData[m]) monthlyData[m] = { receita: 0, despesas: 0 };
          monthlyData[m].receita += Number(a.valor);
        });
        despesas.forEach((d: any) => {
          const m = months[new Date(d.vencimento + "T00:00:00").getMonth()];
          if (!monthlyData[m]) monthlyData[m] = { receita: 0, despesas: 0 };
          monthlyData[m].despesas += Number(d.valor);
        });
        const chartData = Object.entries(monthlyData).map(([mes, data]) => ({ mes, ...data }));
        setFaturamentoMensal(chartData);

        // Revenue by procedure
        const procTotals: Record<string, number> = {};
        realizados.forEach((a: any) => {
          const label = (procedimentoConsultaLabels as any)[a.procedimento] || a.procedimento;
          procTotals[label] = (procTotals[label] || 0) + Number(a.valor);
        });
        const procArr = Object.entries(procTotals).sort((a, b) => b[1] - a[1]);
        const procTotal = procArr.reduce((s, [, v]) => s + v, 0);
        setReceitaPorProcedimento(procArr.map(([procedimento, valor]) => ({
          procedimento, valor, porcentagem: procTotal > 0 ? Math.round((valor / procTotal) * 100) : 0,
        })));

        // Payment methods
        const payTotals: Record<string, number> = {};
        realizados.forEach((a: any) => {
          const label = (formaPagamentoLabels as any)[a.forma_pagamento] || a.forma_pagamento;
          payTotals[label] = (payTotals[label] || 0) + Number(a.valor);
        });
        const payArr = Object.entries(payTotals).sort((a, b) => b[1] - a[1]);
        const payTotal = payArr.reduce((s, [, v]) => s + v, 0);
        setFormasPagamento(payArr.map(([forma, valor]) => ({
          forma, valor, porcentagem: payTotal > 0 ? Math.round((valor / payTotal) * 100) : 0,
        })));

        // Last transactions
        const lastTrans = realizados
          .sort((a: any, b: any) => b.data.localeCompare(a.data))
          .slice(0, 5)
          .map((a: any) => ({
            id: a.id,
            paciente: pacMap[a.paciente_id] || "—",
            procedimento: (procedimentoConsultaLabels as any)[a.procedimento] || a.procedimento,
            valor: Number(a.valor),
            forma: (formaPagamentoLabels as any)[a.forma_pagamento] || a.forma_pagamento,
            data: new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR"),
            status: "pago",
          }));
        setUltimasTransacoes(lastTrans);

        // Bills to pay
        const bills = despesas
          .filter((d: any) => d.status === "pendente")
          .sort((a: any, b: any) => a.vencimento.localeCompare(b.vencimento))
          .slice(0, 5)
          .map((d: any) => ({
            descricao: d.descricao,
            vencimento: new Date(d.vencimento + "T00:00:00").toLocaleDateString("pt-BR"),
            valor: Number(d.valor),
            status: d.status,
          }));
        setContasAPagar(bills);
      } catch (err) {
        console.error("Erro ao carregar financeiro:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFinanceiro();
  }, []);

  const lucroLiquido = receitaTotal - despesaTotal;
  const ticketMedio = ultimasTransacoes.length > 0 ? Math.round(receitaTotal / ultimasTransacoes.length) : 0;

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
      // Reload
      window.location.reload();
    } catch {
      toast.error("Erro ao salvar despesa.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral das finanças da clínica</p>
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
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /><span className="hidden sm:inline">Adicionar</span> Despesa</Button>
            </DialogTrigger>
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
            <h3 className="text-base font-semibold text-foreground">Procedimento</h3>
            <p className="text-sm text-muted-foreground">Distribuição da receita</p>
          </div>
          <div className="px-5 pb-5">
            <ChartContainer config={procedimentoConfig} className="h-[220px] w-full">
              <PieChart>
                <Pie data={receitaPorProcedimento} dataKey="valor" nameKey="procedimento" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {receitaPorProcedimento.map((_, index) => <Cell key={index} fill={pieColors[index % pieColors.length]} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
              </PieChart>
            </ChartContainer>
            <div className="space-y-2 mt-2">
              {receitaPorProcedimento.map((item, i) => (
                <div key={item.procedimento} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                    <span className="text-muted-foreground">{item.procedimento}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.porcentagem}%</span>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <LiquidGlassCard className="overflow-hidden flex flex-col" draggable={false}>
          <div className="p-5 pb-2">
            <h3 className="text-base font-semibold text-foreground">Formas de Pagamento</h3>
            <p className="text-sm text-muted-foreground">Distribuição por método</p>
          </div>
          <div className="px-5 pb-5 flex-1">
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

        <div className="lg:col-span-2 flex flex-col">
          <Tabs defaultValue="transacoes" className="flex flex-col flex-1">
            <TabsList>
              <TabsTrigger value="transacoes">Últimas Transações</TabsTrigger>
              <TabsTrigger value="contas">Contas a Pagar</TabsTrigger>
            </TabsList>
            <TabsContent value="transacoes" className="mt-2 flex-1">
              <LiquidGlassCard className="overflow-hidden h-full" draggable={false}>
                <div className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead className="hidden sm:table-cell">Procedimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="hidden md:table-cell">Forma</TableHead>
                        <TableHead className="hidden md:table-cell">Data</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ultimasTransacoes.map((t: any) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.paciente}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">{t.procedimento}</TableCell>
                          <TableCell>R$ {t.valor.toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{t.forma}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{t.data}</TableCell>
                          <TableCell><Badge variant="default" className="text-[11px]">Pago</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </LiquidGlassCard>
            </TabsContent>
            <TabsContent value="contas" className="mt-2 flex-1">
              <LiquidGlassCard className="overflow-hidden h-full" draggable={false}>
                <div className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contasAPagar.map((c: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{c.descricao}</TableCell>
                          <TableCell className="text-muted-foreground hidden sm:table-cell">{c.vencimento}</TableCell>
                          <TableCell>R$ {c.valor.toLocaleString("pt-BR")}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-[11px]">Pendente</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Financeiro;
