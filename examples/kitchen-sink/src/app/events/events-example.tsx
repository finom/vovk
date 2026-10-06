'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EventsRPC } from '@/client';
import type { VovkIteration } from 'vovk';

export default function EventsExample() {
  const [eventPayload, setEventPayload] = useState<VovkIteration<typeof EventsRPC.streamEvents>['payload'] | null>(
    null
  );
  const [eventName, setEventName] = useState<VovkIteration<typeof EventsRPC.streamEvents>['event'] | null>(null);
  const abortRef = useRef<() => void>(null);
  // a new click or leaving the page ends the loop of the previous run
  const runRef = useRef(0);

  useEffect(
    () => () => {
      runRef.current++;
      abortRef.current?.();
    },
    []
  );

  const streamEvents = useCallback(async () => {
    const run = ++runRef.current;
    abortRef.current?.();
    while (run === runRef.current) {
      using events = await EventsRPC.streamEvents();
      if (run !== runRef.current) break;
      abortRef.current = events.abortSilently;
      for await (const { event, payload } of events) {
        setEventName(event);
        setEventPayload(payload);
      }
    }
  }, []);

  return (
    <div>
      <button type="button" onClick={streamEvents}>
        Stream Events
      </button>
      <br />
      <br />
      <h2>Latest Event:</h2>
      <pre>{eventName || 'No event yet'}</pre>
      <br />
      <h2>Event Payload:</h2>
      <pre>{eventPayload ? JSON.stringify(eventPayload, null, 2) : 'No payload yet'}</pre>
    </div>
  );
}
