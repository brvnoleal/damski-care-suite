import { FadeIn } from "@/components/FadeIn";
import { ControleAcessoSection } from "@/components/usuarios/ControleAcessoSection";

const Dentistas = () => {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie permissões e controle de acesso ao sistema
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <ControleAcessoSection />
      </FadeIn>
    </div>
  );
};

export default Dentistas;
