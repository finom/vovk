'use client';
import { useRef, useState, type FormEvent } from 'react';
import { FormZodRPC } from '@/client';
import type { VovkReturnType } from 'vovk';

export default function ZodFormExample() {
  const [response, setResponse] = useState<VovkReturnType<typeof FormZodRPC.submitForm> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLFormElement>(null);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ref.current) return; // TS safeguard, should never happen
    try {
      setResponse(
        await FormZodRPC.submitForm({
          body: new FormData(ref.current),
          params: { id: '5a279068-35d6-4d67-94e0-c21ef4052eea' },
        })
      );
      setError(null);
    } catch (e) {
      setError(e as Error);
      setResponse(null);
    }
  };

  return (
    <form onSubmit={onSubmit} ref={ref}>
      <label htmlFor="email" className="font-bold">
        Email
      </label>
      <input type="text" placeholder="Email" name="email" />
      <br />
      <br />
      <label htmlFor="resume" className="font-bold">
        Resume
      </label>
      <br />
      <input type="file" placeholder="Resume" name="resume" />
      <br />
      <br />
      <label htmlFor="portfolioSamples" className="font-bold">
        Portfolio Samples (multiple)
      </label>
      <br />
      <input type="file" multiple placeholder="Portfolio Samples" name="portfolioSamples" />
      <br />
      <button type="submit">Submit</button>

      {response && (
        <div className="text-left">
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {error && <div className="overflow-auto">❌ {String(error)}</div>}
    </form>
  );
}
