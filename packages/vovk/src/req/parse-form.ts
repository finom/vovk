// the Next.js 15.0 edge runtime gives form files from another realm: Blobs that aren't instances of File, which a file
// schema such as z.file() refuses, so each is copied into a File of this realm
const toFile = (file: File) => new File([file], file.name, { type: file.type, lastModified: file.lastModified });

export async function parseForm<T>(body: FormData): Promise<T> {
  const formData: Record<string, string | string[] | File | File[]> = {};

  for (const [key, value] of body.entries()) {
    // assigning "__proto__" would replace the object's prototype; the query parser drops it too
    if (key === '__proto__') continue;

    const entry = typeof value === 'string' || value instanceof File ? value : toFile(value);

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
