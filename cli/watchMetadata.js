const { watch } = require('node:fs/promises');
const path = require('path');
const generateClient = require('./generateClient');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;

async function watchMetadata() {
  const jsonWatcher = watch(path.join(__dirname, '../../.vovk/vovk-metadata.json'));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const _event of jsonWatcher) {
    await generateClient(argv.rc, argv.output);
    console.info(' 🐺 Client generated');
  }
}

void watchMetadata();
