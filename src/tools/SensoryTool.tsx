import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ToolShell } from '@/components/ToolShell';
import { Button, Card } from '@/components/ui';
import { getStatementsForArea, getStrategiesForArea, sensoryAreas, statements } from '@/data/sensoryData';
import type { ResponseType, SensoryArea, Statement, Strategy } from '@/data/types';
import { buildToolCsv, downloadToolCsv, type Row } from '@/lib/csv';
import { useToolSession } from '@/lib/useToolSession';
import { adsEnabledFor, INTERSTITIAL_EVERY_N_PAGES, ADSENSE_SLOTS } from '@/lib/adConfig';
import { AdBanner } from '@/components/AdBanner';
import { InterstitialGate } from '@/components/InterstitialGate';
import { AffiliateDisclosureBanner, AreaProductGrid } from '@/components/AffiliateProducts';
import { PremiumLockButton } from '@/components/PremiumLockButton';
import { RefreshCw, CheckCircle, Download, AlertTriangle, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface SensoryState {
  selectedStatements: string[];
  shownStatements: string[];
  step: 'intro' | 'phase1' | 'midpoint' | 'phase2' | 'results' | 'circuit';
  phase1Page: number;
  phase2Page: number;
  // Fixed once per assessment attempt and persisted, so a remount (e.g. the
  // user navigating away and back, or a page refresh) can't re-shuffle a
  // statement into the phase it wasn't originally shown in.
  phase1StatementIds: string[];
  phase2StatementIds: string[];
  selectedAreas: string[];
  selectedStrategies: Record<string, string[]>;
  disclaimerAgreed: boolean;
  permissionConfirmed: boolean;
  circuit: CircuitState | null;
  /** A state patch waiting to be applied once the interstitial ad's countdown clears. */
  interstitialPending: Partial<SensoryState> | null;
}

interface AreaResult {
  area: SensoryArea;
  areaStatements: Statement[];
  matched: Statement[];
  percentage: number;
  shown: Statement[];
}

type CircuitDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

interface CircuitStation {
  id: string;
  areaId: string;
  strategyId: string;
  minutes: number;
}

interface CircuitState {
  title: string;
  days: Record<CircuitDay, CircuitStation[]>;
}

const HIGHLIGHT_THRESHOLD = 50;
const MAX_SELECTED_AREAS = 6;
const STRATEGIES_PER_AREA = 3;
const STATEMENTS_PER_PAGE = 9;
const RESPONSE_TYPES: ResponseType[] = ['over', 'under', 'seeking'];
const RESPONSE_TYPE_LABEL: Record<ResponseType, string> = {
  over: 'Over-responsive',
  under: 'Under-responsive',
  seeking: 'Seeking',
};

// Sensory Circuit constants — a circuit only ever draws from areas that
// cleared the same HIGHLIGHT_THRESHOLD used for the "Highlighted" CSV status,
// so the planner can never disagree with what the results page showed.
const CIRCUIT_DAYS: { key: CircuitDay; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
];
const STATIONS_PER_DAY = 3;
const DEFAULT_STATION_MINUTES = 5;
const MIN_STATION_MINUTES = 1;
const MAX_STATION_MINUTES = 60;
const TARGET_MIN_MINUTES = 10;
const TARGET_MAX_MINUTES = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getProgressColor(percentage: number): string {
  if (percentage <= 25) return 'bg-success';
  if (percentage <= 75) return 'bg-amber-500';
  return 'bg-destructive';
}

/** A high-looking percentage built from only 1-2 ticks isn't a reliable
 * signal — flag it so it isn't over-interpreted. */
function isLowSampleHighPct(percentage: number, selectedCount: number): boolean {
  return percentage >= 35 && selectedCount > 0 && selectedCount <= 2;
}

/** "Vision - Over-responsive" -> "Vision" */
function senseLabel(area: SensoryArea): string {
  return area.label.split(' - ')[0];
}

function buildPhaseSplit(): { phase1: string[]; phase2: string[] } {
  const perArea: { phase1: string[]; phase2: string[] }[] = sensoryAreas.map((area) => {
    const stmts = getStatementsForArea(area.id).map((s) => s.id);
    const shuffled = shuffle(stmts);
    const mid = Math.ceil(shuffled.length / 2);
    return { phase1: shuffled.slice(0, mid), phase2: shuffled.slice(mid) };
  });
  return {
    phase1: shuffle(perArea.flatMap((s) => s.phase1)),
    phase2: shuffle(perArea.flatMap((s) => s.phase2)),
  };
}

function paginate(ids: string[]): string[][] {
  const pages: string[][] = [];
  for (let i = 0; i < ids.length; i += STATEMENTS_PER_PAGE) {
    pages.push(ids.slice(i, i + STATEMENTS_PER_PAGE));
  }
  return pages;
}

function emptyCircuitDays(): Record<CircuitDay, CircuitStation[]> {
  return Object.fromEntries(CIRCUIT_DAYS.map((d) => [d.key, [] as CircuitStation[]])) as Record<
    CircuitDay,
    CircuitStation[]
  >;
}

/**
 * Deals 3 stations x 5 days = 15 slots, round-robining across the highlighted
 * areas (each area's strategies shuffled once) so a day spreads across
 * flagged areas rather than being dominated by one. Wraps around within a
 * small area's pool when there aren't enough distinct strategies to fill
 * every slot without repeats.
 */
function generateDraftDays(highlightedAreaIds: string[]): Record<CircuitDay, CircuitStation[]> {
  const groups = highlightedAreaIds.map((areaId) => shuffle(getStrategiesForArea(areaId))).filter((g) => g.length > 0);
  const days = emptyCircuitDays();
  if (groups.length === 0) return days;

  const groupIndex = groups.map(() => 0);
  const totalSlots = CIRCUIT_DAYS.length * STATIONS_PER_DAY;

  for (let slot = 0; slot < totalSlots; slot++) {
    const dayKey = CIRCUIT_DAYS[Math.floor(slot / STATIONS_PER_DAY)].key;
    const groupNum = slot % groups.length;
    const group = groups[groupNum];
    const strategy = group[groupIndex[groupNum] % group.length];
    groupIndex[groupNum] += 1;
    days[dayKey].push({
      id: `${strategy.id}-${slot}`,
      areaId: strategy.areaId,
      strategyId: strategy.id,
      minutes: DEFAULT_STATION_MINUTES,
    });
  }
  return days;
}

function dayTotal(stations: CircuitStation[]): number {
  return stations.reduce((sum, s) => sum + s.minutes, 0);
}

function isDayInRange(totalMinutes: number): boolean {
  return totalMinutes >= TARGET_MIN_MINUTES && totalMinutes <= TARGET_MAX_MINUTES;
}

function defaultCircuitTitle(pseudonym: string): string {
  const formatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${pseudonym}'s Sensory Circuit — week of ${formatted}`;
}

function Badge({ children, tone = 'secondary' }: { children: ReactNode; tone?: 'secondary' | 'destructive' }) {
  const tones = {
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StatementCard({
  statement,
  selected,
  onToggle,
}: {
  statement: Statement;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`flex h-full cursor-pointer flex-col justify-between rounded-2xl border-2 bg-card p-4 text-left shadow-sm transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 transition-colors ${
            selected ? 'border-primary bg-primary' : 'border-border bg-background'
          }`}
        >
          {selected && (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
          )}
        </div>
        <p className="text-sm leading-snug text-foreground">{statement.text}</p>
      </div>
      {statement.source && (
        <div className="mt-3 flex justify-end">
          <a
            href={statement.source}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Source
          </a>
        </div>
      )}
    </div>
  );
}

export default function SensoryTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<SensoryState>('sensory', {
    selectedStatements: [],
    shownStatements: [],
    step: 'intro',
    phase1Page: 0,
    phase2Page: 0,
    phase1StatementIds: [],
    phase2StatementIds: [],
    selectedAreas: [],
    selectedStrategies: {},
    disclaimerAgreed: false,
    permissionConfirmed: false,
    circuit: null,
    interstitialPending: null,
  });

  const [activeCircuitDay, setActiveCircuitDay] = useState<CircuitDay>('mon');

  const selected = useMemo(() => new Set(state.selectedStatements), [state.selectedStatements]);
  const shown = useMemo(() => new Set(state.shownStatements), [state.shownStatements]);

  // Compute the phase 1 / phase 2 split once per assessment attempt and save
  // it to the session. Re-runs only when childId changes (i.e. after
  // "Start again" generates a fresh pseudonym for a new attempt).
  useEffect(() => {
    setState((prev) => {
      if (prev.phase1StatementIds.length > 0 || prev.phase2StatementIds.length > 0) return prev;
      const split = buildPhaseSplit();
      return { ...prev, phase1StatementIds: split.phase1, phase2StatementIds: split.phase2 };
    });
  }, [childId, setState]);

  const phase1Pages = useMemo(() => paginate(state.phase1StatementIds), [state.phase1StatementIds]);
  const phase2Pages = useMemo(() => paginate(state.phase2StatementIds), [state.phase2StatementIds]);

  const currentPage = useMemo(() => {
    if (state.step === 'phase1' && phase1Pages.length > state.phase1Page) {
      return phase1Pages[state.phase1Page];
    }
    if (state.step === 'phase2' && phase2Pages.length > state.phase2Page) {
      return phase2Pages[state.phase2Page];
    }
    return [];
  }, [state.step, state.phase1Page, state.phase2Page, phase1Pages, phase2Pages]);

  const totalPages = phase1Pages.length + phase2Pages.length;
  const currentPageNumber =
    state.step === 'phase1' ? state.phase1Page + 1 : phase1Pages.length + state.phase2Page + 1;

  const progressPercent = useMemo(() => {
    if (totalPages === 0) return 0;
    const currentPhaseOffset = state.step === 'phase1' ? 0 : phase1Pages.length;
    const currentPageNum = state.step === 'phase1' ? state.phase1Page : state.phase2Page;
    return Math.round(((currentPhaseOffset + currentPageNum) / totalPages) * 100);
  }, [state.step, state.phase1Page, state.phase2Page, phase1Pages.length, totalPages]);

  // A statement counts toward an area's pool the moment it's actually shown
  // on screen, not only when the user happens to click it.
  useEffect(() => {
    if ((state.step !== 'phase1' && state.step !== 'phase2') || currentPage.length === 0) return;
    setState((prev) => {
      const newShown = new Set(prev.shownStatements);
      let changed = false;
      currentPage.forEach((id) => {
        if (!newShown.has(id)) {
          newShown.add(id);
          changed = true;
        }
      });
      return changed ? { ...prev, shownStatements: Array.from(newShown) } : prev;
    });
  }, [currentPage, state.step, setState]);

  const toggleStatement = (id: string) => {
    setState((prev) => ({
      ...prev,
      selectedStatements: prev.selectedStatements.includes(id)
        ? prev.selectedStatements.filter((s) => s !== id)
        : [...prev.selectedStatements, id],
    }));
  };

  const nextPage = () => {
    let patch: Partial<SensoryState> | null = null;
    if (state.step === 'phase1') {
      patch = state.phase1Page < phase1Pages.length - 1 ? { phase1Page: state.phase1Page + 1 } : { step: 'midpoint' };
    } else if (state.step === 'phase2') {
      patch = state.phase2Page < phase2Pages.length - 1 ? { phase2Page: state.phase2Page + 1 } : { step: 'results' };
    }
    if (!patch) return;

    // Every few pages, gate the advance behind an interstitial ad instead of applying it immediately.
    if (adsEnabledFor('sensory') && currentPageNumber % INTERSTITIAL_EVERY_N_PAGES === 0) {
      setState((prev) => ({ ...prev, interstitialPending: patch }));
    } else {
      setState((prev) => ({ ...prev, ...patch }));
    }
  };

  const prevPage = () => {
    if (state.step === 'phase1') {
      if (state.phase1Page > 0) {
        setState((prev) => ({ ...prev, phase1Page: prev.phase1Page - 1 }));
      } else {
        setState((prev) => ({ ...prev, step: 'intro' }));
      }
    } else if (state.step === 'phase2') {
      if (state.phase2Page > 0) {
        setState((prev) => ({ ...prev, phase2Page: prev.phase2Page - 1 }));
      } else {
        setState((prev) => ({ ...prev, step: 'midpoint' }));
      }
    }
  };

  const startPhase2 = () => {
    setState((prev) => ({ ...prev, step: 'phase2', phase2Page: 0 }));
  };

  const results: AreaResult[] = useMemo(() => {
    return sensoryAreas
      .map((area) => {
        const areaStatements = getStatementsForArea(area.id);
        const shownForArea = areaStatements.filter((s) => shown.has(s.id));
        const matched = shownForArea.filter((s) => selected.has(s.id));
        const percentage =
          shownForArea.length === 0 ? 0 : Math.round((matched.length / shownForArea.length) * 100);
        return { area, areaStatements, matched, percentage, shown: shownForArea };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [selected, shown]);

  // Group the 22 areas back into their 8 senses for the compact results
  // table: one row per sense, one column per response type.
  const senseRows = useMemo(() => {
    const bySense = new Map<string, { name: string; label: string; cells: Partial<Record<ResponseType, AreaResult>>; maxPct: number }>();
    results.forEach((r) => {
      const key = r.area.name;
      if (!bySense.has(key)) {
        bySense.set(key, { name: key, label: senseLabel(r.area), cells: {}, maxPct: 0 });
      }
      const entry = bySense.get(key)!;
      entry.cells[r.area.responseType] = r;
      entry.maxPct = Math.max(entry.maxPct, r.percentage);
    });
    return Array.from(bySense.values()).sort((a, b) => b.maxPct - a.maxPct);
  }, [results]);

  // Opens (or re-enters) the Sensory Circuit builder. Only generates a fresh
  // draft the first time — revisiting after edits keeps whatever the user
  // changed rather than clobbering it.
  const openCircuit = () => {
    setState((prev) => {
      if (prev.circuit) return { ...prev, step: 'circuit' };
      const highlightedIds = results.filter((r) => r.percentage >= HIGHLIGHT_THRESHOLD).map((r) => r.area.id);
      return {
        ...prev,
        step: 'circuit',
        circuit: { title: defaultCircuitTitle(childId), days: generateDraftDays(highlightedIds) },
      };
    });
  };

  const toggleAreaSelection = (areaId: string) => {
    setState((prev) => {
      const newSelected = prev.selectedAreas.includes(areaId)
        ? prev.selectedAreas.filter((a) => a !== areaId)
        : prev.selectedAreas.length < MAX_SELECTED_AREAS
          ? [...prev.selectedAreas, areaId]
          : prev.selectedAreas;
      return { ...prev, selectedAreas: newSelected };
    });
  };

  const pickStrategies = (areaId: string) => {
    const allStrategies = getStrategiesForArea(areaId);
    const picked = shuffle(allStrategies).slice(0, STRATEGIES_PER_AREA);
    setState((prev) => ({
      ...prev,
      selectedStrategies: { ...prev.selectedStrategies, [areaId]: picked.map((s) => s.id) },
    }));
  };

  // Auto-pick strategies for any newly-selected area that doesn't have any yet.
  useEffect(() => {
    if (state.step !== 'results') return;
    state.selectedAreas.forEach((areaId) => {
      if (!state.selectedStrategies[areaId]) {
        pickStrategies(areaId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.selectedAreas]);

  const rerollStrategy = (areaId: string, strategyIndex: number) => {
    const existing = state.selectedStrategies[areaId] || [];
    const allStrategies = getStrategiesForArea(areaId);
    const available = allStrategies.filter((s) => !existing.includes(s.id));
    if (available.length > 0) {
      const replacement = available[Math.floor(Math.random() * available.length)];
      const newStrategies = [...existing];
      newStrategies[strategyIndex] = replacement.id;
      setState((prev) => ({
        ...prev,
        selectedStrategies: { ...prev.selectedStrategies, [areaId]: newStrategies },
      }));
    }
  };

  const handleDownloadCSV = () => {
    const summaryRows: Row[] = results.map((r) => [
      r.area.label,
      r.matched.length,
      r.shown.length,
      `${r.percentage}%`,
      r.percentage >= HIGHLIGHT_THRESHOLD ? 'Highlighted' : '',
      isLowSampleHighPct(r.percentage, r.matched.length) ? 'Low sample caution' : '',
    ]);

    const detailRows: Row[] = state.shownStatements.map((id) => {
      const stmt = statements.find((s) => s.id === id);
      const area = sensoryAreas.find((a) => a.id === stmt?.areaId);
      return [area?.label ?? 'Unknown', stmt?.text ?? '', selected.has(id) ? 'Yes' : 'No'];
    });

    const strategyRows: Row[] = state.selectedAreas.flatMap((areaId) => {
      const area = sensoryAreas.find((a) => a.id === areaId);
      const strategyIds = state.selectedStrategies[areaId] || [];
      return strategyIds.map((id) => {
        const strategy = getStrategiesForArea(areaId).find((s) => s.id === id);
        return [area?.label ?? areaId, strategy?.text ?? ''];
      });
    });

    const confirmationRows: Row[] = [
      ['Disclaimer Agreed', state.disclaimerAgreed ? 'Yes' : 'No'],
      ['Permission Confirmed', state.permissionConfirmed ? 'Yes' : 'No'],
    ];

    const csv = buildToolCsv({
      toolName: 'Sensory Suggester',
      childId,
      summaryHeader: [],
      summaryRows: [],
      detailHeader: [],
      detailRows: [],
      extraBlocks: [
        { title: 'CONFIRMATIONS', header: ['Item', 'Status'], rows: confirmationRows },
        {
          title: 'PROFILE',
          header: ['Sensory Area', 'Matched', 'Shown', 'Percentage', 'Status', 'Caution'],
          rows: summaryRows,
        },
        { title: 'ALL RESPONSES', header: ['Sensory Area', 'Statement', 'Selected'], rows: detailRows },
        { title: 'CHOSEN STRATEGIES', header: ['Sensory Area', 'Strategy'], rows: strategyRows },
      ],
    });
    downloadToolCsv('sensory-suggester', childId, csv);
    setCompleted(true);
  };

  // Intro step with disclaimer
  if (state.step === 'intro') {
    const canProceed = state.disclaimerAgreed && state.permissionConfirmed;

    return (
      <ToolShell title="Sensory Suggester" childId={childId} onRestart={restart}>
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="bg-card">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Sensory Suggester</h2>
                <p className="text-muted-foreground mt-1">
                  Identify sensory processing patterns and get tailored strategies for young people.
                </p>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg space-y-3 text-sm">
                <p className="font-semibold text-foreground">Disclaimer</p>
                <p className="text-foreground leading-relaxed">
                  The selected strategies and guidance provided by this tool should not be considered professional or
                  medical advice. The owners and creators of this website accept no liability for any losses or damages
                  arising from the use of this tool. This tool has been created using publicly available resources to
                  simplify the process of identifying sensory trends and to provide strategies sourced from publicly
                  available documents. By proceeding, you agree to these terms.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.disclaimerAgreed}
                    onChange={(e) => setState((prev) => ({ ...prev, disclaimerAgreed: e.target.checked }))}
                    className="mt-1 w-5 h-5 rounded border-2 border-border accent-accent cursor-pointer"
                  />
                  <span className="text-sm text-foreground leading-relaxed">
                    I have read and agree to the disclaimer above.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.permissionConfirmed}
                    onChange={(e) => setState((prev) => ({ ...prev, permissionConfirmed: e.target.checked }))}
                    className="mt-1 w-5 h-5 rounded border-2 border-border accent-accent cursor-pointer"
                  />
                  <span className="text-sm text-foreground leading-relaxed">
                    I confirm I have the appropriate permission (from my setting and/or the young person's parent or
                    carer) to enter this information.
                  </span>
                </label>
              </div>

              <Button
                onClick={() => setState((prev) => ({ ...prev, step: 'phase1' }))}
                disabled={!canProceed}
                className="w-full"
              >
                Start Assessment
              </Button>
            </div>
          </Card>
        </div>
      </ToolShell>
    );
  }

  // Interstitial ad — blocks continuing until its countdown clears, then
  // applies whatever page advance was waiting behind it.
  if (state.interstitialPending) {
    return (
      <InterstitialGate
        toolId="sensory"
        onContinue={() =>
          setState((prev) => ({ ...prev, ...(prev.interstitialPending ?? {}), interstitialPending: null }))
        }
      />
    );
  }

  // Questionnaire phase (1 or 2) — deliberately lean chrome so a 3x3 page of
  // statements fits above the fold with no scrolling.
  if (state.step === 'phase1' || state.step === 'phase2') {
    const isLastPage =
      state.step === 'phase1' ? state.phase1Page === phase1Pages.length - 1 : state.phase2Page === phase2Pages.length - 1;

    return (
      <div className="mx-auto w-full max-w-5xl px-4 pb-6 pt-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            ← All tools
          </Link>
          <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            ID: {childId}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
        </div>

        <p className="mt-5 text-center text-base text-muted-foreground sm:text-lg">
          Select any statements that apply to the young person.
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <Button variant="outline" onClick={prevPage}>
            Back
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPageNumber} of {totalPages}
          </span>
          <Button onClick={nextPage}>{isLastPage ? 'Finish' : 'Continue'}</Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:auto-rows-fr sm:grid-cols-3">
          {currentPage.map((statementId) => {
            const stmt = statements.find((s) => s.id === statementId);
            if (!stmt) return null;
            return (
              <StatementCard
                key={statementId}
                statement={stmt}
                selected={selected.has(statementId)}
                onToggle={() => toggleStatement(statementId)}
              />
            );
          })}
        </div>

        <AdBanner toolId="sensory" slot={ADSENSE_SLOTS.inputBanner} className="mt-5" />
      </div>
    );
  }

  // Midpoint summary
  if (state.step === 'midpoint') {
    return (
      <ToolShell title="Sensory Suggester" childId={childId} onRestart={restart}>
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="bg-card">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Halfway Summary</h2>
              <p className="text-muted-foreground">You've completed the first half of the assessment.</p>

              <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-foreground">Current percentages:</p>
                <div className="space-y-2 text-sm">
                  {results.map((r) => (
                    <div key={r.area.id} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{r.area.label}</span>
                      <span className="font-semibold text-foreground">{r.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={startPhase2} className="flex-1">
                  Continue to Phase 2
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setState((prev) => ({ ...prev, step: 'results' }))}
                  className="flex-1"
                >
                  Skip to Results
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </ToolShell>
    );
  }

  // Results page
  if (state.step === 'results') {
    const selectedResults = results.filter((r) => state.selectedAreas.includes(r.area.id));
    const atCap = state.selectedAreas.length >= MAX_SELECTED_AREAS;

    return (
      <ToolShell title="Sensory Suggester" childId={childId} onRestart={restart}>
        <div className="max-w-4xl mx-auto space-y-6">
          <AffiliateDisclosureBanner toolId="sensory" />

          {/* Results table */}
          <Card className="bg-card">
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Results Overview</h2>
                <p className="text-sm text-muted-foreground">
                  Select up to {MAX_SELECTED_AREAS} areas to view strategies ({state.selectedAreas.length}/
                  {MAX_SELECTED_AREAS})
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-3 pr-2 font-medium">Sense</th>
                      {RESPONSE_TYPES.map((rt) => (
                        <th key={rt} className="pb-3 px-2 font-medium">
                          {RESPONSE_TYPE_LABEL[rt]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {senseRows.map((row) => (
                      <tr key={row.name} className="border-t border-border">
                        <td className="py-3 pr-2 align-middle font-medium text-foreground">{row.label}</td>
                        {RESPONSE_TYPES.map((rt) => {
                          const cell = row.cells[rt];
                          if (!cell) {
                            return (
                              <td key={rt} className="py-3 px-2 text-center text-muted-foreground">
                                —
                              </td>
                            );
                          }
                          const isSelected = state.selectedAreas.includes(cell.area.id);
                          const flagged = isLowSampleHighPct(cell.percentage, cell.matched.length);
                          return (
                            <td key={rt} className="py-3 px-2">
                              <button
                                type="button"
                                onClick={() => toggleAreaSelection(cell.area.id)}
                                disabled={!isSelected && atCap}
                                title={flagged ? 'Based on a small number of responses — treat with caution' : undefined}
                                className="flex w-full items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <span
                                  className={`h-4 w-4 flex-shrink-0 rounded-full border-2 transition-colors ${
                                    isSelected ? 'border-primary bg-primary' : 'border-primary/50 bg-transparent'
                                  }`}
                                />
                                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                  <span
                                    className={`block h-full rounded-full transition-all ${getProgressColor(cell.percentage)}`}
                                    style={{ width: `${cell.percentage}%` }}
                                  />
                                </span>
                                <span className="w-9 flex-shrink-0 text-right font-medium text-foreground">
                                  {cell.percentage}%
                                </span>
                                {flagged && <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-600" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                A caution icon means that score is based on only 1-2 selected statements — treat it as a lighter
                signal.
              </p>
            </div>
          </Card>

          {/* Strategy Cards */}
          {selectedResults.length > 0 && (
            <div className="space-y-4">
              {selectedResults.map((r) => {
                const strategyIds = state.selectedStrategies[r.area.id] || [];
                const strats = strategyIds.map((id) => getStrategiesForArea(r.area.id).find((s) => s.id === id));

                return (
                  <Card key={r.area.id} className="bg-card">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-foreground">{r.area.label}</h3>
                        <span className="text-sm font-semibold text-muted-foreground">{r.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getProgressColor(r.percentage)}`}
                          style={{ width: `${r.percentage}%` }}
                        />
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Strategy Ideas:</p>
                        {strats.map((strat, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-md">
                            <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
                              {idx + 1}.
                            </span>
                            <span className="text-sm text-foreground flex-1">{strat?.text}</span>
                            <button
                              onClick={() => rerollStrategy(r.area.id, idx)}
                              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                              title="Swap this strategy"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Matched Statements */}
                      {r.matched.length > 0 && (
                        <div className="mt-4 bg-muted/40 border border-border/60 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-semibold text-foreground">Matched Statements</p>
                          <div className="space-y-2">
                            {r.matched.map((stmt) => (
                              <div key={stmt.id} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-0.5 flex-shrink-0" />
                                <span className="text-foreground">{stmt.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <AreaProductGrid toolId="sensory" areaId={r.area.id} />
                    </div>
                  </Card>
                );
              })}

              <AdBanner toolId="sensory" slot={ADSENSE_SLOTS.resultsBanner} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownloadCSV} className="min-w-[160px] flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <Button variant="outline" onClick={openCircuit} className="min-w-[160px] flex-1">
              Build a Sensory Circuit
            </Button>
            <PremiumLockButton label="Download / save young person for future" className="min-w-[160px] flex-1" />
            <Button variant="outline" onClick={restart} className="min-w-[160px] flex-1">
              Start Over
            </Button>
          </div>

          <AdBanner toolId="sensory" slot={ADSENSE_SLOTS.resultsBanner} className="mt-2" />
        </div>
      </ToolShell>
    );
  }

  // Sensory Circuit builder
  if (state.step === 'circuit' && state.circuit) {
    const circuit = state.circuit;
    const highlightedAreas = results.filter((r) => r.percentage >= HIGHLIGHT_THRESHOLD);
    const allowedStrategies: Strategy[] = highlightedAreas.flatMap((r) => getStrategiesForArea(r.area.id));

    const updateCircuit = (updater: (c: CircuitState) => CircuitState) => {
      setState((prev) => (prev.circuit ? { ...prev, circuit: updater(prev.circuit) } : prev));
    };

    const regenerateDraft = () => {
      updateCircuit((c) => ({ ...c, days: generateDraftDays(highlightedAreas.map((r) => r.area.id)) }));
    };

    const setCircuitTitle = (title: string) => updateCircuit((c) => ({ ...c, title }));

    const addStation = (day: CircuitDay, strategy: Strategy) => {
      updateCircuit((c) => ({
        ...c,
        days: {
          ...c.days,
          [day]: [
            ...c.days[day],
            {
              id: `${strategy.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              areaId: strategy.areaId,
              strategyId: strategy.id,
              minutes: DEFAULT_STATION_MINUTES,
            },
          ],
        },
      }));
    };

    const removeStation = (day: CircuitDay, stationId: string) => {
      updateCircuit((c) => ({ ...c, days: { ...c.days, [day]: c.days[day].filter((s) => s.id !== stationId) } }));
    };

    const moveStation = (day: CircuitDay, index: number, direction: -1 | 1) => {
      updateCircuit((c) => {
        const list = [...c.days[day]];
        const target = index + direction;
        if (target < 0 || target >= list.length) return c;
        [list[index], list[target]] = [list[target], list[index]];
        return { ...c, days: { ...c.days, [day]: list } };
      });
    };

    const setStationMinutes = (day: CircuitDay, stationId: string, minutes: number) => {
      const clamped = Math.max(MIN_STATION_MINUTES, Math.min(MAX_STATION_MINUTES, Number.isFinite(minutes) ? minutes : MIN_STATION_MINUTES));
      updateCircuit((c) => ({
        ...c,
        days: { ...c.days, [day]: c.days[day].map((s) => (s.id === stationId ? { ...s, minutes: clamped } : s)) },
      }));
    };

    const handleDownloadCircuitCsv = () => {
      const planRows: Row[] = [];
      CIRCUIT_DAYS.forEach(({ key, label }) => {
        circuit.days[key].forEach((station, idx) => {
          const area = sensoryAreas.find((a) => a.id === station.areaId);
          const strategy = getStrategiesForArea(station.areaId).find((s) => s.id === station.strategyId);
          planRows.push([label, idx + 1, area?.label ?? station.areaId, strategy?.text ?? '', station.minutes]);
        });
      });
      const highlightRows: Row[] = highlightedAreas.map((r) => [r.area.label, `${r.percentage}%`]);

      const csv = buildToolCsv({
        toolName: 'Sensory Circuit',
        childId,
        summaryHeader: [],
        summaryRows: [],
        detailHeader: [],
        detailRows: [],
        extraBlocks: [
          { title: 'PLAN', header: ['Item', 'Value'], rows: [['Title', circuit.title]] },
          { title: 'HIGHLIGHTED AREAS', header: ['Sensory Area', 'Percentage'], rows: highlightRows },
          {
            title: 'CIRCUIT PLAN',
            header: ['Day', 'Station', 'Sensory Area', 'Strategy', 'Minutes'],
            rows: planRows,
          },
        ],
      });
      downloadToolCsv('sensory-circuit', childId, csv);
    };

    const activeStations = circuit.days[activeCircuitDay];
    const activeTotal = dayTotal(activeStations);
    const activeDayLabel = CIRCUIT_DAYS.find((d) => d.key === activeCircuitDay)?.label ?? '';

    return (
      <ToolShell title="Sensory Circuit" childId={childId} onRestart={restart}>
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => setState((prev) => ({ ...prev, step: 'results' }))}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Back to results
          </button>

          <Card className="bg-card">
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground" htmlFor="circuit-title">
                  Plan title
                </label>
                <input
                  id="circuit-title"
                  type="text"
                  value={circuit.title}
                  onChange={(e) => setCircuitTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-lg font-bold text-foreground"
                />
              </div>

              <div className="bg-muted/40 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-foreground">Highlighted areas (≥{HIGHLIGHT_THRESHOLD}%)</p>
                {highlightedAreas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sensory area scored {HIGHLIGHT_THRESHOLD}% or higher, so there's nothing evidence-linked to
                    build a circuit from yet — try selecting different statements or revisiting the assessment.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {highlightedAreas.map((r) => (
                      <Badge key={r.area.id}>
                        {r.area.label} · {r.percentage}%
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={regenerateDraft} disabled={allowedStrategies.length === 0}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate draft
                </Button>
                <Button variant="outline" onClick={handleDownloadCircuitCsv}>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </div>
          </Card>

          {allowedStrategies.length > 0 && (
            <Card className="bg-card">
              <div className="p-6 space-y-4">
                <div role="tablist" aria-label="Day of the week" className="grid grid-cols-5 gap-2">
                  {CIRCUIT_DAYS.map((d) => {
                    const total = dayTotal(circuit.days[d.key]);
                    const inRange = isDayInRange(total);
                    const isActive = activeCircuitDay === d.key;
                    return (
                      <button
                        key={d.key}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveCircuitDay(d.key)}
                        className={`flex flex-col items-center rounded-xl border-2 px-2 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                          isActive
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                        }`}
                      >
                        {d.label}
                        <Badge tone={inRange ? 'secondary' : 'destructive'}>{total}m</Badge>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {activeDayLabel} total: {activeTotal} min
                  </p>
                  {!isDayInRange(activeTotal) && (
                    <span className="text-xs font-medium text-destructive">
                      Aim for {TARGET_MIN_MINUTES}–{TARGET_MAX_MINUTES} min
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {activeStations.length === 0 && (
                    <p className="text-sm text-muted-foreground">No stations yet for this day — add one below.</p>
                  )}
                  {activeStations.map((station, idx) => {
                    const area = sensoryAreas.find((a) => a.id === station.areaId);
                    const strategy = getStrategiesForArea(station.areaId).find((s) => s.id === station.strategyId);
                    return (
                      <div
                        key={station.id}
                        className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
                      >
                        <div className="flex-1 space-y-1.5">
                          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {area?.label ?? station.areaId}
                          </span>
                          <p className="text-sm text-foreground">{strategy?.text}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1">
                          <input
                            type="number"
                            min={MIN_STATION_MINUTES}
                            max={MAX_STATION_MINUTES}
                            value={station.minutes}
                            onChange={(e) =>
                              setStationMinutes(activeCircuitDay, station.id, parseInt(e.target.value, 10))
                            }
                            className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground"
                            aria-label={`Minutes for station ${idx + 1}`}
                          />
                          <button
                            onClick={() => moveStation(activeCircuitDay, idx, -1)}
                            disabled={idx === 0}
                            aria-label="Move station up"
                            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveStation(activeCircuitDay, idx, 1)}
                            disabled={idx === activeStations.length - 1}
                            aria-label="Move station down"
                            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeStation(activeCircuitDay, station.id)}
                            aria-label="Remove station"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="add-station">
                    Add station
                  </label>
                  <select
                    id="add-station"
                    value=""
                    onChange={(e) => {
                      const strategy = allowedStrategies.find((s) => s.id === e.target.value);
                      if (strategy) addStation(activeCircuitDay, strategy);
                      e.target.value = '';
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="" disabled>
                      Choose a strategy to add…
                    </option>
                    {allowedStrategies.map((s) => {
                      const area = sensoryAreas.find((a) => a.id === s.areaId);
                      return (
                        <option key={s.id} value={s.id}>
                          {area?.label ?? s.areaId}: {s.text}
                        </option>
                      );
                    })}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Only strategies from highlighted areas are listed.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <AdBanner toolId="sensory" slot={ADSENSE_SLOTS.resultsBanner} />
        </div>
      </ToolShell>
    );
  }

  return null;
}
