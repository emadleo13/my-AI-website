import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';

export interface AdminContactRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

export function AdminContacts({ rows }: { rows: AdminContactRow[] }) {
  const t = useTranslations('admin.contacts');

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
      {rows.map((c) => (
        <Card key={c.id}>
          <CardContent className="pt-5 pb-5 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  &lt;{c.email}&gt;
                </span>
              </div>
              <time className="text-xs text-muted-foreground">
                {new Date(c.created_at).toLocaleString()}
              </time>
            </div>
            {c.subject && (
              <div className="text-xs uppercase tracking-wider text-accent">
                {c.subject}
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {c.message}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
