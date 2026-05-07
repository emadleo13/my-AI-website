import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'fa', 'ro'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeMeta: Record<
  Locale,
  { label: string; flag: string; dir: 'ltr' | 'rtl' }
> = {
  en: { label: 'English', flag: '🇬🇧', dir: 'ltr' },
  fa: { label: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  ro: { label: 'Română', flag: '🇷🇴', dir: 'ltr' },
};

/**
 * Strip a leading `/locale` segment from a path so it can be passed back to
 * locale-aware navigation (which adds the locale itself). Returns null if the
 * input is null/undefined or escapes to a non-local URL.
 */
export function stripLocalePrefix(p: string | null | undefined): string | null {
  if (!p) return null;
  // Reject anything that looks like an absolute URL or scheme — open-redirect guard.
  if (!p.startsWith('/') || p.startsWith('//')) return null;
  const re = new RegExp(`^/(?:${locales.join('|')})(?=/|$)`);
  const stripped = p.replace(re, '') || '/';
  return stripped;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (locales as readonly string[]).includes(requested ?? '')
    ? (requested as Locale)
    : defaultLocale;

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return { locale, messages };
});
