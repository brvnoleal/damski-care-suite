import { useState, useEffect } from "react";
import { Search, Plus, Filter, AlertTriangle, CheckCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { FadeIn } from "@/components/FadeIn";
import {
  insumoService, Insumo,
  InsumoCategoria, insumoCategoriaLabels,
  InsumoUnidadeMedida, insumoUnidadeMedidaLabels,
} from "@/services/insumoService";

const getExpiryStatus = (days: number | null) => {
  if (days === null) return { label: "Sem validade", className: "bg-muted/30 text-muted-foreground border-muted/40" };
  if (days <= 15) return { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20" };
  if (days <= 30) return { label: "Atenção", className: "bg-warning/10 text-warning border-warning/20" };
  return { label: "OK", className: "bg-success/10 text-success border-success/20" };
};

const calcDaysLeft = (validadeISO: string | null): number | null => {
  if (!validadeISO) return null;
  const expiry = new Date(validadeISO + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

interface FormState {
  nome: string;
  fabricante: string;
  lote: string;
  validade: string;
  sem_validade: boolean;
  quantidade: string;
  categoria: InsumoCategoria | "";
  unidade_medida: InsumoUnidadeMedida | "";
}

const emptyForm = (): FormState => ({
  nome: "", fabricante: "", lote: "", validade: "", sem_validade: false,
  quantidade: "", categoria: "", unidade_medida: "",
});

const Insumos = () => {
  const [search, setSearch] = useState("");
  const [supplies, setSupplies] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Insumo | null>(null);
  const [deletingSupply, setDeletingSupply] = useState<Insumo | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

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
      if (days === null) acc.ok++;
      else if (days <= 15) acc.critical++;
      else if (days <= 30) acc.warning++;
      else acc.ok++;
      return acc;
    },
    { critical: 0, warning: 0, ok: 0 }
  );

  const openCreate = () => {
    setEditingSupply(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (supply: Insumo) => {
    setEditingSupply(supply);
    setForm({
      nome: supply.nome, fabricante: supply.fabricante, lote: supply.lote,
      validade: supply.validade ?? "", sem_validade: supply.sem_validade,
      quantidade: String(supply.quantidade),
      categoria: (supply.categoria as InsumoCategoria) ?? "",
      unidade_medida: (supply.unidade_medida as InsumoUnidadeMedida) ?? "",
    });
    setDialogOpen(true);
  };

  const openDelete = (supply: Insumo) => {
    setDeletingSupply(supply);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.fabricante || !form.lote || !form.quantidade || !form.categoria || !form.unidade_medida) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (!form.sem_validade && !form.validade) {
      toast({ title: "Informe a validade ou marque 'Sem validade'", variant: "destructive" });
      return;
    }
    const payload = {
      nome: form.nome,
      fabricante: form.fabricante,
      lote: form.lote,
      validade: form.sem_validade ? null : form.validade,
      sem_validade: form.sem_validade,
      quantidade: parseInt(form.quantidade, 10),
      categoria: form.categoria as InsumoCategoria,
      unidade_medida: form.unidade_medida as InsumoUnidadeMedida,
    };
    try {
      if (editingSupply) {
        await insumoService.atualizar(editingSupply.id, payload);
        toast({ title: "Insumo atualizado com sucesso!" });
      } else {
        await insumoService.criar({ ...payload, pacientes_vinculados: 0 });
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
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Controle de Insumos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rastreabilidade por lote conforme RDC 1.002/2025
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            Cadastrar Insumo
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
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
              <p className="text-xs text-muted-foreground">Validade superior a 30 dias ou sem validade</p>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
      </FadeIn>

      <FadeIn delay={0.15}>
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
      </FadeIn>

      <FadeIn delay={0.2}>
      <LiquidGlassCard className="overflow-hidden" draggable={false}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5">
                <TableHead className="font-semibold">Insumo</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Categoria</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Fabricante</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Lote</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Validade</TableHead>
                <TableHead className="font-semibold text-center">Qtd</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Unidade</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : filtered.map((supply) => {
                const daysLeft = calcDaysLeft(supply.validade);
                const status = getExpiryStatus(daysLeft);
                return (
                  <TableRow key={supply.id} className="hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium">{supply.nome}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {supply.categoria ? insumoCategoriaLabels[supply.categoria] : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{supply.fabricante}</TableCell>
                    <TableCell className="font-mono text-xs text-primary font-semibold hidden sm:table-cell">{supply.lote}</TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {supply.validade ? (
                        <>
                          {formatDateBR(supply.validade)}
                          {daysLeft !== null && <span className="text-xs ml-1">({daysLeft}d)</span>}
                        </>
                      ) : (
                        <span className="text-xs italic">Sem validade</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{supply.quantidade}</TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {supply.unidade_medida ? insumoUnidadeMedidaLabels[supply.unidade_medida] : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
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
      </FadeIn>

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingSupply ? "Editar Insumo" : "Cadastrar Insumo"}</SheetTitle>
          </SheetHeader>
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
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as InsumoCategoria })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(insumoCategoriaLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade de Medida</Label>
                <Select value={form.unidade_medida} onValueChange={(v) => setForm({ ...form, unidade_medida: v as InsumoUnidadeMedida })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(insumoUnidadeMedidaLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <Input
                id="supply-expiry"
                type="date"
                value={form.validade}
                disabled={form.sem_validade}
                onChange={(e) => setForm({ ...form, validade: e.target.value })}
              />
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="sem-validade"
                  checked={form.sem_validade}
                  onCheckedChange={(c) => setForm({ ...form, sem_validade: !!c, validade: c ? "" : form.validade })}
                />
                <Label htmlFor="sem-validade" className="cursor-pointer text-sm font-normal">
                  Sem validade
                </Label>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editingSupply ? "Salvar" : "Cadastrar"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <SheetContent className="sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Excluir Insumo</SheetTitle>
            <SheetDescription>
              Tem certeza que deseja excluir <strong>{deletingSupply?.nome}</strong> (Lote: {deletingSupply?.lote})?
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Insumos;
