import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { CATEGORIES, displayLabel, formatDate, newId, wantsLocation, type Person, type Significance, type TimelineEvent } from "@/chronology/lib/timeline";
import { UK_LOCATIONS } from "@/chronology/lib/locations";
import { MonthYearInput } from "@/chronology/components/MonthYearInput";
import { WellbeingInput } from "@/chronology/components/WellbeingInput";
import { wellbeingOf, type WellbeingImpact } from "@/chronology/lib/wellbeing";

const QUESTIONS: Record<string, string> = {
  living: "Where has the young person lived? Add each home or placement move.",
  education: "What education history and events should be recorded — schools, settings, exclusions, support plans, key changes?",
  health: "Any health or wellbeing events — diagnoses, assessments, admissions?",
  family: "What important family or relationship changes have happened?",
  services: "Which professionals or services have been involved?",
  significant: "Any other significant events to record?",
};

interface Props {
  person: Person;
  onPerson: (p: Partial<Person>) => void;
  events: TimelineEvent[];
  onAdd: (e: TimelineEvent) => void;
  onUpdate: (e: TimelineEvent) => void;
  step: number;
  onStep: (n: number) => void;
  onFinish: () => void;
  onSample: () => void;
  onStartOver: () => void;
  onEdit: (e: TimelineEvent) => void;
  onDelete: (e: TimelineEvent) => void;
}

const REVIEW = CATEGORIES.length + 1;
const TOTAL = CATEGORIES.length + 2;

const NOUN: Record<string, [string, string]> = {
  living: ["living arrangement", "living arrangements"],
  education: ["education event", "education events"],
  health: ["health event", "health events"],
  family: ["family or relationship change", "family or relationship changes"],
  services: ["professional involvement", "professional involvements"],
  significant: ["significant event", "significant events"],
};

type Phase = "ask" | "entry" | "another";

/** Full-screen step-by-step entry: person details, then one category at a time as a series of questions. */
export function GuidedEntry({ person, onPerson, events, onAdd, onUpdate, step, onStep, onFinish, onSample, onStartOver, onEdit, onDelete }: Props) {
  const isReview = step === REVIEW;
  const cat = step > 0 && !isReview ? CATEGORIES[step - 1]! : null;
  const types = (cat?.types ?? []) as readonly string[];
  const [phase, setPhase] = useState<Phase>("ask");
  const [lastAdded, setLastAdded] = useState<TimelineEvent | null>(null);
  const [date, setDate] = useState("");
  const [type, setType] = useState<string>(types[0] ?? "");
  const [label, setLabel] = useState("");
  const [significance, setSignificance] = useState<Significance>("medium");
  const [error, setError] = useState("");
  const [hasEnd, setHasEnd] = useState(true);
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [wellbeingImpact, setWellbeingImpact] = useState<WellbeingImpact>();
  const [wellbeingNote, setWellbeingNote] = useState("");
  const [pStep, setPStep] = useState(() => (!person.label ? 0 : !person.dob ? 1 : !person.preparedBy ? 2 : 3));
  const [pReturn, setPReturn] = useState(false);
  const [fading, setFading] = useState(false);

  /** Fade the current screen out, swap to the next one, then fade it in. */
  const fadeTo = (run: () => void) => {
    if (fading) return;
    setFading(true);
    window.setTimeout(() => { run(); setFading(false); }, 300);
  };

  const periodCat = cat?.id === "living" || cat?.id === "education";
  const locField = wantsLocation(type);
  const last = step >= TOTAL - 1;
  const inCat = cat ? events.filter((e) => e.category === cat.id).sort((a, b) => a.start.localeCompare(b.start)) : [];
  const shown = lastAdded ? events.find((e) => e.id === lastAdded.id) ?? null : null;
  const view: Phase = phase === "another" && !shown ? "ask" : phase;
  const [one, many] = cat ? NOUN[cat.id] ?? [cat.name.toLowerCase(), cat.name.toLowerCase()] : ["", ""];

  const applyStep = (n: number) => {
    const c = n > 0 && n < REVIEW ? CATEGORIES[n - 1] : undefined;
    onStep(n); setType(c?.types[0] ?? ""); setLabel(""); setError(""); setEnd(""); setLocation("");
    setWellbeingImpact(undefined); setWellbeingNote("");
    setHasEnd(!!c && (c.id === "living" || c.id === "education"));
    setPhase("ask"); setLastAdded(null); setDate("");
    window.scrollTo?.(0, 0);
  };
  const go = (n: number) => fadeTo(() => applyStep(n));


  const startEntry = () => fadeTo(() => {
    // Follow on from the latest entry in this section
    const prev = inCat[inCat.length - 1];
    if (prev) setDate(prev.end || prev.start);
    else if (cat?.id === "living" && person.dob) setDate(person.dob);
    setLabel(""); setEnd(""); setError(""); setLocation("");
    setWellbeingImpact(undefined); setWellbeingNote("");
    setHasEnd(periodCat);
    setPhase("entry");
  });


  const submitPerson = () => {
    if (fading) return;
    fadeTo(() => {
      if (pReturn) { setPReturn(false); setPStep(3); }
      else if (pStep >= 2) { setPStep(3); applyStep(1); }
      else setPStep(pStep + 1);
    });
  };


  const commit = () => {
    if (!cat) return;
    if (!date) { setError("Choose a month and year"); return; }
    const useEnd = periodCat && hasEnd && end;
    if (useEnd && end < date) { setError("The 'to' date is before the 'from' date"); return; }
    setError("");
    if (periodCat) {
      const open = inCat.filter((e) => !e.end && !e.ongoing && e.start < date).pop();
      if (open) onUpdate({ ...open, end: date, endPrecision: "month" });
    }
    const ev: TimelineEvent = {
      id: newId(), category: cat.id, type, label: label.trim() || type, location: locField ? location.trim() : "",
      start: date, startPrecision: "month", end: useEnd ? end : "", endPrecision: "month",
      ongoing: false, approximate: false, significance, note: "",
      wellbeingImpact, wellbeingNote: wellbeingNote.trim(),
    };
    onAdd(ev);
    setLastAdded(ev);
    fadeTo(() => setPhase("another"));
  };


  const nextName = last ? "" : step + 1 === REVIEW ? "Review" : CATEGORIES[step]!.name;

  return (
    <div className="fixed inset-0 z-40 flex h-dvh flex-col overflow-hidden bg-background">
      <datalist id="uk-towns-g">{UK_LOCATIONS.map((t) => <option key={t} value={t} />)}</datalist>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-3 px-4 py-3">
          <p role="note" className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lock size={14} className="mt-0.5 shrink-0" />
            <span>Nothing you enter leaves this device or is saved. Closing this tab clears everything. Use Export CSV to keep a copy.</span>
          </p>
          <span className="flex shrink-0 gap-3 text-sm">
            <button type="button" className="font-medium text-primary underline" onClick={() => fadeTo(onSample)}>Try a sample</button>
            <button type="button" className="font-medium text-primary underline" onClick={() => fadeTo(onFinish)}>Skip to timeline</button>
            <button type="button" className="font-medium text-destructive underline" onClick={onStartOver}>Start again</button>

          </span>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div key={`${step}-${pStep}-${phase}`} className={`mx-auto max-w-3xl space-y-5 px-4 py-6 ${fading ? "fade-out" : "fade-in"}`}>
          {isReview ? (
            <>
              <div>
                <h2 className="text-2xl font-extrabold">Review</h2>
                <p className="text-sm text-muted-foreground">Check everything before viewing the timeline. Edit or delete anything that needs changing.</p>
              </div>
              <div className="panel grid gap-4">
                <p className="label">Young person</p>
                <div>
                  <label className="label" htmlFor="r-ref">Initials or reference (avoid full names)</label>
                  <input id="r-ref" className="field" value={person.label} autoComplete="off" onChange={(e) => onPerson({ label: e.target.value })} />
                </div>
                <MonthYearInput label="Date of birth" value={person.dob} onChange={(v) => onPerson({ dob: v, dobPrecision: "month" })} />
                <div>
                  <label className="label" htmlFor="r-prep">Prepared by</label>
                  <input id="r-prep" className="field" value={person.preparedBy} autoComplete="off" onChange={(e) => onPerson({ preparedBy: e.target.value })} />
                </div>
              </div>
              {CATEGORIES.map((c, i) => {
                const list = events.filter((e) => e.category === c.id).sort((a, b) => a.start.localeCompare(b.start));
                return (
                  <div key={c.id} className="panel border-l-4" style={{ borderLeftColor: `var(--cat-${c.id})` }}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-bold">{c.name} <span className="text-sm font-normal text-muted-foreground">({list.length})</span></p>
                      <button type="button" className="text-sm font-medium text-primary underline" onClick={() => go(i + 1)}>Add more</button>
                    </div>
                    {list.length ? (
                      <ul className="divide-y text-sm">
                        {list.map((e) => (
                          <li key={e.id} className="flex items-center justify-between gap-2 py-2">
                            <span className="min-w-0">
                              <span className="text-muted-foreground">{formatDate(e.start, e.startPrecision)}</span> · {displayLabel(e)}
                              <span className="block text-xs text-muted-foreground">{e.type} · {e.significance} significance</span>
                              <span className="block text-xs text-muted-foreground">Wellbeing: {wellbeingOf(e).label} · practitioner judgement</span>
                            </span>
                            <span className="flex shrink-0 gap-1">
                              <button type="button" className="btn h-9 w-9 p-0" aria-label={`Edit ${e.label}`} onClick={() => onEdit(e)}><Pencil size={14} /></button>
                              <button type="button" className="btn btn-danger h-9 w-9 p-0" aria-label={`Delete ${e.label}`} onClick={() => onDelete(e)}><Trash2 size={14} /></button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">Nothing entered.</p>}
                  </div>
                );
              })}
            </>
          ) : !cat ? (
            <>
              <div>
                <h2 className="text-2xl font-extrabold">About the young person</h2>
                <p className="text-sm text-muted-foreground">One question at a time. You'll then go through each area of their life in turn.</p>
              </div>
              {pStep === 3 ? (
                <div className="panel space-y-4">
                  <p className="label">Young person</p>
                  <ul className="divide-y text-sm">
                    {([
                      ["Initials or reference", person.label],
                      ["Date of birth", person.dob ? formatDate(person.dob, "month") : ""],
                      ["Prepared by", person.preparedBy],
                    ] as const).map(([q, v], i) => (
                      <li key={q} className="flex items-center justify-between gap-2 py-2">
                        <span className="min-w-0">
                          <span className="text-muted-foreground">{q}</span>
                          <span className="block font-medium">{v || "Not given"}</span>
                        </span>
                        <button type="button" className="btn h-9 w-9 p-0" aria-label={`Change ${q.toLowerCase()}`} onClick={() => { setPReturn(true); setPStep(i); }}><Pencil size={14} /></button>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <button type="button" className="btn btn-primary" onClick={() => go(1)}>Next: {CATEGORIES[0].name} <ArrowRight size={15} /></button>
                  </div>
                </div>
              ) : (
                <div className="panel">
                  {pStep === 0 && (
                    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submitPerson(); }}>
                      <p className="text-lg font-bold">What initials or reference should we use for them?</p>
                      <p className="text-sm text-muted-foreground">Avoid full names — initials or a reference is enough.</p>
                      <input id="g-ref" className="field" autoFocus value={person.label} autoComplete="off" onChange={(e) => onPerson({ label: e.target.value })} />
                      <button type="submit" className="btn btn-primary">Continue <ArrowRight size={15} /></button>
                    </form>
                  )}
                  {pStep === 1 && (
                    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submitPerson(); }}>
                      <p className="text-lg font-bold">When were they born?</p>
                      <p className="text-sm text-muted-foreground">Month and year is enough — it's used to show their age on the timeline.</p>
                      <div className="max-w-xs"><MonthYearInput label="Date of birth" value={person.dob} onChange={(v) => onPerson({ dob: v, dobPrecision: "month" })} /></div>
                      <button type="submit" className="btn btn-primary">Continue <ArrowRight size={15} /></button>
                    </form>
                  )}
                  {pStep === 2 && (
                    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submitPerson(); }}>
                      <p className="text-lg font-bold">Who is preparing this chronology?</p>
                      <p className="text-sm text-muted-foreground">Your initials or role — it appears on exports.</p>
                      <input id="g-prep" className="field" autoFocus value={person.preparedBy} autoComplete="off" onChange={(e) => onPerson({ preparedBy: e.target.value })} />
                      <button type="submit" className="btn btn-primary">Continue <ArrowRight size={15} /></button>
                    </form>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="border-l-4 pl-3" style={{ borderLeftColor: `var(--cat-${cat.id})` }}>
                <h2 className="text-2xl font-extrabold">{cat.name}</h2>
                <p className="text-sm text-muted-foreground">{QUESTIONS[cat.id] ?? `Add any ${cat.name.toLowerCase()} events.`}</p>
              </div>
              {view === "ask" && (
                <div className="panel space-y-4">
                  <p className="text-lg font-bold">
                    {inCat.length ? `You have ${inCat.length} ${inCat.length === 1 ? one : many}. Add more?` : `Do you want to add ${many}?`}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-primary" onClick={startEntry}><Check size={15} /> Yes</button>
                    <button type="button" className="btn" onClick={() => go(step + 1)}>No, {nextName ? `next: ${nextName}` : "continue"}</button>
                  </div>
                </div>
              )}
              {phase === "another" && shown && (
                <div className="panel space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Added: <span className="font-semibold text-foreground">{shown.label}</span>, {formatDate(shown.start, "month")}{shown.end ? ` – ${formatDate(shown.end, "month")}` : ""}
                  </p>
                  <p className="text-lg font-bold">Add another {one}?</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-primary" onClick={startEntry}><Plus size={15} /> Yes, add another</button>
                    <button type="button" className="btn" onClick={() => go(step + 1)}>No, {nextName ? `next: ${nextName}` : "continue"}</button>
                  </div>
                </div>
              )}
              {phase === "entry" && (
              <form className="panel grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); commit(); }}>
                <p className="text-lg font-bold sm:col-span-2">Enter the {inCat.length ? "next" : "first"} {one}</p>
                <MonthYearInput label={periodCat && hasEnd ? "From" : "Date"} value={date} onChange={setDate} />
                {periodCat && (
                  <div className="sm:col-span-2 space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={hasEnd} onChange={(e) => setHasEnd(e.target.checked)} /> Add a "to" date (period)</label>
                    {hasEnd && <MonthYearInput label="To" value={end} onChange={setEnd} />}
                  </div>
                )}
                <div>
                  <span className="label">Type</span>
                  <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <span className="label">Label</span>
                  <input className="field" value={label} placeholder="Short description (avoid full names)" autoComplete="off" onChange={(e) => setLabel(e.target.value)} />
                </div>
                {locField && (
                  <div className="sm:col-span-2">
                    <span className="label">Town or city</span>
                    <input className="field" list="uk-towns-g" value={location} placeholder="e.g. Leeds" autoComplete="off" onChange={(e) => setLocation(e.target.value)} />
                  </div>
                )}
                <div>
                  <span className="label">Significance</span>
                  <select className="field" value={significance} onChange={(e) => setSignificance(e.target.value as Significance)}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button type="button" className="btn h-10" onClick={() => fadeTo(() => setPhase(lastAdded ? "another" : "ask"))}>Cancel</button>
                  <button type="submit" className="btn btn-primary h-10 flex-1"><Check size={16} /> Save</button>
                </div>
                <div className="sm:col-span-2">
                  <WellbeingInput impact={wellbeingImpact} note={wellbeingNote} onChange={(impact, note) => { setWellbeingImpact(impact); setWellbeingNote(note); }} />
                </div>
                {error && <p className="text-xs text-destructive sm:col-span-2">{error}</p>}
              </form>
              )}
              <div className="panel">
                <p className="label">Added in this section ({inCat.length})</p>
                {inCat.length ? (
                  <ul className="divide-y text-sm">
                    {inCat.map((e) => (
                      <li key={e.id} className="flex items-center justify-between gap-2 py-2">
                        <span className="min-w-0">
                          <span className="text-muted-foreground">{formatDate(e.start, e.startPrecision)}{e.end ? ` – ${formatDate(e.end, e.endPrecision)}` : ""}</span> · {displayLabel(e)}
                          <span className="block text-xs text-muted-foreground">{e.type} · {e.significance} significance</span>
                          <span className="block text-xs text-muted-foreground">Wellbeing: {wellbeingOf(e).label} · practitioner judgement</span>
                        </span>
                        <span className="flex shrink-0 gap-1">
                          <button type="button" className="btn h-9 w-9 p-0" aria-label={`Edit ${e.label}`} onClick={() => onEdit(e)}><Pencil size={14} /></button>
                          <button type="button" className="btn btn-danger h-9 w-9 p-0" aria-label={`Delete ${e.label}`} onClick={() => onDelete(e)}><Trash2 size={14} /></button>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">Nothing yet. Add events above, or skip if none apply.</p>}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-3">
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Step {step + 1} of {TOTAL}</span>
              <span>{Math.round(((step + 1) / TOTAL) * 100)}%</span>
            </div>
            <div className="flex gap-1">
              <button type="button" aria-label="About the young person" onClick={() => go(0)} className="h-2 flex-1 rounded-full bg-primary" style={{ opacity: 1 }} />
              {CATEGORIES.map((c, i) => (
                <button key={c.id} type="button" onClick={() => go(i + 1)} aria-label={c.name} title={c.name}
                  className="h-2 flex-1 rounded-full" style={{ backgroundColor: `var(--cat-${c.id})`, opacity: i + 1 <= step ? 1 : 0.2 }} />
              ))}
              <button type="button" aria-label="Review" title="Review" onClick={() => go(REVIEW)}
                className="h-2 flex-1 rounded-full bg-foreground" style={{ opacity: isReview ? 1 : 0.2 }} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button type="button" className="btn" disabled={step === 0} onClick={() => go(step - 1)}><ArrowLeft size={15} /> Back</button>
            {last
              ? <button type="button" className="btn btn-primary" onClick={() => fadeTo(onFinish)}><Check size={15} /> Finish and view timeline</button>
              : <button type="button" className="btn btn-primary" onClick={() => go(step + 1)}>
                  <span className="truncate">{cat && !inCat.length ? "Skip" : "Next"}: {nextName}</span> <ArrowRight size={15} />
                </button>}
          </div>
        </div>
      </footer>
    </div>
  );
}
