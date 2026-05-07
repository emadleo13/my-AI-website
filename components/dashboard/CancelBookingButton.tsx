'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cancelBookingAction } from '@/lib/actions';

interface Props {
  bookingId: string;
}

export function CancelBookingButton({ bookingId }: Props) {
  const t = useTranslations('dashboard.cancel');
  const [open, setOpen] = React.useState(false);
  const [state, action, pending] = useActionState(cancelBookingAction, null);
  const lastSeen = React.useRef<typeof state>(null);

  React.useEffect(() => {
    if (state === lastSeen.current) return;
    lastSeen.current = state;
    if (state?.ok) {
      toast.success(t('done'));
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error === 'demo' ? t('demo') : t('failed'));
    }
  }, [state, t]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
          {t('action')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('body')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            {t('keep')}
          </Button>
          <form action={action}>
            <input type="hidden" name="id" value={bookingId} />
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? t('cancelling') : t('confirm')}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
