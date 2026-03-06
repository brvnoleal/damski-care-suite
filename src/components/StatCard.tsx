import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import React, { useRef, useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "gold" | "warning" | "success";
  hoverContent?: React.ReactNode;
}

const iconStyles = {
  default: "bg-primary/10 text-primary",
  gold: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default", hoverContent }: StatCardProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);

  useEffect(() => {
    if (!triggerRef.current || !hoverContent) return;
    const update = () => setTriggerWidth(triggerRef.current?.offsetWidth ?? 0);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [hoverContent]);

  const card = (
    <div ref={triggerRef}>
      <LiquidGlassCard className="p-5 cursor-default" draggable={false}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[13px] text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <p className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );

  if (!hoverContent) return card;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>{card}</HoverCardTrigger>
      <HoverCardContent
        className="p-0 animate-fade-in"
        side="bottom"
        align="start"
        sideOffset={8}
        avoidCollisions={false}
        style={{ width: triggerWidth > 0 ? triggerWidth : undefined }}
      >
        {hoverContent}
      </HoverCardContent>
    </HoverCard>
  );
};

export default StatCard;
