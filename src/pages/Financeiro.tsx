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
  Plus,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
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
import { toast } from "sonner";

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
  "hsl(239 84% 67%)",
  "hsl(160 84% 39%)",
  "hsl(38 92% 50%)",
  "hsl(345 45% 40%)",
  "hsl(217 91% 60%)",
  "hsl(280 60% 55%)",
];

const pagamentoColors = [
  "hsl(160 84% 39%)",
  "hsl(239 84% 67%)",
  "hsl(38 92% 50%)",
  "hsl(0 72% 51%)",
  "hsl(280 60% 55%)",
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
  const [despesaOpen, setDespesaOpen] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: "",
    categoria: "",
    fornecedor: "",
    valor: "",
    formaPagamento: "",
    vencimento: "",
    observacoes: "",
  });

  const handleDespesaChange = (field: string, value: string) => {
    setNovaDespesa((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalvarDespesa = () => {
    if (!novaDespesa.descricao || !novaDespesa.valor || !novaDespesa.vencimento) {
      toast.error("Preencha os campos obrigatórios: Descrição, Valor e Vencimento.");
      return;
    }
    toast.success("Despesa cadastrada com sucesso!");
    setNovaDespesa({ descricao: "", categoria: "", fornecedor: "", valor: "", formaPagamento: "", vencimento: "", observacoes: "" });
    setDespesaOpen(false);
  };

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
          <Dialog open={despesaOpen} onOpenChange={setDespesaOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Nova Despesa</DialogTitle>
                <DialogDescription>Cadastre uma nova despesa do consultório.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input id="descricao" placeholder="Ex: Aluguel, Material..." value={novaDespesa.descricao} onChange={(e) => handleDespesaChange("descricao", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={novaDespesa.categoria} onValueChange={(v) => handleDespesaChange("categoria", v)}>
                      <SelectTrigger id="categoria"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aluguel">Aluguel</SelectItem>
                        <SelectItem value="material">Material Odontológico</SelectItem>
                        <SelectItem value="folha">Folha de Pagamento</SelectItem>
                        <SelectItem value="equipamento">Equipamentos</SelectItem>
                        <SelectItem value="utilidades">Utilidades (Água, Luz, Internet)</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="software">Software / Licenças</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input id="fornecedor" placeholder="Nome do fornecedor" value={novaDespesa.fornecedor} onChange={(e) => handleDespesaChange("fornecedor", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input id="valor" type="number" placeholder="0,00" value={novaDespesa.valor} onChange={(e) => handleDespesaChange("valor", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                    <Select value={novaDespesa.formaPagamento} onValueChange={(v) => handleDespesaChange("formaPagamento", v)}>
                      <SelectTrigger id="formaPagamento"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="debito">Cartão de Débito</SelectItem>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vencimento">Vencimento *</Label>
                    <Input id="vencimento" type="date" value={novaDespesa.vencimento} onChange={(e) => handleDespesaChange("vencimento", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" placeholder="Notas adicionais..." rows={3} value={novaDespesa.observacoes} onChange={(e) => handleDespesaChange("observacoes", e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDespesaOpen(false)}>Cancelar</Button>
                <Button onClick={handleSalvarDespesa}>Salvar Despesa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiquidGlassCard draggable={false} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Receita Total</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                R$ {receitaTotal.toLocaleString("pt-BR")}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium text-success">+12.5%</span>
                <span className="text-xs text-muted-foreground">vs mês anterior</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard draggable={false} className="p-5">
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
        </LiquidGlassCard>

        <LiquidGlassCard draggable={false} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lucro Líquido</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                R$ {lucroLiquido.toLocaleString("pt-BR")}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium text-success">+18.7%</span>
                <span className="text-xs text-muted-foreground">margem 43.4%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard draggable={false} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ticket Médio</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                R$ {ticketMedio.toLocaleString("pt-BR")}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium text-success">+5.3%</span>
                <span className="text-xs text-muted-foreground">vs mês anterior</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiquidGlassCard className="lg:col-span-2 overflow-hidden" draggable={false}>
          <div className="p-5 pb-2">
            <h3 className="text-base font-semibold text-foreground">Receita vs Despesas</h3>
            <p className="text-sm text-muted-foreground">Últimos 8 meses</p>
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

      {/* Formas de Pagamento + Transações/Contas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiquidGlassCard className="overflow-hidden" draggable={false}>
          <div className="p-5 pb-2">
            <h3 className="text-base font-semibold text-foreground">Formas de Pagamento</h3>
            <p className="text-sm text-muted-foreground">Distribuição por método</p>
          </div>
          <div className="px-5 pb-5">
            <ChartContainer config={procedimentoConfig} className="h-[220px] w-full">
              <PieChart>
                <Pie
                  data={formasPagamento}
                  dataKey="valor"
                  nameKey="forma"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {formasPagamento.map((_, index) => (
                    <Cell key={index} fill={pagamentoColors[index % pagamentoColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
              </PieChart>
            </ChartContainer>
            <div className="space-y-2 mt-2">
              {formasPagamento.map((item, i) => (
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

        <div className="lg:col-span-2">
          <Tabs defaultValue="transacoes">
            <TabsList>
              <TabsTrigger value="transacoes">Últimas Transações</TabsTrigger>
              <TabsTrigger value="contas">Contas a Pagar</TabsTrigger>
            </TabsList>

            <TabsContent value="transacoes">
              <LiquidGlassCard className="overflow-hidden" draggable={false}>
                <div className="p-0">
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
                </div>
              </LiquidGlassCard>
            </TabsContent>

            <TabsContent value="contas">
              <LiquidGlassCard className="overflow-hidden" draggable={false}>
                <div className="p-0">
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
