import { useTranslations } from 'next-intl';
import {
  Zap,
  Star,
  FileText,
  Languages,
  LineChart,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollReveal';

const ITEMS = [
  { key: 'leadResponse',    icon: Zap },
  { key: 'reviewReplies',   icon: Star },
  { key: 'docDrafter',      icon: FileText },
  { key: 'multilangTriage', icon: Languages },
  { key: 'ownerBriefing',   icon: LineChart },
] as const;

export function ServiceCatalog() {
  const t = useTranslations('services.catalog');

  return (
    <section className="container py-16 md:py-20 border-t border-border/60">
      <ScrollReveal>
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-sm font-medium text-primary mb-2">{t('eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-bold">{t('title')}</h2>
          <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ key, icon: Icon }, i) => (
          <ScrollReveal key={key} delay={i * 0.05}>
            <Card className="h-full flex flex-col hover:shadow-xl hover:border-primary/40 transition-all">
              <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{t(`items.${key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`items.${key}.desc`)}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md bg-muted/60 px-3 py-2">
                    <div className="text-muted-foreground">{t('setupLabel')}</div>
                    <div className="font-semibold text-foreground">{t(`items.${key}.setup`)}</div>
                  </div>
                  <div className="rounded-md bg-muted/60 px-3 py-2">
                    <div className="text-muted-foreground">{t('monthlyLabel')}</div>
                    <div className="font-semibold text-foreground">{t(`items.${key}.monthly`)}</div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t('timelineLabel')}:</span>{' '}
                  {t(`items.${key}.timeline`)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t('forLabel')}:</span>{' '}
                  {t(`items.${key}.for`)}
                </p>

                <ul className="mt-4 space-y-2 text-sm flex-1">
                  {(['1', '2', '3'] as const).map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                      <span>{t(`items.${key}.bullets.${b}`)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-border/60">
                  <Button asChild variant="ghost" size="sm" className="gap-1.5 px-0">
                    <Link href="/booking">
                      {t('cta')}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
