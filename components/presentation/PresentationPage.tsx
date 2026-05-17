'use client';

export function PresentationPage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        background: '#050816',
      }}
    >
      <iframe
        src="/presentation.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Emad AI — Business Presentation"
        allow="autoplay"
      />
    </div>
  );
}
