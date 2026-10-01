'use client';
import { useState } from 'react';
import { UserZodRPC } from '@/client';
import { useForm } from 'react-hook-form';
import type { VovkBody, VovkReturnType } from 'vovk';
import { ajvResolver } from '@hookform/resolvers/ajv';
import { fastFormats } from 'ajv-formats/dist/formats.js';

export default function ZodHookFormExample() {
  const [response, setResponse] = useState<VovkReturnType<typeof UserZodRPC.updateUser> | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<VovkBody<typeof UserZodRPC.updateUser>>({
    // @ts-expect-error This example isn't working as vovk-examples uses newer version of JSON Schema
    resolver: ajvResolver(UserZodRPC.updateUser.schema.validation.body, {
      formats: fastFormats,
    }),
  });

  const onSubmit = async () => {
    setResponse(
      await UserZodRPC.updateUser({
        body: getValues(),
        query: { notify: 'push' },
        params: { id: '5a279068-35d6-4d67-94e0-c21ef4052eea' },
      })
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="Name" {...register('name')} />
      {errors.name && <p>❌ {errors.name.message}</p>}
      <input type="text" placeholder="Email" {...register('email')} />
      {errors.email && <p>❌ {errors.email.message}</p>}
      <label htmlFor="age">Age:</label>
      <input type="number" id="age" placeholder="Age" {...register('age', { valueAsNumber: true })} />
      {errors.age && <p>❌ {errors.age.message}</p>}
      <button type="submit">Submit</button>

      {response && (
        <div>
          <h3>Response</h3>
          <pre className="text-left">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}
