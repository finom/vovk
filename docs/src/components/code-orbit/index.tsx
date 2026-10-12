import { compileMdx } from 'nextra/compile';
import { MDXRemote } from 'nextra/mdx-remote';
import { Orbit } from './orbit';

type Snippet = { title: string; lang: string; code: string };

const PROCEDURE: Snippet = {
  title: 'UserController.ts',
  lang: 'ts',
  code: `import { post, prefix, procedure, operation } from "vovk";
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
}`,
};

const SNIPPETS: Snippet[] = [
  {
    title: 'MCP Server',
    lang: 'ts',
    code: `server.registerTool(name,\n  { title, inputSchema },\n  execute);`,
  },
  {
    title: '__init__.py',
    lang: 'python',
    code: `def update_user(\n  body: UpdateUserBody,\n) -> UpdateUserOutput:`,
  },
  {
    title: 'page.tsx',
    lang: 'tsx',
    code: `// SSR: no HTTP round-trip\nconst res = await\n  UserController.updateUser\n  .fn({ body, params });`,
  },
  {
    title: 'Cargo.toml',
    lang: 'toml',
    code: `[package]\nname = "vovk_hello_world"\nedition = "2021"`,
  },
  {
    title: 'README (TS)',
    lang: 'md',
    code: `## UserRPC.updateUser\n> Update user by ID\nawait UserRPC.updateUser({\n  body, query, params });`,
  },
  {
    title: 'openapi.json',
    lang: 'json',
    code: `"/api/users/{id}": {\n  "post": {\n    "summary": "Update user" }}`,
  },
  {
    title: 'lib.rs',
    lang: 'rust',
    code: `pub async fn update_user(\n  body: update_user_::body,\n) -> Result<output>`,
  },
  {
    title: 'client.ts',
    lang: 'ts',
    code: `// RPC call over HTTP\nconst res = await\n  UserRPC.updateUser(\n  { body, query, params });`,
  },
  {
    title: 'pyproject.toml',
    lang: 'toml',
    code: `[project]\nname = "vovk_hello_world"\ndependencies = ["requests"]`,
  },
  {
    title: 'AI Tools',
    lang: 'ts',
    code: `const tools =\n  deriveTools({\n    modules:\n      { UserRPC } });`,
  },
  {
    title: 'README (RS)',
    lang: 'md',
    code: `## user_rpc::update_user\n> Update user by ID\nuser_rpc::update_user(\n  body, query, params)`,
  },
  {
    title: 'package.json',
    lang: 'json',
    code: `"name": "vovk-hello-world",\n"main": "./index.js",\n"types": "./index.d.ts"`,
  },
  {
    title: 'UserService.ts',
    lang: 'ts',
    code: `body: VovkBody<\n  typeof UserController\n  .updateUser>`,
  },
  {
    title: 'README (PY)',
    lang: 'md',
    code: `## UserRPC.update_user\n> Update user by ID\nUserRPC.update_user(\n  body=body, params=params)`,
  },
];

// Rendered by Nextra's own Markdown pipeline, so each block is a docs code block: same highlighting, frame and font.
async function codeBlock({ title, lang, code }: Snippet) {
  const source = await compileMdx(`\`\`\`${lang} filename="${title}"\n${code}\n\`\`\``, {
    defaultShowCopyCode: true,
  });
  return <MDXRemote compiledSource={source} components={{ wrapper: ({ children }) => children }} />;
}

export async function CodeOrbit() {
  const cards = await Promise.all(SNIPPETS.map(async (s) => ({ key: s.title, block: await codeBlock(s) })));
  return <Orbit center={await codeBlock(PROCEDURE)} cards={cards} />;
}
