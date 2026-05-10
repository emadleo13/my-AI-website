'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  ArrowUp,
  LogIn,
  Trash2,
  Briefcase,
  Compass,
  Code2,
  Bot,
} from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { motion, AnimatePresence } from 'framer-motion';
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

const TOPIC_ICONS: Record<TopicKey, React.ComponentType<{ className?: string }>> = {
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
    const starter = t(`starters.${key}`);
    setInput(starter);
    inputRef.current?.focus();
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

  return (
    <div className="w-full">
      {/* ── Empty-state header ── */}
      <AnimatePresence>
        {!hasMessages && (
          <motion.div
            key="empty-header"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center mb-8 pt-4"
          >
            {/* Animated logo */}
            <div className="mb-5 w-16 h-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 200 200"
                width="100%"
                height="100%"
              >
                <g clipPath="url(#cw_clip_1)">
                  <mask
                    id="cw_mask_1"
                    style={{ maskType: 'alpha' }}
                    width="200"
                    height="200"
                    x="0"
                    y="0"
                    maskUnits="userSpaceOnUse"
                  >
                    <path
                      fill="#fff"
                      fillRule="evenodd"
                      d="M100 150c27.614 0 50-22.386 50-50s-22.386-50-50-50-50 22.386-50 50 22.386 50 50 50zm0 50c55.228 0 100-44.772 100-100S155.228 0 100 0 0 44.772 0 100s44.772 100 100 100z"
                      clipRule="evenodd"
                    />
                  </mask>
                  <g mask="url(#cw_mask_1)">
                    <path fill="#fff" d="M200 0H0v200h200V0z" />
                    <path fill="#0066FF" fillOpacity="0.33" d="M200 0H0v200h200V0z" />
                    <g filter="url(#cw_filter0)" className="animate-gradient">
                      <path fill="#0066FF" d="M110 32H18v68h92V32z" />
                      <path fill="#0044FF" d="M188-24H15v98h173v-98z" />
                      <path fill="#0099FF" d="M175 70H5v156h170V70z" />
                      <path fill="#00CCFF" d="M230 51H100v103h130V51z" />
                    </g>
                  </g>
                </g>
                <defs>
                  <filter
                    id="cw_filter0"
                    width="385"
                    height="410"
                    x="-75"
                    y="-104"
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur result="effect1_blur" stdDeviation="40" />
                  </filter>
                  <clipPath id="cw_clip_1">
                    <path fill="#fff" d="M0 0H200V200H0z" />
                  </clipPath>
                </defs>
                <g style={{ mixBlendMode: 'overlay' }} mask="url(#cw_mask_1)">
                  <path
                    fill="gray"
                    stroke="transparent"
                    d="M200 0H0v200h200V0z"
                    filter="url(#cw_noise_1)"
                  />
                </g>
                <defs>
                  <filter
                    id="cw_noise_1"
                    width="100%"
                    height="100%"
                    x="0%"
                    y="0%"
                    filterUnits="objectBoundingBox"
                  >
                    <feTurbulence baseFrequency="0.6" numOctaves="5" result="out1" seed="4" />
                    <feComposite in="out1" in2="SourceGraphic" operator="in" result="out2" />
                    <feBlend in="SourceGraphic" in2="out2" mode="overlay" result="out3" />
                  </filter>
                </defs>
              </svg>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {t('subtitle')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Message history ── */}
      <AnimatePresence>
        {hasMessages && (
          <motion.div
            key="messages"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            ref={scrollRef}
            className="h-[400px] overflow-y-auto space-y-4 mb-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
          >
            {messages.map((m, i) => (
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
            ))}
            {streaming &&
              messages[messages.length - 1]?.role === 'assistant' &&
              !messages[messages.length - 1]?.content && <TypingIndicator />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input card ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {limitReached ? (
          <div className="p-4 space-y-2">
            <p className="font-medium text-sm">{t('limit.title')}</p>
            <p className="text-muted-foreground text-sm">{t('limit.desc')}</p>
            <Button asChild size="sm" variant="accent" className="gap-1.5 mt-1">
              <Link href="/auth">
                <LogIn className="h-3.5 w-3.5" />
                {t('limit.cta')}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Text input row */}
            <div className="px-4 pt-4 pb-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={t('placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && input.trim() && !streaming) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                disabled={streaming}
                className="w-full text-gray-700 text-base outline-none placeholder:text-gray-400 bg-transparent disabled:opacity-50"
              />
            </div>

            {/* Topic chips + send */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                {TOPICS.map((key) => {
                  const Icon = TOPIC_ICONS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTopicClick(key)}
                      disabled={streaming}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t(`chips.${key}`)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {hasMessages && (
                  <button
                    type="button"
                    onClick={clearChat}
                    disabled={streaming}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    aria-label={t('clear')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={streaming || !input.trim()}
                  aria-label={t('send')}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    input.trim() && !streaming
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Counter */}
      {!limitReached && (
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 text-end mt-2">
          {count}/{MESSAGE_LIMIT}
        </p>
      )}

      {/* ── Command category cards (empty state only) ── */}
      <AnimatePresence>
        {!hasMessages && !limitReached && (
          <motion.div
            key="commands"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4"
          >
            {TOPICS.map((key) => {
              const Icon = TOPIC_ICONS[key];
              return (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => handleTopicClick(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40 transition-all text-center"
                >
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600 leading-snug">
                    {t(`chips.${key}`)}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
