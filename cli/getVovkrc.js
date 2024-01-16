// @ts-check
const fs = require('fs');

let vovkRcRef = null;

function getVovkrc(rcPath) {
  if (vovkRcRef) {
    return vovkRcRef;
  }

  /** @type {import('../src').VovkRc} */
  const vovkRc = {
    route: 'src/app/api/[[...]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    streamFetcher: 'vovk/client/defaultStreamFetcher',
    prefix: '/api',
    // validateOnClient: 'vovk-zod/validateOnClient',
  };
  if (fs.existsSync(rcPath)) {
    Object.assign(vovkRc, require(rcPath));
  } else {
    console.info(` 🐺 No .vovkrc.js file found in ${process.cwd()}`);
  }

  vovkRcRef = vovkRc;

  return vovkRc;
}

module.exports = getVovkrc;
