import { useEffect, useState } from "react";
import { Search, User, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PacienteResult {
  id: string;
  nome: string;
}
interface ConsultaResult {
  id: string;
  data: string;
  horario: string | null;
  paciente_nome: string | null;
}

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [pacientes, setPacientes] = useState<PacienteResult[]>([]);
  const [consultas, setConsultas] = useState<ConsultaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setPacientes([]);
      setConsultas([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const [pacRes, consRes] = await Promise.all([
        supabase
          .from("paciente")
          .select("id, nome")
          .ilike("nome", `%${term}%`)
          .limit(5),
        supabase
          .from("agendamento")
          .select("id, data, horario, paciente:paciente_id(nome)")
          .ilike("paciente.nome", `%${term}%`)
          .order("data", { ascending: false })
          .limit(5),
      ]);
      if (cancelled) return;
      setPacientes((pacRes.data as any) || []);
      setConsultas(
        ((consRes.data as any[]) || [])
          .filter((c) => c.paciente)
          .map((c) => ({
            id: c.id,
            data: c.data,
            horario: c.horario,
            paciente_nome: c.paciente?.nome ?? null,
          }))
      );
      setLoading(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const showResults = open && query.trim().length >= 2;
  const empty =
    !loading && pacientes.length === 0 && consultas.length === 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <Popover open={showResults} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar paciente ou consulta..."
              className="w-full h-9 pl-9 pr-3 rounded-md bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-colors"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          sideOffset={6}
          className="w-[min(28rem,calc(100vw-2rem))] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[360px] overflow-y-auto py-2">
            {loading && (
              <p className="px-4 py-3 text-xs text-muted-foreground">Buscando...</p>
            )}
            {!loading && empty && (
              <p className="px-4 py-3 text-xs text-muted-foreground">
                Nenhum resultado encontrado.
              </p>
            )}
            {pacientes.length > 0 && (
              <div className="px-2 pb-2">
                <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Pacientes
                </p>
                {pacientes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      navigate(`/pacientes?id=${p.id}`);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-foreground hover:bg-accent text-left"
                  >
                    <User className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{p.nome}</span>
                  </button>
                ))}
              </div>
            )}
            {consultas.length > 0 && (
              <div className="px-2 pb-2 border-t border-border pt-2">
                <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Consultas
                </p>
                {consultas.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      navigate(`/agendamentos?id=${c.id}`);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-foreground hover:bg-accent text-left"
                  >
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">
                      {c.paciente_nome ?? "Paciente"} —{" "}
                      {new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR")}
                      {c.horario ? ` ${c.horario.slice(0, 5)}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GlobalSearch;
