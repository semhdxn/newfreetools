import { useState } from "react";
import { CATEGORIES, catById, newId, normalise, todayISO, wantsLocation, type TimelineEvent } from "@/chronology/lib/timeline";
import { MonthYearInput as DateInput } from "@/chronology/components/MonthYearInput";
import { ChipSelect, EVENT_OR_PERIOD, SIGNIFICANCE_OPTIONS } from "@/chronology/components/ChipSelect";
import { UK_LOCATIONS } from "@/chronology/lib/locations";
import { WellbeingInput } from "@/chronology/components/WellbeingInput";

interface Props {
  initial?: TimelineEvent | undefined;
  onSave: (e: TimelineEvent) => void;
  onSaveAndAnother?: ((e: TimelineEvent) => void) | undefined;
  onDelete?: (() => void) | undefined;
  onClose: () => void;
}

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.id, label: c.name, accent: `var(--cat-${c.id})` }));
const CUSTOM = "__custom";

export function EventForm({ initial, onSave, onSaveAndAnother, onDelete, onClose }: Props) {
  const [e, setE] = useState<TimelineEvent>(
    initial ?? { id: newId(), category: "living", type: CATEGORIES[0].types[0], label: "", location: "", start: "", startPrecision: "month", end: "", endPrecision: "month", ongoing: false, approximate: false, significance: "medium", note: "" },
  );
  const cat = catById(e.category);
  const isCustom = !(cat.types as readonly string[]).includes(e.type);
  const [custom, setCustom] = useState(isCustom);
  // Single event vs period. Editing keeps whatever the event already is; new living/education events default to a period.
  const [isPeriod, setIsPeriod] = useState(initial ? !!(initial.end || initial.ongoing || initial.category === "living") : true);
  const set = <K extends keyof TimelineEvent>(k: K, v: TimelineEvent[K]) => setE((p) => ({ ...p, [k]: v }));

  const error = !e.start ? "Start date is required" : isPeriod && e.end && e.end < e.start ? "End date is before start date" : !e.type.trim() ? "Type is required" : "";

  const build = () => ({
    ...e,
    label: e.label.trim() || e.type,
    wellbeingNote: e.wellbeingNote?.trim() ?? "",
    start: normalise(e.start, e.startPrecision),
    end: isPeriod && !e.ongoing ? normalise(e.end, e.endPrecision) : "",
    ongoing: isPeriod && e.ongoing,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-overlay p-4" onClick={onClose}>
      <form
        className="panel my-8 w-full max-w-lg space-y-3"
        onClick={(ev) => ev.stopPropagation()}
        onSubmit={(ev) => {
          ev.preventDefault();
          if (error) return;
          onSave(build());
        }}
      >
        <h3 className="text-lg font-semibold">{initial?.start || initial?.label ? "Edit event" : "Add event"}</h3>
        <ChipSelect
          label="Category"
          options={CATEGORY_OPTIONS}
          value={e.category}
          onChange={(id) => {
            const c = catById(id);
            setE((p) => ({ ...p, category: c.id, type: c.types[0] }));
            setCustom(false);
            if (!initial) setIsPeriod(c.id === "living" || c.id === "education");
          }}
        />
        <div>
          <ChipSelect
            label="Type"
            options={[...cat.types.map((t) => ({ value: t as string, label: t as string })), { value: CUSTOM, label: "Custom…" }]}
            value={custom ? CUSTOM : e.type}
            onChange={(v) => { if (v === CUSTOM) { setCustom(true); set("type", ""); } else { setCustom(false); set("type", v); } }}
          />
          {custom && <input className="field mt-2" autoFocus value={e.type} placeholder="Custom type" onChange={(ev) => set("type", ev.target.value)} />}
        </div>
        <div>
          <span className="label">Label</span>
          <input className="field" value={e.label} onChange={(ev) => set("label", ev.target.value)} placeholder="Short description (avoid full names)" />
        </div>
        {wantsLocation(e.type) && (
          <div>
            <span className="label">Town or city</span>
            <input className="field" list="uk-towns-e" value={e.location} placeholder="e.g. Leeds" autoComplete="off" onChange={(ev) => set("location", ev.target.value)} />
          </div>
        )}
        <ChipSelect
          label="Is this a single event or a period?"
          options={EVENT_OR_PERIOD}
          value={isPeriod ? "period" : "event"}
          onChange={(v) => { setIsPeriod(v === "period"); if (v === "event") setE((p) => ({ ...p, end: "", ongoing: false })); }}
        />
        <DateInput label={isPeriod ? "Start date" : "Date"} value={e.start} onChange={(v) => setE((p) => ({ ...p, start: v, startPrecision: "month" }))} />
        {isPeriod && !e.ongoing && (
          <DateInput label="End date (leave blank if unknown)" value={e.end} min={e.start} startAt={e.start} clearable onChange={(v) => setE((p) => ({ ...p, end: v, endPrecision: "month" }))} />
        )}
        <div className="flex flex-wrap gap-4 text-sm">
          {isPeriod && <label className="inline-flex items-center gap-2"><input type="checkbox" checked={e.ongoing} onChange={(ev) => set("ongoing", ev.target.checked)} /> Ongoing (to {todayISO().split("-").reverse().join("/")})</label>}
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={e.approximate} onChange={(ev) => set("approximate", ev.target.checked)} /> Date approximate</label>
        </div>
        <ChipSelect label="Significance" options={SIGNIFICANCE_OPTIONS} value={e.significance} onChange={(v) => set("significance", v)} />
        <div>
          <span className="label">Note</span>
          <textarea className="field min-h-20" value={e.note} onChange={(ev) => set("note", ev.target.value)} />
        </div>
        <datalist id="uk-towns-e">{UK_LOCATIONS.map((t) => <option key={t} value={t} />)}</datalist>
        <WellbeingInput impact={e.wellbeingImpact} note={e.wellbeingNote} onChange={(impact, note) => setE((p) => ({ ...p, wellbeingImpact: impact, wellbeingNote: note }))} />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex justify-between gap-2 pt-2">
          {onDelete ? <button type="button" className="btn btn-danger" onClick={onDelete}>Delete</button> : <span />}
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            {onSaveAndAnother && (
              <button type="button" className="btn" disabled={!!error} onClick={() => { if (error) return; onSaveAndAnother(build()); }}>
                Save &amp; add another
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={!!error}>Save</button>
          </div>
        </div>
      </form>
    </div>
  );
}
