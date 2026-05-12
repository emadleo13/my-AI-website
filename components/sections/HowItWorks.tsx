import { useTranslations } from 'next-intl';
import { MessageSquare, Map, Rocket, RefreshCw } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const STEPS = [
  { key: 'discover', icon: MessageSquare, number: '01' },
  { key: 'plan',     icon: Map,           number: '02' },
  { key: 'build',    icon: Rocket,        number: '03' },
  { key: 'support',  icon: RefreshCw,     number: '04' },
] as const;

export function HowItWorks() {
  const t = useTranslations('home.howItWorks');

  return (
    <section className="container py-20 md:py-28">
      <ScrollReveal className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {t('eyebrow')}
        </p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="mt-16 relative">
        {/* Connector line (desktop) */}
        <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-border" />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ key, icon: Icon, number }, i) => (
            <ScrollReveal key={key} delay={i * 0.08}>
              <div className="relative flex flex-col items-center text-center px-4">
                {/* Step circle */}
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-background shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {number}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t(`steps.${key}.desc`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
