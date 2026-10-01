import net from 'node:net';

// checks if a port is free
function checkPort(port: number, callback: (isAvailable: boolean) => void): void {
  const server = net.createServer();

  server.listen(port, () => {
    server.close(() => {
      callback(true); // Port is available
    });
  });

  server.on('error', () => {
    callback(false);
  });
}

// finds a free port starting from startPort, up to maxAttempts
export function getAvailablePort(
  startPort: number,
  maxAttempts: number,
  attempt: number,
  onWarning: (failedPort: number, tryingPort: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    checkPort(startPort, (isAvailable) => {
      if (isAvailable) {
        resolve(startPort.toString()); // Found an available port
      } else if (attempt < maxAttempts) {
        onWarning(startPort, startPort + 1);
        getAvailablePort(startPort + 1, maxAttempts, attempt + 1, onWarning).then(resolve, reject);
      } else {
        reject(new Error('No available ports found'));
      }
    });
  });
}
