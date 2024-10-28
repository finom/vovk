<p align="center"> 
  <picture>
    <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
    <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
    <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
  </picture><br>
  <strong>RESTful RPC for Next.js</strong>
  
</p>

<p align="center">
  Transforms <a href="https://nextjs.org/docs/app">Next.js</a> into a powerful REST API platform with RPC capabilities. 
  <br><br>
  ℹ️ Improved syntax for Zod and DTO validation is coming soon. Stay tuned!
</p>

<p align="center">
  <a href="https://vovk.dev/">Documentation</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://discord.gg/qdT8WEHUuP">Discord</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-examples">Code Examples</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-zod">vovk-zod</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-hello-world">vovk-hello-world</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-react-native-example">vovk-react-native-example</a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/vovk"><img src="https://badge.fury.io/js/vovk.svg" alt="npm version" /></a>&nbsp;
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" alt="TypeScript" /></a>&nbsp;
  <a href="https://github.com/finom/vovk/actions/workflows/main.yml"><img src="https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg" alt="Build status" /></a>
</p>

 <br />

Example back-end Controller Class:

```ts
// /src/modules/post/PostController.ts
import { get, prefix, type VovkRequest } from 'vovk';
import PostService from './PostService';

@prefix('posts')
export default class PostController {
  /**
   * Create a comment on a post
   * POST /api/posts/:postId/comments
   */
  @post(':postId/comments')
  static async createComment(
    // decorate NextRequest type with body and query types
    req: VovkRequest<{ content: string; userId: string }, { notificationType: 'push' | 'email' }>,
    { postId }: { postId: string } // params
  ) {
    // use standard Next.js API to get body and query
    const { content, userId } = await req.json();
    const notificationType = req.nextUrl.searchParams.get('notificationType');

    // perform the request to the database in a custom service
    return PostService.createComment({
      postId,
      content,
      userId,
      notificationType,
    });
  }
}
```

Example component that uses the auto-generated client library:

```tsx
'use client';
import { useState } from 'react';
import { PostController } from 'vovk-client';
import type { VovkReturnType } from 'vovk';

export default function Example() {
  const [response, setResponse] = useState<VovkReturnType<typeof PostController.createComment>>();

  return (
    <>
      <button
        onClick={async () =>
          setResponse(
            await PostController.createComment({
              body: {
                content: 'Hello, World!',
                userId: '1',
              },
              params: { postId: '69' },
              query: { notificationType: 'push' },
            })
          )
        }
      >
        Post a comment
      </button>
      <div>{JSON.stringify(response)}</div>
    </>
  );
}
```

Alternatively, the resource can be fetched wit the regular `fetch` function:

```ts
fetch('/api/posts/69?notificationType=push', {
  method: 'POST',
  body: JSON.stringify({
    content: 'Hello, World!',
    userId: '1',
  }),
});
```
