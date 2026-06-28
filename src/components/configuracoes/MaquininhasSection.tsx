import { useEffect, useState } from "react";
import { CreditCard, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeuToggle } from "@/components/ui/neu-toggle";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { maquininhasStore, type MaquininhaConfig } from "@/lib/configuracoesPrefs";

const MaquininhasSection = () => {
  const [items, setItems] = useState<MaquininhaConfig[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const loaded = maquininhasStore.load();
    setItems(loaded);
    setActive(loaded[0]?.id || "");
  }, []);

  const updateItem = (id: string, patch: Partial<MaquininhaConfig>) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const updateTaxa = (
    id: string,
    field: "pix" | "debito" | "credito",
    value: number,
    parcela?: number,
  ) => {
    setItems((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (field === "credito" && parcela != null) {
          const credito = [...m.taxa.credito];
          credito[parcela] = value;
          return { ...m, taxa: { ...m.taxa, credito } };
        }
        return { ...m, taxa: { ...m.taxa, [field]: value } } as MaquininhaConfig;
      }),
    );
  };

  const salvar = () => {
    maquininhasStore.save(items);
    toast.success("Taxas das maquininhas salvas.");
  };

  return (
    <LiquidGlassCard draggable={false} className="p-5 lg:col-span-2">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Maquininhas & Taxas</h2>
            <p className="text-xs text-muted-foreground">
              Cadastre as taxas (%) de cada maquininha para PIX, débito e crédito por parcela.
            </p>
          </div>
          <Button size="sm" onClick={salvar} className="gap-1.5">
            <Save className="w-3.5 h-3.5" /> Salvar
          </Button>
        </div>

        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 p-1">
            {items.map((m) => (
              <TabsTrigger key={m.id} value={m.id} className="text-xs">
                {m.nome}
                {m.ativa && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-success inline-block" />}
              </TabsTrigger>
            ))}
          </TabsList>

          {items.map((m) => (
            <TabsContent key={m.id} value={m.id} className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    Marque como ativa para usá-la nos cálculos financeiros.
                  </p>
                </div>
                <NeuToggle checked={m.ativa} onCheckedChange={(v) => updateItem(m.id, { ativa: v })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">PIX (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={m.taxa.pix}
                    onChange={(e) => updateTaxa(m.id, "pix", Number(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Débito (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={m.taxa.debito}
                    onChange={(e) => updateTaxa(m.id, "debito", Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Crédito (%) por parcela
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
                    <div key={p} className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{p}x</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={m.taxa.credito[p] ?? 0}
                        onChange={(e) => updateTaxa(m.id, "credito", Number(e.target.value) || 0, p)}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </LiquidGlassCard>
  );
};

export default MaquininhasSection;
