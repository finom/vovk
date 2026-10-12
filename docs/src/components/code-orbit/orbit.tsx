'use client';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

const ORBIT_A = 500;
const ORBIT_B = 160;
const TILT_RAD = (60 * Math.PI) / 180;
const ORBIT_SPEED = 0.0000875;
const CROSS_HALF = 0.15;
const CONTAINER_W = 832;
const CARD_W = 170;
const MAX_X = (CONTAINER_W - CARD_W) / 2;
// A card is a docs code block at full size, scaled down to CARD_W.
const CARD_NATURAL_W = 300;
const CARD_SCALE = CARD_W / CARD_NATURAL_W;

function getPos(index: number, total: number, time: number) {
  const angle = (index / total) * Math.PI * 2 + time * ORBIT_SPEED;
  const rawX = Math.cos(angle) * ORBIT_A;
  const x = Math.tanh(rawX / MAX_X) * MAX_X;
  const yFlat = Math.sin(angle) * ORBIT_B;
  const y = yFlat * Math.cos(TILT_RAD);
  const z = yFlat * Math.sin(TILT_RAD);
  const yFloat = Math.sin((index / total) * Math.PI * 3 + time * 0.0005) * 6;
  return { x, y: y + yFloat, z };
}

export function Orbit({ center, cards }: { center: ReactNode; cards: { key: string; block: ReactNode }[] }) {
  const [time, setTime] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const loop = useCallback((ts: number) => {
    if (lastRef.current === null) lastRef.current = ts;
    const dt = ts - lastRef.current;
    lastRef.current = ts;
    setTime((t) => t + dt);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouse({ x: (e.clientX - r.left - r.width / 2) * 0.015, y: (e.clientY - r.top - r.height / 2) * 0.015 });
    };
    el.addEventListener('mousemove', h);
    return () => el.removeEventListener('mousemove', h);
  }, []);

  return (
    <div
      ref={containerRef}
      className="code-orbit"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: CONTAINER_W,
        margin: '0 auto',
        paddingTop: 40,
        paddingBottom: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes code-orbit-pulse { 0%{transform:scale(1);opacity:.35} 100%{transform:scale(1.1);opacity:0} }
        .code-orbit-ring { border-color: var(--border); }
        .code-orbit-pulse { border-color: var(--vovk-logo-accent); }
        .code-orbit-card { transition: transform .25s ease; }
        .code-orbit-card:hover { transform: scale(1.08); }
        .code-orbit-card button { display: none; }
      `}</style>

      {/* orbit ring hint */}
      <div
        className="code-orbit-ring"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: MAX_X * 2,
          height: ORBIT_B * 2,
          transform: 'translate(-50%,-50%) rotateX(60deg)',
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* central block */}
      <div style={{ position: 'relative', zIndex: 100, width: 540, maxWidth: '100%' }}>
        <div
          className="code-orbit-pulse"
          style={{
            position: 'absolute',
            inset: -2,
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 8,
            animation: 'code-orbit-pulse 3s ease-out infinite',
            pointerEvents: 'none',
          }}
        />
        {center}
      </div>

      {/* orbiting snippets */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 101, isolation: 'isolate', pointerEvents: 'none' }}>
        {cards.map(({ key, block }, i) => {
          const { x, y, z } = getPos(i, cards.length, time);
          const dn = (z + ORBIT_B) / (ORBIT_B * 2);
          const opacity = dn ** 1.2;
          const blur = (1 - dn) * 0.35;
          const crossIntensity = Math.max(0, 1 - Math.abs(dn - 0.5) / CROSS_HALF);
          const scale = (0.65 + dn * 0.55) * (1 + crossIntensity * 0.04) * CARD_SCALE;
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: CARD_NATURAL_W,
                transform: `translate(calc(-50% + ${x + mouse.x}px),calc(-50% + ${y + mouse.y}px)) scale(${scale})`,
                opacity,
                filter: blur > 0.1 ? `blur(${blur}px)` : 'none',
                pointerEvents: opacity > 0.05 ? 'auto' : 'none',
                zIndex: Math.round(dn * 200),
              }}
            >
              <div className="code-orbit-card">{block}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
