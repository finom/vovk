---
sidebar_position: 8
---

# How it Works

1. `vovk dev` finds the closest available port to run Next.js server by itself. This is an important step that allows Vovk Metadata Server to know the `process.env.PORT` in advance to ping Next.js server.
1. When available port is found Vovk runs two processes (similar to [concurrently](https://www.npmjs.com/package/concurrently)) in parallel: Vovk Metadata Server and the regular `next dev`.
1. Each time when an endpoint is requested `initVovk` POSTs data about controllers and worker services to the Vovk Metadata Server. Previous major version of Vovk.ts used `fs` Node.js module to write metadata file but, unfortunately, this approach didn't work in Edge Runtime since most of the standard Node.js capabilities can't be used this environment. Instead of `fs` Vovk.ts starts its own server in dev mode that accepts information about controllers and worker services via POST request made by `initVovk` function.
1. The Metadata Server accepts this data and if a change is detected it updates **.vovk.json** and **node_modules/.vovk** (it contains the generated client) automatically. By Next.js design endpoints handled by [Optional Catch-all Segment](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments) execute its code each time when the endpoint is requested.
1. To make development process seamless and to trigger file creation without calling any endpoint manually, Vovk Metadata Server constrantly pings `GET /api/__ping` every 3 seconds to make the client regenerated automatically.
1. If metadata is changed, the Metadata Server regenerates **.vovk.json** and files ay **node_modules/.vovk** that contains **.js** and **.d.ts** files for the client. The client is generated with string concatenation.

Since Vovk.ts doesn't watch files and doesn't use AST to build the client you can have any amount of controllers and worker services and client generating performance is only limited by Next.js itself.