import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { OpenApiRPC } from '@/client';

async function App() {
  return (
    <ApiReferenceReact
      configuration={{
        url: OpenApiRPC.getSpec.getURL(), // /api/static/openapi.json,
        hideModels: true,
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Localhost',
          },
          {
            url: 'https://kanban.vovk.dev',
            description: 'Production',
          },
        ],
      }}
    />
  );
}

export default App;
