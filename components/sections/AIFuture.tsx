import { useTranslations } from 'next-intl';
import { InteractiveImageAccordion, type AccordionImageItem } from '@/components/ui/interactive-image-accordion';
import { ScrollReveal } from './ScrollReveal';

const ACCORDION_IMAGES: Pick<AccordionImageItem, 'id' | 'imageUrl'>[] = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/seed/aistrategy/1974/1320',
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/seed/aiagents/1965/1320',
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/seed/ragchat/1974/1320',
  },
  {
    id: 4,
    imageUrl: 'https://picsum.photos/seed/softwaredev/1974/1320',
  },
  {
    id: 5,
    imageUrl: 'https://picsum.photos/seed/careerconsult/1984/1320',
  },
];

const ITEM_KEYS = ['consulting', 'agents', 'rag', 'dev', 'career'] as const;

export function AIFuture() {
  const t = useTranslations('home.aiFuture');

  const items: AccordionImageItem[] = ACCORDION_IMAGES.map((img, i) => ({
    ...img,
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
        <InteractiveImageAccordion items={items} />
      </ScrollReveal>
    </section>
  );
}
