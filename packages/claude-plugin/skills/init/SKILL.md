---
name: init
description: Initialize a Vovk.ts backend in a Next.js App Router project using the official vovk-cli. Use whenever the user asks to set up, bootstrap, scaffold, start, or initialize Vovk, Vovk.ts, a vovk-cli project, or a new RPC/type-safe-API backend — and whenever the user wants to add Vovk to an existing Next.js app. Handles both paths: existing Next.js (verifies Next 15+, App Router, Node 22+) and greenfield (scaffolds Next.js with TypeScript, `src/`, Tailwind, and Biome — explicitly not ESLint — then runs `vovk init`). Prefer this skill over hand-editing files; the CLI is the source of truth for project layout and stays in sync with future Vovk versions.
---

# Vovk.ts initialization

Vovk.ts is a TypeScript-first RPC/API framework that plugs into Next.js App Router. It ships a CLI (`vovk-cli`) that installs dependencies, toggles `experimentalDecorators` in tsconfig, wires up npm scripts, and writes `vovk.config.mjs`. These are coordinated edits that are easy to get wrong by hand, so this skill is a thin wrapper: it prepares the environment, delegates to the CLI, and handles the natural follow-up steps.

## Interactive prompts

`vovk-cli` and `create-next-app` are both interactive. When a prompt appears that the skill doesn't specifically cover, accept the default (usually "yes" or the CLI's recommended choice) unless the user has told you otherwise. Do not try to predict every prompt up front — today's defaults change, and a user can always override afterward.

## Decide the path

Inspect the current working directory:

- `package.json` exists with `next` in `dependencies` or `devDependencies` → **Path A (existing Next.js project)**.
- Otherwise → **Path B (new project)**.

If there's a `package.json` but no `next`, it's an existing non-Next.js project. Ask whether to add Next.js into the current directory or scaffold a new one in a subdirectory — don't silently pollute their repo.

## Path A — existing Next.js project

### 1. Verify prerequisites (bundled)

Check all three in parallel:

- **Node version**: `node --version` — require ≥ 22.
- **Next.js version**: `package.json` `next` must resolve to ≥ 15.0.0.
- **App Router directory**: `src/app/` or `app/` must exist (even if empty) — Vovk mounts its route handler there. If only `pages/` exists, this is a trivial fix: create an empty `app/` (or `src/app/`, matching the project's convention) alongside. App Router and Pages Router coexist without issue — no migration needed just to use Vovk.

If any check fails, **bundle all failures into one message** and ask the user how to proceed. Don't drip-feed them one at a time. Example:

> "Two blockers before Vovk can run:
> 1. Node is on v20.18.0 — Vovk needs ≥ 22. You'll need to upgrade it yourself (`nvm install 22 && nvm use 22` or equivalent); I won't touch your Node install.
> 2. Next.js is on `^14.2.5` — I can run `npx @next/codemod@canary upgrade latest` to move to 15. It can introduce breaking changes, so reviewing the diff afterward is a good idea.
>
> Also: no `app/` directory yet — I'll create an empty `src/app/` alongside `pages/` so Vovk has somewhere to mount. That coexists with your existing Pages Router fine.
>
> Want me to proceed after you bump Node?"

Suggested fixes per failure:

- **Node < 22**: surface, don't auto-run. OS-level concern.
- **Next.js < 15**: `npx @next/codemod@canary upgrade latest`.
- **No App Router directory**: create an empty `src/app/` (if the project uses `src/` for source) or `app/` (otherwise). This is a one-line `mkdir` — don't run the heavyweight `app-dir-migration` codemod just to add Vovk. Migrating existing Pages Router code to App Router is the user's decision, not a Vovk prerequisite.

Proceed only on explicit user confirmation for the non-trivial fixes (Node, Next upgrade). The empty-directory creation can be bundled into that same confirmation.

### 2. Run `vovk init`

From the project root:

```bash
npx vovk-cli@latest init
```

The CLI auto-detects the package manager from lockfiles and handles its own prompts for validation library, codegen options, etc. If the user has already stated a preference (e.g., "use Zod"), apply it when the relevant prompt appears. Otherwise accept defaults per the interactive-prompts rule above.

If the CLI errors out, report the error verbatim and stop. Don't try to patch a half-initialized state by hand.

### 3. Verify the result

After init finishes, confirm (observed against vovk-cli with default `--yes` flags):

- `vovk.config.mjs` exists at project root, with `outputConfig.imports.validateOnClient` and `moduleTemplates.controller` / `moduleTemplates.service` set.
- `tsconfig.json` has `"experimentalDecorators": true` under `compilerOptions`.
- `package.json` `dependencies` gained `vovk`, `vovk-client`, plus the chosen validation library and its client-side validator. Defaults: `zod` + `vovk-ajv`. (If the user chose `valibot` or `arktype` instead, those land here.)
- `package.json` `devDependencies` gained `vovk-cli`.
- `package.json` `scripts` — the existing `dev` is **replaced** with `vovk dev --next-dev` (vovk's dev wrapper around `next dev`), and a new `prebuild` script is added running `vovk generate` (so RPC codegen runs before every `next build`). `build` and `start` are left untouched.

If the user originally had a custom `dev` script, flag the replacement explicitly — the user may want to preserve custom flags. The CLI's `--update-scripts explicit` mode is an alternative that keeps scripts separate, but the default (implicit) mode is the usual choice.

If anything's missing, report it rather than silently patching.

### 4. Offer the follow-up steps

Summarize concisely: what got installed, what changed, what scripts exist now. Then ask about the two natural next steps — don't cascade silently.

**Step 4a — create the root segment?**

> "Vovk is installed. Want me to create the root API segment? That's `npx vovk new segment`, which writes `src/app/api/[[...vovk]]/route.ts` — the catch-all route that registers controllers."

If yes, run it and verify the file was created. If no, stop.

**Step 4b — create a first module?**

Only after a segment exists.

> "Segment's ready. Want me to scaffold a first module? I need a name — any valid JS identifier works (`user`, `myUser`, `theCoolProduct`, `user-profile`, etc.). I'll always generate a controller + service pair."

If the user gives a name, run `npx vovk new controller service <name>`. Stop afterward — the user may want to inspect the diff or plan more modules before continuing.

## Path B — new Next.js project

### 1. Check Node first

Before scaffolding anything, run `node --version`. `vovk init` needs ≥ 22 and `create-next-app` prefers modern Node too. If Node is older, surface it and let the user upgrade before you continue — scaffolding Next.js first and then failing at `vovk init` wastes their time.

### 2. Confirm scope

> "No Next.js project here. I can scaffold one with TypeScript, `src/`, Tailwind, Biome (not ESLint), and the App Router, then run `vovk init` on top. Create it in this directory, or a subdirectory? (If subdirectory, what name?)"

Wait for confirmation.

### 3. Pick a package manager

Default to **pnpm** unless the user specifies otherwise. If they prefer bun/yarn/npm, honor that and swap the `--use-*` flag in the scaffold command accordingly.

### 4. Scaffold Next.js

```bash
pnpm create next-app@latest <project-name> \
  --typescript \
  --src-dir \
  --tailwind \
  --biome \
  --app \
  --use-pnpm \
  --import-alias "@/*"
```

Use `.` as the project name when scaffolding into the current directory. `--biome` is a native `create-next-app` flag — it sets Biome up as the linter/formatter directly, no separate install step needed. If `create-next-app` surfaces an unrecognized prompt, accept the default per the interactive-prompts rule.

Note: this `--biome` setup only applies here in the greenfield flow. When adding Vovk to an **existing** Next.js project (Path A), don't touch the linter setup — whatever the project already uses (ESLint, Biome, or none) is the user's choice, and swapping it is out of scope.

### 5. Run Vovk init

Continue from **Path A, step 2**. Prerequisites are already satisfied by the fresh scaffold, so the Path A prereq check can be skipped.
