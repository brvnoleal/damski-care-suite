import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Syringe, Camera, ClipboardList, ShieldCheck, Edit, Plus, Upload, Trash2, ZoomIn, X, User, DollarSign, Activity, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
    try {
      const uploaded = await Promise.all(
        pendingFiles.map((file) =>
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
    setConsultaOpen(true);
  };

  const handleConsultaSave = async () => {
    if (!id || !consultaForm.data || !consultaForm.horario || !consultaForm.dentista_id) {
      toast({ title: "Preencha data, horário e dentista", variant: "destructive" });
      return;
    }
    try {
      const created = await agendamentoService.criar({ ...consultaForm, paciente_id: id });
      setAgendamentos((prev) => [created, ...prev]);
      setConsultaOpen(false);
      toast({ title: "Consulta agendada com sucesso" });
    } catch {
      toast({ title: "Erro ao salvar consulta", variant: "destructive" });
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
            <h1 className="text-2xl font-bold text-foreground">{patientData.nome}</h1>
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
        </TabsList>

        <TabsContent value="detalhes" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Nº Prontuário", value: patientData.numero_prontuario || "—" },
              { label: "Data de Nascimento", value: nascFormatted },
              { label: "CPF", value: patientData.cpf ? patientData.cpf.slice(0, 3) + ".•••.•••-••" : "—" },
              { label: "RG", value: patientData.rg ? `${formatRG(patientData.rg)}${patientData.emissor ? " — " + patientData.emissor : ""}` : "—" },
              { label: "Sexo", value: patientData.sexo ? patientData.sexo.charAt(0).toUpperCase() + patientData.sexo.slice(1).replace("_", " ") : "—" },
              { label: "Estado Civil", value: patientData.estado_civil ? patientData.estado_civil.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—" },
              { label: "Situação Profissional", value: patientData.situacao_profissional ? patientData.situacao_profissional.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—" },
              { label: "Telefone", value: patientData.telefone || "—" },
              { label: "Email", value: patientData.email || "—" },
              { label: "Instagram", value: patientData.instagram || "—" },
              { label: "Plano", value: patientData.plano || "—" },
              { label: "Nº do Plano", value: patientData.numero_plano || "—" },
            ].map((item, i) => (
              <LiquidGlassCard key={i} draggable={false} className="p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground mt-1 break-words">{item.value}</p>
              </LiquidGlassCard>
            ))}
          </div>
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
                      <p className="text-sm font-semibold text-foreground">{procedimentoConsultaLabels[a.procedimento]}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateBR(a.data)} · {a.horario}{a.horario_fim ? ` – ${a.horario_fim}` : ""}
                      </p>
                    </div>
                    <Badge className={statusMap[a.status] || statusMap.agendado}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
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
          {[
            { name: "TCLE — Termo de Consentimento Livre e Esclarecido", status: "assinado" as const },
            { name: "Contrato de Prestação de Serviços", status: "assinado" as const },
            { name: "Orçamento", status: "pendente" as const },
          ].map((doc, i) => (
            <LiquidGlassCard key={i} draggable={false} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doc.status === "assinado" ? "Assinado pelo paciente" : "Aguardando assinatura"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={doc.status === "assinado" ? "bg-success/10 text-success border-success/20 text-xs" : "bg-warning/10 text-warning border-warning/20 text-xs"}>
                  {doc.status === "assinado" ? "Assinado" : "Pendente"}
                </Badge>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={doc.status !== "assinado"}>
                  <FileText className="w-3.5 h-3.5" /> Ver Termo
                </Button>
              </div>
            </LiquidGlassCard>
          ))}
        </TabsContent>

        <TabsContent value="fotos" className="space-y-4">
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

          {fotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {fotos.map((foto) => (
                <div key={foto.id} className="group relative rounded-xl glass overflow-hidden shadow-elegant">
                  <div className="aspect-square overflow-hidden">
                    <img src={foto.url} alt={foto.nome_arquivo} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0",
                        foto.categoria === "antes" && "border-blue-500/30 text-blue-600",
                        foto.categoria === "depois" && "border-green-500/30 text-green-600",
                        foto.categoria === "durante" && "border-amber-500/30 text-amber-600",
                        foto.categoria === "outro" && "border-muted-foreground/30 text-muted-foreground",
                      )}>
                        {foto.categoria.charAt(0).toUpperCase() + foto.categoria.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{foto.nome_arquivo}</p>
                    {foto.descricao && <p className="text-[11px] text-muted-foreground truncate">{foto.descricao}</p>}
                    <p className="text-xs text-muted-foreground">{formatDateBR(foto.data)}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => setPreviewFoto(foto)} className="p-2 rounded-full bg-card/90 text-foreground hover:bg-card transition-colors">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleFotoDelete(foto)}
                      className="p-2 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
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
        </TabsContent>

        <TabsContent value="insumos" className="space-y-4">
          <div className="rounded-xl glass p-8 text-center">
            <Syringe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Rastreabilidade de insumos vinculados às sessões do paciente.</p>
          </div>
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
            <div className="space-y-2"><Label>Procedimento *</Label><Input value={sessionForm.proc} onChange={(e) => setSessionForm({ ...sessionForm, proc: e.target.value })} placeholder="Ex: Harmonização Facial" /></div>
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
              <Input type="number" step="0.01" min="0" value={debitoForm.valor} onChange={(e) => setDebitoForm({ ...debitoForm, valor: e.target.value })} placeholder="0,00" />
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

          <div className="sm:col-span-2 pt-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pagamento</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Valor (R$) *</Label>
            <Input type="number" min="0" step="0.01" value={consultaForm.valor || ""} onChange={(e) => setConsultaForm({ ...consultaForm, valor: parseFloat(e.target.value) || 0 })} placeholder="0,00" />
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
