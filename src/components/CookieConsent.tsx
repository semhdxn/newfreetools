import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // Enable GA4 if not already enabled
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">Cookie Consent</p>
            <p className="text-xs text-muted-foreground">
              We use cookies and analytics to improve your experience. By continuing to use this site, you agree to our use of cookies. See our <span className="font-medium">Privacy Policy</span> for more information.
            </p>
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReject}
            >
              Reject
            </Button>
            <Button 
              variant="accent" 
              size="sm"
              onClick={handleAccept}
            >
              Accept
            </Button>
          </div>

          <button
            onClick={handleReject}
            className="absolute top-3 right-3 sm:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, string>) => void;
  }
}
