import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type PeriodoValue = "30" | "90" | "365" | "all" | "custom";

interface PeriodoFilterProps {
  periodo: PeriodoValue;
  onPeriodoChange: (v: PeriodoValue) => void;
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (v: string) => void;
  onDataFimChange: (v: string) => void;
}

export const PeriodoFilter = ({
  periodo,
  onPeriodoChange,
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
}: PeriodoFilterProps) => (
  <div className="flex flex-wrap gap-2 items-center">
    <Select value={periodo} onValueChange={(v) => onPeriodoChange(v as PeriodoValue)}>
      <SelectTrigger className="w-[170px] h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="30">Últimos 30 dias</SelectItem>
        <SelectItem value="90">Últimos 90 dias</SelectItem>
        <SelectItem value="365">Último ano</SelectItem>
        <SelectItem value="all">Tudo</SelectItem>
        <SelectItem value="custom">Personalizado</SelectItem>
      </SelectContent>
    </Select>
    {periodo === "custom" && (
      <>
        <Input
          type="date"
          value={dataInicio}
          onChange={(e) => onDataInicioChange(e.target.value)}
          className="h-9 w-[150px] text-sm"
          aria-label="Data inicial"
        />
        <span className="text-xs text-muted-foreground">até</span>
        <Input
          type="date"
          value={dataFim}
          onChange={(e) => onDataFimChange(e.target.value)}
          className="h-9 w-[150px] text-sm"
          aria-label="Data final"
        />
      </>
    )}
  </div>
);

export const filtrarPorPeriodo = <T extends Record<string, any>>(
  items: T[],
  campoData: keyof T,
  periodo: PeriodoValue,
  dataInicio: string,
  dataFim: string,
): T[] => {
  if (periodo === "custom") {
    return items.filter((i) => {
      const v = i[campoData] as string;
      if (!v) return false;
      if (dataInicio && v < dataInicio) return false;
      if (dataFim && v > dataFim) return false;
      return true;
    });
  }
  if (periodo === "all") return items;
  const days = Number(periodo);
  const d = new Date();
  d.setDate(d.getDate() - days);
  const cutoff = d.toISOString().slice(0, 10);
  return items.filter((i) => {
    const v = i[campoData] as string;
    return !v || v >= cutoff;
  });
};
