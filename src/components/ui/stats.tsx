import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type Stat = {
  value: string;
  label: string;
  hint?: string;
  icon?: LucideIcon;
};

interface StatsSectionProps {
  stats: Stat[];
  title?: string;
  description?: string;
  className?: string;
}

export default function StatsSection({ stats, title, description, className }: StatsSectionProps) {
  return (
    <section className={cn("w-full", className)}>
      {(title || description) && (
        <div className="mx-auto max-w-2xl text-center mb-6">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <Card className="border-border/70 bg-card shadow-sm rounded-[var(--radius)] overflow-hidden">
        <div
          className={cn(
            "grid divide-y divide-border sm:divide-y-0 sm:divide-x",
            stats.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3",
          )}
        >
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={`${s.label}-${i}`}
                className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-6 sm:py-8"
              >
                {Icon && (
                  <div className="mb-2 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                )}
                <div className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                  {s.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {s.label}
                </div>
                {s.hint && (
                  <div className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground/80">
                    {s.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
