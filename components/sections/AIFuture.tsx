import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Bot, Layers, Brain, Workflow } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from './ScrollReveal';

const CARDS = [
  { key: 'agents',     icon: Bot,      seed: 'agents' },
  { key: 'multimodal', icon: Layers,   seed: 'multimodal' },
  { key: 'claude',     icon: Brain,    seed: 'claude' },
  { key: 'automation', icon: Workflow, seed: 'automation' },
] as const;

export function AIFuture() {
  const t = useTranslations('home.aiFuture');

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

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ key, icon: Icon, seed }, i) => (
          <ScrollReveal key={key} delay={i * 0.06}>
            <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:border-accent/40">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={`https://picsum.photos/seed/${seed}/640/480`}
                  alt={t(`cards.${key}.title`)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />
                <div className="absolute top-3 left-3 grid h-9 w-9 place-items-center rounded-lg bg-background/80 backdrop-blur border border-border">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
              </div>
              <CardContent className="pt-5">
                <h3 className="font-semibold">{t(`cards.${key}.title`)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t(`cards.${key}.caption`)}
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
