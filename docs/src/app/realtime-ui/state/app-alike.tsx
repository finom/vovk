/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignore */
'use client';
import { useState } from 'react';

const AppAlikeNormal = ({ fullName, setFullName }: { fullName: string; setFullName: (name: string) => void }) => {
  const [fullNameInput, setFullNameInput] = useState(fullName);
  return (
    <div className="border dark:border-gray-800 border-gray-200 my-8">
      <div className="flex justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="font-bold">ACME Inc.</div>
        <div>Welcome on board, {fullName}!</div>
      </div>
      <div className="flex">
        <div className="border-r border-gray-200 dark:border-gray-800 p-4 flex items-end min-w-44">👤 {fullName}</div>
        <div className="p-4 flex-1">
          <h1 className="font-bold text-2xl mb-4">Update your profile, {fullName}!</h1>
          <label htmlFor="fullName" className="block">
            Full name
          </label>
          <input
            type="text"
            id="fullName"
            placeholder="Full name"
            value={fullNameInput}
            onChange={(e) => setFullNameInput(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded p-2 my-2 w-64"
          />
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4 block cursor-pointer"
            onClick={() => setFullName(fullNameInput)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const AppAlikeWithCode = () => {
  const [fullName, setFullName] = useState('{user.fullName}');
  const [fullNameInput, setFullNameInput] = useState(fullName);
  return (
    <div className="border dark:border-gray-800 border-gray-200 my-8">
      <div className="flex justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="font-bold">ACME Inc.</div>
        <div>Welcome on board, {fullName}!</div>
      </div>
      <div className="flex">
        <div className="border-r border-gray-200 dark:border-gray-800 p-4 flex items-end min-w-44">👤 {fullName}</div>
        <div className="p-4 flex-1">
          <h1 className="font-bold text-2xl mb-4">Update your profile, {fullName}!</h1>
          <label htmlFor="fullName" className="block">
            Full name
          </label>
          {
            <input
              type="text"
              id="fullName"
              placeholder="Full name"
              value={fullNameInput}
              onChange={(e) => setFullNameInput(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded p-2 my-2 w-64"
            />
          }
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4 block cursor-pointer"
            onClick={() => setFullName(fullNameInput)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const AppAlike = () => {
  const [fullName, setFullName] = useState('John Doe');
  const [showCode, setShowCode] = useState(false);
  return (
    <div onMouseEnter={() => setShowCode(true)} onMouseLeave={() => setShowCode(false)} className="overflow-x-auto">
      {!showCode ? <AppAlikeWithCode /> : <AppAlikeNormal fullName={fullName} setFullName={setFullName} />}
    </div>
  );
};

export default AppAlike;
