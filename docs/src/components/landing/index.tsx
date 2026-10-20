import Link from 'next/link';
import type { ReactNode } from 'react';
import { Command } from './copy-button';
import { HeroDemo } from './hero-demo';
import { Runtimes } from './runtimes';
import './landing.css';

const SKILLS = 'npx skills add finom/vovk';

const Kw = ({ children }: { children: ReactNode }) => <span className="vk-kw">{children}</span>;

// links: [label, href, aria-label]
type Feature = { id: string; title: string; links: [string, string, string][]; text: ReactNode; code: ReactNode };

const FEATURES: Feature[] = [
  {
    id: 'tools',
    title: 'AI agents',
    links: [
      ['Guide', '/agent-ready', 'Agent-ready app guide'],
      ['Tools', '/tools', 'AI tools docs'],
    ],
    text: 'Each procedure becomes an MCP tool or an AI SDK tool, validated like any request. You choose which ones agents see.',
    code: (
      <>
        <div>
          const tools = <Kw>deriveTools</Kw>({'{'}
        </div>
        <div>{'  modules: { TaskRPC },'}</div>
        <div>{'});'}</div>
      </>
    ),
  },
  {
    id: 'clients',
    title: 'Typed clients',
    links: [
      ['TypeScript', '/typescript', 'TypeScript client docs'],
      ['Python', '/python', 'Python client docs'],
      ['Rust', '/rust', 'Rust client docs'],
    ],
    text: 'Generated from your procedures as TypeScript, Python and Rust packages, ready to publish.',
    code: (
      <>
        <div className="vk-snippet-lang">
          <span>ts</span>
          <span>
            TaskRPC.<Kw>createTask</Kw>({'{ body }'})
          </span>
        </div>
        <div className="vk-snippet-lang">
          <span>py</span>
          <span>
            TaskRPC.<Kw>create_task</Kw>(body=body)
          </span>
        </div>
        <div className="vk-snippet-lang">
          <span>rs</span>
          <span>
            task_rpc::<Kw>create_task</Kw>(body, (),
          </span>
        </div>
        <div className="vk-snippet-lang">
          <span />
          <span>(), None, None, false).await?</span>
        </div>
      </>
    ),
  },
  {
    id: 'docs',
    title: 'OpenAPI docs',
    links: [
      ['Docs', '/openapi', 'OpenAPI docs'],
      ['Example', 'https://hello-world.vovk.dev/openapi', 'Hello World OpenAPI example'],
    ],
    text: 'The OpenAPI spec and a docs page come from the same code, so they match what runs.',
    code: (
      <>
        <div>/api/tasks:</div>
        <div>
          {'  '}
          <Kw>post</Kw>:
        </div>
        <div>{'    description: Create a task'}</div>
        <div>{'    x-codeSamples: [ts, python, rust]'}</div>
      </>
    ),
  },
  {
    id: 'stream',
    title: 'Streaming',
    links: [['Docs', '/jsonlines', 'Streaming docs']],
    text: 'An async generator sends JSON Lines, and the client reads them with types.',
    code: (
      <>
        <div>
          .handle(async <Kw>function*</Kw> () {'{'}
        </div>
        <div>
          {'  '}
          <Kw>yield</Kw> {"{ token: 'Hello' };"}
        </div>
        <div>{'})'}</div>
        <div>
          <Kw>for await</Kw> (const item of stream)
        </div>
      </>
    ),
  },
  {
    id: 'tenants',
    title: 'Multitenancy',
    links: [['Docs', '/multitenant', 'Multitenancy docs']],
    text: 'multitenant() in the Next.js proxy sends each subdomain to its own pages and API segment.',
    code: (
      <>
        <div>admin.example.com</div>
        <div>
          {'  '}
          <Kw>→</Kw> admin segment
        </div>
        <div>customer.example.com</div>
        <div>
          {'  '}
          <Kw>→</Kw> customer segment
        </div>
      </>
    ),
  },
  {
    id: 'next',
    title: 'Plain Next.js',
    links: [['Docs', '/segment', 'Segment docs']],
    text: 'It runs in route handlers on Node.js, Bun or Deno, with no custom server, and deploys wherever Next.js does.',
    code: (
      <>
        <div className="vk-dim">{'// app/api/[[...vovk]]/route.ts'}</div>
        <div>{'export const { GET, POST } ='}</div>
        <div>
          {'  '}
          <Kw>initSegment</Kw>({'{ controllers }'});
        </div>
      </>
    ),
  },
];

const EXAMPLES = [
  {
    name: 'Hello World',
    text: 'A minimal app with every client generated.',
    docs: '/hello-world',
    source: 'https://github.com/finom/vovk/tree/main/examples/hello-world',
    open: 'https://hello-world.vovk.dev',
  },
  {
    name: 'Realtime Kanban',
    text: 'AI tools, MCP and streaming in a real app.',
    docs: '/realtime-ui',
    source: 'https://github.com/finom/vovk/tree/main/examples/realtime-kanban',
    open: 'https://kanban.vovk.dev',
  },
  {
    name: 'Multitenant',
    text: 'Subdomains routed to segments.',
    docs: '/multitenant',
    source: 'https://github.com/finom/vovk/tree/main/examples/multitenant',
    open: 'https://multitenant.vovk.dev',
  },
];

export function Landing() {
  return (
    <div className="vk-landing">
      <section className="vk-hero" aria-labelledby="vk-h-hero">
        <div className="vk-wrap">
          <div className="vk-hero-top">
            <h1 id="vk-h-hero">
              Make your Next.js app <span>agent-ready.</span>
            </h1>
            <div className="vk-hero-right">
              <p>Each endpoint becomes an MCP tool for AI agents, and a typed, documented API for everyone else.</p>
              <div className="vk-cmd-row">
                <Command text={SKILLS} variant="hero" />
                <div className="vk-cmd-hint">then ask your agent to build your API</div>
              </div>
              <div className="vk-buttons">
                <Link href="/agent-ready" className="vk-btn vk-btn-main">
                  Get started <span aria-hidden="true">→</span>
                </Link>
                <a href="https://github.com/finom/vovk" className="vk-btn">
                  GitHub
                </a>
              </div>
            </div>
          </div>
          <Runtimes />
          <HeroDemo />
        </div>
      </section>

      <section className="vk-section vk-features" aria-labelledby="vk-h-features">
        <div className="vk-wrap">
          <h2 id="vk-h-features" className="vk-h2">
            One endpoint, every caller
          </h2>
          <div className="vk-cards">
            {FEATURES.map((f) => (
              <article key={f.id} className="vk-feature" aria-labelledby={`vk-c-${f.id}`}>
                <div className="vk-feature-text">
                  <div className="vk-feature-head">
                    <h3 id={`vk-c-${f.id}`}>{f.title}</h3>
                    <span className="vk-feature-links">
                      {f.links.map(([label, href, aria], i) => (
                        <span key={href} style={{ display: 'contents' }}>
                          {i > 0 && <span aria-hidden="true">·</span>}
                          <a href={href} aria-label={aria}>
                            {label}
                          </a>
                        </span>
                      ))}
                    </span>
                  </div>
                  <p>{f.text}</p>
                </div>
                <div className="vk-snippet">{f.code}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vk-agent" aria-labelledby="vk-h-agent">
        <div className="vk-wrap">
          <div className="vk-agent-text">
            <h2 id="vk-h-agent">Build it with your agent</h2>
            <p>
              Add the Vovk.ts skills to Claude Code, Cursor, Windsurf, GitHub Copilot or Cline, then ask for the API you
              need.
            </p>
          </div>
          <div className="vk-agent-cmds">
            <Command text={SKILLS} variant="large" />
            <div className="vk-init">
              <span>or start a new project:</span>
              <Command text="npx vovk-cli@latest init" variant="plain" />
            </div>
          </div>
        </div>
      </section>

      <section className="vk-section vk-examples" aria-labelledby="vk-h-examples">
        <div className="vk-wrap">
          <h2 id="vk-h-examples" className="vk-h2">
            Examples
          </h2>
          <ul>
            {EXAMPLES.map((e) => (
              <li key={e.name}>
                <span>{e.name}</span>
                <span>{e.text}</span>
                <span>
                  <a href={e.docs} aria-label={`${e.name} docs`}>
                    Docs
                  </a>
                  <a href={e.source} aria-label={`${e.name} source on GitHub`}>
                    Source
                  </a>
                  <a href={e.open} aria-label={`Open ${e.name}`}>
                    Open
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
