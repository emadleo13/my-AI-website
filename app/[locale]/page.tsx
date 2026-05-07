import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { AIFuture } from '@/components/sections/AIFuture';
import { ServicesPreview } from '@/components/sections/ServicesPreview';
import { Stats } from '@/components/sections/Stats';
import { Testimonials } from '@/components/sections/Testimonials';
import { BlogPreview } from '@/components/sections/BlogPreview';
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
      <ServicesPreview />
      <Testimonials />
      <BlogPreview locale={locale as Locale} />
    </>
  );
}
