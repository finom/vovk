'use client';
import { useState, type FormEvent } from 'react';
import { UserValibotRPC } from '@/client';
import type { VovkReturnType } from 'vovk';

export default function ValibotFormExample() {
  const [response, setResponse] = useState<VovkReturnType<typeof UserValibotRPC.updateUser> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(30);
  const [disableClientValidation, setDisableClientValidation] = useState(false);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setResponse(
        await UserValibotRPC.updateUser({
          body: { name, email, age },
          query: { notify: 'push' },
          params: { id: '5a279068-35d6-4d67-94e0-c21ef4052eea' },
          disableClientValidation,
        })
      );
      setError(null);
    } catch (e) {
      setError(e as Error);
      setResponse(null);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="age">Age:</label>
      <input id="age" type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.valueAsNumber)} />
      <label className="block mb-4">
        <input
          type="checkbox"
          className="mr-2"
          checked={disableClientValidation}
          onChange={(e) => setDisableClientValidation(e.target.checked)}
        />
        Disable client-side validation
      </label>
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
