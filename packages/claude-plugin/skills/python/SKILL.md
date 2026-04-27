---
name: python
description: The Vovk.ts Python client — generating a typed Python package from a Vovk API with `vovk-python`, the `py` / `pySrc` templates, `TypedDict` shapes, JSON + JSON Lines consumption, client-side validation, and PyPI publishing. Use whenever the user wants a typed Python SDK, ongoing Python integration, or PyPI publishing — phrasings like "generate a Python client / SDK", "ship a Python package for my API", "use vovk-python", "pySrc template", "python client streaming", "publish to PyPI". Experimental package — shape may shift. Does NOT cover controller / procedure authoring → hand off to `procedure` skill. Does NOT cover `vovk bundle` in general → hand off to `bundle` skill. Does NOT cover JSON Lines server-side → hand off to `jsonlines` skill. **Does NOT cover one-off HTTP calls** — Vovk endpoints are plain REST, so a `curl`, `httpx`, or `requests` call against `/api/...` is the simpler answer for "I just want to hit my API from a Python script / CLI / shell" use cases. Reach for this skill only when the user actually wants generated typed client code.
---

# Vovk.ts Python client

`vovk-python` generates typed Python package from same `.vovk-schema/` artifacts driving TS client. One source of truth, multi-language.

**Experimental** — generated API may shift between Vovk versions. Pin version on consume.

## Scope

Covers:

- Install `vovk-python` + generate Python package.
- Templates: `py` (standalone) vs `pySrc` (source files to embed).
- Auto-gen config in `vovk.config.mjs`.
- Call shape (`TypedDict` per `[MethodName][Input|Output|Body|Query|Params]`).
- JSON Lines streaming via Python generators.
- Client-side validation toggle.
- PyPI publishing flow.

Out of scope:

- Procedure / controller authoring → **`procedure` skill**.
- `vovk bundle` general (TS, Rust) → **`bundle` skill**.
- Server-side JSON Lines → **`jsonlines` skill**.
- OpenAPI spec tuning → **`openapi` skill**.

## Install + generate

```bash
npm i -D vovk-python
```

### Standalone package

Emits complete Python package (PyPI-ready). Canonical output dir `./dist_python` (hello-world convention):

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
  setup.cfg
  README.md
```

### Embedded source

Emits `.py` files only — drop into existing Python project:

```bash
npx vovk generate --from pySrc --out ./python_src
```

## Auto-generate with composed client

Wire Python into `vovk generate` → runs alongside TS:

```ts
// vovk.config.mjs
const config = {
  composedClient: {
    fromTemplates: ['js', 'py'],
  },
};
export default config;
```

**Bake prod API URL** via `clientTemplateDefs.py.outputConfig.origin` — generated client uses this by default. Pattern from hello-world:

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

After this, every `npx vovk generate` (+ every `vovk dev` regen) refreshes Python client — `PROD_ORIGIN` baked in for consumers, overridable per-call via `api_root`.

## Generated call shape

Types follow `[PascalCaseMethodName][Body|Query|Params|Output]` as `TypedDict`. Methods static, snake_case. Positional arg order from generator (`packages/vovk-python/client-templates/pySrc/__init__.py.ejs:39-49`): only emits slots where validation declared, in this order: `body`, `files` (multipart only, sits between `body` and `query`), `query`, `params`, then always-present trailing kwargs `headers`, `api_root`, `disable_client_validation`.

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

Method names snake_case. Type names PascalCase.

### Multipart uploads via `files`

Procedures with `multipart/form-data` accept `files` kwarg — pass `Dict[str, Any]` matching `requests` upload format:

```python
with open("avatar.png", "rb") as f:
    response = UserRPC.upload_avatar(
        params={"id": user_id},
        files={"avatar": ("avatar.png", f, "image/png")},
    )
```

## JSON Lines streaming

Procedures with `iteration` schemas (server-side `async function*` handlers — see **`jsonlines`** skill) generate **sync Python generators** client-side. Return type `Generator[<MethodName>Iteration, None, None]`. Generator only emits slots for validation declared on procedure — for an iteration-only endpoint with no body / query / params, signature is just trailing kwargs:

```python
@staticmethod
def stream_tokens(
    headers: Optional[Dict[str, str]] = None,
    api_root: Optional[str] = None,
    disable_client_validation: bool = False,
) -> Generator[StreamTokensIteration, None, None]:
    ...
```

Add `body: StreamTokensBody`, `query: StreamTokensQuery`, `params: StreamTokensParams` to the signature only when the procedure declares validation for them (same rule as JSON endpoints).

Yielded items typed against procedure's `iteration` schema — `StreamTokensIteration` is `TypedDict` → editors autocomplete fields.

### Basic consumption

```python
from my_api_client import StreamRPC

for item in StreamRPC.stream_tokens():
    print(item["message"], end="", flush=True)
```

### Standard generator patterns

Sync generators support usual idioms:

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

Streaming endpoints accept same input shape as JSON:

```python
from my_api_client import ChatRPC

for token in ChatRPC.complete(
    body={"messages": [{"role": "user", "content": "hello"}]},
    query={"model": "gpt-4"},
):
    print(token["text"], end="", flush=True)
```

### Error handling

HTTP fail or iteration validation fail → generator raises on next `next()`. Wrap in `try/except` to recover:

```python
try:
    for item in StreamRPC.stream_tokens():
        handle(item)
except Exception as exc:
    log.error("stream failed mid-iteration: %s", exc)
```

### Sync, not async

Generator **sync** — backed by `requests`, no async API. For asyncio, run iteration in thread pool (`asyncio.to_thread` or `loop.run_in_executor`) or wrap each `next()` call. Native async streaming not in current Python client.

See **`jsonlines`** skill for server-side handler.

## Client-side validation

Validation runs against `schema.json` by default — same Zod/Valibot shapes server enforces, cross-compiled to JSON Schema.

Skip for hot paths or server-only enforcement:

```python
response = UserRPC.update_user(
    params=params, body=body, query=query,
    disable_client_validation=True,
)
```

## Dependencies pulled in

Generated `pyproject.toml` declares (per hello-world):

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
- `urllib3==1.26.15` — pinned to dodge `requests`/`urllib3` v2 compat issues.

Build backend **hatchling**, no runtime overhead past deps above.

## Auth + base URL

Generated client targets URL baked at generate time. Override per call via `api_root` kwarg — fully replaces baked-in value for that call. No module-level setter exists; the `client = ApiClient(...)` inside generated `__init__.py` is frozen at generate time. For dynamic auth, pass `headers` per call.

**Don't bake secrets into generated package.** Consumers supply API keys at runtime.

## PyPI publishing

Canonical script from hello-world (build wheel + sdist, upload via `twine`):

```bash
python3 -m build ./dist_python --wheel --sdist && python3 -m twine upload ./dist_python/dist/*
```

Both `python3 -m build` and `python3 -m twine` invoke modules directly — works with any Python env that has them installed (`pip install build twine`). Run `twine` with creds via `~/.pypirc` or `TWINE_USERNAME` / `TWINE_PASSWORD` env vars.

Wire into release flow alongside npm bundle + Rust crate (hello-world chains all three under `postversion`):

```json
"scripts": {
  "publish:node":   "npm publish ./dist",
  "publish:rust":   "cargo publish --manifest-path dist_rust/Cargo.toml --allow-dirty",
  "publish:python": "python3 -m build ./dist_python --wheel --sdist && python3 -m twine upload ./dist_python/dist/*",
  "postversion":    "vovk generate && vovk bundle && npm run publish:node && npm run publish:rust && npm run publish:python"
}
```

Version / package name flow from root `package.json` (generator copies whitelisted fields — `name`, `version`, `description`, `license`, `author`, `contributors`, `repository`, `homepage`, `bugs`, `keywords` — into generated `pyproject.toml`). Set `version` in root `package.json`, `npm version patch` propagates to all three targets.

**Name transform — pin before publishing.** Python package name = root `name` with hyphens → underscores (`my-api` → `my_api`). Same name used for filesystem path (`src/<name>/`), `pyproject.toml` `name`, `pip install` command in README. Two cases need explicit override:

- **Scoped packages** (`@org/foo`) — `@` and `/` not transformed → default yields invalid Python name. Set override below.
- **Different distribution name** than npm (e.g., npm `my-api`, PyPI `acme-client`).

Override via `clientTemplateDefs.py.outputConfig.package.name` (same field shape bundle skill documents):

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
4. `pip install -e ./dist_python` (or wherever generator wrote it).
5. `from vovk_hello_world import UserRPC` and call (editable install exposes the package directly — no `dist_python.src.` prefix).

### "Ship a Python SDK to PyPI"

1. `npx vovk generate --from py --out ./python_package`.
2. Set `info.title` + `info.version` in `vovk.config.mjs` before generating.
3. `python3 -m build && twine upload dist/*` from `python_package/`.

### "Consume a streaming endpoint from Python"

Server defines `procedure({ iteration })` with `async function*` handler (see `jsonlines`). Client iterates:

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

- **Experimental.** API shape not frozen — pin `vovk-python` version, expect breaks on upgrade. Integration-test after each bump.
- **`TypedDict`, not classes.** Generated shapes dict-based for JSON interop; treat as plain dicts with type hints, not Pydantic models.
- **Method names snake_case**, type names PascalCase. `updateUser` server → `update_user(...)` Python, `UpdateUserBody` etc.
- **Client-side validation uses `jsonschema`** — small import + runtime cost. Disable per-call for speed or server-only enforcement.
- **Base URL override is per-call only.** `api_root` kwarg overrides the URL baked at generate time. No module-level setter; the `ApiClient` instance is frozen.
- **Regen on schema changes.** Any procedure / schema change server-side needs `vovk generate` before Python client reflects. CI should regen as part of build.
- **Don't hand-edit generated files.** Put shared Python utilities alongside, not inside, generated package.
- **Body content types past JSON + multipart limited.** `text/plain` and `application/octet-stream` request bodies not fully supported yet (roadmap). For binary uploads, prefer multipart via `files` arg.
- **Mixins with circular `$refs` may fail to generate** — Python generator can't yet resolve cycles in third-party OpenAPI specs. Roadmap item.
- **Named schemas in `components/schemas` don't yet produce shared importable types.** Each call site gets own scoped `TypedDict` instead of single `UserSchema` reused across methods. Roadmap item — until fixed, expect duplicated type definitions.
