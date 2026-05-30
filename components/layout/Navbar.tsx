'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { Link, usePathname } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SERVICE_CATEGORIES } from '@/lib/services';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { UserMenu } from './UserMenu';

const NAV_LINKS = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
  { href: '/services', key: 'services', dropdown: true },
  { href: '/blog', key: 'blog' },
  { href: '/contact', key: 'contact' },
] as const;

function ServicesMenu() {
  const t = useTranslations();
  const tCat = useTranslations('services.categories');
  const pathname = usePathname();
  const isActive = pathname.startsWith('/services');

  return (
    <div className="relative group">
      <Link
        href="/services"
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-md transition-colors hover:text-foreground',
          isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
        )}
      >
        {t('nav.services')}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </Link>

      {/* Dropdown panel */}
      <div className="invisible absolute start-0 top-full z-50 w-[560px] pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-popover p-3 shadow-xl">
          {SERVICE_CATEGORIES.map(({ key, icon: Icon, sub }) => (
            <div key={key} className="rounded-lg p-2">
              <Link
                href={`/contact?service=${key}`}
                className="flex items-center gap-2 text-sm font-semibold hover:text-primary"
              >
                <Icon className="h-4 w-4 text-primary" />
                {tCat(`${key}.title`)}
              </Link>
              <ul className="mt-1.5 space-y-1 ps-6">
                {sub.map((s) => (
                  <li key={s}>
                    <Link
                      href={`/contact?service=${key}`}
                      className="block text-xs text-muted-foreground hover:text-foreground"
                    >
                      {tCat(`${key}.sub.${s}.title`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
          {NAV_LINKS.map((link) => {
            if ('dropdown' in link && link.dropdown) {
              return <ServicesMenu key={link.href} />;
            }
            const { href, key } = link;
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
            <Link href="/contact">{t('common.bookFreeCall')}</Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
