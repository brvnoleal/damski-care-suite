import { useState, useSyncExternalStore, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, LayoutGroup } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarDays,
  Calendar,
  Package,
  DollarSign,
  Settings,
  Menu,
  X,
  Bell,
  CheckCheck,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationStore } from "@/stores/notificationStore";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useClinicaContext } from "@/hooks/useClinicaContext";
import { Building2 } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Consultas", href: "/agendamentos", icon: CalendarDays },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Dentistas", href: "/dentistas", icon: UserCog },
  { name: "Insumos", href: "/insumos", icon: Package },
  { name: "Relatórios", href: "/financeiro", icon: DollarSign },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem("sidebar_collapsed") === "1");

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperAdmin } = useClinicaContext();

  const handleLogout = async () => {
    setSidebarOpen(false);
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const notifications = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getSnapshot
  );
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const navItems = isSuperAdmin
    ? [...navigation, { name: "Clínicas", href: "/super-admin", icon: Building2 }]
    : navigation;

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — clean white surface */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 lg:relative lg:translate-x-0 lg:z-auto shrink-0",
          "glass-sidebar text-sidebar-foreground",
          collapsed ? "lg:w-[72px] w-[260px]" : "w-[260px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar toggle + mobile close */}
        <div className={cn(
          "flex items-center h-14 border-b border-sidebar-border",
          collapsed ? "lg:px-2 px-5 lg:justify-center justify-between" : "px-5 lg:px-3 justify-between"
        )}>
          <button
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <TooltipProvider delayDuration={200}>
          <LayoutGroup id="sidebar-nav">
            <nav className={cn("flex-1 py-4 space-y-1 overflow-y-auto", collapsed ? "lg:px-2 px-3" : "px-3")}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const link = (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="relative"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-2xl bg-sidebar-accent shadow-[0_1px_2px_0_rgba(17,17,17,0.04),0_4px_12px_-6px_rgba(17,17,17,0.08)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
                      />
                    )}
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors duration-200",
                        collapsed && "lg:justify-center lg:px-2",
                        isActive
                          ? "text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground font-medium"
                      )}
                    >
                      <item.icon className={cn("w-[18px] h-[18px] shrink-0 transition-transform duration-200", isActive && "scale-110")} />
                      <span className={cn(collapsed && "lg:hidden")}>{item.name}</span>
                    </Link>
                  </motion.div>
                );
                return collapsed ? (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  </Tooltip>
                ) : (
                  link
                );
              })}

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    onClick={handleLogout}
                    className={cn(
                      "w-full mt-2 pt-3 border-t border-sidebar-border flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors",
                      collapsed && "lg:justify-center lg:px-2"
                    )}
                  >
                    <LogOut className="w-[18px] h-[18px] shrink-0" />
                    <span className={cn(collapsed && "lg:hidden")}>Sair</span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right">Sair</TooltipContent>
              </Tooltip>
            </nav>
          </LayoutGroup>
        </TooltipProvider>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar — clean white, centered search in available space */}
        <header className="sticky top-0 z-30 px-4 lg:px-6 h-14 glass-header flex items-center gap-4">
          <div className="flex justify-center px-2 max-w-md w-full">
            <GlobalSearch />
          </div>

          <div className="flex items-center justify-end gap-4 ml-auto">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative text-muted-foreground hover:text-foreground transition-colors">
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
                            "px-4 py-3 cursor-pointer hover:bg-muted transition-colors",
                            !n.read && "bg-accent/30"
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

            <button
              onClick={() => navigate("/configuracoes")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Configurações"
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </div>
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
