import { useMemo } from 'react';
import { ToolShell, StepNav, ResultsCard } from '@/components/ToolShell';
import { Button, Card, LikertRow, ScoreBar } from '@/components/ui';
import {
  FREQUENCY_OPTIONS,
  RELEVANCE_THRESHOLD,
  calculateHomeBehaviourScores,
  getHomeBehaviourQuestionsByCategory,
  homeBehaviourCategories,
  homeBehaviourQuestions,
} from '@/data/homeBehaviourData';
import { buildToolCsv, downloadToolCsv, type Row } from '@/lib/csv';
import { useToolSession } from '@/lib/useToolSession';

interface HomeBehaviourState {
  responses: Record<string, number>;
  step: number;
  finished: boolean;
}

const labelFor = (value: number) => FREQUENCY_OPTIONS.find((o) => o.value === value)?.label ?? '';

export default function HomeBehaviourTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<HomeBehaviourState>('home-behaviour', {
    responses: {},
    step: 0,
    finished: false,
  });

  const scores = useMemo(() => calculateHomeBehaviourScores(state.responses), [state.responses]);
  const relevant = homeBehaviourCategories.filter((c) => scores[c.id] >= RELEVANCE_THRESHOLD);

  const setResponse = (id: string, value: number) =>
    setState((p) => ({ ...p, responses: { ...p.responses, [id]: value } }));

  const handleDownload = () => {
    const summaryRows: Row[] = homeBehaviourCategories.map((c) => [
      c.label,
      scores[c.id],
      scores[c.id] >= RELEVANCE_THRESHOLD ? 'Relevant' : '',
      c.description,
    ]);
    const detailRows: Row[] = homeBehaviourQuestions.map((q) => {
      const cat = homeBehaviourCategories.find((c) => c.id === q.categoryId);
      const v = state.responses[q.id];
      return [cat?.label ?? q.categoryId, q.text, typeof v === 'number' ? v : '', typeof v === 'number' ? labelFor(v) : 'Not answered'];
    });
    const adviceRows: Row[] = relevant.map((c) => [c.label, c.advice]);
    const linkRows: Row[] = relevant.flatMap((c) => c.webLinks.map((l) => [c.label, l.label, l.url]));
    const csv = buildToolCsv({
      toolName: 'Home Behaviour',
      childId,
      summaryHeader: ['Category', 'Average score (1-5)', 'Flag', 'Description'],
      summaryRows,
      detailHeader: ['Category', 'My child…', 'Score (1-5)', 'Response'],
      detailRows,
      extraBlocks: [
        { title: 'ADVICE (relevant categories)', header: ['Category', 'Advice'], rows: adviceRows },
        { title: 'USEFUL LINKS', header: ['Category', 'Link', 'URL'], rows: linkRows },
      ],
    });
    downloadToolCsv('home-behaviour', childId, csv);
  };

  if (state.finished) {
    return (
      <ToolShell
        title="Home Behaviour — results"
        intro={`Categories averaging ${RELEVANCE_THRESHOLD} or above are worth looking at first.`}
        childId={childId}
        onRestart={restart}
      >
        <ResultsCard title="Average score per category (1–5)">
          <div className="space-y-3">
            {homeBehaviourCategories.map((c) => (
              <ScoreBar key={c.id} label={c.label} value={scores[c.id]} max={5} suffix="" />
            ))}
          </div>
        </ResultsCard>

        {relevant.map((c) => (
          <ResultsCard key={c.id} title={c.label}>
            <p className="text-sm text-muted-foreground">{c.advice}</p>
            {c.webLinks.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {c.webLinks.map((l) => (
                  <li key={l.url}>
                    <a className="text-primary underline" href={l.url} target="_blank" rel="noreferrer noopener">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </ResultsCard>
        ))}

        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Download all responses, scores and advice as a spreadsheet.</p>
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

  const category = homeBehaviourCategories[Math.min(state.step, homeBehaviourCategories.length - 1)];
  const questions = getHomeBehaviourQuestionsByCategory(category.id);
  const isLast = state.step >= homeBehaviourCategories.length - 1;

  return (
    <ToolShell
      title="Home Behaviour"
      intro="How often does each statement describe your child at home?"
      childId={childId}
      stepIndex={state.step}
      stepCount={homeBehaviourCategories.length}
      stepLabel={category.label}
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
        <h2 className="font-display text-xl font-bold">{category.label}</h2>
        <p className="mb-2 text-sm text-muted-foreground">{category.description}</p>
        {questions.map((q) => (
          <LikertRow
            key={q.id}
            name={q.id}
            question={`My child ${q.text}`}
            options={FREQUENCY_OPTIONS}
            value={state.responses[q.id]}
            onChange={(v) => setResponse(q.id, v)}
          />
        ))}
      </Card>
    </ToolShell>
  );
}
