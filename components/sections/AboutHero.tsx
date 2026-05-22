'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Download, Mail, MapPin } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';

export function AboutHero() {
  const t = useTranslations('about.hero');

  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      <div className="container py-20 md:py-28 grid gap-10 md:grid-cols-[260px_1fr] items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mx-auto md:mx-0"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/40 to-accent/30 blur-2xl rounded-full" />
          <div className="relative aspect-square w-[220px] md:w-[260px] rounded-3xl overflow-hidden border border-border shadow-xl">
            <Image
              src="/emadaidev.png"
              alt="Emad portrait"
              fill
              priority
              sizes="260px"
              className="object-cover object-[center_20%]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="space-y-5"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            {t('eyebrow')}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="accent" className="gap-2">
              <a href="/api/resume" download>
                <Download className="h-4 w-4" />
                {t('downloadResume')}
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/contact">
                <Mail className="h-4 w-4" />
                {t('contactMe')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
