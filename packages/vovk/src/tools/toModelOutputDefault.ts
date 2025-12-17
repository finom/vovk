export type DefaultModelOutput<T> = T | { error: string };

type ToModelOutputDefaultFn = <T>(result: T | Error) => Promise<DefaultModelOutput<T>>;

export const toModelOutputDefault = ((result) => {
  return Promise.resolve(result instanceof Error ? { error: result.message } : (result as DefaultModelOutput<unknown>));
}) as ToModelOutputDefaultFn;
