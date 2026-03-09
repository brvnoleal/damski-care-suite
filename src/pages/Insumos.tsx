import { useState, useEffect } from "react";
import { Search, Plus, Filter, AlertTriangle, CheckCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { insumoService, Insumo } from "@/services/insumoService";

const getExpiryStatus = (days: number) => {
  if (days <= 15) return { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20" };
  if (days <= 30) return { label: "Atenção", className: "bg-warning/10 text-warning border-warning/20" };
  return { label: "OK", className: "bg-success/10 text-success border-success/20" };
};

const calcDaysLeft = (validadeISO: string): number => {
  const expiry = new Date(validadeISO + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const Insumos = () => {
  const [search, setSearch] = useState("");
  const [supplies, setSupplies] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Insumo | null>(null);
  const [deletingSupply, setDeletingSupply] = useState<Insumo | null>(null);
  const [form, setForm] = useState({ nome: "", fabricante: "", lote: "", validade: "", quantidade: "" });

  const loadData = async () => {
    try {
      const data = await insumoService.listar();
      setSupplies(data);
    } catch {
      toast({ title: "Erro ao carregar insumos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = supplies.filter((s) =>
    s.nome.toLowerCase().includes(search.toLowerCase()) ||
    s.lote.toLowerCase().includes(search.toLowerCase())
  );

  const summaryStats = supplies.reduce(
    (acc, s) => {
      const days = calcDaysLeft(s.validade);
      if (days <= 15) acc.critical++;
      else if (days <= 30) acc.warning++;
      else acc.ok++;
      return acc;
    },
    { critical: 0, warning: 0, ok: 0 }
  );

  const openCreate = () => {
    setEditingSupply(null);
    setForm({ nome: "", fabricante: "", lote: "", validade: "", quantidade: "" });
    setDialogOpen(true);
  };

  const openEdit = (supply: Insumo) => {
    setEditingSupply(supply);
    setForm({
      nome: supply.nome, fabricante: supply.fabricante, lote: supply.lote,
      validade: supply.validade, quantidade: String(supply.quantidade),
    });
    setDialogOpen(true);
  };

  const openDelete = (supply: Insumo) => {
    setDeletingSupply(supply);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.fabricante || !form.lote || !form.validade || !form.quantidade) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    try {
      if (editingSupply) {
        await insumoService.atualizar(editingSupply.id, {
          nome: form.nome, fabricante: form.fabricante, lote: form.lote,
          validade: form.validade, quantidade: parseInt(form.quantidade, 10),
        });
        toast({ title: "Insumo atualizado com sucesso!" });
      } else {
        await insumoService.criar({
          nome: form.nome, fabricante: form.fabricante, lote: form.lote,
          validade: form.validade, quantidade: parseInt(form.quantidade, 10), pacientes_vinculados: 0,
        });
        toast({ title: "Insumo cadastrado com sucesso!" });
      }
      await loadData();
      setDialogOpen(false);
    } catch {
      toast({ title: "Erro ao salvar insumo", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deletingSupply) return;
    try {
      await insumoService.excluir(deletingSupply.id);
      await loadData();
      toast({ title: "Insumo excluído com sucesso!" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
    setDeleteDialogOpen(false);
    setDeletingSupply(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Controle de Insumos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rastreabilidade por lote conforme RDC 1.002/2025
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 backdrop-blur-xl bg-primary/80 border border-white/20 text-primary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,0.25)] hover:bg-primary/90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.3)] transition-all">
          <Plus className="w-4 h-4" />
          Cadastrar Insumo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <LiquidGlassCard draggable={false} className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-foreground">{summaryStats.critical} Crítico{summaryStats.critical !== 1 ? "s" : ""}</p>
              <p className="text-xs text-muted-foreground">Vencimento em até 15 dias</p>
            </div>
          </div>
        </LiquidGlassCard>
        <LiquidGlassCard draggable={false} className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm font-semibold text-foreground">{summaryStats.warning} Atenção</p>
              <p className="text-xs text-muted-foreground">Vencimento em até 30 dias</p>
            </div>
          </div>
        </LiquidGlassCard>
        <LiquidGlassCard draggable={false} className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-semibold text-foreground">{summaryStats.ok} Em dia</p>
              <p className="text-xs text-muted-foreground">Validade superior a 30 dias</p>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por insumo ou lote..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      <LiquidGlassCard className="overflow-hidden" draggable={false}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5">
                <TableHead className="font-semibold">Insumo</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Fabricante</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Lote</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Validade</TableHead>
                <TableHead className="font-semibold text-center">Qtd</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center hidden lg:table-cell">Pacientes</TableHead>
                <TableHead className="font-semibold w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : filtered.map((supply) => {
                const daysLeft = calcDaysLeft(supply.validade);
                const status = getExpiryStatus(daysLeft);
                return (
                  <TableRow key={supply.id} className="hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium">{supply.nome}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{supply.fabricante}</TableCell>
                    <TableCell className="font-mono text-xs text-gold-dark font-semibold hidden sm:table-cell">{supply.lote}</TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {formatDateBR(supply.validade)}
                      <span className="text-xs ml-1">({daysLeft}d)</span>
                    </TableCell>
                    <TableCell className="text-center">{supply.quantidade}</TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center hidden lg:table-cell">{supply.pacientes_vinculados}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(supply)} className="gap-2">
                            <Pencil className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDelete(supply)} className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </LiquidGlassCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSupply ? "Editar Insumo" : "Cadastrar Insumo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="supply-name">Nome do Insumo</Label>
              <Input id="supply-name" placeholder="Ex: Ácido Hialurônico 20mg/ml" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supply-manufacturer">Fabricante</Label>
              <Input id="supply-manufacturer" placeholder="Ex: Galderma" value={form.fabricante} onChange={(e) => setForm({ ...form, fabricante: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supply-lot">Lote</Label>
                <Input id="supply-lot" placeholder="Ex: AH2024-089" value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supply-qty">Quantidade</Label>
                <Input id="supply-qty" type="number" min="1" placeholder="0" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supply-expiry">Validade</Label>
              <Input id="supply-expiry" type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editingSupply ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Insumo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deletingSupply?.nome}</strong> (Lote: {deletingSupply?.lote})?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Insumos;
