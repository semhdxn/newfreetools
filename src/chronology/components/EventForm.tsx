import { useState } from "react";
import { CATEGORIES, catById, newId, normalise, todayISO, wantsLocation, type TimelineEvent } from "@/chronology/lib/timeline";
import { MonthYearInput as DateInput } from "@/chronology/components/MonthYearInput";
import { UK_LOCATIONS } from "@/chronology/lib/locations";
import { WellbeingInput } from "@/chronology/components/WellbeingInput";

interface Props {
  initial?: TimelineEvent | undefined;
  onSave: (e: TimelineEvent) => void;
  onSaveAndAnother?: ((e: TimelineEvent) => void) | undefined;
  onDelete?: (() => void) | undefined;
  onClose: () => void;
}

export function EventForm({ initial, onSave, onSaveAndAnother, onDelete, onClose }: Props) {
  const [e, setE] = useState<TimelineEvent>(
    initial ?? { id: newId(), category: "living", type: CATEGORIES[0].types[0], label: "", location: "", start: "", startPrecision: "month", end: "", endPrecision: "month", ongoing: false, approximate: false, significance: "medium", note: "" },
  );
  const cat = catById(e.category);
  const isCustom = !(cat.types as readonly string[]).includes(e.type);
  const [custom, setCustom] = useState(isCustom);
  const set = <K extends keyof TimelineEvent>(k: K, v: TimelineEvent[K]) => setE((p) => ({ ...p, [k]: v }));

  const error = !e.start ? "Start date is required" : e.end && e.end < e.start ? "End date is before start date" : !e.type.trim() ? "Type is required" : "";

  const build = () => ({
    ...e,
    label: e.label.trim() || e.type,
    wellbeingNote: e.wellbeingNote?.trim() ?? "",
    start: normalise(e.start, e.startPrecision),
    end: e.ongoing ? "" : normalise(e.end, e.endPrecision),
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label">Category</span>
            <select className="field" value={e.category} onChange={(ev) => { const c = catById(ev.target.value); setE((p) => ({ ...p, category: c.id, type: c.types[0] })); setCustom(false); }}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <span className="label">Type</span>
            {custom ? (
              <input className="field" value={e.type} placeholder="Custom type" onChange={(ev) => set("type", ev.target.value)} />
            ) : (
              <select className="field" value={e.type} onChange={(ev) => { if (ev.target.value === "__custom") { setCustom(true); set("type", ""); } else set("type", ev.target.value); }}>
                {cat.types.map((t) => <option key={t}>{t}</option>)}
                <option value="__custom">Custom…</option>
              </select>
            )}
          </div>
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
        <DateInput label="Start date" value={e.start} onChange={(v) => setE((p) => ({ ...p, start: v, startPrecision: "month" }))} />
        {!e.ongoing && <DateInput label="End date (optional)" value={e.end} onChange={(v) => setE((p) => ({ ...p, end: v, endPrecision: "month" }))} />}
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={e.ongoing} onChange={(ev) => set("ongoing", ev.target.checked)} /> Ongoing (to {todayISO().split("-").reverse().join("/")})</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={e.approximate} onChange={(ev) => set("approximate", ev.target.checked)} /> Date approximate</label>
        </div>
        <div>
          <span className="label">Significance</span>
          <select className="field" value={e.significance} onChange={(ev) => set("significance", ev.target.value as TimelineEvent["significance"])}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </div>
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
