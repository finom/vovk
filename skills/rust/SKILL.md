---
name: rust
description: The Vovk.ts Rust client — generating a typed Rust crate from a Vovk API with `vovk-rust`, the `rs` / `rsSrc` templates, the generated async call shape using `reqwest` + `serde`, JSON + JSON Lines (futures Stream) consumption, client-side validation, and crates.io publishing. Use whenever the user wants a typed Rust SDK, ongoing Rust integration, or crates.io publishing — phrasings like "generate a Rust crate / SDK", "ship a Rust SDK for my API", "use vovk-rust", "rsSrc template", "rust streaming with reqwest", "publish to crates.io". Does NOT cover controller / procedure authoring → hand off to `procedure` skill. Does NOT cover `vovk bundle` in general → hand off to `bundle` skill. Does NOT cover JSON Lines server-side → hand off to `jsonlines` skill. **Does NOT cover one-off HTTP calls** — Vovk endpoints are plain REST, so `reqwest` / `ureq` / `curl` against `/api/...` is the simpler answer for "I just want to hit my API from a Rust binary / CLI" use cases. Reach for this skill only when the user actually wants generated typed crate code.
---

# Vovk.ts Rust client

`vovk-rust` generates typed Rust crate from same `.vovk-schema/` artifacts driving TS client. Async by default via `reqwest` + `tokio`; streaming via `futures`.

## Install + generate

```bash
npm i -D vovk-rust
```

### Standalone crate

Canonical output dir `./dist_rust` (hello-world convention):

```bash
npx vovk generate --from rs --out ./dist_rust
```

Output:

```
dist_rust/
  src/http_request.rs       # HTTP handling
  src/lib.rs                # RPC functions + types
  src/read_full_schema.rs   # Schema utilities
  src/schema.json           # Vovk schema (compiled into the crate with include_str!)
  Cargo.toml                # edition = "2021"
  README.md
```

### Embedded source

```bash
npx vovk generate --from rsSrc --out ./rust_src
```

## Auto-generate with composed client

```ts
// vovk.config.mjs
const config = {
  composedClient: {
    fromTemplates: ['ts', 'rs'],
  },
};
export default config;
```

**Bake prod API URL** via `clientTemplateDefs.rs.outputConfig.origin` — generated crate uses this by default. Required: crate sends calls to an absolute URL, so without an origin every call needs `api_root`, and `vovk generate` warns. Pattern from hello-world:

```ts
// vovk.config.js
const PROD_ORIGIN = 'https://hello-world.vovk.dev';

const config = {
  composedClient: { fromTemplates: ['ts', 'rs'] },
  clientTemplateDefs: {
    rs: {
      extends: 'rs',
      outputConfig: { origin: PROD_ORIGIN },
      // composedClient: { outDir: './my_other_dir' }, // optional — defaults to ./dist_rust
    },
  },
};
```

Consumers can still override per call via `api_root` arg.

## Generated call shape

Every RPC function async, takes positional args: `body`, `query`, `params`, `headers?`, `api_root?`, `disable_client_validation`.

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

**Per-endpoint type variation**: each of `query`, `params` typed `<handler_name>_::query` / `_::params` **only when procedure declares validation for that key**; else slot is Rust unit type `()` → pass `()` at call site. `body` has three cases: `multipart/form-data` content-type → `reqwest::multipart::Form`; declared body validation (JSON / urlencoded form / text / binary) → `<handler>_::body`, which is `String` for a text type and `Vec<u8>` for a binary one; no body → `()`. A urlencoded form goes out with `.form()`, a text or binary body with the content type the procedure declares. So endpoint with no body/query/params signature:

```rust
pub async fn ping(
    body: (), query: (), params: (),
    headers: Option<&HashMap<String, String>>,
    api_root: Option<&str>,
    disable_client_validation: bool,
) -> Result<serde_json::Value, HttpException>
```

**Method names** lodash `snakeCase(handlerName)` — `getUser` → `get_user`, `findPetsByStatus` → `find_pets_by_status`, `UserRPC` (module) → `user_rpc`. Types of `update_user` live in module `update_user_`. Names alike in snake_case (`getUserByID`, `getUserById`) get the first free suffix, per module in schema order: `get_user_by_id`, `get_user_by_id_2`. `http_request` and `http_request_stream` count as taken (the module imports them).

**Nested types** use `_::` module syntax. `body.profile` typed `update_user_::body_::profile`. How generator flattens deep JSON Schema into Rust modules.

### Usage

```rust
use my_api_client::user_rpc;

pub async fn run() -> Result<(), Box<dyn std::error::Error>> {
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

    Ok(())
}
```

Method names Rust-side snake_case; `user_rpc` module reflects `UserRPC` controller. Module path (`my_api_client` above) depends on crate name set at generation time.

## JSON Lines streaming

Streaming endpoints (those with an `iteration` schema) return pinned boxed `Stream`:

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
use my_api_client::stream_rpc;

pub async fn consume_stream() -> Result<(), Box<dyn std::error::Error>> {
    let mut stream = stream_rpc::stream_tokens((), (), (), None, None, false).await?;
    while let Some(item) = stream.next().await {
        let val = item.expect("stream item should be Ok");
        println!("{}", val.message);
    }
    Ok(())
}
```

Without an `iteration` schema the call is not a stream: it reads the whole response and returns the items as a JSON array.

See `jsonlines` skill for server side.

## Dependencies pulled in

Generated `Cargo.toml` brings (per hello-world):

```toml
[dependencies]
futures-util  = "0.3"
urlencoding   = "2.1"
once_cell     = "1.17"

[dependencies.serde]
version  = "1.0.164"
features = ["derive"]

[dependencies.serde_json]
version  = "1.0.143"
features = ["preserve_order"]

[dependencies.jsonschema]
version          = "0.57"
default-features = false

[dependencies.reqwest]
version  = "0.12"
features = ["json", "multipart", "stream"]

[dependencies.tokio]
version  = "1.49"
features = ["macros", "rt-multi-thread", "io-util"]

[dependencies.tokio-util]
version  = "0.7"
features = ["codec"]
```

- **`reqwest 0.12`** — async HTTP, with `multipart` and `stream` features for file uploads + JSON Lines.
- **`tokio 1`** — async runtime. Generated crate assumes multi-thread runtime available; consumers pull transitively but typically add directly with `#[tokio::main]` for binaries.
- **`tokio-util` (`codec`)** — line-delimited framing for JSON Lines decoding.
- **`serde` (`derive`) + `serde_json` (`preserve_order`)** — (de)serialization; object fields go out in the order the type declares them, as the TS client sends them.
- **`futures-util`** — streaming combinators (`StreamExt::next` etc).
- **`jsonschema 0.57`** — client-side validation against `schema.json`: JSON Schema 2020-12 (draft 7 when a schema declares it), formats checked. Crate needs Rust 1.85+ (`rust-version = "1.85"`, resolver 3); a consumer on edition 2021 without `resolver = "3"` gets newer deps that need Rust 1.88.
- **`urlencoding`** + **`once_cell`** — internal utilities.

## Auth + base URL

Pass `api_root` per call to override baked-in URL. Pass `&HashMap<String, String>` of headers for auth (Bearer token, API key, whatever upstream needs):

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

**Don't bake secrets into crate.** Consumers supply auth at call time.

## Client-side validation

Runs by default. Last positional arg disables:

```rust
user_rpc::update_user(body, query, params, None, None, true /* disable */).await?;
```

Skip for hot paths; keep on for safety in app code.

## Publishing to crates.io

Canonical script from hello-world — note `--allow-dirty`, needed since generated crate is uncommitted build artifact:

```bash
cargo publish --manifest-path dist_rust/Cargo.toml --allow-dirty
```

Wire into release flow alongside npm bundle + Python package (hello-world chains all three under `postversion`):

```json
"scripts": {
  "publish:node":   "npm publish ./dist",
  "publish:rust":   "cargo publish --manifest-path dist_rust/Cargo.toml --allow-dirty",
  "publish:python": "python3 -m build ./dist_python --wheel --sdist && python3 -m twine upload ./dist_python/dist/*",
  "postversion":    "vovk generate && vovk bundle && npm run publish:node && npm run publish:rust && npm run publish:python"
}
```

Crate name / version flow from root `package.json` (generator copies fields into generated `Cargo.toml`). Hello-world example crate `vovk_hello_world` (underscored, since hyphens crates.io-discouraged).

## Flows

### "Call my Vovk API from a Rust service"

1. `npm i -D vovk-rust`.
2. Add `'rs'` to `composedClient.fromTemplates`.
3. `npx vovk generate`.
4. Add generated crate as path dependency in consumer's `Cargo.toml`.
5. `use my_api::user_rpc;` and call.

### "Ship a Rust SDK to crates.io"

1. `npx vovk generate --from rs --out ./rust_package`.
2. Set `version` (and `name`) in the root `package.json` first; to override them for the crate only, use `clientTemplateDefs.rs.outputConfig.package`.
3. `package.json` (or `outputConfig.package`) needs `description` and `license`: crates.io refuses a crate without them.
4. `cargo publish --manifest-path rust_package/Cargo.toml --allow-dirty` (the generated crate isn't committed).

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
npx vovk generate --from rsSrc --out ../my_app/src/api
```

The files' root is `lib.rs`, not `mod.rs`, so a plain `pub mod api;` fails (E0583). Point the module at it in `src/lib.rs` or `src/main.rs`:

```rust
#[path = "api/lib.rs"]
pub mod api;
```

A private `mod api;` (in `main.rs`) also needs `#[allow(dead_code, unused_imports)]`: the procedures the app doesn't call are dead code.

Then `api::user_rpc::update_user(...)`, `api::set_client_factory(...)`, `api::reqwest`. The host crate needs the dependencies the generated `Cargo.toml` lists (see "Dependencies pulled in"):

```bash
cargo add serde@1.0.164 --features derive
cargo add serde_json@1.0.143 --features preserve_order
cargo add reqwest@0.12 --features json,multipart,stream
cargo add tokio@1.49 --features macros,rt-multi-thread,io-util
cargo add tokio-util@0.7 --features codec
cargo add jsonschema@0.57 --no-default-features
cargo add futures-util@0.3 urlencoding@2.1 once_cell@1.17
```

Schema descriptions are doc comments whose code blocks are text, so the host crate's `cargo test` (doctests included) builds them.

## Gotchas

- **Nested types deep.** `body_::profile_::address_::zip` patterns common. `use ... as Name;` import trick keeps call sites readable.
- **OpenAPI mixins with circular `$refs` not fully supported yet** — if mixin has cycles, generator may fail. Roadmap.
- **`text/plain` and `application/octet-stream` body params not fully supported** — JSON is solid path today.
- **Named schemas in `components/schemas` don't yet produce importable shared types** — roadmap. Every call site gets own scoped types.
- **Streaming needs `futures::StreamExt`** — forget import → `.next()` won't compile.
- **Multipart file names** without `"`, `\`, or line breaks — reqwest escapes them with a backslash, server keeps it in the name; a `"` makes the form unreadable. Field names go out as written.
- **Regen on schema changes.** CI should regen as part of build, same as TS/Python.
- **Don't hand-edit generated files.** Put shared utilities alongside, not inside, generated crate.
