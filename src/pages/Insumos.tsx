import { useState } from "react";
import { Search, Plus, Filter, AlertTriangle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockSupplies = [
  { name: "Ácido Hialurônico 20mg/ml", manufacturer: "Galderma", lot: "AH2024-089", expiry: "15/03/2026", qty: 3, daysLeft: 24, usedBy: 2 },
  { name: "Toxina Botulínica 100U", manufacturer: "Allergan", lot: "TB2024-156", expiry: "22/03/2026", qty: 8, daysLeft: 31, usedBy: 5 },
  { name: "Ácido Hialurônico 24mg/ml", manufacturer: "Galderma", lot: "AH2024-112", expiry: "10/06/2026", qty: 12, daysLeft: 111, usedBy: 0 },
  { name: "Bioestimulador PLLA", manufacturer: "Sinclair", lot: "BIO2024-034", expiry: "01/09/2026", qty: 6, daysLeft: 194, usedBy: 3 },
  { name: "Fio PDO Espiculado", manufacturer: "Croma", lot: "PDO2024-067", expiry: "28/02/2026", qty: 15, daysLeft: 9, usedBy: 1 },
  { name: "Enzima Hialuronidase", manufacturer: "Hylenex", lot: "HYA2024-023", expiry: "15/04/2026", qty: 4, daysLeft: 55, usedBy: 0 },
];

const getExpiryStatus = (days: number) => {
  if (days <= 15) return { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20" };
  if (days <= 30) return { label: "Atenção", className: "bg-warning/10 text-warning border-warning/20" };
  return { label: "OK", className: "bg-success/10 text-success border-success/20" };
};

const Insumos = () => {
  const [search, setSearch] = useState("");

  const filtered = mockSupplies.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.lot.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Controle de Insumos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rastreabilidade por lote conforme RDC 1.002/2025
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-burgundy-light gap-2">
          <Plus className="w-4 h-4" />
          Cadastrar Insumo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-foreground">2 Críticos</p>
            <p className="text-xs text-muted-foreground">Vencimento em até 15 dias</p>
          </div>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <p className="text-sm font-semibold text-foreground">1 Atenção</p>
            <p className="text-xs text-muted-foreground">Vencimento em até 30 dias</p>
          </div>
        </div>
        <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-semibold text-foreground">3 Em dia</p>
            <p className="text-xs text-muted-foreground">Validade superior a 30 dias</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por insumo ou lote..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((supply, i) => {
              const status = getExpiryStatus(supply.daysLeft);
              return (
                <TableRow key={i} className="hover:bg-muted/30 transition-colors">
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Insumos;
