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

## vovk-rust [![npm version](https://badge.fury.io/js/vovk-rust.svg)](https://www.npmjs.com/package/vovk-rust)

The templates that generate a typed [Rust client](https://vovk.dev/rust) from a Vovk.ts schema: a crate with a module per controller, an `async fn` per procedure, structs for every body, query, params and output, client-side validation and a README. The crate uses [reqwest](https://docs.rs/reqwest) and needs Rust 1.85+.

## Install

In the Vovk.ts app, next to [vovk-cli](https://www.npmjs.com/package/vovk-cli):

```sh
npm install vovk-rust --save-dev
```

## Generate

```sh
npx vovk generate --from rs --out ./rust_package
```

The Rust client calls an absolute URL, so give it the server's origin in `vovk.config.mjs`. To generate it with every `vovk dev` and `vovk generate`, add the `rs` template to the composed client:

```js
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    fromTemplates: ['ts', 'rs'], // keeps the default "ts" template
  },
  clientTemplateDefs: {
    rs: {
      extends: 'rs',
      outputConfig: { origin: 'https://example.com' },
    },
  },
};

export default config;
```

The crate name comes from `package.json` (`@acme/web-app` becomes `acme_web_app`); `outputConfig.package.rs_name` sets another one. The `rsSrc` template writes plain source files to add to another Rust project instead.

## Use

`UserRPC.updateUser` becomes `user_rpc::update_user`, and its types live in `user_rpc::update_user_`. The functions are `async`; this sample runs them on [tokio](https://tokio.rs/):

```rs
use vovk_hello_world::user_rpc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    use user_rpc::update_user_::{body as Body, body_::profile as Profile, params as Params, query as Query, query_::notify as Notify};

    let user = user_rpc::update_user(
        Body {
            email: String::from("john@example.com"),
            profile: Profile { name: String::from("John Doe"), age: 25 },
        },
        Query { notify: Notify::email },
        Params { id: String::from("123e4567-e89b-12d3-a456-426614174000") },
        None,  // headers
        None,  // API root
        false, // disable client validation
    )
    .await?;

    println!("{:?}", user);
    Ok(())
}
```

## Publish

```sh
cargo publish --manifest-path rust_package/Cargo.toml
```

## Docs

- [Rust client](https://vovk.dev/rust)
- [Client templates](https://vovk.dev/templates), [vovk generate](https://vovk.dev/generate), [Config](https://vovk.dev/config)
