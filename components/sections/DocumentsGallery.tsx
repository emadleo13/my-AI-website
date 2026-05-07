'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { ScrollReveal } from './ScrollReveal';

const ITEMS = [
  { id: '1', seed: 'doc-msc' },
  { id: '2', seed: 'doc-bsc' },
  { id: '3', seed: 'doc-deep' },
  { id: '4', seed: 'doc-permit' },
  { id: '5', seed: 'doc-ml' },
  { id: '6', seed: 'doc-ethics' },
] as const;

export function DocumentsGallery() {
  const t = useTranslations('about.documents');
  const [active, setActive] = React.useState<(typeof ITEMS)[number] | null>(null);

  return (
    <section className="container py-16 md:py-20">
      <ScrollReveal className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((doc, i) => (
          <ScrollReveal key={doc.id} delay={i * 0.04}>
            <button
              type="button"
              onClick={() => setActive(doc)}
              className="block w-full text-start"
              aria-label={`${t('viewLabel')} ${t(`items.${doc.id}.title`)}`}
            >
              <Card className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={`https://picsum.photos/seed/${doc.seed}/800/600`}
                    alt={t(`items.${doc.id}.title`)}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/0 to-background/0" />
                  <div className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-md bg-background/80 backdrop-blur border border-border opacity-0 group-hover:opacity-100 transition">
                    <ZoomIn className="h-4 w-4 text-foreground" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium text-sm">
                    {t(`items.${doc.id}.title`)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(`items.${doc.id}.caption`)}
                  </p>
                </div>
              </Card>
            </button>
          </ScrollReveal>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{t(`items.${active.id}.title`)}</DialogTitle>
                <DialogDescription>
                  {t(`items.${active.id}.caption`)}
                </DialogDescription>
              </DialogHeader>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border">
                <Image
                  src={`https://picsum.photos/seed/${active.seed}/1280/960`}
                  alt={t(`items.${active.id}.title`)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
