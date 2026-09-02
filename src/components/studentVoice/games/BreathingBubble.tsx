import { useEffect, useState } from 'react';

/**
 * Calm Breathing Bubble.
 * A circle gently inflates ("breathe in" 4s) and deflates ("breathe out" 6s)
 * for three cycles, then signals completion. Tap anywhere to skip ahead.
 * Pure CSS animation — no external libs. Honours `prefers-reduced-motion`
 * by holding the bubble at a neutral size and only changing the label.
 */
export const BreathingBubble = ({ onDone }: { onDone: () => void }) => {
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [cycle, setCycle] = useState(0);
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const inMs = 4000;
    const outMs = 6000;
    const t = window.setTimeout(
      () => {
        if (phase === 'in') setPhase('out');
        else {
          const next = cycle + 1;
          if (next >= 3) onDone();
          else { setCycle(next); setPhase('in'); }
        }
      },
      phase === 'in' ? inMs : outMs,
    );
    return () => window.clearTimeout(t);
  }, [phase, cycle, onDone]);

  const size = reduce ? 180 : phase === 'in' ? 240 : 90;
  return (
    <button
      type="button"
      onClick={onDone}
      aria-label="Breathing bubble — tap to continue"
      className="w-full flex flex-col items-center justify-center gap-3 py-6 select-none"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="relative h-[260px] w-[260px] flex items-center justify-center">
        <div
          aria-hidden
          className="rounded-full bg-primary/20 border-2 border-primary/40"
          style={{
            width: size,
            height: size,
            transition: reduce ? 'none' : `width ${phase === 'in' ? 4 : 6}s ease-in-out, height ${phase === 'in' ? 4 : 6}s ease-in-out`,
          }}
        />
      </div>
      <p className="text-lg font-medium text-foreground">
        {phase === 'in' ? 'Breathe in…' : 'Breathe out…'}
      </p>
      <p className="text-xs text-muted-foreground">Round {cycle + 1} of 3</p>
    </button>
  );
};