/**
 * Botão de exportação padrão do sistema — apenas ícone, com tooltip.
 * Segue o modelo utilizado na aba Relatórios.
 */
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExportButtonProps {
  onExport: () => void | Promise<void>;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  className?: string;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "icon";
}

export const ExportButton = ({
  onExport,
  disabled,
  label = "Exportar dados",
  tooltip = "Baixar planilha (Excel)",
  className,
  variant = "outline",
  size = "icon",
}: ExportButtonProps) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={disabled}
          onClick={() => onExport()}
          aria-label={label}
          title={tooltip}
          className={className}
        >
          <Download className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default ExportButton;
