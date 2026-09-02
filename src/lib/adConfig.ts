import type { ToolId } from './storage';

/**
 * Central switchboard for ads, interstitials and affiliate products.
 *
 * Ads and recommended (affiliate) products are never shown on the Pupil
 * Voice route — it's completed directly by the child, so it's kept
 * completely free of monetisation, on every screen (input and results).
 */
const ADS_EXCLUDED_TOOLS: ToolId[] = ['student-voice'];

export function adsEnabledFor(toolId: ToolId): boolean {
  return !ADS_EXCLUDED_TOOLS.includes(toolId);
}

/** An interstitial ad appears after every Nth page of statements/questions. */
export const INTERSTITIAL_EVERY_N_PAGES = 4;

/** Seconds the "Continue" button on an interstitial stays disabled. */
export const INTERSTITIAL_COUNTDOWN_SECONDS = 5;

/**
 * AdSense — fill these in once the real account/ad-unit details are ready.
 * Until ADSENSE_CLIENT_ID is set, <AdBanner> renders a reserved placeholder
 * instead of attempting to load a real ad.
 */
export const ADSENSE_CLIENT_ID = 'ca-pub-7172412637015998';
export const ADSENSE_SLOTS = {
  // Same ad unit reused across every placement for now — split these out into
  // separate ad units in AdSense later if per-placement reporting is wanted.
  inputBanner: '5091818809',
  resultsBanner: '5091818809',
  interstitial: '5091818809',
  homeBanner: '5091818809',
};

/** True once real AdSense IDs have been filled in above. */
export const ADSENSE_CONFIGURED = Boolean(ADSENSE_CLIENT_ID);
