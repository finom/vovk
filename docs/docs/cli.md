---
sidebar_position: 6
---

# CLI

## `vovk dev`

Runs Vovk Metadata Server and `next dev` in parallel. Next.js dev server will send information about controllers and worker services to the Metadata Server to build **.vovk.json** and **node_modules/.vovk** files. Please check [How it Works](./how-it-works) for more info.

`vovk dev` supports `--no-next-dev` flag that indicates that it shouldn't run `next dev`. This is useful in case if you want to take control over `next dev` and run it by yourself with [concurrently](https://www.npmjs.com/package/concurrently) or similar library. At this case it is required to set `PORT` and `VOVK_PORT` env variables explicitly.

```sh
PORT=4000 VOVK_PORT=6969 concurrently 'vovk dev --no-next-dev' 'next dev'
```

## `vovk generate`

Generates the client based on **.vovk.json** and puts **.js** and **.d.ts** files into **node_modules/.vovk** that are re-exported by **vovk-client**. **.vovk.json** is generated via `vovk dev`.

Both commands accept the following flags:

`--config` - path to **vovk.config.js**
`--clientOut` - where client needs to be generated

For `vovk dev` all flags that come after ` -- ` are passed directly to `next dev` as is.

```sh
npx vovk dev --config=my-vovk-config.js --clientOut=my-custom-folder -- --experimental-https --keepAliveTimeout 70000
```

```sh
npx vovk generate --config=my-vovk-config.js --clientOut=my-custom-folder
```

All other commands such as `next build` and `next start` remain the same since the project is a normal Next.js application.

## Available env variables

Environment variables allow to customize Vovk.ts behaviour by overriding configuration optionally defined at **vovk.config.js**. You can find more detailed information about customization at [Customization](./customization) article of this documentation. Here is a quick ref:

- `PORT=3000` - defines port for Next.js server that is also used by the Metadata Server to ping Next.js server (relevant only with `vovk dev`).
- `VOVK_PORT=3690` - Vovk Metadata Server port (relevant only with `vovk dev`).
- `VOVK_ROUTE=./src/app/api/[[...vovk]]/route.ts` - allows to redefine path to the wildcard route (the slug can be any non-empty string, it's name is not utilised by Vovk.ts).
- `VOVK_FETCHER=vovk/client/defaultFetcher` - allows to customize the fetching function that used internally by the client.
- `VOVK_PREFIX=/api` - defines the root endpoint used by `fetch` function at the client.
- `VOVK_VALIDATE_ON_CLIENT` - defines client-side validation library. If [vovk-zod](https://github.com/finom/vovk-zod) is installed but `VOVK_VALIDATE_ON_CLIENT` is not redefined it's value going to get value `vovk-zod/zodValidateOnClient`. See [Customization](./customization) for more info.