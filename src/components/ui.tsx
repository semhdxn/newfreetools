import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base', icon: 'h-9 w-9 p-0' };
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    accent: 'bg-accent text-accent-foreground hover:opacity-90',
    outline: 'border border-border bg-card text-foreground hover:bg-muted',
    ghost: 'text-foreground hover:bg-muted',
    secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}

type CardProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode; className?: string };

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-5 shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

/** Optional 4-part Card layout (header/title/description/content) for screens
 *  that need more structure than a bare <Card>. Purely presentational — no
 *  behaviour beyond spacing, so any tool can mix these with a plain <Card>. */
export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('space-y-1.5 p-5 pb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('font-display text-lg font-bold', className)} {...props}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-border text-foreground',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Progress({ value, label, className }: { value: number; label?: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
      <div
        className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
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

/** Same green/amber/red bands used across the results pages: low ≤25%, moderate 26-75%, high >75% of `max`. */
function bandedTone(value: number, max: number): string {
  const pct = max === 0 ? 0 : (value / max) * 100;
  if (pct <= 25) return 'bg-success';
  if (pct <= 75) return 'bg-amber-500';
  return 'bg-destructive';
}

export function ScoreBar({
  label,
  value,
  max = 100,
  suffix = '%',
  banded = false,
}: {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  /** When true, the bar colour follows the same low/moderate/high bands as
   * the results pages instead of a flat brand colour. Only meaningful when a
   * higher value means more support is needed — leave off (default) when a
   * higher score is simply "better", e.g. Measure What Matters. */
  banded?: boolean;
}) {
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
        <div
          className={`h-full rounded-full transition-all ${banded ? bandedTone(value, max) : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
