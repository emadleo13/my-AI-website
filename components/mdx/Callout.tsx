import { Info, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'info' | 'warn' | 'success' | 'tip';

const TONES: Record<
  Tone,
  { icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  info: {
    icon: Info,
    classes: 'border-primary/30 bg-primary/5 text-foreground [&>svg]:text-primary',
  },
  warn: {
    icon: AlertTriangle,
    classes:
      'border-destructive/30 bg-destructive/5 text-foreground [&>svg]:text-destructive',
  },
  success: {
    icon: CheckCircle2,
    classes: 'border-emerald-500/30 bg-emerald-500/5 [&>svg]:text-emerald-500',
  },
  tip: {
    icon: Lightbulb,
    classes: 'border-accent/30 bg-accent/5 [&>svg]:text-accent',
  },
};

interface Props {
  tone?: Tone;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ tone = 'info', title, children }: Props) {
  const { icon: Icon, classes } = TONES[tone];
  return (
    <aside
      className={cn(
        'my-6 flex gap-3 rounded-lg border p-4 text-sm leading-relaxed not-prose',
        classes,
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </aside>
  );
}
