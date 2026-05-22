'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { UserMenu } from './UserMenu';

const NAV_LINKS = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
  { href: '/services', key: 'services' },
  { href: '/marketplace', key: 'marketplace' },
  { href: '/blog', key: 'blog' },
  { href: '/consultant', key: 'consultant' },
  { href: '/contact', key: 'contact' },
] as const;

export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 glass">
      <div className="container flex h-24 items-center justify-between gap-4">
        <Link href="/" className="flex items-center mt-4">
          <Image src="/logo.png" alt="EmadAI" width={110} height={110} className="object-contain dark:hidden" />
          <Image src="/logo-dark.png" alt="EmadAI" width={110} height={110} className="object-contain hidden dark:block" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {NAV_LINKS.map(({ href, key }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 rounded-md transition-colors hover:text-foreground',
                  isActive
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground',
                )}
              >
                {t(`nav.${key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu />
          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <Link href="/booking">{t('common.bookNow')}</Link>
          </Button>
          <MobileMenu links={NAV_LINKS as unknown as { href: string; key: string }[]} />
        </div>
      </div>
    </header>
  );
}
