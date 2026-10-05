import { procedure, type VovkRequest } from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import { z } from 'zod';

// Type checks for a project without strictNullChecks: tsconfig.non-strict.json checks this file with strict off,
// the test app's tsconfig with strict on

class NonStrictController {
  static ping() {
    return { ok: true };
  }

  static hello(_req: VovkRequest) {
    return { hello: 'world' };
  }

  static search(req: VovkRequest<unknown, { q: string }>) {
    return req.vovk.query();
  }

  static save(req: VovkRequest<{ a: number }>) {
    return req.vovk.body();
  }

  static list = procedure().handle(async () => [1, 2]);

  static find = procedure({ query: z.object({ q: z.string() }) }).handle(async (req) => req.vovk.query());

  static update = procedure({ body: z.object({ name: z.string() }), params: z.object({ id: z.string() }) }).handle(
    async (req, { id }) => ({ id, ...(await req.vovk.body()) })
  );
}

export async function withoutStrictNullChecks() {
  const rpc = createRPC<typeof NonStrictController>({}, '', 'NonStrictRPC');

  await rpc.ping();
  await rpc.hello();
  await rpc.search({ query: { q: 'x' } });
  await rpc.save({ body: { a: 1 } });
  await rpc.list();
  await rpc.find({ query: { q: 'x' } });
  await rpc.update({ body: { name: 'Ann' }, params: { id: '1' } });
}
