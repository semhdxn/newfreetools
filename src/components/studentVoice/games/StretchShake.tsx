import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

const PROMPTS = [
  { text: 'Roll your shoulders', emoji: '🤸' },
  { text: 'Wiggle your fingers', emoji: '🖐️' },
  { text: 'Big stretch up high', emoji: '🙆' },
];

/**
 * Stretch & Shake.
 * Three guided physical prompts. Pupil taps "Done" to advance, or it auto
 * advances after 12s. No win/lose; just movement breaks.
 */
export const StretchShake = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (step + 1 >= PROMPTS.length) onDone();
      else setStep(step + 1);
    }, 12_000);
    return () => window.clearTimeout(t);
  }, [step, onDone]);

  const p = PROMPTS[step];
  const next = () => {
    if (step + 1 >= PROMPTS.length) onDone();
    else setStep(step + 1);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-8">
      <div className="text-7xl animate-pulse" aria-hidden>{p.emoji}</div>
      <p className="text-xl font-medium">{p.text}</p>
      <p className="text-xs text-muted-foreground">Stretch {step + 1} of {PROMPTS.length}</p>
      <Button onClick={next} className="min-h-[44px]">Done</Button>
    </div>
  );
};