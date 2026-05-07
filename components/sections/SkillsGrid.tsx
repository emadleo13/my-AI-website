import { useTranslations } from 'next-intl';
import { Code2, Layers, Sparkles, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from './ScrollReveal';

const GROUPS = [
  {
    key: 'languages',
    icon: Code2,
    skills: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL', 'Bash'],
  },
  {
    key: 'frameworks',
    icon: Layers,
    skills: ['Next.js', 'React', 'Node.js', 'FastAPI', 'tRPC', 'Tailwind'],
  },
  {
    key: 'ai',
    icon: Sparkles,
    skills: [
      'Claude API',
      'OpenAI API',
      'LangChain',
      'CrewAI',
      'AutoGen',
      'RAG',
      'Fine-tuning',
    ],
  },
  {
    key: 'infra',
    icon: Database,
    skills: [
      'PostgreSQL',
      'Supabase',
      'Docker',
      'AWS',
      'Vercel',
      'Redis',
      'pgvector',
    ],
  },
] as const;

export function SkillsGrid() {
  const t = useTranslations('about.skills');

  return (
    <section className="container py-16 md:py-20">
      <ScrollReveal className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {GROUPS.map(({ key, icon: Icon, skills }, i) => (
          <ScrollReveal key={key} delay={i * 0.05}>
            <Card className="h-full">
              <CardContent className="pt-6 space-y-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{t(`groups.${key}`)}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <Badge key={s} variant="accent">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
