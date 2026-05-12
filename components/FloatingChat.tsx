'use client';

import { MessageCircle } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { useTranslations } from 'next-intl';

export function FloatingChat() {
  const t = useTranslations('floatingChat');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip label */}
      <span className="rounded-full bg-popover border border-border px-3 py-1 text-xs font-medium text-foreground shadow-md animate-bounce-slow">
        {t('label')}
      </span>

      {/* Button with ping animation */}
      <Link href="/consultant" aria-label={t('ariaLabel')}>
        <span className="relative flex h-14 w-14">
          {/* Ping ring */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-40 animate-ping" />
          {/* Button */}
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all hover:scale-110 active:scale-95">
            <MessageCircle className="h-6 w-6" />
          </span>
        </span>
      </Link>
    </div>
  );
}
