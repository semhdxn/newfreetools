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
 * nothing to stop Google's own auto-injected anchor ad, which is what was
 * showing up at the bottom of the ad-free Pupil Voice (student-voice) route.
 * Never loading the script there at all is the only client-side way to stop
 * it for a fresh page load on that route.
 *
 * Caveat: once loaded, the script is left in place for the rest of the SPA
 * session (removing it can't undo ads Google has already injected). A user
 * who reaches Pupil Voice by clicking through from an ad-enabled page in the
 * same session may still see a previously-injected anchor ad — for full
 * protection against that, also add /student-voice (or '/#/student-voice')
 * to this AdSense account's Auto ads > Site exclusion list.
 */
export function AdsenseLoader() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!ADSENSE_CONFIGURED) return;
    const toolId = toolIdForPath(pathname);
    const allowed = toolId ? adsEnabledFor(toolId) : true; // no toolId (e.g. home page) is always ad-eligible
    if (!allowed) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
