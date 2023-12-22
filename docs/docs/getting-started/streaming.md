# Streaming

Besides regular HTTP requests **Vovk.ts** supports event streaming that especially useful with the modern AI APIs. To implement response streming the API route function can return 

```ts
// vovk/hello/StreamingController.ts
import { StreamResponse, type VovkRequest } from 'vovk';
import HelloService, { type Token } from './HelloService';

export default class HelloController {
  static controllerName = 'StreamingController';

  private static helloService = HelloService;

  @post.auto()
  static async streamTokens(req: VovkRequest<{ hello: string }>) {
    const body = await req.json(); // handle body if needed
    const response = new StreamResponse<Token>();

    void this.helloService.streamTokens(response);

    return response;
  }
```

At this example `HelloService` provides `streamTokens` function that accepts the response object and simulates token streaming every 300 second. The API endpoint returns an instance of `StreamResponse<Token>` where `Token` type is going to be recognised by the front-end. Under the hood `StreamResponse` is just `Response` instance that accepts `TransformStream['readable']` as body and runs certain workarounds to avoid data collisions.

```ts
// vovk/hello/HelloService.ts
export type Token = { message: string };

export default class HelloService {
  static async streamTokens(response: StreamResponse<Token>) {
    const tokens = [{ message: 'Hello,' }, { message: ' World' }, { message: '!' }];

    for (const token of body) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await response.send(token);
    }

    return response.close();
  }
}
```

As you can see `StreamResponse` provides `send` method that sends new portion of data to the client-side and `close` method that stops streaming and safely closes the stream.

## Handling stream responses on client

Client methods created using `clientizeController` accepts `isStreaming` option. This option makes the library call stream fetcher - the different implementation of fetcher that supports response streaming.

```ts
// vovk/hello/HelloState.ts
import { clientizeController } from 'vovk/client';
import type HelloController from './HelloController';
import type { Token } from './HelloService';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

type HelloControllerType = typeof HelloController;

const controller = clientizeController<HelloControllerType>(metadata.HelloController);

const helloState = {
    streamTokens: async () => {
        const resp = await controller.streamTokens({
            body: { hello: 'world' },
            isStream: true, // !
        });

        for await (const token of resp) {
            console.log(token satisfies Token);
        }
    }
}

export default helloState;
```

As you can see `streamTokens` returns a promise thar resolves async iterable that yields messages of type `Token` defined at `HelloService`.

## Error handling

Streaming response can be safely interrupted by using `throw` method that accepts an argument that re-throws the same error on client-side.


```ts
// vovk/hello/HelloService.ts
// ...

export default class HelloService {
  static async streamTokens(response: StreamResponse<Token>) {
    // ...
    return response.throw({ hello: 'World' });
    // ...
  }
}
```

You can wrap `for await` loop by try..catch to catch the error thrown by using `response.throw` method. At this example `{ hello: 'World' }` object is going to be thrown.

```ts
// vovk/hello/HelloState.ts
// ...

const helloState = {
    streamTokens: async () => {
        const resp = await controller.streamTokens({
            body: { hello: 'world' },
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
}

export default helloState;
```

On the back-end you can also wrap the streaming code by try..catch and re-throw it on the client by using `response.throw` method.

```ts
// vovk/hello/HelloService.ts
import OpenAI from 'openai';
// ...
const openai = new OpenAI();

export default class HelloService {
  static async streamTokens(response: StreamResponse<OpenAI.Chat.Completions.ChatCompletionChunk>) {
    const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Say this is a test' }],
        stream: true,
    });

    try {
        for await (const part of stream) {
            await response.send(part.choices[0]?.delta?.content || '');
        }
    } catch (e) {
        return response.throw({ openAiError: String(e) });
    }

    return response.close();
  }
}
```

## Overriding the default stream fetcher

You can override front-end function that is used internally when `isStream: true` is provided. To do that pass `streamFetcher` option to `clientizeController`.

```ts
import { myCustomStreamFetcher } from '../lib/client';

const controller = clientizeController<HelloControllerType>(metadata.HelloController, {
    streamFetcher: myCustomStreamFetcher,
});

```

`defaultStreamFetcher` that is used internally if `streamFetcher` isn't provided is too complex to explain it at this documentation. Please check project source code if you need to re-define `streamFetcher` option.