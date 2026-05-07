import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Emad — AI Consultant & Software Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px',
          background:
            'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #B45309 100%)',
          color: '#F8FAFC',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.85, letterSpacing: 2, textTransform: 'uppercase' }}>
          Hello, I'm Emad
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            marginTop: 16,
            lineHeight: 1.05,
            maxWidth: 980,
          }}
        >
          AI Consultant &amp; Software Developer
        </div>
        <div style={{ fontSize: 36, marginTop: 12, opacity: 0.85 }}>
          Romania · AI strategy, agents, and engineering
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 24,
            opacity: 0.8,
          }}
        >
          emad.dev
        </div>
      </div>
    ),
    size,
  );
}
