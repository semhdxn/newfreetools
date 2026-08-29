/**
 * Tiny CSV helper used by the Results pages to let free users take their
 * answers and scores away as a spreadsheet without competing with the
 * branded Premium PDF.
 *
 * `rows` is a 2D array — one inner array per CSV row. Cells can be any
 * primitive; everything is coerced to a string and properly escaped per
 * RFC 4180 (double-quoting + doubling embedded quotes).
 */
export function rowsToCsv(rows: Array<Array<string | number | null | undefined>>): string {
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map(r => r.map(escape).join(',')).join('\r\n');
}

/**
 * Triggers a browser download of the given CSV string. Adds a UTF-8 BOM so
 * Excel opens it cleanly with accents intact.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
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
