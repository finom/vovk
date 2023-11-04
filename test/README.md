This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

To run unit tests only use `npm run unit` from the root of the project. To run all tests (unit, ESLint, tsc) use `npm t`.

Cases covered by the unit tests:

- Global router
- Isolated router
- Normal NextJS route (check if its not broken)
- All decorators
- Custom decorator
- Custom decorator created with `createDecorator`
- Errors
- Path variations (`/foo`, `foo/`, `/foo/`, `foo`)
- Multiple parameters (`/:foo/:bar`)
- Conflicting parameters (`/:foo/:bar/:foo`)
- Conflicting routes (`GET /foo/:bar` vs `GET /foo/:baz`)
- Query (`?foo=bar`)
- HTTP body
- Route doesn't exist or method isn't supported
- If `NextResponse` was returned
- If `Response` was returned
- Get header with `next/headers`
- Redirect with `next/navigation`

