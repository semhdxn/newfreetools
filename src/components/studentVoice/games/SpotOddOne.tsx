import { useEffect, useState } from 'react';

type Variation = 'larger' | 'lighter' | 'tilted';

interface Round { oddIndex: number; variation: Variation; hue: number; key: number; }

const newRound = (key: number): Round => ({
  key,
  oddIndex: Math.floor(Math.random() * 9),
  variation: (['larger', 'lighter', 'tilted'] as Variation[])[Math.floor(Math.random() * 3)],
  hue: Math.round(180 + Math.random() * 140),
});

/**
 * Spot the Odd One.
 * 3×3 grid of soft circles; one is subtly different (larger, lighter, or
 * tilted slightly). Tap it → quick celebrate flash → new round. After 10s
 * without a tap the odd one gently pulses to hint. After 3 successful
 * rounds (or 30s safety cap) calls onDone.
 */
export const SpotOddOne = ({ onDone }: { onDone: () => void }) => {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [round, setRound] = useState<Round>(() => newRound(0));
  const [completed, setCompleted] = useState(0);
  const [hint, setHint] = useState(false);
  const [flash, setFlash] = useState(false);

  // Hint timer: pulse the odd one after 10s of no answer.
  useEffect(() => {
    setHint(false);
    const t = window.setTimeout(() => setHint(true), 10_000);
    return () => window.clearTimeout(t);
  }, [round.key]);

  // Done after 3 rounds.
  useEffect(() => {
    if (completed >= 3) {
      const t = window.setTimeout(onDone, 500);
      return () => window.clearTimeout(t);
    }
  }, [completed, onDone]);

  // Safety cap.
  useEffect(() => {
    const t = window.setTimeout(onDone, 30_000);
    return () => window.clearTimeout(t);
  }, [onDone]);

  const handleTap = (i: number) => {
    if (i !== round.oddIndex) return; // gentle: wrong taps do nothing
    setFlash(true);
    setCompleted((n) => n + 1);
    window.setTimeout(() => {
      setFlash(false);
      setRound((r) => newRound(r.key + 1));
    }, 350);
  };

  return (
    <div className="w-full">
      <div
        className={`relative grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-xl border border-border bg-muted/30 transition-colors duration-200
          ${flash ? 'bg-emerald-100/60 dark:bg-emerald-900/30' : ''}`}
      >
        {Array.from({ length: 9 }).map((_, i) => {
          const isOdd = i === round.oddIndex;
          // Base circle styling — kept identical so the variation is the
          // only signal. The variations are deliberately subtle so it feels
          // like noticing rather than failing.
          const baseSize = 56;
          const size = isOdd && round.variation === 'larger' ? baseSize + 8 : baseSize;
          const sat = isOdd && round.variation === 'lighter' ? 60 : 75;
          const light = isOdd && round.variation === 'lighter' ? 80 : 65;
          const rotate = isOdd && round.variation === 'tilted' ? 18 : 0;
          return (
            <button
              key={`${round.key}-${i}`}
              type="button"
              aria-label={isOdd ? 'The different one' : 'A shape'}
              onClick={() => handleTap(i)}
              className="flex aspect-square min-h-[64px] items-center justify-center bg-transparent border-0 p-0"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              <span
                aria-hidden
                className="rounded-full border-2 transition-transform"
                style={{
                  width: size,
                  height: size,
                  background: `hsl(${round.hue} ${sat}% ${light}%)`,
                  borderColor: `hsl(${round.hue} ${sat}% ${Math.max(40, light - 25)}%)`,
                  transform: `rotate(${rotate}deg)`,
                  animation: isOdd && hint && !reduce
                    ? 'svOddPulse 1200ms ease-in-out infinite'
                    : undefined,
                }}
              />
            </button>
          );
        })}
        <style>{`
          @keyframes svOddPulse {
            0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.0); transform: scale(1) rotate(var(--r,0deg)); }
            50%      { box-shadow: 0 0 0 10px hsl(var(--primary) / 0.25); transform: scale(1.06); }
          }
        `}</style>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Tap the shape that's a little different · {completed} / 3
      </p>
    </div>
  );
};
