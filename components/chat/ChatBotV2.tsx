'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { Send, Trash2, SkipForward, LogIn, ArrowUp } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';
import { BinarySphere } from './BinarySphere';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'emad.consultant.chat.v1';
const COUNTER_KEY = 'emad.consultant.count.v1';
const INTRO_KEY = 'emad.consultant.introSeen.v1';
const MESSAGE_LIMIT = 30;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const INTRO_LINES: Record<string, string[]> = {
  en: [
    "Hello! I have a little secret...",
    "I'm not a real human.",
    "I'm an AI assistant powered by advanced technology.",
    "But here's the good news —",
    "I can help you with web development, AI solutions, and business automation.",
    "Tell me, what can I build for you?",
  ],
  fa: [
    "سلام! یک راز کوچک دارم...",
    "من یک انسان واقعی نیستم.",
    "من یک دستیار هوش مصنوعی هستم.",
    "اما خبر خوب اینه که —",
    "میتونم در توسعه وب، هوش مصنوعی و اتوماسیون کسب‌وکار بهتون کمک کنم.",
    "بگید، چی میتونم براتون بسازم؟",
  ],
  ro: [
    "Salut! Am un mic secret...",
    "Nu sunt o persoană reală.",
    "Sunt un asistent AI bazat pe tehnologie avansată.",
    "Dar vestea bună e că —",
    "Te pot ajuta cu dezvoltare web, soluții AI și automatizare.",
    "Spune-mi, ce pot construi pentru tine?",
  ],
};

function speakText(text: string, lang: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const langMap: Record<string, string> = { en: 'en-US', fa: 'fa-IR', ro: 'ro-RO' };
  utter.lang = langMap[lang] || 'en-US';
  utter.rate = 0.95;
  utter.pitch = 0.9;
  window.speechSynthesis.speak(utter);
}

/* ─── Intro screen ─── */
function IntroScreen({ onDone }: { onDone: () => void }) {
  const locale = useLocale();
  const t = useTranslations('chatbot');
  const lines = INTRO_LINES[locale] || INTRO_LINES.en;
  const [lineIdx, setLineIdx] = React.useState(0);
  const [charIdx, setCharIdx] = React.useState(0);
  const [displayedLines, setDisplayedLines] = React.useState<string[]>([]);
  const [speaking, setSpeaking] = React.useState(false);
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    if (doneRef.current) return;
    if (lineIdx >= lines.length) {
      const timer = setTimeout(() => {
        doneRef.current = true;
        if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
        onDone();
      }, 1500);
      return () => clearTimeout(timer);
    }

    const currentLine = lines[lineIdx];
    if (charIdx === 0) {
      setSpeaking(true);
      speakText(currentLine, locale);
    }

    if (charIdx < currentLine.length) {
      const timer = setTimeout(() => setCharIdx(charIdx + 1), 40);
      return () => clearTimeout(timer);
    }

    setSpeaking(false);
    const timer = setTimeout(() => {
      setDisplayedLines(prev => [...prev, currentLine]);
      setLineIdx(lineIdx + 1);
      setCharIdx(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [lineIdx, charIdx, lines, locale, onDone]);

  const currentTyping = lineIdx < lines.length ? lines[lineIdx].slice(0, charIdx) : '';

  const handleSkip = () => {
    doneRef.current = true;
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    onDone();
  };

  return (
    <div className="chatbot-v2-intro">
      <div className="chatbot-v2-grid-bg" />
      <button onClick={handleSkip} className="chatbot-v2-skip">
        <SkipForward className="h-4 w-4" />
        {t('skip')}
      </button>

      <div className="chatbot-v2-intro-content">
        <div className="chatbot-v2-sphere-wrapper">
          <BinarySphere size={260} speaking={speaking} />
          <div className="chatbot-v2-sphere-glow" />
        </div>

        <div className="chatbot-v2-subtitle-area">
          {displayedLines.map((line, i) => (
            <p key={i} className="chatbot-v2-subtitle chatbot-v2-subtitle-done">
              {line}
            </p>
          ))}
          {currentTyping && (
            <p className="chatbot-v2-subtitle chatbot-v2-subtitle-active">
              {currentTyping}
              <span className="chatbot-v2-cursor" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Chat screen ─── */
function ChatScreen() {
  const t = useTranslations('consultant');
  const tc = useTranslations('chatbot');
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
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
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
    try { localStorage.setItem(COUNTER_KEY, String(newCount)); } catch {}

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(0, -1).map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 429) toast.error(t('rateLimited'));
        else toast.error(body?.message ?? 'Chat error');
        setMessages(m => m.slice(0, -1));
        const rc = Math.max(0, newCount - 1);
        setCount(rc);
        try { localStorage.setItem(COUNTER_KEY, String(rc)); } catch {}
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages(curr => {
          const copy = [...curr];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: acc };
          return copy;
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chat error');
      setMessages(m => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
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
    <div className="chatbot-v2-chat">
      {/* Header */}
      <div className="chatbot-v2-chat-header">
        <div className="chatbot-v2-chat-avatar">
          <BinarySphere size={44} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm m-0 leading-tight">
            {tc('name')}
          </p>
          <p className="text-[12px] m-0 mt-0.5 flex items-center gap-1.5 text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
            {t('status')}
          </p>
        </div>
        {hasMessages && (
          <button
            type="button"
            onClick={clearChat}
            disabled={streaming}
            aria-label={t('clear')}
            className="chatbot-v2-clear-btn"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="chatbot-v2-messages chat-scrollbar">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
            <BinarySphere size={80} />
            <p className="text-sm leading-relaxed max-w-xs mt-3 text-emerald-300/70">
              {t('subtitle')}
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  isUser
                    ? 'chatbot-v2-msg-user'
                    : 'chatbot-v2-msg-bot'
                }`}
              >
                {msg.content || (
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick topics — empty state only */}
      {!hasMessages && !limitReached && (
        <div className="chatbot-v2-chips">
          {(['ai', 'dev', 'agents'] as const).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => sendMessage(t(`starters.${key}`))}
              disabled={streaming}
              className="chatbot-v2-chip"
            >
              {t(`chips.${key}`)}
            </button>
          ))}
        </div>
      )}

      {/* Limit reached */}
      {limitReached && (
        <div className="chatbot-v2-limit">
          <p className="font-semibold text-sm text-white mb-1">{t('limit.title')}</p>
          <p className="text-sm mb-3 text-emerald-400/70">{t('limit.desc')}</p>
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 gap-1.5">
            <Link href="/auth">
              <LogIn className="h-3.5 w-3.5" />
              {t('limit.cta')}
            </Link>
          </Button>
        </div>
      )}

      {/* Input */}
      {!limitReached && (
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          className="chatbot-v2-input-bar"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && canSend) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={t('placeholder')}
            disabled={streaming}
            className="chatbot-v2-input"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label={t('send')}
            className="chatbot-v2-send-btn"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* Counter */}
      {!limitReached && (
        <p className="text-end text-[10px] text-emerald-500/30 px-5 pb-2">
          {count}/{MESSAGE_LIMIT}
        </p>
      )}
    </div>
  );
}

/* ─── Main wrapper ─── */
export function ChatBotV2() {
  const [phase, setPhase] = React.useState<'loading' | 'intro' | 'chat'>('loading');

  React.useEffect(() => {
    try {
      const seen = localStorage.getItem(INTRO_KEY);
      setPhase(seen ? 'chat' : 'intro');
    } catch {
      setPhase('intro');
    }
  }, []);

  const handleIntroDone = React.useCallback(() => {
    try { localStorage.setItem(INTRO_KEY, '1'); } catch {}
    setPhase('chat');
  }, []);

  if (phase === 'loading') {
    return (
      <div className="chatbot-v2-wrapper">
        <div className="flex items-center justify-center h-96">
          <BinarySphere size={120} />
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-v2-wrapper">
      {phase === 'intro' ? (
        <IntroScreen onDone={handleIntroDone} />
      ) : (
        <ChatScreen />
      )}
    </div>
  );
}
