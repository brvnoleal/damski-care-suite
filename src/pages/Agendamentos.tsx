import { useState } from "react";
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Agendamento } from "@/types";
import { agendamentoService } from "@/services/agendamentoService";
import { pacienteService } from "@/services/pacienteService";
import { dentistaService } from "@/services/dentistaService";

const emptyAgendamento = (): Omit<Agendamento, "id" | "created_at"> => ({
  data: "", horario: "", paciente_id: "", dentista_id: "", status: "agendado", observacoes: "",
});

const statusConfig: Record<string, { label: string; className: string }> = {
  agendado: { label: "Agendado", className: "bg-info/10 text-info border-info/20" },
  confirmado: { label: "Confirmado", className: "bg-primary/10 text-primary border-primary/20" },
  realizado: { label: "Realizado", className: "bg-success/10 text-success border-success/20" },
  cancelado: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Agendamentos = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(agendamentoService.listar());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAgendamento());

  const pacientes = pacienteService.listar();
  const dentistas = dentistaService.listar();

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
    setForm({ data: a.data, horario: a.horario, paciente_id: a.paciente_id, dentista_id: a.dentista_id, status: a.status, observacoes: a.observacoes || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.data || !form.horario || !form.paciente_id || !form.dentista_id) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (editingId) {
      agendamentoService.atualizar(editingId, form);
      toast({ title: "Agendamento atualizado com sucesso" });
    } else {
      agendamentoService.criar(form);
      toast({ title: "Agendamento criado com sucesso" });
    }
    setAgendamentos(agendamentoService.listar());
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      agendamentoService.excluir(deletingId);
      setAgendamentos(agendamentoService.listar());
      toast({ title: "Agendamento excluído" });
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
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
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

      <div className="rounded-xl border border-border bg-card shadow-elegant overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Data</TableHead>
              <TableHead className="font-semibold">Horário</TableHead>
              <TableHead className="font-semibold">Paciente</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Dentista</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => {
              const st = statusConfig[a.status] || statusConfig.agendado;
              return (
                <TableRow key={a.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {a.data}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm font-mono">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {a.horario}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{getPacienteNome(a.paciente_id)}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{getDentistaNome(a.dentista_id)}</TableCell>
                  <TableCell>
                    <Badge className={st.className}>{st.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do agendamento." : "Preencha os dados para criar um novo agendamento."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div>
              <Label>Data *</Label>
              <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div>
              <Label>Horário *</Label>
              <Input type="time" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
            </div>
            <div>
              <Label>Paciente *</Label>
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
              <Label>Dentista *</Label>
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
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: Agendamento["status"]) => setForm({ ...form, status: v })}>
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
              <Label>Observações</Label>
              <Input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações opcionais" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Agendar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
