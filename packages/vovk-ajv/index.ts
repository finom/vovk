import { Ajv, type Options, type ValidateFunction } from 'ajv';
import _Ajv2020 from 'ajv/dist/2020.js';
import _ajvErrors from 'ajv-errors';
import _ajvFormats from 'ajv-formats';
import {
  createValidateOnClient,
  HttpException,
  HttpStatus,
  type VovkJSONSchemaBase,
  type VovkSchema,
  type VovkValidateOnClient,
} from 'vovk/create-validate-on-client';

// Handle ESM/CJS interop - these packages export CJS and may have .default wrapper
const Ajv2020 = _Ajv2020.default ?? _Ajv2020;
const ajvFormats = _ajvFormats.default ?? _ajvFormats;
const ajvErrors = _ajvErrors.default ?? _ajvErrors;

export type VovkAjvConfig = {
  options?: Options;
  target?: 'draft-2020-12' | 'draft-07';
};

type Target = NonNullable<VovkAjvConfig['target']>;

const DEFAULT_OPTIONS: Options = {};

const createAjv = (options: Options, target: Target) => {
  const AjvClass = target === 'draft-2020-12' ? Ajv2020 : Ajv;
  const ajv = new AjvClass({
    allErrors: true,
    // a schema is not registered by its $id, so two handlers that share one can't collide in a shared instance
    addUsedSchema: false,
    // strict mode refuses keywords JSON Schema doesn't define, such as Zod's example or OpenAPI's discriminator and x-*
    strict: false,
    // with the u flag a pattern refuses escapes that JavaScript and Zod's regexes allow, such as \- or \_
    unicodeRegExp: false,
    ...options,
  });
  ajvFormats(ajv);
  ajvErrors(ajv);
  ajv.addKeyword('x-contentType');
  ajv.addKeyword('x-tsType');
  return ajv;
};

type AjvInstance = ReturnType<typeof createAjv>;

// null for a schema Ajv can't compile, which is left to the server
type CachedAjv = { ajv: AjvInstance; validators: WeakMap<object, ValidateFunction | null> };

// one Ajv per options object and draft, each compiling a schema object once
const cache = new WeakMap<Options, Partial<Record<Target, CachedAjv>>>();

// formats ajv-formats doesn't know, such as Zod's cuid, nanoid or e164, pass instead of failing compilation;
// Zod emits a pattern for most of them, which is still checked
const allowUnknownFormats = (ajv: AjvInstance, schema: unknown) => {
  if (typeof schema !== 'object' || schema === null) return;
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'format' && typeof value === 'string') {
      if (!ajv.formats[value]) ajv.addFormat(value, true);
    } else {
      allowUnknownFormats(ajv, value);
    }
  }
};

const getValidator = (schema: VovkJSONSchemaBase, options: Options, target: Target, description: string) => {
  const byTarget = cache.get(options) ?? {};
  cache.set(options, byTarget);
  const cached = byTarget[target] ?? { ajv: createAjv(options, target), validators: new WeakMap() };
  byTarget[target] = cached;

  let validator = cached.validators.get(schema);
  if (validator === undefined) {
    allowUnknownFormats(cached.ajv, schema);
    try {
      validator = cached.ajv.compile(schema);
    } catch (error) {
      console.warn(`🐺 Client-side validation of ${description} is skipped, Ajv can't compile its schema:`, error);
      validator = null;
    }
    cached.validators.set(schema, validator);
  }
  return { ajv: cached.ajv, validator };
};

// a file schema is { type: 'string', format: 'binary' }, which a File can't match, so it's checked as this string
const BINARY_PLACEHOLDER = '<binary>';

const toValidatable = (value: unknown): unknown =>
  value instanceof Blob ? BINARY_PLACEHOLDER : Array.isArray(value) ? value.map(toValidatable) : value;

const hasBinary = (value: unknown): boolean => value instanceof Blob || (Array.isArray(value) && value.some(hasBinary));

// copied only when it holds files, so Ajv options that edit the data in place, such as useDefaults, still apply
const withBinaryPlaceholders = (input: unknown) =>
  typeof input === 'object' && input !== null && !Array.isArray(input) && Object.values(input).some(hasBinary)
    ? Object.fromEntries(Object.entries(input).map(([key, value]) => [key, toValidatable(value)]))
    : input;

// a repeated key becomes an array, the way the server parses a form
const formToObject = (form: FormData | URLSearchParams) => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    const entry = toValidatable(value);
    if (!Object.hasOwn(result, key)) {
      result[key] = entry;
      continue;
    }
    const existing = result[key];
    result[key] = Array.isArray(existing) ? [...existing, entry] : [existing, entry];
  }
  return result;
};

const validate = ({
  input,
  schema,
  type,
  endpoint,
  options,
  target,
}: {
  input: unknown;
  schema: VovkJSONSchemaBase;
  type: 'body' | 'query' | 'params';
  endpoint: string;
  options: Options;
  target: VovkAjvConfig['target'] | undefined;
}) => {
  // binary data is not validated
  if (!input || !schema || input instanceof Blob) return;
  const schemaTarget = schema.$schema?.includes('://json-schema.org/draft-07/schema') ? 'draft-07' : 'draft-2020-12';
  const { ajv, validator } = getValidator(schema, options, target ?? schemaTarget, `the ${type} of ${endpoint}`);
  // the server validates the input anyway
  if (!validator) return;
  const data =
    input instanceof FormData || input instanceof URLSearchParams ? formToObject(input) : withBinaryPlaceholders(input);

  if (!validator(data)) {
    throw new HttpException(
      HttpStatus.NULL,
      `Client-side validation failed. Invalid ${type}: ${ajv.errorsText(validator.errors)}`,
      {
        input: data,
        errors: validator.errors,
        endpoint,
      }
    );
  }
};

const getConfig = (schema: VovkSchema) => {
  const config = schema.meta?.config?.libs?.ajv as VovkAjvConfig | undefined;

  const options = config?.options ?? DEFAULT_OPTIONS;
  const target = config?.target;

  return { options, target };
};

const validateOnClientAjv = createValidateOnClient({
  validate: (input, schema, { endpoint, type, fullSchema }) => {
    const { options, target } = getConfig(fullSchema);

    validate({
      input,
      schema,
      target,
      endpoint,
      options,
      type,
    });
  },
});

const configure = ({ options: givenOptions, target: givenTarget }: VovkAjvConfig): VovkValidateOnClient<unknown> =>
  createValidateOnClient({
    validate: (input, schema, { endpoint, type, fullSchema }) => {
      const { options, target } = getConfig(fullSchema);
      validate({
        input,
        schema,
        target: givenTarget ?? target,
        endpoint,
        options: givenOptions ?? options,
        type,
      });
    },
  });

export const validateOnClient = Object.assign(validateOnClientAjv, {
  configure,
});
