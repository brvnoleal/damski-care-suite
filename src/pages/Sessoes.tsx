import { Search, Filter, ShieldCheck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockSessions = [
  { id: "#1247", patient: "Maria Silva", prontuario: "PRN-0001", proc: "Preenchimento Labial", date: "12/02/2026", signed: false },
  { id: "#1246", patient: "Ana Costa", prontuario: "PRN-0003", proc: "Toxina Botulínica", date: "11/02/2026", signed: true },
  { id: "#1245", patient: "João Oliveira", prontuario: "PRN-0002", proc: "Lente de Contato Dental", date: "10/02/2026", signed: false },
  { id: "#1244", patient: "Lucas Mendes", prontuario: "PRN-0006", proc: "Harmonização Facial", date: "09/02/2026", signed: true },
  { id: "#1243", patient: "Pedro Santos", prontuario: "PRN-0004", proc: "Preenchimento Malar", date: "08/02/2026", signed: true },
  { id: "#1242", patient: "Ana Costa", prontuario: "PRN-0003", proc: "Bioestimulador de Colágeno", date: "05/02/2026", signed: true },
];

const Sessoes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sessões / Evoluções</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registro clínico com rastreabilidade completa
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por paciente ou procedimento..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      <div className="space-y-3">
        {mockSessions.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-elegant flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg gradient-burgundy flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary-foreground">
                  {s.patient.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{s.proc}</p>
                <p className="text-xs text-muted-foreground">
                  {s.patient} · <span className="font-mono text-gold-dark">{s.prontuario}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-sm">
              <span className="text-xs text-muted-foreground">{s.date}</span>
              <Badge
                className={
                  s.signed
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-warning/10 text-warning border-warning/20"
                }
              >
                {s.signed ? (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Assinado
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pendente
                  </span>
                )}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">{s.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sessoes;
