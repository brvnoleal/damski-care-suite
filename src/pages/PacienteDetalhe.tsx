import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Syringe, Camera, ClipboardList, ShieldCheck, Edit, Plus, Upload, Trash2, ZoomIn, X, User, DollarSign, Activity, Smile, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, isValidCpf } from "@/lib/utils";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription,
} from "@/components/ui/sheet";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Odontograma } from "@/components/odontograma/Odontograma";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { pacienteService } from "@/services/pacienteService";
import { dentistaService } from "@/services/dentistaService";
import { pacienteDebitoService, type PacienteDebito } from "@/services/pacienteDebitoService";
import { evolucaoService, type Evolucao } from "@/services/evolucaoService";
import { agendamentoService } from "@/services/agendamentoService";
import { Paciente, Dentista, Agendamento, ProcedimentoConsulta, procedimentoConsultaLabels, FormaPagamento, formaPagamentoLabels } from "@/types";

import { sessaoService, type Sessao } from "@/services/sessaoService";
import { pacienteFotoService, type PacienteFoto, type FotoCategoria } from "@/services/pacienteFotoService";
import { ProcedimentoCombobox } from "@/components/ProcedimentoCombobox";
import { ConsultaInsumosEditor, ConsultaInsumoItem } from "@/components/agendamento/ConsultaInsumosEditor";
import { agendamentoInsumoService, AgendamentoInsumo } from "@/services/agendamentoInsumoService";
import { CurrencyInput } from "@/components/ui/currency-input";

import { processClinicalPhoto } from "@/lib/imageProcessing";
import { CameraCapture } from "@/components/CameraCapture";

import { AnamneseTab } from "@/components/anamnese/AnamneseTab";
import { DocumentosPacienteTab } from "@/components/paciente/DocumentosPacienteTab";

const formatDateBR = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const formatRG = (raw: string) => {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Normaliza um telefone BR para o formato aceito pelo wa.me (E.164 sem '+').
// Retorna null se o número não tiver um formato válido (10 ou 11 dígitos locais,
// opcionalmente prefixado por 55). DDD deve estar entre 11 e 99 e, para celulares
// (11 dígitos locais), o primeiro dígito após o DDD deve ser 9.
const normalizeWhatsAppNumber = (telefone: string | null | undefined): string | null => {
  if (!telefone) return null;
  let digits = telefone.replace(/\D/g, "");
  if (!digits) return null;

  // Remove prefixo internacional 00 e '+' já foi descartado pelo replace
  if (digits.startsWith("00")) digits = digits.slice(2);

  // Remove DDI 55 para validar a parte local
  let local = digits;
  if (local.length > 11 && local.startsWith("55")) {
    local = local.slice(2);
  }

  // Aceita 10 (fixo) ou 11 (celular) dígitos locais
  if (local.length !== 10 && local.length !== 11) return null;

  const ddd = parseInt(local.slice(0, 2), 10);
  if (isNaN(ddd) || ddd < 11 || ddd > 99) return null;

  // Celular precisa começar com 9
  if (local.length === 11 && local[2] !== "9") return null;

  return `55${local}`;
};

const getWhatsAppLink = (telefone: string | null | undefined): string | null => {
  const normalized = normalizeWhatsAppNumber(telefone);
  return normalized ? `https://wa.me/${normalized}` : null;
};

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const isAtrasado = (d: PacienteDebito) =>
  d.status !== "pago" && new Date(d.data_vencimento) < new Date(new Date().toDateString());

const PacienteDetalhe = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const [patientData, setPatientData] = useState<Paciente | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const emptyEditForm = (): Omit<Paciente, "id" | "created_at"> => ({
    nome: "", cpf: "", rg: "", emissor: "", sexo: "", estado_civil: "", situacao_profissional: "",
    plano: "", numero_plano: "", numero_prontuario: "",
    telefone: "", email: "", instagram: "", data_nascimento: "",
    cep: "", estado: "", cidade: "", bairro: "", rua: "", numero: "", complemento: "", ponto_referencia: "",
    status: "ativo",
  });
  const [editForm, setEditForm] = useState<Omit<Paciente, "id" | "created_at">>(emptyEditForm());

  const [sessions, setSessions] = useState<Sessao[]>([]);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ date: "", proc: "", tech: "", substance: "", signed: false });

  const [fotos, setFotos] = useState<PacienteFoto[]>([]);
  const [previewFoto, setPreviewFoto] = useState<PacienteFoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [fotoDialogOpen, setFotoDialogOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fotoMeta, setFotoMeta] = useState<{ categoria: FotoCategoria; descricao: string }>({ categoria: "antes", descricao: "" });

  const [dentistas, setDentistas] = useState<Dentista[]>([]);

  const [debitos, setDebitos] = useState<PacienteDebito[]>([]);
  const [debitoOpen, setDebitoOpen] = useState(false);
  const [debitoForm, setDebitoForm] = useState({
    descricao: "", valor: "", forma_pagamento: "", data_vencimento: "",
    modalidade: "avista" as "avista" | "parcelado", parcelas: "1",
  });

  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [evolucaoOpen, setEvolucaoOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [evolucaoForm, setEvolucaoForm] = useState({
    data: today, dentista_id: "", conteudo: "",
  });

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [consultaOpen, setConsultaOpen] = useState(false);
  const emptyConsulta = (): Omit<Agendamento, "id" | "created_at" | "paciente_id"> => ({
    data: "", horario: "", horario_fim: "", dentista_id: "",
    procedimento: "avaliacao", status: "agendado",
    valor: 0, forma_pagamento: "dinheiro", parcelas: 1, observacoes: "",
  });
  const [consultaForm, setConsultaForm] = useState(emptyConsulta());
  const [consultaInsumos, setConsultaInsumos] = useState<ConsultaInsumoItem[]>([]);
  const [detalheConsulta, setDetalheConsulta] = useState<Agendamento | null>(null);
  const [detalheInsumos, setDetalheInsumos] = useState<AgendamentoInsumo[]>([]);


  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const safe = <T,>(p: Promise<T>, fallback: T): Promise<T> =>
          p.catch((err) => { console.error("PacienteDetalhe load error:", err); return fallback; });
        const [paciente, sessoes, fotosList, dentistasList, debitosList, evolucoesList, agendamentosList] = await Promise.all([
          pacienteService.buscarPorId(id),
          safe(sessaoService.listarPorPaciente(id), []),
          safe(pacienteFotoService.listarPorPaciente(id), []),
          safe(dentistaService.listar(), []),
          safe(pacienteDebitoService.listarPorPaciente(id), []),
          safe(evolucaoService.listarPorPaciente(id), []),
          safe(agendamentoService.listar(), [] as Agendamento[]),
        ]);
        setPatientData(paciente);
        setSessions(sessoes);
        setFotos(fotosList);
        setDentistas(dentistasList);
        setDebitos(debitosList);
        setEvolucoes(evolucoesList);
        setAgendamentos(agendamentosList.filter((a) => a.paciente_id === id));
        if (paciente?.avatar_url) {
          try {
            const url = await pacienteService.getAvatarSignedUrl(paciente.avatar_url);
            setAvatarUrl(url);
          } catch (err) { console.error("avatar error:", err); }
        }
      } catch (err) {
        console.error("Erro ao carregar paciente:", err);
        toast({ title: "Erro ao carregar paciente", variant: "destructive" });
      } finally {
        setLoading(false);
      }

    };
    load();
  }, [id]);


  const initials = patientData?.nome
    ? patientData.nome.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const openEditDialog = () => {
    if (!patientData) return;
    setEditForm({
      nome: patientData.nome, cpf: patientData.cpf,
      rg: patientData.rg || "", emissor: patientData.emissor || "", sexo: patientData.sexo || "",
      estado_civil: patientData.estado_civil || "", situacao_profissional: patientData.situacao_profissional || "",
      plano: patientData.plano || "", numero_plano: patientData.numero_plano || "", numero_prontuario: patientData.numero_prontuario || "",
      telefone: patientData.telefone, email: patientData.email, instagram: patientData.instagram || "",
      data_nascimento: patientData.data_nascimento,
      cep: patientData.cep || "", estado: patientData.estado || "", cidade: patientData.cidade || "",
      bairro: patientData.bairro || "", rua: patientData.rua || "", numero: patientData.numero || "",
      complemento: patientData.complemento || "", ponto_referencia: patientData.ponto_referencia || "",
      status: patientData.status,
    });
    setEditOpen(true);
  };

  const handleAvatarChange = async (file: File) => {
    if (!id) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Selecione um arquivo de imagem", variant: "destructive" });
      return;
    }
    try {
      const url = await pacienteService.uploadAvatar(id, file);
      setAvatarUrl(url);
      toast({ title: "Foto de perfil atualizada" });
    } catch {
      toast({ title: "Erro ao enviar foto de perfil", variant: "destructive" });
    }
  };

  const handleEditSave = async () => {
    if (!id || !editForm.nome || !editForm.cpf) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (!isValidCpf(editForm.cpf)) {
      toast({ title: "CPF inválido", description: "Verifique os dígitos e tente novamente.", variant: "destructive" });
      return;
    }
    try {
      const updated = await pacienteService.atualizar(id, editForm);
      setPatientData(updated);
      setEditOpen(false);
      toast({ title: "Paciente atualizado com sucesso" });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const openSessionDialog = () => {
    setSessionForm({ date: "", proc: "", tech: "", substance: "", signed: false });
    setSessionOpen(true);
  };

  const handleSessionSave = async () => {
    if (!id || !sessionForm.date || !sessionForm.proc) {
      toast({ title: "Preencha procedimento e data", variant: "destructive" });
      return;
    }
    try {
      const created = await sessaoService.criar({
        paciente_id: id,
        data: sessionForm.date,
        procedimento: sessionForm.proc,
        tecnica: sessionForm.tech || null,
        substancia_lote: sessionForm.substance || null,
        assinado: sessionForm.signed,
      });
      setSessions((prev) => [created, ...prev]);
      setSessionOpen(false);
      toast({ title: "Sessão registrada com sucesso" });
    } catch {
      toast({ title: "Erro ao salvar sessão", variant: "destructive" });
    }
  };

  const openFotoDialog = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) { toast({ title: "Selecione arquivos de imagem válidos", variant: "destructive" }); return; }
    setPendingFiles(imageFiles);
    setFotoMeta({ categoria: "antes", descricao: "" });
    setFotoDialogOpen(true);
  };

  const handleFotoSave = async () => {
    if (!id) return;
    const processedFiles: File[] = [];
    const rejected: string[] = [];
    for (const file of pendingFiles) {
      try {
        const { file: processed } = await processClinicalPhoto(file);
        processedFiles.push(processed);
      } catch (err: any) {
        rejected.push(`${file.name}: ${err?.message || "erro ao processar"}`);
      }
    }
    if (rejected.length > 0) {
      toast({
        title: `${rejected.length} foto(s) ignorada(s)`,
        description: rejected.slice(0, 3).join(" • "),
        variant: "destructive",
      });
    }
    if (processedFiles.length === 0) {
      setFotoDialogOpen(false);
      setPendingFiles([]);
      return;
    }
    try {
      const uploaded = await Promise.all(
        processedFiles.map((file) =>
          pacienteFotoService.upload(id, file, {
            categoria: fotoMeta.categoria,
            descricao: fotoMeta.descricao,
          }),
        ),
      );
      setFotos((prev) => [...uploaded, ...prev]);
      toast({ title: `${uploaded.length} foto(s) adicionada(s)` });
    } catch {
      toast({ title: "Erro ao enviar fotos", variant: "destructive" });
    } finally {
      setFotoDialogOpen(false);
      setPendingFiles([]);
    }
  };

  const handleFotoDelete = async (foto: PacienteFoto) => {
    try {
      await pacienteFotoService.excluir(foto);
      setFotos((prev) => prev.filter((f) => f.id !== foto.id));
      toast({ title: "Foto removida" });
    } catch {
      toast({ title: "Erro ao remover foto", variant: "destructive" });
    }
  };

  const openDebitoDialog = () => {
    setDebitoForm({ descricao: "", valor: "", forma_pagamento: "", data_vencimento: "", modalidade: "avista", parcelas: "1" });
    setDebitoOpen(true);
  };

  const handleDebitoSave = async () => {
    if (!id || !debitoForm.descricao || !debitoForm.valor || !debitoForm.data_vencimento) {
      toast({ title: "Preencha descrição, valor e vencimento", variant: "destructive" });
      return;
    }
    try {
      const created = await pacienteDebitoService.criar({
        paciente_id: id,
        descricao: debitoForm.descricao,
        valor: Number(debitoForm.valor.replace(",", ".")),
        forma_pagamento: debitoForm.forma_pagamento || null,
        data_vencimento: debitoForm.data_vencimento,
        modalidade: debitoForm.modalidade,
        parcelas: debitoForm.modalidade === "parcelado" ? Math.max(1, Number(debitoForm.parcelas) || 1) : 1,
      });
      setDebitos((prev) => [created, ...prev]);
      setDebitoOpen(false);
      toast({ title: "Débito registrado" });
    } catch {
      toast({ title: "Erro ao salvar débito", variant: "destructive" });
    }
  };

  const openEvolucaoDialog = () => {
    setEvolucaoForm({ data: today, dentista_id: "", conteudo: "" });
    setEvolucaoOpen(true);
  };

  const handleEvolucaoSave = async () => {
    if (!id || !evolucaoForm.conteudo.trim()) {
      toast({ title: "Escreva a evolução clínica", variant: "destructive" });
      return;
    }
    try {
      const created = await evolucaoService.criar({
        paciente_id: id,
        dentista_id: evolucaoForm.dentista_id || null,
        data: evolucaoForm.data,
        conteudo: evolucaoForm.conteudo.trim(),
      });
      setEvolucoes((prev) => [created, ...prev]);
      setEvolucaoOpen(false);
      toast({ title: "Evolução registrada" });
    } catch {
      toast({ title: "Erro ao salvar evolução", variant: "destructive" });
    }
  };

  const openConsultaDialog = () => {
    setConsultaForm(emptyConsulta());
    setConsultaInsumos([]);
    setConsultaOpen(true);
  };

  const handleConsultaSave = async () => {
    if (!id || !consultaForm.data || !consultaForm.horario || !consultaForm.dentista_id) {
      toast({ title: "Preencha data, horário e dentista", variant: "destructive" });
      return;
    }
    try {
      const created = await agendamentoService.criar({ ...consultaForm, paciente_id: id });
      if (consultaInsumos.length > 0) {
        await agendamentoInsumoService.sincronizar(created.id, consultaInsumos);
      }
      setAgendamentos((prev) => [created, ...prev]);
      setConsultaOpen(false);
      toast({ title: "Consulta agendada com sucesso" });
    } catch (err: any) {
      toast({ title: "Erro ao salvar consulta", description: err?.message, variant: "destructive" });
    }
  };

  const openDetalheConsulta = async (a: Agendamento) => {
    setDetalheConsulta(a);
    setDetalheInsumos([]);
    try {
      const list = await agendamentoInsumoService.listarPorAgendamento(a.id);
      setDetalheInsumos(list);
    } catch {
      /* ignore */
    }
  };



  const totalRecebido = debitos.filter((d) => d.status === "pago").reduce((s, d) => s + d.valor, 0);
  const totalAtrasado = debitos.filter((d) => isAtrasado(d)).reduce((s, d) => s + d.valor, 0);
  const totalAReceber = debitos.filter((d) => d.status === "pendente" && !isAtrasado(d)).reduce((s, d) => s + d.valor, 0);


  if (loading) {
    return (
      <div className="space-y-6">
        <Link to="/pacientes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Pacientes
        </Link>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="space-y-6">
        <Link to="/pacientes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Pacientes
        </Link>
        <p className="text-muted-foreground">Paciente não encontrado.</p>
      </div>
    );
  }

  const nascFormatted = patientData.data_nascimento?.includes("-")
    ? formatDateBR(patientData.data_nascimento)
    : patientData.data_nascimento || "—";

  return (
    <div className="space-y-6">
      <Link to="/pacientes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para Pacientes
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="group relative w-16 h-16 rounded-xl bg-primary overflow-hidden flex items-center justify-center hover:opacity-90 transition"
            title="Alterar foto de perfil"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={patientData.nome} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-display font-bold text-primary-foreground">{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); e.target.value = ""; }}
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{patientData.nome}</h1>
              {(() => {
                const waLink = getWhatsAppLink(patientData.telefone);
                return waLink ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 hover:text-emerald-400 transition-colors"
                    title="Conversar no WhatsApp"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                  </a>
                ) : null;
              })()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-primary font-semibold">{id}</span>
              <Badge className={patientData.status === "ativo" ? "bg-success/10 text-success border-success/20 text-xs" : "bg-muted text-muted-foreground text-xs"}>
                {patientData.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={openEditDialog}>
            <Edit className="w-3.5 h-3.5" /> Editar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="detalhes" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="detalhes" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <User className="w-3.5 h-3.5" /> Detalhes
          </TabsTrigger>
          <TabsTrigger value="odontograma" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Smile className="w-3.5 h-3.5" /> Odontograma
          </TabsTrigger>
          <TabsTrigger value="consultas" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <ClipboardList className="w-3.5 h-3.5" /> Consultas
          </TabsTrigger>
          <TabsTrigger value="evolucoes" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Activity className="w-3.5 h-3.5" /> Evoluções
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <DollarSign className="w-3.5 h-3.5" /> Financeiro
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <FileText className="w-3.5 h-3.5" /> Documentos
          </TabsTrigger>
          <TabsTrigger value="fotos" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Camera className="w-3.5 h-3.5" /> Fotos
          </TabsTrigger>
          <TabsTrigger value="insumos" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Syringe className="w-3.5 h-3.5" /> Insumos Utilizados
          </TabsTrigger>
          <TabsTrigger value="anamnese" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <ClipboardList className="w-3.5 h-3.5" /> Anamnese
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-6">
          {(() => {
            const sections: { title: string; items: { label: string; value: string }[] }[] = [
              {
                title: "Identificação",
                items: [
                  { label: "Nº Prontuário", value: patientData.numero_prontuario || "—" },
                  { label: "Data de Nascimento", value: nascFormatted },
                  { label: "CPF", value: patientData.cpf ? patientData.cpf.slice(0, 3) + ".•••.•••-••" : "—" },
                  { label: "RG", value: patientData.rg ? `${formatRG(patientData.rg)}${patientData.emissor ? " — " + patientData.emissor : ""}` : "—" },
                  { label: "Sexo", value: patientData.sexo ? patientData.sexo.charAt(0).toUpperCase() + patientData.sexo.slice(1).replace("_", " ") : "—" },
                  { label: "Estado Civil", value: patientData.estado_civil ? patientData.estado_civil.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—" },
                  { label: "Situação Profissional", value: patientData.situacao_profissional ? patientData.situacao_profissional.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—" },
                ],
              },
              {
                title: "Contato",
                items: [
                  { label: "Telefone", value: patientData.telefone || "—" },
                  { label: "Email", value: patientData.email || "—" },
                  { label: "Instagram", value: patientData.instagram || "—" },
                ],
              },
              {
                title: "Plano",
                items: [
                  { label: "Plano", value: patientData.plano || "—" },
                  { label: "Nº do Plano", value: patientData.numero_plano || "—" },
                ],
              },
            ];
            return sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
                <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4 border-t border-border/50 pt-4">
                  {section.items.map((item) => (
                    <div key={item.label} className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-foreground break-words">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ));
          })()}
        </TabsContent>


        <TabsContent value="odontograma" className="space-y-4">
          <Odontograma pacienteId={patientData.id} />
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LiquidGlassCard draggable={false} className="p-4">
              <p className="text-xs text-muted-foreground">Total atrasado</p>
              <p className="text-xl font-bold text-destructive mt-1">{formatBRL(totalAtrasado)}</p>
            </LiquidGlassCard>
            <LiquidGlassCard draggable={false} className="p-4">
              <p className="text-xs text-muted-foreground">Total a receber</p>
              <p className="text-xl font-bold text-warning mt-1">{formatBRL(totalAReceber)}</p>
            </LiquidGlassCard>
            <LiquidGlassCard draggable={false} className="p-4">
              <p className="text-xs text-muted-foreground">Total recebido</p>
              <p className="text-xl font-bold text-success mt-1">{formatBRL(totalRecebido)}</p>
            </LiquidGlassCard>
          </div>
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={openDebitoDialog}>
              <Plus className="w-3.5 h-3.5" /> Novo Débito
            </Button>
          </div>
          {debitos.length === 0 ? (
            <div className="rounded-xl glass p-8 text-center">
              <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum débito registrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debitos.map((d) => {
                const atrasado = isAtrasado(d);
                return (
                  <LiquidGlassCard key={d.id} draggable={false} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{d.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Vencimento: {formatDateBR(d.data_vencimento)}
                        {d.forma_pagamento ? ` · ${d.forma_pagamento}` : ""}
                        {d.modalidade === "parcelado" ? ` · ${d.parcelas}x` : " · À vista"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        d.status === "pago" ? "bg-success/10 text-success border-success/20" :
                        atrasado ? "bg-destructive/10 text-destructive border-destructive/20" :
                        "bg-warning/10 text-warning border-warning/20"
                      }>
                        {d.status === "pago" ? "Pago" : atrasado ? "Atrasado" : "Pendente"}
                      </Badge>
                      <p className="text-sm font-bold text-foreground">{formatBRL(d.valor)}</p>
                    </div>
                  </LiquidGlassCard>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="evolucoes" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={openEvolucaoDialog}>
              <Plus className="w-3.5 h-3.5" /> Nova Evolução
            </Button>
          </div>
          {evolucoes.length === 0 ? (
            <div className="rounded-xl glass p-8 text-center">
              <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma evolução registrada.</p>
            </div>
          ) : (
            evolucoes.map((ev) => (
              <LiquidGlassCard key={ev.id} draggable={false} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{formatDateBR(ev.data)}</p>
                  <p className="text-xs text-muted-foreground">{ev.dentista_nome || "—"}</p>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{ev.conteudo}</p>
              </LiquidGlassCard>
            ))
          )}
        </TabsContent>

        <TabsContent value="consultas" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={openConsultaDialog}>
              <Plus className="w-3.5 h-3.5" /> Nova Consulta
            </Button>
          </div>
          {agendamentos.length === 0 ? (
            <div className="rounded-xl glass p-8 text-center">
              <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma consulta agendada ainda.</p>
            </div>
          ) : (
            agendamentos.map((a) => {
              const dentista = dentistas.find((d) => d.id === a.dentista_id);
              const statusMap: Record<string, string> = {
                agendado: "bg-info/10 text-info border-info/20",
                confirmado: "bg-primary/10 text-primary border-primary/20",
                realizado: "bg-success/10 text-success border-success/20",
                cancelado: "bg-destructive/10 text-destructive border-destructive/20",
              };
              return (
                <LiquidGlassCard key={a.id} draggable={false} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{procedimentoConsultaLabels[a.procedimento] || a.procedimento}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateBR(a.data)} · {a.horario}{a.horario_fim ? ` – ${a.horario_fim}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusMap[a.status] || statusMap.agendado}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openDetalheConsulta(a)}
                        aria-label="Ver detalhes da consulta"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Dentista</p>
                      <p className="text-foreground">{dentista?.nome || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="text-foreground">{formatBRL(a.valor)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pagamento</p>
                      <p className="text-foreground">
                        {formaPagamentoLabels[a.forma_pagamento]}{a.parcelas > 1 ? ` · ${a.parcelas}x` : ""}
                      </p>
                    </div>
                  </div>
                  {a.observacoes && (
                    <p className="text-xs text-muted-foreground border-t border-border/40 pt-2">{a.observacoes}</p>
                  )}
                </LiquidGlassCard>
              );
            })
          )}
        </TabsContent>


        <TabsContent value="documentos" className="space-y-4">
          {id && <DocumentosPacienteTab pacienteId={id} />}
        </TabsContent>

        <TabsContent value="fotos" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); openFotoDialog(Array.from(e.dataTransfer.files)); }}
            >
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Clique ou arraste imagens aqui</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — antes/depois dos procedimentos</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => { if (e.target.files) { openFotoDialog(Array.from(e.target.files)); e.target.value = ""; } }}
              />
            </div>
            <div
              className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              onClick={() => setCameraOpen(true)}
            >
              <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Tirar foto agora</p>
              <p className="text-xs text-muted-foreground mt-1">Abre a câmera do dispositivo</p>
            </div>
          </div>

          {fotos.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {fotos.map((foto) => (
                <div
                  key={foto.id}
                  className="group relative rounded-md overflow-hidden border border-border bg-card aspect-square"
                  title={`${foto.nome_arquivo}${foto.descricao ? ` — ${foto.descricao}` : ""}`}
                >
                  <img src={foto.url} alt={foto.nome_arquivo} className="w-full h-full object-cover" />
                  <span
                    className={cn(
                      "absolute top-1 left-1 inline-block w-2 h-2 rounded-full ring-1 ring-white/70",
                      foto.categoria === "antes" && "bg-blue-500",
                      foto.categoria === "depois" && "bg-green-500",
                      foto.categoria === "durante" && "bg-amber-500",
                      foto.categoria === "outro" && "bg-muted-foreground",
                    )}
                    aria-label={foto.categoria}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      onClick={() => setPreviewFoto(foto)}
                      className="p-1 rounded-full bg-card/90 text-foreground hover:bg-card transition-colors"
                      aria-label="Ampliar"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleFotoDelete(foto)}
                      className="p-1 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {fotos.length === 0 && <p className="text-center text-xs text-muted-foreground">Nenhuma foto adicionada ainda.</p>}

          {previewFoto && (
            <Sheet open={!!previewFoto} onOpenChange={() => setPreviewFoto(null)}>
              <SheetContent className="sm:max-w-3xl p-0 overflow-hidden">
                <div className="relative">
                  <img src={previewFoto.url} alt={previewFoto.nome_arquivo} className="w-full max-h-[80vh] object-contain bg-black" />
                  <button onClick={() => setPreviewFoto(null)} className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{previewFoto.nome_arquivo}</p>
                    {previewFoto.descricao && <p className="text-white/70 text-xs mt-0.5">{previewFoto.descricao}</p>}
                    <p className="text-white/50 text-xs mt-0.5">{formatDateBR(previewFoto.data)} · {previewFoto.categoria}</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <CameraCapture
            open={cameraOpen}
            onOpenChange={setCameraOpen}
            onCapture={(file) => openFotoDialog([file])}
          />
        </TabsContent>

        <TabsContent value="insumos" className="space-y-4">
          <div className="rounded-xl glass p-8 text-center">
            <Syringe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Rastreabilidade de insumos vinculados às sessões do paciente.</p>
          </div>
        </TabsContent>

        <TabsContent value="anamnese" className="space-y-4">
          {id && <AnamneseTab pacienteId={id} />}
        </TabsContent>

      </Tabs>

      {/* Edit Sheet — mesmos campos do cadastro em Pacientes */}
      <ResponsiveDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Editar Paciente"
        description="Atualize os dados do paciente."
        className="sm:max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 sm:flex-none">Cancelar</Button>
            <Button onClick={handleEditSave} className="flex-1 sm:flex-none">Salvar</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nome *</Label>
            <Input value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} placeholder="Nome completo" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">CPF *</Label>
            <Input value={editForm.cpf} onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
              const formatted = raw
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
              setEditForm({ ...editForm, cpf: formatted });
            }} placeholder="000.000.000-00" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Data de Nascimento *</Label>
            <Input type="date" value={editForm.data_nascimento} onChange={(e) => setEditForm({ ...editForm, data_nascimento: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Telefone</Label>
            <Input value={editForm.telefone} onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
              const formatted = raw.length <= 10
                ? raw.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
                : raw.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
              setEditForm({ ...editForm, telefone: formatted });
            }} placeholder="(11) 99999-0000" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</Label>
            <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="email@exemplo.com" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Instagram</Label>
            <Input value={editForm.instagram} onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })} placeholder="@usuario" />
          </div>

          {/* Documentos & Dados Pessoais */}
          <div className="sm:col-span-2 pt-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documentos & Dados Pessoais</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">RG</Label>
            <Input value={editForm.rg} onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
              const formatted = raw
                .replace(/(\d{2})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
              setEditForm({ ...editForm, rg: formatted });
            }} placeholder="00.000.000-0" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Órgão Emissor</Label>
            <Input value={editForm.emissor} onChange={(e) => setEditForm({ ...editForm, emissor: e.target.value })} placeholder="SSP/SP" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sexo</Label>
            <Select value={editForm.sexo || ""} onValueChange={(v) => setEditForm({ ...editForm, sexo: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
                <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Estado Civil</Label>
            <Select value={editForm.estado_civil || ""} onValueChange={(v) => setEditForm({ ...editForm, estado_civil: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                <SelectItem value="casado">Casado(a)</SelectItem>
                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                <SelectItem value="uniao_estavel">União Estável</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Situação Profissional</Label>
            <Select value={editForm.situacao_profissional || ""} onValueChange={(v) => setEditForm({ ...editForm, situacao_profissional: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="clt">CLT</SelectItem>
                <SelectItem value="autonomo">Autônomo</SelectItem>
                <SelectItem value="empresario">Empresário</SelectItem>
                <SelectItem value="servidor_publico">Servidor Público</SelectItem>
                <SelectItem value="aposentado">Aposentado</SelectItem>
                <SelectItem value="estudante">Estudante</SelectItem>
                <SelectItem value="desempregado">Desempregado</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Plano</Label>
            <Input value={editForm.plano} onChange={(e) => setEditForm({ ...editForm, plano: e.target.value })} placeholder="Nome do plano" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Número do Plano</Label>
            <Input value={editForm.numero_plano} onChange={(e) => setEditForm({ ...editForm, numero_plano: e.target.value })} placeholder="000000" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Número do Prontuário</Label>
            <Input value={editForm.numero_prontuario} onChange={(e) => setEditForm({ ...editForm, numero_prontuario: e.target.value })} placeholder="000000" />
          </div>

          {/* Endereço */}
          <div className="sm:col-span-2 pt-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endereço</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">CEP</Label>
            <Input
              value={editForm.cep}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
                const masked = raw.length > 5 ? raw.slice(0, 5) + "-" + raw.slice(5) : raw;
                setEditForm({ ...editForm, cep: masked });
                if (raw.length === 8) {
                  fetch(`https://viacep.com.br/ws/${raw}/json/`)
                    .then((r) => r.json())
                    .then((data) => {
                      if (!data.erro) {
                        setEditForm((prev) => ({
                          ...prev,
                          cep: masked,
                          estado: data.uf || prev.estado,
                          cidade: data.localidade || prev.cidade,
                          bairro: data.bairro || prev.bairro,
                          rua: data.logradouro || prev.rua,
                          complemento: data.complemento || prev.complemento,
                        }));
                      }
                    })
                    .catch(() => {});
                }
              }}
              placeholder="00000-000"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Estado</Label>
            <Input value={editForm.estado} onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })} placeholder="SP" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Cidade</Label>
            <Input value={editForm.cidade} onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value })} placeholder="São Paulo" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Bairro</Label>
            <Input value={editForm.bairro} onChange={(e) => setEditForm({ ...editForm, bairro: e.target.value })} placeholder="Centro" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Rua</Label>
            <Input value={editForm.rua} onChange={(e) => setEditForm({ ...editForm, rua: e.target.value })} placeholder="Rua Exemplo" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Número</Label>
            <Input value={editForm.numero} onChange={(e) => setEditForm({ ...editForm, numero: e.target.value })} placeholder="123" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Complemento</Label>
            <Input value={editForm.complemento} onChange={(e) => setEditForm({ ...editForm, complemento: e.target.value })} placeholder="Apto 45" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Ponto de Referência</Label>
            <Input value={editForm.ponto_referencia} onChange={(e) => setEditForm({ ...editForm, ponto_referencia: e.target.value })} placeholder="Próximo ao mercado" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</Label>
            <Select value={editForm.status} onValueChange={(v: "ativo" | "inativo") => setEditForm({ ...editForm, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ResponsiveDialog>


      {/* Session Sheet */}
      <Sheet open={sessionOpen} onOpenChange={setSessionOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Registrar Sessão</SheetTitle>
            <SheetDescription>Registre um novo procedimento.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Procedimento *</Label><ProcedimentoCombobox value={sessionForm.proc} onChange={(v) => setSessionForm({ ...sessionForm, proc: v })} allowCustom /></div>
            <div className="space-y-2"><Label>Data *</Label><Input type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Técnica</Label><Input value={sessionForm.tech} onChange={(e) => setSessionForm({ ...sessionForm, tech: e.target.value })} placeholder="Técnica utilizada" /></div>
            <div className="space-y-2"><Label>Substância / Lote</Label><Input value={sessionForm.substance} onChange={(e) => setSessionForm({ ...sessionForm, substance: e.target.value })} placeholder="Substância e lote" /></div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSessionOpen(false)}>Cancelar</Button>
            <Button onClick={handleSessionSave}>Registrar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Foto Metadata Sheet */}
      <Sheet open={fotoDialogOpen} onOpenChange={setFotoDialogOpen}>
        <SheetContent className="sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Detalhes da Foto</SheetTitle>
            <SheetDescription>{pendingFiles.length} foto(s) selecionada(s)</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={fotoMeta.categoria} onValueChange={(v: FotoCategoria) => setFotoMeta({ ...fotoMeta, categoria: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="antes">Antes</SelectItem>
                  <SelectItem value="depois">Depois</SelectItem>
                  <SelectItem value="durante">Durante</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea rows={2} value={fotoMeta.descricao} onChange={(e) => setFotoMeta({ ...fotoMeta, descricao: e.target.value })} placeholder="Ex: Vista frontal, sorriso..." />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setFotoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleFotoSave}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Débito Sheet */}
      <Sheet open={debitoOpen} onOpenChange={setDebitoOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Novo Débito</SheetTitle>
            <SheetDescription>Registre um novo débito do paciente.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Descrição *</Label>
              <Input value={debitoForm.descricao} onChange={(e) => setDebitoForm({ ...debitoForm, descricao: e.target.value })} placeholder="Ex: Harmonização facial" />
            </div>
            <div className="space-y-2"><Label>Valor (R$) *</Label>
              <CurrencyInput value={debitoForm.valor} onChange={(n) => setDebitoForm({ ...debitoForm, valor: n ? String(n) : "" })} />
            </div>
            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <Select value={debitoForm.forma_pagamento} onValueChange={(v) => setDebitoForm({ ...debitoForm, forma_pagamento: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="debito">Cartão de Débito</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Data de Vencimento *</Label>
              <Input type="date" value={debitoForm.data_vencimento} onChange={(e) => setDebitoForm({ ...debitoForm, data_vencimento: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select value={debitoForm.modalidade} onValueChange={(v: "avista" | "parcelado") => setDebitoForm({ ...debitoForm, modalidade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avista">À vista</SelectItem>
                    <SelectItem value="parcelado">Parcelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {debitoForm.modalidade === "parcelado" && (
                <div className="space-y-2">
                  <Label>Nº de parcelas</Label>
                  <Input type="number" min="2" max="24" value={debitoForm.parcelas} onChange={(e) => setDebitoForm({ ...debitoForm, parcelas: e.target.value })} />
                </div>
              )}
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDebitoOpen(false)}>Cancelar</Button>
            <Button onClick={handleDebitoSave}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Evolução Sheet */}
      <Sheet open={evolucaoOpen} onOpenChange={setEvolucaoOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Nova Evolução</SheetTitle>
            <SheetDescription>Registre a evolução clínica do paciente.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Data de criação</Label>
                <Input type="date" value={evolucaoForm.data} onChange={(e) => setEvolucaoForm({ ...evolucaoForm, data: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Dentista responsável</Label>
                <Select value={evolucaoForm.dentista_id} onValueChange={(v) => setEvolucaoForm({ ...evolucaoForm, dentista_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {dentistas.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Paciente</Label>
              <Input value={patientData.nome} disabled />
            </div>
            <div className="space-y-2"><Label>Evolução Clínica *</Label>
              <Textarea rows={6} value={evolucaoForm.conteudo} onChange={(e) => setEvolucaoForm({ ...evolucaoForm, conteudo: e.target.value })} placeholder="Descreva a evolução clínica do paciente..." />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setEvolucaoOpen(false)}>Cancelar</Button>
            <Button onClick={handleEvolucaoSave}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Nova Consulta Sheet */}
      <ResponsiveDialog
        open={consultaOpen}
        onOpenChange={setConsultaOpen}
        title="Nova Consulta"
        description={`Agende uma nova consulta para ${patientData.nome}.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConsultaOpen(false)} className="flex-1 sm:flex-none">Cancelar</Button>
            <Button onClick={handleConsultaSave} className="flex-1 sm:flex-none">Agendar</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Paciente</Label>
            <Input value={patientData.nome} disabled />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Dentista *</Label>
            <Select value={consultaForm.dentista_id} onValueChange={(v) => setConsultaForm({ ...consultaForm, dentista_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {dentistas.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Data *</Label>
            <Input type="date" value={consultaForm.data} onChange={(e) => setConsultaForm({ ...consultaForm, data: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Horário Início *</Label>
            <Input type="time" value={consultaForm.horario} onChange={(e) => setConsultaForm({ ...consultaForm, horario: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Horário Término</Label>
            <Input type="time" value={consultaForm.horario_fim || ""} onChange={(e) => setConsultaForm({ ...consultaForm, horario_fim: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</Label>
            <Select value={consultaForm.status} onValueChange={(v: Agendamento["status"]) => setConsultaForm({ ...consultaForm, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Procedimento *</Label>
            <ProcedimentoCombobox
              value={consultaForm.procedimento}
              onChange={(v) => setConsultaForm({ ...consultaForm, procedimento: v as ProcedimentoConsulta })}
            />
          </div>

          <div className="sm:col-span-2">
            <ConsultaInsumosEditor
              procedimentoNome={consultaForm.procedimento}
              value={consultaInsumos}
              onChange={setConsultaInsumos}
              resetKey="new"
            />
          </div>


          <div className="sm:col-span-2 pt-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pagamento</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Valor (R$) *</Label>
            <CurrencyInput value={consultaForm.valor || 0} onChange={(n) => setConsultaForm({ ...consultaForm, valor: n })} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Forma de Pagamento *</Label>
            <Select value={consultaForm.forma_pagamento} onValueChange={(v: FormaPagamento) => setConsultaForm({ ...consultaForm, forma_pagamento: v, parcelas: v === "credito" || v === "boleto" ? consultaForm.parcelas : 1 })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(formaPagamentoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(consultaForm.forma_pagamento === "credito" || consultaForm.forma_pagamento === "boleto") && (
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Parcelas</Label>
              <Select value={String(consultaForm.parcelas)} onValueChange={(v) => setConsultaForm({ ...consultaForm, parcelas: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className={consultaForm.forma_pagamento === "credito" || consultaForm.forma_pagamento === "boleto" ? "" : "sm:col-span-2"}>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Observações</Label>
            <Input value={consultaForm.observacoes} onChange={(e) => setConsultaForm({ ...consultaForm, observacoes: e.target.value })} placeholder="Observações opcionais" />
          </div>
        </div>
      </ResponsiveDialog>
    </div>


  );
};

export default PacienteDetalhe;
