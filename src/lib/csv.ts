import { downloadCsv, rowsToCsv, todayStamp, withDataRow } from './exportCsv';

export type Row = Array<string | number | null | undefined>;

/**
 * Every tool exports the same CSV shape: a small header block identifying the
 * tool, the local pseudonym and the date, then a summary block, then one row
 * per answered question.
 */
export function buildToolCsv(opts: {
  toolName: string;
  childId: string;
  summaryHeader: Row;
  summaryRows: Row[];
  detailHeader: Row;
  detailRows: Row[];
  extraBlocks?: { title: string; header: Row; rows: Row[] }[];
  /**
   * When present, a hidden machine-readable row (see exportCsv's
   * DATA_ROW_MARKER/withDataRow) is appended so the premium toolkit's
   * CsvAttachPicker can round-trip this export straight into a young
   * person's record. Should carry the underlying tool state, not a
   * re-derivation of the display rows above it.
   */
  dataPayload?: unknown;
}): string {
  const rows: Row[] = [
    ['SEMH Free Tools export'],
    ['Tool', opts.toolName],
    ['Child ID (locally generated pseudonym)', opts.childId],
    ['Date', todayStamp()],
    [],
    ['SUMMARY'],
    opts.summaryHeader,
    ...opts.summaryRows,
    [],
    ['RESPONSES'],
    opts.detailHeader,
    ...opts.detailRows,
  ];
  for (const block of opts.extraBlocks ?? []) {
    if (block.rows.length === 0) continue;
    rows.push([], [block.title], block.header, ...block.rows);
  }
  return rowsToCsv(opts.dataPayload !== undefined ? withDataRow(rows, opts.dataPayload) : rows);
}

export function downloadToolCsv(toolSlug: string, childId: string, csv: string): void {
  downloadCsv(`${toolSlug}-${childId}-${todayStamp()}.csv`, csv);
}
