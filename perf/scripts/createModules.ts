import fs from "node:fs/promises";
import path from "node:path";

// Writes what `vovk new segment` and `vovk new controller` produce, without spawning the CLI 11,111 times.
const cases = {
  one: 1,
  ten: 10,
  hundred: 100,
  thousand: 1_000,
  tenThousand: 10_000,
};

function numberToLetters(num: number): string {
  let result = "";
  while (num >= 0) {
    result = String.fromCharCode((num % 26) + 97) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result;
}

const controllerSource = (
  name: string,
  TheThing: string,
) => `import { procedure, prefix, get, post, operation } from "vovk";
import z from "zod";

@prefix("${name}")
export default class ${TheThing}Controller {
  @operation({
    summary: "Get ${TheThing}",
  })
  @get()
  static get${TheThing} = procedure().handle(() => {
    return { get: true };
  });

  @operation({
    summary: "Create ${TheThing}",
  })
  @post("{id}")
  static create${TheThing} = procedure({
    disableServerSideValidation: ["params"],
    params: z.object({ id: z.string() }),
  }).handle((_req, { id }) => {
    return { post: true, id };
  });
}
`;

const routeSource = (segmentName: string, names: string[]) => {
  const things = names.map((name) => ({
    name,
    TheThing: name[0].toUpperCase() + name.slice(1),
  }));
  return `import { initSegment } from "vovk";
${things.map(({ name, TheThing }) => `import ${TheThing}Controller from "../../../../modules/${segmentName}/${name}/${name}-controller.ts";`).join("\n")}

const controllers = {
${things.map(({ TheThing }) => `  ${TheThing}RPC: ${TheThing}Controller,`).join("\n")}
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: "${segmentName}",
  emitSchema: true,
  controllers,
});
`;
};

for (const [segmentName, count] of Object.entries(cases)) {
  const names = Array.from({ length: count }, (_, i) => numberToLetters(i));
  for (const name of names) {
    const dir = path.join("src/modules", segmentName, name);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, `${name}-controller.ts`),
      controllerSource(name, name[0].toUpperCase() + name.slice(1)),
    );
  }
  const routeDir = path.join("src/app/api", segmentName, "[[...vovk]]");
  await fs.mkdir(routeDir, { recursive: true });
  await fs.writeFile(
    path.join(routeDir, "route.ts"),
    routeSource(segmentName, names),
  );
}
