/** Single source of truth for where upgrade prompts send people. */
export const PREMIUM_URL = 'https://toolkit.semh.co.uk';

/**
 * Premium link with UTM parameters so GA on the toolkit side can attribute
 * visits and sign-ups to the free tools. `medium` is the placement
 * (results_card, popup, footer, ...), `campaign` is normally the tool.
 */
export function premiumUrl(medium: string, campaign?: string, content?: string): string {
  const params = new URLSearchParams({ utm_source: 'freetools', utm_medium: medium });
  if (campaign) params.set('utm_campaign', campaign);
  if (content) params.set('utm_content', content);
  return `${PREMIUM_URL}/?${params.toString()}`;
}

/** The first path segment ("sensory", "behaviour", ...), or "home". */
export const currentToolSlug = (): string =>
  (typeof window === 'undefined' ? '' : window.location.pathname.replace(/^\//, '').split('/')[0]) || 'home';

/** The Chronology Builder handles sensitive history (including a date of birth), so it
 *  is kept free of adverts, analytics and the cookie banner, like Pupil Voice. */
export const isChronologyPath = (pathname: string): boolean =>
  pathname.replace(/^\//, '').split('/')[0] === 'chronology';
