import { useTranslations } from 'next-intl';
import { ScrollReveal } from './ScrollReveal';

export function BioSection() {
  const t = useTranslations('about.bio');

  return (
    <section className="container py-16 md:py-20">
      <ScrollReveal className="max-w-3xl mx-auto space-y-5">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="text-muted-foreground leading-relaxed">{t('p1')}</p>
        <p className="text-muted-foreground leading-relaxed">{t('p2')}</p>
        <p className="text-muted-foreground leading-relaxed">{t('p3')}</p>
      </ScrollReveal>
    </section>
  );
}
