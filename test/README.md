# Vovk.ts library tests

This is a Next.js/Vovk.ts project that contains tests for core `vovk` features, implemented with `node:assert` and `node:test`. They run against its dev server. You can run them with `npm run build && npm run test:main` from the root of this repository.

Tests that need no server live in their packages: `packages/vovk/test/unit` and `packages/vovk-ajv/test`. Run them with `npm run test:packages` from the root, after a build.

Other tests, such as for `vovk-cli`, `vovk-python` and `vovk-rust` are located in their respective packages and can be run with `npm t` inside each package folder. In order to run all tests use `npm t` from the root of this repository.
