import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  subtitle: string;
  body: string;
}

export function ComingSoon({ title, subtitle, body }: Props) {
  const t = useTranslations('common');
  return (
    <section className="container py-20 md:py-32">
      <div className="mx-auto max-w-2xl text-center space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {t('comingSoon')}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
        <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">{body}</p>
        <div className="flex justify-center gap-3 pt-4">
          <Button asChild variant="accent">
            <Link href="/booking">{t('bookNow')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">{t('brand')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
