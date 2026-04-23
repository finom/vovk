---
name: mixins
description: Knowledge base for Vovk.ts OpenAPI mixins — importing third-party OpenAPI 3.x schemas as client modules that share the same call signature as native Vovk RPC modules. Use whenever the user asks to "call a third-party API from my Vovk app", "use Stripe / GitHub / Petstore from the client", "mixin an OpenAPI schema", "import an OpenAPI spec as a client", "wrap an external API", "give an LLM access to a public REST API", or similar. Mixin modules work in `vovk-client` imports and `deriveTools` identically to native modules. Does NOT cover writing your own procedures → hand off to `procedure` skill. Does NOT cover the RPC client call shape → hand off to `rpc` skill. Does NOT cover AI tool derivation — but `deriveTools` accepts mixin modules identically, covered in `tools` skill.
---

# Vovk.ts OpenAPI mixins

Mixins turn a third-party OpenAPI 3.x spec into a typed client module. The result plugs into everything that already consumes RPC modules — `vovk-client` imports, `deriveTools`, type inference helpers.

**Why:** unify external APIs under one calling convention. Instead of learning Stripe's SDK, GitHub's Octokit, and a custom fetch wrapper for some vendor, you import them all from `vovk-client` with the same `{ params, query, body }` signature.

## Scope

Covers:

- Declaring mixins in `vovk.config.mjs`.
- Where the OpenAPI source comes from (URL / local file / inline).
- How mixin modules surface in `vovk-client`.
- Using mixin modules with `deriveTools`.

Out of scope:

- Authoring your own procedures → **`procedure` skill**.
- RPC client call shape, `customFetcher`, `apiRoot` → **`rpc` skill**.
- AI tool derivation details → **`tools` skill**.
- Authoring OpenAPI specs by hand — this skill consumes them, doesn't produce them.

## Declaring a mixin

Mixins live in `vovk.config.mjs` under `outputConfig.mixins`. Each key becomes the client module name:

```ts
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    mixins: {
      PetstoreAPI: {
        // source + options
      },
      StripeAPI: {
        // source + options
      },
    },
  },
};
export default config;
```

## Source types

OpenAPI 3.x specs come from three sources. Exact field names may vary by Vovk version — check the running project's existing mixin config if present, and consult the Vovk docs for the authoritative shape.

**URL-based** — remote spec fetched at generate time:

```ts
mixins: {
  PetstoreAPI: {
    source: 'https://petstore3.swagger.io/api/v3/openapi.json',
  },
}
```

**Local file** — spec checked into the repo:

```ts
mixins: {
  InternalAPI: {
    source: './openapi/internal.json',
  },
}
```

**Inline object** — spec imported as a JS value:

```ts
import spec from './openapi/internal.json' with { type: 'json' };

const config = {
  outputConfig: {
    mixins: {
      InternalAPI: { source: spec },
    },
  },
};
```

Trade-offs:

- **URL**: always current, requires network at generate time.
- **File**: reproducible, explicit update path.
- **Inline**: works when the spec is built/transformed elsewhere in the project.

## Using the mixin

After `npx vovk generate`, the mixin becomes a normal client module:

```ts
import { PetstoreAPI } from 'vovk-client';

const pet = await PetstoreAPI.getPetById({ params: { petId: 1 } });
```

Same signature as a native RPC module. Type inference (`VovkInput`, `VovkOutput`) works:

```ts
import type { VovkOutput } from 'vovk';
type Pet = VovkOutput<typeof PetstoreAPI.getPetById>;
```

Error handling mirrors native modules — HTTP errors surface as thrown exceptions.

## Base URL and auth

Third-party APIs rarely live at the same origin as your Next.js app. Configure per-mixin `apiRoot` via the mixin config, or pass it on each call:

```ts
await PetstoreAPI.getPetById({
  apiRoot: 'https://petstore3.swagger.io/api/v3',
  params: { petId: 1 },
});
```

For auth headers (API keys, bearer tokens), use a `customFetcher` (see `rpc` skill) or a per-mixin fetch override if the config supports it. Keep secrets server-side — don't embed them in a client bundle that ships to browsers.

## With `deriveTools`

Mixin modules feed `deriveTools` identically to native modules:

```ts
import { deriveTools } from 'vovk';
import { TaskRPC, PetstoreAPI, StripeAPI } from 'vovk-client';

const { tools } = deriveTools({
  modules: { TaskRPC, PetstoreAPI, StripeAPI },
});
```

The mixin's OpenAPI `operationId`, `summary`, and `description` populate the derived tool's fields — so the LLM gets a usable description straight from the third-party spec. See `tools` skill for the full pipeline.

## Flows

### "Let the LLM call the Petstore API"

1. Add Petstore OpenAPI as a mixin in `vovk.config.mjs`.
2. `npx vovk generate`.
3. `deriveTools({ modules: { PetstoreAPI } })`.
4. Feed to the chat loop. See `tools` skill.

### "Wrap an internal REST service we don't own"

1. Get the service's OpenAPI spec (export it, host it, or pin a snapshot).
2. Configure as a mixin with `apiRoot` pointing at the service.
3. Set up a `customFetcher` for auth headers if needed.

### "My mixin spec is out of date"

If sourced via URL: re-run `vovk generate`. If via file: update the file, regenerate. Watch for breaking changes — shape drift shows up as TypeScript errors at call sites.

### "Combine a native RPC call and a mixin in one flow"

Both are just `vovk-client` imports:

```ts
import { UserRPC, StripeAPI } from 'vovk-client';

const user = await UserRPC.getUser({ params: { id } });
const charge = await StripeAPI.createCharge({
  body: { amount: 500, customer: user.stripeCustomerId },
});
```

## Gotchas

- **Spec quality matters**: a sloppy third-party OpenAPI produces a sloppy mixin. Unknown types become `unknown`, missing operation IDs produce auto-generated names, unspecified servers require passing `apiRoot` at call time.
- **CORS**: calling a third-party API directly from the browser often fails CORS. Route through your own segment, or add a `customFetcher` that hits a proxy you control.
- **Auth secrets**: never embed API keys in client bundles. For browser-callable third-party APIs, proxy through a server segment.
- **Regenerate after any config change**: mixin changes in `vovk.config.mjs` require `npx vovk generate`. `vovk dev` handles this in dev mode.
- **Exact mixin config shape is Vovk-version-specific**. Consult current docs if a field name above doesn't work in the target project; the concepts (source, apiRoot, per-mixin fetch) are stable even if the keys shift.
