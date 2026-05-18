import { useEffect, useState, useMemo } from "react";
import { Search, Filter, ShieldCheck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sessaoService, type SessaoComPaciente } from "@/services/sessaoService";
import { toast } from "@/hooks/use-toast";

const formatDateBR = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const Sessoes = () => {
  const [items, setItems] = useState<SessaoComPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await sessaoService.listar();
        setItems(data);
      } catch {
        toast({ title: "Erro ao carregar sessões", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) =>
        s.procedimento.toLowerCase().includes(q) ||
        (s.paciente_nome || "").toLowerCase().includes(q),
    );
  }, [items, search]);

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
          <Input
            placeholder="Buscar por paciente ou procedimento..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      <div className="space-y-3">
        {loading && (
          <p className="text-sm text-muted-foreground">Carregando sessões...</p>
        )}
        {!loading && filtered.length === 0 && (
          <div className="rounded-xl glass p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma sessão registrada ainda.
            </p>
          </div>
        )}
        {filtered.map((s) => {
          const initials = (s.paciente_nome || "??")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div
              key={s.id}
              className="rounded-xl glass p-4 sm:p-5 shadow-elegant flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">
                    {initials}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {s.procedimento}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.paciente_nome || "Paciente"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-sm">
                <span className="text-xs text-muted-foreground">
                  {formatDateBR(s.data)}
                </span>
                <Badge
                  className={
                    s.assinado
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-warning/10 text-warning border-warning/20"
                  }
                >
                  {s.assinado ? (
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sessoes;
