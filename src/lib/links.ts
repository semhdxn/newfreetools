/** Single source of truth for where upgrade prompts send people. */
export const PREMIUM_URL = 'https://toolkit.semh.co.uk';

/** The Chronology Builder handles sensitive history (including a date of birth), so it
 *  is kept free of adverts, analytics and the cookie banner, like Pupil Voice. */
export const isChronologyPath = (pathname: string): boolean =>
  pathname.replace(/^\//, '').split('/')[0] === 'chronology';
