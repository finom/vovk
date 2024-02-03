---
sidebar_position: 5
---

# Worker Service

**vovk/worker** module is intended to popularise Web Worker usage in your every day work. The standard Web Workers are awesome but they require to write additional code by using `onmessage` handler on both sides (main thread and Woker thread) and exchange data using `postMessage`. Vovk Worker Service applies the same principle that is used at `clientizeController` and builds main-thread client-side library using metadata and worker type. It uses built-in browser API aush as `addEventListener` and `postMessage` and does not call `eval` or `Function` constructor.

Worker Service can be easily created from an Isomorphic Service. Reminder: Isomorphic Service is a static class that provides code that is shared between front-end and back-end. It should implement functions as static methods that don't have access to neither application state nor server-side capabilities such as database access.

To define required `onmessage` handlers use `@worker()` decorator and static `workerName` property.

```ts
// /src/vovk/hello/HelloWorkerService.ts
import { worker } from 'vovk/worker';

@worker()
export default class HelloWorkerService {
    static workerName = 'HelloWorkerService';

    static heavyCalculation(iterations: number) {
        let result: number;
        // ... heavy calculations

        return result;
    }
}
```

In a non-worker environment `@worker()` does nothing. You can import the Isomorphic Service class safely in other modules as before (on back-end, for example).

To make workers information available on the main thread using **vovk-metadata.json** file, you need to pass them to
`initVovk` as `workers` option.


```ts
// /src/app/api/[[...]]/route.ts
import { initVovk } from 'vovk';
import HelloController from '../../../hello/HelloController';
import HelloWorker from '../../../hello/HelloWorker';
import ByeWorker from '../../../bye/ByeWorker';

export const { GET, POST, PUT, DELETE } = initVovk({
  controllers: [HelloController],
  workers: [HelloWorker, ByeWorker]
  // ...
});
```

To trigger metadata creation manually, open [http://localhost:3000/api](http://localhost:3000/api) in your browser (it's OK to see 404 error if the root endpoint isn't defined).

## Promisify Worker Service

To create the main-thread library that utilises the Worker Service in a separate thread use `promisifyWorker`. Thanks to Next.js you can create a Web Worker from at .ts file with no need to set up custom and hard to use Webpack loaders.

```ts
// /src/vovk/hello/HelloState.ts
import type HelloWorkerService from './HelloWorkerService';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

// ...
const worker = promisifyWorker<typeof HelloWorkerService>(
    new Worker(new URL('./HelloWorkerService.ts', import.meta.url)),
    metadata.workers.HelloWorkerService
);

// result is casted as number
const result = await worker.heavyCalculation(100_000_000);
// ...
```

As you can see `heavyCalculation` returns `Promise`.

If you use `Worker` constructor outside of `useEffect` it's recommended to check if `Worker` is `undefined` and make the variable to be nullish to avoid SSR errors. 

```ts
// /src/vovk/hello/HelloState.ts
import { promisifyWorker } from 'vovk/worker';
import type HelloWorkerService from './HelloWorkerService';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

const worker = typeof Worker === 'undefined' ? null :
    promisifyWorker<typeof HelloWorkerService>(
        new Worker(new URL('./HelloWorkerService.ts', import.meta.url)),
        metadata.workers.HelloWorkerService
    );

export async function performHeavyCalculation (iterations: number) {
    /* worker?.heavyCalculation is casted as 
        null | (iterations: number) => Promise<number>
    */
    const result = await worker?.heavyCalculation(100_000_000) ?? 0;

    // result is casted as number
    return result;
}
```

## Worker termination

A worker can be terminated with built-in `terminate` method.

```ts
worker.terminate();
```

The object returned from `promisifyWorker` implements a [disposable object](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html) that can be terminated automatically with `using` declaration syntax when code block is ended.

```ts
{
    using worker = promisifyWorker<typeof HelloWorkerService>(/* ... */);
    const result = await worker.heavyCalculation();
    console.log(result);
}
// worker is terminated
```

## Async generators

Worker Service supports generators and async generators to implement continious event streaming. 

```ts
// /src/vovk/hello/HelloWorkerService.ts
import { worker } from 'vovk/worker';

@worker()
export default class HelloWorkerService {
    static workerName = 'HelloWorkerService';

    static *generator() {
        for (let i = 0; i < 10; i++) {
            yield i;
        }
    }

    static async *asyncGenerator() {
        for (let i = 0; i < 10; i++) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            yield i;
        }
    }
}
```

When promisified they both turn into an async generator.

```ts
const worker = promisifyWorker<typeof HelloWorkerService>(/* ... */);

for await (const number of worker.generator()) {
    console.log(number); // 0 ... 9
}

for await (const number of worker.asyncGenerator()) {
    console.log(number); // 0 ... 9
}
```

## Clientize Controller inside a Worker Service

Since Web Workers are run in a browser (but in another thread) it's capable to fetch server-side data.

```ts
// /src/vovk/hello/HelloController.ts
import { get } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

    @get.auto()
    static getIterations() {
        return { iterations: 100_000_000 };
    }
}
```

```ts
// /src/vovk/hello/HelloWorkerService.ts
import { clientizeController } from 'vovk/client';
import type HelloController from './HelloController';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

type HelloControllerType = typeof HelloController;

@worker()
export default class HelloWorkerService {
    static workerName = 'HelloWorkerService';

    private static controller = clientizeController<HelloControllerType>(metadata.HelloController);

    static async heavyCalculation() {
        const { iterations } = await this.controller.getIterations();
        let result: number;

        // ...

        return result;
    }
}
```

Then call the Worker Service method as expected.

```ts
// /src/vovk/hello/HelloState.ts
// ...
const worker = // ...

export async function heavyCalculation (iterations: number) {
    const result = await worker?.heavyCalculation() ?? 0;
    return result;
}
```

## Using promisified Worker Service inside another Worker Service

It is possible to use `promisifyWorker` inside other workers. The syntax remains the same and you don't need to check `Worker` existence.

```ts
import type HelloAnotherWorkerService from './HelloAnotherWorkerService';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

export default class WorkerService {
    static workerName = 'WorkerService';

    private static anotherWorker = promisifyWorker<typeof HelloAnotherWorkerService>(
        new Worker(new URL('./HelloAnotherWorkerService.ts', import.meta.url)),
        metadata.workers.HelloAnotherWorkerService
    );

    heavyCalculation() {
        const anotherWorkerResult = await this.anotherWorker.doSomethingHeavy();
        // ...
    }
}
```

## Forking the Worker

To fork the worker you can simply call `promisifyWorker` multiple times. The methods of the forks are going to be run in parallel.

```ts
const fork = () => {
    const worker = promisifyWorker<typeof HelloWorkerService>(
        new Worker(new URL('./HelloWorkerService.ts', import.meta.url)),
        metadata.workers.HelloWorkerService
    );

    return worker;
}

const worker1 = fork();
const worker2 = fork();
const worker3 = fork();

const [result1, result2, result3] = await Promise.all([
    worker1.heavyCalculation(),
    worker2.heavyCalculation(),
    worker3.heavyCalculation(),
]);
```


