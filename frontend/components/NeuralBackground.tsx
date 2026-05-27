"use client";

import { useEffect, useRef } from "react";

/**
 * Neural network background: floating nodes connected by lines.
 * Subtle parallax + connection lines that pulse with neural activity.
 */
export function NeuralBackground({ density = 36 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    const dpr = window.devicePixelRatio || 1;
    const nodes: { x: number; y: number; vx: number; vy: number; r: number; phase: number }[] = [];

    function size() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      nodes.length = 0;
      for (let i = 0; i < density; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: 1 + Math.random() * 1.4,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function isLight() {
      return document.documentElement.classList.contains("light");
    }

    function tick(t: number) {
      ctx!.clearRect(0, 0, w, h);
      const light = isLight();

      const nodeColor = light ? "rgba(22, 150, 214, 0.5)" : "rgba(76, 201, 255, 0.85)";
      const lineColorBase = light ? "22, 150, 214" : "76, 201, 255";
      const purpleBase = light ? "110, 54, 216" : "139, 92, 246";

      // draw lines first
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const maxD = 180;
          if (d2 < maxD * maxD) {
            const alpha = (1 - Math.sqrt(d2) / maxD) * 0.35;
            const useViolet = (i + j) % 3 === 0;
            ctx!.strokeStyle = useViolet
              ? `rgba(${purpleBase}, ${alpha})`
              : `rgba(${lineColorBase}, ${alpha})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        const pulse = 0.6 + 0.4 * Math.sin(t * 0.001 + n.phase);
        const r = n.r * (0.8 + 0.4 * pulse);

        const grad = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
        grad.addColorStop(0, nodeColor);
        grad.addColorStop(1, "rgba(76, 201, 255, 0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r * 5, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = nodeColor;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    size();
    seed();
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => { size(); seed(); });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}
