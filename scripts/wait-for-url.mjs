// Waits until a URL answers, so a test run starts when its server is ready rather than after a fixed sleep.
// Usage: node scripts/wait-for-url.mjs <url> [timeout seconds, 300 by default]
const [url, timeoutSeconds = '300'] = process.argv.slice(2);
const deadline = Date.now() + Number(timeoutSeconds) * 1000;

while (true) {
  try {
    const response = await fetch(url);
    if (response.status < 500) process.exit(0);
  } catch {
    // not listening yet
  }
  if (Date.now() > deadline) {
    console.error(`${url} did not answer within ${timeoutSeconds}s`);
    process.exit(1);
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
