import { useTranslations } from 'next-intl';
import { Compass, Bot, MessageSquare, Code2, Briefcase } from 'lucide-react';
import { InteractiveImageAccordion, type AccordionImageItem } from '@/components/ui/interactive-image-accordion';
import { ScrollReveal } from './ScrollReveal';

const ICONS = [Compass, Bot, MessageSquare, Code2, Briefcase];

const ACCORDION_ITEMS: Pick<AccordionImageItem, 'id'>[] = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
];

const ITEM_KEYS = ['consulting', 'agents', 'rag', 'dev', 'career'] as const;

export function AIFuture() {
  const t = useTranslations('home.aiFuture');

  const items: AccordionImageItem[] = ACCORDION_ITEMS.map((item, i) => ({
    ...item,
    title: t(`items.${ITEM_KEYS[i]}`),
  }));

  return (
    <section className="container py-20 md:py-28">
      <ScrollReveal className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold tracking-widest uppercase text-accent">
          {t('eyebrow')}
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-balance">
          {t('title')}
        </h2>
        <p className="mt-5 text-muted-foreground text-balance leading-relaxed">
          {t('body')}
        </p>
      </ScrollReveal>

      <ScrollReveal className="mt-14">
        <InteractiveImageAccordion items={items} icons={ICONS} />
      </ScrollReveal>
    </section>
  );
}
