<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end Framework for Next.js App Router</strong>
  <br />
  <em>One codebase → type-safe clients, OpenAPI, and AI tools</em>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## vovk-python [![npm version](https://badge.fury.io/js/vovk-python.svg)](https://www.npmjs.com/package/vovk-python)

The templates that generate a typed [Python client](https://vovk.dev/python) from a Vovk.ts schema: a package with `TypedDict` types for every body, query, params and output, client-side validation with `jsonschema`, and a README. The generated package needs Python 3.9+.

> The Python client is experimental.

## Install

In the Vovk.ts app, next to [vovk-cli](https://www.npmjs.com/package/vovk-cli):

```sh
npm install vovk-python --save-dev
```

## Generate

```sh
npx vovk generate --from py --out ./python_package
```

The Python client calls an absolute URL, so give it the server's origin in `vovk.config.mjs`. To generate it with every `vovk dev` and `vovk generate`, add the `py` template to the composed client:

```js
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    fromTemplates: ['ts', 'py'], // keeps the default "ts" template
  },
  clientTemplateDefs: {
    py: {
      extends: 'py',
      outputConfig: { origin: 'https://example.com' },
    },
  },
};

export default config;
```

The package name comes from `package.json` (`@acme/web-app` becomes `acme_web_app`); `outputConfig.package.py_name` sets another one. The `pySrc` template writes plain source files to add to another Python project instead.

## Use

For a controller registered as `UserRPC` with an `updateUser` procedure:

```py
from vovk_hello_world import UserRPC

user = UserRPC.update_user(
    params={"id": "123e4567-e89b-12d3-a456-426614174000"},
    body={"email": "john@example.com", "profile": {"name": "John Doe", "age": 25}},
    query={"notify": "email"},
)
```

Each RPC method takes `body`, `query` and `params` as the schema declares them, plus `headers`, `api_root` and `disable_client_validation`. A status of 400 or above raises `HttpException`; input that fails client-side validation raises jsonschema's `ValidationError` before the request.

## Publish

```sh
python3 -m build ./python_package --wheel --sdist && python3 -m twine upload ./python_package/dist/*
```

## Docs

- [Python client](https://vovk.dev/python)
- [Client templates](https://vovk.dev/templates), [vovk generate](https://vovk.dev/generate), [Config](https://vovk.dev/config)
