import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Edit, Trash2, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useClinicaContext } from "@/hooks/useClinicaContext";
import { documentoService, type DocumentoModelo } from "@/services/documentoService";
import {
  TipoDocumento,
  tipoDocumentoLabels,
  VARIAVEIS_DISPONIVEIS,
} from "@/lib/documentoTemplates";

const tiposEditaveis: TipoDocumento[] = [
  "contrato",
  "tcle",
  "receituario",
  "atestado",
  "personalizado",
];

export const ModelosDocumentosSection = () => {
  const { clinicaId, loading: loadingClinica } = useClinicaContext();
  const [modelos, setModelos] = useState<DocumentoModelo[]>([]);
  const [loading, setLoading] = useState(true);

  const [openEditor, setOpenEditor] = useState(false);
  const [visualizando, setVisualizando] = useState<DocumentoModelo | null>(null);
  const [editando, setEditando] = useState<DocumentoModelo | null>(null);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoDocumento>("personalizado");
  const [conteudo, setConteudo] = useState("");
  const [requerAssinatura, setRequerAssinatura] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      if (clinicaId) await documentoService.garantirModelosPadrao(clinicaId);
      const data = await documentoService.listarModelos();
      setModelos(data);
    } catch (e: any) {
      toast.error(e.message || "Falha ao carregar modelos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingClinica) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingClinica, clinicaId]);

  const novo = () => {
    setEditando(null);
    setNome("");
    setTipo("personalizado");
    setConteudo("");
    setRequerAssinatura(true);
    setOpenEditor(true);
  };

  const editar = (m: DocumentoModelo) => {
    setEditando(m);
    setNome(m.nome);
    setTipo(m.tipo);
    setConteudo(m.conteudo);
    setRequerAssinatura(m.requer_assinatura_paciente);
    setOpenEditor(true);
  };

  const salvar = async () => {
    if (!nome.trim() || !conteudo.trim()) {
      toast.error("Preencha nome e conteúdo");
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await documentoService.atualizarModelo(editando.id, {
          nome,
          conteudo,
          requer_assinatura_paciente: requerAssinatura,
        });
      } else {
        await documentoService.criarModelo({
          tipo,
          nome,
          conteudo,
          requer_assinatura_paciente: requerAssinatura,
        });
      }
      toast.success("Modelo salvo");
      setOpenEditor(false);
      carregar();
    } catch (e: any) {
      toast.error(e.message || "Falha ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (m: DocumentoModelo) => {
    if (!confirm(`Excluir modelo "${m.nome}"?`)) return;
    try {
      await documentoService.excluirModelo(m.id);
      toast.success("Modelo excluído");
      carregar();
    } catch (e: any) {
      toast.error(e.message || "Falha ao excluir");
    }
  };

  const inserirVariavel = (v: string) => {
    setConteudo((c) => c + v);
  };

  const modelosOrdenados = useMemo(
    () =>
      [...modelos].sort((a, b) =>
        (tipoDocumentoLabels[a.tipo] + a.nome).localeCompare(
          tipoDocumentoLabels[b.tipo] + b.nome,
          "pt-BR",
        ),
      ),
    [modelos],
  );

  return (
    <LiquidGlassCard draggable={false} className="p-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Modelos de Documentos</h2>
              <p className="text-xs text-muted-foreground">
                Contratos, TCLE, receituários, atestados e personalizados
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5" onClick={novo}>
            <Plus className="w-4 h-4" /> Novo modelo
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
          </div>
        ) : modelosOrdenados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum modelo cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {modelosOrdenados.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {tipoDocumentoLabels[m.tipo]}
                    </Badge>
                    {m.requer_assinatura_paciente && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                        Requer assinatura
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setVisualizando(m)} title="Visualizar">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => editar(m)} title="Editar">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => excluir(m)} title="Excluir">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ResponsiveDialog
        open={openEditor}
        onOpenChange={setOpenEditor}
        title={editando ? "Editar modelo" : "Novo modelo"}
        description="Use variáveis entre chaves para preencher automaticamente dados do paciente e da clínica."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenEditor(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={salvando} className="flex-1 sm:flex-none">
              {salvando ? "Salvando…" : "Salvar"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={tipo}
                  onValueChange={(v) => setTipo(v as TipoDocumento)}
                  disabled={!!editando}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEditaveis.map((t) => (
                      <SelectItem key={t} value={t}>
                        {tipoDocumentoLabels[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                onDragOver={(e) => {
                  if (e.dataTransfer.types.includes("application/x-variavel")) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                  }
                }}
                onDrop={(e) => {
                  const variavel = e.dataTransfer.getData("application/x-variavel");
                  if (!variavel) return;
                  e.preventDefault();
                  const ta = e.currentTarget;
                  const start = ta.selectionStart ?? conteudo.length;
                  const end = ta.selectionEnd ?? conteudo.length;
                  const novo = conteudo.slice(0, start) + variavel + conteudo.slice(end);
                  setConteudo(novo);
                  requestAnimationFrame(() => {
                    ta.focus();
                    const pos = start + variavel.length;
                    ta.setSelectionRange(pos, pos);
                  });
                }}
                rows={16}
                className="font-mono text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={requerAssinatura}
                onChange={(e) => setRequerAssinatura(e.target.checked)}
              />
              Requer assinatura do paciente
            </label>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Variáveis (arraste ou clique para inserir)</Label>
            <div className="space-y-1 max-h-[420px] overflow-auto pr-1">
              {VARIAVEIS_DISPONIVEIS.map((v) => (
                <button
                  key={v.chave}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", v.chave);
                    e.dataTransfer.setData("application/x-variavel", v.chave);
                  }}
                  onClick={() => inserirVariavel(v.chave)}
                  className="w-full text-left text-xs p-2 rounded hover:bg-white/5 border border-white/10 cursor-grab active:cursor-grabbing"
                >
                  <code className="text-primary">{v.chave}</code>
                  <p className="text-muted-foreground mt-0.5">{v.rotulo}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ResponsiveDialog>
    </LiquidGlassCard>
  );
};
