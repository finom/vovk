'use client';
import { useState } from 'react';
import { StaticParamsRPC } from '@/client';
import type { VovkParams, VovkReturnType } from 'vovk';

export default function StaticParamsExample() {
  const [serverResponse, setServerResponse] = useState<VovkReturnType<typeof StaticParamsRPC.getStaticParams>>();
  const [section, setSection] = useState<VovkParams<typeof StaticParamsRPC.getStaticParams>['section']>('a');
  const [page, setPage] = useState<VovkParams<typeof StaticParamsRPC.getStaticParams>['page']>('1');

  return (
    <>
      <label htmlFor="section">Section:</label>
      <select id="section" value={section} onChange={(e) => setSection(e.target.value as typeof section)}>
        {['a', 'b'].map((key: string) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <br />
      <label htmlFor="page">Page:</label>
      <select id="page" value={page} onChange={(e) => setPage(e.target.value as typeof page)}>
        {['1', '2', '3'].map((key: string) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <br />
      <button
        type="button"
        onClick={async () => {
          setServerResponse(await StaticParamsRPC.getStaticParams({ params: { section, page } }));
        }}
      >
        Get Static Params Response
      </button>
      <div>{serverResponse ? JSON.stringify(serverResponse) : ''}</div>
    </>
  );
}
