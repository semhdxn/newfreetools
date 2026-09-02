import type { SeatMark } from "@/components/FloorplanPicker";

interface Props {
  /** When present, adds seat-colour swatches for the current pass. */
  mark?: SeatMark;
  /** When true (tricky pass), show the faded "picked earlier as good" swatch. */
  showOtherPass?: boolean;
}

/**
 * Inline legend below every classroom floor plan. Explains Board / Door and,
 * when in a picker pass, the seat swatches so the young person can see at a glance
 * what a green tick vs a red X vs a faded ring means.
 */
export function FloorplanLegend({ mark, showOtherPass }: Props = {}) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground"
      aria-label="Floor plan legend"
    >
      {mark === "safe" && (
        <div className="flex items-center gap-1.5">
          <SeatSwatch fill="hsl(var(--success))" glyph="tick" />
          <span>
            <strong className="font-semibold text-foreground">Good seat</strong>{" "}
            — feels calm & ready to learn
          </span>
        </div>
      )}
      {mark === "tricky" && (
        <div className="flex items-center gap-1.5">
          <SeatSwatch fill="hsl(var(--destructive))" glyph="cross" />
          <span>
            <strong className="font-semibold text-foreground">Tricky seat</strong>{" "}
            — hard to focus or feel calm
          </span>
        </div>
      )}
      {showOtherPass && mark === "tricky" && (
        <div className="flex items-center gap-1.5">
          <SeatSwatch fill="hsl(var(--card))" dashed />
          <span>
            <strong className="font-semibold text-foreground">Picked earlier</strong>{" "}
            — your good seats (faded)
          </span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-5 rounded-sm bg-foreground" aria-hidden />
        <span>
          <strong className="font-semibold text-foreground">Board</strong>{" "}
          — front of room
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-4 rounded-sm border border-accent-foreground bg-accent"
          aria-hidden
        />
        <span>
          <strong className="font-semibold text-foreground">Door</strong>{" "}
          — entry to the classroom
        </span>
      </div>
    </div>
  );
}

function SeatSwatch({
  fill,
  glyph,
  dashed,
}: {
  fill: string;
  glyph?: "tick" | "cross";
  dashed?: boolean;
}) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <circle
        cx={8}
        cy={8}
        r={6}
        fill={fill}
        stroke={dashed ? "hsl(var(--muted-foreground))" : fill}
        strokeWidth={1.5}
        strokeDasharray={dashed ? "2 2" : undefined}
        opacity={dashed ? 0.55 : 1}
      />
      {glyph === "tick" && (
        <path
          d="M 5 8 l 2 2 l 4 -4"
          stroke="hsl(var(--success-foreground))"
          strokeWidth={1.75}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {glyph === "cross" && (
        <g
          stroke="hsl(var(--destructive-foreground))"
          strokeWidth={1.75}
          strokeLinecap="round"
        >
          <line x1={5.5} y1={5.5} x2={10.5} y2={10.5} />
          <line x1={10.5} y1={5.5} x2={5.5} y2={10.5} />
        </g>
      )}
    </svg>
  );
}