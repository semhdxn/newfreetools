import { MwmCriteria } from '@/data/mwmCriteriaData';
import { MwmResponse } from './localStorage';
import { criteriaScoresFromResponse, formatScore } from './scoring';

const SCALE_LABELS: Record<number, string> = {
  1: '1 — Never',
  2: '2 — Rarely',
  3: '3 — Sometimes',
  4: '4 — Often',
  5: '5 — Always',
};

function escapeCsv(value: string | null | undefined): string {
  const str = value ?? '';
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvRow(values: (string | null | undefined)[]): string {
  return values.map(escapeCsv).join(',');
}

export function exportMwmSingleCompletion(
  questionnaire: { title: string; description: string },
  criteria: MwmCriteria[],
  response: MwmResponse,
  childId?: string
): string {
  const scores = criteriaScoresFromResponse(criteria, response);
  
  const lines: string[] = [];
  lines.push(buildCsvRow(['Measure What Matters — Single Completion']));
  lines.push('');
  lines.push(buildCsvRow(['Questionnaire:', questionnaire.title]));
  if (questionnaire.description) {
    lines.push(buildCsvRow(['Description:', questionnaire.description]));
  }
  if (childId) {
    lines.push(buildCsvRow(['Child ID:', childId]));
  }
  lines.push(buildCsvRow(['Completed:', new Date(response.completedAt).toLocaleDateString()]));
  lines.push(buildCsvRow(['Method:', response.method === 'digital' ? 'Digital' : 'Printed then entered']));
  lines.push('');
  
  // Summary
  lines.push(buildCsvRow(['Criteria', 'Average (1–5)', 'Statements answered']));
  for (const score of scores) {
    lines.push(buildCsvRow([score.name, formatScore(score.score), `${score.answered}/${score.total}`]));
  }
  lines.push('');
  
  // Detail
  lines.push(buildCsvRow(['Criteria', 'Statement', 'Score (1–5)', 'Rating']));
  for (const c of criteria) {
    for (const stmt of c.statements) {
      const v = response.answers[stmt.id];
      const score = typeof v === 'number' ? v : null;
      lines.push(
        buildCsvRow([
          c.name,
          stmt.statement_text,
          formatScore(score),
          score !== null ? SCALE_LABELS[score] : 'Not answered',
        ])
      );
    }
  }
  
  return lines.join('\n');
}

export function exportMwmMultipleCompletions(
  questionnaire: { title: string; description: string },
  criteria: MwmCriteria[],
  responses: MwmResponse[],
  childId?: string
): string {
  const lines: string[] = [];
  lines.push(buildCsvRow(['Measure What Matters — Multiple Completions']));
  lines.push('');
  lines.push(buildCsvRow(['Questionnaire:', questionnaire.title]));
  if (questionnaire.description) {
    lines.push(buildCsvRow(['Description:', questionnaire.description]));
  }
  if (childId) {
    lines.push(buildCsvRow(['Child ID:', childId]));
  }
  lines.push('');
  
  // Trend summary
  lines.push(buildCsvRow(['Criteria'].concat(responses.map((r) => new Date(r.completedAt).toLocaleDateString()))));
  
  for (const c of criteria) {
    const row: string[] = [c.name];
    for (const resp of responses) {
      const scores = criteriaScoresFromResponse([c], resp);
      const score = scores.length > 0 ? scores[0].score : null;
      row.push(formatScore(score));
    }
    lines.push(buildCsvRow(row));
  }
  
  lines.push('');
  lines.push('Detailed Responses:');
  lines.push('');
  
  for (const resp of responses) {
    const date = new Date(resp.completedAt).toLocaleDateString();
    lines.push(buildCsvRow([`Completion: ${date}`]));
    lines.push(buildCsvRow(['Criteria', 'Statement', 'Score (1–5)', 'Rating']));
    for (const c of criteria) {
      for (const stmt of c.statements) {
        const v = resp.answers[stmt.id];
        const score = typeof v === 'number' ? v : null;
        lines.push(
          buildCsvRow([
            c.name,
            stmt.statement_text,
            formatScore(score),
            score !== null ? SCALE_LABELS[score] : 'Not answered',
          ])
        );
      }
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
