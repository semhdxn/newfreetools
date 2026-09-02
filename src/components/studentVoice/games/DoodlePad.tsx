import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { Eraser } from 'lucide-react';

/**
 * Doodle Pad.
 * A small SVG canvas the pupil can finger-paint on. Strokes live only in
 * component state — nothing is uploaded or saved. "Clear" wipes the pad.
 */
export const DoodlePad = () => {
  const [strokes, setStrokes] = useState<string[]>([]);
  const drawing = useRef(false);
  const current = useRef<string>('');
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => () => { drawing.current = false; }, []);

  const pt = (e: React.PointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };

  return (
    <div className="w-full space-y-2">
      <svg
        ref={svgRef}
        viewBox="0 0 100 60"
        className="w-full h-[280px] rounded-xl border-2 border-dashed border-border bg-card touch-none"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drawing.current = true;
          current.current = `M ${pt(e)}`;
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          current.current += ` L ${pt(e)}`;
          // Force re-render by writing back as the in-progress stroke.
          setStrokes((prev) => {
            const next = [...prev];
            next[next.length] = current.current;
            return next.slice(0, prev.length).concat(current.current);
          });
        }}
        onPointerUp={() => { drawing.current = false; current.current = ''; }}
        onPointerLeave={() => { drawing.current = false; current.current = ''; }}
      >
        {strokes.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">Doodle anything you like — it's just for fun.</p>
        <Button variant="ghost" size="sm" onClick={() => setStrokes([])} className="min-h-[44px]">
          <Eraser className="h-4 w-4 mr-1" /> Clear
        </Button>
      </div>
    </div>
  );
};