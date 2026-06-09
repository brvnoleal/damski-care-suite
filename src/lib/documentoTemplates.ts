/**
 * Modelos pré-configurados de documentos e função de renderização de variáveis.
 */

export type TipoDocumento = "contrato" | "tcle" | "receituario" | "atestado" | "personalizado";

export const tipoDocumentoLabels: Record<TipoDocumento, string> = {
  contrato: "Contrato de Prestação de Serviços",
  tcle: "Termo de Consentimento Livre e Esclarecido (TCLE)",
  receituario: "Receituário",
  atestado: "Atestado",
  personalizado: "Documento Personalizado",
};

export interface DocumentoModeloPadrao {
  tipo: TipoDocumento;
  nome: string;
  conteudo: string;
  requer_assinatura_paciente: boolean;
}

export const VARIAVEIS_DISPONIVEIS: { chave: string; rotulo: string }[] = [
  { chave: "{{paciente.nome}}", rotulo: "Nome do paciente" },
  { chave: "{{paciente.cpf}}", rotulo: "CPF do paciente" },
  { chave: "{{paciente.rg}}", rotulo: "RG do paciente" },
  { chave: "{{paciente.data_nascimento}}", rotulo: "Data de nascimento" },
  { chave: "{{paciente.endereco}}", rotulo: "Endereço completo" },
  { chave: "{{paciente.telefone}}", rotulo: "Telefone" },
  { chave: "{{paciente.email}}", rotulo: "Email" },
  { chave: "{{clinica.razao_social}}", rotulo: "Razão social da clínica" },
  { chave: "{{clinica.cnpj}}", rotulo: "CNPJ da clínica" },
  { chave: "{{clinica.endereco}}", rotulo: "Endereço da clínica" },
  { chave: "{{clinica.telefone}}", rotulo: "Telefone da clínica" },
  { chave: "{{clinica.email}}", rotulo: "Email da clínica" },
  { chave: "{{data_hoje}}", rotulo: "Data atual" },
];

export const MODELOS_PADRAO: DocumentoModeloPadrao[] = [
  {
    tipo: "contrato",
    nome: "Contrato de Prestação de Serviços Odontológicos",
    requer_assinatura_paciente: true,
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ODONTOLÓGICOS

CONTRATANTE: {{paciente.nome}}, CPF nº {{paciente.cpf}}, RG nº {{paciente.rg}}, residente em {{paciente.endereco}}, telefone {{paciente.telefone}}.

CONTRATADA: {{clinica.razao_social}}, CNPJ nº {{clinica.cnpj}}, com sede em {{clinica.endereco}}.

CLÁUSULA 1ª — DO OBJETO
A CONTRATADA prestará ao(à) CONTRATANTE serviços odontológicos conforme plano de tratamento apresentado e aceito.

CLÁUSULA 2ª — DAS OBRIGAÇÕES DA CONTRATADA
Executar os procedimentos com técnica adequada, materiais homologados e equipe habilitada, respeitando as normas do CFO e da ANVISA.

CLÁUSULA 3ª — DAS OBRIGAÇÕES DO(A) CONTRATANTE
Comparecer às consultas agendadas, seguir as orientações pós-procedimento e efetuar os pagamentos nas datas combinadas.

CLÁUSULA 4ª — DOS VALORES E FORMA DE PAGAMENTO
Os valores serão apresentados em orçamento anexo e poderão ser pagos conforme combinado entre as partes.

CLÁUSULA 5ª — DA RESCISÃO
O contrato poderá ser rescindido por qualquer das partes, mediante comunicação prévia, observado o pagamento dos procedimentos já executados.

CLÁUSULA 6ª — DO FORO
Fica eleito o foro da comarca de origem da CONTRATADA para dirimir quaisquer dúvidas.

{{data_hoje}}
`,
  },
  {
    tipo: "tcle",
    nome: "Termo de Consentimento Livre e Esclarecido",
    requer_assinatura_paciente: true,
    conteudo: `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)

Eu, {{paciente.nome}}, CPF nº {{paciente.cpf}}, declaro que fui devidamente informado(a) pela equipe da {{clinica.razao_social}} sobre:

1. O diagnóstico clínico apresentado;
2. Os procedimentos propostos, suas etapas e finalidade;
3. Os riscos, benefícios e possíveis complicações;
4. As alternativas terapêuticas existentes;
5. A necessidade de seguir corretamente as orientações pré e pós-operatórias.

Declaro ainda que tive a oportunidade de esclarecer todas as minhas dúvidas e autorizo livremente a execução dos procedimentos.

Estou ciente de que esta autorização poderá ser revogada a qualquer momento, antes do início dos procedimentos.

Conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018), autorizo o tratamento dos meus dados pessoais e de saúde pela {{clinica.razao_social}}, exclusivamente para finalidades assistenciais, administrativas e legais.

{{data_hoje}}
`,
  },
  {
    tipo: "receituario",
    nome: "Receituário",
    requer_assinatura_paciente: false,
    conteudo: `RECEITUÁRIO

Paciente: {{paciente.nome}}
CPF: {{paciente.cpf}}
Data de nascimento: {{paciente.data_nascimento}}

Prescrição:

1.

2.

3.

Orientações:

{{data_hoje}}

{{clinica.razao_social}} — {{clinica.endereco}}
`,
  },
  {
    tipo: "atestado",
    nome: "Atestado",
    requer_assinatura_paciente: false,
    conteudo: `ATESTADO

Atesto, para os devidos fins, que o(a) Sr(a). {{paciente.nome}}, CPF nº {{paciente.cpf}}, esteve sob meus cuidados odontológicos nesta data, necessitando de afastamento de suas atividades pelo período de ____ (____) dia(s), a contar de {{data_hoje}}.

{{clinica.razao_social}}
{{clinica.endereco}}
`,
  },
];

interface RenderContext {
  paciente: {
    nome?: string;
    cpf?: string;
    rg?: string;
    data_nascimento?: string;
    telefone?: string;
    email?: string;
    cep?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  clinica: {
    nome?: string;
    cnpj?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
  };
}

const formatDataBR = (iso?: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

const enderecoPaciente = (p: RenderContext["paciente"]) => {
  const partes = [
    [p.rua, p.numero].filter(Boolean).join(", "),
    p.complemento,
    p.bairro,
    [p.cidade, p.estado].filter(Boolean).join("/"),
    p.cep,
  ].filter((x) => x && String(x).trim().length);
  return partes.length ? partes.join(" — ") : "—";
};

export function renderTemplate(texto: string, ctx: RenderContext): string {
  const hoje = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const map: Record<string, string> = {
    "{{paciente.nome}}": ctx.paciente.nome || "—",
    "{{paciente.cpf}}": ctx.paciente.cpf || "—",
    "{{paciente.rg}}": ctx.paciente.rg || "—",
    "{{paciente.data_nascimento}}": formatDataBR(ctx.paciente.data_nascimento),
    "{{paciente.telefone}}": ctx.paciente.telefone || "—",
    "{{paciente.email}}": ctx.paciente.email || "—",
    "{{paciente.endereco}}": enderecoPaciente(ctx.paciente),
    "{{clinica.razao_social}}": ctx.clinica.nome || "—",
    "{{clinica.cnpj}}": ctx.clinica.cnpj || "—",
    "{{clinica.telefone}}": ctx.clinica.telefone || "—",
    "{{clinica.email}}": ctx.clinica.email || "—",
    "{{clinica.endereco}}": ctx.clinica.endereco || "—",
    "{{data_hoje}}": hoje,
  };
  return Object.entries(map).reduce(
    (acc, [k, v]) => acc.split(k).join(v),
    texto,
  );
}
