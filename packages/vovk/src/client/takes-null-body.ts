// type null or a list of types with it, OpenAPI 3.0's nullable, or an anyOf or oneOf branch that accepts null
const acceptsNull = (schema: unknown): boolean => {
  if (typeof schema !== 'object' || schema === null) return false;
  const { type, nullable, anyOf, oneOf } = schema as Record<string, unknown>;
  return (
    type === 'null' ||
    (Array.isArray(type) && type.includes('null')) ||
    nullable === true ||
    [anyOf, oneOf].some((branches) => Array.isArray(branches) && branches.some(acceptsNull))
  );
};

const isJSONContentType = (contentType: string) => {
  const mediaType = contentType.split(';')[0].trim().toLowerCase();
  return mediaType === 'application/json' || mediaType.endsWith('+json');
};

// null is sent as a JSON body only when the body schema accepts null and takes JSON, declared or by default;
// otherwise it's no body, since a model calling a tool sends null for a field it leaves out
export const takesNullBody = (bodySchema: unknown): boolean => {
  if (!acceptsNull(bodySchema)) return false;
  const declared = (bodySchema as { 'x-contentType'?: string[] })['x-contentType'];
  return !declared || declared.some(isJSONContentType);
};
