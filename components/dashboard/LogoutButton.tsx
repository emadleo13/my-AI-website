'use client';

import { useTranslations, useLocale } from 'next-intl';
import { LogOut } from 'lucide-react';
import { signOutAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const t = useTranslations('dashboard.actions');
  const locale = useLocale();
  return (
    <form action={signOutAction.bind(null, locale)}>
      <Button type="submit" variant="outline" size="sm" className="gap-1.5">
        <LogOut className="h-3.5 w-3.5" />
        {t('logout')}
      </Button>
    </form>
  );
}
