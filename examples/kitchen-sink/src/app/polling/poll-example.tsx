'use client';
import { useEffect, useState } from 'react';
import { PollRPC } from '@/client';

export default function PollExample() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    void (async () => {
      let i = 0;
      while (true) {
        using iterable = await PollRPC.streamPollResponse({
          query: { i: i.toString() },
        });

        for await ({ i } of iterable) {
          setTick(i);
        }
      }
    })();
  }, []);

  return (
    <div>
      <p>Poll Ticker</p>
      <h2>{tick}</h2>
    </div>
  );
}
