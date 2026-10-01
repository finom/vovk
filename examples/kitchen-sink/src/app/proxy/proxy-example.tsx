'use client';
import { useState } from 'react';
import { ProxyRPC } from '@/client';
import type { VovkReturnType } from 'vovk';

export default function ProxyExample() {
  const [serverResponse, setServerResponse] = useState<VovkReturnType<typeof ProxyRPC.getHello>>();

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          setServerResponse(await ProxyRPC.getHello());
        }}
      >
        Get a Greeting from the Server
      </button>
      <div>{serverResponse?.greeting}</div>
    </>
  );
}
