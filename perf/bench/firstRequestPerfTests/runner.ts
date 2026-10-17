import { execFileSync } from "node:child_process";

// Each size runs in fresh processes, as a cold start does; tsx's loader comes along through execArgv.
const sizes = ["one", "thousand", "tenThousand", "fiftyThousand"];
const runs = 3;
const median = (values: number[]) =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];

const table = sizes.map((size) => {
  const results = Array.from({ length: runs }, () =>
    JSON.parse(
      execFileSync(
        process.execPath,
        [...process.execArgv, `${import.meta.dirname}/firstRequest.ts`, size],
        { encoding: "utf8" },
      ),
    ),
  );
  return {
    size,
    "First GET (med ms)": median(results.map((r) => r.get)),
    "First POST (med ms)": median(results.map((r) => r.post)),
    "First path with no route (med ms)": median(results.map((r) => r.noRoute)),
  };
});
console.table(table);
