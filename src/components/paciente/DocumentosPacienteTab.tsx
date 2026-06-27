import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Plus, Copy, Eye, XCircle, CheckCircle2, Clock, Loader2, Upload, Download, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { documentoService, type DocumentoModelo, type PacienteDocumento } from "@/services/documentoService";
import { pacienteArquivoService, type PacienteArquivo } from "@/services/pacienteArquivoService";
import { useClinicaContext } from "@/hooks/useClinicaContext";
import { renderTemplate, tipoDocumentoLabels, type TipoDocumento } from "@/lib/documentoTemplates";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  pacienteId: string;
}

const statusBadge = (s: PacienteDocumento["status"]) => {
  switch (s) {
    case "assinado":
      return { label: "Assinado", icon: CheckCircle2, cls: "bg-success/10 text-success border-success/20" };
    case "pendente":
      return { label: "Pendente", icon: Clock, cls: "bg-warning/10 text-warning border-warning/20" };
    case "expirado":
      return { label: "Expirado", icon: XCircle, cls: "bg-muted/30 text-muted-foreground border-border" };
    case "cancelado":
      return { label: "Cancelado", icon: XCircle, cls: "bg-destructive/10 text-destructive border-destructive/20" };
  }
};

export const DocumentosPacienteTab = ({ pacienteId }: Props) => {
  const { clinicaId } = useClinicaContext();
  const [docs, setDocs] = useState<PacienteDocumento[]>([]);
  const [modelos, setModelos] = useState<DocumentoModelo[]>([]);
  const [arquivos, setArquivos] = useState<PacienteArquivo[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  const [openNovo, setOpenNovo] = useState(false);
  const [modeloId, setModeloId] = useState<string>("");
  const [tipoPersonalizado, setTipoPersonalizado] = useState<TipoDocumento>("personalizado");
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [diasValidade, setDiasValidade] = useState(7);
  const [emitindo, setEmitindo] = useState(false);

  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [verDoc, setVerDoc] = useState<PacienteDocumento | null>(null);

  // dados de paciente/clinica para preview
  const [paciente, setPaciente] = useState<any>(null);
  const [clinica, setClinica] = useState<any>(null);
  const [arquivoParaExcluir, setArquivoParaExcluir] = useState<PacienteArquivo | null>(null);
  const [excluindoArquivo, setExcluindoArquivo] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      if (clinicaId) await documentoService.garantirModelosPadrao(clinicaId);
      const [d, m, arqs, { data: p }, { data: c }] = await Promise.all([
        documentoService.listarPorPaciente(pacienteId),
        documentoService.listarModelos(),
        pacienteArquivoService.listarPorPaciente(pacienteId).catch(() => [] as PacienteArquivo[]),
        supabase.from("paciente").select("*").eq("id", pacienteId).maybeSingle(),
        clinicaId
          ? supabase.from("clinica").select("*").eq("id", clinicaId).maybeSingle()
          : Promise.resolve({ data: null } as any),
      ]);
      setDocs(d);
      setModelos(m.filter((x) => x.ativo));
      setArquivos(arqs);
      setPaciente(p);
      setClinica(c);
    } catch (e: any) {
      toast.error(e.message || "Falha ao carregar documentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId, clinicaId]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const created: PacienteArquivo[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 25 * 1024 * 1024) {
          toast.error(`${file.name}: máximo 25MB.`);
          continue;
        }
        const arq = await pacienteArquivoService.upload(pacienteId, file);
        created.push(arq);
      }
      if (created.length) {
        setArquivos((prev) => [...created, ...prev]);
        toast.success(`${created.length} arquivo(s) anexado(s).`);
      }
    } catch (e: any) {
      toast.error(e.message || "Falha ao enviar arquivo");
    } finally {
      setUploading(false);
      if (uploadRef.current) uploadRef.current.value = "";
    }
  };

  const baixarArquivo = async (arq: PacienteArquivo) => {
    try {
      const url = await pacienteArquivoService.getSignedUrl(arq.storage_path);
      window.open(url, "_blank", "noopener");
    } catch (e: any) {
      toast.error(e.message || "Falha ao abrir arquivo");
    }
  };

  const excluirArquivo = async (arq: PacienteArquivo) => {
    if (!confirm(`Excluir arquivo "${arq.nome}"?`)) return;
    try {
      await pacienteArquivoService.excluir(arq);
      setArquivos((prev) => prev.filter((a) => a.id !== arq.id));
      toast.success("Arquivo excluído");
    } catch (e: any) {
      toast.error(e.message || "Falha ao excluir");
    }
  };

  const formatBytes = (n: number | null) => {
    if (!n) return "";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  };

  const abrirNovo = () => {
    setModeloId("");
    setTipoPersonalizado("personalizado");
    setTitulo("");
    setConteudo("");
    setDiasValidade(7);
    setOpenNovo(true);
  };

  const onSelectModelo = (id: string) => {
    setModeloId(id);
    const m = modelos.find((x) => x.id === id);
    if (m) {
      setTitulo(m.nome);
      setConteudo(m.conteudo);
    }
  };

  const previewRenderizado = useMemo(() => {
    if (!conteudo) return "";
    return renderTemplate(conteudo, {
      paciente: paciente || {},
      clinica: {
        nome: clinica?.nome,
        cnpj: clinica?.cnpj,
        telefone: clinica?.telefone,
        email: clinica?.email,
      },
    });
  }, [conteudo, paciente, clinica]);

  const emitir = async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      toast.error("Informe título e conteúdo");
      return;
    }
    setEmitindo(true);
    try {
      const modelo = modelos.find((m) => m.id === modeloId) || null;
      const requer = modelo ? modelo.requer_assinatura_paciente : true;
      const { url } = await documentoService.emitir({
        pacienteId,
        modelo,
        tipoPersonalizado: modelo ? undefined : tipoPersonalizado,
        titulo,
        conteudoBruto: conteudo,
        diasValidade,
        requerAssinaturaPaciente: requer,
      });
      await navigator.clipboard.writeText(url).catch(() => {});
      setLinkGerado(url);
      setOpenNovo(false);
      carregar();
    } catch (e: any) {
      toast.error(e.message || "Falha ao emitir documento");
    } finally {
      setEmitindo(false);
    }
  };

  const copiarLink = async (doc: PacienteDocumento) => {
    const token = await documentoService.obterTokenAtivo(doc.id);
    if (!token) {
      toast.error("Nenhum link ativo. Reemita o documento.");
      return;
    }
    const url = `${window.location.origin}/d/${token}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };

  const cancelar = async (doc: PacienteDocumento) => {
    if (!confirm(`Cancelar documento "${doc.titulo}"?`)) return;
    try {
      await documentoService.cancelar(doc.id);
      toast.success("Documento cancelado");
      carregar();
    } catch (e: any) {
      toast.error(e.message || "Falha ao cancelar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Documentos emitidos para este paciente. Cada link é único, temporário e exige assinatura LGPD.
        </p>
        <Button size="sm" onClick={abrirNovo} className="gap-1.5">
          <Plus className="w-4 h-4" /> Emitir documento
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
        </div>
      ) : docs.length === 0 ? (
        <LiquidGlassCard draggable={false} className="p-8 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum documento emitido. Clique em "Emitir documento" para começar.
          </p>
        </LiquidGlassCard>
      ) : (
        docs.map((doc) => {
          const b = statusBadge(doc.status);
          const Icon = b.icon;
          return (
            <LiquidGlassCard
              key={doc.id}
              draggable={false}
              className="p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.titulo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {tipoDocumentoLabels[doc.tipo]}
                    </Badge>
                    {doc.assinado_em && (
                      <span className="text-[10px] text-muted-foreground">
                        Assinado em {new Date(doc.assinado_em).toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={`${b.cls} text-xs gap-1`}>
                  <Icon className="w-3 h-3" /> {b.label}
                </Badge>
                {doc.status === "pendente" && (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => copiarLink(doc)}>
                    <Copy className="w-3.5 h-3.5" /> Copiar link
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setVerDoc(doc)}>
                  <Eye className="w-3.5 h-3.5" /> Ver
                </Button>
                {doc.status !== "cancelado" && doc.status !== "assinado" && (
                  <Button variant="ghost" size="sm" onClick={() => cancelar(doc)}>
                    <XCircle className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </LiquidGlassCard>
          );
        })
      )}

      {/* Arquivos anexados (exames, atestados, PDFs, imagens) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Paperclip className="w-4 h-4" /> Arquivos anexados
            </h3>
            <p className="text-xs text-muted-foreground">
              Exames, atestados e outros documentos do paciente (máx. 25MB por arquivo).
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => uploadRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Anexar arquivo
          </Button>
          <input
            ref={uploadRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        {arquivos.length === 0 ? (
          <LiquidGlassCard draggable={false} className="p-6 text-center">
            <Paperclip className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Nenhum arquivo anexado. Clique em "Anexar arquivo" para enviar exames ou documentos.
            </p>
          </LiquidGlassCard>
        ) : (
          arquivos.map((arq) => (
            <LiquidGlassCard
              key={arq.id}
              draggable={false}
              className="p-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Paperclip className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{arq.nome}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatBytes(arq.tamanho)}
                    {arq.tamanho ? " • " : ""}
                    {new Date(arq.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => baixarArquivo(arq)}
                >
                  <Download className="w-3.5 h-3.5" /> Abrir
                </Button>
                <Button variant="ghost" size="sm" onClick={() => excluirArquivo(arq)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </LiquidGlassCard>
          ))
        )}
      </div>


      <ResponsiveDialog
        open={openNovo}
        onOpenChange={setOpenNovo}
        title="Emitir documento"
        description="Escolha um modelo (ou edite livremente) e gere o link de assinatura."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenNovo(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button onClick={emitir} disabled={emitindo} className="flex-1 sm:flex-none">
              {emitindo ? "Emitindo…" : "Emitir e gerar link"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select value={modeloId} onValueChange={onSelectModelo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {modelos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Validade do link (dias)</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={diasValidade}
                onChange={(e) => setDiasValidade(Number(e.target.value) || 7)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Conteúdo (variáveis serão substituídas automaticamente)</Label>
            <Textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={10}
              className="font-mono text-xs"
            />
          </div>
          {previewRenderizado && (
            <div className="space-y-2">
              <Label className="text-xs">Pré-visualização</Label>
              <div className="rounded-md border border-border bg-card/50 p-3 max-h-56 overflow-auto">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-sans">
                  {previewRenderizado}
                </pre>
              </div>
            </div>
          )}
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={!!linkGerado}
        onOpenChange={(o) => !o && setLinkGerado(null)}
        title="Link gerado"
        description="Envie este link ao paciente. Ele é único e temporário."
        footer={<Button onClick={() => setLinkGerado(null)} className="flex-1 sm:flex-none">Fechar</Button>}
      >
        <div className="space-y-2">
          <Input readOnly value={linkGerado ?? ""} className="font-mono text-xs" />
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              if (linkGerado) {
                navigator.clipboard.writeText(linkGerado);
                toast.success("Link copiado");
              }
            }}
          >
            <Copy className="w-3.5 h-3.5" /> Copiar
          </Button>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={!!verDoc}
        onOpenChange={(o) => !o && setVerDoc(null)}
        title={verDoc?.titulo || "Documento"}
        footer={<Button onClick={() => setVerDoc(null)} className="flex-1 sm:flex-none">Fechar</Button>}
      >
        {verDoc && (
          <div className="space-y-3">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans max-h-[60vh] overflow-auto">
              {verDoc.conteudo_renderizado}
            </pre>
            {verDoc.assinatura_paciente_dataurl && (
              <div className="space-y-2">
                <Label className="text-xs">Assinatura do paciente</Label>
                <img
                  src={verDoc.assinatura_paciente_dataurl}
                  alt="Assinatura"
                  className="bg-black/40 rounded border border-border max-h-32"
                />
                {verDoc.assinado_em && (
                  <p className="text-[10px] text-muted-foreground">
                    Assinado em {new Date(verDoc.assinado_em).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};
