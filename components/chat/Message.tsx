export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function Message({ message }: { message: ChatMsg }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[80%] rounded-[18px] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                color: 'white',
                borderBottomRightRadius: '4px',
              }
            : {
                background: 'rgba(255,255,255,0.08)',
                color: '#e9d5ff',
                borderBottomLeftRadius: '4px',
              }
        }
      >
        {message.content || '…'}
      </div>
    </div>
  );
}
