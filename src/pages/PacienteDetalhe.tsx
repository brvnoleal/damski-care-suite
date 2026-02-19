import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Syringe, Camera, ClipboardList, ShieldCheck, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PacienteDetalhe = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/pacientes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Pacientes
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-burgundy flex items-center justify-center">
            <span className="text-xl font-display font-bold text-primary-foreground">MS</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Maria Silva</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-gold-dark font-semibold">{id}</span>
              <Badge className="bg-success/10 text-success border-success/20 text-xs">Ativo</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Edit className="w-3.5 h-3.5" />
            Editar
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-burgundy-light gap-1.5">
            <Syringe className="w-3.5 h-3.5" />
            Nova Sessão
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Data de Nascimento", value: "15/03/1985" },
          { label: "CPF", value: "***.***.***-12" },
          { label: "Telefone", value: "(11) 99999-1234" },
          { label: "Início do Tratamento", value: "10/06/2024" },
        ].map((item, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-medium text-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="evolucoes" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="evolucoes" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <ClipboardList className="w-3.5 h-3.5" />
            Evoluções
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <FileText className="w-3.5 h-3.5" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="fotos" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Camera className="w-3.5 h-3.5" />
            Fotos
          </TabsTrigger>
          <TabsTrigger value="insumos" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Syringe className="w-3.5 h-3.5" />
            Insumos Utilizados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evolucoes" className="space-y-4">
          {[
            {
              date: "12/02/2026",
              proc: "Harmonização Facial — Preenchimento Labial",
              tech: "Cânula 25G, técnica retroinjeção",
              substance: "Ácido Hialurônico 20mg/ml — Lote AH2024-089 — 1ml",
              signed: true,
            },
            {
              date: "08/01/2026",
              proc: "Toxina Botulínica — Terço Superior",
              tech: "Agulha 30G, técnica intramuscular",
              substance: "Toxina Botulínica 100U — Lote TB2024-156 — 32U",
              signed: true,
            },
            {
              date: "15/12/2025",
              proc: "Avaliação e Planejamento",
              tech: "Análise facial, fotografias, planejamento digital",
              substance: "N/A",
              signed: false,
            },
          ].map((session, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 shadow-elegant space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{session.proc}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{session.date}</p>
                </div>
                <Badge
                  className={
                    session.signed
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-warning/10 text-warning border-warning/20"
                  }
                >
                  {session.signed ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Assinado
                    </span>
                  ) : (
                    "Pendente"
                  )}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Técnica</p>
                  <p className="text-foreground">{session.tech}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Substância / Lote</p>
                  <p className="text-foreground">{session.substance}</p>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="documentos">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">TCLE, Contrato, Orçamento, Histórico de Saúde</p>
            <p className="text-xs text-muted-foreground mt-1">Funcionalidade disponível com backend ativo</p>
          </div>
        </TabsContent>

        <TabsContent value="fotos">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Fotos de antes/depois dos procedimentos</p>
            <p className="text-xs text-muted-foreground mt-1">Funcionalidade disponível com backend ativo</p>
          </div>
        </TabsContent>

        <TabsContent value="insumos">
          <div className="rounded-xl border border-border bg-card p-5 shadow-elegant">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Insumo</th>
                  <th className="pb-2 font-medium">Lote</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Validade</th>
                  <th className="pb-2 font-medium">Qtd</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Data Uso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2.5 font-medium">Ácido Hialurônico 20mg/ml</td>
                  <td className="py-2.5 font-mono text-xs text-gold-dark">AH2024-089</td>
                  <td className="py-2.5 hidden sm:table-cell">15/03/2026</td>
                  <td className="py-2.5">1ml</td>
                  <td className="py-2.5 hidden sm:table-cell">12/02/2026</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium">Toxina Botulínica 100U</td>
                  <td className="py-2.5 font-mono text-xs text-gold-dark">TB2024-156</td>
                  <td className="py-2.5 hidden sm:table-cell">22/03/2026</td>
                  <td className="py-2.5">32U</td>
                  <td className="py-2.5 hidden sm:table-cell">08/01/2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PacienteDetalhe;
