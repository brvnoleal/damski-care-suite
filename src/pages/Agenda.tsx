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

  const agendamentosPorDia = useMemo(() => {
    const map = new Map<string, Agendamento[]>();
    for (const a of agendamentos) {
      const arr = map.get(a.data) || [];
      arr.push(a);
      map.set(a.data, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.horario.localeCompare(b.horario));
    return map;
  }, [agendamentos]);

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

  const goPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={goPrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[160px] text-center text-sm font-semibold capitalize">
              {monthNames[month]} {year}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={goNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.1)}>
        <LiquidGlassCard className="overflow-hidden" draggable={false}>
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/10">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h2 className="text-xs sm:text-sm font-semibold text-foreground">Calendário de Consultas</h2>
          </div>

          <div className="p-2 sm:p-3">
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
                    className={`min-h-[80px] sm:min-h-[110px] border p-1 sm:p-1.5 flex flex-col gap-0.5 transition-colors ${
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
                        return (
                          <button
                            key={a.id}
                            onClick={() => setSelected(a)}
                            className="group flex items-center gap-1 px-1 py-0.5 text-left hover:bg-white/10 transition-colors"
                          >
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

export default Agenda;
