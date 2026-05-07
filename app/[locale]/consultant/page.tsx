import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { DemoBanner } from '@/components/DemoBanner';
import { isAnthropicConfigured } from '@/lib/env';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'consultant' });
  return { title: t('title') };
}

export default async function ConsultantPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('consultant');
  const tDemo = await getTranslations('demo');

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">{t('subtitle')}</p>

        <div className="mt-8">
          {!isAnthropicConfigured && <DemoBanner message={tDemo('anthropic')} />}
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
