'use client';
import { useActionState } from 'react';
import { submitFormAction } from './actions.js';

export default function ServerActionFormExample() {
  const [result, formAction, isPending] = useActionState(submitFormAction, null);

  return (
    <form action={formAction}>
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
      <input type="file" name="resume" />
      <br />
      <br />
      <label htmlFor="portfolioSamples" className="font-bold">
        Portfolio Samples (multiple)
      </label>
      <br />
      <input type="file" multiple name="portfolioSamples" />
      <br />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>

      {result && 'data' in result && (
        <div className="text-left">
          <h3>Response:</h3>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}

      {result && 'error' in result && <div className="overflow-auto">❌ {result.error}</div>}
    </form>
  );
}
