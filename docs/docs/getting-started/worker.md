# Vovk Worker Service

**vovk/worker** module is intended to popularise Web Worker usage in your every day work. The standard Web Workers are awesome but they require to write additional code by using `onmessage` handler on both sides (main thread and Woker thread) and exchange data using `postMessage`. Vovk Worker Service applies the same principle that is used at `clientizeController` and builds main-thread client-side library using metadata and worker type. It uses built-in browser API aush as `addEventListener` and `postMessage` and does not call `eval` or `Function` constructor.

Worker Service can be easily created from an Isomorphic Service. Reminder: Isomorphic Service is a static class that provides code that is shared between front-end and back-end. It should implement pure functions as static methods that don't have access to neither application state nor server-side capabilities such as database access.

To define required `onmessage` handlers use `@worker()` decorator and static `workerName` property.

```ts
// vovk/hello/HelloWorkerService.ts
@worker()
export default class HelloWorkerService {
    static workerName = 'HelloWorkerService';

    static heavyCalculation(iterations: number) {
        let sum = 0;

        for(let i = 0; i < iterations; i += 1) {
            sum += i;
        }

        return sum;
    }
}
```

In a non-worker environment `@worker()` does nothing. You can import the Isomorphic Service class safely in other modules as before. If the Isomorphic Service is intended to be used in a worker environment only, I would recommend to call this service as Worker Service or at this case `HelloWorkerService`.

`activateControllers` accepts `workers` array as an option to pupulate metadata with worker information.

////////

To create the main-thread library that utilises the Isomorphic Service in a separate thread use `promisifyWorker`. Thanks to Next.js you can create a Web Worker from at .ts file with no need to set up custom Webpack loaders.

```ts
const worker = promisifyWorker<typeof HelloWorkerService>(
    new Worker(new URL('./HelloWorkerService.ts', import.meta.url)),
    metadata.workers.HelloWorkerService
);

const result = await worker.heavyCalculation(100_000_000);
```

As you can see `heavyCalculation` returns `Promise` instance.

If you use `Worker` constructor outside of `useEffect` it's recommended to check if `Worker` is `undefined` and make the variable to be nullish to avoid SSR errors. 

```ts
// vovk/hello/HelloState.ts
import { promisifyWorker } from 'vovk/worker';
import type HelloWorkerService from './HelloWorkerService';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

const worker = typeof Worker !== 'undefined' ?
    promisifyWorker<typeof HelloWorkerService>(
        new Worker(new URL('./HelloWorkerService.ts', import.meta.url)),
        metadata.workers.HelloWorkerService
    ) : null;

const helloState = {
    heavyCalculation: async (iterations: number) => {
        /* worker?.heavyCalculation is casted as 
          null | (iterations: number) => Promise<number>
        */
        const result = await worker?.heavyCalculation(100_000_000) ?? 0;

        // result is casted as number
        return result;
    }
}
```

## Worker termination

A worker can be terminated with built-in `terminate` method.

```ts
worker?.terminate();
```

## Async generators

Worker Service supports generators and async generators to implement continious event streaming. 

```ts
// vovk/hello/HelloWorkerService.ts
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

## Clientize controller inside a worker

Since Web Workers are run in a browser (but in another thread) it's capable to fetch server-side data. Of course the Isomorphic Service looses its "isomorphiness" and I'm going to use `HelloWorkerService` for the static class.

```ts
// vovk/hello/HelloController.ts
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
// vovk/hello/HelloWorkerService.ts
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

        let sum = 0;

        for(let i = 0; i < iterations; i += 1) {
            sum += i;
        }

        return sum;
    }
}
```

Then call the Worker Service method as expected.

```ts
// vovk/hello/HelloState.ts
// ...
// const worker = ...
const helloState = {
    heavyCalculation: async (iterations: number) => {
        /* worker?.heavyCalculation is casted as 
          null | () => Promise<number>
        */
        const result = await worker?.heavyCalculation() ?? 0;

        // result is casted as number
        return result;
    }
}
```

## Using worker inside another worker

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

## Forking the worker

To fork the worker you can simply call `promisifyWorker` multiple times. The methods of the forks are going to be run in parallel.


```ts
const fork = () => {
    const worker = typeof Worker !== 'undefined' ?
        promisifyWorker<typeof HelloWorkerService>(
            new Worker(new URL('./HelloWorkerService.ts', import.meta.url)),
            metadata.workers.HelloWorkerService
        ) : null;

    return worker;
}

const worker1 = fork();
const worker2 = fork();
const worker3 = fork();

const [result1, result2, result3] = await Promise.all([
    worker1?.heavyCalculation(),
    worker2?.heavyCalculation(),
    worker3?.heavyCalculation(),
]);
```


