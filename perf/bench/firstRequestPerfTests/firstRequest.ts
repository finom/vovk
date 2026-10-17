import { equal } from "node:assert/strict";
import type { NextRequest } from "next/server.js";

// One fresh process: the first GET and the first POST each build their method's route table, and the first path with
// no route builds the tables of the other methods.
const lastController = {
  one: "a",
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

const time = async (request: () => Promise<Response>, status: number) => {
  const start = performance.now();
  const response = await request();
  const ms = performance.now() - start;
  equal(response.status, status);
  return ms;
};

const result = {
  get: await time(() => GET(req, params([lastController[size]])), 200),
  post: await time(() => POST(req, params([lastController[size], "1"])), 200),
  noRoute: await time(() => GET(req, params(["no", "such", "path"])), 404),
};
console.log(JSON.stringify(result));
