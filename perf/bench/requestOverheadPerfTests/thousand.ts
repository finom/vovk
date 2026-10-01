import { deepStrictEqual } from "node:assert/strict";
import type { NextRequest } from "next/server.js";
import { Bench } from "tinybench";
import {
  GET as thousandGET,
  POST as thousandPOST,
} from "../../src/app/api/thousand/[[...vovk]]/route.ts";

const bench = new Bench({ time: 100 });
const dummyReq = {} as unknown as NextRequest;
const dummyGETParams = {
  params: Promise.resolve({
    vovk: ["all"],
  }),
};

const dummyPOSTParams = {
  params: Promise.resolve({
    vovk: ["all", "123"],
  }),
};

deepStrictEqual(await (await thousandGET(dummyReq, dummyGETParams)).json(), {
  get: true,
});
deepStrictEqual(await (await thousandPOST(dummyReq, dummyPOSTParams)).json(), {
  post: true,
  id: "123",
});

bench
  .add(
    "1_000 controllers GET",
    async () => await thousandGET(dummyReq, dummyGETParams),
  )
  .add(
    "1_000 controllers POST",
    async () => await thousandPOST(dummyReq, dummyPOSTParams),
  );

await bench.run();
console.table(bench.table());
