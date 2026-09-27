/**
 * Tiny CSV helper used by the Results pages to let free users take their
 * answers and scores away as a spreadsheet without competing with the
 * branded Premium PDF.
 *
 * `rows` is a 2D array — one inner array per CSV row. Cells can be any
 * primitive; everything is coerced to a string and properly escaped per
 * RFC 4180 (double-quoting + doubling embedded quotes).
 */
/** One CSV row: an array of cells, each coerced to a string on export. */
export type Row = Array<string | number | null | undefined>;

// 27 Sept 2026 — CSV/spreadsheet formula injection guard. Every cell here can
// be free text someone typed (an answer, a locally-generated pseudonym the
// user edited by hand), and Excel/Google Sheets treat a cell starting with
// =, +, -, @, a tab or a carriage return as a formula to run when the file
// is opened — the classic CSV-injection vector. The standard mitigation
// (OWASP): prefix such a cell with a leading apostrophe, which every
// spreadsheet app reads as "force this to be text" and which doesn't change
// how the value round-trips back through the backend's CSV importer (it
// only ever reads the separate machine-readable data row below, never these
// human-readable cells).
const FORMULA_PREFIX_RE = /^[=+\-@\t\r]/;

export function rowsToCsv(rows: Row[]): string {
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    let s = String(v);
    if (FORMULA_PREFIX_RE.test(s)) s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map(r => r.map(escape).join(',')).join('\r\n');
}

/**
 * Triggers a browser download of the given CSV string. Adds a UTF-8 BOM so
 * Excel opens it cleanly with accents intact.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Build a safe filename suffix like `2026-04-27`. */
export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Marker cell identifying the machine-readable data row appended by
 * withDataRow(). The premium backend's CSV importer looks for a row whose
 * first cell equals this, instead of trying to reverse-engineer the
 * human-readable report above it — that report's row shapes are free to
 * change for readability without silently breaking import.
 */
export const DATA_ROW_MARKER = '__SEMH_DATA__';

/**
 * Appends a hidden machine-readable row to a human-readable CSV export.
 * `payload` should carry everything a backend importer needs to reconstruct
 * this export's data losslessly — typically the underlying tool state for
 * whatever was just completed, not a re-derivation of the display rows
 * above it. RFC 4180 quoting in rowsToCsv already handles the embedded
 * quotes/commas in the JSON string safely.
 */
export function withDataRow(rows: Row[], payload: unknown): Row[] {
  return [...rows, [], [DATA_ROW_MARKER, JSON.stringify(payload)]];
}
