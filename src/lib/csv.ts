import { downloadCsv, rowsToCsv, todayStamp } from './exportCsv';

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
  return rowsToCsv(rows);
}

export function downloadToolCsv(toolSlug: string, childId: string, csv: string): void {
  downloadCsv(`${toolSlug}-${childId}-${todayStamp()}.csv`, csv);
}
