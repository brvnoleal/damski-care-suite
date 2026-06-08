/**
 * Definição dos campos da Ficha de Anamnese (compartilhado entre página pública e leitura no prontuário).
 */

export type AnamneseFieldType = "text" | "textarea" | "boolean" | "boolean_detalhe" | "select";

export interface AnamneseField {
  key: string;
  label: string;
  type: AnamneseFieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface AnamneseBloco {
  key: string;
  titulo: string;
  descricao?: string;
  campos: AnamneseField[];
}

export const ANAMNESE_BLOCOS: AnamneseBloco[] = [
  {
    key: "odontologico",
    titulo: "Histórico odontológico e médico",
    descricao: "Informações clínicas essenciais para o atendimento seguro.",
    campos: [
      { key: "queixa_principal", label: "Qual a sua queixa principal?", type: "textarea", required: true, placeholder: "Descreva o motivo da consulta" },
      { key: "tratamento_medico", label: "Está em tratamento médico atualmente?", type: "boolean_detalhe", placeholder: "Especifique" },
      { key: "doencas_sistemicas", label: "Possui alguma doença sistêmica? (diabetes, hipertensão, cardiopatia, etc.)", type: "boolean_detalhe", placeholder: "Quais?" },
      { key: "alergias", label: "Possui alergia a medicamentos, látex ou anestésicos?", type: "boolean_detalhe", placeholder: "Quais?" },
      { key: "medicamentos_uso", label: "Faz uso contínuo de algum medicamento?", type: "boolean_detalhe", placeholder: "Quais?" },
      { key: "cirurgias_previas", label: "Já realizou cirurgias?", type: "boolean_detalhe", placeholder: "Quais e quando?" },
      { key: "tratamentos_odonto_anteriores", label: "Já realizou tratamentos odontológicos anteriores?", type: "boolean_detalhe", placeholder: "Quais?" },
      { key: "sangramento_anormal", label: "Apresenta sangramento anormal (gengival, nasal, etc.)?", type: "boolean" },
    ],
  },
  {
    key: "estetico",
    titulo: "Estético e injetáveis",
    descricao: "Histórico estético facial — essencial para protocolos com toxina, preenchedores e bioestimuladores.",
    campos: [
      { key: "toxina_botulinica", label: "Já realizou aplicação de toxina botulínica?", type: "boolean_detalhe", placeholder: "Quando e qual produto?" },
      { key: "preenchedores", label: "Já utilizou preenchedores faciais (ácido hialurônico, etc.)?", type: "boolean_detalhe", placeholder: "Região, quando, produto" },
      { key: "bioestimuladores", label: "Já utilizou bioestimuladores de colágeno?", type: "boolean_detalhe", placeholder: "Qual produto e quando?" },
      { key: "fios_pdo", label: "Já realizou aplicação de fios (PDO ou similar)?", type: "boolean_detalhe", placeholder: "Quando?" },
      { key: "gestacao_amamentacao", label: "Está gestante ou amamentando?", type: "boolean" },
      { key: "anticoagulantes", label: "Faz uso de anticoagulantes (AAS, varfarina, etc.)?", type: "boolean_detalhe", placeholder: "Qual?" },
      { key: "isotretinoina", label: "Faz ou fez uso de isotretinoína nos últimos 6 meses?", type: "boolean_detalhe", placeholder: "Quando interrompeu?" },
      { key: "expectativas", label: "Quais são suas expectativas com o tratamento?", type: "textarea", placeholder: "Descreva" },
    ],
  },
  {
    key: "habitos",
    titulo: "Hábitos",
    descricao: "Fatores comportamentais que impactam o tratamento.",
    campos: [
      { key: "tabagismo", label: "É fumante?", type: "boolean_detalhe", placeholder: "Quantidade/dia" },
      { key: "alcool", label: "Consome bebida alcoólica?", type: "select", options: ["Não", "Socialmente", "Frequentemente"] },
      { key: "bruxismo", label: "Range ou aperta os dentes (bruxismo)?", type: "boolean" },
      { key: "escovacao_frequencia", label: "Quantas vezes escova os dentes ao dia?", type: "select", options: ["1x", "2x", "3x", "Mais de 3x"] },
      { key: "fio_dental", label: "Utiliza fio dental diariamente?", type: "boolean" },
      { key: "alimentacao_acucar", label: "Consome muitos doces ou refrigerantes?", type: "boolean" },
      { key: "esporte_contato", label: "Pratica esporte de contato?", type: "boolean_detalhe", placeholder: "Qual?" },
    ],
  },
];

export const TERMO_ANAMNESE = `Declaro, para todos os fins, que todas as informações prestadas nesta ficha de anamnese são verdadeiras e completas. Estou ciente de que omissões ou informações incorretas podem comprometer a segurança do tratamento. Autorizo o uso destes dados exclusivamente para finalidades clínicas, em conformidade com a LGPD (Lei nº 13.709/2018).`;
