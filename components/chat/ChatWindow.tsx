'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Briefcase, Compass, Code2, Bot, Trash2, LogIn, ArrowUp } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';
import { Message, type ChatMsg } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { type TopicKey } from './TopicChips';

const STORAGE_KEY = 'emad.consultant.chat.v1';
const COUNTER_KEY = 'emad.consultant.count.v1';
const MESSAGE_LIMIT = 10;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const TOPIC_ICONS: Record<TopicKey, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  job: Briefcase,
  ai: Compass,
  dev: Code2,
  agents: Bot,
};

const TOPICS: TopicKey[] = ['job', 'ai', 'dev', 'agents'];

export function ChatWindow() {
  const t = useTranslations('consultant');
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [input, setInput] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
      const c = Number(localStorage.getItem(COUNTER_KEY) ?? '0');
      if (Number.isFinite(c)) setCount(c);
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

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
            .slice(0, -1)
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 429) toast.error(t('rateLimited'));
        else toast.error(body?.message ?? 'Chat error');
        setMessages((m) => m.slice(0, -1));
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

  const handleTopicClick = (key: TopicKey) => {
    sendMessage(t(`starters.${key}`));
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
  const hasMessages = messages.length > 0;
  const canSend = input.trim() && !streaming;

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0524 0%, #1a0b3d 50%, #2d1659 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}
    >
      {/* Decorative floating bubbles */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          top: '-5%',
          left: '-5%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          animation: 'chat-float 8s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '160px',
          height: '160px',
          bottom: '5%',
          right: '-3%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(139,92,246,0.2))',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          animation: 'chat-float 6s ease-in-out infinite reverse',
          animationDelay: '2s',
        }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-3 relative"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15))',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          zIndex: 2,
        }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          }}
        >
          AI
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm m-0 leading-tight">{t('title')}</p>
          <p className="text-[12px] m-0 mt-0.5 flex items-center gap-1.5" style={{ color: '#a78bfa' }}>
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#10b981' }}
            />
            {t('status')}
          </p>
        </div>
        {hasMessages && (
          <button
            type="button"
            onClick={clearChat}
            disabled={streaming}
            aria-label={t('clear')}
            className="flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-100 opacity-60 disabled:opacity-30"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="chat-scrollbar flex flex-col gap-3 relative overflow-y-auto"
        style={{
          minHeight: '360px',
          maxHeight: '480px',
          padding: '20px',
          zIndex: 2,
        }}
      >
        {/* Empty state */}
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
            <div
              className="flex items-center justify-center mb-4 text-2xl"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.25))',
                border: '1px solid rgba(139,92,246,0.4)',
              }}
            >
              🤖
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#c4b5fd' }}>
              {t('subtitle')}
            </p>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => {
          const isLastAssistant =
            i === messages.length - 1 && msg.role === 'assistant';
          return isLastAssistant && streaming && !msg.content ? (
            <TypingIndicator key={msg.id} />
          ) : (
            <Message key={msg.id} message={msg} />
          );
        })}
      </div>

      {/* Quick reply chips — shown only on empty state */}
      {!hasMessages && !limitReached && (
        <div
          className="flex flex-wrap gap-2 relative"
          style={{ padding: '0 20px 16px', zIndex: 2 }}
        >
          {TOPICS.map((key) => {
            const Icon = TOPIC_ICONS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTopicClick(key)}
                disabled={streaming}
                className="flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-90 disabled:opacity-40"
                style={{
                  padding: '8px 14px',
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  borderRadius: '24px',
                  color: '#c4b5fd',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Icon style={{ width: '14px', height: '14px' }} />
                {t(`chips.${key}`)}
              </button>
            );
          })}
        </div>
      )}

      {/* Limit reached */}
      {limitReached && (
        <div
          className="relative"
          style={{
            padding: '20px 24px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            zIndex: 2,
          }}
        >
          <p className="font-semibold text-sm text-white mb-1">{t('limit.title')}</p>
          <p className="text-sm mb-3" style={{ color: '#a78bfa' }}>{t('limit.desc')}</p>
          <Button asChild size="sm" variant="accent" className="gap-1.5">
            <Link href="/auth">
              <LogIn className="h-3.5 w-3.5" />
              {t('limit.cta')}
            </Link>
          </Button>
        </div>
      )}

      {/* Input bar */}
      {!limitReached && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2.5 relative"
            style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.2)',
              zIndex: 2,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && canSend) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={t('placeholder')}
              disabled={streaming}
              className="flex-1 text-sm outline-none disabled:opacity-50"
              style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                color: 'white',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label={t('send')}
              className="flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 disabled:cursor-not-allowed"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: canSend
                  ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                  : 'rgba(139,92,246,0.25)',
                border: 'none',
                color: 'white',
                cursor: canSend ? 'pointer' : 'not-allowed',
              }}
            >
              <ArrowUp style={{ width: '16px', height: '16px' }} />
            </button>
          </form>

          {/* Message counter */}
          <p
            className="text-end"
            style={{
              fontSize: '10px',
              color: 'rgba(167,139,250,0.45)',
              padding: '4px 20px 10px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {count}/{MESSAGE_LIMIT}
          </p>
        </>
      )}
    </div>
  );
}
