---
name: python
description: The Vovk.ts Python client — generating a typed Python package from a Vovk API with `vovk-python`, the `py` / `pySrc` templates, `TypedDict` shapes, JSON + JSON Lines consumption, client-side validation, and PyPI publishing. Use whenever the user asks to "call my Vovk API from Python", "generate a Python SDK", "ship a Python package for my API", "use vovk-python", "pySrc template", "python client streaming", "publish to PyPI", or any variation. Experimental package — shape may shift. Does NOT cover controller / procedure authoring → hand off to `procedure` skill. Does NOT cover `vovk bundle` in general → hand off to `bundle` skill. Does NOT cover JSON Lines server-side → hand off to `jsonlines` skill.
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

Emits a complete Python package (ready for PyPI):

```bash
npx vovk generate --from py --out ./python_package
```

Output:

```
python_package/
  src/.../__init__.py          # RPC functions + TypedDict definitions
  src/.../api_client.py        # HTTP client
  src/.../py.typed             # Type-hint marker
  src/.../schema.json          # Generated schema
  pyproject.toml
  setup.cfg
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

Custom output directory per template:

```ts
const config = {
  clientTemplateDefs: {
    py: {
      extends: 'py',
      composedClient: {
        outDir: './my_dist_python',
      },
    },
  },
};
```

After this, every `npx vovk generate` (and every `vovk dev` regeneration) refreshes the Python client too.

## Generated call shape

Types follow the convention `[PascalCaseMethodName][Body|Query|Params|Output]` as `TypedDict`.

```python
from dist_python.src.vovk_hello_world import UserRPC

body: UserRPC.UpdateUserBody = {
    "email": "john@example.com",
    "profile": {"name": "John Doe", "age": 25},
}
query: UserRPC.UpdateUserQuery = {"notify": "email"}
params: UserRPC.UpdateUserParams = {
    "id": "123e4567-e89b-12d3-a456-426614174000",
}

response = UserRPC.update_user(params=params, body=body, query=query)
```

Method names are snake_case. Type names are PascalCase.

## JSON Lines streaming

Streaming endpoints return a Python **generator** — iterate with a `for` loop:

```python
from dist_python.src.vovk_hello_world import StreamRPC

stream_response = StreamRPC.stream_tokens()
for item in stream_response:
    print(item["message"], end="", flush=True)
```

See `jsonlines` skill for what a streaming endpoint looks like server-side.

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

The generated package declares:

- `requests` — HTTP.
- `jsonschema` — client-side validation.
- Standard library (`typing`, `json`).

Lightweight; no heavy runtime footprint.

## Auth + base URL

The generated client targets a URL baked in at generate time. For production consumers, pass base URL / headers via the `api_client.py` hooks (inspect the generated file on the installed version — exact API surface is version-dependent and may expose a module-level setter, per-call kwargs, or both).

**Don't bake secrets into the generated package.** Consumers supply API keys at runtime.

## PyPI publishing

Standard Python packaging:

```bash
cd python_package
python3 -m build
twine upload dist/*
```

Version / package name come from the OpenAPI `info.title` + `info.version` (`vovk.config.mjs` → `outputConfig.openAPIObject.info`). Override in the template config if the title isn't a good package name.

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
- **`TypedDict`, not classes.** The generated shapes are dict-based for interop with JSON; treat them as plain dicts with type hints, not Pydantic models.
- **Method names are snake_case**, type names are PascalCase. `updateUser` on the server → `update_user(...)` in Python, with `UpdateUserBody` etc.
- **Client-side validation uses `jsonschema`** — adds a small import + runtime cost. Disable per-call when you need speed or want server-only enforcement.
- **Base URL / auth indirection is version-dependent.** Read the generated `api_client.py` on the installed version rather than assuming a fixed surface.
- **Regenerate on schema changes.** Any procedure / schema change on the server requires `vovk generate` before the Python client reflects it. CI should regenerate as part of the build.
- **Don't hand-edit generated files.** Put shared Python utilities alongside, not inside, the generated package.
