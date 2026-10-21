import type { CSSProperties } from "react";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  /** Optional CSS colour for a coloured left edge (e.g. a category colour). */
  accent?: string;
}

interface Props<T extends string> {
  label: string;
  options: readonly ChipOption<T>[];
  value: T | "";
  onChange: (v: T) => void;
  className?: string;
}

/** Always-visible single-choice buttons. One click to choose, no menu to open. */
export function ChipSelect<T extends string>({ label, options, value, onChange, className }: Props<T>) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className="chip"
            data-accent={o.accent ? "" : undefined}
            style={o.accent ? ({ "--chip-accent": o.accent } as CSSProperties) : undefined}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const EVENT_OR_PERIOD = [
  { value: "event", label: "Single event" },
  { value: "period", label: "Period (from – to)" },
] as const satisfies readonly ChipOption<"event" | "period">[];

export const SIGNIFICANCE_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const satisfies readonly ChipOption<"low" | "medium" | "high">[];
