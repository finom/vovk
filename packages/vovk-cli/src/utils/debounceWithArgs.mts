// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounceWithArgs<Callback extends (...args: any[]) => any>(
  callback: Callback,
  wait: number
): (...args: Parameters<Callback>) => Promise<Awaited<ReturnType<Callback>>> {
  // Stores timeouts keyed by the stringified arguments
  const timeouts = new Map<string, NodeJS.Timeout>();

  return (...args: Parameters<Callback>) => {
    // Convert arguments to a JSON string (or any other stable key generation)
    const key = JSON.stringify(args);

    // Clear any existing timer for this specific key
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key)!);
    }

    // Return a promise that resolves/rejects after the debounce delay
    return new Promise<Awaited<ReturnType<Callback>>>((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await callback(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // Remove the entry once the callback is invoked
          timeouts.delete(key);
        }
      }, wait);

      timeouts.set(key, timeoutId);
    });
  };
}
