import { deepStrictEqual } from "node:assert/strict";
import type { NextRequest } from "next/server.js";
import { Bench } from "tinybench";
import {
  GET as fiftyThousandGET,
  POST as fiftyThousandPOST,
} from "../../src/app/api/fiftyThousand/[[...vovk]]/route.ts";

const bench = new Bench({ time: 100 });
const dummyReq = {} as unknown as NextRequest;
const dummyGETParams = {
  params: Promise.resolve({
    vovk: ["buyb"],
  }),
};

const dummyPOSTParams = {
  params: Promise.resolve({
    vovk: ["buyb", "123"],
  }),
};

deepStrictEqual(
  await (await fiftyThousandGET(dummyReq, dummyGETParams)).json(),
  {
    get: true,
  },
);
deepStrictEqual(
  await (await fiftyThousandPOST(dummyReq, dummyPOSTParams)).json(),
  { post: true, id: "123" },
);

bench
  .add(
    "50_000 controllers GET",
    async () => await fiftyThousandGET(dummyReq, dummyGETParams),
  )
  .add(
    "50_000 controllers POST",
    async () => await fiftyThousandPOST(dummyReq, dummyPOSTParams),
  );

await bench.run();
console.table(bench.table());
