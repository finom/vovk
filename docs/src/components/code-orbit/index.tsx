/** biome-ignore-all lint/suspicious/noArrayIndexKey: Ignore */
/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: Ignore */
'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const SNIPPETS = [
  {
    label: 'MCP Server',
    lang: 'ts',
    color: '#c084fc',
    code: `server.registerTool(name,\n  { title, inputSchema },\n  execute);`,
  },
  {
    label: '__init__.py',
    lang: 'python',
    color: '#FFD43B',
    code: `def update_user(\n  body: UpdateUserBody,\n) -> UpdateUserOutput:`,
  },
  {
    label: 'page.tsx',
    lang: 'ts',
    color: '#61dafb',
    code: `// SSR: no HTTP round-trip\nconst res = await\n  UserController.updateUser\n  .fn({ body, params });`,
  },
  {
    label: 'Cargo.toml',
    lang: 'toml',
    color: '#dea584',
    code: `[package]\nname = "vovk_hello_world"\nedition = "2021"`,
  },
  {
    label: 'README (TS)',
    lang: 'ts',
    color: '#2d79c7',
    code: `## UserRPC.updateUser\n> Update user by ID\nawait UserRPC.updateUser({\n  body, query, params });`,
  },
  {
    label: 'openapi.json',
    lang: 'json',
    color: '#85ea2d',
    code: `"/api/users/{id}": {\n  "post": {\n    "summary": "Update user" }}`,
  },
  {
    label: 'lib.rs',
    lang: 'rust',
    color: '#f74c00',
    code: `pub async fn update_user(\n  body: update_user_::body,\n) -> Result<output>`,
  },
  {
    label: 'client.ts',
    lang: 'ts',
    color: '#f7df1e',
    code: `// RPC call over HTTP\nconst res = await\n  UserRPC.updateUser(\n  { body, query, params });`,
  },
  {
    label: 'pyproject.toml',
    lang: 'toml',
    color: '#3572A5',
    code: `[project]\nname = "vovk_hello_world"\ndependencies = ["requests"]`,
  },
  {
    label: 'AI Tools',
    lang: 'ts',
    color: '#10b981',
    code: `const tools =\n  deriveTools({\n    modules:\n      { UserRPC } });`,
  },
  {
    label: 'README (RS)',
    lang: 'rust',
    color: '#c96b30',
    code: `## user_rpc::update_user\n> Update user by ID\nuser_rpc::update_user(\n  body, query, params)`,
  },
  {
    label: 'package.json',
    lang: 'json',
    color: '#cb3837',
    code: `"name": "vovk-hello-world",\n"main": "./index.js",\n"types": "./index.d.ts"`,
  },
  {
    label: 'UserService.ts',
    lang: 'ts',
    color: '#3178c6',
    code: `body: VovkBody<\n  typeof UserController\n  .updateUser>`,
  },
  {
    label: 'README (PY)',
    lang: 'python',
    color: '#306998',
    code: `## UserRPC.update_user\n> Update user by ID\nUserRPC.update_user(\n  body=body, params=params)`,
  },
];

const PROCEDURE_CODE = `import { post, prefix, procedure, operation } from "vovk";
import { z } from "zod";

@prefix("users")
export default class UserController {
  @operation({ summary: "Update user" })
  @post("{id}")
  static updateUser = procedure({
    body: z.object({
      email: z.email(),
      profile: z.object({
        name: z.string(), age: z.int() 
      }),
    }),
    params: z.object({ id: z.uuid() }),
  }).handle(async (req, { id }) => {
    return UserService.updateUser(id);
  });
}`;

function syntaxHighlight(code: string, lang: string) {
  const keywords = {
    ts: [
      'import',
      'from',
      'export',
      'default',
      'class',
      'static',
      'async',
      'const',
      'type',
      'interface',
      'await',
      'return',
      'Promise',
      'typeof',
    ],
    rust: ['pub', 'async', 'fn', 'let', 'Result', 'use', 'impl', 'struct', 'mod'],
    python: ['async', 'def', 'self', 'from', 'import', 'return', 'await', 'class'],
    md: ['npm', 'pip', 'cargo'],
    toml: [],
    json: [],
  };
  const kws = keywords[lang as keyof typeof keywords] || keywords.ts;
  let e = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  e = e.replace(/"([^"]*)"/g, '<span style="color:#c3e88d">"$1"</span>');
  e = e.replace(/'([^']*)'/g, '<span style="color:#c3e88d">\'$1\'</span>');
  e = e.replace(/`([^`]*)`/g, '<span style="color:#c3e88d">`$1`</span>');
  kws.forEach((kw) => {
    e = e.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span style="color:#c792ea">$1</span>');
  });
  e = e.replace(/@(\w+)/g, '<span style="color:#89ddff">@$1</span>');
  e = e.replace(/\b(procedure|handle|createRPC|deriveTools|registerTool)\b/g, '<span style="color:#82aaff">$1</span>');
  e = e.replace(
    /\b(User|UserRPC|StreamRPC|UserController|UserService|VovkRequest|VovkBody|VovkParams|VovkQuery|VovkOutput|UpdateUserBody|UpdateUserOutput|UserSchema|Body|Query|Params|Output)\b/g,
    '<span style="color:#ffcb6b;font-style:italic">$1</span>'
  );
  e = e.replace(/##\s(.+)/g, '<span style="color:#82aaff;font-weight:700">## $1</span>');
  e = e.replace(/^(&gt;\s.+)$/gm, '<span style="color:#546e7a;font-style:italic">$1</span>');
  e = e.replace(/\[([^\]]+)\]/g, '<span style="color:#ff5370">[$1]</span>');
  e = e.replace(/^(\/\/.*)$/gm, '<span style="color:#546e7a;font-style:italic">$1</span>');
  return e;
}

const ORBIT_A = 500;
const ORBIT_B = 160;
const TILT_RAD = (60 * Math.PI) / 180;
const ORBIT_SPEED = 0.0000875;
const CROSS_HALF = 0.15;
const CONTAINER_W = 832;
const CARD_W = 170;
const MAX_X = (CONTAINER_W - CARD_W) / 2;

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

function SnipCard({
  s,
  mouse,
  scale,
  opacity,
  blur,
  zIndex,
  crossIntensity = 0,
}: {
  s: { label: string; lang: string; color: string; code: string; x: number; y: number };
  mouse: { x: number; y: number };
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
  crossIntensity?: number;
}) {
  const filterParts: string[] = [];
  if (blur > 0.1) filterParts.push(`blur(${blur}px)`);
  if (crossIntensity > 0.01) filterParts.push(`brightness(${1 + crossIntensity * 0.35})`);
  const filter = filterParts.length ? filterParts.join(' ') : 'none';
  const glow = crossIntensity > 0.01 ? `0 0 ${10 * crossIntensity}px ${s.color}30` : 'none';

  return (
    <div
      className="snip-card-wrap"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${s.x + mouse.x}px),calc(-50% + ${s.y + mouse.y}px)) scale(${scale})`,
        opacity,
        filter,
        pointerEvents: opacity > 0.05 ? 'auto' : 'none',
        zIndex,
      }}
    >
      <div
        className="snip-card"
        style={
          {
            '--acc': s.color,
            width: 170,
            background: 'rgba(18,18,26,.96)',
            backdropFilter: 'blur(12px)',
            border: `1px solid rgba(255,255,255,${(0.06 + crossIntensity * 0.12).toFixed(3)})`,
            borderRadius: 8,
            overflow: 'hidden',
            cursor: 'default',
            position: 'relative',
            transition: 'transform .25s ease,border-color .25s ease',
            boxShadow: glow,
          } as React.CSSProperties
        }
      >
        <div
          className="snip-card-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            fontSize: 9,
            fontWeight: 500,
            color: '#5a5e6e',
            background: 'rgba(255,255,255,.02)',
            borderBottom: '1px solid rgba(255,255,255,.04)',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
          {s.label}
        </div>
        <pre
          style={{
            margin: 0,
            padding: '8px 10px',
            fontSize: 9.5,
            lineHeight: 1.55,
            color: '#c9cdd6',
            whiteSpace: 'pre',
            overflow: 'hidden',
          }}
        >
          <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(s.code, s.lang) }} />
        </pre>
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 30,
            borderRadius: '50%',
            background: s.color,
            opacity: 0.08,
            filter: 'blur(16px)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

export function CodeOrbit() {
  const [positions, setPositions] = useState(() => SNIPPETS.map((_, i) => getPos(i, SNIPPETS.length, 0)));
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const loop = useCallback((ts: number) => {
    if (lastRef.current === null) lastRef.current = ts;
    const dt = ts - lastRef.current;
    lastRef.current = ts;
    timeRef.current += dt;
    setPositions(SNIPPETS.map((_, i) => getPos(i, SNIPPETS.length, timeRef.current)));
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

  const highlightedProcedure = useMemo(() => syntaxHighlight(PROCEDURE_CODE, 'ts'), []);

  const cards = useMemo(() => {
    return SNIPPETS.map((s, i) => ({ ...s, i, ...positions[i] }));
  }, [positions]);

  const particles = useMemo(() => {
    const colors = ['rgba(199,146,234,0.35)', 'rgba(49,120,198,0.35)', 'rgba(16,185,129,0.3)', 'rgba(255,203,107,0.3)'];
    return Array.from({ length: 14 }, (_, i) => ({
      left: `${15 + ((i * 37 + 13) % 70)}%`,
      top: `${15 + ((i * 53 + 7) % 70)}%`,
      dur: 3 + (i % 4),
      delay: (i * 0.6) % 4,
      color: colors[i % 4],
    }));
  }, []);

  return (
    <div
      ref={containerRef}
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
        fontFamily: "'JetBrains Mono', monospace",
        userSelect: 'none',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes floatP { 0%,100%{opacity:0;transform:translateY(0) scale(.5)} 50%{opacity:1;transform:translateY(-40px) scale(1)} }
        @keyframes pulseR { 0%{transform:translate(-50%,-50%) scale(1);opacity:.15} 100%{transform:translate(-50%,-50%) scale(1.15);opacity:0} }
        .snip-card:hover { border-color: var(--acc) !important; transform: scale(1.08) !important; }
        .snip-card-wrap { mix-blend-mode: multiply; }
        .code-orbit-ring { border-color: rgba(0,0,0,.08) !important; }
        .code-orbit-pulse { border-color: rgba(121,83,210,.15) !important; }
        .code-orbit-center { background: #ffffff !important; border-color: #e2e2e8 !important; box-shadow: 0 0 0 1px rgba(0,0,0,.04),0 8px 40px rgba(0,0,0,.08),0 0 120px -20px rgba(121,83,210,.08) !important; }
        .code-orbit-center-bar { background: rgba(0,0,0,.03) !important; border-bottom-color: #e2e2e8 !important; }
        .code-orbit-center-bar span { color: #8b8fa3 !important; }
        .code-orbit-center pre { color: #1e1e2e !important; }
        .snip-card { background: rgba(255,255,255,.95) !important; border-color: rgba(0,0,0,.08) !important; }
        .snip-card-bar { background: rgba(0,0,0,.02) !important; border-bottom-color: rgba(0,0,0,.06) !important; color: #8b8fa3 !important; }
        .snip-card pre { color: #1e1e2e !important; }
        .dark .snip-card-wrap { mix-blend-mode: screen; }
        .dark .code-orbit-ring { border-color: rgba(255,255,255,.035) !important; }
        .dark .code-orbit-pulse { border-color: rgba(121,83,210,.2) !important; }
        .dark .code-orbit-center { background: #12121a !important; border-color: #1e1e2e !important; box-shadow: 0 0 0 1px rgba(255,255,255,.03),0 8px 40px rgba(0,0,0,.5),0 0 120px -20px rgba(121,83,210,.12) !important; }
        .dark .code-orbit-center-bar { background: rgba(255,255,255,.02) !important; border-bottom-color: #1e1e2e !important; }
        .dark .code-orbit-center-bar span { color: #5a5e6e !important; }
        .dark .code-orbit-center pre { color: #c9cdd6 !important; }
        .dark .snip-card { background: rgba(18,18,26,.96) !important; border-color: rgba(255,255,255,.06) !important; }
        .dark .snip-card-bar { background: rgba(255,255,255,.02) !important; border-bottom-color: rgba(255,255,255,.04) !important; color: #5a5e6e !important; }
        .dark .snip-card pre { color: #c9cdd6 !important; }
      `}</style>

      {/* ambient bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%,rgba(121,83,210,.05) 0%,rgba(121,83,210,.02) 30%,transparent 60%),radial-gradient(ellipse 80% 80% at 35% 40%,rgba(49,120,198,.03) 0%,transparent 50%),radial-gradient(ellipse 80% 80% at 65% 60%,rgba(16,185,129,.025) 0%,transparent 50%)',
        }}
      />

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
          border: '1px solid rgba(255,255,255,.035)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* pulse ring */}
      <div
        className="code-orbit-pulse"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 414,
          height: 280,
          border: '1px solid rgba(121,83,210,.2)',
          borderRadius: 10,
          animation: 'pulseR 3s ease-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* central block */}
      <div
        className="code-orbit-center"
        style={{
          position: 'relative',
          zIndex: 100,
          width: 410,
          background: '#12121a',
          border: '1px solid #1e1e2e',
          borderRadius: 10,
          boxShadow: '0 0 0 1px rgba(255,255,255,.03),0 8px 40px rgba(0,0,0,.5),0 0 120px -20px rgba(121,83,210,.12)',
          overflow: 'hidden',
          transition: 'transform .4s cubic-bezier(.23,1,.32,1),box-shadow .4s ease',
        }}
      >
        <div
          className="code-orbit-center-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 14px',
            background: 'rgba(255,255,255,.02)',
            borderBottom: '1px solid #1e1e2e',
          }}
        >
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ marginLeft: 8, fontSize: 11, color: '#5a5e6e', letterSpacing: 0.3 }}>UserController.ts</span>
        </div>
        <pre style={{ margin: 0, padding: 16, fontSize: 11, lineHeight: 1.5, color: '#c9cdd6', overflow: 'hidden' }}>
          <code dangerouslySetInnerHTML={{ __html: highlightedProcedure }} />
        </pre>
      </div>

      {/* orbiting snippets */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 101, isolation: 'isolate', pointerEvents: 'none' }}>
        {cards.map((s) => {
          const dn = (s.z + ORBIT_B) / (ORBIT_B * 2);
          const zIndex = Math.round(dn * 200);
          const scale = 0.65 + dn * 0.55;
          const opacity = dn ** 1.2;
          const blur = (1 - dn) * 0.35;
          const crossIntensity = Math.max(0, 1 - Math.abs(dn - 0.5) / CROSS_HALF);
          const crossScale = scale * (1 + crossIntensity * 0.04);
          return (
            <SnipCard
              key={s.label}
              s={s}
              mouse={mouse}
              scale={crossScale}
              opacity={opacity}
              blur={blur}
              zIndex={zIndex}
              crossIntensity={crossIntensity}
            />
          );
        })}
      </div>

      {/* particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: p.color,
            left: p.left,
            top: p.top,
            pointerEvents: 'none',
            animation: `floatP ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
