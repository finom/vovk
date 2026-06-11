export async function parseForm<T>(body: FormData): Promise<T> {
  const formData: Record<string, string | string[] | File | File[]> = {};

  for (const [key, value] of body.entries()) {
    const existing = formData[key];

    if (value instanceof File) {
      if (existing) {
        formData[key] = Array.isArray(existing) ? ([...existing, value] as File[]) : [existing as File, value];
      } else {
        formData[key] = value;
      }
    } else {
      const str = value.toString();
      if (existing) {
        formData[key] = Array.isArray(existing) ? ([...existing, str] as string[]) : [existing as string, str];
      } else {
        formData[key] = str;
      }
    }
  }

  return formData as T;
}
