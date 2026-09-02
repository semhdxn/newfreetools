import { useEffect, useMemo, useState } from 'react';

const SYMBOLS = ['🌙', '⭐', '🌿', '🐚', '☁️', '🌈'] as const;

interface CardItem { id: number; symbol: string; }

/** Fisher–Yates shuffle (seedless — fresh layout per game instance). */
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Match the Pairs.
 * 6 cards (3 pairs) in a 3×2 grid. Tap to flip; second tap attempts a
 * match. Mismatches flip back after 900ms. No timer, no move counter.
 * Calls onDone when all three pairs are matched, then a 30s safety cap.
 */
export const MatchPairs = ({ onDone }: { onDone: () => void }) => {
  const cards = useMemo<CardItem[]>(() => {
    // Pick 3 distinct symbols, duplicate, shuffle.
    const picks = shuffle(SYMBOLS as readonly string[] as string[]).slice(0, 3);
    return shuffle(picks.flatMap((s, i) => [
      { id: i * 2,     symbol: s },
      { id: i * 2 + 1, symbol: s },
    ]));
  }, []);

  const [flipped, setFlipped] = useState<number[]>([]); // up to 2 in-flight
  const [matched, setMatched] = useState<Set<number>>(() => new Set());

  // Resolve a pair attempt.
  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    const ca = cards.find((c) => c.id === a);
    const cb = cards.find((c) => c.id === b);
    if (ca && cb && ca.symbol === cb.symbol) {
      setMatched((prev) => { const n = new Set(prev); n.add(a); n.add(b); return n; });
      setFlipped([]);
    } else {
      const t = window.setTimeout(() => setFlipped([]), 900);
      return () => window.clearTimeout(t);
    }
  }, [flipped, cards]);

  // Win condition.
  useEffect(() => {
    if (matched.size === cards.length) {
      const t = window.setTimeout(onDone, 600);
      return () => window.clearTimeout(t);
    }
  }, [matched, cards.length, onDone]);

  // Safety cap so the pupil is never stuck.
  useEffect(() => {
    const t = window.setTimeout(onDone, 30_000);
    return () => window.clearTimeout(t);
  }, [onDone]);

  const handleTap = (id: number) => {
    if (matched.has(id)) return;
    if (flipped.includes(id)) return;
    if (flipped.length >= 2) return;
    setFlipped((prev) => [...prev, id]);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {cards.map((c) => {
          const isOpen = flipped.includes(c.id) || matched.has(c.id);
          const isMatched = matched.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-label={isOpen ? `Card showing ${c.symbol}` : 'Hidden card'}
              onClick={() => handleTap(c.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTap(c.id);
                }
              }}
              className={`relative aspect-square min-h-[88px] rounded-xl border-2 transition-all duration-200
                ${isOpen
                  ? 'bg-card border-primary/50 shadow-md'
                  : 'bg-gradient-to-br from-primary/80 to-primary border-primary cursor-pointer hover:scale-[1.02]'}
                ${isMatched ? 'ring-2 ring-emerald-400/70' : ''}`}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              <span
                className={`absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl transition-opacity duration-150
                  ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden
              >
                {c.symbol}
              </span>
              {!isOpen && (
                <span className="absolute inset-0 flex items-center justify-center text-2xl text-primary-foreground/70" aria-hidden>
                  ✦
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Tap two cards to find a matching pair.
      </p>
    </div>
  );
};
