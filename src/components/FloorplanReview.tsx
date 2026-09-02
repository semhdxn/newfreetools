import type { ClassroomLayout } from "@/types/floorplan";
import { SEAT_RADIUS } from "@/data/floorplanLayouts";
import { Board, Door } from "@/components/floorplanFurniture";
import { FloorplanLegend } from "@/components/FloorplanLegend";
import { useResponsiveSvgScale } from "@/hooks/useResponsiveSvgScale";

interface Props {
  layout: ClassroomLayout;
  safeSeatIds: Set<string>;
  trickySeatIds: Set<string>;
}

/** Read-only render of a layout with the young person's safe / tricky marks. */
export function FloorplanReview({ layout, safeSeatIds, trickySeatIds }: Props) {
  const { ref, scale } = useResponsiveSvgScale<HTMLDivElement>();
  return (
    <div ref={ref} className="w-full overflow-hidden rounded-lg border bg-card">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${layout.name} marked layout`}
      >
        <rect x={20} y={20} width={layout.width - 40} height={layout.height - 40} rx={12}
          className="fill-muted/30 stroke-border" strokeWidth={2} />
        {layout.decorations?.map((d, i) =>
          d.kind === "rect" ? (
            <rect key={`dec-${i}`} x={d.x} y={d.y} width={d.width} height={d.height}
              className="fill-muted/40" rx={6} />
          ) : (
            <line key={`dec-${i}`} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2}
              className="stroke-border" strokeWidth={2} />
          ),
        )}
        <Board layout={layout} scale={scale} />
        <Door layout={layout} scale={scale} />

        {layout.seats.map((seat) => {
          const safe = safeSeatIds.has(seat.id);
          const tricky = trickySeatIds.has(seat.id);
          const both = safe && tricky;
          const fill = both
            ? "hsl(var(--accent))"
            : safe
              ? "hsl(var(--success))"
              : tricky
                ? "hsl(var(--destructive))"
                : "hsl(var(--card))";
          const stroke = both
            ? "hsl(var(--accent-foreground))"
            : safe
              ? "hsl(var(--success))"
              : tricky
                ? "hsl(var(--destructive))"
                : "hsl(var(--border))";
          return (
            <g key={seat.id}>
              <circle cx={seat.x} cy={seat.y} r={SEAT_RADIUS}
                fill={fill} stroke={stroke} strokeWidth={2} />
              {safe && !tricky && (
                <path d={`M ${seat.x - 7} ${seat.y} l 5 5 l 9 -10`}
                  className="stroke-success-foreground" strokeWidth={2.5}
                  fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {tricky && !safe && (
                <g>
                  <line x1={seat.x - 6} y1={seat.y - 6} x2={seat.x + 6} y2={seat.y + 6}
                    className="stroke-destructive-foreground" strokeWidth={2.5} strokeLinecap="round" />
                  <line x1={seat.x + 6} y1={seat.y - 6} x2={seat.x - 6} y2={seat.y + 6}
                    className="stroke-destructive-foreground" strokeWidth={2.5} strokeLinecap="round" />
                </g>
              )}
              {both && (
                <text x={seat.x} y={seat.y + 4} textAnchor="middle"
                  className="fill-accent-foreground text-[10px] font-bold">!</text>
              )}
            </g>
          );
        })}
      </svg>
      <FloorplanLegend />
    </div>
  );
}