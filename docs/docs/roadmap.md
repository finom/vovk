---
sidebar_position: 9
---

# Roadmap & Changelog

## Roadmap

- Support OpenAPI export.
- An option to obfuscate endpoint names when `.auto()` decorators are used.
- Support [Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) at workers.
- (Experimental) Add support of [AssemblyScript](https://www.assemblyscript.org/).
- (Experimental) Implement shared object that is read by all workers and the main thread using `Atomics` and `SharedArrayBuffer`.

## Changelog

### v1.0.0

- ✅ Generate client library automatically.
- ✅ Support Edge Runtime.
- ✅ Export `StreamResponse` class to use as a response pointer in Services and to implement streaming without generators syntax.
- ✅ Extract generator types.
- ✅ Implement disposable objects (`using` keyword) to close stream responses automatically.
