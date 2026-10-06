// shared refs and nested arrays grow a sample exponentially, so one sample expands at most this many $refs and
// array items together; past it a $ref gives null and an array gets no more items
const SAMPLE_BUDGET = 200;

export type SampleBudget = { left: number };

export const createSampleBudget = (): SampleBudget => ({ left: SAMPLE_BUDGET });

export function spend(budget: SampleBudget): boolean {
  if (budget.left <= 0) return false;
  budget.left -= 1;
  return true;
}
