import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  once?: boolean;
  className?: string;
}

const directionMap = {
  up: { y: 20 },
  down: { y: -20 },
  left: { x: 20 },
  right: { x: -20 },
  none: {},
};

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 20,
  once = true,
  className,
  ...props
}: FadeInProps) => {
  const dir = directionMap[direction];
  const initial = {
    opacity: 0,
    ...(direction !== "none" && {
      y: dir.y !== undefined ? dir.y * (distance / 20) : 0,
      x: dir.x !== undefined ? dir.x * (distance / 20) : 0,
    }),
  };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({
  children,
  className,
  staggerDelay = 0.1,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
} & Omit<HTMLMotionProps<"div">, "children" | "variants">) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children" | "variants">) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
