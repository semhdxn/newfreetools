import { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { Button, Card } from '@/components/ui';

/**
 * A visible-but-locked action (e.g. "Save young person for future") that
 * teases a paid-tier feature the free tools don't have. Clicking it never
 * does the real thing — it only explains that it's a premium feature.
 */
export function PremiumLockButton({
  label = 'Download / Save young person for future',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={`min-w-[160px] flex-1 ${className}`}
        aria-haspopup="dialog"
      >
        <Lock className="h-4 w-4 mr-2" />
        {label}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Premium feature"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <Card className="max-w-sm bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 p-2">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">Premium feature</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="p-2 text-sm text-muted-foreground">
              Saving a young person's record and coming back to it later is part of the full SEMH Toolkit. These free
              tools keep everything on-device only, with no accounts and no saved records, so this stays a premium
              feature for now.
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
