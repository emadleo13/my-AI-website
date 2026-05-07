'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';

export function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-background to-accent/10" />
      <div className="absolute inset-0 -z-10 bg-hero-grid bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      <div
        className="absolute -top-32 -end-32 -z-10 h-[420px] w-[420px] rounded-full bg-primary/30 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -start-32 -z-10 h-[420px] w-[420px] rounded-full bg-accent/20 blur-3xl"
        aria-hidden
      />

      <div className="container py-24 md:py-32 grid gap-12 md:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            {t('eyebrow')}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance">
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {t('title')}
            </span>
            <span className="block text-2xl md:text-3xl font-semibold text-muted-foreground mt-3">
              {t('subtitle')}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl text-balance">
            {t('tagline')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/booking">
                {t('ctaPrimary')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">{t('ctaSecondary')}</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="relative mx-auto"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/40 to-accent/30 blur-2xl rounded-full" />
          <div className="relative aspect-square w-[280px] md:w-[380px] rounded-3xl overflow-hidden border border-border shadow-2xl">
            <Image
              src="https://picsum.photos/seed/emad/600/600"
              alt="Emad — AI consultant and software developer"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 280px, 380px"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
