import ProcedimentosSection from "@/components/configuracoes/ProcedimentosSection";
import ComissoesMatrix from "@/components/comissoes/ComissoesMatrix";
import { FadeIn } from "@/components/FadeIn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Procedimentos = () => {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Procedimentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catálogo de procedimentos e regras de comissão
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Tabs defaultValue="catalogo" className="w-full">
          <TabsList>
            <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
            <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          </TabsList>
          <TabsContent value="catalogo" className="mt-6">
            <ProcedimentosSection />
          </TabsContent>
          <TabsContent value="comissoes" className="mt-6">
            <ComissoesMatrix />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
};

export default Procedimentos;
