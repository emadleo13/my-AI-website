'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';

/**
 * Cloudflare Turnstile CAPTCHA for the Supabase Auth forms (sign in, sign up,
 * password reset). Supabase verifies the token server-side once "CAPTCHA
 * protection" is enabled in the Supabase dashboard with the Turnstile secret.
 *
 * The site key is public. While NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset the
 * widget renders nothing and forms submit without a token — so deploy this
 * with the key first, and only then switch CAPTCHA protection on in Supabase.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

interface TurnstileApi {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Turnstile failed to load'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export interface TurnstileHandle {
  /** Tokens are single-use: call after every submit to get a fresh one. */
  reset(): void;
}

interface Props {
  onToken: (token: string | null) => void;
}

export const Turnstile = React.forwardRef<TurnstileHandle, Props>(function Turnstile(
  { onToken },
  ref,
) {
  const container = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);
  const onTokenRef = React.useRef(onToken);
  onTokenRef.current = onToken;
  const locale = useLocale();
  const { resolvedTheme } = useTheme();

  React.useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  React.useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: resolvedTheme === 'light' ? 'light' : 'dark',
          language: locale,
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [locale, resolvedTheme]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={container} className="flex min-h-[65px] justify-center" />;
});

/** Form helper: token state, a ref for resetting, and whether a token is still needed. */
export function useCaptcha() {
  const ref = React.useRef<TurnstileHandle>(null);
  const [token, setToken] = React.useState<string | null>(null);
  return {
    ref,
    token,
    setToken,
    /** True while the widget is enabled but hasn't produced a token yet. */
    pending: Boolean(TURNSTILE_SITE_KEY) && !token,
    /** Value for Supabase's `captchaToken` option. */
    captchaToken: token ?? undefined,
    reset: () => ref.current?.reset(),
  };
}
