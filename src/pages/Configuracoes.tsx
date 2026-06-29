import { useEffect, useState } from "react";
import { Bell, Building2, CreditCard, ClipboardList, UserCog, FileText, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { NeuToggle } from "@/components/ui/neu-toggle";
import PerfilConsultorio from "@/components/configuracoes/PerfilConsultorio";
import MaquininhasSection from "@/components/configuracoes/MaquininhasSection";
import { FadeIn } from "@/components/FadeIn";
import { alertPrefs, type AlertKey, type AlertPrefs } from "@/lib/configuracoesPrefs";
import Procedimentos from "@/pages/Procedimentos";
import Dentistas from "@/pages/Dentistas";
import Documentos from "@/pages/Documentos";
import Insumos from "@/pages/Insumos";

const ALERTAS: { key: AlertKey; label: string }[] = [
  { key: "insumos_vencimento", label: "Vencimento de insumos (15 dias)" },
  { key: "assinaturas_pendentes", label: "Sessões pendentes de assinatura" },
  { key: "campos_obrigatorios", label: "Campos obrigatórios não preenchidos" },
];

const AlertasSection = () => {
  const [prefs, setPrefs] = useState<AlertPrefs>(() => alertPrefs.load());

  useEffect(() => {
    alertPrefs.save(prefs);
  }, [prefs]);

  const setToggle = (key: AlertKey, value: boolean) =>
    setPrefs((p) => ({ ...p, toggles: { ...p.toggles, [key]: value } }));

  return (
    <LiquidGlassCard draggable={false} className="p-5">
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

        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Pausar todas as notificações</p>
            <p className="text-xs text-muted-foreground">
              Quando ativado, nenhum alerta automático será gerado.
            </p>
          </div>
          <NeuToggle
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
              <NeuToggle
                checked={!prefs.pausarTodas && prefs.toggles[a.key] !== false}
                disabled={prefs.pausarTodas}
                onCheckedChange={(v) => setToggle(a.key, v)}
              />
            </div>
          ))}
        </div>
      </div>
    </LiquidGlassCard>
  );
};

const Configuracoes = () => {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">Preferências e parâmetros do sistema</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Tabs defaultValue="perfil" className="space-y-4">
          <div className="flex justify-center">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="perfil" className="gap-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5" /> Perfil do Consultório
              </TabsTrigger>
              <TabsTrigger value="alertas" className="gap-1.5 text-xs">
                <Bell className="w-3.5 h-3.5" /> Alertas Automáticos
              </TabsTrigger>
              <TabsTrigger value="maquininhas" className="gap-1.5 text-xs">
                <CreditCard className="w-3.5 h-3.5" /> Maquininhas
              </TabsTrigger>
              <TabsTrigger value="procedimentos" className="gap-1.5 text-xs">
                <ClipboardList className="w-3.5 h-3.5" /> Procedimentos
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="gap-1.5 text-xs">
                <UserCog className="w-3.5 h-3.5" /> Usuários
              </TabsTrigger>
              <TabsTrigger value="documentos" className="gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5" /> Documentos
              </TabsTrigger>
              <TabsTrigger value="insumos" className="gap-1.5 text-xs">
                <Package className="w-3.5 h-3.5" /> Insumos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="perfil"><PerfilConsultorio /></TabsContent>
          <TabsContent value="alertas"><AlertasSection /></TabsContent>
          <TabsContent value="maquininhas"><MaquininhasSection /></TabsContent>
          <TabsContent value="procedimentos"><Procedimentos /></TabsContent>
          <TabsContent value="usuarios"><Dentistas /></TabsContent>
          <TabsContent value="documentos"><Documentos /></TabsContent>
          <TabsContent value="insumos"><Insumos /></TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
};

export default Configuracoes;
