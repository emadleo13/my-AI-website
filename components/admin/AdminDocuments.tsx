'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Trash2, Upload, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export interface DocumentRow {
  id: string;
  title: string;
  source_type: 'pdf' | 'docx' | 'txt' | 'md' | 'web';
  char_count: number;
  chunk_count: number;
  created_at: string;
}

export function AdminDocuments({ initialDocuments }: { initialDocuments: DocumentRow[] }) {
  const t = useTranslations('admin.documents');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [webDialogOpen, setWebDialogOpen] = useState(false);
  const [webTitle, setWebTitle] = useState('');
  const [webContent, setWebContent] = useState('');
  const [webSaving, setWebSaving] = useState(false);
  const [webError, setWebError] = useState<string | null>(null);

  const documents = initialDocuments;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['pdf', 'docx', 'txt', 'md'].includes(ext)) {
      setUploadError(t('errors.badType'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('errors.tooLarge'));
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^.]+$/, ''));

      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setUploadError((body as { message?: string }).message ?? t('errors.uploadFailed'));
      } else {
        router.refresh();
      }
    } catch {
      setUploadError(t('errors.uploadFailed'));
    } finally {
      setUploading(false);
    }
  }

  async function handleWebSave() {
    if (!webContent.trim() || !webTitle.trim()) {
      setWebError(t('errors.emptyContent'));
      return;
    }
    setWebError(null);
    setWebSaving(true);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'web', title: webTitle.trim(), content: webContent.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setWebError((body as { message?: string }).message ?? t('errors.uploadFailed'));
      } else {
        setWebDialogOpen(false);
        setWebTitle('');
        setWebContent('');
        router.refresh();
      }
    } catch {
      setWebError(t('errors.uploadFailed'));
    } finally {
      setWebSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setConfirmDeleteId(null);

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert((body as { message?: string }).message ?? t('errors.deleteFailed'));
      } else {
        router.refresh();
      }
    } catch {
      alert(t('errors.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? t('uploading') : t('upload')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setWebDialogOpen(true); setWebError(null); }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('addWebText')}
        </Button>
      </div>

      {uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}

      <p className="text-xs text-muted-foreground">{t('hint')}</p>

      {/* Document list */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
            {t('empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.title}</p>
                      <div className="flex flex-wrap gap-2 mt-1 items-center">
                        <Badge variant="secondary" className="text-[10px]">
                          {t(`types.${doc.source_type}`)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t('chunks', { n: doc.chunk_count })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t('chars', { n: doc.char_count.toLocaleString() })}
                        </span>
                        <time className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive shrink-0"
                    disabled={deletingId === doc.id}
                    onClick={() => setConfirmDeleteId(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t('delete')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(o) => { if (!o) setConfirmDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('confirmDelete')}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Web text dialog */}
      <Dialog open={webDialogOpen} onOpenChange={(o) => { if (!o) { setWebDialogOpen(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('addWebTextTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="web-title">{t('titleLabel')}</Label>
              <Input
                id="web-title"
                value={webTitle}
                onChange={(e) => setWebTitle(e.target.value)}
                placeholder="My website content"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="web-content">{t('addWebTextLabel')}</Label>
              <Textarea
                id="web-content"
                value={webContent}
                onChange={(e) => setWebContent(e.target.value)}
                placeholder={t('addWebTextPlaceholder')}
                rows={8}
                className="resize-y"
              />
            </div>
            {webError && <p className="text-sm text-destructive">{webError}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setWebDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button size="sm" disabled={webSaving} onClick={handleWebSave}>
              {webSaving ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
