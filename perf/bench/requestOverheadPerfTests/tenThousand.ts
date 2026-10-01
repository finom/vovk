import { deepStrictEqual } from "node:assert/strict";
import type { NextRequest } from "next/server.js";
import { Bench } from "tinybench";
import {
  GET as tenThousandGET,
  POST as tenThousandPOST,
} from "../../src/app/api/tenThousand/[[...vovk]]/route.ts";

const bench = new Bench({ time: 100 });
const dummyReq = {} as unknown as NextRequest;
const dummyGETParams = {
  params: Promise.resolve({
    vovk: ["ntp"],
  }),
};

const dummyPOSTParams = {
  params: Promise.resolve({
    vovk: ["ntp", "123"],
  }),
};

deepStrictEqual(await (await tenThousandGET(dummyReq, dummyGETParams)).json(), {
  get: true,
});
deepStrictEqual(
  await (await tenThousandPOST(dummyReq, dummyPOSTParams)).json(),
  { post: true, id: "123" },
);

bench
  .add(
    "10_000 controllers GET",
    async () => await tenThousandGET(dummyReq, dummyGETParams),
  )
  .add(
    "10_000 controllers POST",
    async () => await tenThousandPOST(dummyReq, dummyPOSTParams),
  );

await bench.run();
console.table(bench.table());
