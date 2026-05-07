import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AboutHero } from '@/components/sections/AboutHero';
import { BioSection } from '@/components/sections/BioSection';
import { SkillsGrid } from '@/components/sections/SkillsGrid';
import { Timeline } from '@/components/sections/Timeline';
import { DocumentsGallery } from '@/components/sections/DocumentsGallery';
import { ResumeCTA } from '@/components/sections/ResumeCTA';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.hero' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <AboutHero />
      <BioSection />
      <SkillsGrid />
      <Timeline variant="experience" />
      <Timeline variant="education" />
      <DocumentsGallery />
      <ResumeCTA />
    </>
  );
}
