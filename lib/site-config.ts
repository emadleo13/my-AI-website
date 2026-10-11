/**
 * Public contact handles, social profiles and product links.
 *
 * These used to be read from NEXT_PUBLIC_* env vars with placeholder fallbacks,
 * which meant a stale Vercel variable could keep showing an old handle long
 * after it changed. They are public by nature, so they live here as the single
 * source of truth — footer, contact page, emails and the chatbot all read them.
 */

export const CONTACT_EMAIL = 'hamidleo1984@gmail.com';

export const TELEGRAM_USERNAME = 'EMADLEO1984';
export const TELEGRAM_HANDLE = `@${TELEGRAM_USERNAME}`;
export const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME}`;

export const SOCIAL = {
  github: 'https://github.com/emadleo13',
  linkedin: 'https://www.linkedin.com/in/emadleo13-b42882236',
  telegram: TELEGRAM_URL,
  // Facebook page for the CNC Assist app.
  facebookCnc: 'https://www.facebook.com/share/1Eu3i1Ftne/',
} as const;

export const PRODUCT_URLS = {
  paznic: 'https://paznic.eu',
  unireal: 'https://unireal.study',
  cncAssist: 'https://play.google.com/store/apps/details?id=com.cncassist.cnc_assist',
} as const;

/** CV files in /public — the Romanian page gets the Romanian CV. */
export function cvPathFor(locale: string): string {
  return locale === 'ro' ? '/Abdolhamid_Bashari_CV_RO.pdf' : '/Abdolhamid_Bashari_CV_EN.pdf';
}
