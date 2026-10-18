import { milesBetween } from "@/chronology/lib/locations";
import { todayISO, yearFrac, type TimelineEvent } from "@/chronology/lib/timeline";

/** Point events of these types are drawn as small marker icons on the lane, stacked per month. */
const MARKER_TYPES = ["suspension", "exclusion", "missing episode", "police involvement", "self-harm incident", "hospital admission", "attendance concern"];
export const isMarker = (e: TimelineEvent) => !e.end && !e.ongoing && MARKER_TYPES.includes(e.type.trim().toLowerCase());

const t = (e: TimelineEvent) => e.type.trim().toLowerCase();
const isSchool = (e: TimelineEvent) => e.category === "education" && (t(e) === "started school" || t(e) === "changed school");
const isSusp = (e: TimelineEvent) => t(e) === "suspension" || t(e) === "exclusion";

export interface Move { from: TimelineEvent; to: TimelineEvent; miles: number | null }

/** Consecutive living arrangements, with straight-line miles when both towns are known. */
export function homeMoves(events: TimelineEvent[]): Move[] {
  const homes = events.filter((e) => e.category === "living").sort((a, b) => a.start.localeCompare(b.start));
  return homes.slice(1).map((to, i) => {
    const from = homes[i]!;
    return { from, to, miles: from.location && to.location ? milesBetween(from.location, to.location) : null };
  });
}

export interface Totals { homes: number; schools: number; suspensions: number; professionals: number; miles: number }

export function totalsUpTo(events: TimelineEvent[], moves: Move[], untilISO: string): Totals {
  const upto = events.filter((e) => e.start <= untilISO);
  return {
    homes: upto.filter((e) => e.category === "living").length,
    schools: upto.filter(isSchool).length,
    suspensions: upto.filter(isSusp).length,
    professionals: upto.filter((e) => e.category === "services").length,
    miles: moves.filter((m) => m.to.start <= untilISO).reduce((s, m) => s + (m.miles ?? 0), 0),
  };
}

export function summary(events: TimelineEvent[], dob: string) {
  const moves = homeMoves(events);
  const totals = totalsUpTo(events, moves, "9999-12-31");
  const today = todayISO();

  const homes = events.filter((e) => e.category === "living").sort((a, b) => a.start.localeCompare(b.start));
  let longest: { e: TimelineEvent; years: number } | null = null;
  homes.forEach((e, i) => {
    const end = e.ongoing ? today : e.end || homes[i + 1]?.start;
    if (!end) return;
    const years = yearFrac(end) - yearFrac(e.start);
    if (!longest || years > longest.years) longest = { e, years };
  });

  const perYear = new Map<number, number>();
  events.forEach((e) => { const y = Number(e.start.slice(0, 4)); perYear.set(y, (perYear.get(y) ?? 0) + 1); });
  let busiest: { year: number; count: number } | null = null;
  perYear.forEach((count, year) => { if (!busiest || count > busiest.count) busiest = { year, count }; });

  const movesPerYear = new Map<number, number>();
  moves.forEach((m) => { const y = Number(m.to.start.slice(0, 4)); movesPerYear.set(y, (movesPerYear.get(y) ?? 0) + 1); });

  const STAGES = [
    { from: 0, to: 5, name: "Early years" }, { from: 5, to: 11, name: "Primary" }, { from: 11, to: 16, name: "Secondary" },
    { from: 16, to: 18, name: "Post-16" }, { from: 18, to: 26, name: "Adulthood" },
  ];
  const dobF = dob ? yearFrac(dob) : null;
  const stages = dobF === null ? [] : STAGES.map((s) => {
    const inS = (iso: string) => { const a = yearFrac(iso) - dobF; return a >= s.from && a < s.to; };
    const evs = events.filter((e) => inS(e.start));
    return {
      name: s.name,
      events: evs.length,
      moves: moves.filter((m) => inS(m.to.start)).length,
      schools: evs.filter(isSchool).length,
      suspensions: evs.filter(isSusp).length,
    };
  }).filter((s) => s.events > 0);

  return { moves, totals, longest: longest as { e: TimelineEvent; years: number } | null, busiest: busiest as { year: number; count: number } | null, movesPerYear, stages };
}
