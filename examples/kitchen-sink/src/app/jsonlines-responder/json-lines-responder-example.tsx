'use client';
import { useState } from 'react';
import { JSONLinesResponderRPC } from '@/client';
import type { VovkYieldType } from 'vovk';

export default function StreamExample() {
  const [tokens, setTokens] = useState<VovkYieldType<typeof JSONLinesResponderRPC.streamTokens>[]>([]);
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          setTokens([]);
          using stream = await JSONLinesResponderRPC.streamTokens();
          for await (const token of stream) {
            setTokens((tokens) => [...tokens, token]);
          }
        }}
      >
        Get JSON Lines response
      </button>
      <div>
        {tokens.map(({ message }, i) => (
          <span key={i}>{message}</span>
        ))}
      </div>
    </>
  );
}
