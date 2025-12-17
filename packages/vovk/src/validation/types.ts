import type { StandardSchemaV1, StandardJSONSchemaV1 } from '@standard-schema/spec';

export interface CombinedSchema<Input = unknown, Output = Input>
  extends StandardSchemaV1.Props<Input, Output>, StandardJSONSchemaV1.Props<Input, Output> {}
