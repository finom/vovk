export async function parseForm<T>(body: FormData): Promise<T> {
  const formData: Record<string, string | string[] | File | File[]> = {};

  for (const [key, value] of body.entries()) {
    // assigning "__proto__" would replace the object's prototype; the query parser drops it too
    if (key === '__proto__') continue;

    // own keys only: an inherited name such as toString is not an earlier value, and "" is one
    if (!Object.hasOwn(formData, key)) {
      formData[key] = value;
      continue;
    }

    // appended in place: copying the array on every repeat makes a body that repeats one name quadratic
    const existing = formData[key];
    if (Array.isArray(existing)) (existing as (string | File)[]).push(value);
    else formData[key] = [existing, value] as string[] | File[];
  }

  return formData as T;
}
