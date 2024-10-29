import net from 'net';

/**
 * Checks if a port is available.
 * @param {number} port - The port to check.
 * @param {(isAvailable: boolean) => void} callback - The callback function.
 */
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

/**
 * Finds an available port starting from a given port.
 * @param {number} startPort - The port to start checking from.
 * @param {number} maxAttempts - The maximum number of attempts to find an available port.
 * @param {number} attempt - The current attempt number.
 * @param {(failedPort: number, tryingPort: number) => void} onWarning - The callback function for warnings.
 * @returns {Promise<string>}
 */
function getAvailablePort(
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

export default getAvailablePort;
