'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function Composer({ value, onChange, onSubmit, disabled }: Props) {
  const t = useTranslations('consultant');

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={t('placeholder')}
        rows={2}
        disabled={disabled}
        className="resize-none"
      />
      <Button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        size="icon"
        aria-label={t('send')}
      >
        <Send className="h-4 w-4 rtl:rotate-180" />
      </Button>
    </div>
  );
}
