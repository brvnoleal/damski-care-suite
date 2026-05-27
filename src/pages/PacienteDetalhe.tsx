import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Syringe, Camera, ClipboardList, ShieldCheck, Edit, Plus, Upload, Trash2, ZoomIn, X, User, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { pacienteService } from "@/services/pacienteService";
import { dentistaService } from "@/services/dentistaService";
import { pacienteDebitoService, type PacienteDebito } from "@/services/pacienteDebitoService";
import { evolucaoService, type Evolucao } from "@/services/evolucaoService";
import { Paciente, Dentista } from "@/types";

import { sessaoService, type Sessao } from "@/services/sessaoService";
import { pacienteFotoService, type PacienteFoto, type FotoCategoria } from "@/services/pacienteFotoService";

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
  const [editForm, setEditForm] = useState({
    nome: "", cpf: "", rg: "", emissor: "", sexo: "", estado_civil: "", situacao_profissional: "",
    plano: "", numero_plano: "", numero_prontuario: "",
    telefone: "", email: "", instagram: "", data_nascimento: "", status: "ativo" as "ativo" | "inativo",
  });

  const [sessions, setSessions] = useState<Sessao[]>([]);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ date: "", proc: "", tech: "", substance: "", signed: false });

  const [fotos, setFotos] = useState<PacienteFoto[]>([]);
  const [previewFoto, setPreviewFoto] = useState<PacienteFoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fotoDialogOpen, setFotoDialogOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fotoMeta, setFotoMeta] = useState<{ categoria: FotoCategoria; descricao: string }>({ categoria: "antes", descricao: "" });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [paciente, sessoes, fotosList] = await Promise.all([
          pacienteService.buscarPorId(id),
          sessaoService.listarPorPaciente(id),
          pacienteFotoService.listarPorPaciente(id),
        ]);
        setPatientData(paciente);
        setSessions(sessoes);
        setFotos(fotosList);
        if (paciente?.avatar_url) {
          const url = await pacienteService.getAvatarSignedUrl(paciente.avatar_url);
          setAvatarUrl(url);
        }
      } catch {
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
      telefone: patientData.telefone,
      email: patientData.email, instagram: patientData.instagram || "",
      data_nascimento: patientData.data_nascimento, status: patientData.status,
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
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5" onClick={openSessionDialog}>
            <Syringe className="w-3.5 h-3.5" /> Nova Sessão
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Nº Prontuário", value: patientData.numero_prontuario || "—" },
          { label: "Data de Nascimento", value: nascFormatted },
          { label: "CPF", value: patientData.cpf ? patientData.cpf.slice(0, 3) + ".•••.•••-••" : "—" },
          { label: "RG", value: patientData.rg ? `${patientData.rg}${patientData.emissor ? " — " + patientData.emissor : ""}` : "—" },
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


      <Tabs defaultValue="evolucoes" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="evolucoes" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <ClipboardList className="w-3.5 h-3.5" /> Consultas
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

        <TabsContent value="evolucoes" className="space-y-4">
          {sessions.length === 0 && (
            <div className="rounded-xl glass p-8 text-center">
              <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma sessão registrada ainda.</p>
            </div>
          )}
          {sessions.map((session) => (
            <LiquidGlassCard key={session.id} draggable={false} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{session.procedimento}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDateBR(session.data)}</p>
                </div>
                <Badge className={session.assinado ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
                  {session.assinado ? (
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Assinado</span>
                  ) : "Pendente"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Técnica</p>
                  <p className="text-foreground">{session.tecnica || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Substância / Lote</p>
                  <p className="text-foreground">{session.substancia_lote || "—"}</p>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
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
            <Dialog open={!!previewFoto} onOpenChange={() => setPreviewFoto(null)}>
              <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
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
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="insumos" className="space-y-4">
          <div className="rounded-xl glass p-8 text-center">
            <Syringe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Rastreabilidade de insumos vinculados às sessões do paciente.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>Atualize os dados do paciente.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-2 sm:col-span-2"><Label>Nome *</Label><Input value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} /></div>
            <div className="space-y-2"><Label>CPF *</Label><Input value={editForm.cpf} onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })} /></div>
            <div className="space-y-2"><Label>Data Nasc.</Label><Input type="date" value={editForm.data_nascimento} onChange={(e) => setEditForm({ ...editForm, data_nascimento: e.target.value })} /></div>
            <div className="space-y-2"><Label>RG</Label><Input value={editForm.rg} onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
              const formatted = raw
                .replace(/(\d{2})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
              setEditForm({ ...editForm, rg: formatted });
            }} placeholder="00.000.000-0" /></div>
            <div className="space-y-2"><Label>Órgão Emissor</Label><Input value={editForm.emissor} onChange={(e) => setEditForm({ ...editForm, emissor: e.target.value })} placeholder="SSP/SP" /></div>
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select value={editForm.sexo} onValueChange={(v) => setEditForm({ ...editForm, sexo: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado Civil</Label>
              <Select value={editForm.estado_civil} onValueChange={(v) => setEditForm({ ...editForm, estado_civil: v })}>
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
            <div className="space-y-2 sm:col-span-2">
              <Label>Situação Profissional</Label>
              <Select value={editForm.situacao_profissional} onValueChange={(v) => setEditForm({ ...editForm, situacao_profissional: v })}>
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
            <div className="space-y-2"><Label>Plano</Label><Input value={editForm.plano} onChange={(e) => setEditForm({ ...editForm, plano: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nº do Plano</Label><Input value={editForm.numero_plano} onChange={(e) => setEditForm({ ...editForm, numero_plano: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nº do Prontuário</Label><Input value={editForm.numero_prontuario} onChange={(e) => setEditForm({ ...editForm, numero_prontuario: e.target.value })} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={editForm.telefone} onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Instagram</Label><Input value={editForm.instagram} onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v: "ativo" | "inativo") => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Dialog */}
      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Sessão</DialogTitle>
            <DialogDescription>Registre um novo procedimento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Procedimento *</Label><Input value={sessionForm.proc} onChange={(e) => setSessionForm({ ...sessionForm, proc: e.target.value })} placeholder="Ex: Harmonização Facial" /></div>
            <div className="space-y-2"><Label>Data *</Label><Input type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Técnica</Label><Input value={sessionForm.tech} onChange={(e) => setSessionForm({ ...sessionForm, tech: e.target.value })} placeholder="Técnica utilizada" /></div>
            <div className="space-y-2"><Label>Substância / Lote</Label><Input value={sessionForm.substance} onChange={(e) => setSessionForm({ ...sessionForm, substance: e.target.value })} placeholder="Substância e lote" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionOpen(false)}>Cancelar</Button>
            <Button onClick={handleSessionSave}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Foto Metadata Dialog */}
      <Dialog open={fotoDialogOpen} onOpenChange={setFotoDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Detalhes da Foto</DialogTitle>
            <DialogDescription>{pendingFiles.length} foto(s) selecionada(s)</DialogDescription>
          </DialogHeader>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setFotoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleFotoSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PacienteDetalhe;
