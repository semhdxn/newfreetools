import type { ClassroomLayout } from "@/types/floorplan";
import { SEAT_RADIUS } from "@/data/floorplanLayouts";
import { cn } from "@/components/ui";
import { Board, Door } from "@/components/floorplanFurniture";
import { FloorplanLegend } from "@/components/FloorplanLegend";
import { useResponsiveSvgScale } from "@/hooks/useResponsiveSvgScale";

export type SeatMark = "safe" | "tricky";

interface Props {
  layout: ClassroomLayout;
  selectedSeatIds: Set<string>;
  /** Seats already marked in the *other* pass (shown faded for context). */
  otherPassSeatIds?: Set<string>;
  mark: SeatMark;
  onToggleSeat: (seatId: string) => void;
}

export function FloorplanPicker({
  layout, selectedSeatIds, otherPassSeatIds, mark, onToggleSeat,
}: Props) {
  const { ref, scale } = useResponsiveSvgScale<HTMLDivElement>();
  const frameClass = mark === "safe"
    ? "border-success/60 ring-1 ring-success/30"
    : "border-destructive/60 ring-1 ring-destructive/30";
  return (
    <div
      ref={ref}
      className={cn("w-full overflow-hidden rounded-lg border-2 bg-card", frameClass)}
    >
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${layout.name} classroom layout`}
      >
        <rect x={20} y={20} width={layout.width - 40} height={layout.height - 40} rx={12}
          className="fill-muted/30 stroke-border" strokeWidth={2} />

        {layout.decorations?.map((d, i) =>
          d.kind === "rect" ? (
            <rect key={`dec-${i}`} x={d.x} y={d.y} width={d.width} height={d.height}
              className="fill-muted/40" rx={6} pointerEvents="none" />
          ) : (
            <line key={`dec-${i}`} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2}
              className="stroke-border" strokeWidth={2} pointerEvents="none" />
          ),
        )}

        <Board layout={layout} scale={scale} />
        <Door layout={layout} scale={scale} />

        {layout.seats.map((seat) => {
          const isSelected = selectedSeatIds.has(seat.id);
          const isOther = !!otherPassSeatIds?.has(seat.id);
          const fill = isSelected
            ? mark === "safe" ? "hsl(var(--success))" : "hsl(var(--destructive))"
            : "hsl(var(--card))";
          const stroke = isSelected
            ? mark === "safe" ? "hsl(var(--success))" : "hsl(var(--destructive))"
            : isOther ? "hsl(var(--muted-foreground))" : "hsl(var(--border))";
          return (
            <g
              key={seat.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Seat ${seat.id}`}
              onClick={() => onToggleSeat(seat.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleSeat(seat.id);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <circle
                cx={seat.x} cy={seat.y} r={SEAT_RADIUS}
                fill={fill}
                stroke={stroke}
                strokeDasharray={isOther && !isSelected ? "3 3" : undefined}
                opacity={isOther && !isSelected ? 0.55 : 1}
                strokeWidth={2}
                className={cn("transition-colors", !isSelected && "hover:fill-accent")}
              />
              {isSelected && mark === "safe" && (
                <path d={`M ${seat.x - 7} ${seat.y} l 5 5 l 9 -10`}
                  className="stroke-success-foreground" strokeWidth={2.5}
                  fill="none" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
              )}
              {isSelected && mark === "tricky" && (
                <g pointerEvents="none">
                  <line x1={seat.x - 6} y1={seat.y - 6} x2={seat.x + 6} y2={seat.y + 6}
                    className="stroke-destructive-foreground" strokeWidth={2.5} strokeLinecap="round" />
                  <line x1={seat.x + 6} y1={seat.y - 6} x2={seat.x - 6} y2={seat.y + 6}
                    className="stroke-destructive-foreground" strokeWidth={2.5} strokeLinecap="round" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <FloorplanLegend
        mark={mark}
        showOtherPass={!!otherPassSeatIds && otherPassSeatIds.size > 0}
      />
    </div>
  );
}