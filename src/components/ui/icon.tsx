import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tamanhos padronizados de ícones do sistema.
 * Use SEMPRE este componente (ou o hook `iconSizeClass`) para garantir
 * consistência visual entre todas as telas.
 *
 * | size  | classe        | px    | uso                                         |
 * |-------|---------------|-------|---------------------------------------------|
 * | xs    | w-3 h-3       | 12px  | badges, micro-rótulos                       |
 * | sm    | w-4 h-4       | 16px  | botões, inputs, inline com texto (padrão)   |
 * | md    | w-[18px] h-[18px] | 18px | navegação (sidebar)                       |
 * | lg    | w-5 h-5       | 20px  | cabeçalhos de Card, KPIs                    |
 * | xl    | w-6 h-6       | 24px  | destaques                                   |
 * | 2xl   | w-8 h-8       | 32px  | hero / seções                               |
 * | empty | w-12 h-12     | 48px  | empty states / ilustrações                  |
 */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "empty";

export const iconSizeClass: Record<IconSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-[18px] h-[18px]",
  lg: "w-5 h-5",
  xl: "w-6 h-6",
  "2xl": "w-8 h-8",
  empty: "w-12 h-12",
};

export interface IconProps extends Omit<LucideProps, "size"> {
  icon: LucideIcon;
  size?: IconSize;
}

/**
 * Wrapper padronizado para ícones do lucide-react.
 *
 * @example
 * <Icon icon={Search} size="sm" className="text-muted-foreground" />
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: LucideIconComp, size = "sm", className, ...props }, ref) => {
    return (
      <LucideIconComp
        ref={ref}
        className={cn(iconSizeClass[size], "shrink-0", className)}
        {...props}
      />
    );
  },
);
Icon.displayName = "Icon";
