import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, CheckCircle2, FileText, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { isValidCpf } from "@/lib/utils";
import { ANAMNESE_BLOCOS, TERMO_ANAMNESE } from "@/lib/anamnese";
import { AnamneseFormFields, AnamneseValues } from "@/components/anamnese/AnamneseFormFields";
import { SignaturePad } from "@/components/SignaturePad";

type Step = "cpf" | "confirmar" | "novo" | "anamnese" | "assinatura" | "sucesso";

const maskCpf = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3").replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3").replace(/-$/, "");
};

const maskCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d{0,3}).*/, "$1-$2").replace(/-$/, "");
};

interface LookupResult {
  clinica_nome: string;
  existe: boolean;
  nome_mascarado: string | null;
  ano_nascimento: number | null;
}

const AnamnesePublica = () => {
  const { clinicaId: clinicaParam, token } = useParams<{ clinicaId?: string; token?: string }>();

  const [resolvedClinicaId, setResolvedClinicaId] = useState<string | null>(null);
  const [clinicaNome, setClinicaNome] = useState<string>("");
  const [tokenPacienteId, setTokenPacienteId] = useState<string | null>(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("cpf");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookup, setLookup] = useState<LookupResult | null>(null);

  const [confirmNome, setConfirmNome] = useState("");
  const [confirmNasc, setConfirmNasc] = useState("");
  const [pacienteId, setPacienteId] = useState<string | null>(null);

  const [novo, setNovo] = useState({
    nome: "", data_nascimento: "", telefone: "", email: "", instagram: "",
    cep: "", estado: "", cidade: "", bairro: "", rua: "", numero: "", complemento: "",
  });

  const [respostas, setRespostas] = useState<AnamneseValues>({});
  const [assinatura, setAssinatura] = useState("");
  const [aceiteTermo, setAceiteTermo] = useState(false);

  const origem: "link_publico" | "link_individual" = token ? "link_individual" : "link_publico";

  // Resolve clínica (via id direto ou via token) usando edge function pública
  useEffect(() => {
    (async () => {
      try {
        const body = token ? { token } : clinicaParam ? { clinica_id: clinicaParam } : null;
        if (!body) { setBootError("Endereço inválido."); return; }
        const { data, error } = await supabase.functions.invoke<{
          clinica_id: string; clinica_nome: string; paciente_id: string | null; error?: string;
        }>("anamnese-resolve", { body });
        const errCode = (data as any)?.error || (error as any)?.context?.error;
        if (errCode) {
          const map: Record<string, string> = {
            link_invalido: "Link inválido.",
            link_usado: "Este link já foi utilizado.",
            link_expirado: "Link expirado.",
            clinica_indisponivel: "Clínica indisponível.",
            parametros_invalidos: "Endereço inválido.",
          };
          setBootError(map[errCode] || "Não foi possível abrir a ficha.");
          return;
        }
        if (error || !data?.clinica_id) { setBootError("Não foi possível abrir a ficha."); return; }
        setResolvedClinicaId(data.clinica_id);
        setClinicaNome(data.clinica_nome);
        setTokenPacienteId(data.paciente_id);
      } finally {
        setBootLoading(false);
      }
    })();
  }, [clinicaParam, token]);


  const proxLookup = async () => {
    if (!resolvedClinicaId) return;
    if (!isValidCpf(cpf)) { toast.error("CPF inválido"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<LookupResult>("anamnese-lookup-cpf", {
        body: { cpf, clinica_id: resolvedClinicaId },
      });
      if (error || !data) throw new Error(error?.message || "Falha ao consultar");
      setLookup(data);
      setStep(data.existe ? "confirmar" : "novo");
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  const validarIdentidade = async () => {
    if (!resolvedClinicaId) return;
    if (!confirmNome.trim() || !confirmNasc) { toast.error("Preencha os campos"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<{ valido: boolean; paciente_id: string | null }>(
        "anamnese-validar-identidade",
        { body: { cpf, clinica_id: resolvedClinicaId, nome: confirmNome, data_nascimento: confirmNasc } },
      );
      if (error || !data) throw new Error(error?.message || "Falha ao validar");
      if (!data.valido) { toast.error("Dados não conferem. Verifique nome completo e data de nascimento."); return; }
      setPacienteId(data.paciente_id);
      setStep("anamnese");
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  const buscarCep = async (cepValue: string) => {
    const d = cepValue.replace(/\D/g, "");
    if (d.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (j.erro) return;
      setNovo((n) => ({ ...n, estado: j.uf || "", cidade: j.localidade || "", bairro: j.bairro || "", rua: j.logradouro || "" }));
    } catch { /* ignore */ }
  };

  const proximoNovo = () => {
    if (!novo.nome.trim() || !novo.data_nascimento) { toast.error("Nome e data de nascimento são obrigatórios"); return; }
    setStep("anamnese");
  };

  const anamneseValida = useMemo(() => {
    return ANAMNESE_BLOCOS.every((b) =>
      b.campos.filter((c) => c.required).every((c) => {
        const v = (respostas[b.key] || {})[c.key];
        return v !== undefined && v !== null && String(v).trim() !== "";
      })
    );
  }, [respostas]);

  const submeter = async () => {
    if (!resolvedClinicaId) return;
    if (!assinatura) { toast.error("Assine para concluir"); return; }
    if (!aceiteTermo) { toast.error("Você precisa aceitar o termo"); return; }
    setLoading(true);
    try {
      const body: any = {
        clinica_id: resolvedClinicaId,
        paciente_id: pacienteId,
        respostas,
        assinatura_paciente: assinatura,
        origem,
        token: token ?? null,
      };
      if (!pacienteId) {
        body.paciente_novo = { ...novo, cpf };
      }
      const { data, error } = await supabase.functions.invoke<{ success: boolean }>("anamnese-submit", { body });
      if (error || !data?.success) throw new Error(error?.message || "Falha ao enviar");
      setStep("sucesso");
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  };

  // Pré-carrega paciente se o token for individual
  useEffect(() => {
    if (tokenPacienteId && step === "cpf") {
      setPacienteId(tokenPacienteId);
      setStep("anamnese");
    }
  }, [tokenPacienteId, step]);

  if (bootLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  if (bootError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <LiquidGlassCard className="max-w-md w-full p-6 text-center">
          <p className="text-foreground">{bootError}</p>
        </LiquidGlassCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Ficha de Anamnese</h1>
          <p className="text-sm text-muted-foreground">{clinicaNome}</p>
        </header>

        <LiquidGlassCard className="p-6">
          {step === "cpf" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">Identificação</h2>
              <p className="text-sm text-muted-foreground">Informe seu CPF para iniciar.</p>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" inputMode="numeric" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} placeholder="000.000.000-00" />
              </div>
              <Button className="w-full" onClick={proxLookup} disabled={loading || cpf.length < 14}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continuar <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
          )}

          {step === "confirmar" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">Confirme sua identidade</h2>
              <p className="text-sm text-muted-foreground">
                Encontramos um cadastro para <span className="font-medium">{lookup?.nome_mascarado}</span>{lookup?.ano_nascimento ? ` (${lookup.ano_nascimento})` : ""}.
                Confirme nome completo e data de nascimento para continuar.
              </p>
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={confirmNome} onChange={(e) => setConfirmNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data de nascimento</Label>
                <Input type="date" value={confirmNasc} onChange={(e) => setConfirmNasc(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("cpf")} className="gap-1"><ChevronLeft className="w-4 h-4" /> Voltar</Button>
                <Button className="flex-1" onClick={validarIdentidade} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Confirmar <ChevronRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </div>
            </div>
          )}

          {step === "novo" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">Cadastro</h2>
              <p className="text-sm text-muted-foreground">Não encontramos cadastro com este CPF. Preencha seus dados básicos.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Nome completo *</Label>
                  <Input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Data de nascimento *</Label>
                  <Input type="date" value={novo.data_nascimento} onChange={(e) => setNovo({ ...novo, data_nascimento: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={novo.telefone} onChange={(e) => setNovo({ ...novo, telefone: maskPhone(e.target.value) })} placeholder="(11) 99999-0000" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input value={novo.instagram} onChange={(e) => setNovo({ ...novo, instagram: e.target.value })} placeholder="@usuario" />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={novo.cep} onChange={(e) => { const v = maskCep(e.target.value); setNovo({ ...novo, cep: v }); buscarCep(v); }} placeholder="00000-000" />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={novo.estado} onChange={(e) => setNovo({ ...novo, estado: e.target.value.toUpperCase().slice(0,2) })} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={novo.cidade} onChange={(e) => setNovo({ ...novo, cidade: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input value={novo.bairro} onChange={(e) => setNovo({ ...novo, bairro: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Rua</Label>
                  <Input value={novo.rua} onChange={(e) => setNovo({ ...novo, rua: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={novo.numero} onChange={(e) => setNovo({ ...novo, numero: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input value={novo.complemento} onChange={(e) => setNovo({ ...novo, complemento: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("cpf")} className="gap-1"><ChevronLeft className="w-4 h-4" /> Voltar</Button>
                <Button className="flex-1" onClick={proximoNovo}>Continuar <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div>
          )}

          {step === "anamnese" && (
            <div className="space-y-6">
              <AnamneseFormFields values={respostas} onChange={setRespostas} />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(pacienteId && !tokenPacienteId ? "confirmar" : (pacienteId ? "cpf" : "novo"))} className="gap-1">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button className="flex-1" onClick={() => setStep("assinatura")} disabled={!anamneseValida}>
                  Continuar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === "assinatura" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Termo e assinatura
              </h2>
              <div className="rounded-md border border-white/10 bg-black/20 p-3 text-xs text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
                {TERMO_ANAMNESE}
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="aceite" checked={aceiteTermo} onCheckedChange={(v) => setAceiteTermo(Boolean(v))} />
                <Label htmlFor="aceite" className="text-sm font-normal cursor-pointer leading-snug">
                  Li e aceito o termo acima, declarando que as informações são verdadeiras.
                </Label>
              </div>
              <div className="space-y-2">
                <Label>Assinatura do paciente</Label>
                <SignaturePad value={assinatura} onChange={setAssinatura} />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("anamnese")} className="gap-1"><ChevronLeft className="w-4 h-4" /> Voltar</Button>
                <Button className="flex-1" onClick={submeter} disabled={loading || !assinatura || !aceiteTermo}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar ficha"}
                </Button>
              </div>
            </div>
          )}

          {step === "sucesso" && (
            <div className="text-center space-y-3 py-6">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Ficha enviada com sucesso!</h2>
              <p className="text-sm text-muted-foreground">Sua ficha foi recebida pela clínica. Você já pode fechar esta página.</p>
            </div>
          )}
        </LiquidGlassCard>

        <footer className="text-center text-xs text-muted-foreground">
          Seus dados são protegidos conforme a LGPD.
        </footer>
      </div>
    </main>
  );
};

export default AnamnesePublica;
