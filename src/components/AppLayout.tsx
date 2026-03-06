import { useState, useEffect, useSyncExternalStore } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarDays,
  FileText,
  Package,
  DollarSign,
  Shield,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  CheckCheck,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationStore } from "@/stores/notificationStore";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";


interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Dentistas", href: "/dentistas", icon: UserCog },
  { name: "Consultas", href: "/agendamentos", icon: CalendarDays },
  
  { name: "Insumos", href: "/insumos", icon: Package },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const notifications = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getSnapshot
  );
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="h-screen flex overflow-hidden relative">


      {/* Hidden SVG Filter for sidebar/header glass */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="sidebar-glass-distortion">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Liquid Glass */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          "relative overflow-hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Glass layers */}
        <div
          className="pointer-events-none absolute inset-0 backdrop-blur-xl"
          style={{ filter: "url(#sidebar-glass-distortion)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: darkMode
              ? "linear-gradient(180deg, rgba(15, 20, 40, 0.85) 0%, rgba(10, 14, 30, 0.9) 100%)"
              : "linear-gradient(180deg, rgba(15, 20, 40, 0.78) 0%, rgba(10, 14, 30, 0.85) 100%)",
            boxShadow: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 24px rgba(255, 255, 255, 0.06)",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "inset 1px 1px 2px 0 rgba(255, 255, 255, 0.08), inset -1px -1px 2px 0 rgba(255, 255, 255, 0.04)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-sm text-primary-foreground">D</span>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-[15px] font-semibold text-sidebar-foreground">
              Damski Odonto
            </h1>
          </div>
          <button
            className="lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/[0.1] text-sidebar-foreground backdrop-blur-sm"
                    : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/[0.06]"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="relative z-10 p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">DR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Dra. Damski
              </p>
              <p className="text-[11px] text-sidebar-foreground/40">
                Responsável Técnico
              </p>
            </div>
            <LogOut className="w-4 h-4 text-sidebar-foreground/30 cursor-pointer hover:text-sidebar-foreground/60 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar — Liquid Glass */}
        <header className="sticky top-0 z-30 relative px-4 lg:px-6 h-14 flex items-center gap-4 overflow-hidden">
          {/* Glass layers */}
          <div
            className="pointer-events-none absolute inset-0 backdrop-blur-xl"
            style={{ filter: "url(#sidebar-glass-distortion)" }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: darkMode
                ? "linear-gradient(90deg, rgba(30, 35, 55, 0.7) 0%, rgba(30, 35, 55, 0.5) 100%)"
                : "linear-gradient(90deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.4) 100%)",
              boxShadow: "0 4px 4px rgba(0, 0, 0, 0.05), 0 0 16px rgba(255, 255, 255, 0.06)",
              borderBottom: darkMode ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(255, 255, 255, 0.3)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow: darkMode
                ? "inset 0 1px 1px 0 rgba(255, 255, 255, 0.04)"
                : "inset 0 1px 2px 0 rgba(255, 255, 255, 0.35)",
            }}
          />

          <button
            className="relative z-10 lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Dark mode toggle */}
          <button
            className="relative z-10 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Modo claro" : "Modo escuro"}
          >
            {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button className="relative z-10 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[360px] p-0" sideOffset={8}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 gap-1 text-muted-foreground"
                    onClick={() => notificationStore.markAllRead()}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Marcar lidas
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-border">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhuma notificação.</p>
                  ) : (
                    notifications.slice(0, 20).map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors",
                          !n.read && "bg-primary/5"
                        )}
                        onClick={() => notificationStore.markRead(n.id)}
                      >
                        <div className="flex gap-3">
                          <span className="text-base shrink-0 leading-none mt-0.5">{notificationStore.getIcon(n.type)}</span>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("text-sm leading-snug", !n.read ? "font-semibold text-foreground" : "text-foreground")}>
                                {n.title}
                              </p>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{n.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                {notificationStore.getModuleLabel(n.module)}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Badge variant="outline" className="relative z-10 text-[11px] font-medium hidden sm:flex">
            RDC 1.002/2025
          </Badge>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
