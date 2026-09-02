import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, Heart, X, ArrowLeft, ArrowRight, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/components/ui';

export type SortBucket = 'loves' | 'helps' | 'not_for_me';

export interface SortDeckItem {
  id: string;
  text: string;
}

export interface SortDeckProps {
  items: SortDeckItem[];
  /** Initial sorted state (used for resume). */
  initial?: Record<string, SortBucket>;
  /** Called whenever the sort state changes. */
  onChange: (state: Record<string, SortBucket>) => void;
  accent?: 'success' | 'primary';
}

const BUCKET_LABEL: Record<SortBucket, string> = {
  loves: 'Really helps',
  helps: 'Helps a bit',
  not_for_me: 'Not for me',
};

const BUCKET_ICON: Record<SortBucket, JSX.Element> = {
  loves: <Heart className="h-4 w-4" strokeWidth={2.5} />,
  helps: <Check className="h-4 w-4" strokeWidth={3} />,
  not_for_me: <X className="h-4 w-4" strokeWidth={3} />,
};

const BUCKET_TONE: Record<SortBucket, string> = {
  loves: 'border-pink-400 bg-pink-50 text-pink-900 dark:bg-pink-950/30 dark:text-pink-100',
  helps: 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100',
  not_for_me: 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100',
};

const BUCKET_BTN: Record<SortBucket, string> = {
  loves: 'bg-[hsl(var(--brand-accent))] text-[hsl(var(--brand-accent-foreground))] hover:bg-[hsl(var(--brand-accent-hover))]',
  helps: 'bg-[hsl(var(--freq-5))] text-[hsl(var(--freq-5-foreground))] hover:bg-[hsl(var(--freq-5)/0.85)]',
  not_for_me: 'bg-[hsl(var(--freq-2))] text-[hsl(var(--freq-2-foreground))] hover:bg-[hsl(var(--freq-2)/0.85)]',
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export const SortDeck = ({ items, initial, onChange }: SortDeckProps) => {
  const reduced = usePrefersReducedMotion();
  const [sorted, setSorted] = useState<Record<string, SortBucket>>(initial ?? {});
  const [history, setHistory] = useState<string[]>([]);
  const [animatingTo, setAnimatingTo] = useState<SortBucket | null>(null);
  const [dragOver, setDragOver] = useState<SortBucket | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // The "deck" — items not yet sorted, in original order.
  const deck = useMemo(() => items.filter((it) => !sorted[it.id]), [items, sorted]);
  const current = deck[0];
  const remaining = deck.length;
  const total = items.length;
  const done = total - remaining;

  useEffect(() => {
    setSorted(initial ?? {});
    setHistory([]);
    setAnimatingTo(null);
    setDragOver(null);
  }, [initial, items]);

  useEffect(() => {
    onChange(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted]);

  const place = (bucket: SortBucket) => {
    if (!current) return;
    const id = current.id;
    if (reduced) {
      setSorted((s) => ({ ...s, [id]: bucket }));
      setHistory((h) => [...h, id]);
      return;
    }
    setAnimatingTo(bucket);
    window.setTimeout(() => {
      setSorted((s) => ({ ...s, [id]: bucket }));
      setHistory((h) => [...h, id]);
      setAnimatingTo(null);
    }, 220);
  };

  const undo = () => {
    const lastId = history[history.length - 1];
    if (!lastId) return;
    setSorted((s) => {
      const { [lastId]: _, ...rest } = s;
      return rest;
    });
    setHistory((h) => h.slice(0, -1));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!current || animatingTo) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); place('not_for_me'); }
    else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place('helps'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); place('loves'); }
    else if (e.key === 'ArrowUp' || (e.key === 'z' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); undo(); }
  };

  // Drag handlers
  const onDragStart = (e: React.DragEvent) => {
    if (!current) return;
    e.dataTransfer.setData('text/plain', current.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDropTo = (bucket: SortBucket) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    if (!current) return;
    place(bucket);
  };

  const onDragOver = (bucket: SortBucket) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(bucket);
  };

  // Counts per bucket
  const counts = useMemo(() => {
    const c: Record<SortBucket, number> = { loves: 0, helps: 0, not_for_me: 0 };
    Object.values(sorted).forEach((b) => { c[b] += 1; });
    return c;
  }, [sorted]);

  // Animation classes for the flying card
  const flyClass = animatingTo
    ? animatingTo === 'loves'
      ? 'translate-x-[120%] -rotate-6 opacity-0'
      : animatingTo === 'not_for_me'
        ? '-translate-x-[120%] rotate-6 opacity-0'
        : 'translate-y-[120%] opacity-0'
    : '';

  const buckets: SortBucket[] = ['not_for_me', 'helps', 'loves'];

  return (
    <div
      tabIndex={0}
      onKeyDown={onKey}
      ref={cardRef as any}
      className="space-y-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
      aria-label="Sorting deck. Use arrow keys: left for not for me, down for helps a bit, right for really helps. Up arrow to undo."
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{done} of {total} sorted</span>
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Undo2 className="h-3 w-3" /> Undo
        </button>
      </div>

      {/* Card area */}
      <div className="relative h-[180px] sm:h-[200px] flex items-center justify-center">
        {current ? (
          <>
            {/* peek of next card */}
            {deck[1] && !reduced && (
              <div
                aria-hidden
                className="absolute inset-x-6 top-3 bottom-6 rounded-xl border-2 border-border bg-card/60 shadow-sm scale-[0.96] -z-0"
              />
            )}
            <div
              key={current.id}
              draggable={!animatingTo}
              onDragStart={onDragStart}
              role="button"
              aria-label={`Card: ${current.text}`}
              className={cn(
                'absolute inset-x-2 sm:inset-x-6 top-0 bottom-0 rounded-xl border-2 border-foreground/15 bg-card shadow-md',
                'flex items-center justify-center text-center px-5 cursor-grab active:cursor-grabbing select-none',
                'transition-all duration-200 ease-out motion-reduce:transition-none',
                !animatingTo && 'animate-fade-in',
                flyClass,
              )}
            >
              <p className="text-base sm:text-lg font-medium leading-snug">{current.text}</p>
            </div>
          </>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            All sorted — nice work!
          </div>
        )}
      </div>

      {/* Bucket buttons / drop targets */}
      <div className="grid grid-cols-3 gap-2">
        {buckets.map((b) => (
          <div
            key={b}
            onDragOver={onDragOver(b)}
            onDragLeave={() => setDragOver(null)}
            onDrop={onDropTo(b)}
            className={cn(
              'rounded-lg border-2 border-dashed p-2 text-center transition-colors',
              BUCKET_TONE[b],
              dragOver === b ? 'ring-2 ring-offset-1 ring-foreground/30' : '',
            )}
          >
            <button
              type="button"
              onClick={() => place(b)}
              disabled={!current || !!animatingTo}
              className={cn(
                'w-full inline-flex items-center justify-center gap-1.5 rounded-md py-2 px-2 text-xs sm:text-sm font-semibold transition-all',
                'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                BUCKET_BTN[b],
              )}
            >
              {BUCKET_ICON[b]}
              <span className="hidden xs:inline sm:inline">{BUCKET_LABEL[b]}</span>
              <span className="inline xs:hidden sm:hidden">
                {b === 'loves' ? 'Love' : b === 'helps' ? 'Helps' : 'Not me'}
              </span>
            </button>
            <p className="mt-1 text-[10px] opacity-80">{counts[b]} picked</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Tap a button, drag the card, or use <kbd className="px-1 rounded border border-border">←</kbd> <kbd className="px-1 rounded border border-border">↓</kbd> <kbd className="px-1 rounded border border-border">→</kbd>. <kbd className="px-1 rounded border border-border">↑</kbd> to undo.
      </p>
    </div>
  );
};

export default SortDeck;
