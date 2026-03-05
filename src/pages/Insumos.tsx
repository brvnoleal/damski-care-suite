import { useState } from "react";
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

interface Supply {
  id: string;
  name: string;
  manufacturer: string;
  lot: string;
  expiry: string;
  qty: number;
  daysLeft: number;
  usedBy: number;
}

let idCounter = 0;
const makeId = () => `supply-${++idCounter}`;

const initialSupplies: Supply[] = [
  { id: makeId(), name: "Ácido Hialurônico 20mg/ml", manufacturer: "Galderma", lot: "AH2024-089", expiry: "15/03/2026", qty: 3, daysLeft: 24, usedBy: 2 },
  { id: makeId(), name: "Toxina Botulínica 100U", manufacturer: "Allergan", lot: "TB2024-156", expiry: "22/03/2026", qty: 8, daysLeft: 31, usedBy: 5 },
  { id: makeId(), name: "Ácido Hialurônico 24mg/ml", manufacturer: "Galderma", lot: "AH2024-112", expiry: "10/06/2026", qty: 12, daysLeft: 111, usedBy: 0 },
  { id: makeId(), name: "Bioestimulador PLLA", manufacturer: "Sinclair", lot: "BIO2024-034", expiry: "01/09/2026", qty: 6, daysLeft: 194, usedBy: 3 },
  { id: makeId(), name: "Fio PDO Espiculado", manufacturer: "Croma", lot: "PDO2024-067", expiry: "28/02/2026", qty: 15, daysLeft: 9, usedBy: 1 },
  { id: makeId(), name: "Enzima Hialuronidase", manufacturer: "Hylenex", lot: "HYA2024-023", expiry: "15/04/2026", qty: 4, daysLeft: 55, usedBy: 0 },
];

const getExpiryStatus = (days: number) => {
  if (days <= 15) return { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20" };
  if (days <= 30) return { label: "Atenção", className: "bg-warning/10 text-warning border-warning/20" };
  return { label: "OK", className: "bg-success/10 text-success border-success/20" };
};

const calcDaysLeft = (expiryDate: string): number => {
  const [day, month, year] = expiryDate.split("/").map(Number);
  const expiry = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const toInputDate = (ddmmyyyy: string) => {
  const [d, m, y] = ddmmyyyy.split("/");
  return `${y}-${m}-${d}`;
};

const Insumos = () => {
  const [search, setSearch] = useState("");
  const [supplies, setSupplies] = useState<Supply[]>(initialSupplies);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [deletingSupply, setDeletingSupply] = useState<Supply | null>(null);
  const [form, setForm] = useState({ name: "", manufacturer: "", lot: "", expiry: "", qty: "" });

  const filtered = supplies.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.lot.toLowerCase().includes(search.toLowerCase())
  );

  const summaryStats = supplies.reduce(
    (acc, s) => {
      if (s.daysLeft <= 15) acc.critical++;
      else if (s.daysLeft <= 30) acc.warning++;
      else acc.ok++;
      return acc;
    },
    { critical: 0, warning: 0, ok: 0 }
  );

  const openCreate = () => {
    setEditingSupply(null);
    setForm({ name: "", manufacturer: "", lot: "", expiry: "", qty: "" });
    setDialogOpen(true);
  };

  const openEdit = (supply: Supply) => {
    setEditingSupply(supply);
    setForm({
      name: supply.name,
      manufacturer: supply.manufacturer,
      lot: supply.lot,
      expiry: toInputDate(supply.expiry),
      qty: String(supply.qty),
    });
    setDialogOpen(true);
  };

  const openDelete = (supply: Supply) => {
    setDeletingSupply(supply);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.manufacturer || !form.lot || !form.expiry || !form.qty) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const [y, m, d] = form.expiry.split("-");
    const expiryFormatted = `${d}/${m}/${y}`;
    const daysLeft = calcDaysLeft(expiryFormatted);

    if (editingSupply) {
      setSupplies((prev) =>
        prev.map((s) =>
          s.id === editingSupply.id
            ? { ...s, name: form.name, manufacturer: form.manufacturer, lot: form.lot, expiry: expiryFormatted, qty: parseInt(form.qty, 10), daysLeft }
            : s
        )
      );
      toast({ title: "Insumo atualizado com sucesso!" });
    } else {
      const newSupply: Supply = {
        id: makeId(),
        name: form.name,
        manufacturer: form.manufacturer,
        lot: form.lot,
        expiry: expiryFormatted,
        qty: parseInt(form.qty, 10),
        daysLeft,
        usedBy: 0,
      };
      setSupplies((prev) => [newSupply, ...prev]);
      toast({ title: "Insumo cadastrado com sucesso!" });
    }

    setForm({ name: "", manufacturer: "", lot: "", expiry: "", qty: "" });
    setEditingSupply(null);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deletingSupply) return;
    setSupplies((prev) => prev.filter((s) => s.id !== deletingSupply.id));
    setDeleteDialogOpen(false);
    setDeletingSupply(null);
    toast({ title: "Insumo excluído com sucesso!" });
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
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-burgundy-light gap-2">
          <Plus className="w-4 h-4" />
          Cadastrar Insumo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-foreground">{summaryStats.critical} Crítico{summaryStats.critical !== 1 ? "s" : ""}</p>
            <p className="text-xs text-muted-foreground">Vencimento em até 15 dias</p>
          </div>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <p className="text-sm font-semibold text-foreground">{summaryStats.warning} Atenção</p>
            <p className="text-xs text-muted-foreground">Vencimento em até 30 dias</p>
          </div>
        </div>
        <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-semibold text-foreground">{summaryStats.ok} Em dia</p>
            <p className="text-xs text-muted-foreground">Validade superior a 30 dias</p>
          </div>
        </div>
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

      <div className="rounded-xl border border-border bg-card shadow-elegant overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Insumo</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Fabricante</TableHead>
              <TableHead className="font-semibold">Lote</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Validade</TableHead>
              <TableHead className="font-semibold text-center">Qtd</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-center hidden lg:table-cell">Pacientes</TableHead>
              <TableHead className="font-semibold w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((supply) => {
              const status = getExpiryStatus(supply.daysLeft);
              return (
                <TableRow key={supply.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{supply.name}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{supply.manufacturer}</TableCell>
                  <TableCell className="font-mono text-xs text-gold-dark font-semibold">{supply.lot}</TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {supply.expiry}
                    <span className="text-xs ml-1">({supply.daysLeft}d)</span>
                  </TableCell>
                  <TableCell className="text-center">{supply.qty}</TableCell>
                  <TableCell>
                    <Badge className={status.className}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center hidden lg:table-cell">{supply.usedBy}</TableCell>
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

      {/* Dialog de Cadastro / Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSupply ? "Editar Insumo" : "Cadastrar Insumo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="supply-name">Nome do Insumo</Label>
              <Input id="supply-name" placeholder="Ex: Ácido Hialurônico 20mg/ml" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supply-manufacturer">Fabricante</Label>
              <Input id="supply-manufacturer" placeholder="Ex: Galderma" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supply-lot">Lote</Label>
                <Input id="supply-lot" placeholder="Ex: AH2024-089" value={form.lot} onChange={(e) => setForm({ ...form, lot: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supply-qty">Quantidade</Label>
                <Input id="supply-qty" type="number" min="1" placeholder="0" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supply-expiry">Validade</Label>
              <Input id="supply-expiry" type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editingSupply ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Insumo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deletingSupply?.name}</strong> (Lote: {deletingSupply?.lot})?
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
