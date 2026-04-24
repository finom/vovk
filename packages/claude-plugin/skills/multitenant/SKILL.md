---
name: multitenant
description: Knowledge base for multi-tenant / multitenancy patterns in Vovk.ts — hosting multiple tenants from one Next.js app via subdomain routing. Covers the `multitenant()` helper from `vovk`, the Next.js `proxy.ts` file that wires it up, the `overrides` shape (static / dynamic / nested subdomain patterns), the `vovk.config.mjs` changes needed (switch to segmented client, `segmentNameOverride`), per-tenant frontend page routes, wildcard DNS, and local `/etc/hosts` setup. Triggers on phrasings like "multi-tenant", "multitenancy", "per-tenant API", "per-tenant frontend", "host `admin.example.com`", "serve per subdomain", "tenant per customer", "wildcard subdomains", "route subdomain to segment". Does NOT cover creating or configuring an individual segment — hand off to the `segment` skill. Does NOT cover writing controllers inside a tenant segment — hand off to the `procedure` skill. Does NOT cover composed-vs-segmented client specifics beyond the flip — hand off to the `rpc` skill.
---

# Vovk.ts multi-tenant routing

Host multiple tenants from one Next.js app by giving each tenant its own **named segment** on the backend, its own **frontend page route** on the frontend, and wiring both up with a subdomain-aware **proxy** that calls `multitenant()` from `vovk`.

Typical shape:

- `example.com/` → root tenant (marketing home, or a tenant picker).
- `admin.example.com/` → admin tenant — internal backend + UI.
- `customer.example.com/` → customer-facing portal (signup, landing, etc.).
- `<customer>.customer.example.com/` → per-customer instance.
- `pro.<customer>.customer.example.com/` → per-customer pro tier.

The exact shape is yours to pick; this skill shows the wiring for any shape.

## Scope of this skill

Covers:

- The multi-tenant architecture (segments + proxy + frontend pages).
- `vovk.config.mjs` changes (composed → segmented client, `segmentNameOverride`).
- `proxy.ts` wiring with the `multitenant()` helper from `vovk`.
- `overrides` shape (static, dynamic, nested) and reserved-path guard.
- Per-tenant frontend page routes and how they pair with overrides.
- DNS wildcard + local `/etc/hosts` setup.
- Add-a-tenant checklist.

Out of scope (hand off):

- Creating or configuring an individual segment (`initSegment()`, `segmentName`, nested segments, segment priority) → **`segment` skill**.
- Writing controllers inside a tenant segment → **`procedure` skill**.
- Client generation modes (composed vs. segmented, `outDir`, templates) → **`rpc` skill**.

## Architecture

Three layers, one request:

1. **Proxy (`src/proxy.ts`)** — intercepts every request, calls `multitenant()` with the incoming URL, host, and your `overrides` map, and gets back `{ action, destination }`. Branches into `NextResponse.rewrite`, `NextResponse.redirect`, or a 404.
2. **Named segment per tenant** on the backend (`src/app/api/admin/[[...vovk]]/route.ts`, etc.). Each tenant's `api/*` calls land here after the proxy rewrite.
3. **Per-tenant frontend page routes** on the frontend (`src/app/admin/page.tsx`, etc.). Each tenant's non-api requests land here after the proxy rewrite.

The proxy **rewrites** — it does NOT redirect (except for the reserved-path guard, see below) — so `admin.example.com/` stays in the user's address bar while Next.js internally serves `src/app/admin/page.tsx`.

## 1. Create a segment per tenant

```bash
npx vovk new segment admin
npx vovk new segment customer
npx vovk new segment customer/pro
```

Controllers go in `src/modules/...` as usual. See the **`segment` skill** for segment shapes, `initSegment()`, and nested paths; see **`procedure`** for controller authoring.

## 2. Switch to segmented client and override segment names

In `vovk.config.mjs`:

```js
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: { enabled: false },
  segmentedClient: { enabled: true },
  outputConfig: {
    segments: {
      admin:          { segmentNameOverride: '' },
      customer:       { segmentNameOverride: '' },
      'customer/pro': { segmentNameOverride: '' },
    },
  },
};

export default config;
```

Why:

- `composedClient.enabled: false` + `segmentedClient.enabled: true` — switches from a single all-segments RPC bundle to one client per segment. Each tenant's frontend imports only the RPC it actually uses, keeping bundles lean.
- `segmentNameOverride: ''` per tenant — strips the segment-path prefix from the generated client's import path, so each tenant's frontend imports its RPC as if it were the root client. Without this, `admin`-tenant pages would have to import from a prefixed path.

See the **`rpc` skill** for the full segmented-client reference.

## 3. Wire the proxy

`src/proxy.ts` (or `proxy.ts` at the project root if `src/` is not used):

```ts
import { NextRequest, NextResponse } from 'next/server';
import { multitenant } from 'vovk';

export default function proxy(request: NextRequest) {
  const { action, destination } = multitenant({
    requestUrl: request.url,
    requestHost: request.headers.get('host') ?? '',
    targetHost: process.env.VERCEL ? 'example.com' : 'localhost:3000',
    overrides: {
      admin: [
        { from: 'api', to: 'api/admin' },
        { from: '',    to: 'admin' },
      ],
      customer: [
        { from: 'api', to: 'api/customer' },
        { from: '',    to: 'customer' },
      ],
      '[customer_name].customer': [
        { from: 'api', to: 'api/customer' },
        { from: '',    to: 'customer/[customer_name]' },
      ],
      'pro.[customer_name].customer': [
        { from: 'api', to: 'api/customer/pro' },
        { from: '',    to: 'customer/[customer_name]/pro' },
      ],
    },
  });

  if (action === 'rewrite' && destination) return NextResponse.rewrite(new URL(destination));
  if (action === 'redirect' && destination) return NextResponse.redirect(new URL(destination));
  if (action === 'notfound') return new NextResponse('Not Found', { status: 404 });
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!static|.*\\.png|.*\\.svg|.*\\.ico|.well-known|_next/image|_next/static).*)'],
};
```

`targetHost` is your root domain — branch on `process.env.VERCEL` (or your own flag) so local dev uses `localhost:3000` and prod uses the real hostname.

## 4. Per-tenant frontend pages

Each tenant override maps `from: ''` → `to: '<tenant>'`. Non-api requests to the tenant subdomain rewrite to `/<tenant>` internally, which Next.js serves from `src/app/<tenant>/page.tsx`.

File tree mirroring the proxy example above:

```
src/app/
  page.tsx                                    ← root tenant (example.com/)
  admin/page.tsx                              ← admin tenant (admin.example.com/)
  customer/page.tsx                           ← customer landing (customer.example.com/)
  customer/[customer_name]/page.tsx           ← per-customer instance (<name>.customer.example.com/)
  customer/[customer_name]/pro/page.tsx       ← per-customer pro (pro.<name>.customer.example.com/)
```

`[customer_name]` is a Next.js dynamic route segment. It's populated from the subdomain capture — `acme.customer.example.com` hits the `[customer_name].customer` override, which rewrites to `/customer/acme`, which Next.js renders from `src/app/customer/[customer_name]/page.tsx` with `params.customer_name === 'acme'`.

Mapping cheat sheet:

| Subdomain pattern | Override `to` (frontend) | Next.js page file |
|---|---|---|
| `admin.<root>` | `admin` | `src/app/admin/page.tsx` |
| `customer.<root>` | `customer` | `src/app/customer/page.tsx` |
| `<name>.customer.<root>` | `customer/[customer_name]` | `src/app/customer/[customer_name]/page.tsx` |
| `pro.<name>.customer.<root>` | `customer/[customer_name]/pro` | `src/app/customer/[customer_name]/pro/page.tsx` |

Inside a per-tenant page:

- Import the segmented client for that tenant — the import path depends on your `outputConfig.segmentedClient.outDir` and the `segmentNameOverride: ''` setup above. With the defaults here, `admin`-tenant pages import `@/client` and see the admin segment's RPC as the "root" client for that frontend.
- Call RPC normally — the `{ from: 'api', to: 'api/<tenant>' }` override rewrites every `fetch('/api/...')` so it lands in that tenant's segment on the backend.

### Deeper frontend trees

You can nest regular pages under a tenant's folder. `src/app/admin/users/page.tsx` serves `admin.example.com/users` — the proxy rewrite `to: 'admin'` becomes `to: 'admin'` for `/` and `admin/users` for `/users` (because `multitenant()` rewrites the prefix, not the whole path).

## The `multitenant()` helper

Signature (simplified):

```ts
multitenant({
  requestUrl: string,    // request.url
  requestHost: string,   // request.headers.get('host')
  targetHost: string,    // your root domain, e.g. 'example.com' or 'localhost:3000'
  overrides: Record<string, Array<{ from: string; to: string }>>,
}): {
  action: 'rewrite' | 'redirect' | 'notfound' | null;
  destination: string | null;
  subdomains: Record<string, string> | null; // captured [placeholder] values, if any
  message: string;                            // human-readable summary for logs
}
```

### Overrides shape

| Key shape | Matches | Typical use |
|---|---|---|
| Static (`admin`) | `admin.<targetHost>` exactly | Fixed tenant (admin, customer, staff, …) |
| Dynamic (`[customer_name].customer`) | `<anything>.customer.<targetHost>` | Per-customer instance |
| Nested (`pro.[customer_name].customer`) | `pro.<anything>.customer.<targetHost>` | Tier-scoped per-customer |

Each value is a list of `{ from, to }` path rewrites applied when the host matches. Conventions:

- `{ from: 'api', to: 'api/<tenant>' }` — `/<api>/x` → `/<api>/<tenant>/x`, so RPC calls land in the tenant segment.
- `{ from: '', to: '<tenant>' }` — `/` → `/<tenant>`, so the frontend hits the tenant's page tree.

`[placeholders]` in the key are substituted into the `to` paths: `'[customer_name].customer'` + `{ to: 'customer/[customer_name]' }` → `customer/acme` when host is `acme.customer.example.com`.

### Reserved-path guard

If a request arrives on the **root host** with a path starting with a reserved tenant name (e.g. `example.com/admin/...`), `multitenant()` returns a `redirect` (not a rewrite) to the proper subdomain (`admin.example.com/...`). Keeps the root tenant from accidentally serving tenant-scoped URLs and stops users from bookmarking the wrong form of a link.

"Reserved" = any `overrides` key without dynamic `[placeholders]`. Dynamic keys (`[customer_name].customer`) don't count as reserved paths.

### Return `action` values

| `action` | Proxy does | When |
|---|---|---|
| `'rewrite'` | `NextResponse.rewrite(destination)` | Normal tenant routing — host matches an override and path matches a `from`. |
| `'redirect'` | `NextResponse.redirect(destination)` | Root-host access to a reserved tenant path (guard above). |
| `'notfound'` | Return `new NextResponse('Not Found', { status: 404 })` | Reserved for future use — current helper returns it in edge cases. |
| `null` | `NextResponse.next()` | Pass-through — not a tenant request (schema endpoint, unmatched host, etc.). |

`subdomains` carries the captured dynamic values (e.g. `{ customer_name: 'acme' }`) — useful for structured logging, analytics, or feeding into request context.

The helper also short-circuits on `_schema_` paths (Vovk's dev schema endpoint), returning `action: null`, so `vovk dev` / client generation keeps working without extra proxy config.

## 5. DNS / local dev

- **Production**: wildcard DNS at the right level. For `<customer>.customer.example.com` you need `*.customer.example.com` → host. On Vercel, a CNAME `*.multitenant` → `cname.vercel-dns.com.` covers one level; nested patterns need a record at each level you want to catch.
- **Local**: add `127.0.0.1 *.localhost` to `/etc/hosts`. Most modern resolvers honor `*.localhost` without a hosts entry, but adding it explicitly is the safe bet. Browser access to `admin.localhost:3000`, `acme.customer.localhost:3000`, etc., then works.

## Adding a new tenant

1. `npx vovk new segment <tenant>` — creates `src/app/api/<tenant>/[[...vovk]]/route.ts`.
2. Create the frontend page tree under `src/app/<tenant>/...` (or `src/app/<parent>/[slug]/...` for dynamic tenants).
3. Add an `overrides` entry in `src/proxy.ts` mapping the subdomain pattern to both the API path (`api` → `api/<tenant>`) and the frontend path (`''` → `<tenant>`).
4. Add `segmentNameOverride: ''` under `outputConfig.segments.<tenant>` in `vovk.config.mjs`.
5. Run `vovk dev` / `vovk generate` to regenerate the segmented client.
6. **Prod**: confirm the wildcard DNS covers the new subdomain. **Local**: `*.localhost` already covers it.

## Gotchas

- **Proxy filename is fixed**: must be `proxy.ts` (or `.js`) at `src/proxy.ts` or the project root. The exported default function can be named anything. (On older Next.js versions the same file is called `middleware.ts` — follow whatever convention your Next.js version expects.)
- **Matcher excludes static assets**: the `config.matcher` regex skips `_next/*`, `*.png`, `.well-known/*`, etc. Keep those exclusions — without them, asset requests get rewritten and blow up.
- **Wildcard DNS is one level deep**: `*.example.com` covers `admin.example.com` but NOT `foo.admin.example.com`. For patterns like `pro.[customer_name].customer`, you need a wildcard at each level (`*.customer.example.com`, and potentially more). Check your DNS provider's wildcard semantics.
- **Rewrite vs. redirect**: `rewrite` keeps the tenant URL visible in the address bar; `redirect` sends a 302 to the destination. `multitenant()` picks the right one — don't swap them manually in the branch.
- **Reserved names can't overlap with real URL paths**: if you have a tenant key `admin` and a root-tenant page at `src/app/admin/page.tsx`, the reserved-path guard will redirect `example.com/admin` → `admin.example.com/`, making that page unreachable from the root host. Either rename the tenant or the root page.
- **Sharing controllers across tenants**: if tenants share logic, import the same controller class into multiple tenant segments' `controllers` maps (see `segment` skill). Per-tenant customization belongs in the controller (e.g. `req.vovk.meta()` for tenant context).

## Common flows

### "Add an admin subdomain"

Short version: `npx vovk new segment admin` → `src/app/admin/page.tsx` → `overrides.admin` in `proxy.ts` → `segmentNameOverride: ''` in `vovk.config.mjs` → done.

### "Each customer gets their own subdomain"

Use a dynamic override: `'[customer_name].customer': [...]` with `customer/[customer_name]` on the frontend. One segment (`customer`) serves them all; per-customer logic reads the subdomain from `request` or the `subdomains` field returned by `multitenant()`.

### "Self-hosted per-tenant database"

Vovk doesn't manage DB isolation — that's application-level. Resolve the tenant in a controller using `req.headers.get('host')` or a middleware-injected request header, then route DB calls accordingly. Per-tenant connection pooling / sharding is your concern.

### "Migrating an existing single-tenant app to multi-tenant"

1. Move existing root-tenant pages under the root `src/app/` tree (they already live there).
2. Add a new tenant segment + page tree for each new tenant.
3. Flip to segmented client in `vovk.config.mjs`, add `segmentNameOverride: ''` for the NEW tenants — the root tenant keeps its default.
4. Add `proxy.ts` with the new tenants' overrides; don't override anything for the root.
5. Re-run `vovk dev` / `vovk generate`.
