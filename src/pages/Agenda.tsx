import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, User, Stethoscope, CreditCard, FileText, Filter, X } from "lucide-react";
import { motion } from "framer-motion";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
});

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  agendado: { label: "Agendado", className: "bg-info/10 text-info border-info/20", dot: "bg-info" },
  confirmado: { label: "Confirmado", className: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  realizado: { label: "Realizado", className: "bg-success/10 text-success border-success/20", dot: "bg-success" },
  cancelado: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const formatDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
  const [filtroData, setFiltroData] = useState<string>("");
  const [view, setView] = useState<"mes" | "dia">("mes");

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
      if (filtroData && a.data !== filtroData) return false;
      return true;
    });
  }, [agendamentos, filtroDentista, filtroStatus, filtroData]);

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

  const filtrosAtivos = filtroDentista !== "todos" || filtroStatus !== "todos" || !!filtroData;
  const limparFiltros = () => {
    setFiltroDentista("todos");
    setFiltroStatus("todos");
    setFiltroData("");
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

  const goPrev = () => setCurrentDate(view === "mes" ? new Date(year, month - 1, 1) : new Date(year, month, currentDate.getDate() - 1));
  const goNext = () => setCurrentDate(view === "mes" ? new Date(year, month + 1, 1) : new Date(year, month, currentDate.getDate() + 1));
  const goToday = () => setCurrentDate(new Date());

  const diaKey = formatDateKey(currentDate);
  const itensDoDia = agendamentosPorDia.get(diaKey) || [];
  const headerLabel = view === "mes"
    ? `${monthNames[month]} ${year}`
    : currentDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const selectedPaciente = selected ? getPaciente(selected.paciente_id) : null;
  const selectedDentista = selected ? getDentista(selected.dentista_id) : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Agenda da Clínica</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Visualize os agendamentos da clínica por dia
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-white/10 overflow-hidden">
            <button
              onClick={() => setView("mes")}
              className={`px-3 h-8 text-xs font-medium transition-colors ${view === "mes" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5"}`}
            >Mês</button>
            <button
              onClick={() => setView("dia")}
              className={`px-3 h-8 text-xs font-medium transition-colors ${view === "dia" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5"}`}
            >Dia</button>
          </div>
          <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={goPrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[200px] text-center text-sm font-semibold capitalize">
              {headerLabel}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={goNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>


      <motion.div {...fadeUp(0.05)}>
        <LiquidGlassCard className="p-3 sm:p-4" draggable={false}>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="text-xs sm:text-sm font-semibold text-foreground">Filtros</h2>
            {filtrosAtivos && (
              <Button variant="ghost" size="sm" className="h-7 ml-auto text-xs" onClick={limparFiltros}>
                <X className="w-3 h-3 mr-1" /> Limpar
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Dentista</Label>
              <Select value={filtroDentista} onValueChange={setFiltroDentista}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os dentistas</SelectItem>
                  {dentistas.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Data</Label>
              <Input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      <motion.div {...fadeUp(0.1)}>

        <LiquidGlassCard className="overflow-hidden" draggable={false}>
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/10">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h2 className="text-xs sm:text-sm font-semibold text-foreground">Calendário de Consultas</h2>
          </div>

          <div className="p-2 sm:p-3">
            {view === "mes" ? (
              <>
                <div className="grid grid-cols-7">
                  {weekDays.map((w) => (
                    <div key={w} className="text-[10px] sm:text-xs font-semibold text-muted-foreground text-center py-2 uppercase tracking-wider border border-white/[0.04]">
                      {w}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {cells.map((cell, i) => {
                    if (!cell) return <div key={`e-${i}`} className="min-h-[80px] sm:min-h-[110px] bg-white/[0.015] border border-white/[0.04]" />;
                    const items = agendamentosPorDia.get(cell.key) || [];
                    const isToday = cell.key === today;
                    return (
                      <div
                        key={cell.key}
                        onClick={() => { setCurrentDate(cell.date); setView("dia"); }}
                        className={`min-h-[80px] sm:min-h-[110px] border p-1 sm:p-1.5 flex flex-col gap-0.5 transition-colors cursor-pointer ${
                          isToday ? "border-primary/40 bg-primary/[0.04]" : "border-white/[0.04] bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] sm:text-xs font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                            {cell.date.getDate()}
                          </span>
                          {items.length > 0 && (
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground">{items.length}</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                          {items.slice(0, 3).map((a) => {
                            const nome = getPaciente(a.paciente_id)?.nome || "—";
                            const st = statusConfig[a.status];
                            return (
                              <button
                                key={a.id}
                                onClick={(e) => { e.stopPropagation(); setSelected(a); }}
                                className="group flex items-center gap-1 px-1 py-0.5 text-left hover:bg-white/10 transition-colors"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st?.dot}`} />
                                <span className="text-[11px] sm:text-sm font-mono text-muted-foreground shrink-0 hidden sm:inline">{a.horario}</span>
                                <span className="text-[11px] sm:text-sm truncate text-foreground group-hover:text-primary">{nome}</span>
                              </button>
                            );
                          })}
                          {items.length > 3 && (
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground pl-1">+{items.length - 3} mais</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <DayView
                date={currentDate}
                items={itensDoDia}
                getPaciente={getPaciente}
                getDentista={getDentista}
                onSelect={setSelected}
              />
            )}

            {loading && (
              <div className="text-center text-xs text-muted-foreground py-4">Carregando agenda...</div>
            )}
          </div>
        </LiquidGlassCard>
      </motion.div>

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

const DayView = ({
  date,
  items,
  getPaciente,
  getDentista,
  onSelect,
}: {
  date: Date;
  items: Agendamento[];
  getPaciente: (id: string) => Paciente | undefined;
  getDentista: (id: string) => Dentista | undefined;
  onSelect: (a: Agendamento) => void;
}) => {
  const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 07h - 19h
  const itemsPorHora = new Map<number, Agendamento[]>();
  for (const a of items) {
    const h = parseInt(a.horario.slice(0, 2), 10);
    const arr = itemsPorHora.get(h) || [];
    arr.push(a);
    itemsPorHora.set(h, arr);
  }

  return (
    <div className="flex flex-col">
      {items.length === 0 && (
        <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-white/10 rounded-md mb-2">
          Nenhum agendamento para este dia
        </div>
      )}
      {hours.map((h) => {
        const slot = (itemsPorHora.get(h) || []).sort((a, b) => a.horario.localeCompare(b.horario));
        return (
          <div key={h} className="grid grid-cols-[64px_1fr] border border-white/[0.04] min-h-[56px]">
            <div className="px-2 py-2 text-xs font-mono text-muted-foreground border-r border-white/[0.04] bg-white/[0.015] flex items-start justify-end">
              {String(h).padStart(2, "0")}:00
            </div>
            <div className="p-1.5 flex flex-col gap-1">
              {slot.map((a) => {
                const st = statusConfig[a.status];
                const pac = getPaciente(a.paciente_id);
                const den = getDentista(a.dentista_id);
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelect(a)}
                    className={`group text-left px-2 py-1.5 rounded-md border transition-colors hover:bg-white/10 ${st?.className}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-1.5 h-1.5 rounded-full ${st?.dot}`} />
                      <span className="text-xs font-mono">{a.horario}</span>
                      <span className="text-sm font-semibold text-foreground truncate">{pac?.nome || "—"}</span>
                      <Badge variant="outline" className="text-[10px] h-5">{st?.label}</Badge>
                      {den && <span className="text-[11px] text-muted-foreground truncate">• {den.nome}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Agenda;
