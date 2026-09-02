import { useEffect, useMemo, useState } from 'react';

interface Bubble { id: number; x: number; size: number; delay: number; dur: number; hue: number; }

/**
 * Pop the Bubbles.
 * 12 bubbles drift up across a soft background; tap to pop.
 * If a bubble reaches the top without being popped it gently fades out and
 * respawns at the bottom in a new spot — this avoids the old "self-pop"
 * effect where an `infinite` CSS animation would teleport the bubble back
 * down mid-screen and look like an unwanted pop.
 * Calls onDone when all popped or after a 30s safety timeout.
 * Reduced-motion users see static bubbles they can still tap.
 */
export const PopBubbles = ({ onDone }: { onDone: () => void }) => {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const initialBubbles = useMemo<Bubble[]>(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: Math.round(8 + Math.random() * 84),
        size: Math.round(36 + Math.random() * 36),
        delay: Math.round(Math.random() * 4000),
        // Brisk float — fast enough to feel lively but still tappable.
        dur: Math.round(5000 + Math.random() * 2500),
        hue: Math.round(180 + Math.random() * 120),
      })),
    [],
  );
  const [bubbles, setBubbles] = useState<Bubble[]>(initialBubbles);
  const [popped, setPopped] = useState<Set<number>>(() => new Set());

  /**
   * Light haptic "tick" on a successful pop. Uses the Vibration API where
   * supported (Android Chrome/Firefox; iOS Safari ignores it silently). A
   * very short 10ms pulse reads as a tactile confirmation without being
   * intrusive — long enough to feel, short enough to avoid being annoying
   * during a rapid pop streak. We also respect prefers-reduced-motion as a
   * proxy for "minimise sensory effects" and skip the buzz in that case.
   */
  const buzz = () => {
    if (reduce) return;
    if (typeof navigator === 'undefined') return;
    const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
    try { nav.vibrate?.(10); } catch { /* not supported — silent no-op */ }
  };

  useEffect(() => {
    if (popped.size >= bubbles.length) {
      const t = window.setTimeout(onDone, 400);
      return () => window.clearTimeout(t);
    }
  }, [popped, bubbles.length, onDone]);

  useEffect(() => {
    const t = window.setTimeout(onDone, 30_000);
    return () => window.clearTimeout(t);
  }, [onDone]);

  /** When a bubble finishes a float without being popped, respawn it at a
   *  new x position with a fresh hue. This keeps the field of bubbles full
   *  but never produces the abrupt mid-air "pop-and-reset" that the old
   *  `infinite` keyframe caused. */
  const respawn = (id: number) => {
    setBubbles((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              x: Math.round(8 + Math.random() * 84),
              size: Math.round(36 + Math.random() * 36),
              dur: Math.round(5000 + Math.random() * 2500),
              hue: Math.round(180 + Math.random() * 120),
              // Force React to remount the element via key change downstream
              // by bumping the delay, which also restarts the keyframe from 0.
              delay: 0,
            }
          : b,
      ),
    );
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-gradient-to-b from-sky-100 to-sky-50 dark:from-slate-800 dark:to-slate-900" style={{ height: 320 }}>
      <style>{`
        /* Bubble starts just below the container, floats up past the top, and
           fades out at the very end so the disappearance reads as "drifted
           away" rather than "popped". Runs once per spawn. */
        @keyframes svPopFloat {
          0%   { transform: translateY(110%); opacity: 0; }
          8%   { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(-130%); opacity: 0; }
        }
      `}</style>
      {bubbles.map((b) => {
        const isPopped = popped.has(b.id);
        // WCAG 2.5.5 recommends a minimum 44×44px tap target. Bubbles can be
        // as small as 36px, so we render an invisible padded hit-area button
        // that's always at least 56×56px (a comfy thumb target on small
        // phones) and draw the visible bubble inside it. The visual size is
        // unchanged, but taps on the area immediately around the bubble now
        // count too.
        // Larger hit area for more reliable touch detection on small
        // fingers and fast-moving bubbles.
        const hit = Math.max(b.size + 36, 72);
        const inset = (hit - b.size) / 2;
        return (
          <button
            // Key includes the (mutable) delay so a respawn restarts the
            // animation cleanly instead of CSS interpolating mid-flight.
            key={`${b.id}-${b.delay}-${b.x}`}
            type="button"
            aria-label="Pop bubble"
            onPointerDown={(e) => {
              // Capture the pointer so subsequent movement (the bubble
              // drifting under the finger) still counts as a hit even if
              // the visual leaves the original press point.
              try { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); } catch { /* noop */ }
              if (!popped.has(b.id)) buzz();
              setPopped((prev) => { const n = new Set(prev); n.add(b.id); return n; });
            }}
            onPointerEnter={(e) => {
              // If the user is dragging across the field, pop bubbles they
              // sweep over (only while a pointer button is pressed).
              if (e.buttons === 0) return;
              if (popped.has(b.id)) return;
              buzz();
              setPopped((prev) => { const n = new Set(prev); n.add(b.id); return n; });
            }}
            onAnimationEnd={() => { if (!isPopped) respawn(b.id); }}
            disabled={isPopped}
            className="absolute flex items-center justify-center bg-transparent border-0 p-0 m-0"
            style={{
              left: `${b.x}%`,
              bottom: reduce ? `${10 + (b.id * 7) % 70}%` : 0,
              width: hit,
              height: hit,
              // Offset so the visible bubble centres on the original x while
              // the larger hit area extends symmetrically around it.
              marginLeft: -inset,
              marginBottom: -inset,
              opacity: isPopped ? 0 : 1,
              transform: isPopped ? 'scale(1.4)' : undefined,
              transition: 'opacity 250ms ease, transform 250ms ease',
              // One float per spawn; `onAnimationEnd` triggers a respawn for
              // any bubble that wasn't popped. No more abrupt teleport-pops.
              // Once popped we drop the keyframe animation entirely — a
              // running CSS `animation` continuously drives `opacity`/
              // `transform` every frame, which otherwise silently overrides
              // the inline "popped" style above and makes the tap look like
              // it did nothing (the bubble just keeps floating until its
              // animation ends on its own). Removing it hands control back
              // to the plain inline style + transition, so the pop is
              // actually visible immediately.
              animation: reduce || isPopped ? undefined : `svPopFloat ${b.dur}ms linear ${b.delay}ms 1 forwards`,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              cursor: isPopped ? 'default' : 'pointer',
            }}
          >
            {/* The visible bubble — purely decorative; the surrounding
                button captures the tap. pointer-events:none so the visual
                never swallows a click that should reach the button. */}
            <span
              aria-hidden
              className="rounded-full border-2 pointer-events-none"
              style={{
                width: b.size,
                height: b.size,
                borderColor: `hsl(${b.hue} 70% 60% / 0.6)`,
                background: `radial-gradient(circle at 30% 30%, hsl(${b.hue} 90% 90% / 0.95), hsl(${b.hue} 70% 70% / 0.45))`,
              }}
            />
          </button>
        );
      })}
      <p className="absolute bottom-2 left-2 text-[11px] text-muted-foreground bg-background/70 backdrop-blur px-2 py-0.5 rounded">
        Pop the bubbles · {bubbles.length - popped.size} left
      </p>
    </div>
  );
};