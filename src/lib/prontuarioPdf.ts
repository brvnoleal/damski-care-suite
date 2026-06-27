/**
 * Exporta o prontuário completo do paciente em PDF para fiscalização.
 * Inclui dados pessoais, histórico clínico, agendamentos, débitos, odontograma,
 * documentos emitidos, anamneses e a lista de arquivos anexados.
 */
import { jsPDF } from "jspdf";

interface ExportInput {
  dump: any; // payload from exportar_dados_paciente RPC
  clinica?: { nome?: string; cnpj?: string; telefone?: string; email?: string } | null;
}

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return String(iso);
  }
};

const fmtDateOnly = (iso?: string | null) => {
  if (!iso) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return String(iso);
  }
};

const fmtBytes = (n: number | null | undefined) => {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export const exportProntuarioPDF = ({ dump, clinica }: ExportInput) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  const ensureSpace = (lines = 1, lineH = 14) => {
    if (y + lines * lineH > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const section = (title: string) => {
    ensureSpace(3, 16);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(title, margin, y);
    y += 6;
    doc.setDrawColor(180);
    doc.line(margin, y, pageW - margin, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40);
  };

  const writeLine = (text: string) => {
    const parts = doc.splitTextToSize(text, pageW - margin * 2);
    parts.forEach((p: string) => {
      ensureSpace(1);
      doc.text(p, margin, y);
      y += 13;
    });
  };

  const kv = (k: string, v: any) => {
    writeLine(`${k}: ${v ?? "—"}`);
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Prontuário do Paciente", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(
    `${clinica?.nome || "Clínica"}${clinica?.cnpj ? " — CNPJ " + clinica.cnpj : ""}`,
    margin,
    y,
  );
  y += 12;
  doc.text(`Exportado em ${fmtDate(dump?.exportado_em || new Date().toISOString())}`, margin, y);
  y += 6;
  doc.setDrawColor(120);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Paciente
  const p = dump?.paciente || {};
  section("Identificação");
  kv("Nome", p.nome);
  kv("CPF", p.cpf);
  kv("RG", p.rg ? `${p.rg}${p.emissor ? " — " + p.emissor : ""}` : "—");
  kv("Data de nascimento", fmtDateOnly(p.data_nascimento));
  // Dados demográficos para relatórios e fiscalização
  const calcIdade = (iso?: string) => {
    if (!iso) return null;
    const dt = new Date(iso + "T00:00:00");
    if (isNaN(dt.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - dt.getFullYear();
    const mo = now.getMonth() - dt.getMonth();
    if (mo < 0 || (mo === 0 && now.getDate() < dt.getDate())) age--;
    return age;
  };
  const idade = calcIdade(p.data_nascimento);
  kv("Idade", idade != null ? `${idade} anos` : "—");
  kv("Sexo", p.sexo);
  kv("Estado civil", p.estado_civil);
  kv("Profissão", p.profissao);
  kv("Indicação", p.indicacao_tipo ? `${p.indicacao_tipo}${p.indicacao_nome ? " — " + p.indicacao_nome : ""}` : "—");
  kv("Nº prontuário", p.numero_prontuario);

  section("Contato");
  kv("Telefone", p.telefone);
  kv("E-mail", p.email);
  kv("Instagram", p.instagram);
  kv(
    "Endereço",
    [p.rua, p.numero, p.bairro, p.cidade, p.estado, p.cep].filter(Boolean).join(", ") || "—",
  );

  // Agendamentos
  const ags: any[] = dump?.agendamentos || [];
  section(`Consultas / Agendamentos (${ags.length})`);
  if (ags.length === 0) writeLine("Nenhum registro.");
  ags.forEach((a) => {
    writeLine(
      `• ${fmtDateOnly(a.data)} ${a.horario || ""} — ${a.procedimento || "—"} · Status: ${
        a.status
      } · Pagamento: ${a.status_pagamento || "—"} · ${a.forma_pagamento || "—"}${
        a.parcelas > 1 ? ` ${a.parcelas}x` : ""
      } · R$ ${Number(a.valor || 0).toFixed(2)}`,
    );
    if (a.observacoes) writeLine(`   Obs: ${a.observacoes}`);
  });

  // Evoluções
  const evs: any[] = dump?.evolucoes || [];
  section(`Evoluções clínicas (${evs.length})`);
  if (evs.length === 0) writeLine("Nenhum registro.");
  evs.forEach((e) => {
    writeLine(`• ${fmtDateOnly(e.data)}`);
    writeLine(`  ${e.conteudo || ""}`);
  });

  // Sessões
  const sess: any[] = dump?.sessoes || [];
  section(`Sessões (${sess.length})`);
  if (sess.length === 0) writeLine("Nenhum registro.");
  sess.forEach((s) => {
    writeLine(
      `• ${fmtDateOnly(s.data)} — ${s.procedimento || "—"}${
        s.observacoes ? " · " + s.observacoes : ""
      }`,
    );
  });

  // Odontograma
  const odon: any[] = dump?.odontograma || [];
  section(`Odontograma (${odon.length})`);
  if (odon.length === 0) writeLine("Nenhum registro.");
  odon.forEach((o) => {
    writeLine(
      `• Dente ${o.dente} — ${o.procedimento} · ${o.status} · ${fmtDateOnly(o.data)}${
        o.observacoes ? " · " + o.observacoes : ""
      }`,
    );
  });

  // Documentos emitidos
  const docs: any[] = dump?.documentos || [];
  section(`Documentos emitidos (${docs.length})`);
  if (docs.length === 0) writeLine("Nenhum registro.");
  docs.forEach((d) => {
    writeLine(
      `• ${d.titulo || d.tipo} · ${d.status}${
        d.assinado_em ? " · assinado em " + fmtDate(d.assinado_em) : ""
      }`,
    );
  });

  // Anamneses
  const ans: any[] = dump?.anamneses || [];
  section(`Anamneses (${ans.length})`);
  if (ans.length === 0) writeLine("Nenhum registro.");
  ans.forEach((a) => {
    writeLine(`• Preenchida em ${fmtDate(a.created_at)} · status: ${a.status || "—"}`);
  });

  // Débitos
  const debs: any[] = dump?.debitos || [];
  section(`Débitos / Financeiro (${debs.length})`);
  if (debs.length === 0) writeLine("Nenhum registro.");
  debs.forEach((d) => {
    writeLine(
      `• ${d.descricao} · venc. ${fmtDateOnly(d.data_vencimento)} · ${d.status} · R$ ${Number(
        d.valor || 0,
      ).toFixed(2)}`,
    );
  });

  // Consentimentos
  const cons: any[] = dump?.consentimentos || [];
  section(`Consentimentos LGPD (${cons.length})`);
  if (cons.length === 0) writeLine("Nenhum registro.");
  cons.forEach((c) => {
    writeLine(
      `• ${c.finalidade} · v${c.versao} · ${c.aceito ? "aceito" : "revogado"} em ${fmtDate(
        c.aceito_em,
      )}${c.revogado_em ? ` (revogado em ${fmtDate(c.revogado_em)})` : ""}`,
    );
  });

  // Fotos clínicas
  const fotos: any[] = dump?.fotos || [];
  section(`Fotos clínicas (${fotos.length})`);
  if (fotos.length === 0) writeLine("Nenhum registro.");
  fotos.forEach((f) => {
    writeLine(`• ${fmtDate(f.created_at)} · categoria: ${f.categoria || "—"}`);
  });

  // Arquivos anexados — exames, atestados, PDFs e imagens
  const arqs: any[] = dump?.arquivos || [];
  section(`Arquivos anexados (${arqs.length})`);
  if (arqs.length === 0) writeLine("Nenhum arquivo anexado.");
  arqs.forEach((a) => {
    writeLine(
      `• ${a.nome} · ${fmtBytes(a.tamanho)} · ${a.mime_type || "—"} · enviado em ${fmtDate(
        a.created_at,
      )}`,
    );
    if (a.descricao) writeLine(`   ${a.descricao}`);
    if (a.storage_path) writeLine(`   Caminho: ${a.storage_path}`);
  });

  // Footer with page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(
      `Página ${i}/${total} — Documento gerado para fins de auditoria/fiscalização`,
      pageW / 2,
      pageH - 16,
      { align: "center" },
    );
  }

  const safeName = (p.nome || "paciente").replace(/[^\w\-]+/g, "_").toLowerCase();
  doc.save(`prontuario-${safeName}.pdf`);
};
