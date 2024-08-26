import http from 'http';
import { VovkMetadata } from 'vovk';

export default function createMetadataServer(
  then: (metadata: { metadata: VovkMetadata }) => void | Promise<void>,
  catchFn: (err: Error) => void | Promise<void>
) {
  return http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/__metadata') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const result: { metadata: VovkMetadata } = JSON.parse(body);
          void then(result);
        } catch (e) {
          void catchFn(e as Error);
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      void catchFn(new Error('Not Found'));
    }
  });
}
