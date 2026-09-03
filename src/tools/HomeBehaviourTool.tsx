import { useEffect, useMemo } from 'react';
import { ToolShell, ResultsCard } from '@/components/ToolShell';
import { Button, Card, Progress, ScoreBar } from '@/components/ui';
import { Download, ExternalLink } from 'lucide-react';
import {
  FREQUENCY_OPTIONS,
  RELEVANCE_THRESHOLD,
  calculateHomeBehaviourScores,
  homeBehaviourCategories,
  homeBehaviourQuestions,
} from '@/data/homeBehaviourData';
import { buildToolCsv, downloadToolCsv, type Row } from '@/lib/csv';
import { useToolSession } from '@/lib/useToolSession';
import { adsEnabledFor, ADSENSE_SLOTS } from '@/lib/adConfig';
import { AdBanner } from '@/components/AdBanner';
import { InterstitialGate } from '@/components/InterstitialGate';
import { AffiliateDisclosureBanner, MultiAreaProductGrid } from '@/components/AffiliateProducts';
import { PremiumLockButton } from '@/components/PremiumLockButton';

/** A break appears after every Nth question — mirrors BehaviourTool's per-statement cadence. */
const INTERSTITIAL_EVERY_N_QUESTIONS = 5;

interface HomeBehaviourState {
  responses: Record<string, number>;
  /** Index into the flat, already-interleaved `homeBehaviourQuestions` array — questions are
   *  asked one at a time in that mixed order, never grouped or blocked by category. */
  index: number;
  finished: boolean;
  interstitialPending: boolean;
}

const labelFor = (value: number) => FREQUENCY_OPTIONS.find((o) => o.value === value)?.label ?? '';

export default function HomeBehaviourTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<HomeBehaviourState>('home-behaviour', {
    responses: {},
    index: 0,
    finished: false,
    interstitialPending: false,
  });

  useEffect(() => {
    if (state.finished) setCompleted(true);
  }, [state.finished, setCompleted]);

  const scores = useMemo(() => calculateHomeBehaviourScores(state.responses), [state.responses]);
  const relevant = homeBehaviourCategories.filter((c) => scores[c.id] >= RELEVANCE_THRESHOLD);

  const handleAnswer = (value: number) => {
    setState((prev) => {
      const question = homeBehaviourQuestions[prev.index];
      if (!question) return prev;
      const responses = { ...prev.responses, [question.id]: value };
      const nextIndex = prev.index + 1;
      if (nextIndex >= homeBehaviourQuestions.length) {
        return { ...prev, responses, index: nextIndex, finished: true };
      }
      const showInterstitial = adsEnabledFor('home-behaviour') && nextIndex % INTERSTITIAL_EVERY_N_QUESTIONS === 0;
      return { ...prev, responses, index: nextIndex, interstitialPending: showInterstitial };
    });
    window.scrollTo(0, 0);
  };

  const handlePrevious = () => setState((prev) => ({ ...prev, index: Math.max(0, prev.index - 1) }));

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
          <PremiumLockButton label="Download high-quality PDF" className="min-w-[160px] flex-1" />
          <PremiumLockButton label="Download / save young person for future" className="min-w-[160px] flex-1" />
          <Button
            variant="outline"
            className="min-w-[160px] flex-1"
            onClick={() => setState((p) => ({ ...p, index: homeBehaviourQuestions.length - 1, finished: false }))}
          >
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
        onContinue={() => setState((prev) => ({ ...prev, interstitialPending: false }))}
      />
    );
  }

  const index = Math.min(state.index, homeBehaviourQuestions.length - 1);
  const question = homeBehaviourQuestions[index];
  const progress = Math.round(((index + 1) / homeBehaviourQuestions.length) * 100);

  return (
    <ToolShell title="Home Behaviour" childId={childId} onRestart={restart}>
      <Card>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Question {index + 1} of {homeBehaviourQuestions.length}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <p className="text-lg font-semibold">My child {question.text}</p>

          <div className="space-y-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                variant={state.responses[question.id] === opt.value ? 'primary' : 'outline'}
                className="w-full justify-start"
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <Button onClick={handlePrevious} disabled={index === 0} variant="ghost" className="w-full">
            ← Previous
          </Button>
        </div>
      </Card>

      <AdBanner toolId="home-behaviour" slot={ADSENSE_SLOTS.inputBanner} />
    </ToolShell>
  );
}
