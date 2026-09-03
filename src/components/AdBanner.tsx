import { useEffect } from 'react';
import type { ToolId } from '@/lib/storage';
import { ADSENSE_CLIENT_ID, ADSENSE_CONFIGURED, adsEnabledFor } from '@/lib/adConfig';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A single AdSense banner slot. Renders nothing on tools where ads are
 * excluded (Pupil Voice). Until real AdSense client/slot IDs are filled in
 * via src/lib/adConfig.ts, this shows a reserved placeholder instead of a
 * real ad so the layout is final before the ad code is dropped in.
 *
 * `toolId` is optional — omit it for placements that aren't tied to a
 * specific tool (e.g. the home page), which are always eligible for ads.
 * Pass it whenever the banner sits inside a tool flow so the Pupil Voice
 * exclusion (and any future per-tool exclusion) is respected.
 */
export function AdBanner({
  toolId,
  slot,
  label = 'Advertisement',
  className = '',
  orientation = 'horizontal',
}: {
  toolId?: ToolId;
  slot: string;
  label?: string;
  className?: string;
  /** 'vertical' renders a fixed 160×600 skyscraper shape for a side rail
   *  instead of a full-width responsive horizontal banner. */
  orientation?: 'horizontal' | 'vertical';
}) {
  useEffect(() => {
    if (!ADSENSE_CONFIGURED || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not loaded yet, or blocked by the browser — fail silently.
    }
  }, [slot]);

  if (toolId && !adsEnabledFor(toolId)) return null;

  if (!ADSENSE_CONFIGURED || !slot) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground ${
          orientation === 'vertical' ? 'h-[600px] w-[160px]' : 'h-24 w-full'
        } ${className}`}
      >
        {label} (ad slot reserved)
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <ins
        className={`adsbygoogle ${className}`}
        style={{ display: 'inline-block', width: '160px', height: '600px' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
      />
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
