---
name: python
description: The Vovk.ts Python client — generating a typed Python package from a Vovk API with `vovk-python`, the `py` / `pySrc` templates, `TypedDict` shapes, JSON + JSON Lines consumption, client-side validation, and PyPI publishing. Use whenever the user wants a typed Python SDK, ongoing Python integration, or PyPI publishing — phrasings like "generate a Python client / SDK", "ship a Python package for my API", "use vovk-python", "pySrc template", "python client streaming", "publish to PyPI". Experimental package — shape may shift. Does NOT cover controller / procedure authoring → hand off to `procedure` skill. Does NOT cover `vovk bundle` in general → hand off to `bundle` skill. Does NOT cover JSON Lines server-side → hand off to `jsonlines` skill. **Does NOT cover one-off HTTP calls** — Vovk endpoints are plain REST, so a `curl`, `httpx`, or `requests` call against `/api/...` is the simpler answer for "I just want to hit my API from a Python script / CLI / shell" use cases. Reach for this skill only when the user actually wants generated typed client code.
---

# Vovk.ts Python client

`vovk-python` generates a typed Python package from the same `.vovk-schema/` artifacts that drive the TypeScript client. One source of truth, multiple languages.

**Experimental** — the generated API may change between Vovk versions. Pin the version when consuming.

## Scope

Covers:

- Installing `vovk-python` and generating a Python package.
- Templates: `py` (standalone package) vs `pySrc` (source files for embedding).
- Configuring automatic generation in `vovk.config.mjs`.
- Generated call shape (`TypedDict` per `[MethodName][Input|Output|Body|Query|Params]`).
- JSON Lines streaming via Python generators.
- Client-side validation toggle.
- PyPI publishing flow.

Out of scope:

- Procedure / controller authoring → **`procedure` skill**.
- `vovk bundle` in general (TS bundling, Rust bundling) → **`bundle` skill**.
- Server-side JSON Lines implementation → **`jsonlines` skill**.
- OpenAPI spec tuning → **`openapi` skill**.

## Install + generate

```bash
npm i -D vovk-python
```

### Standalone package

Emits a complete Python package (ready for PyPI). The canonical output dir is `./dist_python` (the convention used by the official hello-world example):

```bash
npx vovk generate --from py --out ./dist_python
```

Output:

```
dist_python/
  src/<package_name>/__init__.py    # RPC functions + TypedDict definitions
  src/<package_name>/api_client.py  # HTTP client
  src/<package_name>/py.typed       # Type-hint marker
  src/<package_name>/schema.json    # Generated schema
  pyproject.toml                    # hatchling build backend
  README.md
```

### Embedded source

Emits just the `.py` files — drop into an existing Python project:

```bash
npx vovk generate --from pySrc --out ./python_src
```

## Auto-generate with the composed client

Wire Python into `vovk generate` so it runs alongside TS:

```ts
// vovk.config.mjs
const config = {
  composedClient: {
    fromTemplates: ['js', 'py'],
  },
};
export default config;
```

**Bake in the production API URL** via `clientTemplateDefs.py.outputConfig.origin` — this is what the generated client uses by default. Pattern from the hello-world example:

```ts
// vovk.config.js
const PROD_ORIGIN = 'https://hello-world.vovk.dev';

const config = {
  composedClient: { fromTemplates: ['js', 'py'] },
  clientTemplateDefs: {
    py: {
      extends: 'py',
      outputConfig: { origin: PROD_ORIGIN },
      // composedClient: { outDir: './dist_python' }, // override output dir if needed
    },
  },
};
```

After this, every `npx vovk generate` (and every `vovk dev` regeneration) refreshes the Python client too — with `PROD_ORIGIN` baked in for consumers, and overridable per-call via `api_root`.

## Generated call shape

Types follow the convention `[PascalCaseMethodName][Body|Query|Params|Output]` as `TypedDict`. Methods are static, snake_case, with positional args in this order: `body, query, params, headers?, files?, api_root?, disable_client_validation`.

```python
from my_api_client import UserRPC  # whatever package the generator wrote

body: UserRPC.UpdateUserBody = {
    "email": "john@example.com",
    "profile": {"name": "John Doe", "age": 25},
}
query: UserRPC.UpdateUserQuery = {"notify": "email"}
params: UserRPC.UpdateUserParams = {
    "id": "123e4567-e89b-12d3-a456-426614174000",
}

# Keyword args work for clarity at call sites:
response = UserRPC.update_user(body=body, query=query, params=params)
```

Method names are snake_case. Type names are PascalCase.

### Multipart uploads via `files`

Procedures with `multipart/form-data` content type accept a `files` keyword arg — pass a `Dict[str, Any]` matching `requests`' file upload format:

```python
with open("avatar.png", "rb") as f:
    response = UserRPC.upload_avatar(
        params={"id": user_id},
        files={"avatar": ("avatar.png", f, "image/png")},
    )
```

## JSON Lines streaming

Procedures with `iteration` schemas (server-side `async function*` handlers — see **`jsonlines`** skill) generate **synchronous Python generators** on the client side. The return type is `Generator[<MethodName>Iteration, None, None]`:

```python
@staticmethod
def stream_tokens(
    body: StreamTokensBody = None,         # () unit type → None when procedure has no body
    query: StreamTokensQuery = None,
    params: StreamTokensParams = None,
    headers: Optional[Dict[str, str]] = None,
    files: Optional[Dict[str, Any]] = None,
    api_root: Optional[str] = None,
    disable_client_validation: bool = False,
) -> Generator[StreamTokensIteration, None, None]:
    ...
```

The yielded items are typed against the procedure's `iteration` schema — `StreamTokensIteration` is a `TypedDict`, so editors autocomplete its fields.

### Basic consumption

```python
from my_api_client import StreamRPC

for item in StreamRPC.stream_tokens():
    print(item["message"], end="", flush=True)
```

### Standard generator patterns

Sync generators support all the usual idioms:

```python
# Manual pull
stream = StreamRPC.stream_tokens()
first = next(stream)
second = next(stream)

# Collect into a list (drains the stream)
all_items = list(StreamRPC.stream_tokens())

# Comprehensions
messages = [item["message"] for item in StreamRPC.stream_tokens()]

# Early termination — break out of the for-loop
for item in StreamRPC.stream_tokens():
    if item["message"] == "STOP":
        break
    handle(item)
# The underlying HTTP connection closes when the generator goes out of scope.
```

### With body / query / params

Streaming endpoints accept the same input shape as JSON ones:

```python
from my_api_client import ChatRPC

for token in ChatRPC.complete(
    body={"messages": [{"role": "user", "content": "hello"}]},
    query={"model": "gpt-4"},
):
    print(token["text"], end="", flush=True)
```

### Error handling

If the underlying HTTP request fails or a line fails iteration validation, the generator raises on the next `next()` call. Wrap consumption in `try/except` if you need to recover gracefully:

```python
try:
    for item in StreamRPC.stream_tokens():
        handle(item)
except Exception as exc:
    log.error("stream failed mid-iteration: %s", exc)
```

### Sync, not async

The generator is **synchronous** — backed by `requests`, which doesn't expose an async API. For asyncio code, run the iteration in a thread pool (`asyncio.to_thread` or `loop.run_in_executor`) or wrap each `next()` call accordingly. Native async streaming isn't available in the current Python client.

See **`jsonlines`** skill for what the server-side handler looks like.

## Client-side validation

Validation runs against `schema.json` by default — same Zod/Valibot shapes the server enforces, cross-compiled to JSON Schema.

Skip it for hot paths or when you want only server-side enforcement:

```python
response = UserRPC.update_user(
    params=params, body=body, query=query,
    disable_client_validation=True,
)
```

## Dependencies pulled in

The generated `pyproject.toml` declares (per the hello-world example):

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
requires-python = ">=3.8"
dependencies = ["requests", "jsonschema", "rfc3987", "urllib3==1.26.15"]
```

- `requests` — HTTP client.
- `jsonschema` — client-side validation.
- `rfc3987` — URI/IRI validation (used by `jsonschema` format checkers).
- `urllib3==1.26.15` — pinned to avoid `requests`/`urllib3` v2 compatibility issues.

Build backend is **hatchling**, no runtime overhead beyond the deps above.

## Auth + base URL

The generated client targets a URL baked in at generate time. For production consumers, pass base URL / headers via the `api_client.py` hooks (inspect the generated file on the installed version — exact API surface is version-dependent and may expose a module-level setter, per-call kwargs, or both).

**Don't bake secrets into the generated package.** Consumers supply API keys at runtime.

## PyPI publishing

Canonical script from the hello-world example (build wheel + sdist, then upload via `twine`):

```bash
python3 -m build ./dist_python --wheel --sdist && python3 -m twine upload ./dist_python/dist/*
```

Both `python3 -m build` and `python3 -m twine` invoke the modules directly — works with whatever Python environment has them installed (`pip install build twine`). Run `twine` with credentials configured via `~/.pypirc` or `TWINE_USERNAME` / `TWINE_PASSWORD` env vars.

Wire it into your release flow alongside the npm bundle and Rust crate (the hello-world example chains all three under `postversion`):

```json
"scripts": {
  "publish:node":   "npm publish ./dist",
  "publish:rust":   "cargo publish --manifest-path dist_rust/Cargo.toml --allow-dirty",
  "publish:python": "python3 -m build ./dist_python --wheel --sdist && python3 -m twine upload ./dist_python/dist/*",
  "postversion":    "vovk generate && vovk bundle && npm run publish:node && npm run publish:rust && npm run publish:python"
}
```

Version / package name flow from the project root `package.json` (the generator copies whitelisted fields — `name`, `version`, `description`, `license`, `author`, `contributors`, `repository`, `homepage`, `bugs`, `keywords` — into the generated `pyproject.toml`). Set `version` in the root `package.json` and `npm version patch` propagates to all three targets.

**Name transform — pin this before publishing.** The Python package name is the root `name` with hyphens replaced by underscores (`my-api` → `my_api`). The same name is used for the filesystem path (`src/<name>/`), the `pyproject.toml` `name`, and the `pip install` command in the README. Two cases need an explicit override:

- **Scoped packages** (`@org/foo`) — `@` and `/` aren't transformed, so the default produces an invalid Python name. Set the override below.
- **You want a different distribution name** than the npm one (e.g., npm is `my-api`, PyPI is `acme-client`).

Override via `clientTemplateDefs.py.outputConfig.package.name` (same field shape the bundle skill documents):

```js
// vovk.config.mjs
const config = {
  composedClient: { fromTemplates: ['js', 'py'] },
  clientTemplateDefs: {
    py: {
      extends: 'py',
      outputConfig: {
        origin: 'https://api.example.com',
        package: { name: 'acme_client' }, // PyPI name + filesystem path
      },
    },
  },
};
```

## Flows

### "Call my Vovk API from a Python script"

1. `npm i -D vovk-python`.
2. Add `'py'` to `composedClient.fromTemplates` in `vovk.config.mjs`.
3. `npx vovk generate`.
4. `pip install -e ./dist_python` (or wherever the generator wrote it).
5. `from dist_python.src.vovk_hello_world import UserRPC` and call.

### "Ship a Python SDK to PyPI"

1. `npx vovk generate --from py --out ./python_package`.
2. Set `info.title` + `info.version` in `vovk.config.mjs` before generating.
3. `python3 -m build && twine upload dist/*` from `python_package/`.

### "Consume a streaming endpoint from Python"

Server defines `procedure({ iteration })` with an `async function*` handler (see `jsonlines`). Client iterates:

```python
for item in StreamRPC.stream_tokens():
    handle(item)
```

### "Embed the client into an existing Python project"

Use `pySrc`:

```bash
npx vovk generate --from pySrc --out ./my_project/vovk_client
```

Then import from `my_project.vovk_client...`.

## Gotchas

- **Experimental.** API shape is not frozen — pin `vovk-python` version and expect breaks on upgrade. Integration-test after every bump.
- **`TypedDict`, not classes.** Generated shapes are dict-based for JSON interop; treat them as plain dicts with type hints, not Pydantic models.
- **Method names are snake_case**, type names are PascalCase. `updateUser` on the server → `update_user(...)` in Python, with `UpdateUserBody` etc.
- **Client-side validation uses `jsonschema`** — small import + runtime cost. Disable per-call when you need speed or want server-only enforcement.
- **Base URL / auth indirection is version-dependent.** Read the generated `api_client.py` on the installed version rather than assuming a fixed surface.
- **Regenerate on schema changes.** Any procedure / schema change on the server requires `vovk generate` before the Python client reflects it. CI should regenerate as part of the build.
- **Don't hand-edit generated files.** Put shared Python utilities alongside, not inside, the generated package.
- **Body content types beyond JSON + multipart are limited.** `text/plain` and `application/octet-stream` request bodies aren't fully supported yet (roadmap). For binary uploads, prefer multipart via the `files` arg.
- **Mixins with circular `$refs` may fail to generate** — the Python generator can't yet resolve cycles in third-party OpenAPI specs. Roadmap item.
- **Named schemas in `components/schemas` don't yet produce shared importable types.** Each call site gets its own scoped `TypedDict` instead of a single `UserSchema` reused across methods. Roadmap item — until fixed, expect duplicated type definitions.
