'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';

export function PresentationFloatingButton() {
  const locale = useLocale();
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/${locale}/presentation`}
      aria-label="Watch Presentation"
      className="fixed bottom-8 left-6 z-40 flex items-center gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated button */}
      <div className="relative">
        {/* Slow pulsing outer glow rings */}
        <span className="absolute inset-0 rounded-full bg-blue-500/25 animate-ping [animation-duration:2s]" />
        <span
          className="absolute inset-0 rounded-full bg-cyan-400/15 animate-ping [animation-duration:2s]"
          style={{ animationDelay: '1s' }}
        />

        {/* Image circle */}
        <div
          className={`
            relative w-[68px] h-[68px] rounded-full overflow-hidden
            border-2 border-blue-400/70
            shadow-[0_0_22px_rgba(59,130,246,0.55)]
            transition-all duration-300
            ${hovered ? 'scale-110 shadow-[0_0_36px_rgba(56,189,248,0.85)] border-cyan-400' : ''}
          `}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/AI%20PIC.png"
            alt="Presentation"
            className="w-full h-full object-cover"
          />
          {/* Blue tint overlay on hover */}
          <div
            className={`absolute inset-0 bg-blue-600/20 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Blinking live dot */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping [animation-duration:1.5s]" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-cyan-300 border-2 border-slate-900 shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
        </span>
      </div>

      {/* Tooltip — slides in to the right */}
      <div
        className={`
          rounded-xl px-3 py-2 text-sm font-semibold text-white whitespace-nowrap
          bg-slate-900/90 backdrop-blur-sm
          border border-blue-500/30
          shadow-[0_4px_20px_rgba(0,0,0,0.4)]
          transition-all duration-300
          ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'}
        `}
      >
        <span className="mr-1 text-cyan-400">▶</span>
        Watch Presentation
      </div>
    </Link>
  );
}
