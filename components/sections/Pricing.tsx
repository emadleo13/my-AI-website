import { useTranslations } from 'next-intl';
import { Check, Sparkles } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './ScrollReveal';

interface Plan {
  key: 'free' | 'standard' | 'premium';
  itemCount: number;
  href: string;
  popular?: boolean;
  variant: 'default' | 'accent';
}

const PLANS: Plan[] = [
  { key: 'free',     itemCount: 3, href: '/booking', variant: 'default' },
  { key: 'standard', itemCount: 4, href: '/contact', variant: 'accent', popular: true },
  { key: 'premium',  itemCount: 5, href: '/contact', variant: 'default' },
];

export function Pricing() {
  const t = useTranslations('services.pricing');

  return (
    <section className="container py-20 md:py-28">
      <ScrollReveal className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {PLANS.map((plan, i) => (
          <ScrollReveal key={plan.key} delay={i * 0.06}>
            <Card
              className={cn(
                'h-full relative flex flex-col',
                plan.popular &&
                  'border-accent ring-2 ring-accent/30 shadow-xl md:-translate-y-2',
              )}
            >
              {plan.popular && (
                <Badge
                  variant="accent"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  {t('popular')}
                </Badge>
              )}
              <CardContent className="pt-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold">{t(`plans.${plan.key}.name`)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t(`plans.${plan.key}.desc`)}
                </p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {t(`plans.${plan.key}.price`)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t(`plans.${plan.key}.period`)}
                  </span>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm flex-1">
                  {Array.from({ length: plan.itemCount }, (_, idx) => String(idx + 1)).map(
                    (id) => (
                      <li key={id} className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                        <span>{t(`plans.${plan.key}.items.${id}`)}</span>
                      </li>
                    ),
                  )}
                </ul>
                <Button
                  asChild
                  variant={plan.variant}
                  className="mt-6 w-full"
                  size="lg"
                >
                  <Link href={plan.href}>{t(`plans.${plan.key}.cta`)}</Link>
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
