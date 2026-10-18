import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, catById, newId, wantsLocation, type Significance, type TimelineEvent } from "@/chronology/lib/timeline";
import { MonthYearInput } from "@/chronology/components/MonthYearInput";
import { UK_LOCATIONS } from "@/chronology/lib/locations";
import { WellbeingInput } from "@/chronology/components/WellbeingInput";
import type { WellbeingImpact } from "@/chronology/lib/wellbeing";

interface Props {
  onAdd: (e: TimelineEvent) => void;
  onMore: () => void;
}

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

  const commit = () => {
    if (!date) { setError("Choose a month and year"); return; }
    const useEnd = periodCat && hasEnd && end;
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
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[13rem_12rem_13rem_minmax(0,1fr)_8rem_auto] lg:items-end"
        onSubmit={(e) => { e.preventDefault(); commit(); }}>
        <MonthYearInput label="Date" value={date} onChange={setDate} />
        <div>
          <span className="label">Category</span>
          <select className="field" value={category} onChange={(e) => { const c = catById(e.target.value); setCategory(c.id); setType(c.types[0]); setHasEnd(c.id === "living" || c.id === "education"); setEnd(""); }}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <span className="label">Type</span>
          <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <span className="label">Label</span>
          <input className="field" value={label} placeholder="Short description (avoid full names)" autoComplete="off" onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div>
          <span className="label">Significance</span>
          <select className="field" value={significance} onChange={(e) => setSignificance(e.target.value as Significance)}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary h-10"><Plus size={16} /> Add</button>
        <div className="sm:col-span-2 lg:col-span-6">
          <WellbeingInput impact={wellbeingImpact} note={wellbeingNote} onChange={(impact, note) => { setWellbeingImpact(impact); setWellbeingNote(note); }} />
        </div>
      </form>
      <div className="flex flex-wrap items-end gap-4">
        {locField && (
          <div className="w-56">
            <span className="label">Town or city</span>
            <input className="field" list="uk-towns-q" value={location} placeholder="e.g. Leeds" autoComplete="off" onChange={(e) => setLocation(e.target.value)} />
          </div>
        )}
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={approximate} onChange={(e) => setApproximate(e.target.checked)} /> Date approximate</label>
        {periodCat && <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={hasEnd} onChange={(e) => setHasEnd(e.target.checked)} /> Add a "to" date (period)</label>}
      </div>
      {periodCat && hasEnd && <div className="max-w-xs"><MonthYearInput label="To" value={end} onChange={setEnd} /></div>}
      <datalist id="uk-towns-q">{UK_LOCATIONS.map((t) => <option key={t} value={t} />)}</datalist>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </section>
  );
}
