import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Neumorphic toggle switch (Uiverse "mobinkakei" style).
 * Drop-in substitute for shadcn <Switch /> on screens where the soft neumorphic
 * look is desired. Controlled API mirrors Radix Switch: `checked` + `onCheckedChange`.
 */
export interface NeuToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "size"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
}

export const NeuToggle = React.forwardRef<HTMLInputElement, NeuToggleProps>(
  ({ checked, defaultChecked, onCheckedChange, label, className, disabled, ...rest }, ref) => {
    return (
      <label
        className={cn(
          "inline-flex items-center cursor-pointer text-foreground select-none",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <span className="neu-toggle">
          <input
            ref={ref}
            type="checkbox"
            className="neu-toggle-state"
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            {...rest}
          />
          <span className="neu-toggle-indicator" />
        </span>
        {label != null && <span className="ml-3 text-sm">{label}</span>}
      </label>
    );
  },
);
NeuToggle.displayName = "NeuToggle";
