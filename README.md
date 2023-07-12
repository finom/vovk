# nextjs-api-router (WIP)

> Alternative syntax for route.ts that combine multiple endpoints with TypeScript decorators.

**Warning**

The project does not have unit tests which means it's supposed to be used for experimental purposes only, but not for production apps. I'm going to add them in case if the idea actually looks interesting to other developers. For now it's just a personal project that I can install with NPM instead of copy-pasting the file every time.

Also worthy to mention that the router doesn't support dynamoc routes (`foo/:id/bar`) and you need to use query parameters instead.

----------------

Let's say tou have the following endpoints (an example from a real project).

- /api/users
- /api/users/me
- /api/chat-sessions
- /api/chat-sessions/chat-messages

Your regular file structure is going to look like that:

```
/users
  /route.ts
  /me
    /route.ts
/chat-sessions
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






