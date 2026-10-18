import { describe, expect, it } from "vitest";
import { emptyPerson, eventKey, parseCSV, templateCSV, toCSV, type TimelineEvent } from "@/chronology/lib/timeline";
import { reportCounts, WELLBEING_OPTIONS, wellbeingOf } from "@/chronology/lib/wellbeing";

const event = (extra: Partial<TimelineEvent> = {}): TimelineEvent => ({ id: "test", category: "education", type: "Started school", label: "School", location: "", start: "2020-01-01", startPrecision: "month", end: "", endPrecision: "month", ongoing: false, approximate: false, significance: "high", note: "", ...extra });

describe("Practitioner wellbeing judgements", () => {
  it("supports all seven judgements without assigning a score", () => {
    expect(WELLBEING_OPTIONS.map((o) => o.value)).toEqual(["very-negative", "negative", "neutral", "positive", "very-positive", "mixed", "unknown"]);
    expect(WELLBEING_OPTIONS.every((o) => !("score" in o))).toBe(true);
  });
  it("leaves unrated high-significance events unassessed, never neutral", () => {
    expect(wellbeingOf(event()).label).toBe("Unassessed");
    expect(wellbeingOf(event({ wellbeingImpact: "neutral" })).label).toBe("Neutral");
    expect(wellbeingOf(event({ wellbeingImpact: "unknown" })).label).toBe("Not known");
  });
  it("round-trips judgement and multiline reason through CSV", () => {
    const e = event({ wellbeingImpact: "mixed", wellbeingNote: 'Settled, but worried\nSaid "unsure"' });
    const loaded = parseCSV(toCSV(emptyPerson(), [e]));
    expect(loaded.errors).toEqual([]);
    expect(loaded.events[0]?.wellbeingImpact).toBe("mixed");
    expect(loaded.events[0]?.wellbeingNote).toBe(e.wellbeingNote);
  });
  it("imports older CSV without inventing a judgement", () => {
    const csv = toCSV(emptyPerson(), [event()]).split("\r\n").map((row) => row.replace(/,wellbeing_impact,wellbeing_note$/, "").replace(/,,?$/, "")).join("\r\n");
    expect(parseCSV(csv).events[0]?.wellbeingImpact).toBeUndefined();
  });
  it("preserves otherwise identical events with different judgements", () => {
    expect(eventKey(event({ wellbeingImpact: "positive" }))).not.toBe(eventKey(event({ wellbeingImpact: "negative" })));
  });
  it("does not infer wellbeing from type and counts moves rather than homes", () => {
    const evs = [event({ category: "living" }), event({ category: "living", wellbeingImpact: "positive" }), event()];
    expect(reportCounts(evs)).toEqual({ homeMoves: 1, educationChanges: 1, significantEvents: 3, unassessed: 2 });
  });
  it("keeps the downloadable template valid", () => {
    expect(parseCSV(templateCSV()).errors).toEqual([]);
    expect(parseCSV(templateCSV()).events).toHaveLength(2);
  });
});