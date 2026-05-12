import { useTranslations } from 'next-intl';
import {
  Compass,
  Bot,
  Code2,
  BrainCircuit,
  Building2,
  Briefcase,
  Workflow,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollReveal';

const SERVICES = [
  { key: 'consult',     icon: Compass },
  { key: 'agents',      icon: Bot },
  { key: 'workflow',    icon: Workflow },
  { key: 'dev',         icon: Code2 },
  { key: 'ml',          icon: BrainCircuit },
  { key: 'romaniaTech', icon: Building2 },
  { key: 'career',      icon: Briefcase },
] as const;

export function ServiceCards() {
  const t = useTranslations('services.items');

  return (
    <section className="container py-16 md:py-20">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(({ key, icon: Icon }, i) => (
          <ScrollReveal key={key} delay={i * 0.05}>
            <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 group flex flex-col">
              <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`${key}.desc`)}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {(['1', '2', '3'] as const).map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                      <span>{t(`${key}.bullets.${b}`)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <Button asChild variant="ghost" size="sm" className="gap-1.5 px-0">
                    <Link href="/contact">
                      {t(`${key}.cta`)}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
