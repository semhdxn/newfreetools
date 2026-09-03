import { MwmCriteria } from '@/data/mwmCriteriaData';
import { MwmResponse } from './localStorage';

export function averageOf(scores: number[]): number | null {
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export interface CriteriaScore {
  criteriaId: string;
  name: string;
  score: number | null;
  answered: number;
  total: number;
}

export function criteriaScores(criteria: MwmCriteria[], answers: Record<string, number>): CriteriaScore[] {
  return criteria
    .map((c) => {
      const scores = c.statements.map((s) => answers[s.id]).filter((v): v is number => typeof v === 'number');
      return {
        criteriaId: c.id,
        name: c.name,
        score: averageOf(scores),
        answered: scores.length,
        total: c.statements.length,
      };
    })
    .filter((s) => s.score !== null);
}

export function criteriaScoresFromResponse(criteria: MwmCriteria[], response: MwmResponse): CriteriaScore[] {
  return criteriaScores(criteria, response.answers);
}

export function overallAverage(scores: CriteriaScore[]): number | null {
  if (scores.length === 0) return null;
  const sum = scores.reduce((acc, s) => acc + (s.score ?? 0), 0);
  return sum / scores.length;
}

export function formatScore(score: number | null): string {
  if (score === null) return '—';
  return Number(score.toFixed(2)).toString();
}
