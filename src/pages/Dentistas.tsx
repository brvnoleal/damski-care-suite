import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
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
import { Dentista } from "@/types";
import { dentistaService } from "@/services/dentistaService";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

const emptyDentista = (): Omit<Dentista, "id" | "created_at"> => ({
  nome: "", especialidade: "", cro: "", telefone: "", email: "", instagram: "",
  cep: "", estado: "", cidade: "", bairro: "", rua: "", numero: "", complemento: "", ponto_referencia: "",
  status: "ativo",
});

const Dentistas = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyDentista());

  const loadData = async () => {
    try {
      const data = await dentistaService.listar();
      setDentistas(data);
    } catch (err) {
      toast({ title: "Erro ao carregar dentistas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = dentistas.filter(
    (d) =>
      d.nome.toLowerCase().includes(search.toLowerCase()) ||
      d.cro.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyDentista());
    setDialogOpen(true);
  };

  const openEdit = (d: Dentista) => {
    setEditingId(d.id);
    setForm({ nome: d.nome, especialidade: d.especialidade, cro: d.cro, telefone: d.telefone || "", email: d.email || "", instagram: d.instagram || "", cep: d.cep || "", estado: d.estado || "", cidade: d.cidade || "", bairro: d.bairro || "", rua: d.rua || "", numero: d.numero || "", complemento: d.complemento || "", ponto_referencia: d.ponto_referencia || "", status: d.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome || !form.cro || !form.especialidade) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await dentistaService.atualizar(editingId, form);
        toast({ title: "Dentista atualizado com sucesso" });
      } else {
        await dentistaService.criar(form);
        toast({ title: "Dentista cadastrado com sucesso" });
      }
      await loadData();
      setDialogOpen(false);
    } catch (err) {
      toast({ title: "Erro ao salvar dentista", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await dentistaService.excluir(deletingId);
        await loadData();
        toast({ title: "Dentista excluído" });
      } catch (err) {
        toast({ title: "Erro ao excluir dentista", variant: "destructive" });
      }
    }
    setDeleteOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dentistas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastro e gerenciamento do corpo clínico
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 backdrop-blur-xl bg-primary/80 border border-white/20 text-primary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,0.25)] hover:bg-primary/90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.3)] transition-all">
          <Plus className="w-4 h-4" />
          Novo Dentista
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CRO..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <LiquidGlassCard className="overflow-hidden" draggable={false}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">CRO</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Especialidade</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Telefone</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : filtered.map((d) => (
                <TableRow key={d.id} className="hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium">{d.nome}</TableCell>
                  <TableCell className="font-mono text-xs text-primary font-semibold">{d.cro}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{d.especialidade}</TableCell>
                  <TableCell className="text-muted-foreground hidden lg:table-cell">{d.telefone}</TableCell>
                  <TableCell>
                    <Badge className={d.status === "ativo" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(d)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setDeletingId(d.id); setDeleteOpen(true); }} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum dentista encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </LiquidGlassCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Dentista" : "Novo Dentista"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do dentista." : "Preencha os dados para cadastrar um novo dentista."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="sm:col-span-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
            </div>
            <div>
              <Label>CRO *</Label>
              <Input value={form.cro} onChange={(e) => setForm({ ...form, cro: e.target.value })} placeholder="CRO-XX 00000" />
            </div>
            <div>
              <Label>Especialidade *</Label>
              <Input value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} placeholder="Ex: Ortodontia" />
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

            <div className="sm:col-span-2 pt-2">
              <h3 className="text-sm font-semibold text-foreground mb-3">Endereço</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>CEP</Label>
                  <Input
                    value={form.cep}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
                      const formatted = raw.length > 5 ? raw.slice(0, 5) + "-" + raw.slice(5) : raw;
                      setForm((prev) => ({ ...prev, cep: formatted }));
                      if (raw.length === 8) {
                        fetch(`https://viacep.com.br/ws/${raw}/json/`)
                          .then((r) => r.json())
                          .then((data) => {
                            if (!data.erro) {
                              setForm((prev) => ({
                                ...prev,
                                estado: data.uf || prev.estado,
                                cidade: data.localidade || prev.cidade,
                                bairro: data.bairro || prev.bairro,
                                rua: data.logradouro || prev.rua,
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
                  <Input value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} placeholder="Sala 1" />
                </div>
                <div>
                  <Label>Ponto de Referência</Label>
                  <Input value={form.ponto_referencia} onChange={(e) => setForm({ ...form, ponto_referencia: e.target.value })} placeholder="Próximo ao..." />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Dentista</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este dentista? Esta ação não pode ser desfeita.
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

export default Dentistas;
