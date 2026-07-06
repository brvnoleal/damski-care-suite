/**
 * Serviço centralizado de exportação para XLSX (Excel).
 *
 * Objetivos:
 * - Interface única e reutilizável para todos os módulos (Pacientes, Consultas,
 *   Agendamentos, Financeiro, Estoque, etc.).
 * - Cabeçalho em negrito, autofilter automático, larguras de coluna calculadas
 *   e formatos numéricos/datas apropriados (BRL, %, data pt-BR).
 * - Mantém APIs anteriores (`exportToXlsx`, `exportMultiSheetXlsx`) para
 *   compatibilidade retroativa; internamente sempre passam pelo pipeline
 *   profissional.
 */
import * as XLSX from "xlsx";

export type ColumnFormat =
  | "text"
  | "number"
  | "integer"
  | "currency"
  | "percent"
  | "date"
  | "datetime";

export interface ColumnDef<T = any> {
  header: string;
  /** chave do objeto ou função extractor */
  accessor: keyof T | ((row: T) => unknown);
  /** largura em caracteres (aprox). Se omitido, é calculada. */
  width?: number;
  /** formato para células (define cell.z e coerção de valor). */
  format?: ColumnFormat;
}

export interface ExportSheetOptions<T = any> {
  rows: T[];
  columns?: ColumnDef<T>[];
  filename: string;
  sheetName?: string;
  /** inclui data no nome do arquivo (default: true). */
  withTimestamp?: boolean;
}

export interface ExportMultiSheetOptions {
  filename: string;
  sheets: {
    name: string;
    rows: Record<string, any>[];
    columns?: ColumnDef<any>[];
  }[];
  withTimestamp?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatos por tipo (padrão pt-BR)
// ─────────────────────────────────────────────────────────────────────────────
const NUMFMT: Record<ColumnFormat, string | undefined> = {
  text: undefined,
  number: "#,##0.00",
  integer: "#,##0",
  currency: 'R$ #,##0.00;[Red]-R$ #,##0.00',
  percent: "0.00%",
  date: "dd/mm/yyyy",
  datetime: "dd/mm/yyyy hh:mm",
};

const isDateLike = (v: unknown): v is Date | string => {
  if (v instanceof Date) return true;
  if (typeof v !== "string") return false;
  // ISO date (yyyy-mm-dd) ou ISO datetime
  return /^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(v);
};

const toDate = (v: unknown): Date | null => {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === "string") {
    // yyyy-mm-dd → força meia-noite local para não deslocar por timezone
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const coerceCell = (raw: unknown, format?: ColumnFormat): XLSX.CellObject => {
  if (raw === null || raw === undefined || raw === "") {
    return { t: "s", v: "" };
  }
  const fmt = format ?? inferFormat(raw);
  switch (fmt) {
    case "number":
    case "integer":
    case "currency": {
      const n = typeof raw === "number" ? raw : Number(String(raw).replace(/[^\d,.-]/g, "").replace(",", "."));
      if (!isFinite(n)) return { t: "s", v: String(raw) };
      return { t: "n", v: n, z: NUMFMT[fmt] };
    }
    case "percent": {
      const n = typeof raw === "number" ? raw : Number(raw);
      if (!isFinite(n)) return { t: "s", v: String(raw) };
      // aceita 0.15 (=15%) ou 15 (=15%)
      const value = Math.abs(n) > 1 ? n / 100 : n;
      return { t: "n", v: value, z: NUMFMT.percent };
    }
    case "date":
    case "datetime": {
      const d = toDate(raw);
      if (!d) return { t: "s", v: String(raw) };
      return { t: "d", v: d, z: NUMFMT[fmt] };
    }
    default:
      if (typeof raw === "number") return { t: "n", v: raw };
      if (typeof raw === "boolean") return { t: "b", v: raw };
      return { t: "s", v: String(raw) };
  }
};

const inferFormat = (v: unknown): ColumnFormat => {
  if (typeof v === "number") return "number";
  if (isDateLike(v)) return "date";
  return "text";
};

// ─────────────────────────────────────────────────────────────────────────────
// Núcleo
// ─────────────────────────────────────────────────────────────────────────────
const buildSheet = <T,>(rows: T[], columnsIn?: ColumnDef<T>[]): XLSX.WorkSheet => {
  const safeRows = rows.length ? rows : ([{ Aviso: "Sem dados para o filtro aplicado" }] as any[]);

  // Deriva colunas se não vieram
  const columns: ColumnDef<any>[] = columnsIn?.length
    ? columnsIn
    : Object.keys(safeRows[0] as any).map((k) => ({ header: k, accessor: k }));

  const headers = columns.map((c) => c.header);
  const aoa: any[][] = [headers];

  for (const row of safeRows) {
    const line: any[] = columns.map((c) => {
      const value = typeof c.accessor === "function" ? (c.accessor as any)(row) : (row as any)[c.accessor as string];
      return value;
    });
    aoa.push(line);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Aplica tipagem/format em cada célula (linha 1 = header)
  for (let r = 0; r < safeRows.length; r++) {
    columns.forEach((col, c) => {
      const addr = XLSX.utils.encode_cell({ r: r + 1, c });
      const raw = typeof col.accessor === "function" ? (col.accessor as any)(safeRows[r]) : (safeRows[r] as any)[col.accessor as string];
      const cell = coerceCell(raw, col.format);
      ws[addr] = cell;
    });
  }

  // Header em negrito
  headers.forEach((_, c) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) {
      ws[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1F2937" } },
        alignment: { vertical: "center", horizontal: "center" },
      };
    }
  });

  // Larguras de coluna
  const colWidths = columns.map((col, cIdx) => {
    if (col.width) return { wch: col.width };
    let max = col.header.length;
    for (let r = 0; r < safeRows.length; r++) {
      const raw = typeof col.accessor === "function" ? (col.accessor as any)(safeRows[r]) : (safeRows[r] as any)[col.accessor as string];
      const s = raw === null || raw === undefined ? "" : String(raw);
      if (s.length > max) max = s.length;
    }
    return { wch: Math.min(Math.max(max + 2, 10), 48) };
  });
  ws["!cols"] = colWidths;

  // Autofilter em todas as colunas
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  ws["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

  // Congela primeira linha
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  return ws;
};

const stampName = (filename: string, withTimestamp = true) => {
  if (!withTimestamp) return `${filename}.xlsx`;
  const stamp = new Date().toISOString().slice(0, 10);
  return `${filename}-${stamp}.xlsx`;
};

// ─────────────────────────────────────────────────────────────────────────────
// API principal
// ─────────────────────────────────────────────────────────────────────────────
export function exportSheet<T = any>(opts: ExportSheetOptions<T>) {
  const { rows, columns, filename, sheetName = "Dados", withTimestamp = true } = opts;
  const ws = buildSheet(rows, columns);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, stampName(filename, withTimestamp));
}

export function exportMultiSheet(opts: ExportMultiSheetOptions) {
  const { filename, sheets, withTimestamp = true } = opts;
  const wb = XLSX.utils.book_new();
  sheets.forEach((s) => {
    const ws = buildSheet(s.rows, s.columns);
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  });
  XLSX.writeFile(wb, stampName(filename, withTimestamp));
}

// ─────────────────────────────────────────────────────────────────────────────
// Compatibilidade retroativa
// ─────────────────────────────────────────────────────────────────────────────
export function exportToXlsx<T extends Record<string, any>>(
  rows: T[],
  filename: string,
  sheetName = "Dados",
) {
  exportSheet({ rows, filename, sheetName });
}

export function exportMultiSheetXlsx(
  sheets: { name: string; rows: Record<string, any>[] }[],
  filename: string,
) {
  exportMultiSheet({ filename, sheets });
}
