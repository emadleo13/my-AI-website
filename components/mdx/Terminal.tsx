import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  className?: string;
  children: ReactNode;
}

export function Terminal({ title = 'terminal', className, children }: Props) {
  return (
    <div
      className={cn(
        'not-prose my-6 overflow-hidden rounded-lg border border-border bg-zinc-950 shadow-xl',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </span>
        <span className="ms-2 truncate text-xs font-medium text-zinc-400">
          {title}
        </span>
      </div>
      <div className="p-4 text-sm text-zinc-100 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent [&_code]:!text-inherit font-mono leading-relaxed">
        {children}
      </div>
    </div>
  );
}
