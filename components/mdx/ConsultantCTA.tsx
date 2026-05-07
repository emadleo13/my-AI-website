import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';

interface Props {
  /** Optional override for the title — defaults to a translated string. */
  title?: string;
  /** Optional override for the body. */
  body?: string;
}

export function ConsultantCTA({ title, body }: Props) {
  const t = useTranslations('consultant.cta');

  return (
    <aside className="not-prose my-8 overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 via-background to-primary/10 p-6 md:p-7">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-2 flex-1">
          <h3 className="text-lg font-semibold leading-tight">
            {title ?? t('title')}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {body ?? t('body')}
          </p>
          <Link
            href="/consultant"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            {t('action')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
