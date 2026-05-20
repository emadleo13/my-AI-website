export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-4 py-3 rounded-[18px] self-start"
      style={{
        background: 'rgba(255,255,255,0.08)',
        borderBottomLeftRadius: '4px',
        width: 'fit-content',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-purple-400"
        style={{ animation: 'chat-bounce 1.4s infinite' }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-purple-400"
        style={{ animation: 'chat-bounce 1.4s infinite 0.2s' }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-purple-400"
        style={{ animation: 'chat-bounce 1.4s infinite 0.4s' }}
      />
    </div>
  );
}
