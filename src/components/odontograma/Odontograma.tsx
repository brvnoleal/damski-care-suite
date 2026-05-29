import { useEffect, useMemo, useState } from "react";
import { ToothSvg } from "./ToothSvg";
import { ToothProcedureDialog } from "./ToothProcedureDialog";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import {
  UPPER_PERMANENT,
  LOWER_PERMANENT,
  UPPER_DECIDUO,
  LOWER_DECIDUO,
} from "@/lib/fdi";
import { computeToothStates, odontogramaService } from "@/services/odontogramaService";
import type { OdontogramaProcedimento, ToothState } from "@/types";

interface OdontogramaProps {
  pacienteId: string;
}

type Modo = "permanente" | "deciduo";

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span className="w-3 h-3 rounded-sm border border-border" style={{ background: color }} />
    {label}
  </div>
);

export const Odontograma = ({ pacienteId }: OdontogramaProps) => {
  const [modo, setModo] = useState<Modo>("permanente");
  const [procedimentos, setProcedimentos] = useState<OdontogramaProcedimento[]>([]);
  const [selectedDente, setSelectedDente] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const reload = async () => {
    try {
      const data = await odontogramaService.listarPorPaciente(pacienteId);
      setProcedimentos(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    reload();
  }, [pacienteId]);

  const states = useMemo(() => computeToothStates(procedimentos), [procedimentos]);
  const stateOf = (fdi: number): ToothState => states[fdi] || "neutro";

  const upper = modo === "permanente" ? UPPER_PERMANENT : UPPER_DECIDUO;
  const lower = modo === "permanente" ? LOWER_PERMANENT : LOWER_DECIDUO;

  const handleClick = (fdi: number) => {
    setSelectedDente(fdi);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex rounded-md bg-muted p-1">
          <Button
            type="button"
            size="sm"
            variant={modo === "permanente" ? "default" : "ghost"}
            onClick={() => setModo("permanente")}
          >
            Dentes Permanentes
          </Button>
          <Button
            type="button"
            size="sm"
            variant={modo === "deciduo" ? "default" : "ghost"}
            onClick={() => setModo("deciduo")}
          >
            Dentes Decíduos
          </Button>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <LegendItem color="hsl(0 0% 100%)" label="Sem tratamento" />
          <LegendItem color="hsl(45 95% 65%)" label="Em andamento" />
          <LegendItem color="hsl(142 60% 55%)" label="Concluído" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-destructive font-bold text-base leading-none">✕</span>
            Removido
          </div>
        </div>
      </div>

      <LiquidGlassCard draggable={false} className="p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-fit mx-auto space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground text-center mb-2">Arco Superior</p>
            <div className="flex justify-center gap-0.5">
              {upper.map((fdi) => (
                <ToothSvg
                  key={fdi}
                  fdi={fdi}
                  state={stateOf(fdi)}
                  upper
                  onClick={() => handleClick(fdi)}
                />
              ))}
            </div>
          </div>
          <div className="border-t border-dashed border-border" />
          <div>
            <div className="flex justify-center gap-0.5">
              {lower.map((fdi) => (
                <ToothSvg
                  key={fdi}
                  fdi={fdi}
                  state={stateOf(fdi)}
                  upper={false}
                  onClick={() => handleClick(fdi)}
                />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground text-center mt-2">Arco Inferior</p>
          </div>
        </div>
      </LiquidGlassCard>

      <ToothProcedureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pacienteId={pacienteId}
        dente={selectedDente}
        onChange={reload}
      />
    </div>
  );
};
