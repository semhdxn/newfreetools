import { useMemo } from 'react';
import { ToolShell, StepNav, ResultsCard } from '@/components/ToolShell';
import { Button, Card, CheckItem, LikertRow, ScoreBar } from '@/components/ui';
import {
  FREQUENCY_OPTIONS,
  calculateScores,
  lookupEnvironmentText,
  lookupResponseText,
  notableByCategory,
  studentVoiceCategories,
  studentVoiceEnvironmentItems,
  studentVoiceResponseItems,
  studentVoiceStatements,
} from '@/data/studentVoiceData';
import { buildToolCsv, downloadToolCsv, type Row } from '@/lib/csv';
import { useToolSession } from '@/lib/useToolSession';

interface StudentVoiceState {
  responses: Record<string, number>;
  environment: string[];
  helpful: string[];
  step: number;
  finished: boolean;
}

const labelFor = (value: number) => FREQUENCY_OPTIONS.find((o) => o.value === value)?.label ?? '';

/** 4 category steps, then "what would help" pickers. */
const STEP_COUNT = studentVoiceCategories.length + 2;

export default function StudentVoiceTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<StudentVoiceState>('student-voice', {
    responses: {},
    environment: [],
    helpful: [],
    step: 0,
    finished: false,
  });

  const scores = useMemo(() => calculateScores(state.responses), [state.responses]);
  const notable = useMemo(() => notableByCategory(state.responses), [state.responses]);

  const toggleList = (listKey: 'environment' | 'helpful', id: string, on: boolean) =>
    setState((p) => ({
      ...p,
      [listKey]: on ? [...p[listKey], id] : p[listKey].filter((x) => x !== id),
    }));

  const handleDownload = () => {
    const summaryRows: Row[] = [
      ...studentVoiceCategories.map((c) => [c.label, `${scores[c.id]}%`, c.description] as Row),
      ['Emotional wellbeing', `${scores.emotional}%`, 'Composite of emotional-wellbeing statements'],
      ['Self esteem', `${scores.selfEsteem}%`, 'Composite of self-esteem statements'],
    ];
    const detailRows: Row[] = studentVoiceStatements.map((s) => {
      const cat = studentVoiceCategories.find((c) => c.id === s.category);
      const v = state.responses[s.id];
      return [cat?.label ?? s.category, s.text, typeof v === 'number' ? v : '', typeof v === 'number' ? labelFor(v) : 'Not answered'];
    });
    const csv = buildToolCsv({
      toolName: 'Pupil Voice',
      childId,
      summaryHeader: ['Area', 'Score', 'About'],
      summaryRows,
      detailHeader: ['Area', 'Statement', 'Score (0-5)', 'Answer'],
      detailRows,
      extraBlocks: [
        {
          title: 'THINGS I WOULD CHANGE ABOUT MY CLASSROOM',
          header: ['Chosen'],
          rows: state.environment.map((id) => [lookupEnvironmentText(id)]),
        },
        {
          title: 'WHAT HELPS WHEN THINGS FEEL HARD',
          header: ['Chosen'],
          rows: state.helpful.map((id) => [lookupResponseText(id)]),
        },
      ],
    });
    downloadToolCsv('pupil-voice', childId, csv);
  };

  if (state.finished) {
    return (
      <ToolShell title="Pupil Voice — results" childId={childId} onRestart={restart}>
        <ResultsCard title="Overview">
          <div className="space-y-3">
            {studentVoiceCategories.map((c) => (
              <ScoreBar key={c.id} label={c.label} value={scores[c.id]} />
            ))}
            <ScoreBar label="Emotional wellbeing" value={scores.emotional} />
            <ScoreBar label="Self esteem" value={scores.selfEsteem} />
          </div>
        </ResultsCard>

        {studentVoiceCategories.map((c) =>
          notable[c.id].length > 0 ? (
            <ResultsCard key={c.id} title={`Said "often" or "very often" — ${c.label}`}>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {notable[c.id].map((s) => (
                  <li key={s.id}>
                    {s.text}
                    {s.followUp ? <span className="block text-xs italic">Follow up: {s.followUp}</span> : null}
                  </li>
                ))}
              </ul>
            </ResultsCard>
          ) : null,
        )}

        {(state.environment.length > 0 || state.helpful.length > 0) && (
          <ResultsCard title="In their words">
            {state.environment.length > 0 && (
              <>
                <h3 className="text-sm font-semibold">Things I would change about my classroom</h3>
                <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {state.environment.map((id) => (
                    <li key={id}>{lookupEnvironmentText(id)}</li>
                  ))}
                </ul>
              </>
            )}
            {state.helpful.length > 0 && (
              <>
                <h3 className="text-sm font-semibold">What helps when things feel hard</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {state.helpful.map((id) => (
                    <li key={id}>{lookupResponseText(id)}</li>
                  ))}
                </ul>
              </>
            )}
          </ResultsCard>
        )}

        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Download every answer and score as a spreadsheet.</p>
          <Button variant="accent" size="lg" onClick={handleDownload}>
            Download CSV
          </Button>
        </Card>

        <Button variant="outline" onClick={() => setState((p) => ({ ...p, finished: false }))}>
          Back to the questions
        </Button>
      </ToolShell>
    );
  }

  const step = Math.min(state.step, STEP_COUNT - 1);
  const isLast = step === STEP_COUNT - 1;
  const category = studentVoiceCategories[step];

  let stepLabel = 'What would help';
  let body: JSX.Element;

  if (category) {
    stepLabel = category.label;
    const stmts = studentVoiceStatements.filter((s) => s.category === category.id);
    body = (
      <Card>
        <h2 className="font-display text-xl font-bold">How often is this true for you?</h2>
        <p className="mb-2 text-sm text-muted-foreground">There are no right or wrong answers.</p>
        {stmts.map((s) => (
          <LikertRow
            key={s.id}
            name={s.id}
            question={s.text}
            options={FREQUENCY_OPTIONS}
            value={state.responses[s.id]}
            onChange={(v) => setState((p) => ({ ...p, responses: { ...p.responses, [s.id]: v } }))}
          />
        ))}
      </Card>
    );
  } else if (step === studentVoiceCategories.length) {
    body = (
      <Card>
        <h2 className="font-display text-xl font-bold">Things I would change about my classroom</h2>
        <p className="mb-2 text-sm text-muted-foreground">Pick as many as you like, or none.</p>
        {studentVoiceEnvironmentItems.map((i) => (
          <CheckItem
            key={i.id}
            label={i.text}
            checked={state.environment.includes(i.id)}
            onChange={(on) => toggleList('environment', i.id, on)}
          />
        ))}
      </Card>
    );
  } else {
    body = (
      <Card>
        <h2 className="font-display text-xl font-bold">What helps when things feel hard?</h2>
        <p className="mb-2 text-sm text-muted-foreground">Pick as many as you like, or none.</p>
        {studentVoiceResponseItems.map((i) => (
          <CheckItem
            key={i.id}
            label={i.text}
            checked={state.helpful.includes(i.id)}
            onChange={(on) => toggleList('helpful', i.id, on)}
          />
        ))}
      </Card>
    );
  }

  return (
    <ToolShell
      title="Pupil Voice"
      intro="Your answers are saved on this device as you go. You can stop at any time and come back."
      childId={childId}
      stepIndex={step}
      stepCount={STEP_COUNT}
      stepLabel={stepLabel}
      onRestart={restart}
      footer={
        <StepNav
          hideBack={step === 0}
          backLabel="Go back"
          onBack={() => setState((p) => ({ ...p, step: Math.max(0, p.step - 1) }))}
          onNext={() =>
            isLast
              ? (setState((p) => ({ ...p, finished: true })), setCompleted(true), window.scrollTo(0, 0))
              : (setState((p) => ({ ...p, step: p.step + 1 })), window.scrollTo(0, 0))
          }
          nextLabel={isLast ? 'Finish' : 'Next'}
        />
      }
    >
      {body}
    </ToolShell>
  );
}
