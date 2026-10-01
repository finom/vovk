'use client';
import { useState } from 'react';
import { JSONLinesRPC } from '@/client';
import type { VovkYieldType } from 'vovk';

export default function StreamExample() {
  const [tokens, setTokens] = useState<VovkYieldType<typeof JSONLinesRPC.streamTokens>[]>([]);

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          setTokens([]);
          using stream = await JSONLinesRPC.streamTokens();
          for await (const token of stream) {
            setTokens((tokens) => [...tokens, token]);
          }
        }}
      >
        Get JSONLines Response
      </button>
      <div>
        {tokens.map(({ message }, i) => (
          <span key={i}>{message}</span>
        ))}
      </div>
    </>
  );
}
