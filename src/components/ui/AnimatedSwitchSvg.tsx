import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";

interface AnimatedSwitchSvgProps {
  className?: string;
}

export const AnimatedSwitchSvg = ({ className }: AnimatedSwitchSvgProps) => {
  return (
    <DotLottieReact
      src="https://lottie.host/de21b8a8-3fb3-4bcb-8584-d925c342654d/jzJsRUNXB4.lottie"
      loop
      autoplay
      className={cn("w-full h-full", className)}
      style={{ width: "100%", height: "100%" }}
    />
  );
};
