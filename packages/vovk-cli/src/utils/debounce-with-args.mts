// biome-ignore lint/suspicious/noExplicitAny: Used to explicitly
type KnownAny = any;

// one timer per distinct argument list; a call that resets the timer gets the result of the call that runs
export function debounceWithArgs<Callback extends (...args: KnownAny[]) => KnownAny>(
  callback: Callback,
  wait: number
): (...args: Parameters<Callback>) => Promise<Awaited<ReturnType<Callback>>> {
  const pending = new Map<
    string,
    { timeout: NodeJS.Timeout; result: PromiseWithResolvers<Awaited<ReturnType<Callback>>> }
  >();

  return (...args: Parameters<Callback>) => {
    const key = JSON.stringify(args);
    const waiting = pending.get(key);

    if (waiting) {
      clearTimeout(waiting.timeout);
    }

    const result = waiting?.result ?? Promise.withResolvers<Awaited<ReturnType<Callback>>>();
    const timeout = setTimeout(async () => {
      pending.delete(key);
      try {
        result.resolve(await callback(...args));
      } catch (error) {
        result.reject(error);
      }
    }, wait);

    pending.set(key, { timeout, result });

    return result.promise;
  };
}
