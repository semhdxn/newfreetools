import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, catById, newId, wantsLocation, type Significance, type TimelineEvent } from "@/chronology/lib/timeline";
import { MonthYearInput } from "@/chronology/components/MonthYearInput";
import { ChipSelect, EVENT_OR_PERIOD, SIGNIFICANCE_OPTIONS } from "@/chronology/components/ChipSelect";
import { UK_LOCATIONS } from "@/chronology/lib/locations";
import { WellbeingInput } from "@/chronology/components/WellbeingInput";
import type { WellbeingImpact } from "@/chronology/lib/wellbeing";

interface Props {
  onAdd: (e: TimelineEvent) => void;
  onMore: () => void;
}

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.id, label: c.name, accent: `var(--cat-${c.id})` }));

/** Main entry card. Category/type/significance and date stay sticky between rows. */
export function QuickEntry({ onAdd, onMore }: Props) {
  const [date, setDate] = useState("");
  const [approximate, setApproximate] = useState(false);
  const [category, setCategory] = useState("living");
  const [type, setType] = useState<string>(catById("living").types[0]);
  const [label, setLabel] = useState("");
  const [significance, setSignificance] = useState<Significance>("medium");
  const [error, setError] = useState("");
  const [hasEnd, setHasEnd] = useState(true);
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [wellbeingImpact, setWellbeingImpact] = useState<WellbeingImpact>();
  const [wellbeingNote, setWellbeingNote] = useState("");
  const types = catById(category).types as readonly string[];
  const periodCat = category === "living" || category === "education";
  const locField = wantsLocation(type);
  const isPeriod = periodCat && hasEnd;

  const commit = () => {
    if (!date) { setError("Choose a month and year"); return; }
    const useEnd = isPeriod && end;
    if (useEnd && end < date) { setError("The 'to' date is before the 'from' date"); return; }
    setError("");
    onAdd({
      id: newId(), category, type, label: label.trim() || type, location: locField ? location.trim() : "",
      start: date, startPrecision: "month", end: useEnd ? end : "", endPrecision: "month",
      ongoing: false, approximate, significance, note: "",
      wellbeingImpact, wellbeingNote: wellbeingNote.trim(),
    });
    setLabel(""); setEnd(""); setLocation("");
    setWellbeingImpact(undefined); setWellbeingNote("");
  };

  return (
    <section className="panel space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-bold">Add an event</h2>
          <p className="text-xs text-muted-foreground">Category, type and date stay selected for the next event. Press Enter in the label to add.</p>
        </div>
        <button type="button" className="btn" onClick={onMore}><SlidersHorizontal size={14} /> More details</button>
      </div>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); commit(); }}>
        <ChipSelect
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(id) => { const c = catById(id); setCategory(c.id); setType(c.types[0]); setHasEnd(c.id === "living" || c.id === "education"); setEnd(""); }}
        />
        <ChipSelect label="Type" options={types.map((t) => ({ value: t, label: t }))} value={type} onChange={setType} />
        {periodCat && (
          <ChipSelect
            label="Is this a single event or a period?"
            options={EVENT_OR_PERIOD}
            value={hasEnd ? "period" : "event"}
            onChange={(v) => { setHasEnd(v === "period"); if (v === "event") setEnd(""); }}
          />
        )}
        <div className={`grid gap-3 ${isPeriod ? "sm:grid-cols-2" : ""}`}>
          <MonthYearInput label={isPeriod ? "From" : "Date"} value={date} onChange={setDate} />
          {isPeriod && <MonthYearInput label="To" value={end} onChange={setEnd} min={date} startAt={date} clearable />}
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <span className="label">Label</span>
            <input className="field" value={label} placeholder="Short description (avoid full names)" autoComplete="off" onChange={(e) => setLabel(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary h-10"><Plus size={16} /> Add</button>
        </div>
        {locField && (
          <div className="max-w-xs">
            <span className="label">Town or city</span>
            <input className="field" list="uk-towns-q" value={location} placeholder="e.g. Leeds" autoComplete="off" onChange={(e) => setLocation(e.target.value)} />
          </div>
        )}
        <div className="flex flex-wrap items-end gap-4">
          <ChipSelect label="Significance" options={SIGNIFICANCE_OPTIONS} value={significance} onChange={setSignificance} />
          <label className="inline-flex h-9 items-center gap-2 text-sm"><input type="checkbox" checked={approximate} onChange={(e) => setApproximate(e.target.checked)} /> Date approximate</label>
        </div>
        <WellbeingInput impact={wellbeingImpact} note={wellbeingNote} onChange={(impact, note) => { setWellbeingImpact(impact); setWellbeingNote(note); }} />
      </form>
      <datalist id="uk-towns-q">{UK_LOCATIONS.map((t) => <option key={t} value={t} />)}</datalist>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </section>
  );
}
