import { get, prefix, procedure, toDownloadResponse, type VovkRequest } from 'vovk';
import { z } from 'zod';

// zod >=4.4 is sideEffects: false, so Next.js tree-shakes the default locale init; load the English locale explicitly
z.config(z.locales.en());

// endpoints the Python and Rust clients are run against: downloads, cookies and streams
@prefix('runtime')
export default class ClientRuntimeController {
  // a file as the /response docs page sends one: bytes, or CSV text with a text/csv type and no charset
  @get('download')
  static getDownload = procedure({
    query: z.object({ kind: z.enum(['binary', 'csv']), size: z.string().regex(/^\d+$/) }),
  }).handle((req) => {
    const { kind, size } = req.vovk.query();
    if (kind === 'csv')
      return toDownloadResponse('name,city\nZoë,東京\n', { filename: 'report.csv', type: 'text/csv' });
    const bytes = new Uint8Array(Number(size));
    for (let i = 0; i < bytes.length; i++) bytes[i] = i % 256;
    return toDownloadResponse(bytes, { filename: 'data.bin' });
  });

  @get('set-cookie')
  static getSetCookie() {
    return new Response('{}', {
      headers: { 'content-type': 'application/json', 'set-cookie': 'session=user-a; Path=/; HttpOnly' },
    });
  }

  @get('request-headers')
  static getRequestHeaders(req: VovkRequest) {
    return { cookie: req.headers.get('cookie'), authorization: req.headers.get('authorization') };
  }

  // one item of the given length
  @get('big-item')
  static getBigItem = procedure({
    query: z.object({ size: z.string().regex(/^\d+$/) }),
    iteration: z.object({ value: z.string() }),
  }).handle(async function* (req) {
    yield { value: 'a'.repeat(Number(req.vovk.query().size)) };
  });

  // items that come one by one, with a pause before each
  @get('slow-items')
  static getSlowItems = procedure({
    query: z.object({ count: z.string().regex(/^\d+$/), pause: z.string().regex(/^\d+$/) }),
    iteration: z.object({ value: z.string() }),
  }).handle(async function* (req) {
    const { count, pause } = req.vovk.query();
    for (let i = 0; i < Number(count); i++) {
      if (i) await new Promise((resolve) => setTimeout(resolve, Number(pause)));
      yield { value: String(i) };
    }
  });
}
