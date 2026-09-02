import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BreathingBubble } from './games/BreathingBubble';
import { PopBubbles } from './games/PopBubbles';
import { StretchShake } from './games/StretchShake';
import { DoodlePad } from './games/DoodlePad';
import { GlowTrail } from './games/GlowTrail';
import { MatchPairs } from './games/MatchPairs';
import { SpotOddOne } from './games/SpotOddOne';

export type BrainBreakGame =
  | 'breathing'
  | 'bubbles'
  | 'stretch'
  | 'doodle'
  | 'glow'
  | 'match'
  | 'spot';

export const BRAIN_BREAK_GAMES: BrainBreakGame[] = [
  'breathing', 'bubbles', 'stretch', 'doodle', 'glow', 'match', 'spot',
];

const TITLES: Record<BrainBreakGame, { title: string; description: string }> = {
  breathing: { title: 'Take a calm breath', description: 'Watch the bubble — breathe in as it grows, out as it shrinks.' },
  bubbles:   { title: 'Pop the bubbles',    description: 'Tap the bubbles to pop them. Take as long as you like.' },
  stretch:   { title: 'Stretch & shake',    description: 'Three little movements to wake up your body.' },
  doodle:    { title: 'Quick doodle',       description: 'Draw whatever you like — nothing is saved.' },
  glow:      { title: 'Glow trail',         description: 'Drag your finger to leave a soft glowing trail.' },
  match:     { title: 'Match the pairs',    description: 'Tap two cards to find a matching pair.' },
  spot:      { title: 'Spot the odd one',   description: 'Find the shape that\u2019s a little different.' },
};

/** Pick a random game; deterministic if `seed` is provided so refresh stays put.
 *  @deprecated Prefer pickBrainBreakGameSet so the four slots stay distinct. */
export const pickBrainBreakGame = (seed?: number): BrainBreakGame => {
  if (typeof seed === 'number') return BRAIN_BREAK_GAMES[Math.abs(seed) % BRAIN_BREAK_GAMES.length];
  return BRAIN_BREAK_GAMES[Math.floor(Math.random() * BRAIN_BREAK_GAMES.length)];
};

/**
 * Tiny seeded PRNG (mulberry32) — deterministic given the same seed so a
 * mid-assessment refresh keeps the same per-slot game.
 */
const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Returns 4 *distinct* games for the four brain-break slots in one
 * assessment. Stable for a given seed. If fewer than 4 games are
 * configured, the result is just a shuffle of all available.
 */
export const pickBrainBreakGameSet = (seed: number, count = 4): BrainBreakGame[] => {
  const rand = mulberry32(seed || 1);
  const pool = [...BRAIN_BREAK_GAMES];
  // Fisher–Yates shuffle using the seeded PRNG.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
};

interface BrainBreakProps {
  /** Which mini-game to render. */
  game: BrainBreakGame;
  /** Continue to the next assessment stage. */
  onContinue: () => void;
  /** Skip the break (also continues, but distinguishes intent for analytics). */
  onSkip?: () => void;
  /** Slot rendered above the card — used for the global progress strip. */
  topSlot?: React.ReactNode;
}

/**
 * Brain Break host card. Sits between major assessment stages and runs
 * one short, optional mini-game. Hard-caps at 60s to keep the flow moving.
 */
export const BrainBreak = ({ game, onContinue, onSkip, topSlot }: BrainBreakProps) => {
  const [gameDone, setGameDone] = useState(false);
  const meta = TITLES[game];

  // Hard 60s cap — even if the inner game forgets to call onDone, we surface
  // the Continue button so the pupil never gets stuck.
  useEffect(() => {
    const t = window.setTimeout(() => setGameDone(true), 60_000);
    return () => window.clearTimeout(t);
  }, []);

  const inner = useMemo(() => {
    switch (game) {
      case 'breathing': return <BreathingBubble onDone={() => setGameDone(true)} />;
      case 'bubbles':   return <PopBubbles onDone={() => setGameDone(true)} />;
      case 'stretch':   return <StretchShake onDone={() => setGameDone(true)} />;
      case 'doodle':    return <DoodlePad />;
      case 'glow':      return <GlowTrail onDone={() => setGameDone(true)} />;
      case 'match':     return <MatchPairs onDone={() => setGameDone(true)} />;
      case 'spot':      return <SpotOddOne onDone={() => setGameDone(true)} />;
      default:          return null;
    }
  }, [game]);

  return (
    <div className="min-h-dvh bg-background flex items-start justify-center p-3 sm:p-4 pt-32 sm:pt-32 pb-40">
      {topSlot}
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Brain break</span>
          </div>
          <CardTitle className="text-xl">{meta.title}</CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inner}
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onSkip ?? onContinue} className="min-h-[44px]">
              Skip
            </Button>
            <Button onClick={onContinue} className="min-h-[44px]" disabled={game === 'doodle' || game === 'glow' ? false : !gameDone}>
              {(game === 'doodle' || game === 'glow') ? 'Continue' : (gameDone ? 'Continue' : 'Continue when ready')}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};