import { WELLBEING_OPTIONS, type WellbeingImpact } from "@/chronology/lib/wellbeing";

interface Props {
  impact?: WellbeingImpact | undefined;
  note?: string | undefined;
  onChange: (impact: WellbeingImpact | undefined, note: string) => void;
}

export function WellbeingInput({ impact, note = "", onChange }: Props) {
  return (
    <fieldset className="min-w-0 space-y-2 border-t pt-3">
      <legend className="text-sm font-semibold">In your judgement, how did this affect their wellbeing? (optional)</legend>
      <label className="label">
        Practitioner judgement
        <select aria-label="Practitioner judgement" className="field mt-1" value={impact ?? ""} onChange={(e) => onChange(WELLBEING_OPTIONS.find((o) => o.value === e.target.value)?.value, note)}>
          <option value="">Unassessed — leave blank</option>
          {WELLBEING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.symbol} {o.label}</option>)}
        </select>
      </label>
      <label className="label">
        Reason for your judgement (optional)
        <textarea aria-label="Reason for your judgement (optional)" className="field mt-1 min-h-16" value={note} autoComplete="off" onChange={(e) => onChange(impact, e.target.value)} />
      </label>
      <p className="text-xs text-muted-foreground">Practitioner judgement—not a wellbeing assessment.</p>
    </fieldset>
  );
}