---
sidebar_position: 4
---

# Streaming

## Generators

Response streaming in Vovk.ts is implemented using generators and async generators. At the example above `HelloService` implements `*streamTokens` generator and yields an improvised token every 300 ms to simulate AI-like response.

```ts
// /src/vovk/hello/HelloService.ts
export type Token = { message: string };

export default class HelloService {
  static async *streamTokens() {
    const tokens: Token[] = [{ message: 'Hello,' }, { message: ' World' }, { message: '!' }];

    for (const token of body) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        yield token;
    }
  }
}
```

The `HelloController` controller delegates to the `streamTokens` return with `yield*` syntax.

```ts
// /src/vovk/hello/HelloController.ts
import { type VovkRequest } from 'vovk';
import HelloService from './HelloService';

export default class HelloController {
  static controllerName = 'StreamingController';

  private static helloService = HelloService;

  @post.auto()
  static async *streamTokens(req: VovkRequest<{ hello: string }>) {
    const body = await req.json(); // handle body if needed
    yield* this.helloService.streamTokens(response);
  }
}
```

The client-side `logTokens` makes an API call to `controller.streamTokens` with `isStream: true` and iterates over stream messages using `for await` loop.

```ts
// /src/vovk/hello/HelloState.ts
import { clientizeController } from 'vovk/client';
import type HelloController from './HelloController';
import type { Token } from './HelloService';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

const controller = clientizeController<typeof HelloController>(metadata.HelloController);

export function logTokens() {
    const resp = await controller.streamTokens({
        body: { hello: 'world' },
        isStream: true, // !
    });

    for await (const token of resp) {
        console.log(token satisfies Token);
    }
}
```

## Error handling

Streaming response can be safely interrupted by using `throw` keyword. The thrown object is going to be casted to the client-side as-is and re-thrown there.


```ts
// /src/vovk/hello/HelloService.ts
// ...

export default class HelloService {
  static async *streamTokens() {
    // ...
    yield token;
    // ...
    throw { hello: 'World' };
    // ...
  }
}
```

You can wrap `for await` loop by try..catch to catch the error thrown. At this example `{ hello: 'World' }` object is going to be thrown.

```ts
// /src/vovk/hello/HelloState.ts
// ...

export async function logTokens() {
    const resp = await controller.streamTokens({
        isStream: true,
    });

    try {
        for await (const token of resp) {
            console.log(token);
        }
    } catch(e) {
        console.error(e); // { hello: 'world' }
    }
}

```

Here is another example of `HelloService` that uses `OpenAI` library.

```ts
// /src/vovk/hello/HelloService.ts
import OpenAI from 'openai';
// ...
const openai = new OpenAI();

export default class HelloService {
  static async *streamTokens() {
    const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Say this is a test' }],
        stream: true,
    });

    try {
        for await (const part of stream) {
            yield part.choices[0]?.delta?.content || '';
        }
    } catch (e) {
        throw { openAiError: String(e) };
    }
  }
}
```

## Overriding the default stream fetcher

You can override front-end function that is used internally when `isStream: true` is provided. To do that pass `streamFetcher` option to `clientizeController`.

```ts
import { myCustomStreamFetcher } from '../lib/client';
// ...

const controller = clientizeController<HelloControllerType>(metadata.HelloController, {
    streamFetcher: myCustomStreamFetcher,
});

```

`defaultStreamFetcher` that is used internally and it's is too complex to explain it at this documentation. Please check project source code if you need to re-define `streamFetcher` option with the custom one.