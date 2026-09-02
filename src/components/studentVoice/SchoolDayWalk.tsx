import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Pause, Play, RotateCcw, Check, ArrowLeft, ArrowRight, Plus, Minus, Sparkles } from 'lucide-react';
import {
  SCHOOL_DAY_STAGES,
  SCHOOL_DAY_FEELINGS,
  SCHOOL_DAY_TOTAL_MS,
  SCENE_PALETTE,
  emptySchoolDayFeelings,
  type SchoolDayFeeling,
  type SchoolDayFeelingsMap,
} from '@/data/schoolDayStages';

interface Tap {
  /** 0..1 position along the day at the moment of the tap. */
  position: number;
  /** Stage id active at the time of tap. */
  stageId: string;
  feeling: SchoolDayFeeling;
}

interface SchoolDayWalkProps {
  /** Optional "Save my answers" control rendered inside this stage's own
   *  bottom bar / intro card, so the flow never stacks two fixed bars. */
  saveSlot?: React.ReactNode;
  topPad?: number;
  initial?: SchoolDayFeelingsMap;
  onBack: () => void;
  onContinue: (feelings: SchoolDayFeelingsMap) => void;
}

/**
 * Convert the running list of taps into the per-stage map that we save.
 * Order within each stage = order tapped.
 */
const tapsToMap = (taps: Tap[]): SchoolDayFeelingsMap => {
  const out = emptySchoolDayFeelings();
  for (const t of taps) {
    if (!out[t.stageId]) out[t.stageId] = [];
    out[t.stageId]!.push(t.feeling);
  }
  return out;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------- */
/*  Animated walk-through                                                     */
/* -------------------------------------------------------------------------- */

export const SchoolDayWalk = ({ initial, onBack, onContinue, saveSlot, topPad }: SchoolDayWalkProps) => {
  // If the OS asks for reduced motion, render the simpler list version.
  const [reducedMotion] = useState(() => prefersReducedMotion());
  if (reducedMotion) {
    return <SchoolDayList initial={initial} onBack={onBack} onContinue={onContinue} />;
  }

  /** Two-step flow: 'walk' = the animation, 'review' = confirmation screen. */
  const [step, setStep] = useState<'walk' | 'review'>('walk');
  const [reviewState, setReviewState] = useState<SchoolDayFeelingsMap>(() => emptySchoolDayFeelings());

  /**
   * Pre-walk "ready" gate — pupils land on a calm intro card explaining
   * what's about to happen and the four feeling buttons, and only start
   * the animation when they tap Go. Previously the walk auto-played on
   * mount, which meant the day had already advanced before they'd had a
   * chance to read the instructions.
   */
  const [hasStarted, setHasStarted] = useState(false);

  /** Normalised position 0..1 along the day. */
  const [progress, setProgress] = useState(0);
  // Don't begin animating until the pupil taps Go on the intro card.
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [taps, setTaps] = useState<Tap[]>(() => {
    // Hydrate from any prior visit (if the pupil came back).
    const seed: Tap[] = [];
    if (initial) {
      const stages = SCHOOL_DAY_STAGES;
      stages.forEach((stage, i) => {
        const arr = initial[stage.id] ?? [];
        // Place each tap at the centre of its stage on the timeline.
        const pos = (i + 0.5) / stages.length;
        for (const f of arr) seed.push({ position: pos, stageId: stage.id, feeling: f as SchoolDayFeeling });
      });
    }
    return seed;
  });
  /** Tiny pulse on the most recent feeling button — for tactile feedback. */
  const [pulse, setPulse] = useState<SchoolDayFeeling | null>(null);
  /** Replay mode: re-run the walk and re-highlight previously logged taps in
   *  sequence. While replaying, the feeling buttons are read-only — pupils
   *  can't accidentally double-log by tapping during playback. */
  const [replaying, setReplaying] = useState(false);
  /** Transient emoji "pings" rendered in the scene during a replay. Kept
   *  separate from `taps` so the saved data is never mutated by playback. */
  const [replayPings, setReplayPings] = useState<Tap[]>([]);
  /** Tracks how many taps (in order) we've already re-highlighted during the
   *  current replay so we only fire each one once per pass. */
  const replayCursorRef = useRef(0);
  /** Sorted-by-position copy of the taps used by the replay scheduler. */
  const replayTapsRef = useRef<Tap[]>([]);

  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  /* ----- the animation loop ----- */
  useEffect(() => {
    if (!playing || finished) return;
    const loop = (now: number) => {
      if (startRef.current == null) startRef.current = now - pausedAtRef.current;
      const elapsed = now - startRef.current;
      const next = Math.min(1, elapsed / SCHOOL_DAY_TOTAL_MS);
      setProgress(next);
      if (next >= 1) {
        setPlaying(false);
        setFinished(true);
        return;
      }
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [playing, finished]);

  /** Begin the walk from the intro card. */
  const handleStart = () => {
    setHasStarted(true);
    pausedAtRef.current = 0;
    startRef.current = null;
    setPlaying(true);
  };

  // Pause / resume handling — store how far we'd got so we resume cleanly.
  const togglePlay = () => {
    if (finished) {
      // Replay
      pausedAtRef.current = 0;
      startRef.current = null;
      setProgress(0);
      setFinished(false);
      setPlaying(true);
      return;
    }
    if (playing) {
      pausedAtRef.current = progress * SCHOOL_DAY_TOTAL_MS;
      startRef.current = null;
      setPlaying(false);
    } else {
      setPlaying(true);
    }
  };

  /** Start a "replay with my taps" pass: rewind to the start, lock the
   *  feeling buttons, and let the animation loop run while the effect below
   *  re-fires each previously logged tap as the marker passes its position. */
  const startReplay = useCallback(() => {
    if (taps.length === 0) return;
    // Sort defensively — pause/resume could in theory leave taps slightly out
    // of chronological (= position) order.
    replayTapsRef.current = [...taps].sort((a, b) => a.position - b.position);
    replayCursorRef.current = 0;
    pausedAtRef.current = 0;
    startRef.current = null;
    setReplayPings([]);
    setProgress(0);
    setFinished(false);
    setReplaying(true);
    setPlaying(true);
  }, [taps]);

  /** Stop a replay early (e.g. pupil hits Skip/Review). Snaps to the end so
   *  the post-walk controls reappear in their normal "finished" state. */
  const stopReplay = useCallback(() => {
    setReplaying(false);
    setPlaying(false);
    setFinished(true);
    setProgress(1);
    setReplayPings([]);
    replayCursorRef.current = 0;
  }, []);

  /** Replay scheduler: as `progress` advances, fire any taps whose position
   *  has just been crossed. Re-uses the existing `pulse` state so the
   *  feeling button visibly flashes exactly like a fresh tap would, and
   *  pushes a transient ping into `replayPings` for the in-scene emoji. */
  useEffect(() => {
    if (!replaying) return;
    const list = replayTapsRef.current;
    while (
      replayCursorRef.current < list.length &&
      list[replayCursorRef.current].position <= progress
    ) {
      const t = list[replayCursorRef.current];
      setPulse(t.feeling);
      window.setTimeout(() => setPulse(null), 220);
      // Add a ping; trim to the last 5 to match the live tap renderer.
      setReplayPings((prev) => [...prev.slice(-4), t]);
      replayCursorRef.current += 1;
    }
    if (progress >= 1) {
      setReplaying(false);
      // Leave pings to fade out via the existing animate-fade-out class.
      window.setTimeout(() => setReplayPings([]), 600);
    }
  }, [progress, replaying]);

  /** Which stage is currently active (based on the moving marker). */
  const currentStageIdx = useMemo(() => {
    const idx = Math.floor(progress * SCHOOL_DAY_STAGES.length);
    return Math.min(SCHOOL_DAY_STAGES.length - 1, idx);
  }, [progress]);
  const currentStage = SCHOOL_DAY_STAGES[currentStageIdx];
  const palette = SCENE_PALETTE[currentStage.scene];

  /** Per-stage tap counts for the bar at the bottom. */
  const countsByStage = useMemo(() => {
    const map: Record<string, Record<SchoolDayFeeling, number>> = {};
    const empty = () =>
      SCHOOL_DAY_FEELINGS.reduce((acc, f) => {
        acc[f.id] = 0;
        return acc;
      }, {} as Record<SchoolDayFeeling, number>);
    for (const s of SCHOOL_DAY_STAGES) {
      map[s.id] = empty();
    }
    for (const t of taps) map[t.stageId][t.feeling] += 1;
    return map;
  }, [taps]);

  /* ----- record a tap ----- */
  const recordTap = useCallback((feeling: SchoolDayFeeling) => {
    // Ignore taps during replay — buttons are visually disabled but a
    // keyboard shortcut could still fire, and we don't want to corrupt data.
    if (replaying) return;
    const now = performance.now();
    const elapsedMs = Math.round(progress * SCHOOL_DAY_TOTAL_MS);
    // Structured log so we can spot missed/late taps in DevTools or session replay.
    // Tag is grep-friendly: filter the console for "[SchoolDayWalk]".
    // eslint-disable-next-line no-console
    console.debug('[SchoolDayWalk] tap', {
      feeling,
      stageId: currentStage.id,
      stageLabel: currentStage.label,
      stageIndex: currentStageIdx,
      progress: Number(progress.toFixed(4)),
      elapsedMs,
      wallClockIso: new Date().toISOString(),
      perfNow: Math.round(now),
      playing,
      finished,
    });
    setTaps((prev) => [...prev, { position: progress, stageId: currentStage.id, feeling }]);
    setPulse(feeling);
    window.setTimeout(() => setPulse(null), 220);
  }, [progress, currentStage.id, currentStage.label, currentStageIdx, playing, finished, replaying]);

  /* ----- keyboard shortcuts ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); return; }
      const idx = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].indexOf(e.code);
      if (idx >= 0 && idx < SCHOOL_DAY_FEELINGS.length && !finished) {
        e.preventDefault();
        recordTap(SCHOOL_DAY_FEELINGS[idx].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [recordTap, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const stageTotal = SCHOOL_DAY_STAGES.length;
  const characterPct = progress * 100;

  /** Move from the animation into the review screen, seeding edits from the
   *  taps the pupil made while it played. */
  const goToReview = () => {
    // eslint-disable-next-line no-console
    console.info('[SchoolDayWalk] review', {
      totalTaps: taps.length,
      finished,
      progress: Number(progress.toFixed(4)),
      perStage: SCHOOL_DAY_STAGES.map((s) => ({
        stageId: s.id,
        label: s.label,
        counts: countsByStage[s.id],
        total: (countsByStage[s.id].worried + countsByStage[s.id].tricky + countsByStage[s.id].safe + countsByStage[s.id].happy),
      })),
    });
    setReviewState(tapsToMap(taps));
    setStep('review');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (step === 'review') {
    return (
      <SchoolDayReview
        value={reviewState}
        onChange={setReviewState}
        onBack={() => setStep('walk')}
        onConfirm={() => onContinue(reviewState)}
        saveSlot={saveSlot}
        topPad={topPad}
      />
    );
  }

  /* ---------- Pre-walk intro / "ready?" gate ---------- */
  if (!hasStarted) {
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center p-2 sm:p-4 pt-28 sm:pt-32" style={topPad ? { paddingTop: topPad } : undefined}>
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              My school day
            </CardTitle>
            <CardDescription>
              In a moment you'll watch your school day go by, from arriving in
              the morning all the way to home time. As it plays, tap how you
              feel about each part of the day — as many times as you like.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">
                You can tap one of four feelings:
              </p>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {SCHOOL_DAY_FEELINGS.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-2 rounded-md bg-background px-3 py-2 border border-border"
                  >
                    <span className="text-xl" aria-hidden>{f.emoji}</span>
                    <span className="font-medium">{f.label}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Tip: you can pause or replay the walk at any time. Nothing is
                saved until you reach the review screen at the end.
              </p>
            </div>

            {saveSlot}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
              <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                size="lg"
                onClick={handleStart}
                className="gap-2"
                aria-label="Start my school day walk"
              >
                <Play className="h-4 w-4" /> Go — start my school day
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh bg-background flex items-start justify-center p-2 sm:p-4 pt-28 sm:pt-32 pb-[calc(280px+env(safe-area-inset-bottom,0px))] sm:pb-[calc(160px+env(safe-area-inset-bottom,0px))]"
      style={topPad ? { paddingTop: topPad } : undefined}
    >
      <Card className="w-full max-w-3xl overflow-hidden">
        <CardHeader className="space-y-1 py-3 sm:py-4">
          <CardTitle className="text-xl">My school day</CardTitle>
          <CardDescription>
            Watch the day go by. Tap how you feel as much as you like — at any moment, for any part of the day.
          </CardDescription>
          {/* Screen-reader-only instructions describing the keyboard shortcuts
              and how to use the feeling buttons. Sighted users see the same
              meaning via the visible buttons + hint text below. */}
          <p className="sr-only">
            There are four feeling buttons at the bottom of the screen: Worried, Tricky, Safe and Happy.
            Activate a button at any time to record how you feel about the current part of the day.
            You can also press keys 1, 2, 3 or 4 to record Worried, Tricky, Safe or Happy.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {/* Polite live region: announces each stage change to screen readers
              without interrupting the user. The visible "1 of 8 · Lessons"
              label inside the scene is decorative for AT — this is the source
              of truth. */}
          <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
            {`Stage ${currentStageIdx + 1} of ${stageTotal}: ${currentStage.label}. ${currentStage.hint}`}
          </div>
          {/* Replay status — announced once when replay starts and again on end. */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {replaying ? 'Replaying your school day.' : ''}
          </div>
          {/* Assertive region: announces the most recent feeling tap so AT
              users get immediate confirmation that their input was recorded. */}
          {pulse && (
            <div className="sr-only" aria-live="assertive" aria-atomic="true">
              {`Logged ${SCHOOL_DAY_FEELINGS.find((f) => f.id === pulse)?.label} for ${currentStage.label}.`}
            </div>
          )}

          {/* ---------- the scene ---------- */}
          <div
            data-sd-scene-wrap
            className="relative w-full rounded-xl border border-border overflow-hidden"
            style={{
              // Slightly taller on small screens so props/character read well; wider on desktop.
              aspectRatio: 'var(--sd-aspect, 4 / 3)',
              // Cap the scene height so the header, timeline, play controls AND the
              // sticky feelings tray all still fit on short laptop viewports.
              maxHeight: 'var(--sd-scene-max, min(32dvh, 260px))',
              background: `linear-gradient(to bottom, ${palette.sky} 0%, ${palette.sky} 65%, ${palette.ground} 65%, ${palette.ground} 100%)`,
              transition: 'background 700ms ease',
            }}
            role="img"
            aria-label={`Scene: ${currentStage.label}. ${currentStage.hint}`}
          >
            <style>{`@media (min-width: 640px){[data-sd-scene]{--sd-aspect: 16 / 7;} [data-sd-scene-wrap]{--sd-scene-max: min(30dvh, 240px);}}`}</style>
            <span data-sd-scene className="hidden" aria-hidden />
            {/* Sun arcs across the sky in time with progress. */}
            <div
              className="absolute h-12 w-12 rounded-full"
              style={{
                left: `${5 + progress * 85}%`,
                top: `${10 + Math.sin(progress * Math.PI) * -20 + 25}%`,
                background: 'radial-gradient(circle, hsl(48 100% 70%) 0%, hsl(48 100% 60% / 0.6) 60%, transparent 100%)',
                transition: 'left 60ms linear, top 60ms linear',
              }}
              aria-hidden
            />

            {/* Scene props (very simple decorative shapes). */}
            <SceneProps scene={currentStage.scene} accent={palette.accent} />

            {/* Walking character. */}
            <Character left={`${5 + progress * 88}%`} bobbing={playing} accent={palette.accent} />

            {/* Stage label, top-left, fading in/out. */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 rounded-md bg-background/85 backdrop-blur text-[11px] sm:text-xs font-medium text-foreground shadow-sm">
              {currentStageIdx + 1} of {stageTotal} · {currentStage.label}
            </div>
            {/* Replay badge — top-right, only while replaying. */}
            {replaying && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 rounded-md bg-primary text-primary-foreground text-[11px] sm:text-xs font-semibold shadow-sm flex items-center gap-1 animate-fade-in">
                <RotateCcw className="h-3 w-3" aria-hidden /> Replaying
              </div>
            )}

            {/* Recent tap pings (a coloured ring that briefly expands). */}
            {(replaying ? replayPings : taps.slice(-5)).map((t, i) => {
              const f = SCHOOL_DAY_FEELINGS.find((x) => x.id === t.feeling);
              return (
                <div
                  key={`${replaying ? 'r' : 'l'}-${t.position}-${i}`}
                  className="absolute pointer-events-none animate-fade-out"
                  style={{
                    left: `${t.position * 100}%`,
                    bottom: '6%',
                    transform: 'translateX(-50%)',
                    color: f?.cssVar,
                  }}
                  aria-hidden
                >
                  <span className="text-2xl drop-shadow">{f?.emoji}</span>
                </div>
              );
            })}
          </div>

          {/* ---------- timeline strip with stamped feelings ---------- */}
          <div className="space-y-1">
            <div className="relative h-10 rounded-md border border-border bg-muted/40 overflow-hidden">
              {/* Stage dividers. */}
              {SCHOOL_DAY_STAGES.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-border/50"
                  style={{ left: `${(i / stageTotal) * 100}%` }}
                  aria-hidden
                />
              ))}
              {/* Played-portion fill. */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-primary/15"
                style={{ width: `${characterPct}%` }}
                aria-hidden
              />
              {/* Tapped feeling dots. */}
              {taps.map((t, i) => {
                const f = SCHOOL_DAY_FEELINGS.find((x) => x.id === t.feeling);
                return (
                  <div
                    key={i}
                    className={`absolute top-1/2 h-3 w-3 rounded-full border border-background ${f?.dotClass}`}
                    style={{ left: `${t.position * 100}%`, transform: 'translate(-50%, -50%)' }}
                    aria-hidden
                  />
                );
              })}
              {/* Moving marker. */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary"
                style={{ left: `${characterPct}%` }}
                aria-hidden
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
              {SCHOOL_DAY_STAGES.map((s) => (
                <span key={s.id} className="flex-1 text-center truncate" title={s.label}>{s.label.split(' ')[0]}</span>
              ))}
            </div>
          </div>

          {/* ---------- play controls ---------- */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
              className="min-h-[44px]"
              disabled={replaying}
              aria-label={finished ? 'Start over' : (playing ? 'Pause' : 'Play')}
            >
              {finished ? <RotateCcw className="h-4 w-4 mr-1" /> : (playing ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />)}
              {finished ? 'Start over' : (playing ? 'Pause' : 'Play')}
            </Button>
            {finished && !replaying && (
              <Button
                variant="primary"
                size="sm"
                onClick={startReplay}
                disabled={taps.length === 0}
                className="min-h-[44px]"
                title={taps.length === 0 ? 'No feelings to replay yet.' : undefined}
                aria-label="Replay with my taps"
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Replay with my taps
              </Button>
            )}
            {replaying && (
              <Button
                variant="secondary"
                size="sm"
                onClick={stopReplay}
                className="min-h-[44px]"
                aria-label="Stop replay"
              >
                Stop replay
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {Math.round((progress * SCHOOL_DAY_TOTAL_MS) / 1000)}s / {Math.round(SCHOOL_DAY_TOTAL_MS / 1000)}s
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ---------- sticky feelings tray ---------- */}
      <div
        className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border px-2 pt-2 pb-2 sm:p-4 z-40"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-3xl mx-auto space-y-2">
          {finished && !replaying && (
            <div
              className="rounded-md border-2 border-primary/60 bg-primary/10 px-3 py-2 flex items-center justify-between gap-2 animate-fade-in"
              role="status"
              aria-live="polite"
            >
              <p className="text-xs sm:text-sm font-medium text-foreground">
                <Sparkles className="inline h-4 w-4 mr-1 text-primary" aria-hidden />
                You've reached the end of the school day — tap <strong>Review &amp; save</strong> to check and save your feelings.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={onBack} className="min-h-[44px]">
              <ArrowLeft className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Back</span>
            </Button>
            {!finished && (
              <p className="text-xs text-muted-foreground hidden sm:block">
                Tap as you watch. You can tap the same feeling many times.
              </p>
            )}
            <Button
              size={finished ? 'default' : 'sm'}
              onClick={() => { if (replaying) stopReplay(); goToReview(); }}
              className={`min-h-[44px] ${finished && !replaying ? 'sm:min-h-[52px] px-5 shadow-lg ring-2 ring-primary/40 ring-offset-2 ring-offset-background animate-pulse font-semibold' : ''}`}
              aria-label={finished ? 'Review and save your feelings' : 'Skip to the review screen'}
            >
              {finished ? (
                <>Review &amp; save <ArrowRight className="h-4 w-4 ml-1" /></>
              ) : (
                <>Skip / Review <Check className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </div>
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2"
            role="group"
            aria-label="Tap a feeling to log it for the current part of the day"
          >
            {SCHOOL_DAY_FEELINGS.map((f, i) => {
              const total = taps.filter((t) => t.feeling === f.id).length;
              const isPulsing = pulse === f.id;
              const shortcut = String(i + 1);
              return (
                <button
                  key={f.id}
                  type="button"
                  // Use pointerdown for instant feedback on touch (avoids the
                  // ~300ms click delay some mobile browsers still impose) and
                  // suppress the synthesised click so the tap isn't doubled.
                  onPointerDown={(e) => { e.preventDefault(); recordTap(f.id); }}
                  onClick={(e) => e.preventDefault()}
                  // Keyboard parity with pointer: Enter/Space activates the
                  // button. We call recordTap directly (instead of relying on
                  // the implicit click) because we cancel synthetic clicks
                  // above for the touch-fast-path.
                  onKeyDown={(e) => {
                    if (replaying || (finished && progress >= 1)) return;
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      recordTap(f.id);
                    }
                  }}
                  disabled={replaying || (finished && progress >= 1)}
                  aria-disabled={replaying || (finished && progress >= 1)}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  className={`relative min-h-[56px] h-[16vw] max-h-[72px] sm:h-[56px] sm:max-h-[60px] rounded-xl border-2 font-medium text-xs sm:text-sm transition-transform ${f.buttonClass} ${isPulsing ? 'scale-110' : 'active:scale-95 sm:hover:scale-[1.03]'} disabled:opacity-60 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                  aria-label={replaying
                    ? `${f.label} — playback only during replay. Currently ${total} logged.`
                    : `Log feeling ${f.label} for ${currentStage.label}. Press ${shortcut}. Currently ${total} logged.`}
                  aria-keyshortcuts={shortcut}
                  // Each press *adds* a tap rather than toggling, so we
                  // expose the live count via aria-describedby instead of
                  // aria-pressed (which would imply on/off state).
                  aria-describedby={`sd-feeling-${f.id}-count`}
                  title={replaying ? `${f.label} (replay – read-only)` : `${f.label} (press ${shortcut})`}
                >
                  <span className="text-2xl sm:text-3xl leading-none" aria-hidden>{f.emoji}</span>
                  <span className="leading-tight">{f.label}</span>
                  {/* Visible keyboard hint on larger screens. Hidden on the
                      smallest phones to avoid crowding the label. */}
                  <span aria-hidden className="hidden sm:inline absolute bottom-1 right-1.5 text-[10px] font-semibold opacity-60">
                    {shortcut}
                  </span>
                  {total > 0 && (
                    <span
                      id={`sd-feeling-${f.id}-count`}
                      aria-hidden
                      className="absolute -top-2 -right-2 h-6 min-w-[1.5rem] px-1 rounded-full bg-background text-foreground border border-border text-[11px] font-semibold flex items-center justify-center shadow-sm"
                    >
                      {total}
                    </span>
                  )}
                  {total === 0 && (
                    <span id={`sd-feeling-${f.id}-count`} className="sr-only">
                      No taps yet for {f.label}.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Decorative SVG bits                                                        */
/* -------------------------------------------------------------------------- */

const Character = ({ left, bobbing, accent }: { left: string; bobbing: boolean; accent: string }) => (
  <div
    className="absolute z-10"
    style={{
      left,
      bottom: '12%',
      transform: 'translateX(-50%)',
      transition: 'left 30ms linear',
    }}
    aria-hidden
  >
    {/* Ground shadow — reinforces that the figure is walking (its shadow
        pulses with the same bob) rather than just sitting on the scene. */}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: -4,
        width: 30,
        height: 8,
        transform: 'translateX(-50%)',
        borderRadius: '50%',
        background: 'hsl(var(--foreground) / 0.18)',
        animation: bobbing ? 'sd-shadow-pulse 0.6s ease-in-out infinite' : undefined,
      }}
    />
    <div
      style={{
        animation: bobbing ? 'sd-bob 0.6s ease-in-out infinite' : undefined,
        transformOrigin: 'bottom center',
        // Bigger + a soft glow so a small, slow-moving figure still reads as
        // the thing to track against a busy scene, at a glance.
        filter: 'drop-shadow(0 2px 4px hsl(var(--foreground) / 0.25))',
      }}
    >
      <svg width="56" height="80" viewBox="0 0 42 60" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="21" cy="12" r="9" fill="hsl(var(--foreground))" opacity="0.85" />
        {/* Body */}
        <rect x="13" y="20" width="16" height="22" rx="4" fill={accent} />
        {/* Backpack */}
        <rect x="9" y="22" width="6" height="14" rx="2" fill="hsl(var(--primary))" opacity="0.85" />
        {/* Legs */}
        <rect x="14" y="42" width="5" height="14" rx="2" fill="hsl(var(--foreground))" opacity="0.7" />
        <rect x="23" y="42" width="5" height="14" rx="2" fill="hsl(var(--foreground))" opacity="0.7" />
      </svg>
    </div>
    <style>{`
      @keyframes sd-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      @keyframes sd-shadow-pulse { 0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.18; } 50% { transform: translateX(-50%) scale(0.8); opacity: 0.12; } }
    `}</style>
  </div>
);

const SceneProps = ({ scene, accent }: { scene: string; accent: string }) => {
  // Lightweight, vector-only props per scene type. Kept abstract on purpose
  // so the same shapes work across age ranges and don't need real artwork.
  if (scene === 'home') {
    return (
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute" style={{ left: '8%', bottom: '35%', width: '60px', height: '70px', background: accent, borderRadius: '6px' }} />
        <div className="absolute" style={{ left: '8%', bottom: '60%', width: '0', height: '0', borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: `25px solid ${accent}` }} />
      </div>
    );
  }
  if (scene === 'street_morning' || scene === 'street_afternoon') {
    return (
      <div className="absolute inset-0" aria-hidden>
        {[20, 45, 70].map((l) => (
          <div key={l} className="absolute" style={{ left: `${l}%`, bottom: '35%', width: '40px', height: '50px', background: accent, opacity: 0.7, borderRadius: '4px' }} />
        ))}
        <div className="absolute" style={{ left: '88%', bottom: '35%', width: '50px', height: '70px', background: 'hsl(var(--primary))', opacity: 0.6, borderRadius: '4px 4px 0 0' }} />
      </div>
    );
  }
  if (scene === 'classroom_morning' || scene === 'classroom_midday' || scene === 'classroom_afternoon') {
    return (
      <div className="absolute inset-0" aria-hidden>
        {/* Whiteboard */}
        <div className="absolute" style={{ left: '20%', top: '15%', width: '60%', height: '20%', background: 'hsl(var(--card))', border: `2px solid ${accent}`, borderRadius: '4px' }} />
        {/* Desks */}
        {[15, 40, 65].map((l) => (
          <div key={l} className="absolute" style={{ left: `${l}%`, bottom: '30%', width: '60px', height: '14px', background: accent, opacity: 0.7, borderRadius: '2px' }} />
        ))}
      </div>
    );
  }
  if (scene === 'playground') {
    return (
      <div className="absolute inset-0" aria-hidden>
        {/* Ball */}
        <div className="absolute" style={{ left: '70%', bottom: '32%', width: '14px', height: '14px', background: 'hsl(var(--primary))', borderRadius: '50%' }} />
        {/* Tree */}
        <div className="absolute" style={{ left: '15%', bottom: '35%', width: '8px', height: '40px', background: accent }} />
        <div className="absolute" style={{ left: '8%', bottom: '55%', width: '36px', height: '36px', background: 'hsl(120 35% 55%)', borderRadius: '50%' }} />
      </div>
    );
  }
  if (scene === 'lunch_hall') {
    return (
      <div className="absolute inset-0" aria-hidden>
        {/* Long table */}
        <div className="absolute" style={{ left: '15%', bottom: '32%', width: '70%', height: '10px', background: accent, borderRadius: '2px' }} />
        {/* Trays */}
        {[25, 45, 65].map((l) => (
          <div key={l} className="absolute" style={{ left: `${l}%`, bottom: '36%', width: '24px', height: '6px', background: 'hsl(var(--card))', border: `1px solid ${accent}` }} />
        ))}
      </div>
    );
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/*  Reduced-motion fallback                                                    */
/* -------------------------------------------------------------------------- */

interface SchoolDayListProps {
  saveSlot?: React.ReactNode;
  topPad?: number;
  initial?: SchoolDayFeelingsMap;
  onBack: () => void;
  onContinue: (feelings: SchoolDayFeelingsMap) => void;
}

const SchoolDayList = ({ initial, onBack, onContinue, saveSlot, topPad }: SchoolDayListProps) => {
  const [step, setStep] = useState<'list' | 'review'>('list');
  const [state, setState] = useState<SchoolDayFeelingsMap>(() => {
    const seed = emptySchoolDayFeelings();
    if (initial) for (const [k, v] of Object.entries(initial)) seed[k] = [...(v ?? [])];
    return seed;
  });

  const toggle = (stageId: string, feeling: SchoolDayFeeling) => {
    setState((prev) => {
      const next = { ...prev };
      const arr = [...(next[stageId] ?? [])];
      arr.push(feeling);
      next[stageId] = arr;
      return next;
    });
  };

  const clearStage = (stageId: string) => {
    setState((prev) => ({ ...prev, [stageId]: [] }));
  };

  if (step === 'review') {
    return (
      <SchoolDayReview
        value={state}
        onChange={setState}
        onBack={() => setStep('list')}
        onConfirm={() => onContinue(state)}
        saveSlot={saveSlot}
        topPad={topPad}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-background flex items-start justify-center p-3 sm:p-4 pt-32 sm:pt-32 pb-48" style={topPad ? { paddingTop: topPad } : undefined}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>My school day</CardTitle>
          <CardDescription>
            For each part of the day, tap any feelings that match. You can tap a feeling more than once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SCHOOL_DAY_STAGES.map((stage) => {
            const arr = state[stage.id] ?? [];
            return (
              <div key={stage.id} className="space-y-2 border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <p className="text-xs text-muted-foreground">{stage.hint}</p>
                  </div>
                  {arr.length > 0 && (
                    <button type="button" onClick={() => clearStage(stage.id)} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                  )}
                </div>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="group"
                  aria-label={`Feelings for ${stage.label}`}
                >
                  {SCHOOL_DAY_FEELINGS.map((f) => {
                    const count = arr.filter((x) => x === f.id).length;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggle(stage.id, f.id)}
                        className={`relative h-12 min-h-[44px] rounded-md border-2 text-xs font-medium ${f.buttonClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                        aria-label={`Add one ${f.label} for ${stage.label}. Currently ${count}.`}
                      >
                        <span className="mr-1" aria-hidden>{f.emoji}</span>{f.label}
                        {count > 0 && (
                          <span aria-hidden className="absolute -top-2 -right-2 h-5 min-w-[1.25rem] px-1 rounded-full bg-background text-foreground border border-border text-[10px] font-semibold flex items-center justify-center">{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border p-3 sm:p-4 space-y-2">
        {saveSlot && <div className="max-w-2xl mx-auto">{saveSlot}</div>}
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={() => { setStep('review'); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Review <Check className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Confirmation / review screen                                               */
/* -------------------------------------------------------------------------- */

interface SchoolDayReviewProps {
  value: SchoolDayFeelingsMap;
  onChange: (next: SchoolDayFeelingsMap) => void;
  onBack: () => void;
  onConfirm: () => void;
  saveSlot?: React.ReactNode;
  topPad?: number;
}

/**
 * Read-and-edit summary shown after the animation. Each row = one part of the
 * day with the four feelings and a +/- stepper so the pupil (or supporting
 * adult) can adjust before saving.
 */
const SchoolDayReview = ({ value, onChange, onBack, onConfirm, saveSlot, topPad }: SchoolDayReviewProps) => {
  // When the pupil hasn't tapped a single feeling we don't want to silently
  // record an empty school-day. They must either add at least one feeling
  // or tick "I'd rather not say" to explicitly confirm an empty answer.
  const [confirmedEmpty, setConfirmedEmpty] = useState(false);
  const update = (stageId: string, feeling: SchoolDayFeeling, delta: 1 | -1) => {
    const arr = [...(value[stageId] ?? [])];
    if (delta === 1) {
      arr.push(feeling);
    } else {
      // Remove the last occurrence of this feeling, preserving the rest.
      const idx = arr.lastIndexOf(feeling);
      if (idx >= 0) arr.splice(idx, 1);
    }
    onChange({ ...value, [stageId]: arr });
  };

  const totalTaps = SCHOOL_DAY_STAGES.reduce((n, s) => n + (value[s.id]?.length ?? 0), 0);
  // The Save button is disabled until at least one tap exists OR the pupil
  // has explicitly opted out via the checkbox below.
  const canSave = totalTaps > 0 || confirmedEmpty;

  return (
    <div className="min-h-dvh bg-background flex items-start justify-center p-3 sm:p-4 pt-32 sm:pt-32 pb-[calc(180px+env(safe-area-inset-bottom,0px))] sm:pb-[calc(160px+env(safe-area-inset-bottom,0px))]" style={topPad ? { paddingTop: topPad } : undefined}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Check your feelings</CardTitle>
          <CardDescription>
            Here's what you tapped during your school day. Add or remove anything that doesn't feel right, then save.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {totalTaps === 0 && (
            <div
              className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-3 space-y-2"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-amber-900 dark:text-amber-200">
                You haven't added any feelings yet. Add at least one above by tapping the <strong>+</strong> next to a feeling, or tick the box below to save without any.
              </p>
              <label className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedEmpty}
                  onChange={(e) => setConfirmedEmpty(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <span>I'd rather not record any feelings for my school day.</span>
              </label>
            </div>
          )}

          {SCHOOL_DAY_STAGES.map((stage) => {
            const arr = value[stage.id] ?? [];
            const counts = SCHOOL_DAY_FEELINGS.reduce((acc, f) => {
              acc[f.id] = 0;
              return acc;
            }, {} as Record<SchoolDayFeeling, number>);
            for (const f of arr) counts[f] += 1;
            const stageTotal = arr.length;
            return (
              <div key={stage.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <p className="text-xs text-muted-foreground">{stage.hint}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {stageTotal} tap{stageTotal === 1 ? '' : 's'}
                  </span>
                </div>
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  role="group"
                  aria-label={`Adjust feelings for ${stage.label}`}
                >
                  {SCHOOL_DAY_FEELINGS.map((f) => {
                    const n = counts[f.id];
                    return (
                      <div
                        key={f.id}
                        className={`flex items-center justify-between rounded-md border-2 px-2 py-1.5 ${f.buttonClass} ${n === 0 ? 'opacity-60' : ''}`}
                      >
                        <span className="flex items-center gap-1 text-xs font-medium">
                          <span aria-hidden>{f.emoji}</span>
                          <span>{f.label}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => update(stage.id, f.id, -1)}
                            disabled={n === 0}
                            className="h-8 w-8 sm:h-6 sm:w-6 rounded-full bg-background/80 border border-border flex items-center justify-center disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                            aria-label={`Remove one ${f.label} from ${stage.label}. Currently ${n}.`}
                            aria-controls={`sd-review-${stage.id}-${f.id}`}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease</span>
                          </button>
                          <span
                            id={`sd-review-${stage.id}-${f.id}`}
                            className="text-sm font-semibold w-5 text-center tabular-nums"
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label={`${n} ${f.label} for ${stage.label}`}
                          >
                            {n}
                          </span>
                          <button
                            type="button"
                            onClick={() => update(stage.id, f.id, 1)}
                            className="h-8 w-8 sm:h-6 sm:w-6 rounded-full bg-background/80 border border-border flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                            aria-label={`Add one ${f.label} to ${stage.label}. Currently ${n}.`}
                            aria-controls={`sd-review-${stage.id}-${f.id}`}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase</span>
                          </button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-3 sm:p-4 z-40">
        <div className="max-w-2xl mx-auto space-y-2">
          {saveSlot}
          {canSave && (
            <p className="text-xs sm:text-sm text-center font-medium text-foreground">
              <Sparkles className="inline h-4 w-4 mr-1 text-primary" aria-hidden />
              All set? Tap <strong>Save &amp; continue</strong> to move on to the next part.
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to walk-through
            </Button>
            <Button
              size="lg"
              onClick={onConfirm}
              disabled={!canSave}
              aria-disabled={!canSave}
              className={canSave ? 'shadow-lg ring-2 ring-primary/40 ring-offset-2 ring-offset-background font-semibold' : ''}
              title={canSave ? undefined : 'Add at least one feeling, or tick the "rather not say" box.'}
            >
              Save &amp; continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};