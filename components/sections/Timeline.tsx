import { useTranslations } from 'next-intl';
import { GraduationCap, Briefcase } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface Props {
  variant: 'education' | 'experience';
}

const ENTRIES: Record<Props['variant'], { ids: string[]; icon: React.ComponentType<{ className?: string }> }> = {
  education: { ids: ['1', '2', '3', '4'], icon: GraduationCap },
  experience: { ids: ['1', '2', '3', '4'], icon: Briefcase },
};

export function Timeline({ variant }: Props) {
  const t = useTranslations(`about.${variant}`);
  const { ids, icon: Icon } = ENTRIES[variant];

  return (
    <section className="container py-16 md:py-20">
      <ScrollReveal className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
      </ScrollReveal>

      <div className="mt-10 max-w-3xl mx-auto">
        <ol className="relative ms-4 border-s border-border space-y-8">
          {ids.map((id, i) => (
            <ScrollReveal key={id} delay={i * 0.06}>
              <li className="ps-6 relative">
                <span className="absolute -start-[13px] top-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-3 w-3" />
                </span>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t(`items.${id}.period`)}
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  {variant === 'education'
                    ? t(`items.${id}.degree`)
                    : t(`items.${id}.role`)}
                </h3>
                <p className="text-sm text-foreground/80 mt-0.5">
                  {variant === 'education'
                    ? t(`items.${id}.school`)
                    : t(`items.${id}.company`)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {variant === 'education'
                    ? t(`items.${id}.note`)
                    : t(`items.${id}.summary`)}
                </p>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
