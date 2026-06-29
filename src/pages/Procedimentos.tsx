import ProcedimentosSection from "@/components/configuracoes/ProcedimentosSection";
import { FadeIn } from "@/components/FadeIn";

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
        <ProcedimentosSection />
      </FadeIn>
    </div>
  );
};

export default Procedimentos;
