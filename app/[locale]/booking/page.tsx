import { setRequestLocale, getTranslations } from 'next-intl/server';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { DemoBanner } from '@/components/DemoBanner';
import { isSupabaseConfigured } from '@/lib/env';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'booking' });
  return { title: t('title') };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('booking');
  const tDemo = await getTranslations('demo');

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">{t('subtitle')}</p>

        <div className="mt-10">
          {!isSupabaseConfigured && <DemoBanner message={tDemo('supabase')} />}
          <BookingWizard />
        </div>
      </div>
    </div>
  );
}
