import { useMemo } from 'react';
import { ToolShell, StepNav, ResultsCard } from '@/components/ToolShell';
import { Button, Card, LikertRow, ScoreBar } from '@/components/ui';
import { Download, Users } from 'lucide-react';
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
import { adsEnabledFor, INTERSTITIAL_EVERY_N_PAGES, ADSENSE_SLOTS } from '@/lib/adConfig';
import { AdBanner } from '@/components/AdBanner';
import { InterstitialGate } from '@/components/InterstitialGate';
import { AffiliateDisclosureBanner, MultiAreaProductGrid } from '@/components/AffiliateProducts';
import { PremiumLockButton } from '@/components/PremiumLockButton';

interface BehaviourState {
  cohort: Cohort | null;
  responses: Record<string, number>;
  step: number;
  finished: boolean;
  /** A state patch waiting to be applied once the interstitial ad's countdown clears. */
  interstitialPending: Partial<BehaviourState> | null;
}

const labelFor = (value: number) => FREQUENCY_OPTIONS.find((o) => o.value === value)?.label ?? '';

export default function BehaviourTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<BehaviourState>('behaviour', {
    cohort: null,
    responses: {},
    step: 0,
    finished: false,
    interstitialPending: null,
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
            <Users className="h-4 w-4 mr-1.5" />
            Primary
          </Button>
          <Button size="lg" variant="accent" className="flex-1" onClick={() => setState((p) => ({ ...p, cohort: 'secondary' }))}>
            <Users className="h-4 w-4 mr-1.5" />
            Secondary
          </Button>
        </Card>
      </ToolShell>
    );
  }

  if (state.finished && scores) {
    return (
      <ToolShell title="Behaviour (School) — results" childId={childId} onRestart={restart}>
        <AffiliateDisclosureBanner toolId="behaviour" />

        <ResultsCard title="Scores by function">
          <div className="space-y-4">
            {behaviourFunctions.map((f) => (
              <div key={f.id}>
                <ScoreBar label={f.label} value={scores[f.id]} banded />
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
              <MultiAreaProductGrid toolId="behaviour" areaIds={[`behaviour-${f.id}`]} />
            </ResultsCard>
          ))}

        <AdBanner toolId="behaviour" slot={ADSENSE_SLOTS.resultsBanner} />

        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Download all responses, scores and strategies as a spreadsheet.</p>
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

        <AdBanner toolId="behaviour" slot={ADSENSE_SLOTS.resultsBanner} />
      </ToolShell>
    );
  }

  if (state.interstitialPending) {
    return (
      <InterstitialGate
        toolId="behaviour"
        onContinue={() =>
          setState((prev) => ({ ...prev, ...(prev.interstitialPending ?? {}), interstitialPending: null }))
        }
      />
    );
  }

  const fn = behaviourFunctions[Math.min(state.step, behaviourFunctions.length - 1)];
  const stmts = getStatementsForFunctionAndCohort(fn.id, cohort);
  const isLast = state.step >= behaviourFunctions.length - 1;

  const goNext = () => {
    const patch: Partial<BehaviourState> = isLast ? { finished: true } : { step: state.step + 1 };
    const pageNumber = state.step + 1;
    if (isLast) setCompleted(true);
    if (adsEnabledFor('behaviour') && pageNumber % INTERSTITIAL_EVERY_N_PAGES === 0) {
      setState((p) => ({ ...p, interstitialPending: patch }));
    } else {
      setState((p) => ({ ...p, ...patch }));
    }
    window.scrollTo(0, 0);
  };

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
          onNext={goNext}
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

      <AdBanner toolId="behaviour" slot={ADSENSE_SLOTS.inputBanner} />
    </ToolShell>
  );
}
