'use client';

import * as React from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SERVICE_CATEGORIES } from '@/lib/services';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
  { href: '/blog', key: 'blog' },
  { href: '/contact', key: 'contact' },
] as const;

export function MobileMenu() {
  const t = useTranslations();
  const tCat = useTranslations('services.categories');
  const [open, setOpen] = React.useState(false);
  const [servicesOpen, setServicesOpen] = React.useState(false);

  const close = () => setOpen(false);

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
        <nav className="flex flex-col gap-1 mt-2 max-h-[70vh] overflow-y-auto">
          <Link href="/" onClick={close} className="rounded-md px-3 py-2 text-sm hover:bg-accent/10">
            {t('nav.home')}
          </Link>
          <Link href="/about" onClick={close} className="rounded-md px-3 py-2 text-sm hover:bg-accent/10">
            {t('nav.about')}
          </Link>

          {/* Services accordion */}
          <button
            type="button"
            onClick={() => setServicesOpen((v) => !v)}
            className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent/10"
          >
            {t('nav.services')}
            <ChevronDown className={cn('h-4 w-4 transition-transform', servicesOpen && 'rotate-180')} />
          </button>
          {servicesOpen && (
            <div className="ps-3">
              {SERVICE_CATEGORIES.map(({ key }) => (
                <Link
                  key={key}
                  href={`/contact?service=${key}`}
                  onClick={close}
                  className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                >
                  {tCat(`${key}.title`)}
                </Link>
              ))}
            </div>
          )}

          {LINKS.filter((l) => l.key === 'blog' || l.key === 'contact').map(({ href, key }) => (
            <Link key={href} href={href} onClick={close} className="rounded-md px-3 py-2 text-sm hover:bg-accent/10">
              {t(`nav.${key}`)}
            </Link>
          ))}

          <Link href="/auth" onClick={close} className="rounded-md px-3 py-2 text-sm hover:bg-accent/10">
            {t('nav.auth')}
          </Link>
          <Link
            href="/contact"
            onClick={close}
            className="mt-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground text-center"
          >
            {t('common.bookFreeCall')}
          </Link>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
