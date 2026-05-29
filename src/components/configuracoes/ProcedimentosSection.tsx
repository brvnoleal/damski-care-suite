import { useState } from "react";
import { ClipboardList, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  procedimentoService,
  type ProcedimentoRecord,
} from "@/services/procedimentoService";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const emptyForm = { nome: "", plano: "", especialidade: "", preco: "" };

const ITEMS_PER_PAGE = 10;

export default function ProcedimentosSection() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProcedimentoRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ProcedimentoRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: procedimentos = [], isLoading } = useQuery({
    queryKey: ["procedimentos"],
    queryFn: procedimentoService.list,
  });

  const totalPages = Math.ceil(procedimentos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = procedimentos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: form.nome.trim(),
        plano: form.plano.trim() || null,
        especialidade: form.especialidade.trim() || null,
        preco: Number(form.preco) || 0,
      };
      if (!payload.nome) throw new Error("Informe o nome do procedimento.");
      if (editing) return procedimentoService.update(editing.id, payload);
      return procedimentoService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedimentos"] });
      toast.success(editing ? "Procedimento atualizado." : "Procedimento adicionado.");
      handleClose();
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao salvar."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => procedimentoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedimentos"] });
      toast.success("Procedimento excluído.");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao excluir."),
  });

  const handleOpenNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleOpenEdit = (p: ProcedimentoRecord) => {
    setEditing(p);
    setForm({
      nome: p.nome,
      plano: p.plano ?? "",
      especialidade: p.especialidade ?? "",
      preco: String(p.preco ?? ""),
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  return (
    <LiquidGlassCard draggable={false} className="p-5 lg:col-span-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Procedimentos</h2>
              <p className="text-xs text-muted-foreground">
                Catálogo de procedimentos do consultório
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" />
            Adicionar Procedimento
          </Button>
        </div>

        <div className="rounded-lg border border-border/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : procedimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Nenhum procedimento cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                procedimentos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-foreground">{p.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{p.plano || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.especialidade || "—"}
                    </TableCell>
                    <TableCell className="text-foreground">{formatBRL(Number(p.preco))}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEdit(p)}
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(p)}
                          aria-label="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Procedimento" : "Novo Procedimento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Procedimento</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Limpeza"
              />
            </div>
            <div className="space-y-2">
              <Label>Plano</Label>
              <Input
                value={form.plano}
                onChange={(e) => setForm({ ...form, plano: e.target.value })}
                placeholder="Ex: Particular, Unimed..."
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Input
                value={form.especialidade}
                onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
                placeholder="Ex: Ortodontia"
              />
            </div>
            <div className="space-y-2">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir procedimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente "{deleteTarget?.nome}" do catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LiquidGlassCard>
  );
}
