import { useEffect, useRef, useState } from 'react';

/**
 * Glow Trail.
 * Pure sensory play: drag a finger across a dark canvas and a soft warm
 * glow follows, fading over ~1.5s. No goal, no score. The Continue button
 * (owned by BrainBreak) becomes available after either:
 *   - 8s of any pointer interaction, or
 *   - 15s without interaction (so non-tactile pupils aren't stuck).
 *
 * `prefers-reduced-motion` users see static dots placed where they tap
 * instead of the animated fading trail.
 */
export const GlowTrail = ({ onDone }: { onDone: () => void }) => {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const drawingRef = useRef(false);
  const interactedRef = useRef(false);
  const [done, setDone] = useState(false);

  // Interactive trail: fade the whole canvas slightly each frame so older
  // strokes dim out naturally. Cheaper than tracking individual points.
  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const tick = () => {
      // Fade existing pixels by drawing a translucent dark rect over them.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [reduce]);

  // Auto-enable Continue: 8s of interaction OR 15s idle.
  useEffect(() => {
    const idle = window.setTimeout(() => setDone(true), 15_000);
    return () => window.clearTimeout(idle);
  }, []);

  const markInteracted = () => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    window.setTimeout(() => setDone(true), 8_000);
  };

  // When `done` flips true, surface it to the parent BrainBreak host.
  useEffect(() => { if (done) onDone(); }, [done, onDone]);

  const stamp = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Warm gradient brush — radial fade from gold core to transparent.
    const r = reduce ? 14 : 22;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0,   'hsla(45, 100%, 75%, 0.95)');
    g.addColorStop(0.5, 'hsla(20, 100%, 65%, 0.55)');
    g.addColorStop(1,   'hsla(15, 100%, 55%, 0.0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-xl border border-border bg-slate-900 touch-none select-none"
      style={{ height: 320 }}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        drawingRef.current = true;
        markInteracted();
        stamp(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!drawingRef.current) return;
        stamp(e.clientX, e.clientY);
      }}
      onPointerUp={() => { drawingRef.current = false; }}
      onPointerLeave={() => { drawingRef.current = false; }}
      role="application"
      aria-label="Drag to leave a glowing trail"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <p className="pointer-events-none absolute bottom-2 left-2 text-[11px] text-slate-200/80 bg-slate-900/60 backdrop-blur px-2 py-0.5 rounded">
        Drag your finger to leave a glow
      </p>
    </div>
  );
};
