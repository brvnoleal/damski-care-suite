import ProcedimentosSection from "@/components/configuracoes/ProcedimentosSection";
import { FadeIn } from "@/components/FadeIn";

const Procedimentos = () => {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Procedimentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catálogo de procedimentos do consultório
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 gap-6">
          <ProcedimentosSection />
        </div>
      </FadeIn>
    </div>
  );
};

export default Procedimentos;
