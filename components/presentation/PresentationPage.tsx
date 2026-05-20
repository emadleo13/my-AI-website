'use client';

import { useLocale } from 'next-intl';

export function PresentationPage() {
  const locale = useLocale();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100dvh',
        background: '#050816',
      }}
    >
      <iframe
        src={`/presentation.html?lang=${locale}`}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        title="Emad AI — Business Presentation"
        allow="autoplay"
      />
    </div>
  );
}
