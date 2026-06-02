import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';

export interface AdminDiscoveryRow {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  website: string | null;
  industry: string | null;
  business_description: string | null;
  service_type: string;
  project_goal: string;
  target_audience: string | null;
  platform: string[] | null;
  current_tools: string | null;
  integrations: string | null;
  has_content: string | null;
  language: string | null;
  tone: string | null;
  timeline: string | null;
  budget: string | null;
  maintenance: string | null;
  extra_notes: string | null;
  locale: string | null;
  created_at: string;
}

// Readable labels for the coded select values (owner-facing panel, English).
const LABELS: Record<string, Record<string, string>> = {
  service_type: {
    chatbot: 'AI Chatbot Development',
    workflow: 'Workflow Automation',
    both: 'Chatbot + Automation',
    consulting: 'AI Strategy Consulting',
  },
  target_audience: {
    customers: 'End customers (B2C)',
    business: 'Other businesses (B2B)',
    internal: 'Internal team / employees',
    mixed: 'Mixed audience',
  },
  has_content: {
    yes_ready: 'Yes — ready to share',
    yes_partial: 'Yes — needs organizing',
    no: 'No — create from scratch',
  },
  tone: {
    professional: 'Professional & Formal',
    friendly: 'Friendly & Conversational',
    technical: 'Technical & Precise',
    sales: 'Persuasive & Sales-oriented',
  },
  timeline: {
    asap: 'ASAP — within 2 weeks',
    '1month': 'Within 1 month',
    flexible: 'Flexible — quality over speed',
    discuss: "Let's discuss",
  },
  budget: {
    under500: 'Under €500',
    '500_1500': '€500 – €1,500',
    '1500_3000': '€1,500 – €3,000',
    over3000: '€3,000+',
    discuss: 'Prefer to discuss',
  },
  maintenance: {
    yes: 'Yes — monthly support plan',
    no: 'No — one-time project',
    maybe: 'Possibly — discuss',
  },
  platform: {
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    website: 'Website Widget',
    voice: 'Voice Assistant',
    instagram: 'Instagram / Social Media',
    other: 'Other',
  },
};

const label = (group: string, value?: string | null): string =>
  (value && LABELS[group]?.[value]) || value || '';

function Line({ label: l, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{l}: </span>
      <span className="whitespace-pre-wrap">{value}</span>
    </p>
  );
}

export function AdminDiscovery({ rows }: { rows: AdminDiscoveryRow[] }) {
  const t = useTranslations('admin.discovery');

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const platforms = (r.platform ?? []).map((p) => label('platform', p)).filter(Boolean).join(', ');
        return (
          <Card key={r.id}>
            <CardContent className="space-y-4 pt-5 pb-5">
              {/* Header */}
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="font-medium">{r.full_name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">&lt;{r.email}&gt;</span>
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </time>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-medium uppercase tracking-wider text-accent">
                  {label('service_type', r.service_type)}
                </span>
                {r.locale && (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium uppercase tracking-wider">
                    {r.locale}
                  </span>
                )}
              </div>

              {/* Goal */}
              {r.project_goal && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.project_goal}</p>
              )}

              {/* Details grid */}
              <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                <Line label="Company" value={r.company} />
                <Line label="Website" value={r.website} />
                <Line label="Industry" value={r.industry} />
                <Line label="Audience" value={label('target_audience', r.target_audience)} />
                <Line label="Platforms" value={platforms} />
                <Line label="Current tools" value={r.current_tools} />
                <Line label="Integrations" value={r.integrations} />
                <Line label="Existing content" value={label('has_content', r.has_content)} />
                <Line label="Bot language(s)" value={r.language} />
                <Line label="Tone" value={label('tone', r.tone)} />
                <Line label="Timeline" value={label('timeline', r.timeline)} />
                <Line label="Budget" value={label('budget', r.budget)} />
                <Line label="Maintenance" value={label('maintenance', r.maintenance)} />
              </div>

              {r.business_description && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Business</p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {r.business_description}
                  </p>
                </div>
              )}

              {r.extra_notes && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{r.extra_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
