import { deepStrictEqual } from "node:assert/strict";
import type { NextRequest } from "next/server.js";
import { Bench } from "tinybench";
import { get, initSegment, operation, post, prefix, procedure } from "vovk";
import { z } from "zod";

// The controller of the request benches, two endpoints each. The classes are defined in a loop: one big function with
// every class written out makes V8 spend the run compiling it.
const sizes = [1, 10, 100, 1_000, 10_000, 50_000];
const params = z.object({ id: z.string() });

function noopDecorator(_arg?: unknown) {
  return (_target: object, _key: string) => {};
}

function noopClassDecorator(_message?: string) {
  return <T>(target: T) => target;
}

function createSegment(count: number) {
  const controllers: Record<string, Function> = {};
  for (let i = 0; i < count; i++) {
    @prefix(`c/${i}`)
    class Controller {
      @operation({ summary: "Get" })
      @get()
      static getOne = procedure().handle(() => null);

      @operation({ summary: "Create" })
      @post("{id}")
      static create = procedure({
        disableServerSideValidation: ["params"],
        params,
      }).handle(() => null);
    }
    controllers[`C${i}Controller`] = Controller;
  }
  return initSegment({ segmentName: "", emitSchema: true, controllers });
}

function createNoopClasses(count: number) {
  const classes: Record<string, Function> = {};
  for (let i = 0; i < count; i++) {
    @noopClassDecorator()
    class Controller {
      @noopDecorator({ summary: "Get" })
      @noopDecorator()
      static getOne = () => null;

      @noopDecorator({ summary: "Create" })
      @noopDecorator("{id}")
      static create = () => null;
    }
    classes[`C${i}Controller`] = Controller;
  }
  return classes;
}

const { GET, POST } = createSegment(10);
const req = {} as unknown as NextRequest;
deepStrictEqual(
  await (
    await GET(req, { params: Promise.resolve({ vovk: ["c", "9"] }) })
  ).json(),
  null,
);
deepStrictEqual(
  await (
    await POST(req, { params: Promise.resolve({ vovk: ["c", "9", "1"] }) })
  ).json(),
  null,
);

const bench = new Bench({ time: 100 });
for (const count of sizes) {
  bench
    .add(`Cold start for ${count} controllers`, () => {
      createSegment(count);
    })
    .add(`No-op decorators for ${count} classes`, () => {
      createNoopClasses(count);
    });
}

await bench.run();
console.table(bench.table());
