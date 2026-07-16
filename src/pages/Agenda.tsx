import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, User, Stethoscope, CreditCard, FileText, Filter, X } from "lucide-react";
import { exportSheet } from "@/lib/exportXlsx";
import { ExportButton } from "@/components/ExportButton";
import { FadeIn } from "@/components/FadeIn";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { useToast } from "@/hooks/use-toast";
import { agendamentoService } from "@/services/agendamentoService";
import { pacienteService } from "@/services/pacienteService";
import { dentistaService } from "@/services/dentistaService";
import {
  Agendamento,
  Paciente,
  Dentista,
  procedimentoConsultaLabels,
  formaPagamentoLabels,
} from "@/types";
import { AGENDAMENTO_TAG_OPTIONS, AGENDAMENTO_TAG_LABELS, agendamentoTagClassName, agendamentoTagDotClass, agendamentoTagBorderClass } from "@/lib/pacienteOptions";


const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  agendado: { label: "Agendado", className: "bg-info/10 text-info border-info/20", dot: "bg-info" },
  confirmado: { label: "Confirmado", className: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  realizado: { label: "Realizado", className: "bg-success/10 text-success border-success/20", dot: "bg-success" },
  cancelado: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const weekDaysFull = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const formatDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Hourly slots from 07:00 to 20:00
const HOUR_SLOTS = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, "0")}:00`);

type ViewMode = "dia" | "semana" | "mes";

const Agenda = () => {
  const { toast } = useToast();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<Agendamento | null>(null);
  const [filtroDentista, setFiltroDentista] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("mes");



  useEffect(() => {
    (async () => {
      try {
        const [ag, pac, den] = await Promise.all([
          agendamentoService.listar(),
          pacienteService.listar(),
          dentistaService.listar(),
        ]);
        setAgendamentos(ag);
        setPacientes(pac);
        setDentistas(den);
      } catch {
        toast({ title: "Erro ao carregar agenda", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const getPaciente = (id: string) => pacientes.find((p) => p.id === id);
  const getDentista = (id: string) => dentistas.find((d) => d.id === id);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((a) => {
      if (filtroDentista !== "todos" && a.dentista_id !== filtroDentista) return false;
      if (filtroStatus !== "todos" && a.status !== filtroStatus) return false;
      return true;
    });
  }, [agendamentos, filtroDentista, filtroStatus]);

  const agendamentosPorDia = useMemo(() => {
    const map = new Map<string, Agendamento[]>();
    for (const a of agendamentosFiltrados) {
      const arr = map.get(a.data) || [];
      arr.push(a);
      map.set(a.data, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.horario.localeCompare(b.horario));
    return map;
  }, [agendamentosFiltrados]);

  const filtrosAtivos = filtroDentista !== "todos" || filtroStatus !== "todos";
  const limparFiltros = () => {
    setFiltroDentista("todos");
    setFiltroStatus("todos");
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();

  const cells: ({ date: Date; key: string } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ date, key: formatDateKey(date) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const today = formatDateKey(new Date());

  // Week days based on currentDate
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return { date: d, key: formatDateKey(d) };
    });
  }, [weekStart]);

  const goPrev = () => {
    if (viewMode === "mes") setCurrentDate(new Date(year, month - 1, 1));
    else if (viewMode === "semana") setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    else setCurrentDate(new Date(currentDate.getTime() - 86400000));
  };
  const goNext = () => {
    if (viewMode === "mes") setCurrentDate(new Date(year, month + 1, 1));
    else if (viewMode === "semana") setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    else setCurrentDate(new Date(currentDate.getTime() + 86400000));
  };

  const headerLabel = useMemo(() => {
    if (viewMode === "mes") return `${monthNames[month]} ${year}`;
    if (viewMode === "semana") {
      const end = weekDates[6].date;
      return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()].slice(0, 3)} – ${end.getDate()} ${monthNames[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
    }
    return `${weekDaysFull[currentDate.getDay()]}, ${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [viewMode, month, year, weekStart, weekDates, currentDate]);

  const selectedPaciente = selected ? getPaciente(selected.paciente_id) : null;
  const selectedDentista = selected ? getDentista(selected.dentista_id) : null;

  // Group an array of agendamentos by hour slot ("HH:00")
  const groupByHour = (items: Agendamento[]) => {
    const map = new Map<string, Agendamento[]>();
    for (const slot of HOUR_SLOTS) map.set(slot, []);
    for (const a of items) {
      const hour = a.horario.slice(0, 2);
      const slot = `${hour}:00`;
      if (!map.has(slot)) map.set(slot, []);
      map.get(slot)!.push(a);
    }
    return map;
  };

  const dayItems = agendamentosPorDia.get(formatDateKey(currentDate)) || [];
  const dayByHour = useMemo(() => groupByHour(dayItems), [dayItems]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <FadeIn className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Agenda da Clínica</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Visualize os agendamentos por dia, semana ou mês
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            disabled={!agendamentosFiltrados.length}
            label="Exportar agenda"
            tooltip="Baixar agenda do mês (Excel)"
            onExport={() => {
              const mesAtual = agendamentosFiltrados
                .filter((a) => {
                  const [y, m] = a.data.split("-").map(Number);
                  return y === year && m === month + 1;
                })
                .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
              exportSheet({
                filename: `agenda-${year}-${String(month + 1).padStart(2, "0")}`,
                sheetName: "Agenda",
                rows: mesAtual,
                columns: [
                  { header: "Data", accessor: (a) => a.data, format: "date" },
                  { header: "Horário", accessor: "horario" },
                  { header: "Horário Fim", accessor: (a) => a.horario_fim ?? "" },
                  { header: "Paciente", accessor: (a) => getPaciente(a.paciente_id)?.nome ?? "—" },
                  { header: "Dentista", accessor: (a) => getDentista(a.dentista_id)?.nome ?? "—" },
                  { header: "Procedimento", accessor: (a) => procedimentoConsultaLabels[a.procedimento as keyof typeof procedimentoConsultaLabels] ?? a.procedimento },
                  { header: "Status", accessor: (a) => a.status },
                  { header: "Valor", accessor: (a) => a.valor, format: "currency" },
                  { header: "Forma de Pagamento", accessor: (a) => formaPagamentoLabels[a.forma_pagamento as keyof typeof formaPagamentoLabels] ?? a.forma_pagamento },
                  { header: "Status Pagamento", accessor: (a) => a.status_pagamento ?? "" },
                  { header: "Observações", accessor: (a) => a.observacoes ?? "" },
                ],
              });
            }}
          />
        </div>
      </FadeIn>


      <FadeIn delay={0.05}>
        <LiquidGlassCard className="p-3 sm:p-4" draggable={false}>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="dia" className="text-xs px-3">Dia</TabsTrigger>
                <TabsTrigger value="semana" className="text-xs px-3">Semana</TabsTrigger>
                <TabsTrigger value="mes" className="text-xs px-3">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={goPrev} aria-label="Período anterior">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-[200px] text-center text-sm font-semibold capitalize">
                {headerLabel}
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={goNext} aria-label="Próximo período">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Select value={filtroDentista} onValueChange={setFiltroDentista}>
              <SelectTrigger className="h-8 text-xs w-[170px]"><SelectValue placeholder="Dentista" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os dentistas</SelectItem>
                {dentistas.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="h-8 text-xs w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {filtrosAtivos && (
              <Button variant="ghost" size="sm" className="h-7 ml-auto text-xs" onClick={limparFiltros}>
                <X className="w-3 h-3 mr-1" /> Limpar
              </Button>
            )}
          </div>
        </LiquidGlassCard>
      </FadeIn>

      <FadeIn delay={0.1}>

        <LiquidGlassCard className="overflow-hidden" draggable={false}>
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/10">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h2 className="text-xs sm:text-sm font-semibold text-foreground">
              {viewMode === "mes" && "Calendário Mensal"}
              {viewMode === "semana" && "Agenda Semanal"}
              {viewMode === "dia" && "Agenda do Dia"}
            </h2>
          </div>

          {viewMode === "mes" && (
            <div className="p-2 sm:p-3">
              <div className="grid grid-cols-7">
                {weekDays.map((w) => (
                  <div key={w} className="text-[10px] sm:text-xs font-semibold text-muted-foreground text-center py-2 uppercase tracking-wider border border-white/[0.04]">
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, i) => {
                  if (!cell) return <div key={`e-${i}`} className="min-h-[80px] sm:min-h-[110px] rounded-md bg-white/[0.015] border border-white/[0.04]" />;
                  const items = agendamentosPorDia.get(cell.key) || [];
                  const isToday = cell.key === today;
                  return (
                    <div
                      key={cell.key}
                      className={`min-h-[80px] sm:min-h-[110px] rounded-md border p-1 sm:p-1.5 flex flex-col gap-0.5 transition-colors cursor-default ${
                        isToday ? "border-primary/40 bg-primary/[0.04]" : "border-white/[0.08] bg-white/[0.02] hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => { setCurrentDate(cell.date); setViewMode("dia"); }}
                          className={`text-[11px] sm:text-xs font-semibold hover:text-primary ${isToday ? "text-primary" : "text-foreground"}`}
                        >
                          {cell.date.getDate()}
                        </button>
                        {items.length > 0 && (
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground">{items.length}</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                        {items.slice(0, 3).map((a) => {
                          const nome = getPaciente(a.paciente_id)?.nome || "—";
                          const st = statusConfig[a.status];
                          const firstTag = (a.tags || [])[0];
                          const dotClass = firstTag ? agendamentoTagDotClass(firstTag) : st?.dot;
                          return (
                            <button
                              key={a.id}
                              onClick={() => setSelected(a)}
                              className="group flex items-center gap-1 px-1 py-0.5 text-left hover:bg-white/10 transition-colors"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                              <span className="text-[11px] sm:text-sm font-mono text-muted-foreground shrink-0 hidden sm:inline">{a.horario}</span>
                              <span className="text-[11px] sm:text-sm truncate text-foreground group-hover:text-primary">{nome}</span>
                            </button>
                          );
                        })}
                        {items.length > 3 && (
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground pl-1">+{items.length - 3} mais</span>
                        )}
                      </div>
                      {items.length === 0 && (
                        <span className="mt-auto text-[9px] sm:text-[10px] text-muted-foreground italic self-start">Livre</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === "semana" && (
            <div className="p-2 sm:p-3 overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                  <div className="border border-white/[0.04] py-2" />
                  {weekDates.map((wd) => {
                    const isToday = wd.key === today;
                    return (
                      <button
                        key={wd.key}
                        onClick={() => { setCurrentDate(wd.date); setViewMode("dia"); }}
                        className={`text-center py-2 border border-white/[0.04] hover:bg-white/5 transition-colors ${isToday ? "bg-primary/[0.06]" : ""}`}
                      >
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{weekDays[wd.date.getDay()]}</div>
                        <div className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>{wd.date.getDate()}</div>
                      </button>
                    );
                  })}
                </div>

                {HOUR_SLOTS.map((slot) => (
                  <div key={slot} className="grid grid-cols-[60px_repeat(7,1fr)]">
                    <div className="text-[10px] sm:text-xs text-muted-foreground font-mono text-right pr-2 py-2 border border-white/[0.04] bg-white/[0.015]">
                      {slot}
                    </div>
                    {weekDates.map((wd) => {
                      const items = (agendamentosPorDia.get(wd.key) || []).filter((a) => a.horario.startsWith(slot.slice(0, 2)));
                      const isToday = wd.key === today;
                      return (
                        <div
                          key={wd.key + slot}
                          className={`min-h-[50px] border border-white/[0.04] p-1 flex flex-col gap-0.5 ${isToday ? "bg-primary/[0.02]" : "bg-white/[0.01]"}`}
                        >
                          {items.length === 0 ? (
                            <span className="text-[9px] text-muted-foreground italic">livre</span>
                          ) : (
                            items.map((a) => {
                              const nome = getPaciente(a.paciente_id)?.nome || "—";
                              const st = statusConfig[a.status];
                              const firstTag = (a.tags || [])[0];
                              const dotClass = firstTag ? agendamentoTagDotClass(firstTag) : st?.dot;
                              return (
                                <button
                                  key={a.id}
                                  onClick={() => setSelected(a)}
                                  className="group flex items-center gap-1 px-1 py-0.5 text-left rounded hover:bg-white/10 transition-colors"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{a.horario}</span>
                                  <span className="text-[10px] truncate text-foreground group-hover:text-primary">{nome}</span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === "dia" && (
            <div className="p-2 sm:p-3">
              {HOUR_SLOTS.map((slot) => {
                const items = dayByHour.get(slot) || [];
                return (
                  <div key={slot} className="grid grid-cols-[70px_1fr] border-b border-white/[0.04] last:border-b-0">
                    <div className="text-xs text-muted-foreground font-mono text-right pr-3 py-3 border-r border-white/[0.04] bg-white/[0.015]">
                      {slot}
                    </div>
                    <div className="min-h-[60px] p-2 flex flex-col gap-1">
                      {items.length === 0 ? (
                        <span className="text-[11px] text-muted-foreground italic">Sem agendamentos</span>
                      ) : (
                        items.map((a) => {
                          const nome = getPaciente(a.paciente_id)?.nome || "—";
                          const dent = getDentista(a.dentista_id)?.nome || "—";
                          const st = statusConfig[a.status];
                          const tags = a.tags || [];
                          const firstTag = tags[0];
                          const borderClass = firstTag ? agendamentoTagBorderClass(firstTag) : "border-l-transparent";
                          const dotClass = firstTag ? agendamentoTagDotClass(firstTag) : st?.dot;
                          return (
                            <button
                              key={a.id}
                              onClick={() => setSelected(a)}
                              className={`group flex items-start gap-2 px-2 py-2 text-left rounded-lg hover:bg-white/10 transition-colors border border-white/5 border-l-4 ${borderClass}`}
                            >
                              <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotClass}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-mono text-foreground">{a.horario}{a.horario_fim ? `–${a.horario_fim}` : ""}</span>
                                  <span className="text-sm font-medium text-foreground group-hover:text-primary truncate">{nome}</span>
                                  <Badge className={`${st?.className} text-[10px] py-0`}>{st?.label}</Badge>
                                  {tags.map((t) => (
                                    <Badge key={t} variant="outline" className={`text-[10px] py-0 ${agendamentoTagClassName(t)}`}>
                                      {AGENDAMENTO_TAG_LABELS[t] || t}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {procedimentoConsultaLabels[a.procedimento] ?? a.procedimento} • {dent}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="text-center text-xs text-muted-foreground py-4">Carregando agenda...</div>
          )}
        </LiquidGlassCard>
      </FadeIn>

      <ResponsiveDialog
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title="Detalhes do Agendamento"
        description={selected ? `${selected.data.split("-").reverse().join("/")} às ${selected.horario}` : ""}
      >
        {selected && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <Badge className={statusConfig[selected.status]?.className}>
                {statusConfig[selected.status]?.label}
              </Badge>
              <Badge variant="outline" className="font-medium">
                {procedimentoConsultaLabels[selected.procedimento]}
              </Badge>
            </div>

            {(selected.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(selected.tags || []).map((t) => (
                  <Badge key={t} variant="outline" className={`text-[11px] ${agendamentoTagClassName(t)}`}>
                    {AGENDAMENTO_TAG_LABELS[t] || t}
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <DetalheItem icon={<User className="w-4 h-4" />} label="Paciente" value={selectedPaciente?.nome || "—"} sub={selectedPaciente?.telefone} />
              <DetalheItem icon={<Stethoscope className="w-4 h-4" />} label="Dentista" value={selectedDentista?.nome || "—"} sub={selectedDentista?.especialidade} />
              <DetalheItem icon={<Clock className="w-4 h-4" />} label="Data e Horário" value={`${selected.data.split("-").reverse().join("/")} — ${selected.horario}`} />
              <DetalheItem
                icon={<CreditCard className="w-4 h-4" />}
                label="Pagamento"
                value={`R$ ${selected.valor.toFixed(2).replace(".", ",")}`}
                sub={`${formaPagamentoLabels[selected.forma_pagamento]}${selected.parcelas > 1 ? ` em ${selected.parcelas}x` : ""}`}
              />
              {selected.observacoes && (
                <DetalheItem icon={<FileText className="w-4 h-4" />} label="Observações" value={selected.observacoes} />
              )}
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

const DetalheItem = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
    <div className="text-primary mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-sm text-foreground font-medium break-words">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  </div>
);


export default Agenda;
