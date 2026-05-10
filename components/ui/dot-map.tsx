'use client';

import { useRef, useState, useEffect } from 'react';

const ROUTES = [
  { start: { x: 100, y: 150, delay: 0 },   end: { x: 200, y: 80,  delay: 2 },   color: '#3b82f6' },
  { start: { x: 200, y: 80,  delay: 2 },   end: { x: 260, y: 120, delay: 4 },   color: '#3b82f6' },
  { start: { x: 50,  y: 50,  delay: 1 },   end: { x: 150, y: 180, delay: 3 },   color: '#3b82f6' },
  { start: { x: 280, y: 60,  delay: 0.5 }, end: { x: 180, y: 180, delay: 2.5 }, color: '#3b82f6' },
];

function generateDots(width: number, height: number) {
  const dots: { x: number; y: number; radius: number; opacity: number }[] = [];
  const gap = 12;

  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {
      const inMap =
        (x < width * 0.25 && x > width * 0.05 && y < height * 0.4  && y > height * 0.1) ||
        (x < width * 0.25 && x > width * 0.15 && y < height * 0.8  && y > height * 0.4) ||
        (x < width * 0.45 && x > width * 0.3  && y < height * 0.35 && y > height * 0.15) ||
        (x < width * 0.5  && x > width * 0.35 && y < height * 0.65 && y > height * 0.35) ||
        (x < width * 0.7  && x > width * 0.45 && y < height * 0.5  && y > height * 0.1) ||
        (x < width * 0.8  && x > width * 0.65 && y < height * 0.8  && y > height * 0.6);

      if (inMap && Math.random() > 0.3) {
        dots.push({ x, y, radius: 1, opacity: Math.random() * 0.5 + 0.1 });
      }
    }
  }
  return dots;
}

export function DotMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let raf: number;
    let startTime = Date.now();

    function draw() {
      ctx!.clearRect(0, 0, dimensions.width, dimensions.height);

      dots.forEach(d => {
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${d.opacity})`;
        ctx!.fill();
      });

      const t = (Date.now() - startTime) / 1000;
      ROUTES.forEach(route => {
        const elapsed = t - route.start.delay;
        if (elapsed <= 0) return;
        const progress = Math.min(elapsed / 3, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        ctx!.beginPath();
        ctx!.moveTo(route.start.x, route.start.y);
        ctx!.lineTo(x, y);
        ctx!.strokeStyle = route.color;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = route.color;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(x, y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = '#60a5fa';
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(x, y, 6, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(96,165,250,0.3)';
        ctx!.fill();

        if (progress === 1) {
          ctx!.beginPath();
          ctx!.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx!.fillStyle = route.color;
          ctx!.fill();
        }
      });

      if (t > 15) startTime = Date.now();
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
