import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from './ui';
import { GA_CONFIGURED, getStoredConsent, setStoredConsent, trackingEnabledFor } from '@/lib/analytics';
import { TOOL_LABELS, type ToolId } from '@/lib/storage';

function toolIdForPath(pathname: string): ToolId | null {
  const slug = pathname.replace(/^\//, '').split('/')[0];
  return slug in TOOL_LABELS ? (slug as ToolId) : null;
}

/**
 * Asks for consent before Google Analytics is allowed to collect anything —
 * AnalyticsLoader.tsx defaults analytics_storage to 'denied' until this
 * banner's Accept button updates it via Consent Mode. See analytics.ts for
 * the shared consent storage (COOKIE_CONSENT_KEY) and gtag typing.
 */
export function CookieConsent() {
  const { pathname } = useLocation();
  const [showBanner, setShowBanner] = useState(false);

  const toolId = toolIdForPath(pathname);
  // No point asking for consent on a route that's never tracked (Pupil Voice),
  // or when analytics isn't even configured yet.
  const relevant = GA_CONFIGURED && (toolId ? trackingEnabledFor(toolId) : true);

  useEffect(() => {
    if (!relevant) {
      setShowBanner(false);
      return;
    }
    setShowBanner(getStoredConsent() === null);
  }, [relevant]);

  const handleAccept = () => {
    setStoredConsent('accepted');
    setShowBanner(false);
    if (window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  };

  const handleReject = () => {
    setStoredConsent('rejected');
    setShowBanner(false);
    if (window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  };

  if (!showBanner) return null;

  return (
    // z-[2147483647] (the max CSS z-index), same trick as StepNav in ToolShell.tsx,
    // so this stays clickable above a Google Auto/Anchor ad docked to the viewport bottom.
    <div className="fixed inset-x-0 bottom-0 z-[2147483647] border-t border-border bg-card shadow-lg">
      <div className="relative mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="mb-1 text-sm font-semibold text-foreground">Cookie Consent</p>
            <p className="text-xs text-muted-foreground">
              We'd like to use Google Analytics to see how this site is used — it won't run unless you accept. See our{' '}
              <Link className="font-medium underline" to="/privacy">Privacy Policy</Link> for details.
            </p>
          </div>

          <div className="flex flex-shrink-0 gap-2">
            <Button variant="outline" size="md" onClick={handleReject}>
              Reject
            </Button>
            <Button variant="accent" size="md" onClick={handleAccept}>
              Accept
            </Button>
          </div>
          <button
            onClick={handleReject}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground sm:hidden"
            aria-label="Dismiss (reject)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
