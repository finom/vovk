// @ts-check
const net = require('net');

/**
 * @type {(port: number, callback: (isAvailable: boolean) => void) => void}
 */
function checkPort(port, callback) {
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

/** @type {(startPort: number, maxAttempts: number, attempt: number, onWarning: (failedPort: number, tryingPort: number) => void) => Promise<string>} */
function getAvailablePort(startPort, maxAttempts, attempt, onWarning) {
  return new Promise((resolve, reject) => {
    checkPort(startPort, (isAvailable) => {
      if (isAvailable) {
        resolve(startPort.toString()); // Found an available port
      } else if (attempt < maxAttempts) {
        onWarning(startPort, startPort + 1);
        getAvailablePort(startPort + 1, maxAttempts, attempt + 1, onWarning).then(resolve, reject);
      } else {
        reject(null);
      }
    });
  });
}

module.exports = getAvailablePort;
