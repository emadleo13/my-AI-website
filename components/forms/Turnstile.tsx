'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, RotateCw } from 'lucide-react';
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

/**
 * If nothing has been drawn into the container after this long, assume the
 * widget was blocked (ad/tracker blockers often block challenges.cloudflare.com)
 * and tell the visitor how to fix it instead of leaving a blank gap and a
 * disabled button.
 */
const RENDER_TIMEOUT_MS = 12_000;
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
  const t = useTranslations('auth');
  const { resolvedTheme } = useTheme();
  const [failed, setFailed] = React.useState(false);

  React.useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  React.useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    const fail = () => {
      if (cancelled) return;
      onTokenRef.current(null);
      setFailed(true);
    };

    // Blocked iframes don't always raise an error — watch for "nothing drawn".
    const timer = setTimeout(() => {
      if (!container.current?.childElementCount) fail();
    }, RENDER_TIMEOUT_MS);

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: resolvedTheme === 'light' ? 'light' : 'dark',
          language: locale,
          callback: (token: string) => {
            setFailed(false);
            onTokenRef.current(token);
          },
          'expired-callback': () => onTokenRef.current(null),
          // Turnstile retries transient errors itself; a later success clears this.
          'error-callback': fail,
          'unsupported-callback': fail,
        });
      })
      .catch(fail);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [locale, resolvedTheme]);

  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <div className="space-y-2">
      <div ref={container} className={failed ? 'flex justify-center' : 'flex min-h-[65px] justify-center'} />
      {failed && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-amber-300/60 bg-amber-50 px-3.5 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div className="space-y-2">
            <p>{t('captchaBlocked')}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 font-medium underline underline-offset-2"
            >
              <RotateCw className="h-3.5 w-3.5" />
              {t('captchaReload')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
