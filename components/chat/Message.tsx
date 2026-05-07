import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function Message({ message }: { message: ChatMsg }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md',
        )}
      >
        {message.content || '…'}
      </div>
      {isUser && (
        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
