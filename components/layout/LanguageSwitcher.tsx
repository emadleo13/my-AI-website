'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, Check } from 'lucide-react';
import { usePathname, useRouter } from '@/lib/i18n-routing';
import { locales, localeMeta, type Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const switchTo = (next: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('language')}
        className="gap-1.5"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeMeta[locale].flag}</span>
        <span className="hidden md:inline">{localeMeta[locale].label}</span>
      </Button>
      {open && (
        <div className="absolute end-0 mt-2 w-44 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg z-50">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchTo(l)}
              className={cn(
                'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent/15',
                l === locale && 'font-semibold',
              )}
            >
              <span className="flex items-center gap-2">
                <span>{localeMeta[l].flag}</span>
                <span>{localeMeta[l].label}</span>
              </span>
              {l === locale && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
