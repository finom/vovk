/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: Ignore */
'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const SNIPPETS = [
  {
    label: 'MCP Server',
    lang: 'ts',
    code: `server.registerTool(name,\n  { title, inputSchema },\n  execute);`,
  },
  {
    label: '__init__.py',
    lang: 'python',
    code: `def update_user(\n  body: UpdateUserBody,\n) -> UpdateUserOutput:`,
  },
  {
    label: 'page.tsx',
    lang: 'ts',
    code: `// SSR: no HTTP round-trip\nconst res = await\n  UserController.updateUser\n  .fn({ body, params });`,
  },
  {
    label: 'Cargo.toml',
    lang: 'toml',
    code: `[package]\nname = "vovk_hello_world"\nedition = "2021"`,
  },
  {
    label: 'README (TS)',
    lang: 'ts',
    code: `## UserRPC.updateUser\n> Update user by ID\nawait UserRPC.updateUser({\n  body, query, params });`,
  },
  {
    label: 'openapi.json',
    lang: 'json',
    code: `"/api/users/{id}": {\n  "post": {\n    "summary": "Update user" }}`,
  },
  {
    label: 'lib.rs',
    lang: 'rust',
    code: `pub async fn update_user(\n  body: update_user_::body,\n) -> Result<output>`,
  },
  {
    label: 'client.ts',
    lang: 'ts',
    code: `// RPC call over HTTP\nconst res = await\n  UserRPC.updateUser(\n  { body, query, params });`,
  },
  {
    label: 'pyproject.toml',
    lang: 'toml',
    code: `[project]\nname = "vovk_hello_world"\ndependencies = ["requests"]`,
  },
  {
    label: 'AI Tools',
    lang: 'ts',
    code: `const tools =\n  deriveTools({\n    modules:\n      { UserRPC } });`,
  },
  {
    label: 'README (RS)',
    lang: 'rust',
    code: `## user_rpc::update_user\n> Update user by ID\nuser_rpc::update_user(\n  body, query, params)`,
  },
  {
    label: 'package.json',
    lang: 'json',
    code: `"name": "vovk-hello-world",\n"main": "./index.js",\n"types": "./index.d.ts"`,
  },
  {
    label: 'UserService.ts',
    lang: 'ts',
    code: `body: VovkBody<\n  typeof UserController\n  .updateUser>`,
  },
  {
    label: 'README (PY)',
    lang: 'python',
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
  e = e.replace(/"([^"]*)"/g, '<span data-c="str">"$1"</span>');
  e = e.replace(/'([^']*)'/g, '<span data-c="str">\'$1\'</span>');
  e = e.replace(/`([^`]*)`/g, '<span data-c="str">`$1`</span>');
  kws.forEach((kw) => {
    e = e.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span data-c="kw">$1</span>');
  });
  e = e.replace(/@(\w+)/g, '<span data-c="kw">@$1</span>');
  e = e.replace(/\b(procedure|handle|createRPC|deriveTools|registerTool)\b/g, '<span data-c="fn">$1</span>');
  e = e.replace(
    /\b(User|UserRPC|StreamRPC|UserController|UserService|VovkRequest|VovkBody|VovkParams|VovkQuery|VovkOutput|UpdateUserBody|UpdateUserOutput|UserSchema|Body|Query|Params|Output)\b/g,
    '<span data-c="type">$1</span>'
  );
  e = e.replace(/##\s(.+)/g, '<span data-c="fn">## $1</span>');
  e = e.replace(/^(&gt;\s.+)$/gm, '<span data-c="comment">$1</span>');
  e = e.replace(/\[([^\]]+)\]/g, '<span data-c="mark">[$1]</span>');
  e = e.replace(/^(\/\/.*)$/gm, '<span data-c="comment">$1</span>');
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
}: {
  s: { label: string; lang: string; code: string; x: number; y: number };
  mouse: { x: number; y: number };
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
}) {
  const filter = blur > 0.1 ? `blur(${blur}px)` : 'none';

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
        style={{
          width: 170,
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: 6,
          overflow: 'hidden',
          cursor: 'default',
          position: 'relative',
          transition: 'transform .25s ease,border-color .25s ease',
        }}
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
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          <span className="snip-card-dot" style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0 }} />
          {s.label}
        </div>
        <pre
          style={{
            margin: 0,
            padding: '8px 10px',
            fontSize: 9.5,
            lineHeight: 1.55,
            whiteSpace: 'pre',
            overflow: 'hidden',
          }}
        >
          <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(s.code, s.lang) }} />
        </pre>
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
        fontFamily: 'var(--font-marks), ui-monospace, monospace',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes pulseR { 0%{transform:translate(-50%,-50%) scale(1);opacity:.35} 100%{transform:translate(-50%,-50%) scale(1.15);opacity:0} }
        .snip-card:hover { border-color: var(--vovk-logo-accent) !important; transform: scale(1.08) !important; }
        .snip-card-wrap { mix-blend-mode: multiply; }
        .code-orbit-ring { border-color: rgba(17,17,17,.08) !important; }
        .code-orbit-pulse { border-color: var(--vovk-logo-accent) !important; }
        .code-orbit-center { background: #fafafa !important; border-color: #e4e4e7 !important; box-shadow: 0 8px 32px rgba(17,17,17,.06) !important; }
        .code-orbit-center-bar { background: #f4f4f5 !important; border-bottom-color: #e4e4e7 !important; }
        .code-orbit-center-bar span { color: #5c5c60 !important; }
        .code-orbit-dot { background: #e4e4e7; }
        .code-orbit-center pre { color: #111111 !important; }
        .snip-card { background: rgba(250,250,250,.96); border-color: #e4e4e7; }
        .snip-card-bar { background: #f4f4f5; border-bottom-color: #e4e4e7; color: #5c5c60; }
        .snip-card-dot { background: #a1a1aa; }
        .snip-card pre { color: #111111; }
        .code-orbit [data-c=kw], .code-orbit [data-c=mark] { color: #c2320a; }
        .code-orbit [data-c=str] { color: #5c5c60; }
        .code-orbit [data-c=fn] { font-weight: 700; }
        .code-orbit [data-c=type] { font-style: italic; }
        .code-orbit [data-c=comment] { color: #8e8e95; font-style: italic; }
        .dark .snip-card-wrap { mix-blend-mode: screen; }
        .dark .code-orbit-ring { border-color: rgba(255,255,255,.06) !important; }
        .dark .code-orbit-center { background: #18181b !important; border-color: #27272a !important; box-shadow: 0 8px 32px rgba(0,0,0,.4) !important; }
        .dark .code-orbit-center-bar { background: #111111 !important; border-bottom-color: #27272a !important; }
        .dark .code-orbit-center-bar span { color: #8e8e95 !important; }
        .dark .code-orbit-dot { background: #3f3f46; }
        .dark .code-orbit-center pre { color: #ffffff !important; }
        .dark .snip-card { background: rgba(24,24,27,.96); border-color: #27272a; }
        .dark .snip-card-bar { background: #111111; border-bottom-color: #27272a; color: #8e8e95; }
        .dark .snip-card-dot { background: #52525b; }
        .dark .snip-card pre { color: #ffffff; }
        .dark .code-orbit [data-c=kw], .dark .code-orbit [data-c=mark] { color: #f6623d; }
        .dark .code-orbit [data-c=str] { color: #8e8e95; }
        .dark .code-orbit [data-c=comment] { color: #8e8e95; }
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

      {/* pulse ring */}
      <div
        className="code-orbit-pulse"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 414,
          height: 280,
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: 8,
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
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: 8,
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
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="code-orbit-dot" style={{ width: 8, height: 8, borderRadius: '50%' }} />
          ))}
          <span style={{ marginLeft: 8, fontSize: 11, letterSpacing: 0.3 }}>UserController.ts</span>
        </div>
        <pre style={{ margin: 0, padding: 16, fontSize: 11, lineHeight: 1.5, overflow: 'hidden' }}>
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
            />
          );
        })}
      </div>
    </div>
  );
}
