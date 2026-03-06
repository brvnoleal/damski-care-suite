import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const faturamentoMensal = [
  { mes: "Jul", receita: 42500, despesas: 18200 },
  { mes: "Ago", receita: 38900, despesas: 16800 },
  { mes: "Set", receita: 51200, despesas: 19500 },
  { mes: "Out", receita: 47800, despesas: 17900 },
  { mes: "Nov", receita: 55300, despesas: 21200 },
  { mes: "Dez", receita: 49100, despesas: 20800 },
  { mes: "Jan", receita: 61200, despesas: 22500 },
  { mes: "Fev", receita: 58700, despesas: 21800 },
];

const receitaPorProcedimento = [
  { procedimento: "Harmonização Facial", valor: 89500, porcentagem: 32 },
  { procedimento: "Clareamento Dental", valor: 45200, porcentagem: 16 },
  { procedimento: "Facetas de Porcelana", valor: 67800, porcentagem: 24 },
  { procedimento: "Botox", valor: 38900, porcentagem: 14 },
  { procedimento: "Preenchimento Labial", valor: 25600, porcentagem: 9 },
  { procedimento: "Outros", valor: 13700, porcentagem: 5 },
];

const pieColors = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted-foreground))",
];

const formasPagamento = [
  { forma: "Cartão de Crédito", valor: 112300, porcentagem: 40 },
  { forma: "PIX", valor: 95400, porcentagem: 34 },
  { forma: "Cartão de Débito", valor: 42100, porcentagem: 15 },
  { forma: "Boleto", valor: 19500, porcentagem: 7 },
  { forma: "Dinheiro", valor: 11400, porcentagem: 4 },
];

const ultimasTransacoes = [
  { id: 1, paciente: "Maria Silva", procedimento: "Harmonização Facial", valor: 3500, forma: "PIX", data: "25/02/2026", status: "pago" },
  { id: 2, paciente: "João Santos", procedimento: "Clareamento Dental", valor: 1800, forma: "Crédito 3x", data: "24/02/2026", status: "pago" },
  { id: 3, paciente: "Ana Oliveira", procedimento: "Facetas de Porcelana", valor: 12000, forma: "Crédito 10x", data: "24/02/2026", status: "pendente" },
  { id: 4, paciente: "Carlos Lima", procedimento: "Botox", valor: 2200, forma: "PIX", data: "23/02/2026", status: "pago" },
  { id: 5, paciente: "Fernanda Costa", procedimento: "Preenchimento Labial", valor: 2800, forma: "Débito", data: "23/02/2026", status: "pago" },
  { id: 6, paciente: "Roberto Almeida", procedimento: "Harmonização Facial", valor: 4200, forma: "Crédito 6x", data: "22/02/2026", status: "atrasado" },
  { id: 7, paciente: "Luciana Pires", procedimento: "Clareamento Dental", valor: 1500, forma: "Dinheiro", data: "22/02/2026", status: "pago" },
];

const contasAPagar = [
  { descricao: "Aluguel consultório", vencimento: "05/03/2026", valor: 8500, status: "pendente" },
  { descricao: "Material odontológico", vencimento: "10/03/2026", valor: 4200, status: "pendente" },
  { descricao: "Folha de pagamento", vencimento: "01/03/2026", valor: 12800, status: "pendente" },
  { descricao: "Energia elétrica", vencimento: "15/03/2026", valor: 1350, status: "pendente" },
  { descricao: "Internet / Telefone", vencimento: "12/03/2026", valor: 450, status: "pendente" },
  { descricao: "Software de gestão", vencimento: "01/03/2026", valor: 299, status: "pago" },
];

const faturamentoConfig: ChartConfig = {
  receita: { label: "Receita", color: "hsl(var(--primary))" },
  despesas: { label: "Despesas", color: "hsl(var(--destructive))" },
};

const procedimentoConfig: ChartConfig = {
  valor: { label: "Valor", color: "hsl(var(--primary))" },
};

const Financeiro = () => {
  const [periodo, setPeriodo] = useState("mensal");

  const receitaTotal = 280700;
  const despesaTotal = 158700;
  const lucroLiquido = receitaTotal - despesaTotal;
  const ticketMedio = 3250;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral das finanças da clínica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Receita Total</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  R$ {receitaTotal.toLocaleString("pt-BR")}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-chart-2" />
                  <span className="text-xs font-medium text-chart-2">+12.5%</span>
                  <span className="text-xs text-muted-foreground">vs mês anterior</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Despesas</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  R$ {despesaTotal.toLocaleString("pt-BR")}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs font-medium text-destructive">+3.2%</span>
                  <span className="text-xs text-muted-foreground">vs mês anterior</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lucro Líquido</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  R$ {lucroLiquido.toLocaleString("pt-BR")}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-chart-2" />
                  <span className="text-xs font-medium text-chart-2">+18.7%</span>
                  <span className="text-xs text-muted-foreground">margem 43.4%</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ticket Médio</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  R$ {ticketMedio.toLocaleString("pt-BR")}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-chart-2" />
                  <span className="text-xs font-medium text-chart-2">+5.3%</span>
                  <span className="text-xs text-muted-foreground">vs mês anterior</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Faturamento x Despesas */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receita vs Despesas</CardTitle>
            <CardDescription>Últimos 8 meses</CardDescription>
          </CardHeader>
          <CardContent>
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
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Receita por Procedimento (Pie) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Procedimento</CardTitle>
            <CardDescription>Distribuição da receita</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={procedimentoConfig} className="h-[220px] w-full">
              <PieChart>
                <Pie
                  data={receitaPorProcedimento}
                  dataKey="valor"
                  nameKey="procedimento"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {receitaPorProcedimento.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
              </PieChart>
            </ChartContainer>
            <div className="space-y-2 mt-2">
              {receitaPorProcedimento.slice(0, 4).map((item, i) => (
                <div key={item.procedimento} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: pieColors[i] }} />
                    <span className="text-muted-foreground">{item.procedimento}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.porcentagem}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Transações / Contas a Pagar / Formas de Pagamento */}
      <Tabs defaultValue="transacoes">
        <TabsList>
          <TabsTrigger value="transacoes">Últimas Transações</TabsTrigger>
          <TabsTrigger value="contas">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="pagamentos">Formas de Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="transacoes">
          <Card>
            <CardContent className="p-0">
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
                  {ultimasTransacoes.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.paciente}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{t.procedimento}</TableCell>
                      <TableCell>R$ {t.valor.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{t.forma}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{t.data}</TableCell>
                      <TableCell>
                        <Badge
                          variant={t.status === "pago" ? "default" : t.status === "pendente" ? "secondary" : "destructive"}
                          className="text-[11px]"
                        >
                          {t.status === "pago" ? "Pago" : t.status === "pendente" ? "Pendente" : "Atrasado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contas">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasAPagar.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.descricao}</TableCell>
                      <TableCell className="text-muted-foreground">{c.vencimento}</TableCell>
                      <TableCell>R$ {c.valor.toLocaleString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "pago" ? "default" : "secondary"} className="text-[11px]">
                          {c.status === "pago" ? "Pago" : "Pendente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {formasPagamento.map((fp) => (
                  <div key={fp.forma} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{fp.forma}</span>
                      <span className="text-muted-foreground">
                        R$ {fp.valor.toLocaleString("pt-BR")} ({fp.porcentagem}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${fp.porcentagem}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;
