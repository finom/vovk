---
sidebar_position: 8
---

# Roadmap

## The library

- Support OpenAPI export.
- Support Edge Rumtime.
- Export `StreamResponse` class to use as a response pointer in Services and to implement streaming without generators syntax.
- Support async iterable for stream responses at `VovkReturnType` type.
- An option to obfuscate endpoint names when `.auto()` decorators are used.
- Support [Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) at workers.
- (Experimental) Add [AssemblyScript](https://www.assemblyscript.org/) as an additional piece of Vovk architecture.
- (Experimental) Implement shared object that read by all workers and the main thread using `Atomics` and `SharedArrayBuffer`.
- CLI (to be discussed).
- ✅ ~Implement disposable objects (`using` keyword) for Worker termination and to close stream response.~

## Examples

- TodoMVC with SQLite and Prisma.
- How to create API library for free and publish it on NPM.
- React Native example.

## Ideas

Auto-generated client for edge runtime.

```ts
import { MyController } from '@vovk/client';

await MyController.doSomething();
```