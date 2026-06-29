import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatedSwitchSvg } from "./AnimatedSwitchSvg";

/**
 * Animated switch button (SVG-based, iOS-style toggle).
 * Drop-in substitute for shadcn <Switch />. Controlled API mirrors Radix Switch:
 * `checked` + `onCheckedChange`.
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
        <span className="relative inline-flex items-center w-[56px] h-[34px] shrink-0">
          <input
            ref={ref}
            type="checkbox"
            className="peer absolute inset-0 z-10 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            {...rest}
          />
          <span className="absolute inset-0 pointer-events-none">
            <AnimatedSwitchSvg className="w-full h-full" checked={checked ?? defaultChecked} />
          </span>
        </span>
        {label != null && <span className="ml-3 text-sm">{label}</span>}
      </label>
    );
  },
);
NeuToggle.displayName = "NeuToggle";

