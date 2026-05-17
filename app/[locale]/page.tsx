import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { AIFuture } from '@/components/sections/AIFuture';
import { ServicesPreview } from '@/components/sections/ServicesPreview';
import { Stats } from '@/components/sections/Stats';
import { Testimonials } from '@/components/sections/Testimonials';
import { BlogPreview } from '@/components/sections/BlogPreview';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { WhatDrivesUs } from '@/components/sections/WhatDrivesUs';
import { PresentationFloatingButton } from '@/components/home/PresentationFloatingButton';
import { type Locale } from '@/lib/i18n';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Stats />
      <AIFuture />
      <HowItWorks />
      <ServicesPreview />
      <WhatDrivesUs />
      <Testimonials />
      <BlogPreview locale={locale as Locale} />
      <PresentationFloatingButton />
    </>
  );
}
