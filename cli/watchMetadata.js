const { watch } = require('node:fs/promises');
const path = require('path');
const fs = require('fs/promises');
const generateClient = require('./generateClient');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;

async function watchMetadata() {
  const exists = await fs
    .access(path.join(__dirname, '../../.vovk/vovk-metadata.json'))
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    await fs.mkdir(path.join(__dirname, '../../.vovk'), { recursive: true });
    await fs.writeFile(path.join(__dirname, '../../.vovk/vovk-metadata.json'), '{}');
  }

  const jsonWatcher = watch(path.join(__dirname, '../../.vovk/vovk-metadata.json'));

  await generateClient(argv.rc, argv.output);
  console.info(' 🐺 Client generated');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const _event of jsonWatcher) {
    await generateClient(argv.rc, argv.output);
    console.info(' 🐺 Client generated');
  }
}

void watchMetadata();
