'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  theta: number;
  phi: number;
  char: string;
  speed: number;
  fontSize: number;
}

interface Props {
  size?: number;
  className?: string;
  speaking?: boolean;
}

export function BinarySphere({ size = 300, className, speaking }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotRef = useRef(0);
  const pulseRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = size;
    const h = size;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    rotRef.current += 0.004;
    pulseRef.current += 0.03;
    const rot = rotRef.current;
    const breathe = speaking ? Math.sin(pulseRef.current) * 0.08 : Math.sin(pulseRef.current * 0.5) * 0.03;
    const radius = w * 0.34 * (1 + breathe);
    const cx = w / 2;
    const cy = h / 2;

    const count = 180;
    const projected: { x: number; y: number; depth: number; char: string; fs: number }[] = [];

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const sx = Math.sin(phi) * Math.cos(theta + rot);
      const sy = Math.sin(phi) * Math.sin(theta + rot);
      const sz = Math.cos(phi);

      const x3 = radius * sx;
      const y3 = radius * sy * 0.95;
      const z3 = radius * sz;

      const depth = (z3 + radius) / (2 * radius);
      const char = ((i * 7 + Math.floor(rot * 10)) % 3 === 0) ? '1' : '0';
      const fs = 7 + depth * 7;

      projected.push({
        x: cx + x3,
        y: cy + y3,
        depth,
        char,
        fs,
      });
    }

    projected.sort((a, b) => a.depth - b.depth);

    for (const p of projected) {
      const alpha = 0.08 + p.depth * 0.92;
      const g = Math.round(180 + p.depth * 75);
      ctx.font = `bold ${p.fs}px monospace`;
      ctx.fillStyle = `rgba(${Math.round(30 + p.depth * 30)}, ${g}, ${Math.round(80 + p.depth * 50)}, ${alpha})`;
      ctx.fillText(p.char, p.x, p.y);
    }

    if (speaking) {
      const glowRadius = radius * 1.2;
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, glowRadius);
      grad.addColorStop(0, 'rgba(34, 197, 94, 0.06)');
      grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [size, speaking]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
