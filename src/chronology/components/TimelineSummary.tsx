import { forwardRef } from "react";
import { Ban, GraduationCap, Home, Route, Users } from "lucide-react";
import { summary } from "@/chronology/lib/insights";
import { WELLBEING_OPTIONS } from "@/chronology/lib/wellbeing";
import { displayLabel, formatDate, todayISO, type Person, type TimelineEvent } from "@/chronology/lib/timeline";

interface Props { person: Person; events: TimelineEvent[] }

/** End summary: totals, distance moved, longest settled home, busiest year, moves per year, per-stage breakdown. */
export const TimelineSummary = forwardRef<HTMLDivElement, Props>(function TimelineSummary({ person, events }, ref) {
  const s = summary(events, person.dob);
  const years = [...s.movesPerYear.keys()];
  const minY = years.length ? Math.min(...years) : 0, maxY = years.length ? Math.max(...years) : 0;
  const maxMoves = Math.max(1, ...s.movesPerYear.values());
  const stat = [
    { I: Home, v: s.totals.homes, l: "Living arrangements" },
    { I: Route, v: `${s.totals.miles} mi`, l: `Moved (${s.moves.length} moves)` },
    { I: GraduationCap, v: s.totals.schools, l: "Schools" },
    { I: Ban, v: s.totals.suspensions, l: "Suspensions / exclusions" },
    { I: Users, v: s.totals.professionals, l: "Professional involvements" },
  ];

  return (
    <div ref={ref} className="w-[1060px] max-w-full bg-card p-8 text-card-foreground">
      <div className="mb-4 border-b-2 border-foreground pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Summary</p>
        <h2 className="text-xl font-semibold">{person.label || "—"}</h2>
        <p className="text-xs text-muted-foreground">Prepared by: {person.preparedBy || "—"} · Date prepared: {formatDate(todayISO(), "day")} · {events.length} events</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stat.map(({ I, v, l }) => (
          <div key={l} className="rounded-lg border bg-muted/50 p-3">
            <I size={16} className="text-primary" />
            <div className="mt-1 text-2xl font-bold tabular-nums">{v}</div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs"><b>Wellbeing (practitioner judgement):</b>{" "}
        {WELLBEING_OPTIONS.map((o) => ({ o, n: events.filter((e) => e.wellbeingImpact === o.value).length })).filter((x) => x.n).map((x) => `${x.n} ${x.o.label.toLowerCase()}`).join(" · ") || "none recorded"}
        {" · "}{events.filter((e) => !e.wellbeingImpact).length} unassessed</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-3 text-sm">
          <h3 className="mb-1 font-semibold">Key points</h3>
          <p><span className="text-muted-foreground">Longest settled home: </span>
            {s.longest ? `${displayLabel(s.longest.e)} (${s.longest.years.toFixed(1)} years)` : "—"}</p>
          <p><span className="text-muted-foreground">Busiest year: </span>{s.busiest ? `${s.busiest.year} (${s.busiest.count} events)` : "—"}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Miles are straight-line between known towns, not road distance.</p>
        </div>
        <div className="rounded-lg border p-3">
          <h3 className="mb-2 text-sm font-semibold">Home moves per year</h3>
          {years.length ? (
            <div className="flex h-24 items-end gap-1">
              {Array.from({ length: maxY - minY + 1 }, (_, i) => minY + i).map((y) => {
                const n = s.movesPerYear.get(y) ?? 0;
                return (
                  <div key={y} className="flex flex-1 flex-col items-center justify-end gap-0.5" title={`${y}: ${n}`}>
                    {n > 0 && <span className="text-[9px] font-bold">{n}</span>}
                    <div className="w-full rounded-t" style={{ height: `${(n / maxMoves) * 64}px`, backgroundColor: "var(--cat-living)" }} />
                    <span className="text-[8px] text-muted-foreground">{String(y).slice(2)}</span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-xs text-muted-foreground">No moves recorded.</p>}
        </div>
      </div>

      {s.stages.length > 0 && (
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground"><tr><th className="py-1">Stage</th><th>Events</th><th>Home moves</th><th>Schools</th><th>Suspensions / exclusions</th></tr></thead>
          <tbody>{s.stages.map((st) => (
            <tr key={st.name} className="border-t"><td className="py-1 font-medium">{st.name}</td><td>{st.events}</td><td>{st.moves}</td><td>{st.schools}</td><td>{st.suspensions}</td></tr>
          ))}</tbody>
        </table>
      )}

      <p className="mt-6 border-t pt-2 text-[10px] text-muted-foreground">
        Confidential. Contains sensitive personal information. Handle in line with your organisation's data protection policy.
      </p>
    </div>
  );
});
