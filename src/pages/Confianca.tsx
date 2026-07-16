import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Shield, Lock, FileText, Database, Mail, UserCheck, AlertTriangle } from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

export default function Confianca() {
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <Helmet>
        <title>Central de Confiança e Privacidade — CloudSmile</title>
        <meta name="description" content="Como o CloudSmile trata segurança, privacidade, LGPD e conformidade regulatória para clínicas odontológicas." />
        <link rel="canonical" href="https://cloudsmile.com.br/confianca" />
        <meta property="og:title" content="Central de Confiança e Privacidade — CloudSmile" />
        <meta property="og:description" content="Como o CloudSmile trata segurança, privacidade, LGPD e conformidade regulatória para clínicas odontológicas." />
        <meta property="og:url" content="https://cloudsmile.com.br/confianca" />
      </Helmet>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Central de Confiança e Privacidade
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Esta página é mantida pela equipe do CloudSmile para responder às perguntas mais
            comuns sobre segurança, privacidade e proteção de dados da plataforma. O conteúdo é
            editorial e não representa uma certificação independente.
          </p>
        </header>

        <LiquidGlassCard draggable={false} className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Autenticação e controle de acesso
            </h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Login obrigatório com e-mail e senha para todas as áreas internas.</li>
            <li>
              Perfis distintos por clínica (administrador, responsável técnico, recepcionista) com
              permissões aplicadas no banco de dados.
            </li>
            <li>Recuperação de senha por e-mail, sem armazenamento em texto plano.</li>
            <li>
              Rotas administrativas exigem verificação de papel a cada requisição, no servidor.
            </li>
          </ul>
        </LiquidGlassCard>

        <LiquidGlassCard draggable={false} className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Hospedagem e isolamento de dados
            </h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>
              Dados armazenados em banco PostgreSQL gerenciado pelo Supabase, com Row Level
              Security ativo em todas as tabelas de domínio.
            </li>
            <li>
              Arquitetura multi-tenant: cada clínica enxerga apenas seus próprios pacientes,
              agendamentos e documentos.
            </li>
            <li>Backups automáticos gerenciados pelo provedor de infraestrutura.</li>
            <li>
              Comunicação cliente-servidor sobre HTTPS/TLS. Esta declaração descreve recursos
              técnicos habilitados, não constitui uma certificação independente.
            </li>
          </ul>
        </LiquidGlassCard>

        <LiquidGlassCard draggable={false} className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Privacidade e LGPD
            </h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>CPF dos pacientes mascarado na interface (formato 123.***.***-**).</li>
            <li>
              Direito de portabilidade: exportação completa dos dados do paciente sob
              solicitação à clínica responsável.
            </li>
            <li>
              Direito ao esquecimento: anonimização do prontuário sem exclusão dos registros
              clínicos exigidos por legislação sanitária.
            </li>
            <li>Registro de auditoria das ações sensíveis (consultas, alterações, exportações).</li>
          </ul>
        </LiquidGlassCard>

        <LiquidGlassCard draggable={false} className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Conformidade regulatória
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            A plataforma foi desenhada para apoiar clínicas no atendimento à RDC ANVISA
            1.002/2025 (rastreabilidade de insumos e procedimentos) e à LGPD (Lei nº 13.709/2018).
            A conformidade efetiva depende também das práticas operacionais da clínica usuária
            (controlador dos dados).
          </p>
        </LiquidGlassCard>

        <LiquidGlassCard draggable={false} className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Responsabilidade compartilhada
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            O CloudSmile fornece a plataforma e os controles técnicos. A clínica usuária é
            responsável por gerenciar acessos de sua equipe, obter consentimentos dos pacientes,
            manter dispositivos seguros e cumprir suas obrigações regulatórias locais.
          </p>
        </LiquidGlassCard>

        <LiquidGlassCard draggable={false} className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Contato de segurança e privacidade
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Para relatar incidentes de segurança, vulnerabilidades ou exercer direitos de
            titular de dados (LGPD), entre em contato com a clínica responsável pelo seu
            atendimento, que poderá acionar o canal técnico do CloudSmile.
          </p>
        </LiquidGlassCard>

        <p className="text-xs text-muted-foreground text-center">
          <Link to="/" className="underline">Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}
