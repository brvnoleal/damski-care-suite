import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, FileWarning, Package } from "lucide-react";

export type AlertType = "expiry" | "signature" | "compliance" | "general";

interface AlertCardProps {
  type: AlertType;
  title: string;
  description: string;
  time?: string;
}

const alertConfig = {
  expiry: { icon: Package, className: "border-l-warning bg-warning/5" },
  signature: { icon: Clock, className: "border-l-info bg-info/5" },
  compliance: { icon: AlertTriangle, className: "border-l-destructive bg-destructive/5" },
  general: { icon: FileWarning, className: "border-l-muted-foreground bg-muted/50" },
};

const AlertCard = ({ type, title, description, time }: AlertCardProps) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("border-l-4 rounded-r-lg p-3.5 flex items-start gap-3", config.className)}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {time && <span className="text-[11px] text-muted-foreground whitespace-nowrap">{time}</span>}
    </div>
  );
};

export default AlertCard;
