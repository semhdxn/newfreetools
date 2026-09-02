import { Check } from 'lucide-react';
import { cn } from '@/components/ui';

export interface JourneyStep {
  key: string;
  label: string;
}

interface Props {
  steps: JourneyStep[];
  /** Index of the current step within `steps`. -1 if not in the journey. */
  currentIdx: number;
  /** Overall progress 0–100, used to fill the connector track. */
  progress: number;
  /** Sub-label for the current step (e.g. "Question 5 of 60"). */
  currentLabel?: string;
}

/**
 * Stepping-stone trail shown at the top of the Student Voice flow. Each stone
 * represents a stage; the connector between them fills as the child progresses.
 */
export function JourneyMap({ steps, currentIdx, progress, currentLabel }: Props) {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {/* Background track */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
        {/* Stones */}
        <ol className="relative flex w-full items-center justify-between" role="list">
          {steps.map((s, i) => {
            const isDone = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <li key={s.key} className="flex items-center justify-center">
                <span
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`${s.label}${isDone ? ' — done' : isCurrent ? ' — current' : ''}`}
                  className={cn(
                    'flex items-center justify-center rounded-full border-2 transition-all duration-300 motion-reduce:transition-none',
                    isDone && 'h-5 w-5 bg-primary border-primary text-primary-foreground',
                    isCurrent && 'h-6 w-6 bg-primary border-primary text-primary-foreground shadow-glow animate-stone-pulse',
                    !isDone && !isCurrent && 'h-4 w-4 bg-background border-muted-foreground/40',
                  )}
                >
                  {isDone && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      {currentLabel && (
        <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {currentLabel}
        </p>
      )}
    </div>
  );
}