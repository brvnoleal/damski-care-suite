import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, Eye, Edit, Trash2, Download } from "lucide-react";
import { exportToXlsx } from "@/lib/exportXlsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Paciente } from "@/types";
import { pacienteService } from "@/services/pacienteService";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { maskCpf, isValidCpf } from "@/lib/utils";
import { FadeIn } from "@/components/FadeIn";
import { supabase } from "@/integrations/supabase/client";

const emptyPaciente = (): Omit<Paciente, "id" | "created_at"> => ({
  nome: "", cpf: "", rg: "", emissor: "", sexo: "", estado_civil: "", situacao_profissional: "",
  plano: "", numero_plano: "", numero_prontuario: "",
  telefone: "", email: "", instagram: "", data_nascimento: "",
  cep: "", estado: "", cidade: "", bairro: "", rua: "", numero: "", complemento: "", ponto_referencia: "",
  status: "ativo",
});

const Pacientes = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPaciente());
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    try {
      const data = await pacienteService.listar();
      setPacientes(data);
    } catch (err) {
      toast({ title: "Erro ao carregar pacientes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cpf.includes(search)
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyPaciente());
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (p: Paciente) => {
    setEditingId(p.id);
    setErrors({});
    setForm({
      nome: p.nome, cpf: p.cpf,
      rg: p.rg || "", emissor: p.emissor || "", sexo: p.sexo || "",
      estado_civil: p.estado_civil || "", situacao_profissional: p.situacao_profissional || "",
      plano: p.plano || "", numero_plano: p.numero_plano || "", numero_prontuario: p.numero_prontuario || "",
      telefone: p.telefone, email: p.email, instagram: p.instagram || "",
      data_nascimento: p.data_nascimento, cep: p.cep || "", estado: p.estado || "", cidade: p.cidade || "",
      bairro: p.bairro || "", rua: p.rua || "", numero: p.numero || "", complemento: p.complemento || "",
      ponto_referencia: p.ponto_referencia || "", status: p.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.nome) newErrors.nome = true;
    if (!form.cpf) newErrors.cpf = true;
    if (!form.data_nascimento) newErrors.data_nascimento = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ title: "Preencha os campos obrigatórios", description: "Os campos destacados em vermelho são obrigatórios.", variant: "destructive" });
      return;
    }
    if (!isValidCpf(form.cpf)) {
      setErrors({ cpf: true });
      toast({ title: "CPF inválido", description: "Verifique os dígitos e tente novamente.", variant: "destructive" });
      return;
    }
    try {
      let query = supabase.from("paciente").select("id").eq("cpf", form.cpf);
      if (editingId) query = query.neq("id", editingId);
      const { data: dup, error: dupErr } = await query.maybeSingle();
      if (dupErr) throw dupErr;
      if (dup) {
        setErrors({ cpf: true });
        toast({ title: "CPF já cadastrado", description: "Já existe um paciente com este CPF no sistema.", variant: "destructive" });
        return;
      }

      if (editingId) {
        await pacienteService.atualizar(editingId, form);
        toast({ title: "Paciente atualizado com sucesso" });
      } else {
        await pacienteService.criar(form);
        toast({ title: "Paciente cadastrado com sucesso" });
      }
      setErrors({});
      await loadData();
      setDialogOpen(false);
    } catch (err) {
      toast({ title: "Erro ao salvar paciente", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await pacienteService.excluir(deletingId);
        await loadData();
        toast({ title: "Paciente excluído" });
      } catch (err) {
        toast({ title: "Erro ao excluir paciente", variant: "destructive" });
      }
    }
    setDeleteOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastro e gerenciamento de pacientes — CRUD completo
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            Novo Paciente
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>

      <LiquidGlassCard className="overflow-hidden" draggable={false}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">CPF</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Telefone</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Instagram</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{maskCpf(p.cpf)}</TableCell>
                  <TableCell className="text-muted-foreground hidden lg:table-cell">{p.telefone}</TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">{p.email}</TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">{p.instagram || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/pacientes/${p.id}`} className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setDeletingId(p.id); setDeleteOpen(true); }} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </LiquidGlassCard>

      </FadeIn>

      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingId ? "Editar Paciente" : "Novo Paciente"}
        description={editingId ? "Atualize os dados do paciente." : "Preencha os dados para cadastrar um novo paciente."}
        className="sm:max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">Cancelar</Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none">{editingId ? "Salvar" : "Cadastrar"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="sm:col-span-2">
            <Label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${errors.nome ? "text-destructive" : "text-muted-foreground"}`}>Nome *</Label>
            <Input
              value={form.nome}
              onChange={(e) => { setForm({ ...form, nome: e.target.value }); if (errors.nome) setErrors({ ...errors, nome: false }); }}
              placeholder="Nome completo"
              className={errors.nome ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </div>
          <div>
            <Label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${errors.cpf ? "text-destructive" : "text-muted-foreground"}`}>CPF *</Label>
            <Input
              value={form.cpf}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                const formatted = raw
                  .replace(/(\d{3})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                setForm({ ...form, cpf: formatted });
                if (errors.cpf) setErrors({ ...errors, cpf: false });
              }}
              placeholder="000.000.000-00"
              className={errors.cpf ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </div>
          <div>
            <Label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${errors.data_nascimento ? "text-destructive" : "text-muted-foreground"}`}>Data de Nascimento *</Label>
            <Input
              type="date"
              value={form.data_nascimento}
              onChange={(e) => { setForm({ ...form, data_nascimento: e.target.value }); if (errors.data_nascimento) setErrors({ ...errors, data_nascimento: false }); }}
              className={errors.data_nascimento ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Telefone</Label>
            <Input value={form.telefone} onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
              const formatted = raw.length <= 10
                ? raw.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
                : raw.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
              setForm({ ...form, telefone: formatted });
            }} placeholder="(11) 99999-0000" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Instagram</Label>
            <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@usuario" />
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
            <Input value={form.rg} onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
              const formatted = raw
                .replace(/(\d{2})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
              setForm({ ...form, rg: formatted });
            }} placeholder="00.000.000-0" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Órgão Emissor</Label>
            <Input value={form.emissor} onChange={(e) => setForm({ ...form, emissor: e.target.value })} placeholder="SSP/SP" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sexo</Label>
            <Select value={form.sexo || ""} onValueChange={(v) => setForm({ ...form, sexo: v })}>
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
            <Select value={form.estado_civil || ""} onValueChange={(v) => setForm({ ...form, estado_civil: v })}>
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
            <Select value={form.situacao_profissional || ""} onValueChange={(v) => setForm({ ...form, situacao_profissional: v })}>
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
            <Input value={form.plano} onChange={(e) => setForm({ ...form, plano: e.target.value })} placeholder="Nome do plano" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Número do Plano</Label>
            <Input value={form.numero_plano} onChange={(e) => setForm({ ...form, numero_plano: e.target.value })} placeholder="000000" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Número do Prontuário</Label>
            <Input value={form.numero_prontuario} onChange={(e) => setForm({ ...form, numero_prontuario: e.target.value })} placeholder="000000" />
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
              value={form.cep}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
                const masked = raw.length > 5 ? raw.slice(0, 5) + "-" + raw.slice(5) : raw;
                setForm({ ...form, cep: masked });
                if (raw.length === 8) {
                  fetch(`https://viacep.com.br/ws/${raw}/json/`)
                    .then((r) => r.json())
                    .then((data) => {
                      if (!data.erro) {
                        setForm((prev) => ({
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
            <Input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="SP" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Cidade</Label>
            <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="São Paulo" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Bairro</Label>
            <Input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} placeholder="Centro" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Rua</Label>
            <Input value={form.rua} onChange={(e) => setForm({ ...form, rua: e.target.value })} placeholder="Rua Exemplo" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Número</Label>
            <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="123" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Complemento</Label>
            <Input value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} placeholder="Apto 45" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Ponto de Referência</Label>
            <Input value={form.ponto_referencia} onChange={(e) => setForm({ ...form, ponto_referencia: e.target.value })} placeholder="Próximo ao mercado" />
          </div>
        </div>
      </ResponsiveDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Pacientes;
