'use client';
import { type CSSProperties, Fragment, useCallback, useEffect, useRef, useState } from 'react';

// The editable createTask procedure and what it becomes. Every row is derived from the fields on the left.

type Key = 'a' | 'b' | 'c' | 'd' | 'e';
type Shape = { zf: string; ts: string; py: string; rs: string; oa: string; tool: string; ex: string };

const KEYS: Key[] = ['a', 'b', 'c', 'd', 'e'];
const DEFAULT_NAMES: Record<Key, string> = { a: 'title', b: 'done', c: 'priority', d: 'dueDate', e: 'estimate' };
const DEFAULT_ON: Record<Key, boolean> = { a: true, b: true, c: false, d: false, e: false };
const DEFAULT_DESC = 'Create a task';
const TYPES: Record<Key, Shape> = {
  a: { zf: 'z.string()', ts: 'string', py: 'str', rs: 'String', oa: 'string', tool: 'string', ex: '"Ship it"' },
  b: { zf: 'z.boolean()', ts: 'boolean', py: 'bool', rs: 'bool', oa: 'boolean', tool: 'boolean', ex: 'false' },
  // The Rust enum takes the field's name, so its type is filled in per name.
  c: {
    zf: "z.enum(['low', 'high'])",
    ts: "'low' | 'high'",
    py: 'Literal["low", "high"]',
    rs: '',
    oa: 'enum [low, high]',
    tool: 'low | high',
    ex: '"high"',
  },
  d: {
    zf: 'z.iso.date()',
    ts: 'string',
    py: 'str',
    rs: 'String',
    oa: 'string (date)',
    tool: 'string (date)',
    ex: '"2026-11-02"',
  },
  e: { zf: 'z.int()', ts: 'number', py: 'int', rs: 'i64', oa: 'integer', tool: 'integer', ex: '3' },
};
const HUES = [22, 31, 39, 48, 56, 65, 73, 82];
// The prism's triangle, (58,3) (113,98) (3,98) in its 116×100 box. The beam enters the left face at ENTRY, splits
// inside, and each color leaves the right face at its own point, close together.
const ENTRY = [25, 60] as const;
const EXITS = [0.36, 0.41, 0.46, 0.51, 0.56, 0.61, 0.66, 0.71].map((t) => [58 + 55 * t, 3 + 95 * t] as const);
const PRISM_W = 116;
const PRISM_H = 100;
const REGISTRY: Record<string, string> = {
  npm: 'https://www.npmjs.com/package/vovk-hello-world',
  PyPI: 'https://pypi.org/project/vovk-hello-world/',
  'crates.io': 'https://crates.io/crates/vovk-hello-world',
};

const color = (i: number, alpha?: number) => `oklch(0.66 0.17 ${HUES[i]}${alpha ? ` / ${alpha}` : ''})`;

// Rounded so the server and the browser print the same style.
const r2 = (n: number) => Math.round(n * 100) / 100;

// A line from one point to another as an absolutely placed, rotated box.
const segment = (x1: number, y1: number, x2: number, y2: number): CSSProperties => ({
  left: r2(x1),
  top: r2(y1),
  width: r2(Math.hypot(x2 - x1, y2 - y1)),
  transform: `rotate(${r2((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI)}deg)`,
});

type Tone = 'kw' | 'dim' | undefined;
type Token = { t: string; tone?: Tone };
// `sep` goes before the chunk: a space may break, a zero-width space may break, a no-break space may not.
type Chunk = { sep: string; toks: Token[]; lit: boolean };
type Line = { ind: number; chunks: Chunk[] };
type Row = { name: string; reg: string; lines: Line[] };

const ZW = '​';
const NB = ' ';

function buildRows(keys: Key[], nameOf: (k: Key) => string, desc: string, isLit: (k: Key | 'desc') => boolean) {
  const T = (t: string, tone?: Tone): Token => ({ t, tone });
  const C = (toks: Token[], sep = '', lit = false): Chunk => ({ sep, toks, lit });
  const L = (chunks: Chunk[], ind = 0): Line => ({ ind, chunks });
  const fields = (fmt: (k: Key, s: Shape) => string, joint: string, first: string, sep = ' ') =>
    keys.map((k, i) => C([T(fmt(k, TYPES[k]) + (i < keys.length - 1 ? joint : ''))], i ? sep : first, isLit(k)));
  const rs = (k: Key) => (k === 'c' ? `body_::${nameOf(k)}` : TYPES[k].rs);
  const d = isLit('desc');
  const rows: Row[] = [
    {
      name: 'Endpoint',
      reg: '',
      lines: [
        L([
          C([T('curl', 'kw'), T(" -X POST /api/tasks -d '{")]),
          ...fields((k, s) => `"${nameOf(k)}":${s.ex}`, ',', '', ZW),
          C([T("}'")]),
        ]),
      ],
    },
    {
      name: 'AI tool',
      reg: '',
      lines: [
        L([
          C([T('{ name: '), T('"TaskRPC_createTask"', 'kw'), T(',')]),
          C([T(`description: "${desc}",`)], ' ', d),
          C([T('input: {')], ' '),
          ...fields((k, s) => `${nameOf(k)}: ${s.tool}`, ',', NB),
          C([T(`${NB}} }`)]),
        ]),
      ],
    },
    {
      name: 'RPC library',
      reg: 'npm',
      lines: [
        L([
          C([T('TaskRPC.'), T('createTask', 'kw'), T('({ body: {')]),
          ...fields((k, s) => `${nameOf(k)}: ${s.ts}`, ';', NB),
          C([T(`${NB}} })`)]),
        ]),
      ],
    },
    {
      name: 'Server actions',
      reg: '',
      lines: [
        L([
          C([T('TaskController.'), T('createTask', 'kw'), T('.fn({ body: {')]),
          ...fields((k, s) => `${nameOf(k)}: ${s.ts}`, ';', NB),
          C([T(`${NB}} })`)]),
        ]),
      ],
    },
    {
      name: 'Python client',
      reg: 'PyPI',
      lines: [
        L([C([T('class', 'dim'), T(' CreateTaskBody(TypedDict):')])]),
        L(
          fields((k, s) => `${nameOf(k)}: ${s.py}`, ';', ''),
          4
        ),
      ],
    },
    {
      name: 'Rust client',
      reg: 'crates.io',
      lines: [
        L([
          C([T('struct', 'dim'), T(' body {')]),
          ...fields((k) => `${nameOf(k)}: ${rs(k)}`, ',', NB),
          C([T(`${NB}}`)]),
        ]),
      ],
    },
    {
      name: 'OpenAPI 3.1',
      reg: '',
      lines: [
        L([C([T('description:', 'dim')]), C([T(desc)], NB, d)]),
        L([
          C([T('requestBody:', 'dim'), T(' {')]),
          ...fields((k, s) => `${nameOf(k)}: ${s.oa}`, ',', NB),
          C([T(`${NB}}`)]),
        ]),
      ],
    },
    {
      name: 'README',
      reg: '',
      lines: [
        L([C([T('### ', 'dim'), T('TaskRPC.'), T('createTask', 'kw')])]),
        L([C([T('> ', 'dim')]), C([T(desc)], '', d)]),
        L([C([T('POST', 'dim'), T(' /api/tasks')])]),
      ],
    },
  ];
  return rows;
}

// The longest text the demo shows by default, laid under each row so the row keeps its height.
const LONGEST = buildRows(
  KEYS,
  (k) => DEFAULT_NAMES[k],
  DEFAULT_DESC.padEnd(16, 'x'),
  () => false
);

const Code = ({ lines }: { lines: Line[] }) =>
  lines.map((line, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
    <div key={i} style={{ paddingLeft: `${line.ind}ch` }}>
      {line.chunks.map((chunk, j) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: chunks are positional
        <Fragment key={j}>
          {chunk.sep}
          <span className={chunk.lit ? 'vk-chunk vk-chunk-lit' : 'vk-chunk'}>
            {chunk.toks.map((tok, k) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
              <span key={k} className={tok.tone ? `vk-${tok.tone}` : undefined}>
                {tok.t}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </div>
  ));

type Phase = 'idle' | 'reset' | 'go';
type Geometry = { rays: number[][]; beam: number[] } | null;

export function HeroDemo() {
  const [desc, setDesc] = useState(DEFAULT_DESC);
  const [on, setOn] = useState(DEFAULT_ON);
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [lit, setLit] = useState<Key | 'desc' | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [live, setLive] = useState('');
  const [reduced, setReduced] = useState(false);
  const [geo, setGeo] = useState<Geometry>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prismRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const timers = useRef<{ lit?: number; phase?: number; start?: number; raf?: number }>({});
  const reducedRef = useRef(false);

  // Highlight what changed and send a pulse from the prism to every row.
  const fire = useCallback((key: Key | 'desc' | null, message?: string) => {
    const t = timers.current;
    clearTimeout(t.lit);
    clearTimeout(t.phase);
    setLit(key);
    setPhase('reset');
    if (message) setLive(message);
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase('go')));
    t.phase = window.setTimeout(() => setPhase('idle'), 1900);
    if (!reducedRef.current) t.lit = window.setTimeout(() => setLit(null), 2300);
  }, []);

  const setSlot = useCallback(
    (k: Key, value: boolean, message?: string) => {
      setOn((prev) => ({ ...prev, [k]: value }));
      fire(value ? k : null, message);
    },
    [fire]
  );

  // The stage's rays are measured from the rendered boxes, so they follow any layout.
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const prism = prismRef.current;
    const card = cardRef.current;
    if (!stage || !prism || !card) return;
    const S = stage.getBoundingClientRect();
    if (S.width < 1160) {
      setGeo((g) => (g === null ? g : null));
      return;
    }
    const P = prism.getBoundingClientRect();
    const C = card.getBoundingClientRect();
    const x = (v: number) => P.left - S.left + (v * P.width) / PRISM_W;
    const y = (v: number) => P.top - S.top + (v * P.height) / PRISM_H;
    const rays = EXITS.flatMap(([ex, ey], i) => {
      const row = rowRefs.current[i]?.getBoundingClientRect();
      if (!row) return [];
      return [[x(ex), y(ey), row.left - S.left, row.top - S.top + row.height / 2]];
    });
    const next = { rays, beam: [C.right - S.left, y(ENTRY[1]), x(ENTRY[0]), y(ENTRY[1])] };
    const round = (g: Geometry) => JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v) : v));
    setGeo((g) => (round(g) === round(next) ? g : next));
  }, []);

  useEffect(() => {
    const t = timers.current;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMedia = () => {
      reducedRef.current = media.matches;
      setReduced(media.matches);
    };
    onMedia();
    media.addEventListener('change', onMedia);
    // The demo adds a field once by itself; with reduced motion the field is simply there.
    if (media.matches) setOn((prev) => ({ ...prev, c: true }));
    else t.start = window.setTimeout(() => setSlot('c', true), 900);

    const schedule = () => {
      cancelAnimationFrame(t.raf ?? 0);
      t.raf = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    if (stageRef.current) observer.observe(stageRef.current);
    document.fonts?.ready.then(schedule);
    return () => {
      media.removeEventListener('change', onMedia);
      observer.disconnect();
      cancelAnimationFrame(t.raf ?? 0);
      clearTimeout(t.start);
      clearTimeout(t.lit);
      clearTimeout(t.phase);
    };
  }, [measure, setSlot]);

  // Rows change height only past the longest default text; measure after every edit anyway.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the text changes
  useEffect(() => {
    const t = timers.current;
    cancelAnimationFrame(t.raf ?? 0);
    t.raf = requestAnimationFrame(measure);
  }, [measure, on, names, desc]);

  const nameOf = (k: Key) => names[k] || 'field';
  const shownKeys = KEYS.filter((k) => on[k]);
  const rows = buildRows(shownKeys, nameOf, desc || 'description', (k) => lit === k);
  const go = phase === 'go';

  return (
    <div className={go ? 'vk-demo vk-go' : 'vk-demo'}>
      <span className="vk-sr" aria-live="polite">
        {live}
      </span>
      <p className="vk-sr">
        Demo: the createTask procedure. Each field you add or rename, and the description, appears at once in the
        endpoint, the AI tool's input, the TypeScript RPC library and server actions, the Python and Rust types, the
        OpenAPI request body and the README.
      </p>
      <p className="vk-demo-lead">
        <strong>Universal procedures:</strong> one definition is an endpoint, a server call, an AI tool and a typed
        client.
      </p>
      <p className="vk-demo-try">Try it: rename a field, add one or edit the description. Everything else follows.</p>

      <div className="vk-stage-box">
        <div ref={stageRef} className="vk-stage">
          {geo && (
            <div className="vk-rays" aria-hidden="true">
              <div className="vk-line vk-beam" style={segment(geo.beam[0], geo.beam[1], geo.beam[2], geo.beam[3])} />
              {geo.rays.map((r, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: one ray per row
                  key={i}
                  className="vk-line vk-ray"
                  style={{
                    ...segment(r[0], r[1], r[2], r[3]),
                    background: `linear-gradient(90deg, ${color(i)}, ${color(i, 0.2)})`,
                    boxShadow: `0 0 10px ${color(i, 0.45)}`,
                  }}
                >
                  <div
                    style={{
                      left: phase === 'reset' ? '0%' : '100%',
                      opacity: reduced || phase === 'idle' ? 0 : 1,
                      background: color(i),
                      boxShadow: `0 0 16px 5px ${color(i, 0.45)}`,
                      transition: go
                        ? `left 950ms cubic-bezier(.4,0,.2,1) ${i * 70}ms`
                        : phase === 'idle'
                          ? 'opacity 500ms ease'
                          : 'none',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div ref={cardRef} className="vk-card">
            <div className="vk-card-head">
              <span>src/modules/tasks/TaskController.ts</span>
              <button
                type="button"
                onClick={() => {
                  setDesc(DEFAULT_DESC);
                  setOn(DEFAULT_ON);
                  setNames(DEFAULT_NAMES);
                  fire(null, 'Reset to title and done.');
                }}
              >
                Reset
              </button>
            </div>
            <div className="vk-card-code">
              <div>
                <div className={lit === 'desc' ? 'vk-cl vk-cl-desc vk-lit' : 'vk-cl vk-cl-desc'}>
                  <span className="vk-kw">@operation</span>
                  <span>{"({ description: '"}</span>
                  <input
                    aria-label="Procedure description"
                    value={desc}
                    onChange={(e) => {
                      setDesc(e.target.value.replace(/['"`\\]/g, '').slice(0, 24));
                      fire('desc');
                    }}
                    spellCheck={false}
                    autoComplete="off"
                    maxLength={24}
                    style={{ width: `${Math.max(4, desc.length)}ch` }}
                  />
                  <span>{"' })"}</span>
                </div>
                <div className="vk-cl">
                  <span className="vk-kw">@post</span>()
                </div>
                <div className="vk-cl">
                  <span className="vk-dim">static</span> createTask = procedure({'{'}
                </div>
                <div className="vk-cl">{'  body: z.object({'}</div>
                {KEYS.map((k) => {
                  const shown = on[k];
                  const name = names[k];
                  return (
                    <div key={k} className={lit === k ? 'vk-cl vk-cl-field vk-lit' : 'vk-cl vk-cl-field'}>
                      <div className={shown ? 'vk-slot-on' : 'vk-slot-on vk-slot-off'}>
                        <input
                          aria-label={`Field name, currently ${nameOf(k)}`}
                          value={name}
                          onChange={(e) => {
                            setNames((prev) => ({ ...prev, [k]: e.target.value.replace(/\W/g, '').slice(0, 10) }));
                            fire(k);
                          }}
                          spellCheck={false}
                          autoComplete="off"
                          maxLength={10}
                          tabIndex={shown ? undefined : -1}
                          style={{ width: `${Math.max(2, name.length)}ch` }}
                        />
                        <span>: {TYPES[k].zf},</span>
                        {k > 'b' && (
                          <button
                            type="button"
                            aria-label={`Remove field ${nameOf(k)}`}
                            tabIndex={shown ? undefined : -1}
                            onClick={() => setSlot(k, false, `Removed ${nameOf(k)}. All outputs updated.`)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        className={shown ? 'vk-slot-add vk-slot-off' : 'vk-slot-add'}
                        aria-label={`Add field ${nameOf(k)}`}
                        tabIndex={shown ? -1 : undefined}
                        onClick={() => setSlot(k, true, `Added ${nameOf(k)}. All outputs updated.`)}
                      >
                        <span className="vk-kw">+ </span>
                        {name}: {TYPES[k].zf}
                      </button>
                    </div>
                  );
                })}
                <div className="vk-cl">{'  }),'}</div>
                <div className="vk-cl">
                  {'}).handle('}
                  <span className="vk-dim">async</span>
                  {' (req) =>'}
                </div>
                <div className="vk-cl">{'  TaskService.createTask('}</div>
                <div className="vk-cl">
                  {'    '}
                  <span className="vk-dim">await</span>
                  {' req.vovk.body()));'}
                </div>
              </div>
            </div>
          </div>

          <div className="vk-prism-col">
            <div className="vk-prism-glow" aria-hidden="true" />
            <div className="vk-prism-stack">
              <div className="vk-prism-bar vk-narrow-only" aria-hidden="true" />
              <div ref={prismRef} className="vk-prism" aria-hidden="true">
                <svg viewBox="0 0 116 100" width={PRISM_W} height={PRISM_H}>
                  <title>Prism</title>
                  <defs>
                    <linearGradient id="vk-glass" x1="0.3" y1="0" x2="0.7" y2="1">
                      <stop offset="0.15" stopColor="var(--vk-prism-glass)" stopOpacity="0.6" />
                      <stop offset="0.95" stopColor="var(--vk-sunk)" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="58,3 113,98 3,98"
                    fill="url(#vk-glass)"
                    stroke="var(--vk-prism-edge)"
                    style={{ strokeWidth: 'var(--vk-prism-stroke)' }}
                    strokeLinejoin="miter"
                  />
                </svg>
                {EXITS.map(([ex, ey], i) => (
                  <div
                    key={ex}
                    className="vk-line vk-fan"
                    style={{
                      ...segment(ENTRY[0], ENTRY[1], ex, ey),
                      backgroundColor: color(i),
                    }}
                  />
                ))}
              </div>
              <div className="vk-spectrum vk-narrow-only" aria-hidden="true">
                {HUES.map((h, i) => (
                  <div key={h} style={{ backgroundColor: color(i), boxShadow: `0 0 10px ${color(i)}` }} />
                ))}
              </div>
              <div className="vk-prism-label">
                <span>vovk dev</span>
                <span>on every save</span>
              </div>
            </div>
          </div>

          <ul className="vk-rows" aria-label="What the procedure becomes">
            {rows.map((row, i) => (
              <li
                key={row.name}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className="vk-row"
                style={{
                  borderColor: go ? color(i) : undefined,
                  boxShadow: `inset 3px 0 0 ${color(i)}`,
                  transitionDelay: go && !reduced ? `${i * 70 + 760}ms` : '0ms',
                }}
              >
                <div className="vk-row-name">
                  <span>{row.name}</span>
                  {row.reg && (
                    <a className="vk-reg" href={REGISTRY[row.reg]} aria-label={`Hello World client on ${row.reg}`}>
                      {row.reg}
                    </a>
                  )}
                </div>
                <div className="vk-row-code">
                  <div aria-hidden="true">
                    <Code lines={LONGEST[i].lines} />
                  </div>
                  <div>
                    <Code lines={row.lines} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
