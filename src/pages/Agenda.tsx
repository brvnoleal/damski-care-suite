import { CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
});

const Agenda = () => {
  return (
    <div className="space-y-4 sm:space-y-5 h-full">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Agenda da Clínica</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Visualize e gerencie os compromissos da clínica
        </p>
      </motion.div>

      <motion.div {...fadeUp(0.1)} className="h-[calc(100vh-180px)] min-h-[500px]">
        <LiquidGlassCard className="overflow-hidden h-full flex flex-col" draggable={false}>
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/10">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h2 className="text-xs sm:text-sm font-semibold text-foreground">Calendário Google</h2>
          </div>
          <div className="flex-1 p-2 sm:p-3">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=brunolealcavalcante%40gmail.com&ctz=America%2FSao_Paulo"
              className="w-full h-full rounded-md border-0 dark:invert dark:hue-rotate-180"
              scrolling="no"
              title="Google Calendar"
            />
          </div>
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
};

export default Agenda;
