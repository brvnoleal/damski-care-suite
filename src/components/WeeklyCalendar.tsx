import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ───────── Types ───────── */

interface CalendarEvent {
  date: string; // "YYYY-MM-DD"
  time: string;
  endTime: string;
  name: string;
  proc: string;
  status: string;
  sala: string;
}

/* ───────── Mock weekly data ───────── */

function generateWeekEvents(weekStart: Date): CalendarEvent[] {
  const templates = [
    { time: "08:30", endTime: "09:15", name: "Maria Silva", proc: "Harmonização Facial", status: "concluída", sala: "Sala 1" },
    { time: "09:00", endTime: "09:45", name: "Ana Costa", proc: "Toxina Botulínica", status: "concluída", sala: "Sala 1" },
    { time: "09:30", endTime: "10:15", name: "Carlos Souza", proc: "Avaliação", status: "concluída", sala: "Sala 2" },
    { time: "10:30", endTime: "11:15", name: "Pedro Santos", proc: "Preenchimento Labial", status: "concluída", sala: "Sala 2" },
    { time: "11:00", endTime: "11:45", name: "Julia Ramos", proc: "Clareamento", status: "concluída", sala: "Sala 1" },
    { time: "14:00", endTime: "15:00", name: "Carla Dias", proc: "Lente de Contato Dental", status: "agendado", sala: "Sala 1" },
    { time: "14:30", endTime: "15:30", name: "Marcos Lima", proc: "Profilaxia", status: "agendado", sala: "Sala 3" },
    { time: "15:30", endTime: "16:15", name: "Lucas Mendes", proc: "Clareamento Dental", status: "agendado", sala: "Sala 2" },
    { time: "16:00", endTime: "16:30", name: "Beatriz Alves", proc: "Avaliação", status: "agendado", sala: "Sala 1" },
    { time: "16:45", endTime: "17:30", name: "Fernanda Lima", proc: "Harmonização Facial", status: "agendado", sala: "Sala 3" },
    { time: "17:30", endTime: "18:00", name: "Ricardo Nunes", proc: "Profilaxia", status: "agendado", sala: "Sala 2" },
  ];

  const events: CalendarEvent[] = [];
  // Spread events across weekdays (Mon-Fri = indices 0-4, Sat = 5)
  const distributions = [
    [0, 1, 3, 5, 7, 9],   // Mon
    [1, 2, 4, 6, 8],      // Tue
    [0, 3, 5, 7, 10],     // Wed
    [1, 4, 6, 8, 9],      // Thu
    [0, 2, 5, 7],         // Fri
    [3, 6],               // Sat
    [],                    // Sun
  ];

  for (let d = 0; d < 7; d++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today && !isToday;

    for (const idx of distributions[d]) {
      const t = templates[idx];
      events.push({
        ...t,
        date: dateStr,
        status: isPast ? "concluída" : isToday && parseInt(t.time) < today.getHours() ? "concluída" : t.status,
      });
    }
  }

  return events;
}

/* ───────── Helpers ───────── */

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];
const HOUR_HEIGHT = 60;
const START_MINUTES = 8 * 60;
const END_MINUTES = 18 * 60;
const TOTAL_RANGE = END_MINUTES - START_MINUTES;

const EVENT_COLORS = [
  "bg-primary", "bg-info", "bg-success", "bg-warning",
  "bg-destructive", "bg-[hsl(var(--gold))]", "bg-primary/80", "bg-info/80",
];

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateKey(d: Date) {
  return d.toISOString().split("T")[0];
}

interface LayoutEvent extends CalendarEvent {
  idx: number;
  startMin: number;
  endMin: number;
  col: number;
  totalCols: number;
}

function layoutEventsForDay(events: CalendarEvent[]): LayoutEvent[] {
  const sorted = events.map((e, i) => ({
    ...e,
    idx: i,
    startMin: timeToMinutes(e.time),
    endMin: timeToMinutes(e.endTime),
    col: 0,
    totalCols: 1,
  })).sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const groups: (typeof sorted)[] = [];
  let currentGroup: typeof sorted = [];

  for (const ev of sorted) {
    if (currentGroup.length === 0 || ev.startMin < Math.max(...currentGroup.map(e => e.endMin))) {
      currentGroup.push(ev);
    } else {
      groups.push(currentGroup);
      currentGroup = [ev];
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  for (const group of groups) {
    const columns: number[] = [];
    for (const ev of group) {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (ev.startMin >= columns[c]) {
          ev.col = c;
          columns[c] = ev.endMin;
          placed = true;
          break;
        }
      }
      if (!placed) {
        ev.col = columns.length;
        columns.push(ev.endMin);
      }
    }
    const totalCols = columns.length;
    for (const ev of group) ev.totalCols = totalCols;
  }

  return sorted;
}

const WEEKDAY_NAMES_SHORT = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

/* ───────── Component ───────── */

export const WeeklyCalendar = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const now = new Date();

  const weekStart = useMemo(() => {
    const monday = getMonday(now);
    monday.setDate(monday.getDate() + weekOffset * 7);
    return monday;
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const events = useMemo(() => generateWeekEvents(weekStart), [weekStart]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayStr = formatDateKey(now);

  const weekLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const startMonth = weekStart.toLocaleDateString("pt-BR", { month: "long" });
    const endMonth = end.toLocaleDateString("pt-BR", { month: "long" });
    const year = weekStart.getFullYear();

    if (startMonth === endMonth) {
      return `${weekStart.getDate()} – ${end.getDate()} de ${startMonth} de ${year}`;
    }
    return `${weekStart.getDate()} de ${startMonth} – ${end.getDate()} de ${endMonth} de ${year}`;
  }, [weekStart]);

  return (
    <div className="rounded-2xl glass overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-medium"
            onClick={() => setWeekOffset(0)}
          >
            Hoje
          </Button>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-sm font-semibold text-foreground capitalize">{weekLabel}</h2>
        </div>
        <Link to="/agendamentos" className="text-xs text-primary hover:underline flex items-center gap-0.5">
          Ver agenda completa <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Day headers */}
      <div className="flex border-b border-border">
        {/* Gutter for time labels */}
        <div className="w-14 shrink-0" />
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === now.toDateString();
          return (
            <div
              key={i}
              className={cn(
                "flex-1 text-center py-2 border-l border-border",
                isToday && "bg-primary/5"
              )}
            >
              <p className={cn(
                "text-[10px] uppercase font-medium tracking-wider",
                isToday ? "text-primary" : "text-muted-foreground"
              )}>
                {WEEKDAY_NAMES_SHORT[i]}
              </p>
              <p className={cn(
                "text-lg font-bold leading-none mt-0.5",
                isToday
                  ? "w-8 h-8 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  : "text-foreground"
              )}>
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="relative overflow-y-auto max-h-[520px]">
        <div className="relative flex" style={{ height: `${TIME_SLOTS.length * HOUR_HEIGHT}px` }}>
          {/* Time labels column */}
          <div className="w-14 shrink-0 relative">
            {TIME_SLOTS.map((slot, i) => (
              <span
                key={slot}
                className="absolute right-2 text-[10px] text-muted-foreground font-mono select-none -mt-[7px]"
                style={{ top: `${i * HOUR_HEIGHT}px` }}
              >
                {slot}
              </span>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const dateKey = formatDateKey(day);
            const isToday = dateKey === todayStr;
            const dayEvents = eventsByDate[dateKey] || [];
            const laidOut = layoutEventsForDay(dayEvents);

            return (
              <div
                key={dayIdx}
                className={cn(
                  "flex-1 relative border-l border-border",
                  isToday && "bg-primary/[0.03]"
                )}
              >
                {/* Hour grid lines */}
                {TIME_SLOTS.map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-border"
                    style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Current time indicator */}
                {isToday && currentMinutes >= START_MINUTES && currentMinutes <= END_MINUTES && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    style={{ top: `${((currentMinutes - START_MINUTES) / TOTAL_RANGE) * (TIME_SLOTS.length * HOUR_HEIGHT)}px` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-destructive -ml-1 shrink-0" />
                    <div className="flex-1 h-[2px] bg-destructive" />
                  </div>
                )}

                {/* Events */}
                <div className="absolute inset-0 px-0.5">
                  {laidOut.map((event, evIdx) => {
                    const top = ((event.startMin - START_MINUTES) / TOTAL_RANGE) * (TIME_SLOTS.length * HOUR_HEIGHT);
                    const height = Math.max(
                      ((event.endMin - event.startMin) / TOTAL_RANGE) * (TIME_SLOTS.length * HOUR_HEIGHT),
                      24
                    );
                    const isDone = event.status === "concluída";
                    const colorClass = EVENT_COLORS[(dayIdx * 3 + evIdx) % EVENT_COLORS.length];
                    const colWidth = 100 / event.totalCols;
                    const leftPct = event.col * colWidth;

                    return (
                      <div
                        key={evIdx}
                        className={cn(
                          "absolute z-10 rounded cursor-pointer transition-all hover:shadow-md group",
                          isDone && "opacity-50"
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `calc(${leftPct}% + 1px)`,
                          width: `calc(${colWidth}% - 2px)`,
                        }}
                        title={`${event.name}\n${event.proc}\n${event.time}–${event.endTime}\n${event.sala}`}
                      >
                        <div className={cn("absolute inset-0 rounded", colorClass, "opacity-15")} />
                        <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l", colorClass)} />
                        <div className="relative h-full pl-1.5 pr-1 py-0.5 overflow-hidden">
                          <p className={cn(
                            "text-[10px] font-semibold truncate leading-tight",
                            isDone ? "text-muted-foreground line-through" : "text-foreground"
                          )}>
                            {event.name}
                          </p>
                          {height > 28 && (
                            <p className="text-[9px] text-muted-foreground truncate leading-tight">
                              {event.time}–{event.endTime}
                            </p>
                          )}
                          {height > 44 && (
                            <p className="text-[9px] text-muted-foreground truncate leading-tight">
                              {event.proc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
