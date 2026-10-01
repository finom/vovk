'use client';
import { useMutation } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import type { VovkQuery } from 'vovk';
import { UserRPC } from '../../client/root'; // segmented client

const UserFormDemo = () => {
  const [disableClientValidation, setDisableClientValidation] = useState(false);
  const [name, setName] = useState('John Doe');
  const [age, setAge] = useState(35);
  const [email, setEmail] = useState('john@example.com');
  const [id, setId] = useState('a937629d-e8f6-4b1e-a819-7669358650a0');
  const [notify, setNotify] = useState<
    VovkQuery<typeof UserRPC.updateUser>['notify']
  >(
    'sms' as 'email', // intentionally use an invalid value
  );

  const updateUserMutation = useMutation({
    mutationFn: UserRPC.updateUser,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateUserMutation.mutate({
      body: {
        email,
        profile: {
          name,
          age,
        },
      },
      query: { notify },
      params: { id },
      disableClientValidation,
    });
  };
  return (
    <form onSubmit={handleSubmit}>
      <h3>Body</h3>
      <div>
        <label htmlFor="email">User email</label>
        <input
          id="email"
          name="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="name">User full name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="age">User age</label>
        <input
          id="age"
          name="age"
          type="number"
          placeholder="35"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
      </div>

      <h3>Params</h3>
      <div>
        <label htmlFor="id">User ID</label>
        <input
          id="id"
          name="id"
          type="text"
          placeholder="123e4567-e89b-12d3-a456-426614174000"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>
      <h3>Query</h3>
      <div>
        <label htmlFor="notify">Notification type</label>
        <select
          id="notify"
          name="notify"
          value={notify}
          onChange={(e) =>
            setNotify(e.target.value as 'email' | 'push' | 'none')
          }
        >
          <option value="none">None</option>
          <option value="email">Email</option>
          <option value="push">Push</option>
          <option value="sms">SMS (error)</option>
        </select>
      </div>
      <br />
      <label>
        <input
          type="checkbox"
          onChange={({ target }) => setDisableClientValidation(target.checked)}
          checked={disableClientValidation}
        />{' '}
        Disable client-side input validation
      </label>
      <button type="submit">Submit</button>
      {(updateUserMutation.data || updateUserMutation.error) && (
        <output>
          <strong>Response:</strong>{' '}
          {updateUserMutation.error ? (
            <div className="text-red-500">
              {updateUserMutation.error.message}
            </div>
          ) : (
            <div className="text-green-500">
              {JSON.stringify(updateUserMutation.data)}
            </div>
          )}
        </output>
      )}
    </form>
  );
};

export default UserFormDemo;
