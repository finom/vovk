/* eslint-disable */
const { execSync } = require('child_process');

execSync('rm -rf node_modules && npm i --legacy-peer-deps --no-package-lock --ignore-scripts', { cwd: __dirname });
// remove root dependencies to avoid usage of them
// execSync('rm -rf ../node_modules', { cwd: __dirname });

const expect = require('expect.js');

const {
  createDecorator, createSegment
} = require('next-smoothie');

const {
  clientizeController
} = require('next-smoothie/client');

for (const f of [createDecorator, createSegment, clientizeController]) {
  expect(typeof f === 'function').to.be(true);
}

// return main dependencies back
execSync('npm i --legacy-peer-deps --prefix ..', { cwd: __dirname });
