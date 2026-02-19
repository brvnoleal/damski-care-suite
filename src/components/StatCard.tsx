import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "gold" | "warning" | "success";
}

const variantStyles = {
  default: "bg-card border-border",
  gold: "bg-card border-primary/20",
  warning: "bg-card border-warning/20",
  success: "bg-card border-success/20",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  gold: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) => (
  <div className={cn("rounded-xl border p-5 shadow-elegant transition-all hover:shadow-lg", variantStyles[variant])}>
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
  </div>
);

export default StatCard;
