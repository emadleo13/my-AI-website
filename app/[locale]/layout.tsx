import type { Metadata } from 'next';
import { Inter, Vazirmatn } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';

import { locales, localeMeta, type Locale } from '@/lib/i18n';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { FloatingChat } from '@/components/FloatingChat';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'Emad — AI Consultant & Software Developer',
    template: '%s · Emad',
  },
  description:
    'AI consultant and software developer based in Romania. AI strategy, agent design, software development, and tech career consulting.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  applicationName: 'Emad — AI Consultant',
  authors: [{ name: 'Emad' }],
  keywords: [
    'AI consultant',
    'AI agents',
    'Romania',
    'Bucharest',
    'software developer',
    'Next.js',
    'Claude',
    'LangChain',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Emad',
    title: 'Emad — AI Consultant & Software Developer',
    description:
      'AI consultant and software developer based in Romania. AI strategy, agent design, and tech career consulting.',
    locale: 'en_US',
    alternateLocale: ['fa_IR', 'ro_RO'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emad — AI Consultant & Software Developer',
    description:
      'AI consultant and software developer based in Romania.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      en: '/en',
      fa: '/fa',
      ro: '/ro',
    },
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = localeMeta[locale as Locale].dir;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          vazirmatn.variable,
          'min-h-screen bg-background text-foreground',
          dir === 'rtl' ? 'font-persian' : 'font-sans',
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <ScrollToTop />
              <FloatingChat />
            </div>
            <Toaster richColors position="top-right" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
