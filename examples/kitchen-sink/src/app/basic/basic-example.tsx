'use client';
import { useState } from 'react';
import { BasicRPC } from '@/client';
import type { VovkReturnType } from 'vovk';

export default function BasicExample() {
  const [serverResponse, setServerResponse] = useState<VovkReturnType<typeof BasicRPC.getHello>>();

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          setServerResponse(await BasicRPC.getHello());
        }}
      >
        Get a Greeting from the Server
      </button>
      <div>{serverResponse?.greeting}</div>
    </>
  );
}
