import type { MetaRecord } from 'nextra';

const separator = (title: string) => ({ type: 'separator', title });

const meta: MetaRecord = {
  openapi: {
    title: 'OpenAPI',
    type: 'page',
  },
  documentation: {
    title: 'vovk.dev',
    type: 'page',
    href: 'https://vovk.dev/',
  },
  index: 'Home',
  '#common': separator('Common'),
  basic: 'Basic Controller',
  'basic-with-service': 'Basic Controller with a Service',
  proxy: 'Proxy Endpoint',
  'static-params': 'Static Params',
  'react-query': 'React Query',
  form: 'Form with Files',
  'server-actions': 'Server Actions with .fn()',
  '#validation': separator('Validation'),
  zod: 'Zod',
  valibot: 'Valibot',
  arktype: 'Arktype',
  'zod-hook-form': { title: 'Zod with React Hook Form', display: 'hidden' }, // TODO https://github.com/react-hook-form/resolvers/issues/791
  '#streaming': separator('JSONLines and AI'),
  jsonlines: 'JSONLines with "yield" Syntax',
  'jsonlines-responder': 'JSONLinesResponder Object',
  polling: 'Polling',
  events: 'Events',
  progressive: 'Progressive Response',
  openai: 'OpenAI Chat',
  'ai-sdk': 'AI SDK Chat',
};

export default meta;
