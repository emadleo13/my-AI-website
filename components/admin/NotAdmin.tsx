import { useTranslations } from 'next-intl';
import { ShieldOff } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function NotAdmin() {
  const t = useTranslations('admin.notAdmin');
  return (
    <Card>
      <CardContent className="pt-12 pb-12 text-center space-y-4">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldOff className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{t('body')}</p>
        <Button asChild variant="accent">
          <Link href="/auth">{t('cta')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
