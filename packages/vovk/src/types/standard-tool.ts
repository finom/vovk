import type { CombinedSpec } from './validation.js';

/**
 * The `standard-tool` convention type (https://github.com/finom/standard-tool) — a neutral,
 * framework-agnostic LLM tool shape. Vendored here as a **type only** (no function logic) so Vovk
 * keeps zero extra dependencies and {@link import('./tools.js').VovkTool} can structurally `extend`
 * it: a VovkTool *is* a StandardTool. Kept aligned with the published package — `name` +
 * `description` + optional Standard-Schema/JSON-Schema `inputSchema`/`outputSchema` +
 * `execute(input): ModelOutput`.
 *
 * `Input`/`Output` are the data the tool accepts and returns; `ModelOutput` is what `execute` returns
 * to the model after formatting (by default the data, or an `{ error }` envelope). The formatter
 * itself is an implementation detail of each producer (Vovk's `toModelOutput`, standard-tool's
 * `formatOutput`), not part of this shape.
 */
export interface StandardTool<Input, Output, ModelOutput = Output | { error: string }> {
  name: string;
  description: string;
  inputSchema?: CombinedSpec<Input>;
  outputSchema?: CombinedSpec<Output>;
  execute(input: Input): ModelOutput | Promise<ModelOutput>;
}
