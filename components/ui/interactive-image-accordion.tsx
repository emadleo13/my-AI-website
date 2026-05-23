'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Compass, Bot, MessageSquare, Code2, Briefcase, type LucideIcon } from 'lucide-react';

export interface AccordionImageItem {
  id: number;
  title: string;
  imageUrl?: string;
  iconIndex?: number;
  gradient?: string;
}

const DEFAULT_ICONS: LucideIcon[] = [Compass, Bot, MessageSquare, Code2, Briefcase];

const GRADIENTS = [
  'from-indigo-600 via-violet-600 to-purple-700',
  'from-cyan-500 via-teal-500 to-emerald-600',
  'from-orange-500 via-amber-500 to-yellow-500',
  'from-rose-500 via-pink-500 to-fuchsia-600',
  'from-sky-500 via-blue-600 to-indigo-700',
];

function AccordionItem({
  item,
  index,
  isActive,
  onMouseEnter,
}: {
  item: AccordionImageItem;
  index: number;
  isActive: boolean;
  onMouseEnter: () => void;
}) {
  const gradient = item.gradient ?? GRADIENTS[index % GRADIENTS.length];
  const Icon = DEFAULT_ICONS[item.iconIndex ?? index];

  return (
    <div
      className={`
        relative h-[420px] rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out flex-shrink-0
        ${item.imageUrl ? '' : `bg-gradient-to-br ${gradient}`}
        ${isActive ? 'w-[360px]' : 'w-[56px]'}
      `}
      onMouseEnter={onMouseEnter}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
          sizes="360px"
        />
      ) : null}

      <div className="absolute inset-0 bg-black/40" />

      {isActive && Icon ? (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-10 w-10 text-white" />
        </div>
      ) : null}

      <span
        className={`
          absolute text-white text-base font-semibold whitespace-nowrap
          transition-all duration-300 ease-in-out drop-shadow-md
          ${
            isActive
              ? 'bottom-8 left-1/2 -translate-x-1/2 rotate-0'
              : 'bottom-24 left-1/2 -translate-x-1/2 rotate-90'
          }
        `}
      >
        {item.title}
      </span>
    </div>
  );
}

export function InteractiveImageAccordion({
  items,
}: {
  items: AccordionImageItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(items.length - 1);

  return (
    <div className="flex flex-row items-center justify-center gap-3 overflow-x-auto p-2">
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          index={index}
          isActive={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
        />
      ))}
    </div>
  );
}
