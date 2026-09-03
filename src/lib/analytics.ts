import type { ToolId } from './storage';

/**
 * Google Analytics (GA4) Measurement ID — replace the placeholder below with
 * the real one from your GA4 property (Admin > Data Streams > your web
 * stream > Measurement ID, looks like "G-XXXXXXXXXX"). Analytics stays
 * completely inert — no script loads, nothing is sent anywhere — until this
 * is filled in.
 */
// Typed `: string` (not inferred as the literal "G-20W2CHEZV7") so the
// not-a-placeholder check below is a normal runtime string comparison —
// otherwise TS narrows a const literal at its declaration and flags a
// comparison against a *different* hardcoded literal as "can never be true".
export const GA_MEASUREMENT_ID: string = 'G-20W2CHEZV7';

/** True once a real Measurement ID has replaced the placeholder above. */
export const GA_CONFIGURED = /^G-[A-Z0-9]{5,}$/.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';

/**
 * Tools where analytics tracking is skipped entirely — same reasoning as the
 * ad exclusion in adConfig.ts: Pupil Voice is completed directly by a young
 * person, so — beyond just being kept free of ads and product suggestions —
 * it's kept free of tracking too.
 */
const TRACKING_EXCLUDED_TOOLS: ToolId[] = ['student-voice'];

export function trackingEnabledFor(toolId: ToolId): boolean {
  return !TRACKING_EXCLUDED_TOOLS.includes(toolId);
}

/**
 * Cookie-consent decision, shared between AnalyticsLoader (which reads it to
 * set Google Consent Mode's default state) and CookieConsent.tsx (the banner
 * that writes it). Centralised here rather than each file inventing its own
 * localStorage key/shape.
 */
export const COOKIE_CONSENT_KEY = 'cookie-consent';
export type ConsentValue = 'accepted' | 'rejected';

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return v === 'accepted' || v === 'rejected' ? v : null;
}

export function setStoredConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
}

// Single source of truth for the gtag/dataLayer globals — declared once here
// rather than separately (and inconsistently) in every file that touches
// them, which is what caused a TS2717 "subsequent declarations must have the
// same type" build failure when AnalyticsLoader and CookieConsent each
// declared their own, narrower version of `Window.gtag`.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
