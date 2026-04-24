---
name: rust
description: The Vovk.ts Rust client — generating a typed Rust crate from a Vovk API with `vovk-rust`, the `rs` / `rsSrc` templates, the generated async call shape using `reqwest` + `serde`, JSON + JSON Lines (futures Stream) consumption, client-side validation, and crates.io publishing. Use whenever the user asks to "call my Vovk API from Rust", "generate a Rust crate", "ship a Rust SDK for my API", "use vovk-rust", "rsSrc template", "rust streaming with reqwest", "publish to crates.io", or any variation. Experimental package — shape may shift. Does NOT cover controller / procedure authoring → hand off to `procedure` skill. Does NOT cover `vovk bundle` in general → hand off to `bundle` skill. Does NOT cover JSON Lines server-side → hand off to `jsonlines` skill.
---

# Vovk.ts Rust client

`vovk-rust` generates a typed Rust crate from the same `.vovk-schema/` artifacts that drive the TypeScript client. Async by default via `reqwest` + `tokio`; streaming via `futures`.

**Experimental** — the generated API may change between Vovk versions. Pin the crate version when consuming.

## Scope

Covers:

- Installing `vovk-rust` and generating a Rust crate.
- Templates: `rs` (standalone crate) vs `rsSrc` (source files for embedding).
- Configuring automatic generation in `vovk.config.mjs`.
- Generated async call shape and the nested-module `_::` type convention.
- JSON Lines streaming via `futures::Stream`.
- Client-side validation toggle.
- crates.io publishing flow.

Out of scope:

- Procedure / controller authoring → **`procedure` skill**.
- `vovk bundle` in general (TS bundling, Python bundling) → **`bundle` skill**.
- Server-side JSON Lines implementation → **`jsonlines` skill**.

## Install + generate

```bash
npm i -D vovk-rust
```

### Standalone crate

```bash
npx vovk generate --from rs --out ./rust_package
```

Output:

```
rust_package/
  src/http_request.rs       # HTTP handling
  src/lib.rs                # RPC functions + types
  src/read_full_schema.rs   # Schema utilities
  src/schema.json           # OpenAPI schema
  Cargo.toml
  README.md
```

### Embedded source

```bash
npx vovk generate --from rsSrc --out ./rust_src
```

## Auto-generate with the composed client

```ts
// vovk.config.mjs
const config = {
  composedClient: {
    fromTemplates: ['js', 'rs'],
  },
};
export default config;
```

Custom output directory:

```ts
const config = {
  clientTemplateDefs: {
    rs: {
      extends: 'rs',
      composedClient: {
        outDir: './my_dist_rust',
      },
    },
  },
};
```

## Generated call shape

Every RPC function is async and takes positional args in order: `body`, `query`, `params`, `headers?`, `api_root?`, `disable_client_validation`.

```rust
pub async fn update_user(
    body: update_user_::body,
    query: update_user_::query,
    params: update_user_::params,
    headers: Option<&HashMap<String, String>>,
    api_root: Option<&str>,
    disable_client_validation: bool,
) -> Result<update_user_::output, HttpException>
```

**Nested types** use `_::` module syntax. `body.profile` is typed as `update_user_::body_::profile`. This is how the generator flattens deep JSON Schema into Rust modules.

### Usage

```rust
use vovk_hello_world::user_rpc;

pub async fn main() {
    use user_rpc::update_user_::{
        body as Body,
        body_::profile as Profile,
        query as Query,
        query_::notify as Notify,
        params as Params,
    };

    let response = user_rpc::update_user(
        Body {
            email: String::from("john@example.com"),
            profile: Profile {
                name: String::from("John Doe"),
                age: 25,
            },
        },
        Query { notify: Notify::email },
        Params {
            id: String::from("123e4567-e89b-12d3-a456-426614174000"),
        },
        None,   // headers
        None,   // api_root — overrides baked-in URL
        false,  // disable_client_validation
    )
    .await?;
}
```

Method names on the Rust side are snake_case; the `user_rpc` module reflects the `UserRPC` controller.

## JSON Lines streaming

Streaming endpoints return a pinned boxed `Stream`:

```rust
pub async fn stream_tokens(
    body: (), query: (), params: (),
    headers: Option<&HashMap<String, String>>,
    api_root: Option<&str>,
    disable_client_validation: bool,
) -> Result<
    Pin<Box<dyn Stream<Item = Result<stream_tokens_::iteration, HttpException>> + Send>>,
    HttpException,
>
```

Consume with `futures::StreamExt`:

```rust
use futures::StreamExt;
use vovk_hello_world_local::open_api_rpc::stream_rpc;

pub async fn consume_stream() -> Result<(), Box<dyn std::error::Error>> {
    let mut stream = stream_rpc::stream_tokens((), (), (), None, None, false).await?;
    while let Some(item) = stream.next().await {
        let val = item.expect("stream item should be Ok");
        println!("{}", val.message);
    }
    Ok(())
}
```

See `jsonlines` skill for the server side.

## Dependencies pulled in

The generated `Cargo.toml` brings:

- **`reqwest`** — async HTTP.
- **`serde`** + `serde_json` — (de)serialization.
- **`jsonschema`** — client-side validation against `schema.json`.
- **`futures`** — streaming.

## Auth + base URL

Pass `api_root` per call to override the baked-in URL. Pass a `&HashMap<String, String>` of headers for auth (Bearer token, API key, whatever the upstream requires):

```rust
let mut headers = HashMap::new();
headers.insert("Authorization".into(), format!("Bearer {token}"));

let resp = user_rpc::get_user(
    (), (), Params { id },
    Some(&headers),
    Some("https://api.example.com"),
    false,
).await?;
```

**Don't bake secrets into the crate.** Consumers supply auth at call time.

## Client-side validation

Runs by default. Last positional arg disables it:

```rust
user_rpc::update_user(body, query, params, None, None, true /* disable */).await?;
```

Skip for hot paths; keep on for safety in application code.

## Publishing to crates.io

```bash
cargo publish --manifest-path rust_package/Cargo.toml
```

Crate name / version flow from the OpenAPI `info.title` + `info.version` (`vovk.config.mjs` → `outputConfig.openAPIObject.info`). Override in the template config when the OpenAPI title isn't a good crate name.

## Flows

### "Call my Vovk API from a Rust service"

1. `npm i -D vovk-rust`.
2. Add `'rs'` to `composedClient.fromTemplates`.
3. `npx vovk generate`.
4. Add the generated crate as a path dependency in the consumer's `Cargo.toml`.
5. `use my_api::user_rpc;` and call.

### "Ship a Rust SDK to crates.io"

1. `npx vovk generate --from rs --out ./rust_package`.
2. Set `info.title` + `info.version` in `vovk.config.mjs` first.
3. `cargo publish --manifest-path rust_package/Cargo.toml`.

### "Consume a streaming endpoint from Rust"

```rust
use futures::StreamExt;
let mut stream = chat_rpc::stream_tokens(body, (), (), None, None, false).await?;
while let Some(chunk) = stream.next().await {
    print!("{}", chunk?.message);
}
```

### "Embed the client into an existing Rust crate"

Use `rsSrc`:

```bash
npx vovk generate --from rsSrc --out ./src/api
```

Add the module to `src/lib.rs`: `pub mod api;`.

## Gotchas

- **Experimental.** Pin the crate version; expect breaks on Vovk upgrades. Integration-test after every bump.
- **Nested types are deep.** `body_::profile_::address_::zip` patterns are common. The `use ... as Name;` import trick keeps call sites readable.
- **OpenAPI mixins with circular `$refs` are not fully supported yet** — if your mixin has cycles, the generator may fail. Roadmap item.
- **`text/plain` and `application/octet-stream` body params are not fully supported** — JSON is the solid path today.
- **Named schemas in `components/schemas` don't yet produce importable shared types** — roadmap item. Every call site gets its own scoped types.
- **Streaming needs `futures::StreamExt`** — forget the import and `.next()` won't compile.
- **Regenerate on schema changes.** CI should regenerate as part of the build, same as for TS/Python.
- **Don't hand-edit generated files.** Put shared utilities alongside, not inside, the generated crate.
