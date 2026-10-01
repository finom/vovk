import type { MetaRecord } from 'nextra';

const separator = (title: string) => ({ type: 'separator', title });

const meta: MetaRecord = {
  'realtime-ui-link': {
    title: '🤖 Realtime Kanban',
    href: '/realtime-ui',
    type: 'page',
  },
  blog: {
    title: 'Blog',
    href: '/blog',
    type: 'page',
  },
  '#introduction': separator('Getting Started'),
  index: 'About Vovk.ts',
  'quick-install': 'Quick Start',
  'manual-install': 'Manual Install',
  claude: (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden className="text-[#cc785c] text-2xl leading-none translate-y-[4px]">
        *
      </span>
      Claude Plugin
    </span>
  ),
  '#segment': separator('Segment'),
  segment: 'Segment Overview',
  'static-segment': 'Static Segment',

  '#procedure': separator('Controller & Procedure'),
  procedure: 'Controller & Procedure',
  service: 'Service',
  'req-vovk': 'Enhanced Request Object',
  fn: 'Local Procedure Call (LPC)',
  response: 'Response & Errors',
  'content-type': 'Content Type',
  jsonlines: 'JSON Lines',
  progressive: 'Progressive Response',
  inference: 'Type Inference',
  openapi: 'OpenAPI Specification',

  '#tools': separator('🤖 AI Tools'),
  tools: 'Deriving AI Tools from Procedures',
  'tools-mcp': 'MCP Formatting',

  '#decorators': separator('Decorators'),
  'decorator-overview': 'Decorators Overview',
  decorator: 'Custom Decorators',
  'decorator-examples': 'Decorator Examples',

  '#codegen': separator('TypeScript RPC Codegen'),
  typescript: 'TypeScript Client',
  imports: 'Customizing the Client',
  composed: 'Composed Mode',
  segmented: 'Segmented Mode',
  '#advanced-codegen': separator('Codegen Extras'),
  schema: 'Schema',
  mixins: 'OpenAPI Mixins',
  python: 'Python Client 🧪',
  rust: 'Rust Client 🧪',
  templates: 'Codegen Templates Reference',

  '#cli': separator('CLI & Configuration'),
  config: 'Config File',
  dev: <code className="nextra-code">vovk dev</code>,
  bundle: <code className="nextra-code">vovk bundle</code>,
  generate: <code className="nextra-code">vovk generate</code>,
  init: <code className="nextra-code">vovk init</code>,
  new: <code className="nextra-code">vovk new</code>,
  '#examples': separator('Examples'),
  github_link: {
    title: 'Random Examples',
    href: 'https://examples.vovk.dev',
  },
  'hello-world': '"Hello World!"',
  multitenant: 'Multitenancy Tutorial',
  'realtime-ui': {
    title: '🤖 Realtime Kanban',
    theme: {
      collapsed: true,
      copyPage: true,
    },
  },
  '#etc': separator('Deep Dive'),
  testing: 'Testing',
  performance: 'Route Performance Overhead',
  packages: 'Packages',
  'api-ref': 'API Reference',
};

export default meta;
