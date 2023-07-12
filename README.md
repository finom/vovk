# nextjs-api-router (WIP)

> Alternative syntax for route.ts that combine multiple endpoints with TypeScript decorators.

Let's say tou have the following endpoints (an example from a real project).

- /api/users
- /api/users/me
- /api/chat-sessions
- /api/chat-sessions/[id]
- /api/chat-sessions/[id]/chat-messages

Your regular file structure is going to look like that:

```
/users
  /route.ts
  /me
    /route.ts
/chat-sessions
  /route.ts
  /[id]
    /route.ts
    /chat-messages
      /route.ts
```

With this library you need only 2 files:

```
/users/[[...]]/route.ts
/chat-sessions/[[...]]/route.ts
```

`[[...]]` folder name used for [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes) with empty segment name.


