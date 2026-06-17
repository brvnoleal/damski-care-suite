import { ModelosDocumentosSection } from "@/components/configuracoes/ModelosDocumentosSection";
import { AnamneseLinkSection } from "@/components/configuracoes/AnamneseLinkSection";
import { FadeIn } from "@/components/FadeIn";

const Documentos = () => {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Modelos de contratos, TCLE, receituários, atestados e ficha de anamnese
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 gap-6">
          <AnamneseLinkSection />
          <ModelosDocumentosSection />
        </div>
      </FadeIn>
    </div>
  );
};

export default Documentos;
