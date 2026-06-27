/**
 * Relatórios avançados do módulo Financeiro:
 * - DRE simplificado (receitas pagas, despesas pagas, comissões devidas, resultado).
 * - Funil de vendas e taxas de conversão / inadimplência.
 * - Holerite (pró-labore) por dentista — somente sobre consultas com status_pagamento = "pago".
 *
 * O cálculo da comissão usa a tabela `comissao` (matriz dentista × procedimento).
 * Como `agendamento.procedimento` é texto, fazemos o link procurando um
 * procedimento cujo nome (case insensitive) corresponda à chave ou ao label
 * de procedimento da consulta.
 */
import { useEffect, useMemo, useState } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, Wallet, TrendingDown, TrendingUp, AlertTriangle, Percent, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { comissaoService, type ComissaoRecord } from "@/services/comissaoService";
import { procedimentoService, type ProcedimentoRecord } from "@/services/procedimentoService";
import { dentistaService } from "@/services/dentistaService";
import { pacienteService } from "@/services/pacienteService";
import type { Dentista, Paciente } from "@/types";
import { procedimentoConsultaLabels } from "@/types";
import { exportToXlsx } from "@/lib/exportXlsx";

interface Agendamento {
  id: string;
  data: string;
  paciente_id: string;
  dentista_id: string;
  procedimento: string;
  status: string;
  status_pagamento: string;
  valor: number;
}

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  status: string;
  vencimento: string;
}

const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const monthKey = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (k: string) => {
  const [y, m] = k.split("-");
  return `${m}/${y}`;
};

/**
 * Tenta encontrar o procedimento da clínica que corresponde ao agendamento.
 * Compara por nome normalizado contra a chave e o label do agendamento.
 */
const matchProcedimento = (
  procedimento: string,
  procedimentos: ProcedimentoRecord[],
): ProcedimentoRecord | undefined => {
  const norm = (s: string) => s.toLowerCase().trim();
  const key = norm(procedimento);
  const label = norm(
    (procedimentoConsultaLabels as Record<string, string>)[procedimento] || procedimento,
  );
  return procedimentos.find((p) => {
    const n = norm(p.nome);
    return n === key || n === label || n.includes(label) || label.includes(n);
  });
};

const RelatoriosAvancados = () => {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"30" | "90" | "365" | "all">("90");
  const [dentistaFiltro, setDentistaFiltro] = useState<string>("all");

  const [ags, setAgs] = useState<Agendamento[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [comissoes, setComissoes] = useState<ComissaoRecord[]>([]);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoRecord[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [agRes, despRes, com, procs, dts, pacs] = await Promise.all([
          supabase.from("agendamento").select("id,data,paciente_id,dentista_id,procedimento,status,status_pagamento,valor"),
          supabase.from("despesa").select("id,descricao,valor,status,vencimento"),
          comissaoService.list(),
          procedimentoService.list(),
          dentistaService.listar(),
          pacienteService.listar(),
        ]);
        setAgs(((agRes.data as any[]) || []).map((a) => ({ ...a, valor: Number(a.valor) || 0 })));
        setDespesas(((despRes.data as any[]) || []).map((d) => ({ ...d, valor: Number(d.valor) || 0 })));
        setComissoes(com);
        setProcedimentos(procs);
        setDentistas(dts);
        setPacientes(pacs);
      } catch (e: any) {
        toast.error("Erro ao carregar relatórios: " + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ============ Filtragem por período ============
  const cutoff = useMemo(() => {
    if (periodo === "all") return null;
    const days = Number(periodo);
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  }, [periodo]);

  const agsFiltrados = useMemo(
    () => ags.filter((a) => !cutoff || a.data >= cutoff),
    [ags, cutoff],
  );

  const despesasFiltradas = useMemo(
    () => despesas.filter((d) => !cutoff || d.vencimento >= cutoff),
    [despesas, cutoff],
  );

  // ============ Mapa de comissão ============
  const comissaoLookup = useMemo(() => {
    const m = new Map<string, ComissaoRecord>();
    comissoes.forEach((c) => m.set(`${c.dentista_id}::${c.procedimento_id}`, c));
    return m;
  }, [comissoes]);

  // ============ DRE ============
  const dre = useMemo(() => {
    const pagas = agsFiltrados.filter((a) => a.status_pagamento === "pago");
    const receitaPaga = pagas.reduce((s, a) => s + a.valor, 0);
    const receitaPendente = agsFiltrados
      .filter((a) => a.status_pagamento !== "pago" && a.status !== "cancelado")
      .reduce((s, a) => s + a.valor, 0);
    const despesaPaga = despesasFiltradas
      .filter((d) => d.status === "pago")
      .reduce((s, d) => s + d.valor, 0);
    const despesaPendente = despesasFiltradas
      .filter((d) => d.status !== "pago")
      .reduce((s, d) => s + d.valor, 0);

    let comissaoTotal = 0;
    pagas.forEach((a) => {
      const proc = matchProcedimento(a.procedimento, procedimentos);
      if (!proc) return;
      const c = comissaoLookup.get(`${a.dentista_id}::${proc.id}`);
      if (!c || !c.ativo) return;
      comissaoTotal += comissaoService.calcular({
        statusPagamento: a.status_pagamento,
        valorConsulta: a.valor,
        comissao: c,
      });
    });

    const resultadoBruto = receitaPaga - despesaPaga;
    const resultadoLiquido = resultadoBruto - comissaoTotal;

    // Mensal
    const buckets: Record<string, { receita: number; despesa: number; comissao: number }> = {};
    pagas.forEach((a) => {
      const k = monthKey(a.data);
      buckets[k] = buckets[k] || { receita: 0, despesa: 0, comissao: 0 };
      buckets[k].receita += a.valor;
      const proc = matchProcedimento(a.procedimento, procedimentos);
      if (proc) {
        const c = comissaoLookup.get(`${a.dentista_id}::${proc.id}`);
        if (c && c.ativo) {
          buckets[k].comissao += comissaoService.calcular({
            statusPagamento: "pago",
            valorConsulta: a.valor,
            comissao: c,
          });
        }
      }
    });
    despesasFiltradas
      .filter((d) => d.status === "pago")
      .forEach((d) => {
        const k = monthKey(d.vencimento);
        buckets[k] = buckets[k] || { receita: 0, despesa: 0, comissao: 0 };
        buckets[k].despesa += d.valor;
      });
    const mensal = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({
        mes: monthLabel(k),
        receita: v.receita,
        despesa: v.despesa,
        comissao: v.comissao,
        resultado: v.receita - v.despesa - v.comissao,
      }));

    return {
      receitaPaga,
      receitaPendente,
      despesaPaga,
      despesaPendente,
      comissaoTotal,
      resultadoBruto,
      resultadoLiquido,
      mensal,
    };
  }, [agsFiltrados, despesasFiltradas, procedimentos, comissaoLookup]);

  // ============ Funil & Conversão ============
  const funil = useMemo(() => {
    const total = agsFiltrados.length;
    const confirmado = agsFiltrados.filter(
      (a) => a.status === "confirmado" || a.status === "realizado",
    ).length;
    const realizado = agsFiltrados.filter((a) => a.status === "realizado").length;
    const pago = agsFiltrados.filter(
      (a) => a.status === "realizado" && a.status_pagamento === "pago",
    ).length;
    const naoCompareceu = agsFiltrados.filter((a) => a.status === "nao_compareceu").length;
    const cancelados = agsFiltrados.filter((a) => a.status === "cancelado").length;

    const pct = (n: number, base: number) => (base > 0 ? Math.round((n / base) * 100) : 0);

    const valorRealizado = agsFiltrados
      .filter((a) => a.status === "realizado")
      .reduce((s, a) => s + a.valor, 0);
    const valorPago = agsFiltrados
      .filter((a) => a.status === "realizado" && a.status_pagamento === "pago")
      .reduce((s, a) => s + a.valor, 0);
    const valorPendente = valorRealizado - valorPago;
    const inadimplencia = pct(valorPendente, valorRealizado);

    return {
      total,
      confirmado,
      realizado,
      pago,
      naoCompareceu,
      cancelados,
      taxaConfirmacao: pct(confirmado, total),
      taxaComparecimento: pct(realizado, confirmado),
      taxaPagamento: pct(pago, realizado),
      taxaConversaoGeral: pct(pago, total),
      valorRealizado,
      valorPago,
      valorPendente,
      inadimplencia,
    };
  }, [agsFiltrados]);

  // ============ Holerite ============
  const holerite = useMemo(() => {
    const dentistaMap = new Map(dentistas.map((d) => [d.id, d]));
    const result: Record<
      string,
      {
        dentista: Dentista | undefined;
        consultasPagas: number;
        valorAtendido: number;
        comissaoTotal: number;
        detalhes: {
          id: string;
          data: string;
          procedimento: string;
          valor: number;
          base: string;
          comissao: number;
        }[];
      }
    > = {};

    agsFiltrados
      .filter((a) => a.status_pagamento === "pago")
      .filter((a) => dentistaFiltro === "all" || a.dentista_id === dentistaFiltro)
      .forEach((a) => {
        const proc = matchProcedimento(a.procedimento, procedimentos);
        const c = proc ? comissaoLookup.get(`${a.dentista_id}::${proc.id}`) : undefined;
        const comissaoValor = c
          ? comissaoService.calcular({
              statusPagamento: a.status_pagamento,
              valorConsulta: a.valor,
              comissao: c,
            })
          : 0;
        if (!result[a.dentista_id]) {
          result[a.dentista_id] = {
            dentista: dentistaMap.get(a.dentista_id),
            consultasPagas: 0,
            valorAtendido: 0,
            comissaoTotal: 0,
            detalhes: [],
          };
        }
        const bucket = result[a.dentista_id];
        bucket.consultasPagas += 1;
        bucket.valorAtendido += a.valor;
        bucket.comissaoTotal += comissaoValor;
        bucket.detalhes.push({
          id: a.id,
          data: a.data,
          procedimento:
            (procedimentoConsultaLabels as Record<string, string>)[a.procedimento] ||
            a.procedimento,
          valor: a.valor,
          base: c
            ? c.tipo === "percentual"
              ? `${c.valor}%`
              : fmtBRL(c.valor)
            : "Sem regra",
          comissao: comissaoValor,
        });
      });

    return Object.values(result).sort((a, b) => b.comissaoTotal - a.comissaoTotal);
  }, [agsFiltrados, comissaoLookup, procedimentos, dentistas, dentistaFiltro]);

  // ============ Demografia ============
  // Respeita: período (cutoff) + filtro de dentista (quando aplicável).
  // Considera somente pacientes que tiveram agendamento no recorte.
  const demografia = useMemo(() => {
    const agsEscopo = agsFiltrados.filter(
      (a) => dentistaFiltro === "all" || a.dentista_id === dentistaFiltro,
    );
    const pacIdsAtivos = new Set(agsEscopo.map((a) => a.paciente_id));
    // Se não há agendamentos no período, mostra todos os pacientes (visão geral).
    const base =
      pacIdsAtivos.size === 0
        ? pacientes
        : pacientes.filter((p) => pacIdsAtivos.has(p.id));
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
        somaIdade += idade; countIdade++;
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
    return { total, sexoMap, faixaMap, topProfissoes, idadeMedia, base, sexoChart, faixaChart, profChart };
  }, [pacientes, agsFiltrados, dentistaFiltro]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando relatórios…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">Período:</span>
        <Select value={periodo} onValueChange={(v) => setPeriodo(v as any)}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
            <SelectItem value="all">Tudo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ===== DRE ===== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-foreground">DRE — Demonstrativo de Resultado</h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              exportToXlsx(
                [
                  { Linha: "(+) Receita paga", Valor: dre.receitaPaga },
                  { Linha: "(-) Despesas pagas", Valor: dre.despesaPaga },
                  { Linha: "(=) Resultado bruto", Valor: dre.resultadoBruto },
                  { Linha: "(-) Comissões devidas", Valor: dre.comissaoTotal },
                  { Linha: "(=) Resultado líquido", Valor: dre.resultadoLiquido },
                  { Linha: "Receita pendente (a receber)", Valor: dre.receitaPendente },
                  { Linha: "Despesas pendentes", Valor: dre.despesaPendente },
                ],
                "dre",
              );
              toast.success("DRE exportado");
            }}
          >
            <Download className="w-4 h-4" /> Exportar
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <LiquidGlassCard className="p-4" draggable={false}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Receita Paga</p>
            <p className="text-xl font-bold text-foreground mt-1">{fmtBRL(dre.receitaPaga)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">A receber: {fmtBRL(dre.receitaPendente)}</p>
          </LiquidGlassCard>
          <LiquidGlassCard className="p-4" draggable={false}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Despesas Pagas</p>
            <p className="text-xl font-bold text-foreground mt-1">{fmtBRL(dre.despesaPaga)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Pendentes: {fmtBRL(dre.despesaPendente)}</p>
          </LiquidGlassCard>
          <LiquidGlassCard className="p-4" draggable={false}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Comissões devidas</p>
            <p className="text-xl font-bold text-foreground mt-1">{fmtBRL(dre.comissaoTotal)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Sobre consultas pagas</p>
          </LiquidGlassCard>
          <LiquidGlassCard className="p-4" draggable={false}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Resultado Líquido</p>
            <p
              className={`text-xl font-bold mt-1 ${
                dre.resultadoLiquido >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {fmtBRL(dre.resultadoLiquido)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Bruto: {fmtBRL(dre.resultadoBruto)}
            </p>
          </LiquidGlassCard>
        </div>

        <LiquidGlassCard className="overflow-hidden" draggable={false}>
          <div className="p-5 pb-3">
            <h3 className="text-base font-semibold text-foreground">DRE mensal</h3>
            <p className="text-sm text-muted-foreground">
              Receitas pagas, despesas pagas, comissões devidas e resultado.
            </p>
          </div>
          <div className="px-5 pb-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Despesas</TableHead>
                  <TableHead className="text-right">Comissões</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dre.mensal.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      Sem movimentações no período.
                    </TableCell>
                  </TableRow>
                ) : (
                  dre.mensal.map((m) => (
                    <TableRow key={m.mes}>
                      <TableCell className="font-medium text-foreground">{m.mes}</TableCell>
                      <TableCell className="text-right">{fmtBRL(m.receita)}</TableCell>
                      <TableCell className="text-right text-destructive">
                        {fmtBRL(m.despesa)}
                      </TableCell>
                      <TableCell className="text-right text-warning">
                        {fmtBRL(m.comissao)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          m.resultado >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {fmtBRL(m.resultado)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </LiquidGlassCard>
      </section>

      {/* ===== Funil & Conversão ===== */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Funil de Vendas & Conversão</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <LiquidGlassCard className="p-4" draggable={false}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Confirmação</p>
              <Percent className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{funil.taxaConfirmacao}%</p>
            <p className="text-[11px] text-muted-foreground">{funil.confirmado}/{funil.total} agendamentos</p>
          </LiquidGlassCard>
          <LiquidGlassCard className="p-4" draggable={false}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Comparecimento</p>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{funil.taxaComparecimento}%</p>
            <p className="text-[11px] text-muted-foreground">{funil.realizado}/{funil.confirmado} realizados</p>
          </LiquidGlassCard>
          <LiquidGlassCard className="p-4" draggable={false}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pagamento</p>
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{funil.taxaPagamento}%</p>
            <p className="text-[11px] text-muted-foreground">{funil.pago}/{funil.realizado} pagos</p>
          </LiquidGlassCard>
          <LiquidGlassCard className="p-4" draggable={false}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Inadimplência</p>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive mt-1">{funil.inadimplencia}%</p>
            <p className="text-[11px] text-muted-foreground">{fmtBRL(funil.valorPendente)} em aberto</p>
          </LiquidGlassCard>
        </div>

        <LiquidGlassCard className="overflow-hidden" draggable={false}>
          <div className="p-5 pb-3">
            <h3 className="text-base font-semibold text-foreground">Funil</h3>
            <p className="text-sm text-muted-foreground">
              Conversão entre as etapas: agendado → confirmado → realizado → pago.
            </p>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {[
              { label: "Agendados", val: funil.total, max: funil.total, color: "bg-muted" },
              { label: "Confirmados / Realizados", val: funil.confirmado, max: funil.total, color: "bg-primary/30" },
              { label: "Realizados", val: funil.realizado, max: funil.total, color: "bg-primary/60" },
              { label: "Pagos", val: funil.pago, max: funil.total, color: "bg-success/70" },
            ].map((row) => {
              const pct = row.max > 0 ? Math.round((row.val / row.max) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{row.label}</span>
                    <span className="text-muted-foreground">
                      {row.val} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={`h-full ${row.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <Badge variant="destructive">Não compareceu: {funil.naoCompareceu}</Badge>
              <Badge variant="secondary">Cancelados: {funil.cancelados}</Badge>
              <Badge variant="outline">Conversão geral (pago/total): {funil.taxaConversaoGeral}%</Badge>
            </div>
          </div>
        </LiquidGlassCard>
      </section>

      {/* ===== Holerite ===== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-foreground">Holerite / Pró-labore por Dentista</h2>
          <div className="flex gap-2 items-center">
            <Select value={dentistaFiltro} onValueChange={setDentistaFiltro}>
              <SelectTrigger className="w-[220px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os dentistas</SelectItem>
                {dentistas.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                const rows = holerite.flatMap((h) =>
                  h.detalhes.map((d) => ({
                    Dentista: h.dentista?.nome || "—",
                    Data: d.data,
                    Procedimento: d.procedimento,
                    "Valor consulta": d.valor,
                    Base: d.base,
                    Comissão: d.comissao,
                  })),
                );
                exportToXlsx<Record<string, any>>(rows.length ? rows : [{ aviso: "Sem comissões no período" }], "holerite");
                toast.success("Holerite exportado");
              }}
            >
              <Download className="w-4 h-4" /> Exportar
            </Button>
          </div>
        </div>

        {holerite.length === 0 ? (
          <LiquidGlassCard className="p-8 text-center text-sm text-muted-foreground" draggable={false}>
            Nenhuma comissão apurada no período. Verifique se há consultas com status de pagamento
            "pago" e regras configuradas em Procedimentos → Comissões.
          </LiquidGlassCard>
        ) : (
          <div className="space-y-4">
            {holerite.map((h) => (
              <LiquidGlassCard key={h.dentista?.id || "sd"} className="overflow-hidden" draggable={false}>
                <div className="p-5 pb-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {h.dentista?.nome || "Dentista removido"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {h.dentista?.especialidade} {h.dentista?.cro && `· ${h.dentista.cro}`}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{h.consultasPagas} consultas pagas</Badge>
                    <Badge variant="secondary">Atendido: {fmtBRL(h.valorAtendido)}</Badge>
                    <Badge className="bg-success text-success-foreground">
                      Comissão: {fmtBRL(h.comissaoTotal)}
                    </Badge>
                  </div>
                </div>
                <div className="px-5 pb-5 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Procedimento</TableHead>
                        <TableHead className="text-right">Valor consulta</TableHead>
                        <TableHead>Base</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {h.detalhes
                        .sort((a, b) => b.data.localeCompare(a.data))
                        .map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="text-muted-foreground">
                              {new Date(d.data + "T00:00:00").toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-foreground">{d.procedimento}</TableCell>
                            <TableCell className="text-right">{fmtBRL(d.valor)}</TableCell>
                            <TableCell className="text-muted-foreground">{d.base}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {d.comissao > 0 ? fmtBRL(d.comissao) : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        )}
      </section>

      {/* ===== Demografia ===== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Demografia dos Pacientes</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              const rows = pacientes.map((p) => {
                const dt = p.data_nascimento ? new Date(p.data_nascimento + "T00:00:00") : null;
                let idade: number | string = "";
                if (dt && !isNaN(dt.getTime())) {
                  const now = new Date();
                  let a = now.getFullYear() - dt.getFullYear();
                  const mo = now.getMonth() - dt.getMonth();
                  if (mo < 0 || (mo === 0 && now.getDate() < dt.getDate())) a--;
                  idade = a;
                }
                return {
                  Nome: p.nome,
                  Sexo: p.sexo || "—",
                  Idade: idade,
                  Profissão: p.profissao || "—",
                  "Estado civil": p.estado_civil || "—",
                  Cidade: p.cidade || "—",
                  Estado: p.estado || "—",
                };
              });
              exportToXlsx<Record<string, any>>(rows.length ? rows : [{ aviso: "Sem pacientes" }], "demografia-pacientes");
              toast.success("Demografia exportada");
            }}
          >
            <Download className="w-4 h-4" /> Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <LiquidGlassCard className="p-5" draggable={false}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Por sexo</h3>
            <div className="space-y-2">
              {Object.entries(demografia.sexoMap).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
                const pct = demografia.total > 0 ? Math.round((v / demografia.total) * 100) : 0;
                return (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{k}</span>
                      <span className="text-muted-foreground">{v} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                      <div className="h-full bg-primary/60" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {demografia.total === 0 && <p className="text-xs text-muted-foreground">Sem dados.</p>}
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="p-5" draggable={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Por faixa etária</h3>
              <Badge variant="outline">Média: {demografia.idadeMedia} anos</Badge>
            </div>
            <div className="space-y-2">
              {Object.entries(demografia.faixaMap).map(([k, v]) => {
                const pct = demografia.total > 0 ? Math.round((v / demografia.total) * 100) : 0;
                return (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{k}</span>
                      <span className="text-muted-foreground">{v} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                      <div className="h-full bg-success/60" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="p-5" draggable={false}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Top profissões</h3>
            <div className="space-y-2">
              {demografia.topProfissoes.length === 0 && <p className="text-xs text-muted-foreground">Sem dados.</p>}
              {demografia.topProfissoes.map(([k, v]) => {
                const pct = demografia.total > 0 ? Math.round((v / demografia.total) * 100) : 0;
                return (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-foreground truncate pr-2">{k}</span>
                    <span className="text-muted-foreground whitespace-nowrap">{v} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </LiquidGlassCard>
        </div>
      </section>
    </div>
  );
};

export default RelatoriosAvancados;
