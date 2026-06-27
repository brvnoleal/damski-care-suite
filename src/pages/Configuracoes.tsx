import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Switch } from "@/components/ui/switch";
import PerfilConsultorio from "@/components/configuracoes/PerfilConsultorio";
import MaquininhasSection from "@/components/configuracoes/MaquininhasSection";
import { FadeIn } from "@/components/FadeIn";
import { alertPrefs, type AlertKey, type AlertPrefs } from "@/lib/configuracoesPrefs";

const ALERTAS: { key: AlertKey; label: string }[] = [
  { key: "insumos_vencimento", label: "Vencimento de insumos (15 dias)" },
  { key: "assinaturas_pendentes", label: "Sessões pendentes de assinatura" },
  { key: "campos_obrigatorios", label: "Campos obrigatórios não preenchidos" },
];

const Configuracoes = () => {
  const [prefs, setPrefs] = useState<AlertPrefs>(() => alertPrefs.load());

  useEffect(() => {
    alertPrefs.save(prefs);
  }, [prefs]);

  const setToggle = (key: AlertKey, value: boolean) =>
    setPrefs((p) => ({ ...p, toggles: { ...p.toggles, [key]: value } }));

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">Preferências e parâmetros do sistema</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerfilConsultorio />

          {/* Notifications */}
          <LiquidGlassCard draggable={false} className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-foreground">Alertas Automáticos</h2>
                  <p className="text-xs text-muted-foreground">
                    Ative ou desative as notificações do sistema.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div>
                  <p className="text-sm font-medium text-foreground">Pausar todas as notificações</p>
                  <p className="text-xs text-muted-foreground">
                    Quando ativado, nenhum alerta automático será gerado.
                  </p>
                </div>
                <Switch
                  checked={prefs.pausarTodas}
                  onCheckedChange={(v) => setPrefs((p) => ({ ...p, pausarTodas: v }))}
                />
              </div>

              <div className="space-y-1">
                {ALERTAS.map((a) => (
                  <div
                    key={a.key}
                    className="flex items-center justify-between py-2 px-1 text-sm border-b border-border/40 last:border-0"
                  >
                    <span
                      className={
                        prefs.pausarTodas ? "text-muted-foreground line-through" : "text-foreground"
                      }
                    >
                      {a.label}
                    </span>
                    <Switch
                      checked={!prefs.pausarTodas && prefs.toggles[a.key] !== false}
                      disabled={prefs.pausarTodas}
                      onCheckedChange={(v) => setToggle(a.key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </LiquidGlassCard>

          <MaquininhasSection />
        </div>
      </FadeIn>
    </div>
  );
};

export default Configuracoes;
