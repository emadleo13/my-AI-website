'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { SERVICE_CATEGORIES } from '@/lib/services';
import { ScrollReveal } from './ScrollReveal';

export function ServicesPreview() {
  const t = useTranslations('home.servicesPreview');
  const tCat = useTranslations('services.categories');

  return (
    <section className="container py-20 md:py-28">
      <ScrollReveal className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {SERVICE_CATEGORIES.map(({ key, icon: Icon }, i) => (
          <ScrollReveal key={key} delay={i * 0.05}>
            <Link href={`/contact?service=${key}`} className="block h-full">
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/40">
                <CardContent className="pt-6 space-y-3">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg">{tCat(`${key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground">{tCat(`${key}.desc`)}</p>
                </CardContent>
              </Card>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {t('viewAll')}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
