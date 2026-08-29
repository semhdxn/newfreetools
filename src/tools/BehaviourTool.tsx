import { useMemo } from 'react';
import { ToolShell, StepNav, ResultsCard } from '@/components/ToolShell';
import { Button, Card, LikertRow, ScoreBar } from '@/components/ui';
import {
  FREQUENCY_OPTIONS,
  behaviourFunctions,
  calculateScores,
  getStatementsForCohort,
  getStatementsForFunctionAndCohort,
  getStrategiesForFunction,
  type Cohort,
} from '@/data/behaviourData';
import { buildToolCsv, downloadToolCsv, type Row } from '@/lib/csv';
import { useToolSession } from '@/lib/useToolSession';

interface BehaviourState {
  cohort: Cohort | null;
  responses: Record<string, number>;
  step: number;
  finished: boolean;
}

const labelFor = (value: number) => FREQUENCY_OPTIONS.find((o) => o.value === value)?.label ?? '';

export default function BehaviourTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<BehaviourState>('behaviour', {
    cohort: null,
    responses: {},
    step: 0,
    finished: false,
  });

  const cohort = state.cohort;
  const scores = useMemo(() => (cohort ? calculateScores(state.responses, cohort) : null), [state.responses, cohort]);

  const setResponse = (id: string, value: number) =>
    setState((p) => ({ ...p, responses: { ...p.responses, [id]: value } }));

  const handleDownload = () => {
    if (!cohort || !scores) return;
    const summaryRows: Row[] = behaviourFunctions.map((f) => [f.label, `${scores[f.id]}%`, f.description]);
    const detailRows: Row[] = getStatementsForCohort(cohort).map((s) => {
      const fn = behaviourFunctions.find((f) => f.id === s.function);
      const v = state.responses[s.id];
      return [fn?.label ?? s.function, s.text, typeof v === 'number' ? v : '', typeof v === 'number' ? labelFor(v) : 'Not answered'];
    });
    const strategyRows: Row[] = behaviourFunctions
      .filter((f) => f.id !== 'self-esteem' && scores[f.id] >= 50)
      .flatMap((f) => getStrategiesForFunction(f.id).map((s) => [f.label, s.text]));
    const csv = buildToolCsv({
      toolName: `Behaviour (School) — ${cohort}`,
      childId,
      summaryHeader: ['Function', 'Score', 'Description'],
      summaryRows,
      detailHeader: ['Function', 'Statement', 'Score (0-4)', 'Response'],
      detailRows,
      extraBlocks: [{ title: 'SUGGESTED STRATEGIES (scores 50% and above)', header: ['Function', 'Strategy'], rows: strategyRows }],
    });
    downloadToolCsv('behaviour-school', childId, csv);
  };

  if (!cohort) {
    return (
      <ToolShell title="Behaviour (School)" intro="Which group is the child in?" childId={childId} onRestart={restart}>
        <Card className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" variant="accent" className="flex-1" onClick={() => setState((p) => ({ ...p, cohort: 'primary' }))}>
            Primary
          </Button>
          <Button size="lg" variant="accent" className="flex-1" onClick={() => setState((p) => ({ ...p, cohort: 'secondary' }))}>
            Secondary
          </Button>
        </Card>
      </ToolShell>
    );
  }

  if (state.finished && scores) {
    return (
      <ToolShell title="Behaviour (School) — results" childId={childId} onRestart={restart}>
        <ResultsCard title="Scores by function">
          <div className="space-y-4">
            {behaviourFunctions.map((f) => (
              <div key={f.id}>
                <ScoreBar label={f.label} value={scores[f.id]} />
                <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </ResultsCard>

        {behaviourFunctions
          .filter((f) => f.id !== 'self-esteem' && scores[f.id] >= 50)
          .map((f) => (
            <ResultsCard key={f.id} title={`Strategies — ${f.label}`}>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {getStrategiesForFunction(f.id).slice(0, 8).map((s) => (
                  <li key={s.id}>{s.text}</li>
                ))}
              </ul>
            </ResultsCard>
          ))}

        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Download all responses, scores and strategies as a spreadsheet.</p>
          <Button variant="accent" size="lg" onClick={handleDownload}>
            Download CSV
          </Button>
        </Card>

        <Button variant="outline" onClick={() => setState((p) => ({ ...p, finished: false }))}>
          Back to the questionnaire
        </Button>
      </ToolShell>
    );
  }

  const fn = behaviourFunctions[Math.min(state.step, behaviourFunctions.length - 1)];
  const stmts = getStatementsForFunctionAndCohort(fn.id, cohort);
  const isLast = state.step >= behaviourFunctions.length - 1;

  return (
    <ToolShell
      title="Behaviour (School)"
      intro="How often does the child show each behaviour in school?"
      childId={childId}
      stepIndex={state.step}
      stepCount={behaviourFunctions.length}
      stepLabel={fn.label}
      onRestart={restart}
      footer={
        <StepNav
          hideBack={state.step === 0}
          onBack={() => setState((p) => ({ ...p, step: Math.max(0, p.step - 1) }))}
          onNext={() =>
            isLast
              ? (setState((p) => ({ ...p, finished: true })), setCompleted(true), window.scrollTo(0, 0))
              : (setState((p) => ({ ...p, step: p.step + 1 })), window.scrollTo(0, 0))
          }
          nextLabel={isLast ? 'See results' : 'Next'}
        />
      }
    >
      <Card>
        <h2 className="font-display text-xl font-bold">{fn.label}</h2>
        <p className="mb-2 text-sm text-muted-foreground">{fn.description}</p>
        {stmts.map((s) => (
          <LikertRow
            key={s.id}
            name={s.id}
            question={s.text}
            options={FREQUENCY_OPTIONS}
            value={state.responses[s.id]}
            onChange={(v) => setResponse(s.id, v)}
          />
        ))}
      </Card>
    </ToolShell>
  );
}
