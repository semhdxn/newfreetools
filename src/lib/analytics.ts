import type { ToolId } from './storage';

/**
 * Google Analytics (GA4) Measurement ID — replace the placeholder below with
 * the real one from your GA4 property (Admin > Data Streams > your web
 * stream > Measurement ID, looks like "G-XXXXXXXXXX"). Analytics stays
 * completely inert — no script loads, nothing is sent anywhere — until this
 * is filled in.
 */
export const GA_MEASUREMENT_ID = 'G-20W2CHEZV7';

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
