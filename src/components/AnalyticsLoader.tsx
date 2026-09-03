import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GA_CONFIGURED, GA_MEASUREMENT_ID, getStoredConsent, trackingEnabledFor } from '@/lib/analytics';
import { TOOL_LABELS, type ToolId } from '@/lib/storage';

const SCRIPT_ID = 'ga4-script';

function toolIdForPath(pathname: string): ToolId | null {
  const slug = pathname.replace(/^\//, '').split('/')[0];
  return slug in TOOL_LABELS ? (slug as ToolId) : null;
}

/**
 * Loads Google Analytics (GA4) only on routes where tracking is allowed
 * (everything except Pupil Voice — see analytics.ts), and fires a page_view
 * on every route change: this is a client-side SPA under HashRouter, so
 * there's never a real page load for GA to observe on its own.
 *
 * Uses Google Consent Mode v2: analytics_storage defaults to 'denied' —
 * meaning no cookies and no identified data collection — unless the visitor
 * already accepted the cookie banner (CookieConsent.tsx) on an earlier
 * visit, in which case that choice is honoured immediately instead of
 * re-asking every page load. CookieConsent's Accept/Reject buttons update
 * this consent state live via `gtag('consent', 'update', ...)`.
 *
 * Mirrors AdsenseLoader.tsx's fix for the same underlying SPA problem: if a
 * tracking-excluded route is reached after GA already loaded on an earlier
 * page in this tab (e.g. Home → Pupil Voice via client-side routing), there
 * is no way to un-load it client-side — so this forces a full page reload,
 * landing on the excluded route with GA never loaded at all.
 */
export function AnalyticsLoader() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!GA_CONFIGURED) return;
    const toolId = toolIdForPath(pathname);
    const allowed = toolId ? trackingEnabledFor(toolId) : true; // no toolId (e.g. home page) is always trackable
    const scriptAlreadyLoaded = Boolean(document.getElementById(SCRIPT_ID));

    if (!allowed) {
      if (scriptAlreadyLoaded) window.location.reload();
      return;
    }

    if (!scriptAlreadyLoaded) {
      window.dataLayer = window.dataLayer || [];
      // Standard gtag.js bootstrap shim — must be a plain function (not an
      // arrow function) so `arguments` refers to this call's own arguments.
      window.gtag =
        window.gtag ||
        function gtag() {
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer!.push(arguments);
        };
      window.gtag('js', new Date());

      // Consent Mode default — 'granted' only if a past visit already
      // accepted; otherwise 'denied' until CookieConsent's Accept button
      // updates it. GA still receives basic, cookieless pings while denied
      // (Google's standard Consent Mode behaviour) but sets no cookies and
      // collects nothing identifiable until consent is granted.
      window.gtag('consent', 'default', {
        analytics_storage: getStoredConsent() === 'accepted' ? 'granted' : 'denied',
      });

      // send_page_view: false — this component sends page_view itself below,
      // on every route change, since GA can't see SPA navigation on its own.
      window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false, anonymize_ip: true });

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }

    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
