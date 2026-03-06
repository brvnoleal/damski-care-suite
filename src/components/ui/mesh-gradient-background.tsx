import { cn } from "@/lib/utils"

export interface MeshGradientBackgroundProps {
  className?: string
  children?: React.ReactNode
  colors?: string[]
  speed?: number
  backgroundColor?: string
}

export function MeshGradientBackground({
  className,
  children,
  colors = ["#7c3aed", "#2563eb", "#06b6d4", "#8b5cf6"],
  speed = 1,
  backgroundColor = "#030014",
}: MeshGradientBackgroundProps) {
  const duration1 = 60 / speed
  const duration2 = 80 / speed
  const duration3 = 90 / speed
  const duration4 = 70 / speed

  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor }}>
        <div
          className="absolute -left-1/4 -top-1/4 h-[70%] w-[70%] rounded-full opacity-30 blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
            animation: `meshMove1 ${duration1}s ease-in-out infinite`,
          }}
        />
        <div
          className="absolute -right-1/4 -top-1/4 h-[65%] w-[65%] rounded-full opacity-25 blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`,
            animation: `meshMove2 ${duration2}s ease-in-out infinite`,
          }}
        />
        <div
          className="absolute -bottom-1/4 left-1/4 h-[60%] w-[60%] rounded-full opacity-30 blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)`,
            animation: `meshMove3 ${duration3}s ease-in-out infinite`,
          }}
        />
        <div
          className="absolute left-1/3 top-1/3 h-[50%] w-[50%] rounded-full opacity-20 blur-[100px]"
          style={{
            background: `radial-gradient(circle, ${colors[3]} 0%, transparent 70%)`,
            animation: `meshMove4 ${duration4}s ease-in-out infinite`,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {children && <div className="relative z-10">{children}</div>}

      <style>{`
        @keyframes meshMove1 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(5%, 10%) scale(1.05); }
          50% { transform: translate(10%, 5%) scale(0.95); }
          75% { transform: translate(5%, -5%) scale(1.02); }
        }
        @keyframes meshMove2 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(-10%, 8%) scale(1.08); }
          66% { transform: translate(-5%, -5%) scale(0.95); }
        }
        @keyframes meshMove3 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          50% { transform: translate(-8%, -10%) scale(1.1); }
        }
        @keyframes meshMove4 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(15%, -10%) scale(0.9); }
          50% { transform: translate(-10%, 15%) scale(1.1); }
          75% { transform: translate(-15%, -5%) scale(0.95); }
        }
      `}</style>
    </div>
  )
}
