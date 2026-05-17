import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PresentationPage } from '@/components/presentation/PresentationPage';

export const metadata: Metadata = {
  title: 'Emad AI — Presentation',
  description:
    'AI Consultant & Software Developer — Interactive business presentation.',
};

export default async function Presentation({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PresentationPage />;
}
