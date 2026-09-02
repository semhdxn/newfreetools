import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, PartyPopper, ChevronLeft, ChevronRight, Check, Sparkles,
  ThumbsUp, AlertTriangle, Download, RotateCcw, CheckCircle2,
} from 'lucide-react';
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Progress,
} from '@/components/ui';
import { Footer } from '@/components/Footer';
import { PremiumLockButton } from '@/components/PremiumLockButton';
import { useToolSession } from '@/lib/useToolSession';
import { rowsToCsv, downloadCsv, todayStamp, type Row as CsvRow } from '@/lib/exportCsv';
import {
  studentVoiceCategories,
  studentVoiceStatements,
  studentVoiceEnvironmentItems,
  studentVoiceResponseItems,
  FREQUENCY_OPTIONS,
  NOTABLE_THRESHOLD,
  calculateScores,
  notableByCategory,
  lookupEnvironmentText,
  lookupResponseText,
  type StudentVoiceResponseMap,
  type StudentVoiceStatement,
  type StudentVoiceCategory,
} from '@/data/studentVoiceData';
import { FLOORPLAN_LAYOUTS, buildRecorded, aggregateStats } from '@/data/floorplanLayouts';
import { FloorplanPicker } from '@/components/FloorplanPicker';
import { FloorplanReview } from '@/components/FloorplanReview';
import type { FloorplanSelections } from '@/types/floorplan';
import { JourneyMap } from '@/components/studentVoice/JourneyMap';
import { SortDeck, type SortBucket } from '@/components/studentVoice/SortDeck';
import { SchoolDayWalk } from '@/components/studentVoice/SchoolDayWalk';
import { SchoolDaySummary } from '@/components/studentVoice/SchoolDaySummary';
import { emptySchoolDayFeelings, SCHOOL_DAY_STAGES, SCHOOL_DAY_FEELINGS, type SchoolDayFeelingsMap } from '@/data/schoolDayStages';
import { BrainBreak, pickBrainBreakGameSet, type BrainBreakGame } from '@/components/studentVoice/BrainBreak';

/* -------------------------------------------------------------------------- */
/*  Flow / state shape                                                         */
/* -------------------------------------------------------------------------- */

type Stage =
  | 'details'
  | 'childPrivacy'
  | 'partPicker'
  | 'questions'
  | 'brainBreakA'
  | 'part1Results'
  | 'pickerIntro'
  | 'environment'
  | 'brainBreakB'
  | 'response'
  | 'brainBreakC'
  | 'schoolDay'
  | 'brainBreakD'
  | 'part2Results'
  | 'floorplanIntroSafe'
  | 'floorplanSafe'
  | 'floorplanIntroTricky'
  | 'floorplanTricky'
  | 'part3Results';

/** Stages that sit outside any one part's flow — no progress strip, no leave guard. */
const NON_FLOW_STAGES = new Set<Stage>([
  'details', 'childPrivacy', 'partPicker', 'part1Results', 'part2Results', 'part3Results',
]);

interface PartCompleted {
  part1: boolean;
  part2: boolean;
  part3: boolean;
}

interface PupilVoiceState {
  stage: Stage;
  /** Which of the 3 parts the pupil is currently working through, if any. */
  activePart: 1 | 2 | 3 | null;
  responses: StudentVoiceResponseMap;
  index: number;
  envSort: Record<string, SortBucket>;
  respSort: Record<string, SortBucket>;
  floorplanSafe: FloorplanSelections;
  floorplanTricky: FloorplanSelections;
  schoolDayFeelings: SchoolDayFeelingsMap;
  planIndex: number;
  agreedToDisclaimer: boolean;
  permissionConfirmed: boolean;
  brainBreaksEnabled: boolean;
  brainBreakSeed: number;
  partCompleted: PartCompleted;
  part1CompletedOn: string | null;
  part2CompletedOn: string | null;
  part3CompletedOn: string | null;
}

const bucketIds = (state: Record<string, SortBucket>, b: SortBucket): string[] =>
  Object.entries(state).filter(([, v]) => v === b).map(([id]) => id);

/** Each part has its own short flow — the progress strip only ever shows the
 *  part currently being worked on, never a combined 3-part journey, since
 *  starting one part clears the others (see startPart below). */
const PART_FLOW_STEPS: Record<1 | 2 | 3, { key: Stage; label: string }[]> = {
  1: [
    { key: 'questions', label: 'Questions' },
  ],
  2: [
    { key: 'pickerIntro', label: 'What helps' },
    { key: 'environment', label: 'School helps' },
    { key: 'response', label: 'Adults help' },
    { key: 'schoolDay', label: 'My day' },
  ],
  3: [
    { key: 'floorplanIntroSafe', label: 'Classrooms' },
    { key: 'floorplanSafe', label: 'Good seats' },
    { key: 'floorplanIntroTricky', label: 'Tricky seats' },
    { key: 'floorplanTricky', label: 'Tricky seats' },
  ],
};
const PART_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Part 1 of 3 — How you feel',
  2: 'Part 2 of 3 — What helps',
  3: 'Part 3 of 3 — Your classrooms',
};
const PART_TITLES: Record<1 | 2 | 3, string> = {
  1: 'Part 1 — How you feel',
  2: 'Part 2 — What helps',
  3: 'Part 3 — Your classrooms',
};
const PART_BLURBS: Record<1 | 2 | 3, string> = {
  1: '35 short statements about school. Most pupils take about 5–10 minutes.',
  2: "Sort the things — and the ways adults respond — that help, then watch your school day go by.",
  3: 'Pick good seats and tricky seats across six different classroom layouts.',
};
const BRAIN_BREAK_AFTER: Partial<Record<Stage, Stage>> = {
  brainBreakA: 'part1Results',
  brainBreakB: 'response',
  brainBreakC: 'schoolDay',
  brainBreakD: 'part2Results',
};

const DISCLAIMER_TEXT =
  "The responses gathered and any summaries produced by this tool should not be considered professional, specialist or medical advice. The owners and creators of this website accept no liability for any losses or damages arising from the use of this tool. This tool gives a young person space to share their voice; results should be interpreted alongside other information you hold about them. Everything entered is stored only in this browser, on this device — nothing is uploaded or sent to us. By proceeding, you agree to these terms.";

function initialState(): PupilVoiceState {
  return {
    stage: 'details',
    activePart: null,
    responses: {},
    index: 0,
    envSort: {},
    respSort: {},
    floorplanSafe: {},
    floorplanTricky: {},
    schoolDayFeelings: emptySchoolDayFeelings(),
    planIndex: 0,
    agreedToDisclaimer: false,
    permissionConfirmed: false,
    brainBreaksEnabled: true,
    brainBreakSeed: Math.floor(Math.random() * 1_000_000),
    partCompleted: { part1: false, part2: false, part3: false },
    part1CompletedOn: null,
    part2CompletedOn: null,
    part3CompletedOn: null,
  };
}

/** Every statement, grouped by the composite score it feeds. Computed once
 *  from the fixed statement bank — used so the results screen can show
 *  exactly which statements a given percentage is built from (see task on
 *  clarifying the summary percentages). */
const STATEMENTS_BY_COMPOSITE: Record<keyof ReturnType<typeof calculateScores>, StudentVoiceStatement[]> = (() => {
  const byCategory: Record<StudentVoiceCategory, StudentVoiceStatement[]> = {
    attention: [], control: [], sensory: [], escape: [],
  };
  const emotional: StudentVoiceStatement[] = [];
  const selfEsteem: StudentVoiceStatement[] = [];
  for (const s of studentVoiceStatements) {
    byCategory[s.category].push(s);
    if (s.type === 'emotional-wellbeing') emotional.push(s);
    if (s.type === 'self-esteem') selfEsteem.push(s);
  }
  return {
    attention: byCategory.attention,
    control: byCategory.control,
    sensory: byCategory.sensory,
    escape: byCategory.escape,
    emotional,
    selfEsteem,
  };
})();

const COMPOSITES: { key: keyof ReturnType<typeof calculateScores>; label: string }[] = [
  { key: 'attention', label: 'Attention' },
  { key: 'control', label: 'Control' },
  { key: 'sensory', label: 'Sensory' },
  { key: 'escape', label: 'Escape' },
  { key: 'emotional', label: 'Emotional Wellbeing' },
  { key: 'selfEsteem', label: 'Self Esteem' },
];

const freqLabel = (v: number | undefined) => (v === undefined ? '—' : FREQUENCY_OPTIONS.find((o) => o.value === v)?.label ?? '—');

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

/** Every stage this version of the tool knows how to render. A session
 *  saved by an older version of this tool (e.g. the previous single-flow
 *  design, with stages like "part1Done"/"handBack"/"results") can have a
 *  `stage` value that no longer exists — without this guard that falls
 *  through every check below to a blank screen. Treat anything unrecognised
 *  as "go to the part picker", which is always a safe, valid place to land. */
const VALID_STAGES = new Set<string>([
  'details', 'childPrivacy', 'partPicker', 'questions', 'brainBreakA', 'part1Results',
  'pickerIntro', 'environment', 'brainBreakB', 'response', 'brainBreakC', 'schoolDay', 'brainBreakD', 'part2Results',
  'floorplanIntroSafe', 'floorplanSafe', 'floorplanIntroTricky', 'floorplanTricky', 'part3Results',
]);

export default function StudentVoiceTool() {
  const { state, childId, setState, setCompleted, restart } = useToolSession<PupilVoiceState>(
    'student-voice',
    initialState(),
  );
  const stage: Stage = VALID_STAGES.has(state.stage) ? state.stage : 'partPicker';

  const setStage = (next: Stage) => setState((prev) => ({ ...prev, stage: next }));

  const brainBreakAssignment = useMemo(
    () => pickBrainBreakGameSet(state.brainBreakSeed, 4),
    [state.brainBreakSeed],
  );

  const total = studentVoiceStatements.length;
  const current = studentVoiceStatements[state.index];
  const [transitioning, setTransitioning] = useState(false);

  // Scroll to top on every stage/question change.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [stage, state.index]);

  // "Welcome back" pill — shown once when the tool loads with progress
  // already in place (i.e. a returning session), dismissible.
  const [showWelcomeBack, setShowWelcomeBack] = useState(() => !NON_FLOW_STAGES.has(state.stage));

  // Once every part has been completed, mark the whole tool session
  // "completed" (drives the tool-card status on the Home page).
  useEffect(() => {
    if (state.partCompleted.part1 && state.partCompleted.part2 && state.partCompleted.part3) {
      setCompleted(true);
    }
  }, [state.partCompleted.part1, state.partCompleted.part2, state.partCompleted.part3, setCompleted]);

  /* ---------- results data (computed unconditionally so both the picker's
   *  per-part CSV buttons and each part's results screen can use them) ---------- */
  const scores = useMemo(() => calculateScores(state.responses), [state.responses]);
  const notable = useMemo(() => notableByCategory(state.responses), [state.responses]);
  const envLoves = bucketIds(state.envSort, 'loves');
  const envNotForMe = bucketIds(state.envSort, 'not_for_me');
  const envHelps = bucketIds(state.envSort, 'helps');
  const respLoves = bucketIds(state.respSort, 'loves');
  const respNotForMe = bucketIds(state.respSort, 'not_for_me');
  const respHelps = bucketIds(state.respSort, 'helps');
  const safeRecorded = useMemo(() => buildRecorded(FLOORPLAN_LAYOUTS, state.floorplanSafe), [state.floorplanSafe]);
  const trickyRecorded = useMemo(() => buildRecorded(FLOORPLAN_LAYOUTS, state.floorplanTricky), [state.floorplanTricky]);
  const safeStats = useMemo(() => aggregateStats(safeRecorded), [safeRecorded]);
  const trickyStats = useMemo(() => aggregateStats(trickyRecorded), [trickyRecorded]);

  /* ---------- per-part CSV exports ---------- */
  const exportPart1Csv = () => {
    const rows: CsvRow[] = [];
    rows.push(['Child ID (locally generated pseudonym)', childId]);
    rows.push(['Part', '1 of 3 — How you feel']);
    rows.push(['Completed on', state.part1CompletedOn ?? todayStamp()]);
    rows.push(['Generated', new Date().toLocaleString('en-GB')]);
    rows.push([]);
    rows.push(['Composite', 'Score %']);
    COMPOSITES.forEach((c) => rows.push([c.label, scores[c.key] ?? 0]));
    rows.push([]);
    rows.push(['Statements marked Often or Very Often']);
    rows.push(['Statement', 'Category', 'Frequency']);
    studentVoiceStatements
      .filter((st) => (state.responses[st.id] ?? 0) >= NOTABLE_THRESHOLD)
      .forEach((st) => rows.push([st.text, st.category, freqLabel(state.responses[st.id])]));
    downloadCsv(`pupil-voice-part1-${childId}-${todayStamp()}.csv`, rowsToCsv(rows));
  };

  const exportPart2Csv = () => {
    const rows: CsvRow[] = [];
    rows.push(['Child ID (locally generated pseudonym)', childId]);
    rows.push(['Part', '2 of 3 — What helps']);
    rows.push(['Completed on', state.part2CompletedOn ?? todayStamp()]);
    rows.push(['Generated', new Date().toLocaleString('en-GB')]);
    const writeBucket = (title: string, label: string, ids: string[], lookup: (id: string) => string) => {
      if (ids.length === 0) return;
      rows.push([]);
      rows.push([`${title} — ${label}`]);
      ids.forEach((id) => rows.push([lookup(id)]));
    };
    writeBucket('Things in school', 'Really helps', envLoves, lookupEnvironmentText);
    writeBucket('Things in school', 'Helps', envHelps, lookupEnvironmentText);
    writeBucket('Things in school', 'Not for me', envNotForMe, lookupEnvironmentText);
    writeBucket('Things adults can do', 'Really helps', respLoves, lookupResponseText);
    writeBucket('Things adults can do', 'Helps', respHelps, lookupResponseText);
    writeBucket('Things adults can do', 'Not for me', respNotForMe, lookupResponseText);
    rows.push([]);
    rows.push(['My school day — feelings per stage']);
    rows.push(['Stage', ...SCHOOL_DAY_FEELINGS.map((f) => f.label), 'Total']);
    SCHOOL_DAY_STAGES.forEach((stg) => {
      const arr = state.schoolDayFeelings[stg.id] ?? [];
      const counts = SCHOOL_DAY_FEELINGS.map((f) => arr.filter((x) => x === f.id).length);
      rows.push([stg.label, ...counts, arr.length]);
    });
    downloadCsv(`pupil-voice-part2-${childId}-${todayStamp()}.csv`, rowsToCsv(rows));
  };

  const exportPart3Csv = () => {
    const rows: CsvRow[] = [];
    rows.push(['Child ID (locally generated pseudonym)', childId]);
    rows.push(['Part', '3 of 3 — Your classrooms']);
    rows.push(['Completed on', state.part3CompletedOn ?? todayStamp()]);
    rows.push(['Generated', new Date().toLocaleString('en-GB')]);
    rows.push([]);
    rows.push(['Classroom floorplan']);
    rows.push(['Layout', 'Good seats', 'Tricky seats']);
    FLOORPLAN_LAYOUTS.forEach((layout, idx) => {
      const safeIds = state.floorplanSafe[idx] ?? [];
      const trickyIds = state.floorplanTricky[idx] ?? [];
      if (safeIds.length === 0 && trickyIds.length === 0) return;
      rows.push([`${idx + 1}. ${layout.name}`, safeIds.join('; '), trickyIds.join('; ')]);
    });
    downloadCsv(`pupil-voice-part3-${childId}-${todayStamp()}.csv`, rowsToCsv(rows));
  };

  const exportPartCsv = (part: 1 | 2 | 3) => {
    if (part === 1) exportPart1Csv();
    else if (part === 2) exportPart2Csv();
    else exportPart3Csv();
  };

  /* ---------- overall progress (used by the fixed JourneyMap strip) ---------- */
  const flowSteps = state.activePart ? PART_FLOW_STEPS[state.activePart] : [];
  const effectiveStageForProgress = BRAIN_BREAK_AFTER[stage] ?? stage;
  const flowStepIdx = flowSteps.findIndex((s) => s.key === effectiveStageForProgress);
  const flowTotal = flowSteps.length;
  const overallProgress = useMemo(() => {
    if (stage === 'part1Results' || stage === 'part2Results' || stage === 'part3Results') return 100;
    if (flowStepIdx < 0 || flowTotal === 0) return 0;
    let inner = 0;
    if (stage === 'questions' && total > 0) inner = state.index / total;
    else if ((stage === 'floorplanSafe' || stage === 'floorplanTricky') && FLOORPLAN_LAYOUTS.length > 0) {
      inner = state.planIndex / FLOORPLAN_LAYOUTS.length;
    }
    return Math.max(0, Math.min(100, Math.round(((flowStepIdx + inner) / flowTotal) * 100)));
  }, [stage, flowStepIdx, flowTotal, state.index, total, state.planIndex]);

  const journeyCurrentLabel = useMemo(() => {
    if (stage === 'questions') return `Question ${Math.min(state.index + 1, total)} of ${total}`;
    if (stage === 'floorplanSafe') return `Good seats — classroom ${state.planIndex + 1} of ${FLOORPLAN_LAYOUTS.length}`;
    if (stage === 'floorplanTricky') return `Tricky seats — classroom ${state.planIndex + 1} of ${FLOORPLAN_LAYOUTS.length}`;
    const step = flowSteps[flowStepIdx];
    return step ? step.label : undefined;
  }, [stage, state.index, total, state.planIndex, flowStepIdx, flowSteps]);

  const showFlowProgress = !NON_FLOW_STAGES.has(stage);
  const currentPart = state.activePart;

  /* ---------- leave guard ---------- */
  // Answers autosave on every change, so leaving never loses data — this is
  // reassurance for a pupil mid-flow, not a data-loss wall.
  const guardActive = !NON_FLOW_STAGES.has(stage);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  useEffect(() => {
    if (!guardActive) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [guardActive]);

  /* ---------- header + fixed journey strip (measured so content can clear it) ---------- */
  const headerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [topPad, setTopPad] = useState(120);
  useEffect(() => {
    const measure = () => {
      const h = (headerRef.current?.offsetHeight ?? 0) + (showFlowProgress ? (stripRef.current?.offsetHeight ?? 0) : 0);
      setTopPad(h + 16);
    };
    measure();
    window.addEventListener('resize', measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) {
      if (headerRef.current) ro.observe(headerRef.current);
      if (stripRef.current) ro.observe(stripRef.current);
    }
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [showFlowProgress, stage]);

  const header = (
    <div ref={headerRef} className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            if (guardActive) {
              e.preventDefault();
              setShowLeaveDialog(true);
            }
          }}
        >
          <img src="/logo-icon.png" alt="" className="h-6 w-6 object-contain" />
          <span>← All tools</span>
        </Link>
        <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">ID: {childId}</span>
      </div>
    </div>
  );

  const journeyStrip = showFlowProgress ? (
    <div
      ref={stripRef}
      style={{ top: headerRef.current?.offsetHeight ?? 40 }}
      className="fixed inset-x-0 z-30 border-b border-border bg-background/90 backdrop-blur"
    >
      <div className="mx-auto max-w-2xl space-y-1 px-3 py-1 sm:px-4">
        {currentPart && (
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary sm:text-xs">
            {PART_LABELS[currentPart]}
          </p>
        )}
        <JourneyMap steps={flowSteps} currentIdx={flowStepIdx} progress={overallProgress} currentLabel={journeyCurrentLabel} />
        {showWelcomeBack && (
          <div role="status" className="flex items-center justify-between gap-2 rounded-md bg-primary/10 px-3 py-1.5">
            <p className="text-sm font-medium text-foreground">
              Welcome back — {journeyCurrentLabel ? journeyCurrentLabel.toLowerCase() : 'carry on where you left off'}.
            </p>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-sm" onClick={() => setShowWelcomeBack(false)}>
              OK
            </Button>
          </div>
        )}
      </div>
    </div>
  ) : null;

  const leaveDialog = showLeaveDialog ? (
    <div role="dialog" aria-modal="true" aria-label="Leaving so soon?" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-sm text-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-7 w-7 text-amber-600" aria-hidden />
        </div>
        <h3 className="font-display text-xl font-bold">Leaving so soon?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You're partway through. Don't worry — your answers are saved in this browser, so you can come back and finish any time.
        </p>
        <div className="mt-4 space-y-2">
          <Button className="w-full" onClick={() => setShowLeaveDialog(false)}>
            Keep going
          </Button>
          <Link to="/" className="block">
            <Button variant="outline" className="w-full">
              Leave — my answers are saved
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  ) : null;

  const topBars = (
    <>
      {header}
      {journeyStrip}
      {leaveDialog}
    </>
  );

  /* ---------- flow actions ---------- */
  const select = (val: number) => {
    if (!current || transitioning) return;
    setTransitioning(true);
    setState((prev) => ({ ...prev, responses: { ...prev.responses, [current.id]: val } }));
    window.setTimeout(() => {
      setState((prev) => {
        const nextIndex = prev.index + 1;
        if (nextIndex >= total) {
          return {
            ...prev,
            stage: prev.brainBreaksEnabled ? 'brainBreakA' : 'part1Results',
            partCompleted: { ...prev.partCompleted, part1: true },
            part1CompletedOn: new Date().toISOString().substring(0, 10),
          };
        }
        return { ...prev, index: nextIndex };
      });
      setTransitioning(false);
    }, 280);
  };

  const skip = () => {
    if (!current || transitioning) return;
    setTransitioning(true);
    setState((prev) => ({
      ...prev,
      responses: prev.responses[current.id] === undefined ? { ...prev.responses, [current.id]: 3 } : prev.responses,
    }));
    window.setTimeout(() => {
      setState((prev) => {
        const nextIndex = prev.index + 1;
        if (nextIndex >= total) {
          return {
            ...prev,
            stage: prev.brainBreaksEnabled ? 'brainBreakA' : 'part1Results',
            partCompleted: { ...prev.partCompleted, part1: true },
            part1CompletedOn: new Date().toISOString().substring(0, 10),
          };
        }
        return { ...prev, index: nextIndex };
      });
      setTransitioning(false);
    }, 280);
  };

  const goBack = () => {
    if (state.index === 0) return;
    setState((prev) => ({ ...prev, index: prev.index - 1 }));
  };

  const togglePlanSeat = (
    bucketKey: 'floorplanSafe' | 'floorplanTricky',
    classroomIdx: number,
    seatId: string,
  ) => {
    setState((prev) => {
      const bucket = prev[bucketKey];
      const current = new Set(bucket[classroomIdx] ?? []);
      if (current.has(seatId)) current.delete(seatId);
      else current.add(seatId);
      return { ...prev, [bucketKey]: { ...bucket, [classroomIdx]: Array.from(current) } };
    });
  };

  /** Enter a part from the picker. Starting any part clears the *other* two
   *  parts' saved data — this is deliberate: the three parts are separately
   *  completable sections, each with its own CSV, and this avoids a later
   *  export ever mixing in stale data from a different sitting (or a
   *  different child on a shared device). Pass forceReset to also wipe the
   *  part being entered, for a genuine "do it again" rather than a resume. */
  const startPart = (part: 1 | 2 | 3, forceReset = false) => {
    setState((prev) => {
      const next: PupilVoiceState = { ...prev, activePart: part };
      if (part !== 1 || forceReset) {
        next.responses = {};
        next.index = 0;
        next.partCompleted = { ...next.partCompleted, part1: false };
        next.part1CompletedOn = null;
      }
      if (part !== 2 || forceReset) {
        next.envSort = {};
        next.respSort = {};
        next.schoolDayFeelings = emptySchoolDayFeelings();
        next.partCompleted = { ...next.partCompleted, part2: false };
        next.part2CompletedOn = null;
      }
      if (part !== 3 || forceReset) {
        next.floorplanSafe = {};
        next.floorplanTricky = {};
        next.planIndex = 0;
        next.partCompleted = { ...next.partCompleted, part3: false };
        next.part3CompletedOn = null;
      }
      next.stage = part === 1 ? 'questions' : part === 2 ? 'pickerIntro' : 'floorplanIntroSafe';
      return next;
    });
  };

  /* ============================================================ */
  /*  DETAILS — adult-facing setup + disclaimer                    */
  /* ============================================================ */
  if (stage === 'details') {
    const canProceed = state.agreedToDisclaimer && state.permissionConfirmed;
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pt-14 sm:p-4 sm:pt-16">
        {header}
        <div className="w-full max-w-lg space-y-4">
          <Card className="shadow-glow" style={{ padding: 0 }}>
            <CardHeader>
              <CardTitle>Pupil Voice — get started</CardTitle>
              <CardDescription>
                A child-led activity, split into three short parts the young person can do one at a time. Once they hand
                the device back after a part, you'll see a summary for that part and can download it as a CSV.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">
                <p className="mb-1 font-semibold text-foreground">Disclaimer</p>
                <p className="text-muted-foreground">{DISCLAIMER_TEXT}</p>
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={state.agreedToDisclaimer}
                  onChange={(e) => setState((prev) => ({ ...prev, agreedToDisclaimer: e.target.checked }))}
                  className="mt-1 h-5 w-5 flex-shrink-0 rounded border-2 border-border accent-accent"
                />
                <span className="text-sm leading-relaxed text-foreground">I have read and agree to the disclaimer above.</span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={state.permissionConfirmed}
                  onChange={(e) => setState((prev) => ({ ...prev, permissionConfirmed: e.target.checked }))}
                  className="mt-1 h-5 w-5 flex-shrink-0 rounded border-2 border-border accent-accent"
                />
                <span className="text-sm leading-relaxed text-foreground">
                  I confirm I have the appropriate permission (from my setting and/or the young person's parent or carer) to
                  enter this information.
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={state.brainBreaksEnabled}
                  onChange={(e) => setState((prev) => ({ ...prev, brainBreaksEnabled: e.target.checked }))}
                  className="mt-1 h-5 w-5 flex-shrink-0 rounded border-2 border-border accent-accent"
                />
                <span className="text-sm leading-relaxed text-foreground">
                  Show short brain breaks between stages (calm bubble, doodle, stretch, pop). Recommended for younger pupils.
                </span>
              </label>

              <Button onClick={() => setStage('childPrivacy')} disabled={!canProceed} className="w-full" size="lg">
                Continue
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Next: a plain-language privacy screen for the young person, before you hand the device over.
              </p>
            </CardContent>
          </Card>
          <Footer />
        </div>
      </div>
    );
  }

  /* ============================================================ */
  /*  CHILD-FACING PRIVACY NOTICE                                  */
  /* ============================================================ */
  if (stage === 'childPrivacy') {
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pt-14 sm:p-4 sm:pt-16">
        {header}
        <Card className="w-full max-w-lg" style={{ padding: 0 }}>
          <CardHeader>
            <CardTitle className="text-xl">Before we start</CardTitle>
            <CardDescription>Here's what happens with your answers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-base leading-relaxed">
            <ul className="list-disc space-y-2 pl-5">
              <li>We ask about school so grown-ups can help make it better for you.</li>
              <li>There are no right or wrong answers. It's about what <strong>you</strong> think.</li>
              <li>Everything you tap stays only in this browser, on this device — it isn't sent anywhere or saved on the internet.</li>
              <li>The adult with you can see your answers on this screen — so it's best to do this somewhere you feel comfortable.</li>
              <li>We don't ask for your name — just a made-up ID: <span className="font-mono text-sm">{childId}</span>.</li>
              <li>It's split into three short parts — you can do one now and the rest another time.</li>
              <li>You can skip anything you don't want to answer.</li>
              <li>You can stop at any time. Just tell the adult with you.</li>
            </ul>
            <p className="text-sm text-muted-foreground">If you have any questions, ask the adult with you before you start.</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStage('details')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button size="lg" onClick={() => setStage('partPicker')}>
                OK, I'm ready
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ============================================================ */
  /*  PART PICKER — choose which of the 3 parts to do               */
  /* ============================================================ */
  if (stage === 'partPicker') {
    const parts: { id: 1 | 2 | 3 }[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pt-14 sm:p-4 sm:pt-16">
        {header}
        <div className="w-full max-w-lg space-y-4">
          <Card className="shadow-glow" style={{ padding: 0 }}>
            <CardHeader>
              <CardTitle>Choose a part</CardTitle>
              <CardDescription>
                Do them in any order, one at a time. Each part saves and downloads on its own, so there's no need to finish
                everything in one go.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {parts.map(({ id }) => {
                const done = state.partCompleted[`part${id}` as keyof PartCompleted];
                return (
                  <div key={id} className="space-y-2 rounded-lg border border-border p-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        {done && <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />}
                        {PART_TITLES[id]}
                      </p>
                      <p className="text-xs text-muted-foreground">{PART_BLURBS[id]}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => startPart(id, done)}>
                        {done ? (
                          <><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Do again</>
                        ) : (
                          'Start'
                        )}
                      </Button>
                      {done && (
                        <Button size="sm" variant="outline" onClick={() => exportPartCsv(id)}>
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download CSV
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Start over completely with a new pupil? This clears all three parts.')) restart();
              }}
            >
              Start over with a new pupil
            </Button>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  /* ============================================================ */
  /*  QUESTIONS (35 statements, one per screen) — Part 1            */
  /* ============================================================ */
  if (stage === 'questions' && current) {
    const progressPct = Math.round((state.index / total) * 100);
    const toneBg: Record<number, string> = {
      1: 'bg-freq-1 text-freq-1-foreground hover:bg-freq-1/90 border-freq-1',
      2: 'bg-freq-2 text-freq-2-foreground hover:bg-freq-2/90 border-freq-2',
      3: 'bg-freq-3 text-freq-3-foreground hover:bg-freq-3/90 border-freq-3',
      4: 'bg-freq-4 text-freq-4-foreground hover:bg-freq-4/90 border-freq-4',
      5: 'bg-freq-5 text-freq-5-foreground hover:bg-freq-5/90 border-freq-5',
    };
    const toneRing: Record<number, string> = {
      1: 'ring-freq-1', 2: 'ring-freq-2', 3: 'ring-freq-3', 4: 'ring-freq-4', 5: 'ring-freq-5',
    };
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pb-10 sm:p-4" style={{ paddingTop: topPad }}>
        {topBars}
        <Card className="w-full max-w-xl" style={{ padding: 0 }}>
          <CardHeader>
            <Progress value={progressPct} />
            <CardDescription className="pt-2 text-center">Question {state.index + 1} of {total}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div key={current.id} className={`space-y-4 ${transitioning ? 'animate-fade-out' : 'animate-fade-in'}`}>
              <div className="flex min-h-[5rem] flex-col justify-center text-center">
                <p className="text-xl font-semibold leading-snug">{current.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">I feel like this…</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground" aria-hidden>
                <span>Never</span>
                <span className="flex h-2 w-32 overflow-hidden rounded-full border border-border sm:w-40">
                  <span className="flex-1 bg-freq-1" />
                  <span className="flex-1 bg-freq-2" />
                  <span className="flex-1 bg-freq-3" />
                  <span className="flex-1 bg-freq-4" />
                  <span className="flex-1 bg-freq-5" />
                </span>
                <span>Very Often</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FREQUENCY_OPTIONS.map((o, i) => {
                  const selected = state.responses[current.id] === o.value;
                  const isLoneLast = i === FREQUENCY_OPTIONS.length - 1 && FREQUENCY_OPTIONS.length % 2 === 1;
                  return (
                    <button
                      type="button"
                      key={o.value}
                      style={{ animationDelay: `${i * 40}ms` }}
                      onClick={() => select(o.value)}
                      disabled={transitioning}
                      className={`flex h-14 items-center justify-center rounded-md border px-4 text-base font-medium transition-all ${toneBg[o.tone]} ${
                        selected ? `ring-2 ring-offset-2 ${toneRing[o.tone]} scale-[1.02]` : 'opacity-90 hover:scale-[1.02] hover:opacity-100'
                      } disabled:cursor-not-allowed disabled:opacity-60 ${isLoneLast ? 'sm:col-span-2' : ''}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button variant="ghost" size="sm" disabled={state.index === 0 || transitioning} onClick={goBack}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Go back
              </Button>
              <Button variant="ghost" size="sm" onClick={skip} disabled={transitioning}>
                Skip / Don't know
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ============================================================ */
  /*  PICKER INTRO — Part 2                                        */
  /* ============================================================ */
  if (stage === 'pickerIntro') {
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pb-10 sm:p-4" style={{ paddingTop: topPad }}>
        {topBars}
        <Card className="w-full max-w-lg" style={{ padding: 0 }}>
          <CardHeader>
            <CardTitle>Part 2 of 3 — What helps</CardTitle>
            <CardDescription>
              For the next few options, tap the things that make a difference to how you feel in school. Tap as many as you
              like, then press Continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setStage('environment')}>
              Continue to Part 2
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ============================================================ */
  /*  BRAIN BREAKS                                                 */
  /* ============================================================ */
  if (stage === 'brainBreakA' || stage === 'brainBreakB' || stage === 'brainBreakC' || stage === 'brainBreakD') {
    const slot = stage.slice(-1) as 'A' | 'B' | 'C' | 'D';
    const next: Record<'A' | 'B' | 'C' | 'D', Stage> = {
      A: 'part1Results', B: 'response', C: 'schoolDay', D: 'part2Results',
    };
    const slotIndex: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 1, C: 2, D: 3 };
    const game: BrainBreakGame = brainBreakAssignment[slotIndex[slot]] ?? brainBreakAssignment[0];
    return <BrainBreak game={game} onContinue={() => setStage(next[slot])} onSkip={() => setStage(next[slot])} topSlot={topBars} />;
  }

  /* ============================================================ */
  /*  ENVIRONMENT / RESPONSE SORT DECKS — Part 2                   */
  /* ============================================================ */
  if (stage === 'environment' || stage === 'response') {
    const isEnv = stage === 'environment';
    const items = isEnv ? studentVoiceEnvironmentItems : studentVoiceResponseItems;
    const sortState = isEnv ? state.envSort : state.respSort;
    const sortedCount = Object.keys(sortState).length;
    const allSorted = sortedCount >= items.length;
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pb-44 sm:p-4" style={{ paddingTop: topPad }}>
        {topBars}
        <Card className="w-full max-w-2xl" style={{ padding: 0 }}>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </span>
              <CardTitle className="text-xl">{isEnv ? 'Things in school that help me' : 'Things adults can do that help me'}</CardTitle>
            </div>
            <CardDescription>
              {isEnv ? 'Sort each card. Tap a button, drag the card, or use arrow keys.' : 'Sort each card into Really helps, Helps a bit, or Not for me.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SortDeck
              items={items}
              initial={sortState}
              onChange={(next) =>
                setState((prev) => (isEnv ? { ...prev, envSort: next } : { ...prev, respSort: next }))
              }
            />
          </CardContent>
        </Card>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-3 backdrop-blur sm:p-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
            <Button variant="outline" onClick={() => setStage(isEnv ? 'pickerIntro' : 'environment')}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {allSorted ? 'All sorted!' : `${sortedCount} of ${items.length} sorted`}
            </span>
            <Button
              onClick={() =>
                setStage(isEnv ? (state.brainBreaksEnabled ? 'brainBreakB' : 'response') : (state.brainBreaksEnabled ? 'brainBreakC' : 'schoolDay'))
              }
            >
              {allSorted ? 'Continue' : 'Skip rest'} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================ */
  /*  MY SCHOOL DAY — Part 2                                       */
  /* ============================================================ */
  if (stage === 'schoolDay') {
    return (
      <>
        {topBars}
        <SchoolDayWalk
          topPad={topPad}
          initial={state.schoolDayFeelings}
          onBack={() => setStage('response')}
          onContinue={(feelings) =>
            setState((prev) => ({
              ...prev,
              schoolDayFeelings: feelings,
              stage: prev.brainBreaksEnabled ? 'brainBreakD' : 'part2Results',
              partCompleted: { ...prev.partCompleted, part2: true },
              part2CompletedOn: new Date().toISOString().substring(0, 10),
            }))
          }
        />
      </>
    );
  }

  /* ============================================================ */
  /*  FLOORPLAN INTROS — Part 3                                    */
  /* ============================================================ */
  if (stage === 'floorplanIntroSafe' || stage === 'floorplanIntroTricky') {
    const isSafe = stage === 'floorplanIntroSafe';
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pb-10 sm:p-4" style={{ paddingTop: topPad }}>
        {topBars}
        <Card className="w-full max-w-lg" style={{ padding: 0 }}>
          <CardHeader className="space-y-2">
            <CardTitle>{isSafe ? 'Part 3 of 3 — Your classrooms' : 'Now the tricky seats'}</CardTitle>
            {isSafe ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-success/60 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> First pass: Good seats
              </span>
            ) : (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-destructive/60 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Second pass: Tricky seats
              </span>
            )}
            <CardDescription>
              {isSafe ? (
                <>
                  We'll look at {FLOORPLAN_LAYOUTS.length} classroom layouts. For each one, tap any seats that feel like a
                  <strong> good place</strong> to sit — where you'd feel calm and ready to learn. You can pick none, some or
                  many. After that, we'll go through again for tricky seats.
                </>
              ) : (
                <>
                  Same {FLOORPLAN_LAYOUTS.length} classrooms again — this time tap seats that would feel <strong>tricky</strong>:
                  hard to focus, or hard to feel calm. Your good seats from before are shown faded for reference.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() =>
                setState((prev) => ({ ...prev, planIndex: 0, stage: isSafe ? 'floorplanSafe' : 'floorplanTricky' }))
              }
            >
              {isSafe ? 'Continue to Part 3' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ============================================================ */
  /*  FLOORPLAN PASSES — Part 3                                    */
  /* ============================================================ */
  if (stage === 'floorplanSafe' || stage === 'floorplanTricky') {
    const isSafe = stage === 'floorplanSafe';
    const layout = FLOORPLAN_LAYOUTS[state.planIndex];
    const layoutTotal = FLOORPLAN_LAYOUTS.length;
    const bucketKey = isSafe ? 'floorplanSafe' : 'floorplanTricky';
    const selected = new Set(state[bucketKey][state.planIndex] ?? []);
    const otherSet = isSafe ? undefined : new Set(state.floorplanSafe[state.planIndex] ?? []);
    const isLast = state.planIndex === layoutTotal - 1;
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pb-10 sm:p-4" style={{ paddingTop: topPad }}>
        {topBars}
        <Card className="w-full max-w-3xl" style={{ padding: 0 }}>
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              {isSafe ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-success/60 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Good seats · classroom {state.planIndex + 1} of {layoutTotal}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-destructive/60 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Tricky seats · classroom {state.planIndex + 1} of {layoutTotal}
                </span>
              )}
              <Progress value={Math.round(((state.planIndex + 1) / layoutTotal) * 100)} className="h-2 w-32" />
            </div>
            <CardTitle className="text-xl">{layout.name}</CardTitle>
            <CardDescription>{layout.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              role="status"
              className={`flex items-start gap-2 rounded-md border-2 p-3 ${isSafe ? 'border-success/60 bg-success/10' : 'border-destructive/60 bg-destructive/10'}`}
            >
              {isSafe ? <ThumbsUp className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />}
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  You're picking {isSafe ? <span className="text-success">good seats</span> : <span className="text-destructive">tricky seats</span>}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {isSafe
                    ? "Tap the seats where you'd feel calm and ready to learn."
                    : "Tap the seats where it would feel hard to focus or feel calm. Your good seats are shown faded for reference."}
                </p>
              </div>
            </div>
            <FloorplanPicker
              layout={layout}
              selectedSeatIds={selected}
              otherPassSeatIds={otherSet}
              mark={isSafe ? 'safe' : 'tricky'}
              onToggleSeat={(id) => togglePlanSeat(bucketKey, state.planIndex, id)}
            />
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setState((prev) => ({ ...prev, planIndex: Math.max(0, prev.planIndex - 1) }))} disabled={state.planIndex === 0}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              {isLast ? (
                <Button
                  onClick={() =>
                    setState((prev) => (
                      isSafe
                        ? { ...prev, planIndex: 0, stage: 'floorplanIntroTricky' }
                        : {
                            ...prev,
                            planIndex: 0,
                            stage: 'part3Results',
                            partCompleted: { ...prev.partCompleted, part3: true },
                            part3CompletedOn: new Date().toISOString().substring(0, 10),
                          }
                    ))
                  }
                >
                  Done <Check className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setState((prev) => ({ ...prev, planIndex: Math.min(layoutTotal - 1, prev.planIndex + 1) }))}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ============================================================ */
  /*  PART 1 RESULTS                                                */
  /* ============================================================ */
  if (stage === 'part1Results') {
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pt-14 sm:p-4 sm:pt-16">
        <div className="w-full max-w-2xl space-y-4">
          <div className="mb-1 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <img src="/logo-icon.png" alt="" className="h-6 w-6 object-contain" />
              <span>← All tools</span>
            </Link>
            <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">ID: {childId}</span>
          </div>
          <Card className="shadow-glow" style={{ padding: 0 }}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <PartyPopper className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Part 1 complete</CardTitle>
              <CardDescription>
                Please pass the device back to the adult. Review the answers together to make sure they show what the young
                person wanted to say.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Summary</h3>
                {COMPOSITES.map((c) => {
                  const pct = scores[c.key];
                  const statementsFor = STATEMENTS_BY_COMPOSITE[c.key];
                  return (
                    <div key={c.key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{c.label}</span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full transition-all ${pct >= 50 ? 'bg-primary' : 'bg-muted-foreground/40'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer select-none hover:text-foreground">
                          Based on {statementsFor.length} statement{statementsFor.length === 1 ? '' : 's'} — tap to see which
                        </summary>
                        <ul className="mt-1 space-y-1 pl-3">
                          {statementsFor.map((s) => (
                            <li key={s.id} className="flex justify-between gap-2 border-b border-border/60 py-1 last:border-0">
                              <span>{s.text}</span>
                              <span className="shrink-0 font-medium text-foreground">{freqLabel(state.responses[s.id])}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  );
                })}
                <p className="pt-1 text-xs text-muted-foreground">
                  Each percentage is worked out only from the statements linked to that heading (shown above) — it's not a
                  standardised score, just a quick way to see where the young person's "Often" / "Very Often" answers cluster.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Statements to talk about</h3>
                <p className="text-xs text-muted-foreground">
                  Statements the young person marked as <strong>Often</strong> or <strong>Very Often</strong>, with follow-up
                  prompts you can use in conversation.
                </p>
                {studentVoiceCategories.map((cat) => {
                  const items = notable[cat.id as StudentVoiceCategory] ?? [];
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{cat.label}</h4>
                        <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {items.map((s) => (
                          <div key={s.id} className="rounded-md border border-border p-3">
                            <p className="text-sm font-medium">{s.text}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              <span className="font-semibold">Frequency:</span> {freqLabel(state.responses[s.id])}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              <span className="font-semibold">Follow-up:</span> <em>{s.followUp}</em>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Object.values(notable).every((arr) => arr.length === 0) && (
                  <p className="text-sm text-muted-foreground">Nothing was marked as Often / Very Often.</p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button onClick={exportPart1Csv}>
              <Download className="mr-2 h-4 w-4" /> Download Part 1 CSV
            </Button>
            <PremiumLockButton label="Download high-quality PDF" />
            <Button variant="outline" onClick={() => setStage('partPicker')}>
              Back to parts
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Your answers are saved in this browser only. Nothing is uploaded.</p>
          <Footer />
        </div>
      </div>
    );
  }

  /* ============================================================ */
  /*  PART 2 RESULTS                                                */
  /* ============================================================ */
  if (stage === 'part2Results') {
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pt-14 sm:p-4 sm:pt-16">
        <div className="w-full max-w-2xl space-y-4">
          <div className="mb-1 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <img src="/logo-icon.png" alt="" className="h-6 w-6 object-contain" />
              <span>← All tools</span>
            </Link>
            <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">ID: {childId}</span>
          </div>
          <Card className="shadow-glow" style={{ padding: 0 }}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <PartyPopper className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Part 2 complete</CardTitle>
              <CardDescription>
                Please pass the device back to the adult. Review the answers together to make sure they show what the young
                person wanted to say.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">How the young person sorted each card.</p>
                <SortedSection title="Things that make a difference to how I feel in school" loves={envLoves} helps={envHelps} notForMe={envNotForMe} lookup={lookupEnvironmentText} />
                <SortedSection title="Things the adult can do to help me" loves={respLoves} helps={respHelps} notForMe={respNotForMe} lookup={lookupResponseText} />
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">My school day</h3>
                <p className="text-xs text-muted-foreground">
                  How the young person felt across each part of their school day. Each coloured dot is one tap they made
                  while watching the day play out.
                </p>
                <SchoolDaySummary feelings={state.schoolDayFeelings} />
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button onClick={exportPart2Csv}>
              <Download className="mr-2 h-4 w-4" /> Download Part 2 CSV
            </Button>
            <PremiumLockButton label="Download high-quality PDF" />
            <Button variant="outline" onClick={() => setStage('partPicker')}>
              Back to parts
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Your answers are saved in this browser only. Nothing is uploaded.</p>
          <Footer />
        </div>
      </div>
    );
  }

  /* ============================================================ */
  /*  PART 3 RESULTS                                                */
  /* ============================================================ */
  if (stage === 'part3Results') {
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-3 pt-14 sm:p-4 sm:pt-16">
        <div className="w-full max-w-2xl space-y-4">
          <div className="mb-1 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <img src="/logo-icon.png" alt="" className="h-6 w-6 object-contain" />
              <span>← All tools</span>
            </Link>
            <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">ID: {childId}</span>
          </div>
          <Card className="shadow-glow" style={{ padding: 0 }}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <PartyPopper className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Part 3 complete</CardTitle>
              <CardDescription>
                Please pass the device back to the adult. Review the answers together to make sure they show what the young
                person wanted to say.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The seats the young person marked as <strong className="text-primary">good places</strong> (green tick) and{' '}
                <strong className="text-destructive">tricky places</strong> (red cross) across {FLOORPLAN_LAYOUTS.length} different
                classroom layouts.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Stat label="Good · total" value={safeStats.total} tone="primary" />
                <Stat label="Good · front" value={safeStats.front} tone="primary" />
                <Stat label="Good · middle of room" value={safeStats.centerRoom} tone="primary" />
                <Stat label="Tricky · total" value={trickyStats.total} tone="destructive" />
                <Stat label="Tricky · middle of room" value={trickyStats.centerRoom} tone="destructive" />
                <Stat label="Tricky · near door" value={trickyStats.nearDoor} tone="destructive" />
              </div>
              <div className="space-y-4">
                {FLOORPLAN_LAYOUTS.map((layout, idx) => {
                  const safeIds = new Set(state.floorplanSafe[idx] ?? []);
                  const trickyIds = new Set(state.floorplanTricky[idx] ?? []);
                  if (safeIds.size === 0 && trickyIds.size === 0) return null;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{idx + 1}. {layout.name}</h3>
                        <div className="flex gap-1">
                          <Badge>{safeIds.size} good</Badge>
                          <Badge variant="destructive">{trickyIds.size} tricky</Badge>
                        </div>
                      </div>
                      <FloorplanReview layout={layout} safeSeatIds={safeIds} trickySeatIds={trickyIds} />
                    </div>
                  );
                })}
                {safeStats.total === 0 && trickyStats.total === 0 && (
                  <p className="text-sm text-muted-foreground">No seats were marked on any layout.</p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button onClick={exportPart3Csv}>
              <Download className="mr-2 h-4 w-4" /> Download Part 3 CSV
            </Button>
            <PremiumLockButton label="Download high-quality PDF" />
            <Button variant="outline" onClick={() => setStage('partPicker')}>
              Back to parts
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Your answers are saved in this browser only. Nothing is uploaded.</p>
          <Footer />
        </div>
      </div>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Shared small pieces                                                       */
/* -------------------------------------------------------------------------- */

function Stat({ label, value, tone }: { label: string; value: number; tone: 'primary' | 'destructive' }) {
  return (
    <div className={`rounded-md border px-3 py-2 ${tone === 'primary' ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function SortedSection({
  title, loves, helps, notForMe, lookup,
}: {
  title: string;
  loves: string[];
  helps: string[];
  notForMe: string[];
  lookup: (id: string) => string;
}) {
  const Block = ({ label, ids, tone }: { label: string; ids: string[]; tone: string }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${tone}`} />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label} ({ids.length})</h4>
      </div>
      {ids.length === 0 ? (
        <p className="pl-4 text-xs italic text-muted-foreground">None.</p>
      ) : (
        <ul className="space-y-1">
          {ids.map((id) => (
            <li key={id} className="rounded-md border border-border p-2 text-sm">{lookup(id)}</li>
          ))}
        </ul>
      )}
    </div>
  );
  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <Block label="Really helps" ids={loves} tone="bg-pink-500" />
      <Block label="Helps a bit" ids={helps} tone="bg-emerald-500" />
      <Block label="Not for me" ids={notForMe} tone="bg-amber-500" />
    </div>
  );
}
