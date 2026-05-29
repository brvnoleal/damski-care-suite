import { cn } from "@/lib/utils";
import { getToothType } from "@/lib/fdi";
import type { ToothState } from "@/types";

interface ToothSvgProps {
  fdi: number;
  state: ToothState;
  upper: boolean;
  onClick?: () => void;
}

const stateStyles: Record<ToothState, { fill: string; stroke: string }> = {
  neutro: { fill: "hsl(0 0% 100%)", stroke: "hsl(220 13% 50%)" },
  em_andamento: { fill: "hsl(45 95% 65%)", stroke: "hsl(40 80% 40%)" },
  concluido: { fill: "hsl(142 60% 55%)", stroke: "hsl(142 70% 30%)" },
  removido: { fill: "hsl(0 0% 95%)", stroke: "hsl(220 13% 50%)" },
};

const labelByState: Record<ToothState, string> = {
  neutro: "sem tratamento",
  em_andamento: "tratamento em andamento",
  concluido: "tratamento concluído",
  removido: "removido",
};

export const ToothSvg = ({ fdi, state, upper, onClick }: ToothSvgProps) => {
  const type = getToothType(fdi);
  const { fill, stroke } = stateStyles[state];

  // Desenho simplificado da coroa + raiz por tipo
  const crown =
    type === "incisivo" ? (
      <path d="M 8 22 L 8 6 Q 16 2 24 6 L 24 22 Z" />
    ) : type === "canino" ? (
      <path d="M 8 22 L 8 8 Q 16 -2 24 8 L 24 22 Z" />
    ) : type === "premolar" ? (
      <path d="M 6 22 L 7 8 Q 11 4 16 6 Q 21 4 25 8 L 26 22 Z" />
    ) : (
      <path d="M 4 22 L 5 8 Q 9 3 12 7 Q 16 3 20 7 Q 23 3 27 8 L 28 22 Z" />
    );

  const root =
    type === "molar" ? (
      <>
        <path d="M 6 22 L 4 38 Q 8 42 12 38 L 11 22 Z" />
        <path d="M 21 22 L 20 38 Q 24 42 28 38 L 26 22 Z" />
      </>
    ) : type === "premolar" ? (
      <>
        <path d="M 8 22 L 7 38 Q 11 42 14 38 L 14 22 Z" />
        <path d="M 18 22 L 18 38 Q 21 42 25 38 L 24 22 Z" />
      </>
    ) : (
      <path d="M 10 22 L 8 40 Q 16 44 24 40 L 22 22 Z" />
    );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Dente ${fdi} — ${labelByState[state]}`}
      title={`Dente ${fdi}`}
      className={cn(
        "group flex flex-col items-center gap-1 p-1 rounded-md transition-all",
        "hover:bg-accent/40 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
      )}
    >
      {upper && (
        <span className="text-[10px] font-mono text-muted-foreground leading-none">{fdi}</span>
      )}
      <svg
        viewBox="0 0 32 46"
        width={28}
        height={42}
        className="overflow-visible"
        style={upper ? undefined : { transform: "rotate(180deg)" }}
      >
        <g fill={fill} stroke={stroke} strokeWidth={1.2} strokeLinejoin="round">
          {crown}
          {root}
        </g>
        {state === "removido" && (
          <g stroke="hsl(0 84% 55%)" strokeWidth={3} strokeLinecap="round">
            <line x1="4" y1="4" x2="28" y2="42" />
            <line x1="28" y1="4" x2="4" y2="42" />
          </g>
        )}
      </svg>
      {!upper && (
        <span className="text-[10px] font-mono text-muted-foreground leading-none">{fdi}</span>
      )}
    </button>
  );
};
