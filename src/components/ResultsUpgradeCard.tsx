import { useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { premiumUrl } from '@/lib/links';
import { trackEvent } from '@/lib/analytics';
import type { ToolId } from '@/lib/storage';

const COPY: Partial<Record<ToolId, { heading: string; lead: string; csv: boolean }>> = {
  sensory: {
    heading: 'This is a snapshot. Now track what changes.',
    lead:
      "Sensory needs shift with age, setting and routine. Keep this profile on a young person's record in the full SEMH Toolkit, re-run the checklist in a few weeks and compare the results side by side.",
    csv: true,
  },
  behaviour: {
    heading: 'Is the pattern shifting?',
    lead:
      "One check shows where things stand today. In the full SEMH Toolkit you can keep this on a young person's record, repeat it after you've tried strategies and see what has moved.",
    csv: true,
  },
  'home-behaviour': {
    heading: 'Bring home and school together',
    lead:
      "Keep this on a young person's record in the full SEMH Toolkit alongside their school results, and repeat it later to see what has changed.",
    csv: true,
  },
  mwm: {
    heading: 'Done the form? Track the scores.',
    lead:
      "Record completed Measure What Matters questionnaires against a young person in the full SEMH Toolkit and chart progress over time.",
    csv: false,
  },
};

/**
 * Adult-facing upgrade prompt for the end of a tool, where the visitor has just
 * got value. Deliberately not used on Pupil Voice or the Chronology Builder.
 * Links carry UTM parameters and clicks/views are sent to GA4 (only on routes
 * where analytics is allowed to load).
 */
export function ResultsUpgradeCard({ tool }: { tool: ToolId }) {
  const copy = COPY[tool];

  useEffect(() => {
    if (copy) trackEvent('premium_cta_view', { tool, location: 'results_card' });
  }, [tool, copy]);

  if (!copy) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Full SEMH Toolkit</p>
      <h2 className="mt-1 font-display text-lg font-bold sm:text-xl">{copy.heading}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.lead}</p>
      <ul className="mt-4 space-y-2">
        {[
          'Secure records for each young person',
          'Repeat and compare to see progress over time',
          'Professional PDF reports, with no ads',
          ...(copy.csv ? ['The CSV you just downloaded imports straight into a record, so nothing here is wasted'] : []),
        ].map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={premiumUrl('results_card', tool)}
          onClick={() => trackEvent('premium_cta_click', { tool, location: 'results_card' })}
        >
          <Button variant="accent" size="lg" className="w-full sm:w-auto">
            See what the full toolkit includes
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </a>
        <a
          className="text-sm text-muted-foreground underline hover:text-foreground"
          href={premiumUrl('results_card', tool, 'schools')}
          onClick={() => trackEvent('premium_cta_click', { tool, location: 'results_card_schools' })}
        >
          Schools and settings: ask about organisation packages
        </a>
      </div>
    </Card>
  );
}
