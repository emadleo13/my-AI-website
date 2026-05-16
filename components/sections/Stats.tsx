import { useTranslations } from 'next-intl';
import { ScrollReveal } from './ScrollReveal';
import { BorderBeam } from '@/components/ui/border-beam';

const STATS = [
  { key: 'projects',   value: '50+' },
  { key: 'experience', value: '10+' },
  { key: 'countries',  value: '3' },
  { key: 'clients',    value: '40+' },
] as const;

export function Stats() {
  const t = useTranslations('home.stats');

  return (
    <section className="container py-16">
      <ScrollReveal>
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl border border-border bg-gradient-to-br from-card to-card/40 p-8 overflow-hidden">
          <BorderBeam size={250} duration={10} colorFrom="#4f46e5" colorTo="#06b6d4" />
          {STATS.map(({ key, value }) => (
            <div key={key} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {value}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t(key)}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
