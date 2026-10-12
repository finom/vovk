'use client';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

// Slots circle the base of the center block; a slot takes the next snippet while it is hidden behind the block.
// Fewer slots on a narrower stage, so the cards in front don't cover each other.
const slotCount = (stageWidth: number) => (stageWidth >= 800 ? 5 : stageWidth >= 600 ? 4 : 3);
const ORBIT_SPEED = 0.0000875;
const ORBIT_Y = 80;
// A card is a docs code block shown at 84% (behind) to 92% (in front) of its size.
const SCALE_BACK = 0.84;
const SCALE_FRONT = 0.92;
const CARD_W = 270;
const PADDING_TOP = 40;
const PADDING_BOTTOM = 160;

function slotAt(slot: number, slots: number, time: number) {
  const angle = (slot / slots) * Math.PI * 2 + time * ORBIT_SPEED;
  // Laps counted from the back of the ring, so the snippet changes where the card can't be seen.
  const lap = Math.floor((angle + Math.PI / 2) / (Math.PI * 2));
  const yFloat = Math.sin((slot / slots) * Math.PI * 3 + time * 0.0005) * 4;
  return { lap, x: Math.cos(angle), y: Math.sin(angle) * ORBIT_Y + yFloat, depth: (Math.sin(angle) + 1) / 2 };
}

export function Orbit({ center, cards }: { center: ReactNode; cards: { key: string; block: ReactNode }[] }) {
  const [time, setTime] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState({ width: 832, base: PADDING_TOP + 460 });
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);

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
    const block = centerRef.current;
    if (!el || !block) return;
    const measure = () => setStage({ width: el.clientWidth, base: block.offsetTop + block.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(block);
    const h = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouse({ x: (e.clientX - r.left - r.width / 2) * 0.015, y: (e.clientY - r.top - r.height / 2) * 0.015 });
    };
    el.addEventListener('mousemove', h);
    return () => {
      observer.disconnect();
      el.removeEventListener('mousemove', h);
    };
  }, []);

  const slots = slotCount(stage.width);
  const maxX = Math.max(0, stage.width / 2 - (CARD_W * SCALE_FRONT) / 2);

  return (
    <div
      ref={containerRef}
      className="code-orbit"
      style={{
        position: 'relative',
        width: '100%',
        margin: '0 auto',
        paddingTop: PADDING_TOP,
        paddingBottom: PADDING_BOTTOM,
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        // Keeps the cards' z-index inside the stage, under the sticky navbar.
        isolation: 'isolate',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes code-orbit-pulse { 0%{transform:scale(1);opacity:.35} 100%{transform:scale(1.06);opacity:0} }
        .code-orbit-ring { border-color: var(--border); }
        .code-orbit-pulse { border-color: var(--vovk-logo-accent); }
        .code-orbit-card { transition: transform .25s ease; border-radius: 6px; box-shadow: 0 6px 20px rgba(17,17,17,.08); }
        .dark .code-orbit-card { box-shadow: 0 6px 20px rgba(0,0,0,.5); }
        .code-orbit-card:hover { transform: scale(1.04); }
        .code-orbit-card button { display: none; }
      `}</style>

      {/* orbit ring hint */}
      <div
        className="code-orbit-ring"
        style={{
          position: 'absolute',
          left: '50%',
          top: stage.base,
          width: maxX * 2,
          height: ORBIT_Y * 2,
          transform: 'translate(-50%,-50%)',
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* central block */}
      <div ref={centerRef} style={{ position: 'relative', zIndex: 100, width: 540, maxWidth: '100%' }}>
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

      {/* orbiting snippets: behind the block at the back of the ring, over its last lines at the front */}
      {Array.from({ length: slots }, (_, slot) => {
        const { lap, x, y, depth } = slotAt(slot, slots, time);
        const card = cards[(slot + lap * slots) % cards.length];
        const scale = SCALE_BACK + (SCALE_FRONT - SCALE_BACK) * depth;
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: a slot is a position on the ring
            key={slot}
            style={{
              position: 'absolute',
              left: '50%',
              top: stage.base,
              width: 'max-content',
              minWidth: CARD_W,
              transform: `translate(calc(-50% + ${x * maxX + mouse.x}px),calc(-50% + ${y + mouse.y}px)) scale(${scale})`,
              opacity: Math.min(1, 0.3 + depth * 1.4),
              zIndex: Math.round(depth * 200),
            }}
          >
            <div className="code-orbit-card">{card.block}</div>
          </div>
        );
      })}
    </div>
  );
}
