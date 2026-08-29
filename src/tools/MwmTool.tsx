import { useMemo } from 'react';
import { ToolShell, StepNav, ResultsCard } from '@/components/ToolShell';
import { Button, Card, CheckItem, LikertRow, ScoreBar } from '@/components/ui';
import { Download, Target } from 'lucide-react';
import { measureWhatMattersCriteria } from '@/data/measureWhatMattersData';
import { buildToolCsv, downloadToolCsv, type Row } from '@/lib/csv';
import { useToolSession } from '@/lib/useToolSession';
import { adsEnabledFor, INTERSTITIAL_EVERY_N_PAGES, ADSENSE_SLOTS } from '@/lib/adConfig';
import { AdBanner } from '@/components/AdBanner';
import { InterstitialGate } from '@/components/InterstitialGate';
import { PremiumLockButton } from '@/components/PremiumLockButton';

interface MwmState {
  criteriaIds: string[];
  responses: Record<string, number>;
  step: number; // 0 = pick criteria, then one step per chosen criterion
  finished: boolean;
  /** A state patch waiting to be applied once the interstitial ad's countdown clears. */
  interstitialPending: Partial<MwmState> | null;
}

const SCALE = [
  { value: 1, label: '1 — Not yet' },
  { value: 2, label: '2 — Rarely' },
  { value: 3, label: '3 — Sometimes' },
  { value: 4, label: '4 — Often' },
  { value: 5, label: '5 — Consistently' },
];

const MAX_CRITERIA = 8;

export default function MwmTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<MwmState>('mwm', {
    criteriaIds: [],
    responses: {},
    step: 0,
    finished: false,
    interstitialPending: null,
  });

  const chosen = useMemo(
    () => state.criteriaIds.map((id) => measureWhatMattersCriteria.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c),
    [state.criteriaIds],
  );

  const averages = useMemo(
    () =>
      chosen.map((c) => {
        const answered = c.statements.map((s) => state.responses[s.id]).filter((v): v is number => typeof v === 'number');
        const avg = answered.length === 0 ? 0 : answered.reduce((a, b) => a + b, 0) / answered.length;
        return { criteria: c, answered: answered.length, average: Math.round(avg * 10) / 10 };
      }),
    [chosen, state.responses],
  );

  const overall = averages.length === 0 ? 0 : Math.round((averages.reduce((a, b) => a + b.average, 0) / averages.length) * 10) / 10;

  const handleDownload = () => {
    const summaryRows: Row[] = [
      ...averages.map((a) => [a.criteria.name, a.average, `${a.answered}/${a.criteria.statements.length}`] as Row),
      ['Overall average', overall, ''],
    ];
    const detailRows: Row[] = chosen.flatMap((c) =>
      c.statements.map((s) => {
        const v = state.responses[s.id];
        return [c.name, s.text, typeof v === 'number' ? v : '', typeof v === 'number' ? SCALE.find((o) => o.value === v)?.label ?? '' : 'Not answered'];
      }),
    );
    const csv = buildToolCsv({
      toolName: 'Measure What Matters',
      childId,
      summaryHeader: ['Criteria', 'Average (1-5)', 'Statements answered'],
      summaryRows,
      detailHeader: ['Criteria', 'Statement', 'Score (1-5)', 'Rating'],
      detailRows,
    });
    downloadToolCsv('measure-what-matters', childId, csv);
  };

  if (state.finished) {
    return (
      <ToolShell title="Measure What Matters — results" childId={childId} onRestart={restart}>
        <ResultsCard title={`Average score per criteria (overall ${overall}/5)`}>
          <div className="space-y-3">
            {averages.map((a) => (
              <ScoreBar key={a.criteria.id} label={a.criteria.name} value={a.average} max={5} suffix="/5" />
            ))}
          </div>
        </ResultsCard>

        <AdBanner toolId="mwm" slot={ADSENSE_SLOTS.resultsBanner} />

        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Download every statement score as a spreadsheet.</p>
          <Button variant="accent" size="lg" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </Card>

        <div className="flex flex-wrap gap-3">
          <PremiumLockButton label="Download / save young person for future" className="min-w-[160px] flex-1" />
          <Button variant="outline" className="min-w-[160px] flex-1" onClick={() => setState((p) => ({ ...p, finished: false }))}>
            Back to the questionnaire
          </Button>
        </div>

        <AdBanner toolId="mwm" slot={ADSENSE_SLOTS.resultsBanner} />
      </ToolShell>
    );
  }

  if (state.interstitialPending) {
    return (
      <InterstitialGate
        toolId="mwm"
        onContinue={() =>
          setState((prev) => ({ ...prev, ...(prev.interstitialPending ?? {}), interstitialPending: null }))
        }
      />
    );
  }

  if (state.step === 0) {
    const toggle = (id: string, on: boolean) =>
      setState((p) => ({
        ...p,
        criteriaIds: on ? (p.criteriaIds.length >= MAX_CRITERIA ? p.criteriaIds : [...p.criteriaIds, id]) : p.criteriaIds.filter((c) => c !== id),
      }));
    return (
      <ToolShell
        title="Measure What Matters"
        intro={`Choose the outcomes you want to measure (up to ${MAX_CRITERIA}), then rate each statement from 1 to 5.`}
        childId={childId}
        stepIndex={0}
        stepCount={1 + Math.max(chosen.length, 1)}
        stepLabel="Choose criteria"
        onRestart={restart}
        footer={
          <StepNav
            hideBack
            nextLabel="Start rating"
            nextDisabled={state.criteriaIds.length === 0}
            onNext={() => (setState((p) => ({ ...p, step: 1 })), window.scrollTo(0, 0))}
          />
        }
      >
        <Card>
          <p className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Target className="h-4 w-4 flex-shrink-0" />
            {state.criteriaIds.length} of {MAX_CRITERIA} selected
          </p>
          {measureWhatMattersCriteria.map((c) => (
            <CheckItem
              key={c.id}
              label={c.description ? `${c.name} — ${c.description}` : c.name}
              checked={state.criteriaIds.includes(c.id)}
              onChange={(on) => toggle(c.id, on)}
            />
          ))}
        </Card>
      </ToolShell>
    );
  }

  const index = Math.min(state.step - 1, chosen.length - 1);
  const criteria = chosen[index];
  const isLast = index >= chosen.length - 1;

  const goNext = () => {
    const patch: Partial<MwmState> = isLast ? { finished: true } : { step: state.step + 1 };
    if (isLast) setCompleted(true);
    if (adsEnabledFor('mwm') && (index + 1) % INTERSTITIAL_EVERY_N_PAGES === 0) {
      setState((p) => ({ ...p, interstitialPending: patch }));
    } else {
      setState((p) => ({ ...p, ...patch }));
    }
    window.scrollTo(0, 0);
  };

  return (
    <ToolShell
      title="Measure What Matters"
      intro="Rate each statement from 1 (not yet) to 5 (consistently)."
      childId={childId}
      stepIndex={state.step}
      stepCount={chosen.length + 1}
      stepLabel={criteria.name}
      onRestart={restart}
      footer={
        <StepNav
          onBack={() => (setState((p) => ({ ...p, step: Math.max(0, p.step - 1) })), window.scrollTo(0, 0))}
          onNext={goNext}
          nextLabel={isLast ? 'See results' : 'Next'}
        />
      }
    >
      <Card>
        <h2 className="font-display text-xl font-bold">{criteria.name}</h2>
        {criteria.description && <p className="mb-2 text-sm text-muted-foreground">{criteria.description}</p>}
        {criteria.statements.map((s) => (
          <LikertRow
            key={s.id}
            name={s.id}
            question={s.text}
            options={SCALE}
            value={state.responses[s.id]}
            onChange={(v) => setState((p) => ({ ...p, responses: { ...p.responses, [s.id]: v } }))}
          />
        ))}
      </Card>

      <AdBanner toolId="mwm" slot={ADSENSE_SLOTS.inputBanner} />
    </ToolShell>
  );
}
