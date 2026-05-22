import { Link } from '@/lib/i18n-routing';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type MarketplaceService, formatPrice } from '@/lib/marketplace-services';

interface Props {
  service: MarketplaceService;
  title: string;
  description: string;
  bullets: string[];
  freeLabel: string;
  ctaLabel: string;
}

export function ServiceToolCard({ service, title, description, bullets, freeLabel, ctaLabel }: Props) {
  const Icon = service.icon;
  return (
    <Card className="group relative flex flex-col overflow-hidden border-border/60 hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col items-end gap-1">
            {service.isAutomated ? (
              <Badge variant="secondary" className="text-[10px]">Automated</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">Custom</Badge>
            )}
            <span className="text-xs font-semibold text-primary">{formatPrice(service.priceEurCents)}</span>
          </div>
        </div>
        <h3 className="font-semibold text-base leading-snug">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        <ul className="space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-2 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground mb-3">
            <span className="text-green-500 font-medium">Free: </span>{freeLabel}
          </p>
          <Button asChild className="w-full" size="sm">
            <Link href={`/marketplace/${service.key}`}>{ctaLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
