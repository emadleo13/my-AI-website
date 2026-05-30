'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { useTranslations } from 'next-intl';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Hi! I'm Emad's AI assistant. Ask me anything about AI consulting, services, or how I can help your business.",
};

function RobotFace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden>
      {/* Head */}
      <rect x="6" y="8" width="24" height="22" rx="6" fill="#10b981" />
      {/* Antenna */}
      <line x1="18" y1="8" x2="18" y2="3" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="2" r="2" fill="#34d399" />
      {/* Eyes */}
      <circle cx="13" cy="17" r="3" fill="#030d0a" />
      <circle cx="23" cy="17" r="3" fill="#030d0a" />
      <circle cx="14" cy="16" r="1" fill="white" />
      <circle cx="24" cy="16" r="1" fill="white" />
      {/* Smile */}
      <path d="M12 23 Q18 28 24 23" stroke="#030d0a" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <circle cx="9" cy="21" r="2" fill="#059669" opacity="0.5" />
      <circle cx="27" cy="21" r="2" fill="#059669" opacity="0.5" />
    </svg>
  );
}

export function FloatingChat() {
  const t = useTranslations('floatingChat');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantText };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const suggestFullChat = userTurns >= 3;

  return (
    /* position: bottom-24 so it clears the scroll-to-top button at bottom-8 */
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      {/* Mini chat popup */}
      {open && (
        <div className="w-80 rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <RobotFace className="h-5 w-5" />
              <span className="text-sm font-semibold text-primary-foreground">
                {t('popupTitle')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                className="flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary-foreground/25 transition-colors"
              >
                {t('fullChat')}
                <ArrowRight className="h-3 w-3" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-64 min-h-32">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {suggestFullChat && (
              <div className="text-center pt-1">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  {t('continueInFullChat')}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-2 flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={t('placeholder')}
              disabled={loading}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 px-1"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
              aria-label="Send"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('ariaLabel')}
        className="group relative flex h-14 w-14 items-center justify-center"
      >
        {/* Ping ring — only when closed */}
        {!open && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40 animate-ping" />
        )}
        {/* Button */}
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 hover:shadow-xl transition-all group-hover:scale-110 active:scale-95">
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <RobotFace className="h-8 w-8" />
          )}
        </span>
      </button>
    </div>
  );
}
