import { useState } from 'react';
import { MwmCriteria } from '@/data/mwmCriteriaData';
import { MwmResponse } from '@/lib/mwm/localStorage';
import { criteriaScoresFromResponse, formatScore } from '@/lib/mwm/scoring';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MwmCompletionSummaryProps {
  criteria: MwmCriteria[];
  response: MwmResponse;
}

export default function MwmCompletionSummary({ criteria, response }: MwmCompletionSummaryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scores = criteriaScoresFromResponse(criteria, response);

  const SCALE_LABELS: Record<number, string> = {
    1: 'Never',
    2: 'Rarely',
    3: 'Sometimes',
    4: 'Often',
    5: 'Always',
  };

  return (
    <div className="space-y-2">
      {scores.map((score) => {
        const c = criteria.find((x) => x.id === score.criteriaId);
        if (!c) return null;

        const isExpanded = expandedId === score.criteriaId;

        return (
          <div key={score.criteriaId} className="border rounded-lg">
            <button
              onClick={() => setExpandedId(isExpanded ? null : score.criteriaId)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {score.answered} of {score.total} answered
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-primary">{formatScore(score.score)}</div>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t bg-gray-50 p-3 text-sm">
                <div className="space-y-2">
                  {c.statements.map((stmt) => {
                    const v = response.answers[stmt.id];
                    const ratingLabel = v ? SCALE_LABELS[v] : 'Not answered';
                    return (
                      <div key={stmt.id} className="pb-2 border-b last:border-b-0">
                        <p className="text-xs mb-1">{stmt.statement_text}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{ratingLabel}</span>
                          {v && <span className="font-bold text-primary">{v}/5</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
