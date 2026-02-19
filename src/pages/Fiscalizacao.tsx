import { Shield, Download, FileText, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const Fiscalizacao = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modo Fiscalização</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Exibição integral de prontuários e rastreabilidade para auditoria
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-burgundy-light gap-2">
            <Eye className="w-4 h-4" />
            Ativar Modo
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="rounded-xl gradient-burgundy p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-gold" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-display font-semibold text-primary-foreground">
            Conformidade RDC nº 1.002/2025
          </h2>
          <p className="text-sm text-primary-foreground/70 mt-1">
            Sistema preparado para auditoria da Vigilância Sanitária. Todos os registros possuem versionamento,
            logs de auditoria e rastreabilidade completa.
          </p>
        </div>
        <Badge className="bg-gold/20 text-gold border-gold/30 text-sm px-3 py-1">
          ✓ Conforme
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar prontuário por nome, CPF ou nº..." className="pl-9" />
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: FileText,
            title: "Prontuário Completo",
            desc: "Visualização integral com todas as evoluções, documentos, fotos e insumos utilizados.",
          },
          {
            icon: Shield,
            title: "Logs de Auditoria",
            desc: "Histórico completo: quem alterou, quando alterou, versão anterior e atual do registro.",
          },
          {
            icon: Download,
            title: "Exportação PDF",
            desc: "Exportação formatada do prontuário completo com identificação, data e responsável.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-elegant hover:shadow-lg transition-shadow"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <feature.icon className="w-4.5 h-4.5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Audit Log Preview */}
      <div className="rounded-xl border border-border bg-card shadow-elegant">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Últimos Registros de Auditoria</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { action: "Evolução criada", user: "Dra. Damski", target: "PRN-0001 — Sessão #1247", time: "12/02/2026 14:32" },
            { action: "TCLE anexado", user: "Recepção", target: "PRN-0003 — Ana Costa", time: "11/02/2026 09:15" },
            { action: "Insumo registrado", user: "Dra. Damski", target: "Lote AH2024-089", time: "10/02/2026 16:45" },
            { action: "Prontuário editado", user: "Dra. Damski", target: "PRN-0002 — João Oliveira", time: "09/02/2026 11:20" },
            { action: "Backup automático", user: "Sistema", target: "Banco de dados completo", time: "09/02/2026 03:00" },
          ].map((log, i) => (
            <div key={i} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm">
              <span className="font-medium text-foreground w-40 shrink-0">{log.action}</span>
              <span className="text-muted-foreground flex-1 truncate">{log.target}</span>
              <span className="text-xs text-muted-foreground shrink-0">{log.user}</span>
              <span className="text-xs font-mono text-muted-foreground shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fiscalizacao;
