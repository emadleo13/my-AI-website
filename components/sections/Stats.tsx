import { useTranslations } from 'next-intl';
import { ScrollReveal } from './ScrollReveal';
import { BorderBeam } from '@/components/ui/border-beam';

// Every number here must be checkable: the products are linked on this page,
// the experience matches the CV, and downloads are what Google Play shows.
const STATS = [
  { key: 'products',   value: '4' },    // Paznic, UNIREAL, CNC Assist, the monitoring agent team
  { key: 'experience', value: '15+' },  // cross-industry work experience (see CV)
  { key: 'languages',  value: '3' },    // English, Romanian, Persian
  { key: 'downloads',  value: '100+' }, // CNC Assist on Google Play
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
