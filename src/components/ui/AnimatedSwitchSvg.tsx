import { useEffect, useRef } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { DotLottie } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";

interface AnimatedSwitchSvgProps {
  className?: string;
  checked?: boolean;
}

/**
 * Animated switch using a Lottie animation.
 * Plays forward when `checked` toggles on, reverses when toggled off.
 */
export const AnimatedSwitchSvg = ({ className, checked }: AnimatedSwitchSvgProps) => {
  const dotLottieRef = useRef<DotLottie | null>(null);
  const prevChecked = useRef<boolean | undefined>(checked);

  useEffect(() => {
    const instance = dotLottieRef.current;
    if (!instance) return;
    if (prevChecked.current === checked) return;
    prevChecked.current = checked;
    try {
      instance.setMode(checked ? "forward" : "reverse");
      instance.play();
    } catch {
      /* noop */
    }
  }, [checked]);

  return (
    <div className={cn("block w-full h-full", className)}>
      <DotLottieReact
        src="https://lottie.host/de21b8a8-3fb3-4bcb-8584-d925c342654d/jzJsRUNXB4.lottie"
        autoplay
        loop={false}
        dotLottieRefCallback={(instance) => {
          dotLottieRef.current = instance;
        }}
      />
    </div>
  );
};
