import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ToolId } from '@/lib/storage';
import { ADSENSE_SLOTS, INTERSTITIAL_COUNTDOWN_SECONDS } from '@/lib/adConfig';
import { AdBanner } from './AdBanner';

/**
 * Full-page interstitial shown every few pages through a questionnaire.
 * "Continue" is disabled and shows a live countdown until the configured
 * number of seconds has passed.
 */
export function InterstitialGate({ toolId, onContinue }: { toolId: ToolId; onContinue: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(INTERSTITIAL_COUNTDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const ready = secondsLeft <= 0;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Megaphone className="h-4 w-4" />
        Advertisement
      </div>
      <AdBanner toolId={toolId} slot={ADSENSE_SLOTS.interstitial} className="h-40" />
      <Button size="lg" onClick={onContinue} disabled={!ready} className="w-full max-w-xs">
        {ready ? 'Continue' : `Continue (${secondsLeft})`}
      </Button>
      <p className="text-xs text-muted-foreground">Ads like this help keep these tools free.</p>
    </div>
  );
}
