import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none';
  const sizes = { md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    accent: 'bg-accent text-accent-foreground hover:opacity-90',
    outline: 'border border-border bg-card text-foreground hover:bg-muted',
    ghost: 'text-foreground hover:bg-muted',
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-5 shadow-sm', className)}>{children}</div>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Horizontal 1-of-N choice row used by every frequency-scored questionnaire. */
export function LikertRow({
  question,
  options,
  value,
  onChange,
  name,
}: {
  question: string;
  options: { value: number; label: string }[];
  value: number | undefined;
  onChange: (v: number) => void;
  name: string;
}) {
  return (
    <fieldset className="border-b border-border py-4 last:border-0">
      <legend className="mb-3 text-sm font-medium sm:text-base">{question}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${question} — ${o.label}`}
              name={name}
              onClick={() => onChange(o.value)}
              className={cn(
                'rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                selected
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border bg-card hover:bg-muted',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-b border-border py-3 last:border-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 flex-shrink-0 accent-[hsl(var(--brand-accent))]"
      />
      <span className="text-sm sm:text-base">{label}</span>
    </label>
  );
}

export function ScoreBar({ label, value, max = 100, suffix = '%' }: { label: string; value: number; max?: number; suffix?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
