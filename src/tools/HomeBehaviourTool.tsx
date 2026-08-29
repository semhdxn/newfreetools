import { useMemo } from 'react';
import { ToolShell, StepNav, ResultsCard } from '@/components/ToolShell';
import { Button, Card, LikertRow, ScoreBar } from '@/components/ui';
import { Download, ExternalLink } from 'lucide-react';
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
import { adsEnabledFor, INTERSTITIAL_EVERY_N_PAGES, ADSENSE_SLOTS } from '@/lib/adConfig';
import { AdBanner } from '@/components/AdBanner';
import { InterstitialGate } from '@/components/InterstitialGate';
import { AffiliateDisclosureBanner, MultiAreaProductGrid } from '@/components/AffiliateProducts';
import { PremiumLockButton } from '@/components/PremiumLockButton';

interface HomeBehaviourState {
  responses: Record<string, number>;
  step: number;
  finished: boolean;
  /** A state patch waiting to be applied once the interstitial ad's countdown clears. */
  interstitialPending: Partial<HomeBehaviourState> | null;
}

const labelFor = (value: number) => FREQUENCY_OPTIONS.find((o) => o.value === value)?.label ?? '';

export default function HomeBehaviourTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<HomeBehaviourState>('home-behaviour', {
    responses: {},
    step: 0,
    finished: false,
    interstitialPending: null,
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
        <AffiliateDisclosureBanner toolId="home-behaviour" />

        <ResultsCard title="Average score per category (1–5)">
          <div className="space-y-3">
            {homeBehaviourCategories.map((c) => (
              <ScoreBar key={c.id} label={c.label} value={scores[c.id]} max={5} suffix="" banded />
            ))}
          </div>
        </ResultsCard>

        {relevant.map((c) => (
          <ResultsCard key={c.id} title={c.label}>
            <p className="text-sm text-muted-foreground">{c.advice}</p>
            {c.webLinks.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {c.webLinks.map((l) => (
                  <li key={l.url} className="flex items-start gap-1.5">
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <a className="text-primary underline" href={l.url} target="_blank" rel="noreferrer noopener">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <MultiAreaProductGrid toolId="home-behaviour" areaIds={c.productIds} />
          </ResultsCard>
        ))}

        <AdBanner toolId="home-behaviour" slot={ADSENSE_SLOTS.resultsBanner} />

        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Download all responses, scores and advice as a spreadsheet.</p>
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

        <AdBanner toolId="home-behaviour" slot={ADSENSE_SLOTS.resultsBanner} />
      </ToolShell>
    );
  }

  if (state.interstitialPending) {
    return (
      <InterstitialGate
        toolId="home-behaviour"
        onContinue={() =>
          setState((prev) => ({ ...prev, ...(prev.interstitialPending ?? {}), interstitialPending: null }))
        }
      />
    );
  }

  const category = homeBehaviourCategories[Math.min(state.step, homeBehaviourCategories.length - 1)];
  const questions = getHomeBehaviourQuestionsByCategory(category.id);
  const isLast = state.step >= homeBehaviourCategories.length - 1;

  const goNext = () => {
    const patch: Partial<HomeBehaviourState> = isLast ? { finished: true } : { step: state.step + 1 };
    const pageNumber = state.step + 1;
    if (isLast) setCompleted(true);
    if (adsEnabledFor('home-behaviour') && pageNumber % INTERSTITIAL_EVERY_N_PAGES === 0) {
      setState((p) => ({ ...p, interstitialPending: patch }));
    } else {
      setState((p) => ({ ...p, ...patch }));
    }
    window.scrollTo(0, 0);
  };

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
          onNext={goNext}
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

      <AdBanner toolId="home-behaviour" slot={ADSENSE_SLOTS.inputBanner} />
    </ToolShell>
  );
}
