// a call during a run starts one more run once it ends, and the calls made meanwhile share that run,
// so a run never overlaps another and the last one starts after the last call
export function oneAtATime(task: () => Promise<void>): () => Promise<void> {
  let running: Promise<void> | null = null;
  let queued: PromiseWithResolvers<void> | null = null;

  const run = (): Promise<void> => {
    running = task().finally(() => {
      running = null;
      if (queued) {
        const { resolve, reject } = queued;
        queued = null;
        run().then(resolve, reject);
      }
    });
    return running;
  };

  return () => {
    if (!running) return run();
    queued ??= Promise.withResolvers<void>();
    return queued.promise;
  };
}
