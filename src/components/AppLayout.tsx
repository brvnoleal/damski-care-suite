import { useState, useEffect, useSyncExternalStore } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarDays,
  Package,
  DollarSign,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, role, signOut, user } = useAuth();
  const navigate = useNavigate();
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
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Hidden SVG Filter for glass */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="sidebar-glass-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Top Navigation Bar — Liquid Glass */}
      <header className="sticky top-0 z-50 relative overflow-hidden shrink-0">
        {/* Glass layers */}
        <div
          className="pointer-events-none absolute inset-0 backdrop-blur-xl"
          style={{ filter: "url(#sidebar-glass-distortion)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: darkMode
              ? "linear-gradient(90deg, rgba(15, 20, 40, 0.85) 0%, rgba(10, 14, 30, 0.9) 100%)"
              : "linear-gradient(90deg, rgba(15, 20, 40, 0.78) 0%, rgba(10, 14, 30, 0.85) 100%)",
            boxShadow: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 24px rgba(255, 255, 255, 0.06)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "inset 0 1px 2px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 2px 0 rgba(255, 255, 255, 0.04)",
          }}
        />

        {/* Main nav row */}
        <div className="relative z-10 flex items-center h-14 px-4 lg:px-6 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-sm text-primary-foreground">D</span>
            </div>
            <h1 className="font-display text-[15px] font-semibold text-sidebar-foreground hidden sm:block">
              Damski Odonto
            </h1>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-white/[0.12] text-sidebar-foreground"
                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/[0.06]"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Modo claro" : "Modo escuro"}
            >
              {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button className="relative text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
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

            <Badge variant="outline" className="text-[11px] font-medium hidden sm:flex border-white/10 text-sidebar-foreground/50">
              RDC 1.002/2025
            </Badge>

            {/* User avatar + logout */}
            <div className="hidden lg:flex items-center gap-2.5 ml-2 pl-3 border-l border-white/[0.08]">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-primary">
                  {(profile?.nome || user?.email || "U").substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate max-w-[120px]">
                  {profile?.nome || user?.email || "Usuário"}
                </p>
                <p className="text-[10px] text-sidebar-foreground/40">
                  {role === "admin" ? "Admin" : role === "responsavel_tecnico" ? "Resp. Técnico" : role === "recepcionista" ? "Recepcionista" : "—"}
                </p>
              </div>
              <LogOut
                className="w-4 h-4 text-sidebar-foreground/30 cursor-pointer hover:text-sidebar-foreground/60 transition-colors shrink-0"
                onClick={async () => {
                  await signOut();
                  navigate("/auth");
                }}
              />
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="relative z-10 lg:hidden border-t border-white/[0.06] px-4 py-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-white/[0.1] text-sidebar-foreground"
                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/[0.06]"
                  )}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile user section */}
            <div className="pt-3 mt-2 border-t border-white/[0.06] flex items-center gap-3 px-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-primary">
                  {(profile?.nome || user?.email || "U").substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {profile?.nome || user?.email || "Usuário"}
                </p>
              </div>
              <LogOut
                className="w-4 h-4 text-sidebar-foreground/30 cursor-pointer hover:text-sidebar-foreground/60 transition-colors"
                onClick={async () => {
                  await signOut();
                  navigate("/auth");
                }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
