import { deepStrictEqual, equal } from "node:assert/strict";
import type { NextRequest } from "next/server.js";
import { Bench } from "tinybench";

// Routes the cache can't serve: a new value for a path param each call, and a path with no route.
const lastController = {
  ten: "j",
  thousand: "all",
  tenThousand: "ntp",
  fiftyThousand: "buyb",
};
const size = process.argv[2] as keyof typeof lastController;
if (!(size in lastController))
  throw new Error(
    `Size must be one of: ${Object.keys(lastController).join(", ")}`,
  );

const { GET, POST } = await import(
  `../../src/app/api/${size}/[[...vovk]]/route.ts`
);
const req = {} as unknown as NextRequest;
const params = (vovk: string[]) => ({ params: Promise.resolve({ vovk }) });
let id = 0;

deepStrictEqual(
  await (await POST(req, params([lastController[size], "check"]))).json(),
  { post: true, id: "check" },
);
equal((await GET(req, params(["no", "such", "path"]))).status, 404);

const bench = new Bench({ time: 100 });
bench
  .add(
    `${size}: POST, new path with a param`,
    async () => await POST(req, params([lastController[size], `${id++}`])),
  )
  .add(
    `${size}: GET, path with no route`,
    async () => await GET(req, params(["no", "such", "path"])),
  );

await bench.run();
console.table(bench.table());
