/**
 * Painel LGPD do paciente: consentimentos, exportação e anonimização.
 * Use dentro da página de detalhe do paciente.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, ShieldOff, FileSignature } from "lucide-react";
import { lgpdService, type Consentimento } from "@/services/lgpdService";

const TEXTO_LGPD =
  "Autorizo o tratamento dos meus dados pessoais e clínicos pela clínica para fins de atendimento, prontuário, faturamento e cumprimento de obrigações legais, conforme a LGPD (Lei 13.709/2018). Posso revogar este consentimento a qualquer momento.";

export const PacienteLGPDPanel = ({ pacienteId }: { pacienteId: string }) => {
  const [consents, setConsents] = useState<Consentimento[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setConsents(await lgpdService.listarConsentimentos(pacienteId));
    } catch (e: any) {
      toast.error("Erro ao carregar consentimentos: " + e.message);
    }
  };

  useEffect(() => {
    load();
  }, [pacienteId]);

  const registrar = async () => {
    setLoading(true);
    try {
      await lgpdService.registrarConsentimento({
        paciente_id: pacienteId,
        finalidade: "Tratamento de dados pessoais e clínicos",
        conteudo: TEXTO_LGPD,
      });
      toast.success("Consentimento registrado");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const revogar = async (id: string) => {
    if (!confirm("Revogar este consentimento?")) return;
    try {
      await lgpdService.revogarConsentimento(id);
      toast.success("Consentimento revogado");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const exportar = async () => {
    setLoading(true);
    try {
      const data = await lgpdService.exportarDados(pacienteId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `paciente-${pacienteId}-dados.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exportação concluída");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const anonimizar = async () => {
    if (
      !confirm(
        "ATENÇÃO: Esta ação mascara permanentemente os dados pessoais do paciente. O histórico clínico é preservado para fins regulatórios. Continuar?",
      )
    )
      return;
    setLoading(true);
    try {
      await lgpdService.anonimizar(pacienteId);
      toast.success("Paciente anonimizado");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" /> Privacidade e LGPD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={registrar} disabled={loading} size="sm">
            Registrar consentimento
          </Button>
          <Button onClick={exportar} disabled={loading} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-1" /> Exportar dados (JSON)
          </Button>
          <Button onClick={anonimizar} disabled={loading} size="sm" variant="destructive">
            <ShieldOff className="h-4 w-4 mr-1" /> Anonimizar
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Histórico de consentimentos</h4>
          {consents.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum consentimento registrado.</p>
          )}
          {consents.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between border rounded-md p-3 text-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.finalidade}</span>
                  <Badge variant={c.aceito ? "default" : "secondary"}>
                    {c.aceito ? "Ativo" : "Revogado"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">v{c.versao}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aceito em {new Date(c.aceito_em).toLocaleString("pt-BR")}
                  {c.revogado_em &&
                    ` · Revogado em ${new Date(c.revogado_em).toLocaleString("pt-BR")}`}
                </p>
              </div>
              {c.aceito && (
                <Button size="sm" variant="ghost" onClick={() => revogar(c.id)}>
                  Revogar
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
