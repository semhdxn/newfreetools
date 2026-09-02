import { useEffect, useRef, useState } from "react";

/**
 * Returns a scale factor that grows as the observed element renders
 * smaller in CSS pixels. Used to keep "furniture" inside an SVG
 * (e.g. the board / door on a classroom floor plan) visually prominent
 * even when the floor plan itself is shrunk on narrow viewports.
 *
 * scale = clamp(min, baselineWidth / renderedWidth, max)
 *
 * - At or above the baseline width → returns 1 (no enlargement).
 * - Below the baseline → returns a scale > 1 to compensate, so a piece
 *   drawn at user-units N will visually look at least as big as it would
 *   at the baseline render size.
 */
export function useResponsiveSvgScale<T extends HTMLElement>(
  baselineWidth = 640,
  min = 1,
  max = 1.8,
) {
  const ref = useRef<T | null>(null);
  const [scale, setScale] = useState(min);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w <= 0) continue;
        const next = Math.min(max, Math.max(min, baselineWidth / w));
        setScale((prev) => (Math.abs(prev - next) > 0.02 ? next : prev));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [baselineWidth, min, max]);

  return { ref, scale };
}
