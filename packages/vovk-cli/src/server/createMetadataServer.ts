import http from 'http';
import { VovkMetadata } from 'vovk';

type Result = { metadata?: VovkMetadata; emitMetadata: boolean; segmentName: string };

export default function createMetadataServer(
  then: (metadata: Result) => void | Promise<void>,
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
          const result: Result = JSON.parse(body);
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
