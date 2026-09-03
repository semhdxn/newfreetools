import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ADSENSE_CLIENT_ID, ADSENSE_CONFIGURED, adsEnabledFor } from '@/lib/adConfig';
import { TOOL_LABELS, type ToolId } from '@/lib/storage';

const SCRIPT_ID = 'adsbygoogle-script';

function toolIdForPath(pathname: string): ToolId | null {
  const slug = pathname.replace(/^\//, '').split('/')[0];
  return slug in TOOL_LABELS ? (slug as ToolId) : null;
}

/**
 * Loads Google's base AdSense script (adsbygoogle.js) only on routes where
 * ads are allowed, instead of unconditionally from index.html.
 *
 * This matters because Google's Auto ads / Anchor (overlay) ads — enabled
 * for the whole ad client in the AdSense dashboard — activate as soon as
 * that base script runs on a page, completely independent of whether any
 * <AdBanner> slot is rendered. The per-tool `adsEnabledFor()` gate on
 * <AdBanner>/<AffiliateProducts> only stops OUR OWN manual ad slots; it does
 * nothing to stop Google's own auto-injected anchor/side-rail ads, which is
 * what was showing up on the ad-free Pupil Voice (student-voice) route.
 *
 * Not loading the script covers a visitor who lands directly on an
 * ad-excluded route, but this is a client-side single-page app: React
 * Router's HashRouter never does a full page reload when the visitor clicks
 * from an ad-enabled page (Home, say) straight into Pupil Voice. If the
 * AdSense script — and whatever Auto/Anchor ads it already injected — was
 * loaded on that earlier page, it's still sitting in this same browser tab
 * and there is no client-side way to un-inject those ads.
 *
 * So when the route becomes ad-excluded and the script is already present,
 * this forces a genuine full-page reload. That tears down the entire page —
 * script, injected ads and all — and starts the ad-excluded route completely
 * fresh, where the script is never added in the first place. Any in-progress
 * answers on that route are untouched: every tool session autosaves to
 * localStorage (see useToolSession), so the reload lands the visitor back
 * exactly where they were.
 */
export function AdsenseLoader() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!ADSENSE_CONFIGURED) return;
    const toolId = toolIdForPath(pathname);
    const allowed = toolId ? adsEnabledFor(toolId) : true; // no toolId (e.g. home page) is always ad-eligible
    const scriptAlreadyLoaded = Boolean(document.getElementById(SCRIPT_ID));

    if (!allowed) {
      if (scriptAlreadyLoaded) window.location.reload();
      return;
    }
    if (scriptAlreadyLoaded) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
