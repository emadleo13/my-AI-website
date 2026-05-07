'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import * as React from 'react';

type Props = HTMLMotionProps<'div'> & { delay?: number };

export function ScrollReveal({ delay = 0, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
