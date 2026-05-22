/**
 * Verify the request Origin matches our site.
 * Prevents cross-site requests from malicious pages submitting forms
 * to our API without the user's knowledge (CSRF).
 *
 * Returns true (safe) when:
 * - Origin header is absent (server-to-server or same-origin fetch in some browsers)
 * - Origin matches NEXT_PUBLIC_SITE_URL or localhost
 *
 * Returns false (block) when Origin is present but doesn't match.
 */
export function isTrustedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // server-to-server or curl

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const allowed = [siteUrl, 'http://localhost:3000', 'http://localhost:3001'].filter(Boolean);

  try {
    const { origin: reqOrigin } = new URL(origin);
    return allowed.some((a) => {
      try {
        return new URL(a).origin === reqOrigin;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/**
 * Basic HTML-escape for any text rendered in emails or shown raw.
 * Prevents stored-XSS if output is ever embedded in HTML context.
 */
export function sanitizeText(input: string, maxLen = 1000): string {
  return input
    .slice(0, maxLen)
    .replace(/[<>"'&]/g, (c) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
      };
      return map[c] ?? c;
    });
}

/**
 * Validate that a string is a safe absolute URL (https only, no data: or javascript:).
 */
export function isSafeUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}
