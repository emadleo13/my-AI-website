import { Info } from 'lucide-react';

export function DemoBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent-foreground/90">
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
      <p>{message}</p>
    </div>
  );
}
