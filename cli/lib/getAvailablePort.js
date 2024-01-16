const net = require('net');

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

function getAvailablePort(startPort, maxAttempts, attempt = 1) {
  return new Promise((resolve, reject) => {
    checkPort(startPort, (isAvailable) => {
      if (isAvailable) {
        resolve(startPort); // Found an available port
      } else if (attempt < maxAttempts) {
        getAvailablePort(startPort + 1, maxAttempts, attempt + 1).then(resolve, reject);
      } else {
        reject(null);
      }
    });
  });
}

module.exports = getAvailablePort;
