'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Camera, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowser } from '@/lib/supabase/client';

interface Props {
  userId: string;
  /** Current avatar URL (already cache-busted by the server). */
  initialUrl: string | null;
}

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function AvatarUpload({ userId, initialUrl }: Props) {
  const t = useTranslations('dashboard.avatar');
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(initialUrl);

  const supa = getSupabaseBrowser();

  const handleFile = async (file: File) => {
    if (!supa) {
      toast.error(t('demo'));
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      toast.error(t('badType'));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t('tooLarge'));
      return;
    }

    setBusy(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const objectName = `${userId}/avatar.${ext}`;

      const { error: upErr } = await supa.storage
        .from('avatars')
        .upload(objectName, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supa.storage.from('avatars').getPublicUrl(objectName);
      const cacheBusted = `${publicUrl}?v=${Date.now()}`;

      const { error: updErr } = await supa
        .from('profiles')
        .update({ avatar_url: cacheBusted })
        .eq('id', userId);
      if (updErr) throw updErr;

      setPreview(cacheBusted);
      toast.success(t('uploaded'));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('failed'));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!supa) {
      toast.error(t('demo'));
      return;
    }
    setBusy(true);
    try {
      const { data: list } = await supa.storage
        .from('avatars')
        .list(userId);
      if (list && list.length > 0) {
        await supa.storage
          .from('avatars')
          .remove(list.map((f) => `${userId}/${f.name}`));
      }
      const { error: updErr } = await supa
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);
      if (updErr) throw updErr;

      setPreview(null);
      toast.success(t('removed'));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <User className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="gap-1.5"
          >
            <Camera className="h-3.5 w-3.5" />
            {busy ? t('uploading') : preview ? t('replace') : t('upload')}
          </Button>
          {preview && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={handleRemove}
              className="gap-1.5 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('remove')}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t('hint')}</p>
      </div>
    </div>
  );
}
