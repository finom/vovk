# Contributing

## Setup

Node 24.15 or newer. The Python and Rust client tests also need Python 3.9+ and Rust 1.85+.

```sh
npm ci
npm ci --prefix test
npm run build
```

## Before a pull request

The gate CI runs on a pull request:

```sh
npm run test:main
```

It generates the test app's client, runs the lint, the type checks, the unit tests of `vovk` and `vovk-ajv`, and the integration tests against the test app's dev server. `npm run test:packages` runs only the unit tests, with no server. `npm test` runs everything, the CLI specs and the Python and Rust suites included.

A change in behavior comes with a test. Lint warnings fail the gate.

## Releases

Releases go through tags, and only the maintainer cuts them. Each package's `CHANGELOG.md` is the record of its changes.

## Security

Do not open an issue for a vulnerability. See [SECURITY.md](./SECURITY.md).
