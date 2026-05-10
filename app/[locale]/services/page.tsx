import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ServicesHero } from '@/components/sections/ServicesHero';
import { ServiceCards } from '@/components/sections/ServiceCards';
import { Pricing } from '@/components/sections/Pricing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services.hero' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ServicesHero />
      <ServiceCards />
      <Pricing />
    </>
  );
}
