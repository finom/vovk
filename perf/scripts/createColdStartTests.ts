import * as fs from "node:fs/promises";
import * as path from "node:path";
import prettier from "prettier";

(async () => {
  const cases = {
    one: 1,
    ten: 10,
    hundred: 100,
    thousand: 1_000,
    tenThousand: 10_000,
  };

  let result = `import { procedure, prefix, post, initSegment, operation } from "vovk";
import { Bench } from 'tinybench';
import { z } from 'zod';

const params = z.object({ id: z.string() });

function noopDecorator(arg?: any) {
  return function <T>(
    target: any,
    propertyKey: string,
    descriptor?: TypedPropertyDescriptor<T>
  ): any {
    return descriptor;
  };
}

function noopClassDecorator(message?: string) {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    return constructor;
  };
}

const bench = new Bench({ time: 100 });`;

  for (const [name, count] of Object.entries(cases)) {
    result += `

bench
    .add('Cold start for ${count} controllers', async () => {
const controllers: Record<string, Function> = {};`;
    for (let i = 0; i < count; i++) {
      const controllerName = `${name.charAt(0).toUpperCase() + name.slice(1) + i}Controller`;
      result += `
@prefix("${name}/${i}")
class ${controllerName} {
  @operation({
    summary: "Create",
  })
  @post("{id}")
  static create = procedure({ params }).handle(() => null);
}

controllers["${controllerName}"] = ${controllerName};
      `;
    }

    result += `
    initSegment({
      segmentName: "",
      emitSchema: true,
      controllers,
    });
});

bench
    .add('No-op decorators for ${count} classes', async () => {
const controllers: Record<string, Function> = {};`;
    for (let i = 0; i < count; i++) {
      const controllerName = `${name.charAt(0).toUpperCase() + name.slice(1) + i}Controller`;
      result += `
@noopClassDecorator()
class ${controllerName} {
  @noopDecorator({
    summary: "Create",
  })
  @noopDecorator("{id}")
  static create = () => {
    return null;
  };
}
      `;
    }

    result += `
});
    `;
  }

  result += ` await bench.run();
console.table(bench.table());`;
  await fs.writeFile(
    path.join(`bench/generated_coldStartPerfTest.ts`),
    await prettier.format(result, { parser: "typescript" }),
  );
})();
