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
    <section className={cn("py-8 md:py-12", className)}>
      <div className="mx-auto max-w-5xl px-6">
        {title && (
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
        )}
        {description && (
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <Card className="mt-6 grid gap-6 border-border/70 bg-card p-8 shadow-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={`${s.label}-${i}`} className="text-center">
              <div className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {s.value}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              {s.hint && (
                <p className="mt-1 text-xs text-muted-foreground/80">{s.hint}</p>
              )}
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
