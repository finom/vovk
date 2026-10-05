'use client';
import { useEffect, useState } from 'react';
import { PollRPC } from '@/client';

export default function PollExample() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let active = true;
    let abort: (() => void) | undefined;
    void (async () => {
      let i = 0;
      while (active) {
        using iterable = await PollRPC.streamPollResponse({
          query: { i: i.toString() },
        });
        if (!active) break;
        abort = iterable.abortSilently;

        for await ({ i } of iterable) {
          setTick(i);
        }
      }
    })();
    return () => {
      active = false;
      abort?.();
    };
  }, []);

  return (
    <div>
      <p>Poll Ticker</p>
      <h2>{tick}</h2>
    </div>
  );
}
