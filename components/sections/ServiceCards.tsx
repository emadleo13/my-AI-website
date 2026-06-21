'use client';

import { useTranslations } from 'next-intl';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BorderBeam } from '@/components/ui/border-beam';
import { FOCUS_CATEGORIES, FOCUS_HIDDEN_SUBS } from '@/lib/services';
import { ScrollReveal } from './ScrollReveal';

// Mirrors the home "What I do" section: only the two focus offerings are shown
// here, with Cloud & DevOps hidden. The rest of the catalogue lives in the
// footer Services menu. See FOCUS_* in lib/services.ts.
export function ServiceCards() {
  const t = useTranslations('services.categories');
  const tCommon = useTranslations('common');

  return (
    <section className="container py-16 md:py-20">
      <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
        {FOCUS_CATEGORIES.map(({ key, icon: Icon, sub }, i) => {
          const subs = sub.filter((s) => !FOCUS_HIDDEN_SUBS[key]?.includes(s));
          return (
          <ScrollReveal key={key} delay={i * 0.05}>
            <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 group flex flex-col relative overflow-hidden">
              <BorderBeam size={180} duration={12} delay={i * 2} colorFrom="#4f46e5" colorTo="#06b6d4" />
              <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-2xl font-extrabold tracking-tight">{t(`${key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`${key}.desc`)}</p>

                <ul className="mt-4 space-y-2 text-sm flex-1">
                  {subs.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                      <span className="font-semibold">{t(`${key}.sub.${s}.title`)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-border/60">
                  <Button asChild variant="ghost" size="sm" className="gap-1.5 px-0">
                    <Link href={`/contact?service=${key}`}>
                      {tCommon('bookFreeCall')}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
