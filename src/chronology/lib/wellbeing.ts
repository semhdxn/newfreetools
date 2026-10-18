import type { TimelineEvent } from "@/chronology/lib/timeline";

export const WELLBEING_OPTIONS = [
  { value: "very-negative", label: "Very negative", symbol: "−−", tone: "negative" },
  { value: "negative", label: "Negative", symbol: "−", tone: "negative" },
  { value: "neutral", label: "Neutral", symbol: "=", tone: "neutral" },
  { value: "positive", label: "Positive", symbol: "+", tone: "positive" },
  { value: "very-positive", label: "Very positive", symbol: "++", tone: "positive" },
  { value: "mixed", label: "Mixed", symbol: "±", tone: "mixed" },
  { value: "unknown", label: "Not known", symbol: "?", tone: "unassessed" },
] as const;

export type WellbeingImpact = typeof WELLBEING_OPTIONS[number]["value"];
export const wellbeingByValue = (value?: string) => WELLBEING_OPTIONS.find((o) => o.value === value);
export const wellbeingOf = (e: Pick<TimelineEvent, "wellbeingImpact">) => wellbeingByValue(e.wellbeingImpact) ?? { label: "Unassessed", symbol: "○", tone: "unassessed" };

/** Factual chronology counts only; wellbeing is never used as a score. */
export function reportCounts(events: TimelineEvent[]) {
  return {
    homeMoves: Math.max(0, events.filter((e) => e.category === "living").length - 1),
    educationChanges: events.filter((e) => e.category === "education" && ["Started school", "Changed school", "Left education"].includes(e.type)).length,
    significantEvents: events.filter((e) => e.significance === "high").length,
    unassessed: events.filter((e) => !e.wellbeingImpact).length,
  };
}