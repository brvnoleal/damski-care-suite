import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { SignaturePad } from "@/components/SignaturePad";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentoPublico {
  documento_id: string;
  titulo: string;
  tipo: string;
  conteudo: string;
  ja_assinado: boolean;
  paciente_nome: string | null;
  clinica_nome: string | null;
}

const errosLabel: Record<string, string> = {
  link_invalido: "Link inválido.",
  link_usado: "Este link já foi utilizado.",
  link_expirado: "Este link expirou.",
  documento_cancelado: "Este documento foi cancelado pela clínica.",
  documento_indisponivel: "Documento indisponível.",
};

export default function DocumentoAssinar() {
  const { token } = useParams<{ token: string }>();
  const [doc, setDoc] = useState<DocumentoPublico | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [assinatura, setAssinatura] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const { data, error } = await supabase.functions.invoke("documento-resolve", {
          body: { token },
        });
        if (error) throw error;
        if ((data as any)?.error) {
          setErro(errosLabel[(data as any).error] || "Não foi possível abrir o documento.");
        } else {
          setDoc(data as DocumentoPublico);
        }
      } catch (e: any) {
        setErro("Não foi possível abrir o documento.");
      } finally {
        setCarregando(false);
      }
    })();
  }, [token]);

  const enviar = async () => {
    if (!assinatura) {
      toast.error("Assine o documento antes de enviar.");
      return;
    }
    setEnviando(true);
    try {
      const { data, error } = await supabase.functions.invoke("documento-assinar", {
        body: { token, assinatura },
      });
      if (error) throw error;
      if ((data as any)?.error) {
        toast.error(errosLabel[(data as any).error] || "Falha ao enviar assinatura.");
        return;
      }
      setSucesso(true);
    } catch (e: any) {
      toast.error("Falha ao enviar assinatura.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Assinatura de documento</h1>
            <p className="text-xs text-muted-foreground">
              {doc?.clinica_nome || "Clínica"} • Link único e temporário
            </p>
          </div>
        </div>

        {carregando && (
          <LiquidGlassCard draggable={false} className="p-8 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Carregando…</span>
          </LiquidGlassCard>
        )}

        {!carregando && erro && (
          <LiquidGlassCard draggable={false} className="p-8 text-center">
            <p className="text-sm text-destructive">{erro}</p>
          </LiquidGlassCard>
        )}

        {!carregando && doc && !sucesso && (
          <>
            <LiquidGlassCard draggable={false} className="p-6 space-y-2">
              <h2 className="text-base font-semibold text-foreground">{doc.titulo}</h2>
              {doc.paciente_nome && (
                <p className="text-xs text-muted-foreground">Paciente: {doc.paciente_nome}</p>
              )}
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed mt-4 max-h-[60vh] overflow-auto">
                {doc.conteudo}
              </pre>
            </LiquidGlassCard>

            {doc.ja_assinado ? (
              <LiquidGlassCard draggable={false} className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-sm text-foreground">Este documento já foi assinado.</p>
              </LiquidGlassCard>
            ) : (
              <LiquidGlassCard draggable={false} className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Assinatura do paciente</h3>
                  <p className="text-xs text-muted-foreground">
                    Ao assinar, você concorda com o conteúdo acima. Sua assinatura, IP e horário serão
                    registrados em conformidade com a LGPD.
                  </p>
                </div>
                <SignaturePad value={assinatura} onChange={setAssinatura} height={180} />
                <Button onClick={enviar} disabled={enviando || !assinatura} className="w-full">
                  {enviando ? "Enviando…" : "Assinar e enviar"}
                </Button>
              </LiquidGlassCard>
            )}
          </>
        )}

        {sucesso && (
          <LiquidGlassCard draggable={false} className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">Documento assinado!</h2>
            <p className="text-sm text-muted-foreground">
              Obrigado. A clínica foi notificada da sua assinatura.
            </p>
          </LiquidGlassCard>
        )}
      </div>
    </div>
  );
}
