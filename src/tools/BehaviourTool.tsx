import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { ToolShell, ResultsCard } from '@/components/ToolShell';
import { Card, Button, CheckItem, Progress } from '@/components/ui';
import { useToolSession } from '@/lib/useToolSession';
import { buildToolCsv, downloadToolCsv, type Row } from '@/lib/csv';
import { adsEnabledFor, ADSENSE_SLOTS } from '@/lib/adConfig';
import { AdBanner } from '@/components/AdBanner';
import { InterstitialGate } from '@/components/InterstitialGate';
import { PremiumLockButton } from '@/components/PremiumLockButton';
import {
  Cohort,
  behaviourFunctions,
  getStatementsForCohort,
  getStatementsForFunctionAndCohort,
  getStrategiesForFunction,
  calculateScores,
  getBandColour,
  BASELINE_THRESHOLD,
  SENSORY_ALERT_THRESHOLD,
  FREQUENCY_OPTIONS,
  type ScoreMap,
} from '@/data/behaviourToolData';

/** Zeroed fallback so `getScores()` always returns a fully-typed ScoreMap,
 *  even before a cohort is picked — avoids widening the return type to
 *  `{} | ScoreMap`, which breaks indexing by BehaviourFunction elsewhere. */
const EMPTY_SCORES: ScoreMap = { control: 0, attention: 0, escape: 0, sensory: 0, 'self-esteem': 0 };

/** A function's statements were answered "Often" or "Very Often" often enough
 *  to be worth acting on — strategies are only ever shown/exported for
 *  functions that clear this bar, not just any function with a non-zero
 *  aggregate score. */
const OFTEN_OR_MORE = 3;

/** A timed interstitial appears after every Nth statement is answered. */
const INTERSTITIAL_EVERY_N_STATEMENTS = 5;

type Phase = 'cohort' | 'details' | 'questions' | 'results';

const DISCLAIMER_TEXT = `The functional analysis and selected strategies provided by this tool should not be considered professional, specialist or medical advice. The owners and creators of this website accept no liability for any losses or damages arising from the use of this tool. This tool has been created using publicly available resources to help identify likely functions of behaviour and suggest general strategies. By proceeding, you agree to these terms.`;

interface BehaviourState {
  stage: Phase;
  cohort: Cohort | null;
  agreedToDisclaimer: boolean;
  permissionConfirmed: boolean;
  index: number;
  responses: Record<string, number>;
  completedAt: string | null;
  /** True while a timed interstitial ad is being shown, gating the next statement. */
  interstitialPending: boolean;
}

function initialState(): BehaviourState {
  return {
    stage: 'cohort',
    cohort: null,
    agreedToDisclaimer: false,
    permissionConfirmed: false,
    index: 0,
    responses: {},
    completedAt: null,
    interstitialPending: false,
  };
}

export default function BehaviourTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<BehaviourState>(
    'behaviour',
    initialState(),
  );

  useEffect(() => {
    if (state.stage === 'results') setCompleted(true);
  }, [state.stage, setCompleted]);

  const handleCohortSelect = (cohort: Cohort) => {
    setState(() => ({ ...initialState(), cohort, stage: 'details' }));
  };

  const handleDetailsNext = () => {
    setState((prev) => ({ ...prev, stage: 'questions' }));
  };

  const handleResponseSet = (questionId: string, value: number) => {
    setState((prev) => {
      if (!prev.cohort) return prev;
      const statements = getStatementsForCohort(prev.cohort);
      const responses = { ...prev.responses, [questionId]: value };
      const nextIndex = prev.index + 1;
      if (nextIndex >= statements.length) {
        return { ...prev, responses, index: nextIndex, completedAt: new Date().toISOString(), stage: 'results' };
      }
      const showInterstitial = adsEnabledFor('behaviour') && nextIndex % INTERSTITIAL_EVERY_N_STATEMENTS === 0;
      return { ...prev, responses, index: nextIndex, interstitialPending: showInterstitial };
    });
  };

  const handlePrevious = () => {
    setState((prev) => ({ ...prev, index: Math.max(0, prev.index - 1) }));
  };

  const getStatements = () => {
    if (!state.cohort) return [];
    return getStatementsForCohort(state.cohort);
  };

  const getScores = (): ScoreMap => {
    if (!state.cohort) return EMPTY_SCORES;
    return calculateScores(state.responses, state.cohort);
  };

  if (state.interstitialPending) {
    return (
      <InterstitialGate
        toolId="behaviour"
        onContinue={() => setState((prev) => ({ ...prev, interstitialPending: false }))}
      />
    );
  }

  if (state.stage === 'cohort') {
    return (
      <ToolShell title="Behaviour Indicator" childId={childId} onRestart={restart}>
        <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p>
            This is a free, basic version of the Behaviour Indicator in the full SEMH Toolkit (premium). The premium
            version includes a fuller strategy library, saved records and richer reports.
          </p>
        </div>
        <Card>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Different question banks are used for primary and secondary aged children.
            </p>
            <div className="space-y-3">
              <Button onClick={() => handleCohortSelect('primary')} size="lg" className="w-full justify-start h-auto py-3">
                Primary (typically 4–11)
              </Button>
              <Button
                onClick={() => handleCohortSelect('secondary')}
                size="lg"
                className="w-full justify-start h-auto py-3"
              >
                Secondary (typically 11–18)
              </Button>
            </div>
          </div>
        </Card>
        <AdBanner toolId="behaviour" slot={ADSENSE_SLOTS.inputBanner} />
      </ToolShell>
    );
  }

  if (state.stage === 'details' && state.cohort) {
    const canContinue = state.agreedToDisclaimer && state.permissionConfirmed && !!childId;

    return (
      <ToolShell title="About the young person" childId={childId} onRestart={restart}>
        <Card>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              No names or initials are collected — a Child ID keeps this pseudonymous.
            </p>

            <div className="bg-muted p-3 rounded border border-border">
              <p className="text-sm font-medium">Child ID: {childId}</p>
              <p className="text-xs text-muted-foreground mt-1">
                This ID links your answers together and keeps them anonymous.
              </p>
            </div>

            <div className="border border-border rounded p-3 bg-muted/50">
              <p className="text-xs leading-relaxed text-foreground">{DISCLAIMER_TEXT}</p>
            </div>

            <div className="space-y-2">
              <CheckItem
                label="I have read and agree to the disclaimer above."
                checked={state.agreedToDisclaimer}
                onChange={(v) => setState((prev) => ({ ...prev, agreedToDisclaimer: v }))}
              />
              <CheckItem
                label="I confirm I have the appropriate permission (from my setting and/or the young person's parent or carer) to enter this information."
                checked={state.permissionConfirmed}
                onChange={(v) => setState((prev) => ({ ...prev, permissionConfirmed: v }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setState((prev) => ({ ...prev, stage: 'cohort' }))} variant="outline" className="flex-1">
                ← Back
              </Button>
              <Button onClick={handleDetailsNext} disabled={!canContinue} className="flex-1">
                Start questionnaire →
              </Button>
            </div>
          </div>
        </Card>
        <AdBanner toolId="behaviour" slot={ADSENSE_SLOTS.inputBanner} />
      </ToolShell>
    );
  }

  if (state.stage === 'questions' && state.cohort) {
    const statements = getStatements();
    const currentStatement = statements[state.index];

    if (!currentStatement) {
      setState((prev) => ({ ...prev, stage: 'results', completedAt: prev.completedAt ?? new Date().toISOString() }));
      return null;
    }

    const progress = Math.round(((state.index + 1) / statements.length) * 100);

    return (
      <ToolShell title="Behaviour Indicator" childId={childId} onRestart={restart}>
        <Card>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Question {state.index + 1} of {statements.length}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <p className="text-lg font-semibold">{currentStatement.text}</p>

            <div className="space-y-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  onClick={() => handleResponseSet(currentStatement.id, opt.value)}
                  variant={state.responses[currentStatement.id] === opt.value ? 'primary' : 'outline'}
                  className="w-full justify-start"
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <Button onClick={handlePrevious} disabled={state.index === 0} variant="ghost" className="w-full">
              ← Previous
            </Button>
          </div>
        </Card>
        <AdBanner toolId="behaviour" slot={ADSENSE_SLOTS.inputBanner} />
      </ToolShell>
    );
  }

  if (state.stage === 'results' && state.cohort) {
    const scores = getScores();
    const sortedFunctions = [...behaviourFunctions].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
    // A function's strategies are only surfaced when at least one of its
    // statements was individually marked Often or Very Often — the broad
    // 20% aggregate baseline (BASELINE_THRESHOLD) is still used for the
    // score bars below, but not for deciding which strategies to show.
    const highlightedFunctions = sortedFunctions.filter((f) =>
      state.cohort
        ? getStatementsForFunctionAndCohort(f.id, state.cohort).some(
            (s) => (state.responses[s.id] ?? -1) >= OFTEN_OR_MORE,
          )
        : false,
    );
    const sensoryScore = scores.sensory || 0;

    const handleExportCsv = () => {
      if (!state.cohort) return;
      const statements = getStatements();
      const strategyRows: Row[] = [];
      highlightedFunctions.forEach((f) => {
        getStrategiesForFunction(f.id).forEach((s) => strategyRows.push([f.label, s.text]));
      });
      const csv = buildToolCsv({
        toolName: 'Behaviour Indicator',
        childId,
        summaryHeader: ['Function', 'Score (%)'],
        summaryRows: sortedFunctions.map((f) => [f.label, `${scores[f.id] || 0}`]),
        detailHeader: ['Statement', 'Function', 'Frequency'],
        detailRows: statements.map((s) => [
          s.text,
          s.function,
          FREQUENCY_OPTIONS.find((o) => o.value === state.responses[s.id])?.label ?? '—',
        ]),
        extraBlocks: [
          {
            title: 'SELECTED STRATEGIES (statements marked Often or Very Often only)',
            header: ['Function', 'Strategy'],
            rows: strategyRows,
          },
        ],
      });
      downloadToolCsv('behaviour', childId, csv);
    };

    return (
      <ToolShell title={`Behaviour Indicator — ${childId} (${state.cohort})`} childId={childId} onRestart={restart}>
        <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p>
            This is a free, basic version of the Behaviour Indicator in the full SEMH Toolkit (premium). The premium
            version includes a fuller strategy library, saved records and richer reports.
          </p>
        </div>
        <ResultsCard title="Function scores">
          <p className="mb-3 text-sm text-muted-foreground">
            The dashed line marks the 20% baseline. Scores at or below it mean the behaviours for that function were
            rarely or never reported — no clear evidence this function is driving the behaviour.
          </p>
          <div className="space-y-3">
            {sortedFunctions.map((f) => {
              const score = scores[f.id] || 0;
              return (
                <div key={f.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{f.label}</span>
                    <span className="text-muted-foreground">{score}%</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`${getBandColour(score)} h-full transition-all`} style={{ width: `${score}%` }} />
                    <div className="absolute left-[20%] top-0 bottom-0 border-l-2 border-dashed border-foreground/40" />
                  </div>
                </div>
              );
            })}
          </div>

          {highlightedFunctions.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-sm mb-1">Selected strategies</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Shown for functions with at least one statement marked Often or Very Often.
              </p>
              {highlightedFunctions.map((f) => {
                const strategies = getStrategiesForFunction(f.id).slice(0, 4);
                return (
                  <div key={f.id} className="mb-4 last:mb-0">
                    <p className="font-medium text-sm mb-2">
                      {f.label} ({scores[f.id] || 0}%)
                    </p>
                    <ul className="text-sm space-y-1 ml-4">
                      {strategies.map((s) => (
                        <li key={s.id} className="list-disc text-muted-foreground">
                          {s.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {highlightedFunctions.length === 0 && (
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Nothing was marked Often or Very Often, so there are no strategies to suggest yet. Consider
                re-running the indicator after observing the young person further.
              </p>
            </div>
          )}

          {sensoryScore > SENSORY_ALERT_THRESHOLD && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
              <p className="text-sm text-blue-900">
                The sensory score is elevated. Consider running the <strong>Sensory Checklist</strong> for more
                detailed analysis.
              </p>
            </div>
          )}
        </ResultsCard>

        <AdBanner toolId="behaviour" slot={ADSENSE_SLOTS.resultsBanner} />

        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Download all responses, scores and strategies as a spreadsheet.</p>
          <Button variant="accent" size="lg" onClick={handleExportCsv}>
            ⤓ Export data (CSV)
          </Button>
        </Card>

        <div className="flex flex-wrap gap-3">
          <PremiumLockButton label="Download high-quality PDF" className="min-w-[160px] flex-1" />
        </div>

        <AdBanner toolId="behaviour" slot={ADSENSE_SLOTS.resultsBanner} />
      </ToolShell>
    );
  }

  return null;
}
