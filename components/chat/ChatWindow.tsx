'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Trash2, LogIn } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Message, type ChatMsg } from './Message';
import { Composer } from './Composer';
import { TopicChips, type TopicKey } from './TopicChips';
import { TypingIndicator } from './TypingIndicator';

const STORAGE_KEY = 'emad.consultant.chat.v1';
const COUNTER_KEY = 'emad.consultant.count.v1';
const MESSAGE_LIMIT = 10;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function ChatWindow() {
  const t = useTranslations('consultant');
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [input, setInput] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Hydrate from localStorage.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
      const c = Number(localStorage.getItem(COUNTER_KEY) ?? '0');
      if (Number.isFinite(c)) setCount(c);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Persist messages.
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* quota / private mode */
    }
  }, [messages]);

  // Auto-scroll to bottom on new content.
  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, streaming]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;
    if (count >= MESSAGE_LIMIT) return;

    const userMsg: ChatMsg = { id: uid(), role: 'user', content: text };
    const assistantMsg: ChatMsg = { id: uid(), role: 'assistant', content: '' };
    const next = [...messages, userMsg, assistantMsg];
    setMessages(next);
    setInput('');
    setStreaming(true);

    const newCount = count + 1;
    setCount(newCount);
    try {
      localStorage.setItem(COUNTER_KEY, String(newCount));
    } catch {}

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next
            .slice(0, -1) // exclude the empty assistant placeholder
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 429) {
          toast.error(t('rateLimited'));
        } else {
          toast.error(body?.message ?? 'Chat error');
        }
        setMessages((m) => m.slice(0, -1));
        // Don't burn a free-preview message on a rejected request.
        const restoreCount = Math.max(0, newCount - 1);
        setCount(restoreCount);
        try {
          localStorage.setItem(COUNTER_KEY, String(restoreCount));
        } catch {}
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((curr) => {
          const copy = [...curr];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: acc };
          return copy;
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chat error');
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  const handleChip = (key: TopicKey) => {
    const starter = t(`starters.${key}`);
    setInput(starter);
  };

  const clearChat = () => {
    setMessages([]);
    setCount(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COUNTER_KEY);
    } catch {}
  };

  const limitReached = count >= MESSAGE_LIMIT;

  return (
    <Card className="flex h-[640px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <TopicChips onPick={handleChip} disabled={streaming || limitReached} />
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          disabled={messages.length === 0}
          className="gap-1.5 text-muted-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('clear')}</span>
        </Button>
      </div>

      <CardContent
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 p-4"
      >
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">
            {t('subtitle')}
          </div>
        ) : (
          messages.map((m, i) => (
            <Message
              key={m.id}
              message={
                streaming &&
                i === messages.length - 1 &&
                m.role === 'assistant' &&
                !m.content
                  ? { ...m, content: '' }
                  : m
              }
            />
          ))
        )}
        {streaming &&
          messages[messages.length - 1]?.role === 'assistant' &&
          !messages[messages.length - 1]?.content && <TypingIndicator />}
      </CardContent>

      <div className="border-t border-border p-3 space-y-3">
        {limitReached ? (
          <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm space-y-2">
            <p className="font-medium">{t('limit.title')}</p>
            <p className="text-muted-foreground">{t('limit.desc')}</p>
            <Button asChild size="sm" variant="accent" className="gap-1.5">
              <Link href="/auth">
                <LogIn className="h-3.5 w-3.5" />
                {t('limit.cta')}
              </Link>
            </Button>
          </div>
        ) : (
          <Composer
            value={input}
            onChange={setInput}
            onSubmit={() => sendMessage(input)}
            disabled={streaming}
          />
        )}
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 text-end">
          {count}/{MESSAGE_LIMIT}
        </p>
      </div>
    </Card>
  );
}
