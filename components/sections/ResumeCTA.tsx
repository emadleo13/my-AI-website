import { useTranslations } from 'next-intl';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from './ScrollReveal';

export function ResumeCTA() {
  const t = useTranslations('about.resume');

  return (
    <section className="container py-16 md:py-20">
      <ScrollReveal className="max-w-3xl mx-auto">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5">
          <CardContent className="pt-8 pb-8 grid gap-6 sm:grid-cols-[auto_1fr_auto] items-center">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('title')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t('body')}</p>
            </div>
            <Button asChild variant="accent" size="lg" className="gap-2">
              <a href="/api/resume" download>
                <Download className="h-4 w-4" />
                {t('download')}
              </a>
            </Button>
          </CardContent>
        </Card>
      </ScrollReveal>
    </section>
  );
}
