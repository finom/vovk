import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { headers } from 'next/headers';

async function App() {
  const isIframe = (await headers()).get('sec-fetch-dest') === 'iframe';
  return (
    <ApiReferenceReact
      configuration={{
        showSidebar: !isIframe,
        url: '/api/static/openapi.json',
        hideModels: true,
      }}
    />
  );
}

export default App;
