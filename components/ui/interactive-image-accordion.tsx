'use client';

import React, { useState } from 'react';

export interface AccordionImageItem {
  id: number;
  title: string;
  imageUrl: string;
}

function AccordionItem({
  item,
  isActive,
  onMouseEnter,
}: {
  item: AccordionImageItem;
  isActive: boolean;
  onMouseEnter: () => void;
}) {
  return (
    <div
      className={`
        relative h-[420px] rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out flex-shrink-0
        ${isActive ? 'w-[360px]' : 'w-[56px]'}
      `}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      <span
        className={`
          absolute text-white text-base font-semibold whitespace-nowrap
          transition-all duration-300 ease-in-out
          ${
            isActive
              ? 'bottom-5 left-1/2 -translate-x-1/2 rotate-0'
              : 'bottom-24 left-1/2 -translate-x-1/2 rotate-90'
          }
        `}
      >
        {item.title}
      </span>
    </div>
  );
}

export function InteractiveImageAccordion({ items }: { items: AccordionImageItem[] }) {
  const [activeIndex, setActiveIndex] = useState(items.length - 1);

  return (
    <div className="flex flex-row items-center justify-center gap-3 overflow-x-auto p-2">
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
        />
      ))}
    </div>
  );
}
