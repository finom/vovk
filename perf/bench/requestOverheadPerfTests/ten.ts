import { deepStrictEqual } from "node:assert/strict";
import type { NextRequest } from "next/server.js";
import { Bench } from "tinybench";
import {
  GET as tenGET,
  POST as tenPOST,
} from "../../src/app/api/ten/[[...vovk]]/route.ts";

const bench = new Bench({ time: 100 });
const dummyReq = {} as unknown as NextRequest;
const dummyGETParams = {
  params: Promise.resolve({
    vovk: ["j"],
  }),
};

const dummyPOSTParams = {
  params: Promise.resolve({
    vovk: ["j", "123"],
  }),
};

deepStrictEqual(await (await tenGET(dummyReq, dummyGETParams)).json(), {
  get: true,
});
deepStrictEqual(await (await tenPOST(dummyReq, dummyPOSTParams)).json(), {
  post: true,
  id: "123",
});

bench
  .add("10 controllers GET", async () => await tenGET(dummyReq, dummyGETParams))
  .add(
    "10 controllers POST",
    async () => await tenPOST(dummyReq, dummyPOSTParams),
  );

await bench.run();
console.table(bench.table());
