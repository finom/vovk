# Security Policy

## Reporting

Use GitHub's private vulnerability reporting on this repository: [Report a vulnerability](https://github.com/finom/vovk/security/advisories/new). Do not open a public issue. Include the package (for example `vovk` or `vovk-cli`), its version, and a minimal reproduction: a controller and the request that triggers the problem, or the schema or OpenAPI document that makes the CLI misbehave.

## Scope

In scope: the request handling of `vovk` (routing, query, body and form parsing, validation, error responses, JSON Lines), the generated clients (TypeScript, Python, Rust), code generation in `vovk-cli` (a schema or an OpenAPI document that makes generated code do something it shouldn't), and `vovk-ajv`.

Out of scope: authorization, which is your application's (handlers and decorators), and Next.js itself.

## Terms

Fixes ship in the latest version of each package — no backports. The software is provided **as is**, without warranty of any kind, per the [MIT license](./LICENSE).
