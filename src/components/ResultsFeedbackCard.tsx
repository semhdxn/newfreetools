import { MessageSquare } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { contactUrl } from '@/lib/links';
import { trackEvent } from '@/lib/analytics';
import type { ToolId } from '@/lib/storage';

/**
 * Adult-facing feedback prompt for the end of a tool. Links to the toolkit
 * site's own contact form rather than duplicating one here, since this site
 * deliberately has no backend to receive submissions. Not used on Pupil
 * Voice or the Chronology Builder, same as ResultsUpgradeCard.
 */
export function ResultsFeedbackCard({ tool }: { tool: ToolId }) {
  return (
    <Card>
      <h2 className="font-display text-base font-bold">Got feedback on this tool?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Spotted a problem, got a suggestion, or just want to tell us what worked? We read every message.
      </p>
      <a
        className="mt-3 inline-block"
        href={contactUrl('results_feedback', tool)}
        onClick={() => trackEvent('feedback_cta_click', { tool, location: 'results_card' })}
      >
        <Button variant="outline">
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Contact us
        </Button>
      </a>
    </Card>
  );
}
