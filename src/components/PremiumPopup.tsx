import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { PREMIUM_URL } from '@/lib/links';

const STORAGE_KEY = 'semh-free-tools-popup-last-shown';
const SHOW_DELAY_MS = 4000;
const GOOGLE_CONSENT_SELECTOR = '.fc-consent-root';
const MAX_WAIT_FOR_CONSENT_MS = 30000;

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the visitor's own timezone

function alreadyShownToday(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === today();
  } catch {
    return true; // storage blocked: never nag
  }
}

function markShown() {
  try {
    window.localStorage.setItem(STORAGE_KEY, today());
  } catch {
    // ignore
  }
}

const POINTS = [
  'Save results securely and build a record for each young person',
  'Professional PDF reports, and comparisons to see progress over time',
  'Gentle review reminders, plus a completely ad-free experience',
];

/**
 * Once-a-day reminder about the full SEMH Toolkit. Mount it only on adult-facing
 * pages (the home page): never on Pupil Voice or the Chronology Builder. It waits
 * a few seconds, and waits for Google's consent message to be dismissed first so
 * two dialogs never stack.
 */
export function PremiumPopup() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (alreadyShownToday()) return;
    let cancelled = false;
    const started = Date.now();
    let timer: number;

    const attempt = () => {
      if (cancelled) return;
      const consentVisible = Boolean(document.querySelector(GOOGLE_CONSENT_SELECTOR));
      if (consentVisible && Date.now() - started < MAX_WAIT_FOR_CONSENT_MS) {
        timer = window.setTimeout(attempt, 1000);
        return;
      }
      if (consentVisible) return; // still blocked after 30s: skip today rather than stack dialogs
      markShown();
      setOpen(true);
    };
    timer = window.setTimeout(attempt, SHOW_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/50 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-popup-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">SEMH Toolkit</p>
        <h2 id="premium-popup-title" className="mt-1 font-display text-xl font-extrabold">
          Want to go beyond a one-off check?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          These free tools are a starting point. The full SEMH Toolkit helps you keep records and track progress.
        </p>
        <ul className="mt-4 space-y-2">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href={`${PREMIUM_URL}?utm_source=freetools&utm_medium=popup`}
            className="sm:flex-1"
            onClick={() => setOpen(false)}
          >
            <Button variant="accent" size="lg" className="w-full">
              Explore the full toolkit
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </a>
          <Button variant="outline" size="lg" className="sm:flex-1" onClick={() => setOpen(false)}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
