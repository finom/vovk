import type { VovkRequest } from '../types.js';

const formMap = new WeakMap();

export async function reqForm<T>(req: VovkRequest): Promise<T> {
  if (formMap.has(req)) {
    return formMap.get(req) as T;
  }

  const body = await req.formData();
  req.formData = () => Promise.resolve(body);
  const formData: Record<string, string | File | File[]> = {};

  for (const [key, value] of body.entries()) {
    if (value instanceof File) {
      // If this key already exists, convert to array or append to existing array
      if (formData[key]) {
        if (Array.isArray(formData[key])) {
          (formData[key] as File[]).push(value);
        } else {
          formData[key] = [formData[key] as File, value];
        }
      } else {
        formData[key] = value;
      }
    } else {
      formData[key] = value.toString();
    }
  }

  formMap.set(req, formData);

  return formData as T;
}
