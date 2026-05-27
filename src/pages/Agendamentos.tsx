import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Agendamento, Paciente, Dentista, ProcedimentoConsulta, procedimentoConsultaLabels, FormaPagamento, formaPagamentoLabels } from "@/types";
import { agendamentoService } from "@/services/agendamentoService";
import { pacienteService } from "@/services/pacienteService";
import { dentistaService } from "@/services/dentistaService";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

const emptyAgendamento = (): Omit<Agendamento, "id" | "created_at"> => ({
  data: "", horario: "", horario_fim: "", paciente_id: "", dentista_id: "", procedimento: "avaliacao", status: "agendado", valor: 0, forma_pagamento: "dinheiro", parcelas: 1, observacoes: "",
});

const formatDataBR = (data: string) => {
  if (!data) return "—";
  const [y, m, d] = data.split("-");
  if (!y || !m || !d) return data;
  return `${d}/${m}/${y}`;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  agendado: { label: "Agendado", className: "bg-info/10 text-info border-info/20" },
  confirmado: { label: "Confirmado", className: "bg-primary/10 text-primary border-primary/20" },
  realizado: { label: "Realizado", className: "bg-success/10 text-success border-success/20" },
  cancelado: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Agendamentos = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAgendamento());

  const loadData = async () => {
    try {
      const [ag, pac, den] = await Promise.all([
        agendamentoService.listar(),
        pacienteService.listar(),
        dentistaService.listar(),
      ]);
      setAgendamentos(ag);
      setPacientes(pac);
      setDentistas(den);
    } catch (err) {
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getPacienteNome = (id: string) => pacientes.find((p) => p.id === id)?.nome || "—";
  const getDentistaNome = (id: string) => dentistas.find((d) => d.id === id)?.nome || "—";

  const filtered = agendamentos.filter(
    (a) =>
      getPacienteNome(a.paciente_id).toLowerCase().includes(search.toLowerCase()) ||
      getDentistaNome(a.dentista_id).toLowerCase().includes(search.toLowerCase()) ||
      a.data.includes(search)
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyAgendamento());
    setDialogOpen(true);
  };

  const openEdit = (a: Agendamento) => {
    setEditingId(a.id);
    setForm({ data: a.data, horario: a.horario, paciente_id: a.paciente_id, dentista_id: a.dentista_id, procedimento: a.procedimento, status: a.status, valor: a.valor, forma_pagamento: a.forma_pagamento, parcelas: a.parcelas, observacoes: a.observacoes || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.data || !form.horario || !form.paciente_id || !form.dentista_id) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await agendamentoService.atualizar(editingId, form);
        toast({ title: "Agendamento atualizado com sucesso" });
      } else {
        await agendamentoService.criar(form);
        toast({ title: "Agendamento criado com sucesso" });
      }
      await loadData();
      setDialogOpen(false);
    } catch (err) {
      toast({ title: "Erro ao salvar agendamento", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await agendamentoService.excluir(deletingId);
        await loadData();
        toast({ title: "Agendamento excluído" });
      } catch (err) {
        toast({ title: "Erro ao excluir", variant: "destructive" });
      }
    }
    setDeleteOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerenciamento de consultas e horários
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          Nova Consulta
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por paciente, dentista ou data..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <LiquidGlassCard className="overflow-hidden" draggable={false}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5">
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Horário</TableHead>
                <TableHead className="font-semibold">Paciente</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Dentista</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Procedimento</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : filtered.map((a) => {
                const st = statusConfig[a.status] || statusConfig.agendado;
                return (
                  <TableRow key={a.id} className="hover:bg-white/5 transition-colors">
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />
                        {formatDataBR(a.data)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm font-mono">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />
                        <div className="flex flex-col leading-tight">
                          <span>{a.horario}</span>
                          {a.horario_fim && (
                            <span className="text-xs text-muted-foreground">{a.horario_fim}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{getPacienteNome(a.paciente_id)}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{getDentistaNome(a.dentista_id)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="font-medium">{procedimentoConsultaLabels[a.procedimento]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={st.className}>{st.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setDeletingId(a.id); setDeleteOpen(true); }} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </LiquidGlassCard>

      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingId ? "Editar Consulta" : "Nova Consulta"}
        description={editingId ? "Atualize os dados da consulta." : "Preencha os dados para criar uma nova consulta."}
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">Cancelar</Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none">{editingId ? "Salvar" : "Agendar"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Data *</Label>
            <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Horário *</Label>
            <Input type="time" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Paciente *</Label>
            <Select value={form.paciente_id} onValueChange={(v) => setForm({ ...form, paciente_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {pacientes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Dentista *</Label>
            <Select value={form.dentista_id} onValueChange={(v) => setForm({ ...form, dentista_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {dentistas.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Procedimento *</Label>
            <Select value={form.procedimento} onValueChange={(v: ProcedimentoConsulta) => setForm({ ...form, procedimento: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione o procedimento..." /></SelectTrigger>
              <SelectContent>
                {Object.entries(procedimentoConsultaLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Input type="number" min="0" step="0.01" value={form.valor || ""} onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} placeholder="0,00" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Forma de Pagamento *</Label>
            <Select value={form.forma_pagamento} onValueChange={(v: FormaPagamento) => setForm({ ...form, forma_pagamento: v, parcelas: v === "credito" || v === "boleto" ? form.parcelas : 1 })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {Object.entries(formaPagamentoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(form.forma_pagamento === "credito" || form.forma_pagamento === "boleto") && (
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Parcelas</Label>
              <Select value={String(form.parcelas)} onValueChange={(v) => setForm({ ...form, parcelas: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className={form.forma_pagamento === "credito" || form.forma_pagamento === "boleto" ? "" : "sm:col-span-2"}>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Observações</Label>
            <Input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações opcionais" />
          </div>
        </div>
      </ResponsiveDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
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

export default Agendamentos;
