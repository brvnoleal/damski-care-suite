import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Paciente } from "@/types";
import { pacienteService } from "@/services/pacienteService";

const emptyPaciente = (): Omit<Paciente, "id" | "created_at"> => ({
  nome: "", cpf: "", telefone: "", email: "", instagram: "", data_nascimento: "",
  cep: "", estado: "", cidade: "", bairro: "", rua: "", numero: "", complemento: "", ponto_referencia: "",
  status: "ativo",
});

const Pacientes = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>(pacienteService.listar());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPaciente());

  const filtered = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cpf.includes(search)
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyPaciente());
    setDialogOpen(true);
  };

  const openEdit = (p: Paciente) => {
    setEditingId(p.id);
    setForm({
      nome: p.nome, cpf: p.cpf, telefone: p.telefone, email: p.email, instagram: p.instagram || "",
      data_nascimento: p.data_nascimento, cep: p.cep || "", estado: p.estado || "", cidade: p.cidade || "",
      bairro: p.bairro || "", rua: p.rua || "", numero: p.numero || "", complemento: p.complemento || "",
      ponto_referencia: p.ponto_referencia || "", status: p.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.cpf || !form.data_nascimento) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (editingId) {
      pacienteService.atualizar(editingId, form);
      toast({ title: "Paciente atualizado com sucesso" });
    } else {
      pacienteService.criar(form);
      toast({ title: "Paciente cadastrado com sucesso" });
    }
    setPacientes(pacienteService.listar());
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      pacienteService.excluir(deletingId);
      setPacientes(pacienteService.listar());
      toast({ title: "Paciente excluído" });
    }
    setDeleteOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastro e gerenciamento de pacientes — CRUD completo
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

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

      <div className="rounded-xl border border-border bg-card shadow-elegant overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">CPF</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Telefone</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Instagram</TableHead>
              <TableHead className="font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">{p.cpf}</TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">{p.telefone}</TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">{p.email}</TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">{p.instagram || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/pacientes/${p.id}`} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setDeletingId(p.id); setDeleteOpen(true); }} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do paciente." : "Preencha os dados para cadastrar um novo paciente."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="sm:col-span-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
            </div>
            <div>
              <Label>CPF *</Label>
              <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
            </div>
            <div>
              <Label>Data de Nascimento *</Label>
              <Input type="date" value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-0000" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@usuario" />
            </div>

            {/* Endereço */}
            <div className="sm:col-span-2 pt-2">
              <p className="text-sm font-semibold text-foreground border-b border-border pb-1">Endereço</p>
            </div>
            <div>
              <Label>CEP</Label>
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
              <Label>Estado</Label>
              <Input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="SP" />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="São Paulo" />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} placeholder="Centro" />
            </div>
            <div className="sm:col-span-2">
              <Label>Rua</Label>
              <Input value={form.rua} onChange={(e) => setForm({ ...form, rua: e.target.value })} placeholder="Rua Exemplo" />
            </div>
            <div>
              <Label>Número</Label>
              <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="123" />
            </div>
            <div>
              <Label>Complemento</Label>
              <Input value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} placeholder="Apto 45" />
            </div>
            <div className="sm:col-span-2">
              <Label>Ponto de Referência</Label>
              <Input value={form.ponto_referencia} onChange={(e) => setForm({ ...form, ponto_referencia: e.target.value })} placeholder="Próximo ao mercado" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
