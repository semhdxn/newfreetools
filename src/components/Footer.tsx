import { Link, useLocation } from 'react-router-dom';
import { GA_CONFIGURED, trackingEnabledFor } from '@/lib/analytics';
import { TOOL_LABELS, type ToolId } from '@/lib/storage';
import { premiumUrl } from '@/lib/links';

export function Footer() {
  const slug = useLocation().pathname.replace(/^\//, '').split('/')[0];
  const toolId = slug in TOOL_LABELS ? (slug as ToolId) : null;
  const showCookieSettings = GA_CONFIGURED && (toolId ? trackingEnabledFor(toolId) : true);
  return (
    <footer className="mx-auto mt-12 w-full max-w-4xl border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6">
      <p>
        As an Amazon Associate, SEMH.co.uk earns from qualifying purchases. Product links are affiliate links (#ad) and
        never an endorsement of a brand.
      </p>
      <p className="mt-2">
        Adverts and affiliate links help keep these free tools free; they never appear on Pupil Voice. A fuller,
        paid version is available as the <a className="underline" href={premiumUrl('footer', toolId ?? 'home')}>full SEMH Toolkit</a>.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-4">
        <Link className="inline-block py-2 underline hover:text-foreground" to="/privacy">Privacy Policy</Link>
        <Link className="inline-block py-2 underline hover:text-foreground" to="/faq">FAQs</Link>
        {showCookieSettings && (
          <button
            type="button"
            className="py-2 underline hover:text-foreground"
            onClick={() => (window as unknown as { googlefc?: { showRevocationMessage?: () => void } }).googlefc?.showRevocationMessage?.()}
          >
            Cookie settings
          </button>
        )}
        <span>© {new Date().getFullYear()} SEMH.co.uk</span>
      </div>
    </footer>
  );
}
