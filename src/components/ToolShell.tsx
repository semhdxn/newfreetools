import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Progress } from './ui';

/**
 * Shared chrome for every tool: pseudonym badge, step progress, save note and
 * an always-visible exit route back to the home page. Progress is autosaved,
 * so "exit" never loses work.
 */
export function ToolShell({
  title,
  intro,
  childId,
  stepIndex,
  stepCount,
  stepLabel,
  onRestart,
  children,
  footer,
}: {
  title: string;
  intro?: ReactNode;
  childId: string;
  stepIndex?: number;
  stepCount?: number;
  stepLabel?: string;
  onRestart: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const showProgress = typeof stepIndex === 'number' && typeof stepCount === 'number' && stepCount > 0;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← All tools
        </Link>
        <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
          ID: {childId}
        </span>
      </div>

      <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
      {intro && <div className="mt-2 text-sm text-muted-foreground sm:text-base">{intro}</div>}

      {showProgress && (
        <div className="mt-5">
          <Progress
            value={((stepIndex! + 1) / stepCount!) * 100}
            label={`${stepLabel ? `${stepLabel} — ` : ''}Step ${stepIndex! + 1} of ${stepCount}`}
          />
        </div>
      )}

      <div className="mt-6 space-y-6">{children}</div>

      {footer && <div className="mt-8">{footer}</div>}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
        <p>Your answers are saved in this browser only. Nothing is uploaded.</p>
        <Button
          variant="ghost"
          onClick={() => {
            if (window.confirm('Clear this questionnaire and start again with a new ID?')) onRestart();
          }}
        >
          Start again
        </Button>
      </div>
    </div>
  );
}

/** Sticky next/back bar so the controls are always reachable on mobile. */
export function StepNav({
  onBack,
  onNext,
  nextLabel = 'Next',
  backLabel = 'Back',
  nextDisabled,
  hideBack,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  hideBack?: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {hideBack ? <span /> : (
          <Button variant="outline" onClick={onBack} disabled={!onBack}>
            {backLabel}
          </Button>
        )}
        <Button variant="accent" size="lg" onClick={onNext} disabled={nextDisabled || !onNext}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

export function ResultsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
      {children}
    </Card>
  );
}
