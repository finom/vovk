import { deepStrictEqual } from "node:assert/strict";
import type { NextRequest } from "next/server.js";
import { Bench } from "tinybench";
import {
  GET as hundredGET,
  POST as hundredPOST,
} from "../../src/app/api/hundred/[[...vovk]]/route.ts";

const bench = new Bench({ time: 100 });
const dummyReq = {} as unknown as NextRequest;
const dummyGETParams = {
  params: Promise.resolve({
    vovk: ["cv"],
  }),
};

const dummyPOSTParams = {
  params: Promise.resolve({
    vovk: ["cv", "123"],
  }),
};

deepStrictEqual(await (await hundredGET(dummyReq, dummyGETParams)).json(), {
  get: true,
});
deepStrictEqual(await (await hundredPOST(dummyReq, dummyPOSTParams)).json(), {
  post: true,
  id: "123",
});

bench
  .add(
    "100 controllers GET",
    async () => await hundredGET(dummyReq, dummyGETParams),
  )
  .add(
    "100 controllers POST",
    async () => await hundredPOST(dummyReq, dummyPOSTParams),
  );

await bench.run();
console.table(bench.table());
