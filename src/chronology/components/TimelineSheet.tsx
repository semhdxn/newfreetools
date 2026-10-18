import { forwardRef } from "react";
import { CATEGORIES, catById, displayLabel, formatDate, todayISO, yearFrac, type Person, type TimelineEvent } from "@/chronology/lib/timeline";
import { categoryIcon, iconFor } from "@/chronology/lib/icons";
import { homeMoves, isMarker, totalsUpTo } from "@/chronology/lib/insights";
import { ArrowRight, Ban, GraduationCap, Home, Route, Star, Users } from "lucide-react";
import { WELLBEING_OPTIONS, reportCounts, wellbeingOf } from "@/chronology/lib/wellbeing";

export type TimelineView = "lanes" | "story";

const PX_PER_YEAR = 120;
const ROW_H = 34;
const LANE_LABEL_W = 180;
const AXIS_H = 44;
export const AGE_BANDS = [
  { from: 0, to: 5, name: "Early years", tone: "family" },
  { from: 5, to: 11, name: "Primary", tone: "education" },
  { from: 11, to: 16, name: "Secondary", tone: "living" },
  { from: 16, to: 18, name: "Post-16", tone: "services" },
  { from: 18, to: 26, name: "Adulthood", tone: "significant" },
];

interface Props {
  person: Person;
  events: TimelineEvent[];
  hidden: Set<string>;
  view: TimelineView;
  hideLow?: boolean;
  /** Year range [from, to) in fractional years to focus on. */
  focus?: [number, number] | null;
  /** Headers-only layout for a one-page overview. */
  simple?: boolean;
  onSelect?: (e: TimelineEvent) => void;
}

const col = (id: string) => `var(--cat-${id})`;
const tint = (id: string, pct: number) => `color-mix(in oklab, var(--cat-${id}) ${pct}%, hsl(var(--card)))`;
const PERIOD_CATS = ["living", "education"];
const HUE_SHIFT = [0, 35, -35, 70, -70, 105, -105];
/** Same type → same shade, wherever it appears. */
const typeColour = (e: TimelineEvent) => {
  const idx = catById(e.category).types.findIndex((t) => t.toLowerCase() === e.type.trim().toLowerCase());
  const shift = HUE_SHIFT[(idx < 0 ? 0 : idx) % HUE_SHIFT.length] ?? 0;
  return `oklch(from var(--cat-${e.category}) l c calc(h + ${shift}))`;
};

const dateText = (e: TimelineEvent) =>
  `${e.approximate ? "c. " : ""}${formatDate(e.start, e.startPrecision)}${e.ongoing ? " – ongoing" : e.end ? ` – ${formatDate(e.end, e.endPrecision)}` : ""}`;

function Badge({ e, size = 26 }: { e: TimelineEvent; size?: number }) {
  const Icon = iconFor(e.category, e.type);
  const high = e.significance === "high";
  const s = high ? size + 6 : e.significance === "low" ? size - 6 : size;
  return (
    <span
      className={`relative z-10 inline-flex shrink-0 items-center justify-center rounded-full ${e.approximate ? "border-2 border-dashed" : "border-2"}`}
      style={{
        width: s, height: s,
        backgroundColor: e.approximate ? "hsl(var(--card))" : col(e.category),
        borderColor: col(e.category),
        color: e.approximate ? col(e.category) : "hsl(var(--card))",
        boxShadow: high ? "0 0 0 2px hsl(var(--card)), 0 0 0 4px hsl(var(--primary)), var(--shadow-badge)" : undefined,
      }}
    >
      <Icon size={Math.round(s * 0.55)} strokeWidth={2.2} />
      {high && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Star size={8} fill="currentColor" strokeWidth={0} />
        </span>
      )}
    </span>
  );
}

export const TimelineSheet = forwardRef<HTMLDivElement, Props>(function TimelineSheet({ person, events, hidden, view, hideLow = false, focus = null, simple = false, onSelect }, ref) {
  const today = todayISO();
  const todayF = yearFrac(today);
  const endF = (e: TimelineEvent) => yearFrac(e.ongoing ? today : e.end || e.start);
  const visibleCats = CATEGORIES.filter((c) => !hidden.has(c.id));
  const visible = events
    .filter((e) => !hidden.has(e.category) && !(hideLow && e.significance === "low"))
    .filter((e) => !focus || (yearFrac(e.start) < focus[1] && endF(e) >= focus[0]))
    .sort((a, b) => a.start.localeCompare(b.start));

  let minY: number, maxY: number;
  if (focus) {
    minY = Math.floor(focus[0]);
    maxY = Math.max(Math.ceil(focus[1]), minY + 1);
  } else {
    const starts = visible.map((e) => yearFrac(e.start));
    const ends = visible.map(endF);
    if (person.dob) starts.push(yearFrac(person.dob));
    minY = Math.floor(starts.length ? Math.min(...starts) : new Date().getFullYear() - 5);
    maxY = Math.max(Math.ceil(ends.length ? Math.max(...ends) + 0.01 : 0), minY + 3);
  }
  const width = Math.max((maxY - minY) * (simple ? 140 : PX_PER_YEAR), 760);
  const xY = (y: number) => ((y - minY) / (maxY - minY)) * width;
  const clampX = (v: number) => Math.min(Math.max(v, 0), width);
  const x = (iso: string) => clampX(xY(yearFrac(iso)));
  const dobF = person.dob ? yearFrac(person.dob) : null;
  const years = Array.from({ length: maxY - minY + 1 }, (_, i) => minY + i);
  const todayX = todayF >= minY && todayF <= maxY ? xY(todayF) : null;

  const bands = dobF === null ? [] : AGE_BANDS.map((b) => {
    const a = Math.max(xY(dobF + b.from), 0), z = Math.min(xY(dobF + b.to), width);
    return z > a ? { ...b, a, z } : null;
  }).filter((b): b is NonNullable<typeof b> => !!b);

  const Axis = (
    <div className="relative" style={{ height: AXIS_H }}>
      {bands.map((b) => (
        <div key={b.name} className="absolute top-0 flex h-5 items-center justify-center overflow-hidden rounded-full border text-[10px] font-bold uppercase tracking-wider"
          style={{ left: b.a + 1, width: b.z - b.a - 2, backgroundColor: tint(b.tone, 16), borderColor: tint(b.tone, 35), color: `color-mix(in oklab, var(--cat-${b.tone}) 70%, hsl(var(--foreground)))` }}>
          {b.name}
        </div>
      ))}
      {years.map((y) => {
        const age = dobF !== null ? y - Math.floor(dobF) : null;
        return (
          <div key={y} className="absolute top-[24px] -translate-x-1/2 whitespace-nowrap text-xs" style={{ left: xY(y) }}>
            <span className="font-bold text-foreground">{y}</span>
            {age !== null && age >= 0 && <span className="ml-0.5 text-[9px] text-muted-foreground">age {age}</span>}
          </div>
        );
      })}
    </div>
  );

  const BandBg = ({ top = AXIS_H }: { top?: number }) => (
    <div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ top }}>
      {bands.map((b) => (
        <div key={b.name} className="absolute bottom-0 top-0" style={{ left: b.a, width: b.z - b.a, backgroundColor: tint(b.tone, 5) }} />
      ))}
      {years.map((y) => <div key={y} className="absolute bottom-0 top-0 border-l border-border/70" style={{ left: xY(y) }} />)}
    </div>
  );

  const TodayLine = ({ top = AXIS_H - 4 }: { top?: number }) => todayX === null ? null : (
    <div className="pointer-events-none absolute bottom-0 z-20" style={{ left: todayX, top }}>
      <div className="absolute bottom-0 top-0 border-l-2 border-primary" />
      <span className="absolute -top-1 -translate-x-1/2 rounded-full bg-primary px-1.5 py-px text-[9px] font-bold uppercase text-primary-foreground">Today</span>
    </div>
  );

  /* ---------- lanes ---------- */
  const moves = homeMoves(visible);
  const counts = reportCounts(visible);
  const eventNumber = (e: TimelineEvent) => visible.findIndex((v) => v.id === e.id) + 1;
  const wellbeingRows: number[] = [];
  const wellbeingPlaced = visible.map((e) => {
    const px = Math.min(x(e.start), width - 26);
    let row = 0;
    while ((wellbeingRows[row] ?? -1e9) > px - 4) row++;
    wellbeingRows[row] = px + 32;
    return { e, px, row };
  });
  const focusEvent = (from: HTMLElement, id: string) => {
    const root = from.closest("[data-tl-body]")?.parentElement ?? document;
    root.querySelectorAll(".wb-focus").forEach((n) => n.classList.remove("wb-focus"));
    const targets = [...root.querySelectorAll<HTMLElement>("[data-event-ids]")].filter((n) => n.dataset["eventIds"]?.split(" ").includes(id));
    from.classList.add("wb-focus");
    targets.forEach((n) => n.classList.add("wb-focus"));
    targets[0]?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    window.setTimeout(() => { from.classList.remove("wb-focus"); targets.forEach((n) => n.classList.remove("wb-focus")); }, 3000);
  };
  const LINE_H = 26;
  const wellbeingH = visible.length ? Math.max(1, wellbeingRows.length) * 25 + 8 + LINE_H : 0;
  // Thin green→red line through rated events only; mixed/not known/unassessed break it.
  const LEVEL: Record<string, number> = { "very-positive": 2, positive: 1, neutral: 0, negative: -1, "very-negative": -2 };
  const ly = (lvl: number) => 4 + ((2 - lvl) / 4) * (LINE_H - 8);
  const linePts = [...visible].sort((a, b) => a.start.localeCompare(b.start)).map((e) => ({ e, lvl: e.wellbeingImpact ? LEVEL[e.wellbeingImpact] : undefined, px: x(e.start) }));
  const segments: { px: number; lvl: number }[][] = [];
  let seg: { px: number; lvl: number }[] = [];
  for (const p of linePts) {
    if (p.lvl === undefined) { if (seg.length) segments.push(seg); seg = []; } else seg.push({ px: p.px, lvl: p.lvl });
  }
  if (seg.length) segments.push(seg);
  const WellbeingStrip = (
    <div className="relative border-t bg-muted/40" style={{ height: wellbeingH, width: width + (simple ? 30 : 240) }}>
      <svg className="absolute left-0 top-0" width={width + 30} height={LINE_H} aria-label="Wellbeing line (practitioner judgement)">
        <defs>
          <linearGradient id="wb-grad" gradientUnits="userSpaceOnUse" x1="0" y1={ly(2)} x2="0" y2={ly(-2)}>
            <stop offset="0" stopColor="var(--wellbeing-positive)" />
            <stop offset="0.5" stopColor="var(--wellbeing-amber)" />
            <stop offset="1" stopColor="var(--wellbeing-negative)" />
          </linearGradient>
        </defs>
        <line x1={0} x2={width + 30} y1={ly(0)} y2={ly(0)} stroke="hsl(var(--border))" strokeDasharray="2 3" />
        {segments.map((s, i) => s.length > 1
          ? <polyline key={i} points={s.map((p) => `${p.px + 0.01 * i},${ly(p.lvl)}`).join(" ")} fill="none" stroke="url(#wb-grad)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          : <circle key={i} cx={s[0]!.px} cy={ly(s[0]!.lvl)} r={2.5} fill="url(#wb-grad)" />)}
        {segments.flat().map((p, i) => <circle key={`d${i}`} cx={p.px} cy={ly(p.lvl)} r={1.8} fill={p.lvl > 0 ? "var(--wellbeing-positive)" : p.lvl < 0 ? "var(--wellbeing-negative)" : "var(--wellbeing-amber)"} />)}
      </svg>
      <div className="absolute inset-x-0 bottom-0" style={{ top: LINE_H }}>
      {wellbeingPlaced.map(({ e, px, row }) => {
        const w = wellbeingOf(e);
        return <button type="button" key={e.id} onClick={(ev) => focusEvent(ev.currentTarget, e.id)} onDoubleClick={() => onSelect?.(e)}
          aria-label={`Show ${displayLabel(e)} on the timeline`}
          title={`${eventNumber(e)}. ${displayLabel(e)}\nWellbeing: ${w.label} (practitioner judgement)${e.wellbeingNote ? `\n${e.wellbeingNote}` : ""}\nClick to highlight · double-click to edit`}
          className="wellbeing-symbol absolute inline-flex h-6 min-w-8 items-center justify-center gap-0.5 rounded border bg-card p-0.5 text-[10px] font-bold hover:bg-muted"
          data-tone={w.tone} style={{ left: px, top: row * 25 + 4 }}>
          <span className="text-[8px] text-muted-foreground">{eventNumber(e)}</span>{w.symbol}
        </button>;
      })}
      </div>
    </div>
  );
  const TOTALS_H = visible.length && !simple ? 46 : 0;
  const lanes = visibleCats.map((c) => {
    const all = visible.filter((e) => e.category === c.id);
    const evs = all.filter((e) => !isMarker(e));
    const byMonth = new Map<string, TimelineEvent[]>();
    (simple ? [] : all.filter(isMarker)).forEach((e) => { const k = e.start.slice(0, 7); byMonth.set(k, [...(byMonth.get(k) ?? []), e]); });
    let mEnd = -1e9;
    const markers = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, list]) => {
      const mx = Math.max(x(`${k}-01`), mEnd);
      mEnd = mx + (list.length > 1 ? 36 : 24);
      return { k, x: mx, list };
    });
    const laneMoves = c.id === "living" && !simple ? moves.filter((m) => m.from.location || m.to.location) : [];
    const gaps = c.id === "living"
      ? evs.slice(1).map((b, i) => ({ a: evs[i]!, b })).filter(({ a, b }) => a.end && !a.ongoing && a.end.slice(0, 7) < b.start.slice(0, 7))
      : [];
    const top = markers.length ? 22 : 0;
    const bottom = laneMoves.length ? 20 : 0;
    const rowEnds: number[] = [];
    const placed = (simple ? all : evs).map((e) => {
      const x1 = x(e.start);
      const x2 = e.ongoing ? x(today) : e.end ? x(e.end) : x1;
      const high = e.significance === "high" && !simple;
      const period = PERIOD_CATS.includes(e.category) && x2 - x1 > (simple ? 45 : 90);
      const cardW = simple ? 46 : period ? 0 : 40 + Math.min(displayLabel(e).length, 24) * 6.2;
      const extent = Math.max(x2, x1 + cardW);
      let row = 0;
      while ((rowEnds[row] ?? -1e9) > x1 - 10) row++;
      rowEnds[row] = extent;
      return { e, x1, x2, row, period, cardW };
    });
    const rows = Math.max(rowEnds.length, evs.length || !markers.length ? 1 : 0);
    return { c, placed, markers, laneMoves, gaps, top, bottom, h: rows * ROW_H + 4 + top + bottom };
  });

  const lanesView = (
    <div className="flex">
      <div style={{ width: LANE_LABEL_W }} className="shrink-0 space-y-1">
        <div style={{ height: AXIS_H }} />
        {TOTALS_H > 0 && <div style={{ height: TOTALS_H }} className="flex items-center rounded-l-xl bg-muted px-3 text-xs font-semibold">Running totals</div>}
        {lanes.map(({ c, h }) => {
          const Icon = categoryIcon(c.id);
          return (
            <div key={c.id} style={{ height: h, backgroundColor: tint(c.id, 12) }} className="flex items-center gap-2 overflow-hidden rounded-l-xl px-3 text-[11px] font-semibold leading-tight">
              <span title={c.name} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-card shadow-badge" style={{ backgroundColor: col(c.id) }}><Icon size={12} /></span>
              <span className="min-w-0">{c.name}</span>
            </div>
          );
        })}
        {wellbeingH > 0 && <div className="flex items-center gap-1 bg-muted px-3 text-[11px] font-semibold" style={{ height: wellbeingH }}>Wellbeing impact</div>}
      </div>
      <div className="relative space-y-1" style={{ width: width + (simple ? 30 : 240) }}>
        <div>{Axis}</div>
        <BandBg />
        <TodayLine />
        {TOTALS_H > 0 && <div className="relative rounded-r-xl bg-muted/60" style={{ height: TOTALS_H }}>
          {years.slice(1).map((y) => {
            const tt = totalsUpTo(visible, moves, `${y - 1}-12-31`);
            const items = [
              { I: Home, v: tt.homes, l: "homes" }, { I: GraduationCap, v: tt.schools, l: "schools" },
              { I: Ban, v: tt.suspensions, l: "suspensions/exclusions" }, { I: Users, v: tt.professionals, l: "professional involvements" },
            ];
            return (
              <div key={y} className="absolute top-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] tabular-nums text-muted-foreground" style={{ left: xY(y) - 58, width: 54 }} title={`By end of ${y - 1}`}>
                {items.map(({ I, v, l }) => <span key={l} className={`inline-flex items-center gap-0.5 ${v ? "font-semibold text-foreground" : ""}`} title={`${v} ${l}`}><I size={9} />{v}</span>)}
                <span className="col-span-2 inline-flex items-center gap-0.5" title="Miles moved (straight line)"><Route size={9} />{tt.miles} mi</span>
              </div>
            );
          })}
        </div>}
        {lanes.map(({ c, placed, markers, laneMoves, gaps, top, h }) => (
          <div key={c.id} className="relative rounded-r-xl" style={{ height: h, backgroundColor: tint(c.id, 4) }}>
            {gaps.map(({ a, b }) => (
              <span key={`gap-${b.id}`} title="Unknown – no living arrangement recorded" className="absolute flex items-center justify-center overflow-hidden rounded-full border border-dashed text-[9px] font-semibold uppercase tracking-wider text-muted-foreground"
                style={{ left: x(a.end), width: Math.max(x(b.start) - x(a.end), 4), top: 4 + top, height: 24, borderColor: "hsl(var(--muted-foreground))",
                  backgroundImage: "repeating-linear-gradient(45deg, color-mix(in oklab, hsl(var(--muted-foreground)) 22%, transparent) 0 4px, transparent 4px 9px)" }}>
                {x(b.start) - x(a.end) > 60 ? "Unknown" : ""}
              </span>
            ))}
            {markers.map(({ k, x: mx, list }) => {
              const Icon = iconFor(list[0]!.category, list[0]!.type);
              const types = [...new Set(list.map((e) => e.type))].join(", ");
              return (
                <button type="button" key={k} data-event-ids={list.map((e) => e.id).join(" ")} onClick={() => onSelect?.(list[0]!)} title={`${types} · ${formatDate(`${k}-01`, "month")}\n${list.map((e) => displayLabel(e)).join("\n")}`}
                  className="absolute inline-flex items-center gap-0.5 rounded-full border bg-card px-1 py-0.5 text-[10px] font-bold shadow-badge" style={{ left: mx - 10, top: 4, borderColor: col(c.id), color: col(c.id) }}>
                  <Icon size={12} strokeWidth={2.4} />{list.length > 1 && <span>×{list.length}</span>}
                </button>
              );
            })}
            {laneMoves.map((m) => {
              const px = x(m.to.start);
              const lead = px > 80;
              return (
                <span key={m.to.id} title={`Home move: ${m.from.location || "?"} → ${m.to.location || "?"}${m.miles !== null ? ` (${m.miles} mi straight line)` : ""}`}
                  className={`absolute bottom-1 inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-card px-1 py-0.5 text-[10px] shadow-card ${lead ? "-translate-x-full" : ""}`}
                  style={{ left: lead ? px - 3 : px + 3, border: `${m.miles && m.miles >= 50 ? 2 : 1}px solid ${col("living")}` }}>
                  <ArrowRight size={11} strokeWidth={2.6} style={{ color: col("living") }} />
                  {m.miles !== null && m.miles > 0 && <b className="tabular-nums" style={{ color: m.miles >= 50 ? "hsl(var(--destructive))" : undefined }}>{m.miles} mi</b>}
                </span>
              );
            })}

            {placed.map(({ e, x1, row }) => row > 0 && (
              <span key={`c-${e.id}`} className="pointer-events-none absolute border-l border-dotted" style={{ left: x1, top: 4 + top, height: row * ROW_H + 6, borderColor: col(e.category) }} />
            ))}
            {placed.map(({ e, x1, x2, row, period, cardW }) => {
              const isRange = x2 > x1 + 1;
              const high = e.significance === "high" && !simple;
              const low = e.significance === "low" && !simple;
              const title = `${e.type}: ${displayLabel(e)}\n${dateText(e)}${e.note ? `\n${e.note}` : ""}\nWellbeing: ${wellbeingOf(e).label} (practitioner judgement)${e.wellbeingNote ? `\n${e.wellbeingNote}` : ""}`;
              if (period) {
                const fill = typeColour(e);
                return (
                  <button type="button" key={e.id} data-event-ids={e.id} onClick={() => onSelect?.(e)} title={title}
                    className={`absolute flex items-center gap-1.5 overflow-hidden rounded-full pl-0.5 pr-3 text-left shadow-card ${e.approximate ? "border-2 border-dashed" : ""}`}
                    style={{ left: x1, top: 4 + top + row * ROW_H, width: x2 - x1, height: 30, opacity: low ? 0.55 : 1, borderColor: fill,
                      backgroundColor: e.approximate ? `color-mix(in oklab, ${fill} 18%, hsl(var(--card)))` : `color-mix(in oklab, ${fill} 82%, hsl(var(--card)))`,
                      color: e.approximate ? "hsl(var(--foreground))" : "hsl(var(--card))" }}>
                    <Badge e={e} size={24} />
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-[11px] font-semibold">{simple ? eventNumber(e) : displayLabel(e)}</span>
                      {!simple && <span className="block truncate text-[9px] opacity-85">{dateText(e)}</span>}
                    </span>
                    {e.ongoing && <span className="absolute right-1 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent" style={{ borderLeftColor: "hsl(var(--card))" }} />}
                  </button>
                );
              }
              return (
                <button type="button" key={e.id} data-event-ids={e.id} onClick={() => onSelect?.(e)} title={title}
                  className="absolute text-left" style={{ left: x1 - 13, top: 4 + top + row * ROW_H, opacity: low ? 0.5 : 1 }}>
                  {isRange && (
                    <span className={`absolute left-[13px] top-[7px] h-3 rounded-full ${e.approximate ? "border-2 border-dashed" : ""}`}
                      style={{ width: x2 - x1, backgroundColor: e.approximate ? tint(e.category, 15) : `color-mix(in oklab, ${typeColour(e)} ${high ? 70 : 45}%, hsl(var(--card)))`, borderColor: col(e.category) }}>
                      {e.ongoing && <span className="absolute -right-1 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent" style={{ borderLeftColor: col(e.category) }} />}
                    </span>
                  )}
                  <span className="relative flex items-start gap-1.5">
                    <Badge e={e} />
                    <span className="min-w-0 rounded px-1 text-left" style={{ backgroundColor: "color-mix(in oklab, hsl(var(--card)) 80%, transparent)", maxWidth: simple ? 24 : cardW - 54 }}>
                      <span className={`block truncate text-[11px] leading-tight ${high ? "font-bold" : "font-semibold"}`}>{simple ? eventNumber(e) : displayLabel(e)}</span>
                      {!simple && <span className="block truncate text-[9px] text-muted-foreground">{dateText(e)}</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        {wellbeingH > 0 && WellbeingStrip}
      </div>
    </div>
  );

  /* ---------- story path ---------- */
  const CARD_W = 190;
  const LEVEL_H = simple ? 52 : 74;
  const storyEvents = visible.filter((e) => !isMarker(e));
  const incidents = visible.filter(isMarker);
  const sides: { above: number[]; below: number[] } = { above: [], below: [] };
  const storyPlaced = storyEvents.map((e, i) => {
    const px = x(e.start);
    const side: "above" | "below" = i % 2 === 0 ? "above" : "below";
    const lv = sides[side];
    let level = lv.findIndex((end) => end < px - 8);
    if (level === -1) { level = lv.length; lv.push(0); }
    lv[level] = px + CARD_W;
    return { e, px, side, level };
  });
  const above = Math.max(sides.above.length, 1), below = Math.max(sides.below.length, 1);
  const pathY = AXIS_H + above * LEVEL_H + 30;
  const storyH = pathY + 30 + below * LEVEL_H + 10;
  const amp = 10;
  const waves = Math.max(1.5, (maxY - minY) / 5);
  const waveY = (px: number) => pathY + Math.sin((px / width) * Math.PI * 2 * waves) * amp;
  const curve = (a: number, z: number, n: number) => Array.from({ length: n + 1 }, (_, i) => { const px = a + ((z - a) * i) / n; return `${i ? "L" : "M"}${px.toFixed(1)},${waveY(px).toFixed(1)}`; }).join(" ");
  const pathD = curve(0, width, 240);
  const storyMoves = moves;
  const incByMonth = new Map<string, TimelineEvent[]>();
  incidents.forEach((e) => { const k = e.start.slice(0, 7); incByMonth.set(k, [...(incByMonth.get(k) ?? []), e]); });

  const storyView = (
    <div className="relative" style={{ width: width + CARD_W + 20, height: storyH }}>
      {Axis}
      <BandBg />
      <TodayLine />
      <svg className="absolute left-0 top-0 overflow-visible" width={width} height={storyH}>
        <path d={pathD} fill="none" stroke="var(--path)" strokeWidth={20} strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="hsl(var(--card))" strokeWidth={2} strokeDasharray="8 8" strokeLinecap="round" />
        {storyEvents.filter((e) => e.ongoing || e.end).map((e) => {
          const a = x(e.start), z = e.ongoing ? x(today) : x(e.end);
          return <path key={e.id} d={curve(a, z, 40)} fill="none" stroke={typeColour(e)} strokeOpacity={0.6} strokeWidth={8} strokeLinecap="round" strokeDasharray={e.approximate ? "4 6" : undefined} />;
        })}
        {storyPlaced.map(({ e, px, side, level }) => {
          const cy = side === "above" ? pathY - 30 - level * LEVEL_H - 4 : pathY + 30 + level * LEVEL_H + 4;
          return <line key={e.id} x1={px} y1={waveY(px)} x2={px} y2={cy} stroke={col(e.category)} strokeWidth={1.5} strokeDasharray="2 3" />;
        })}
      </svg>
      {storyMoves.map((m, i) => {
        const px = x(m.to.start);
        return (
          <span key={`mv-${m.to.id}`} className="absolute z-20 flex -translate-x-1/2 flex-col items-center" style={{ left: px, top: waveY(px) + 14 }}
            title={`Home move ${i + 1}: ${m.from.location || "?"} → ${m.to.location || "?"}${m.miles !== null ? ` (${m.miles} mi)` : ""}`}>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border-2 bg-card text-[8px] font-bold" style={{ borderColor: col("living"), color: col("living") }}>{i + 1}</span>
            {m.miles !== null && <span className="text-[8px] font-semibold" style={{ color: m.miles >= 50 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}>{m.miles} mi</span>}
          </span>
        );
      })}
      {[...incByMonth.entries()].map(([k, list]) => {
        const px = x(`${k}-01`);
        const Icon = iconFor(list[0]!.category, list[0]!.type);
        return (
          <button type="button" key={`inc-${k}`} data-event-ids={list.map((e) => e.id).join(" ")} onClick={() => onSelect?.(list[0]!)} title={`${formatDate(`${k}-01`, "month")}\n${list.map((e) => `${e.type}: ${displayLabel(e)}`).join("\n")}`}
            className="absolute z-20 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full border bg-card px-1 py-0.5 text-[9px] font-bold shadow-badge"
            style={{ left: px, top: waveY(px) - 16, borderColor: col(list[0]!.category), color: col(list[0]!.category) }}>
            <Icon size={10} strokeWidth={2.4} />{list.length > 1 && <span>×{list.length}</span>}
          </button>
        );
      })}
      {storyPlaced.map(({ e, px, side, level }) => {
        const high = e.significance === "high" && !simple;
        const cardTop = side === "above" ? pathY - 30 - (level + 1) * LEVEL_H + 8 : pathY + 30 + level * LEVEL_H + 4;
        return (
          <div key={e.id} style={{ opacity: e.significance === "low" ? 0.55 : 1 }}>
            <span title={`${e.type}: ${displayLabel(e)}\n${dateText(e)}`} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: px, top: waveY(px) }}><Badge e={e} /></span>
            <button type="button" data-event-ids={e.id} title={`${e.type}: ${displayLabel(e)}\n${dateText(e)}${e.note ? `\n${e.note}` : ""}`} onClick={() => onSelect?.(e)} className={`absolute flex text-left ${side === "above" ? "items-end" : "items-start"}`}
              style={{ left: px - 10, top: cardTop, width: CARD_W, height: LEVEL_H - 12 }}>
              <span className={`block w-full rounded-xl border border-t-4 px-2.5 py-1.5 shadow-card ${high ? "" : "bg-card"}`}
                style={{ borderColor: high ? "color-mix(in oklab, hsl(var(--primary)) 40%, hsl(var(--card)))" : "hsl(var(--border))", borderTopColor: col(e.category), backgroundColor: high ? tint(e.category, 14) : undefined }}>
                <span className={`block text-[11px] leading-tight ${high ? "font-bold" : "font-semibold"}`}>{displayLabel(e)}</span>
                {!simple && <span className="block text-[9px] text-muted-foreground">{dateText(e)}</span>}
                {high && e.note && <span className="mt-0.5 line-clamp-2 block text-[9px] leading-snug">{e.note}</span>}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );

  const focusText = focus ? `Showing ${Math.floor(focus[0])}–${Math.ceil(focus[1])}` : "";

  return (
    <div ref={ref} className="print-sheet w-max bg-card px-6 py-4 text-card-foreground">
      <div className="mb-2 flex items-end justify-between gap-10 border-b-2 border-foreground pb-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{simple ? "Chronology overview" : "Chronology"}{focusText ? ` · ${focusText}` : ""}{hideLow ? " · low importance hidden" : ""}</p>
          <h2 className="text-xl font-semibold">{person.label || "—"}</h2>
          <p className="text-xs text-muted-foreground">
            {person.dob ? `Date of birth: ${formatDate(person.dob, person.dobPrecision)} · ` : ""}
            Prepared by: {person.preparedBy || "—"} · Date prepared: {formatDate(today, "day")}
          </p>
        </div>
        <div className="flex max-w-xl flex-wrap justify-end gap-x-4 gap-y-1.5 text-xs">
          {visibleCats.map((c) => {
            const Icon = categoryIcon(c.id);
            return (
              <span key={c.id} className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-card" style={{ backgroundColor: col(c.id) }}><Icon size={9} /></span>
                {c.name}
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="inline-block h-4 w-4 rounded-full border-2 border-dashed border-muted-foreground" /> approximate</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Star size={8} fill="currentColor" strokeWidth={0} /></span> high importance (ringed)</span>
          <span className="text-muted-foreground">Faded = low importance</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground"><span className="rounded-full border px-1 text-[9px] font-bold">×2</span> repeated incidents in a month</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground"><ArrowRight size={11} strokeWidth={2.6} /> moved home — miles straight line</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground"><span className="inline-block h-3 w-6 rounded-full border border-dashed border-muted-foreground" style={{ backgroundImage: "repeating-linear-gradient(45deg, color-mix(in oklab, hsl(var(--muted-foreground)) 30%, transparent) 0 3px, transparent 3px 6px)" }} /> unknown gap</span>
          {todayX !== null && <span className="inline-flex items-center gap-1 text-muted-foreground"><span className="inline-block h-3 border-l-2 border-primary" /> today</span>}
        </div>
      </div>

      {simple && <p className="mb-2 text-xs">{counts.homeMoves} home moves · {counts.educationChanges} education changes · {counts.significantEvents} high-significance events · {counts.unassessed} wellbeing impacts unassessed</p>}
      <div className="w-max" data-tl-body data-label-w={view === "lanes" || simple ? LANE_LABEL_W : 0}>{view === "lanes" || simple ? lanesView : <>{storyView}<div className="mt-2 text-[11px] font-semibold">Wellbeing impact</div>{WellbeingStrip}</>}</div>

      {simple && <div data-report-labels className="mt-2 grid max-w-[1400px] grid-cols-3 gap-x-5 gap-y-1 border-t pt-2 text-[10px]">
        {visible.map((e) => <span key={e.id}><b>{eventNumber(e)}.</b> {displayLabel(e)}</span>)}
      </div>}

      {visible.length > 0 && (
        <div data-icon-key className="mt-2 border-t pt-1.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Icon key</p>
          <div className="flex max-w-[1400px] flex-wrap gap-x-4 gap-y-0.5 text-[10px]">
            {[...new Map(visible.map((e) => [`${e.category}|${e.type.trim().toLowerCase()}`, e])).values()]
              .sort((a, b) => CATEGORIES.findIndex((c) => c.id === a.category) - CATEGORIES.findIndex((c) => c.id === b.category) || a.type.localeCompare(b.type))
              .map((e) => {
                const Icon = iconFor(e.category, e.type);
                return (
                  <span key={`${e.category}|${e.type}`} title={`${catById(e.category).name}: ${e.type}`} className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-card" style={{ backgroundColor: col(e.category) }}><Icon size={11} /></span>
                    {e.type}
                  </span>
                );
              })}
          </div>
          <div className="mt-2 flex max-w-[1400px] flex-wrap gap-x-4 gap-y-1 text-[10px]">
            {[...WELLBEING_OPTIONS, { value: "", label: "Unassessed", symbol: "○", tone: "unassessed" }].map((o) =>
              <span key={o.value} className="inline-flex items-center gap-1"><b className="wellbeing-symbol" data-tone={o.tone}>{o.symbol}</b>{o.label}</span>)}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">Practitioner judgement—not a wellbeing assessment. Thin line: green = positive, red = negative; it breaks at mixed, not known or unassessed events. ○ Unassessed is not neutral.</p>
        </div>
      )}

      <p className="mt-2 border-t pt-1.5 text-[10px] text-muted-foreground">
        Confidential. Contains sensitive personal information. Handle in line with your organisation's data protection policy.
      </p>
    </div>
  );
});
