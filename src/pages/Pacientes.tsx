import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, MoreHorizontal, FileText, Eye } from "lucide-react";
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

const mockPatients = [
  { id: "PRN-0001", name: "Maria Silva", cpf: "***.***.***-12", phone: "(11) 99999-1234", lastVisit: "12/02/2026", status: "ativo", sessions: 8 },
  { id: "PRN-0002", name: "João Oliveira", cpf: "***.***.***-45", phone: "(11) 98888-5678", lastVisit: "10/02/2026", status: "ativo", sessions: 3 },
  { id: "PRN-0003", name: "Ana Costa", cpf: "***.***.***-78", phone: "(11) 97777-9012", lastVisit: "08/02/2026", status: "ativo", sessions: 12 },
  { id: "PRN-0004", name: "Pedro Santos", cpf: "***.***.***-23", phone: "(11) 96666-3456", lastVisit: "05/02/2026", status: "ativo", sessions: 5 },
  { id: "PRN-0005", name: "Carla Dias", cpf: "***.***.***-56", phone: "(11) 95555-7890", lastVisit: "01/02/2026", status: "inativo", sessions: 2 },
  { id: "PRN-0006", name: "Lucas Mendes", cpf: "***.***.***-89", phone: "(11) 94444-2345", lastVisit: "28/01/2026", status: "ativo", sessions: 7 },
];

const Pacientes = () => {
  const [search, setSearch] = useState("");

  const filtered = mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Prontuário eletrônico conforme RDC 1.002/2025
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-burgundy-light gap-2">
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou nº prontuário..."
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-elegant overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Prontuário</TableHead>
              <TableHead className="font-semibold">Paciente</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">CPF</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Telefone</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Última Visita</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-center hidden sm:table-cell">Sessões</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs text-gold-dark font-semibold">
                  {patient.id}
                </TableCell>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">{patient.cpf}</TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">{patient.phone}</TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">{patient.lastVisit}</TableCell>
                <TableCell>
                  <Badge
                    variant={patient.status === "ativo" ? "default" : "secondary"}
                    className={
                      patient.status === "ativo"
                        ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell">{patient.sessions}</TableCell>
                <TableCell>
                  <Link
                    to={`/pacientes/${patient.id}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Pacientes;
