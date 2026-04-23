---
name: new
description: Create new segments and modules in an existing Vovk.ts project using the official vovk-cli (`vovk new`). Use whenever the user asks to create, scaffold, add, or generate a Vovk segment (root, named, or static), a Vovk module, a controller, a service, an endpoint, a resource, or a feature in a Vovk.ts codebase. Also triggers when the user wants to extend an existing Vovk backend — phrases like "add users to my Vovk app", "create a new API route in Vovk", or "add an openapi endpoint" all apply. Handles two flows: segments (root or named, optionally static) and modules (always controller + service — this skill never generates a bare controller without its service). Prefer this skill over hand-editing files — the CLI wires up the segment's `route.ts` registration, which is the step most commonly forgotten by hand.
---

# Vovk.ts code generation

This skill wraps `npx vovk new` to create new segments and modules in an existing Vovk project. The CLI does two easy-to-forget jobs:

- **Segments** get their catch-all `route.ts` with the right `initSegment()` wiring.
- **Modules** get their controller registered in the target segment's `route.ts` `controllers` object, so the routes actually resolve.

Drift between your code and the shape Vovk expects tends to surface months later as "why doesn't this route work" — so lean on the CLI.

## Interactive prompts

`vovk-cli` is interactive. When it prompts for something this skill doesn't specifically cover, accept the default unless the user has told you otherwise.

## Prereq: is this a Vovk project?

Before anything, confirm the current directory is Vovk-initialized:

- `vovk.config.mjs` exists at the project root.
- `package.json` has `vovk` + `vovk-client` in `dependencies` and `vovk-cli` in `devDependencies`.

If these are missing, the project hasn't run `vovk init`. Stop and point the user at the `init` skill — don't try to generate code into a non-Vovk project.

## Decide: segment or module?

Interpret the user's phrasing:

- "segment", "route catch-all", "static segment", "openapi endpoint", "new API entrypoint" → **segment flow**
- "module", "controller", "service", "resource", "feature", "endpoint for X", "add X to my app" → **module flow**

When ambiguous, default to **module** — that's the 90% case. Ask the user to confirm if you're not confident.

## Segment flow

### 1. Determine segment shape

Three shapes:

| Shape        | Purpose                                              | Path                                            |
| ------------ | ---------------------------------------------------- | ----------------------------------------------- |
| **Root**     | Catch-all at `/api/*`. Most projects have exactly one. | `src/app/api/[[...vovk]]/route.ts`              |
| **Named**    | Separate segment at `/api/<name>/*`.                 | `src/app/api/<name>/[[...vovk]]/route.ts`       |
| **Static**   | Like named, but for static-output APIs (e.g., OpenAPI spec). Uses `--static`. | `src/app/api/<name>/[[...vovk]]/route.ts` |

If the user already stated shape + name (e.g., "add a static segment called openapi"), skip the question and run. Otherwise ask:

> "What kind of segment? I can create:
> - **Root** — the default catch-all (most projects have one)
> - **Named** — a separate segment under `/api/<name>/*`; needs a name
> - **Static** — for static-output APIs like OpenAPI specs; also named
>
> Which one?"

### 2. Run the CLI

```bash
# Root
npx vovk new segment

# Named
npx vovk new segment <name>

# Static named
npx vovk new segment <name> --static
```

### 3. Verify

Confirm the generated `route.ts` exists at the expected path (see table). If the CLI succeeded silently but the file isn't there, something went wrong — surface it.

## Module flow

### 1. Get a name

If the user didn't say one, ask:

> "What's the module name? Any valid JS identifier — `user`, `myUser`, `theCoolProduct`, `user-profile` — the CLI derives the file and class names from whatever you pass."

### 2. Pick a target segment (only if multiple exist)

If the project has only the root segment, skip this — the CLI registers there automatically. If there are multiple segments, ask which one the new module belongs to. When `vovk new` prompts, answer per the user's choice.

### 3. Run the CLI — always controller + service

```bash
npx vovk new controller service <name>
```

**Always pass both `controller` and `service`.** Even small modules benefit from the split: the controller owns HTTP concerns (decorators, validation, shape of the request/response), the service owns business logic and data access. Collapsing them into a bare controller gets messy by the time the third handler lands, and refactoring a service in later is more work than starting with one.

If the user explicitly asks for controller-only, do it — but call out that you're deviating from the default.

### 4. Verify

Confirm:

- `src/modules/<derived-folder>/<Derived>Controller.ts` exists
- `src/modules/<derived-folder>/<Derived>Service.ts` exists
- The target segment's `route.ts` has a new entry in the `controllers` object importing the new controller

The CLI derives folder/class names from the input (`user` → `src/modules/user/UserController.ts`, `myUser` → `src/modules/myUser/MyUserController.ts`, and so on). Check what actually landed rather than assuming — don't hardcode expectations.

If `route.ts` wasn't updated, the controller won't resolve at runtime. Surface it.

### 5. The scaffold is a template, not a keepsake

The generated controller and service come pre-filled with a dummy CRUD example (list / get / create / update / delete returning placeholder data). That content exists to demonstrate Vovk's conventions in concrete form — the right imports, decorator stacking, `procedure().handle(...)` shape, and the controller-calls-service wiring.

**When the user follows up with real logic, replace the dummy handlers in place — don't append real handlers alongside the dummies.** The example is a starting point to overwrite, not a block to preserve. Carrying the dummies forward leaves dead code (`getTodos`, placeholder types, etc.) that reads as confusion later.

## After generation

Summarize what was created and stop — don't cascade into more generation. If the user wants another segment or module, they'll ask.

## When things go wrong

- **CLI errors**: report verbatim. The most common cause for `vovk new controller` failing is no segment to register into — route the user to create a segment first.
- **Name collisions**: if a module with the same name exists, don't overwrite silently. Confirm before re-running.
- **Odd names**: let the CLI reject and forward its error verbatim. Don't pre-validate names — the rules may change between Vovk versions.
