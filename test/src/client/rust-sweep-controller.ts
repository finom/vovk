import { get, post, prefix, procedure } from 'vovk';
import { z } from 'zod';

// zod >=4.4 is sideEffects: false, so Next.js tree-shakes the default locale init; load the English locale explicitly
z.config(z.locales.en());

// endpoints the generated Rust client is checked against
@prefix('rust')
export default class RustSweepController {
  @post('optional')
  static postOptional = procedure({
    body: z.object({ a: z.string(), b: z.string().optional(), c: z.number().nullable().optional() }),
    query: z.object({ q: z.string(), page: z.string().optional() }),
  }).handle(async (req) => ({ body: await req.vovk.body(), query: req.vovk.query() }));

  @get('numeric/{id}')
  static getNumeric = procedure({
    params: z.object({ id: z.coerce.number() }),
    output: z.object({ id: z.number() }),
  }).handle((_req, { id }) => ({ id }));
}
