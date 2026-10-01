import { deepStrictEqual } from "node:assert/strict";
import type { NextRequest } from "next/server.js";
import { Bench } from "tinybench";
import {
  GET as oneGET,
  POST as onePOST,
} from "../../src/app/api/one/[[...vovk]]/route.ts";

const bench = new Bench({ time: 100 });
const dummyReq = {} as unknown as NextRequest;
const dummyGETParams = {
  params: Promise.resolve({
    vovk: ["a"],
  }),
};

const dummyPOSTParams = {
  params: Promise.resolve({
    vovk: ["a", "123"],
  }),
};

deepStrictEqual(await (await oneGET(dummyReq, dummyGETParams)).json(), {
  get: true,
});
deepStrictEqual(await (await onePOST(dummyReq, dummyPOSTParams)).json(), {
  post: true,
  id: "123",
});

bench
  .add("1 controller GET", async () => await oneGET(dummyReq, dummyGETParams))
  .add(
    "1 controller POST",
    async () => await onePOST(dummyReq, dummyPOSTParams),
  );

await bench.run();
console.table(bench.table());
