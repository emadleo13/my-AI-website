import { useTranslations } from 'next-intl';
import { Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BorderBeam } from '@/components/ui/border-beam';
import { ScrollReveal } from './ScrollReveal';

export function Testimonials() {
  const t = useTranslations('home.testimonials');

  return (
    <section className="container py-20 md:py-28">
      <ScrollReveal className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
      </ScrollReveal>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {(['1', '2', '3'] as const).map((id, i) => (
          <ScrollReveal key={id} delay={i * 0.06}>
            <Card className="h-full relative overflow-hidden">
              <BorderBeam size={150} duration={14} delay={i * 3} colorFrom="#ffaa40" colorTo="#9c40ff" />
              <CardContent className="pt-6 space-y-4">
                <Quote className="h-6 w-6 text-accent" />
                <p className="text-sm leading-relaxed">
                  {t(`items.${id}.quote`)}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  — {t(`items.${id}.author`)}
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
