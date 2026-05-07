'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Props {
  links: { href: string; key: string }[];
}

export function MobileMenu({ links }: Props) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('nav.openMenu')}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('common.brand')}</DialogTitle>
        </DialogHeader>
        <nav className="flex flex-col gap-1 mt-2">
          {links.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm hover:bg-accent/10"
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
          <Link
            href="/auth"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-sm hover:bg-accent/10"
          >
            {t('nav.auth')}
          </Link>
          <Link
            href="/booking"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground text-center"
          >
            {t('common.bookNow')}
          </Link>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
