export async function parseForm<T>(body: FormData): Promise<T> {
  const formData: Record<string, string | string[] | File | File[]> = {};

  for (const [key, value] of body.entries()) {
    // assigning "__proto__" would replace the object's prototype; the query parser drops it too
    if (key === '__proto__') continue;

    // an entry is a string or a File: instanceof File misses one from another realm, as on the Next.js 15.0 edge runtime
    const entry = value;

    // own keys only: an inherited name such as toString is not an earlier value, and "" is one
    if (!Object.hasOwn(formData, key)) {
      formData[key] = entry;
      continue;
    }

    // appended in place: copying the array on every repeat makes a body that repeats one name quadratic
    const existing = formData[key];
    if (Array.isArray(existing)) (existing as (string | File)[]).push(entry);
    else formData[key] = [existing, entry] as string[] | File[];
  }

  return formData as T;
}
