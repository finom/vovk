import { deepStrictEqual, ok, rejects, strictEqual, throws } from 'node:assert';
import { describe, it } from 'node:test';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { forbidden, redirect, unauthorized } from 'next/dist/client/components/navigation.react-server.js';
import {
  cloneControllerMetadata,
  controllersToStaticParams,
  createDecorator,
  decorate,
  del,
  deriveTools,
  get,
  HttpException,
  HttpStatus,
  initSegment,
  JSONLinesResponder,
  multitenant,
  operation,
  patch,
  post,
  prefix,
  procedure,
  type VovkRequest,
} from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import { vovkApp } from 'vovk/internal';
import { z } from 'zod';

type Handlers = ReturnType<typeof initSegment>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// dispatches as Next.js does for app/api/[[...vovk]]/route.ts, extra params come from dynamic parent folders
const call = (
  handlers: Handlers,
  method: keyof Handlers,
  url: string,
  init: RequestInit = {},
  parentParams: Record<string, string> = {}
) => {
  const req = new Request(`http://localhost/api/${url}`, { method, ...init });
  // NextRequest's nextUrl, req.vovk.query() reads it
  Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) });
  // Next.js decodes each segment of the catch-all
  const path = new URL(req.url).pathname.split('/').slice(2).filter(Boolean).map(decodeURIComponent);
  const params = { ...parentParams, vovk: path } as Record<string, string[]>;
  return handlers[method](req, { params: Promise.resolve(params) });
};

const withNodeEnv = async (value: string, fn: () => Promise<void>) => {
  // NODE_ENV is typed read-only by the next types, override it for the duration of the case
  const env = process.env as Record<string, string | undefined>;
  const original = env.NODE_ENV;
  env.NODE_ENV = value;
  try {
    await fn();
  } finally {
    env.NODE_ENV = original;
  }
};

// an HttpException thrown through another copy of vovk: another class with the same brand
class ForeignHttpException extends Error {
  statusCode = HttpStatus.PAYMENT_REQUIRED;
}
Object.defineProperty(ForeignHttpException.prototype, Symbol.for('vovk.HttpException'), { value: true });

describe('Runtime sweep', () => {
  describe('Errors', () => {
    class ErrorBrandController {
      static thirdParty() {
        // the shape of a payment SDK error: a numeric statusCode and an internal message and cause
        throw Object.assign(new Error('Invalid API Key provided: sk_live_****abcd'), {
          statusCode: 401,
          cause: { requestId: 'req_internal_123' },
        });
      }

      static foreign() {
        throw new ForeignHttpException('Not enough credits');
      }

      static async *streamExpected() {
        yield { n: 1 };
        throw new HttpException(HttpStatus.FORBIDDEN, 'Not yours');
      }

      static async *streamThirdParty() {
        yield { n: 1 };
        throw Object.assign(new Error('Upstream refused'), { statusCode: 401 });
      }
    }
    get('third-party')(ErrorBrandController, 'thirdParty');
    get('foreign')(ErrorBrandController, 'foreign');
    get('stream-expected')(ErrorBrandController, 'streamExpected');
    get('stream-third-party')(ErrorBrandController, 'streamThirdParty');
    const handlers = initSegment({ segmentName: 'error-brand', controllers: { ErrorBrandController } });

    it('Hides an error with a numeric statusCode that is no HttpException in production', async () => {
      await withNodeEnv('production', async () => {
        const response = await call(handlers, 'GET', 'third-party');

        strictEqual(response.status, 500);
        deepStrictEqual(await response.json(), { statusCode: 500, message: 'Internal server error', isError: true });
      });
    });

    it('Keeps an HttpException from another copy of the package in production', async () => {
      await withNodeEnv('production', async () => {
        const response = await call(handlers, 'GET', 'foreign');

        strictEqual(response.status, 402);
        deepStrictEqual(await response.json(), { statusCode: 402, message: 'Not enough credits', isError: true });
      });
    });

    it('Sends the status code of an HttpException on a stream error line in production', async () => {
      await withNodeEnv('production', async () => {
        const response = await call(handlers, 'GET', 'stream-expected');
        const lines = (await response.text())
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));

        deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Not yours', statusCode: 403 }]);
      });
    });

    it('Sends no status code on the error line of an error that is no HttpException', async () => {
      await withNodeEnv('development', async () => {
        const response = await call(handlers, 'GET', 'stream-third-party');
        const lines = (await response.text())
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));

        deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Upstream refused' }]);
      });
    });
  });

  describe('Error responses', () => {
    const errors: string[] = [];
    class FailureController {
      static bigInt() {
        return { n: BigInt(1) };
      }

      static bigIntCause() {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Bad input', { n: BigInt(1) });
      }

      static notModified() {
        throw new HttpException(HttpStatus.NOT_MODIFIED, '');
      }

      static noContent() {
        throw new HttpException(HttpStatus.NO_CONTENT, '');
      }

      static unknownStatus() {
        throw new HttpException(999 as HttpStatus, 'Unknown status');
      }

      static informationalStatus() {
        throw new HttpException(HttpStatus.CONTINUE, 'Informational status');
      }

      static throwString() {
        throw 'Plain string';
      }
    }
    get('big-int', { cors: true })(FailureController, 'bigInt');
    get('big-int-cause', { cors: true })(FailureController, 'bigIntCause');
    get('not-modified')(FailureController, 'notModified');
    get('no-content')(FailureController, 'noContent');
    get('unknown-status')(FailureController, 'unknownStatus');
    get('informational-status')(FailureController, 'informationalStatus');
    get('throw-string')(FailureController, 'throwString');
    const handlers = initSegment({
      segmentName: 'failure',
      controllers: { FailureController },
      onError: (error) => {
        errors.push(error.message);
      },
    });

    it('Answers a result JSON can not serialize with a JSON 500 that keeps the CORS headers', async () => {
      errors.length = 0;
      const response = await call(handlers, 'GET', 'big-int');

      strictEqual(response.status, 500);
      strictEqual(response.headers.get('access-control-allow-origin'), '*');
      deepStrictEqual(await response.json(), {
        statusCode: 500,
        message: 'Do not know how to serialize a BigInt',
        isError: true,
      });
      deepStrictEqual(errors, ['Do not know how to serialize a BigInt']);
    });

    it('Hides the serialization error of a result in production', async () => {
      await withNodeEnv('production', async () => {
        const response = await call(handlers, 'GET', 'big-int');

        strictEqual(response.status, 500);
        deepStrictEqual(await response.json(), { statusCode: 500, message: 'Internal server error', isError: true });
      });
    });

    it('Falls back to a plain JSON 500 when the cause of an HttpException can not be serialized', async () => {
      errors.length = 0;
      const response = await call(handlers, 'GET', 'big-int-cause');

      strictEqual(response.status, 500);
      strictEqual(response.headers.get('access-control-allow-origin'), '*');
      deepStrictEqual(await response.json(), {
        statusCode: 500,
        message: 'Do not know how to serialize a BigInt',
        isError: true,
      });
      deepStrictEqual(errors, ['Bad input', 'Do not know how to serialize a BigInt']);
    });

    it('Answers an HttpException with a null body status without a body', async () => {
      const notModified = await call(handlers, 'GET', 'not-modified');
      const noContent = await call(handlers, 'GET', 'no-content');

      strictEqual(notModified.status, 304);
      strictEqual(notModified.body, null);
      strictEqual(noContent.status, 204);
      strictEqual(noContent.body, null);
    });

    it('Answers an HttpException with a status outside 200-599 with 500', async () => {
      const unknown = await call(handlers, 'GET', 'unknown-status');
      const informational = await call(handlers, 'GET', 'informational-status');

      strictEqual(unknown.status, 500);
      deepStrictEqual(await unknown.json(), { statusCode: 500, message: 'Unknown status', isError: true });
      strictEqual(informational.status, 500);
      deepStrictEqual(await informational.json(), { statusCode: 500, message: 'Informational status', isError: true });
    });

    it('Sends a thrown value that is no Error as the message', async () => {
      const response = await call(handlers, 'GET', 'throw-string');

      strictEqual(response.status, 500);
      deepStrictEqual(await response.json(), { statusCode: 500, message: 'Plain string', isError: true });
    });
  });

  describe('Next.js navigation', () => {
    class NavigationController {
      static denied() {
        forbidden();
      }

      static unauthenticated() {
        unauthorized();
      }

      static moved() {
        redirect('/elsewhere');
      }
    }
    get('denied')(NavigationController, 'denied');
    get('unauthenticated')(NavigationController, 'unauthenticated');
    get('moved')(NavigationController, 'moved');
    const handlers = initSegment({ segmentName: 'navigation', controllers: { NavigationController } });

    it('Rethrows forbidden(), unauthorized() and redirect() for Next.js to answer', async () => {
      // forbidden() and unauthorized() need the authInterrupts flag next.config sets
      process.env.__NEXT_EXPERIMENTAL_AUTH_INTERRUPTS = 'true';
      await rejects(call(handlers, 'GET', 'denied'), { digest: 'NEXT_HTTP_ERROR_FALLBACK;403' });
      await rejects(call(handlers, 'GET', 'unauthenticated'), { digest: 'NEXT_HTTP_ERROR_FALLBACK;401' });
      await rejects(call(handlers, 'GET', 'moved'), (error: { digest?: string }) =>
        Boolean(error.digest?.startsWith('NEXT_REDIRECT'))
      );
    });
  });

  describe('Routing', () => {
    it('Answers a route conflict with a JSON error and calls onError', async () => {
      const errors: string[] = [];
      class ConflictController {
        static foo() {
          return {};
        }

        static bar() {
          return {};
        }
      }
      get('hello/{foo}')(ConflictController, 'foo');
      get('hello/{bar}')(ConflictController, 'bar');
      const handlers = initSegment({
        segmentName: 'conflict',
        controllers: { ConflictController },
        onError: (error) => {
          errors.push(error.message);
        },
      });

      const response = await call(handlers, 'GET', 'hello/1');

      strictEqual(response.status, 500);
      deepStrictEqual(await response.json(), {
        statusCode: 500,
        message: 'Conflicting routes found: hello/{foo}, hello/{bar}',
        isError: true,
      });
      deepStrictEqual(errors, ['Conflicting routes found: hello/{foo}, hello/{bar}']);
    });

    it('Refuses a second handler for the same method and path in one controller', () => {
      class DuplicateController {
        static list() {
          return [];
        }

        static listAgain() {
          return [];
        }
      }
      get('users')(DuplicateController, 'list');

      throws(() => get('users')(DuplicateController, 'listAgain'), {
        message: "Duplicate route GET 'users' in DuplicateController: list and listAgain",
      });
    });

    it('Refuses decorate().handle() without a handler', () => {
      for (const decorated of [decorate(get('users')), decorate(get('users'), procedure())]) {
        throws(() => (decorated as unknown as { handle: () => unknown }).handle(), {
          message: 'decorate().handle() requires a handler function',
        });
      }
      // the handler given to the procedure instead is refused by decorate() itself
      throws(
        () =>
          decorate(
            get('users'),
            procedure().handle(async () => [])
          ),
        {
          message:
            'decorate() takes procedure(...) last and without .handle(): call .handle() on what decorate() returns',
        }
      );
    });

    it('Refuses a decorate() member without .handle() in every segment', () => {
      class UnhandledController {
        static list = decorate(get('list'), procedure());
      }
      for (const segmentName of ['unhandled', 'unhandled-again']) {
        throws(() => initSegment({ segmentName, controllers: { UnhandledController } }), {
          message: 'UnhandledController.list has no handler: call .handle() on what decorate() returns',
        });
      }
    });

    it('Refuses a procedure among the decorators of decorate(), which would reject unhandled', async () => {
      const message =
        'decorate() takes procedure(...) last and without .handle(): call .handle() on what decorate() returns';
      const defineControllers = [
        // the handler given to the procedure, and another one to decorate()
        () =>
          class DoubleHandleController {
            static list = decorate(
              get('list'),
              procedure().handle(async () => ['from the procedure'])
            ).handle(async () => ['from decorate()']);
          },
        () =>
          class ProcedureFirstController {
            static list = decorate(procedure(), get('list')).handle(async () => []);
          },
      ];
      const rejections: unknown[] = [];
      const onRejection = (reason: unknown) => rejections.push(reason);
      const errors: string[] = [];
      process.on('unhandledRejection', onRejection);
      try {
        for (const [i, defineController] of defineControllers.entries()) {
          try {
            initSegment({
              segmentName: `procedure-as-decorator-${i}`,
              controllers: { Controller: defineController() },
            });
          } catch (error) {
            errors.push((error as Error).message);
          }
        }
        await wait(20);
      } finally {
        process.off('unhandledRejection', onRejection);
      }
      deepStrictEqual(
        rejections.map((reason) => (reason as Error).message),
        []
      );
      deepStrictEqual(errors, [message, message]);
    });

    it('Refuses a decorator factory passed to decorate() uncalled', () => {
      const authGuard = createDecorator((_req, next) => next());
      // without (), the guard never runs and the route answers anyway
      throws(() => decorate(get('guarded'), authGuard).handle(async () => 'ok'), {
        message: 'decorate() argument 2 is a decorator factory: call it, and pass the decorator it returns',
      });
      for (const [factory, name] of [
        [get, 'get'],
        [get.auto, 'get.auto'],
        [post, 'post'],
        [patch, 'patch'],
        [del, 'del'],
        [operation, 'operation'],
        [operation.error, 'operation.error'],
        [operation.tool, 'operation.tool'],
        [procedure, 'procedure'],
      ] as const) {
        throws(() => decorate(factory), {
          message: `decorate() argument 1 is the factory ${name}: call it, ${name}(...)`,
        });
      }
    });

    it('Refuses a decorate() argument that returns a promise in every segment, with no unhandled rejection', async () => {
      class AsyncMiddlewareController {
        // a middleware given to decorate() itself, not through createDecorator()
        static list = decorate(async (req: Request, next: () => Promise<unknown>) => {
          if (!req.headers.get('authorization')) throw new HttpException(HttpStatus.UNAUTHORIZED, 'No authorization');
          return next();
        }, get('list')).handle(async () => []);
      }
      const rejections: unknown[] = [];
      const onRejection = (reason: unknown) => rejections.push(reason);
      const errors: string[] = [];
      process.on('unhandledRejection', onRejection);
      try {
        for (const segmentName of ['async-middleware', 'async-middleware-again']) {
          try {
            initSegment({ segmentName, controllers: { AsyncMiddlewareController } });
          } catch (error) {
            errors.push((error as Error).message);
          }
        }
        await wait(20);
      } finally {
        process.off('unhandledRejection', onRejection);
      }
      deepStrictEqual(
        rejections.map((reason) => (reason as Error).message),
        []
      );
      const message =
        'AsyncMiddlewareController.list: decorate() argument 1 returned a promise, so it is no decorator: wrap a middleware with createDecorator()';
      deepStrictEqual(errors, [message, message]);
    });

    it('Answers a path two controllers of a segment declare with a JSON error and calls onError', async () => {
      const errors: string[] = [];
      class FirstController {
        static list() {
          return 'first';
        }
      }
      class SecondController {
        static list() {
          return 'second';
        }
      }
      prefix('users')(FirstController);
      prefix('users')(SecondController);
      get()(FirstController, 'list');
      get()(SecondController, 'list');
      const handlers = initSegment({
        segmentName: 'duplicate',
        controllers: { FirstController, SecondController },
        onError: (error) => {
          errors.push(error.message);
        },
      });

      const response = await call(handlers, 'GET', 'users');

      strictEqual(response.status, 500);
      deepStrictEqual(await response.json(), {
        statusCode: 500,
        message: 'Conflicting routes found: users in FirstController, SecondController',
        isError: true,
      });
      deepStrictEqual(errors, ['Conflicting routes found: users in FirstController, SecondController']);
    });

    it('Serves a route a child controller inherits on the same path as its parent', async () => {
      class ParentController {
        static list() {
          return 'parent';
        }
      }
      prefix('users')(ParentController);
      get()(ParentController, 'list');
      class ChildController extends ParentController {}
      cloneControllerMetadata()(ChildController);
      const handlers = initSegment({ segmentName: 'inherited', controllers: { ParentController, ChildController } });

      const response = await call(handlers, 'GET', 'users');

      strictEqual(response.status, 200);
      deepStrictEqual(await response.json(), 'parent');
    });

    it('Answers a known path with another method 405 and the allowed methods', async () => {
      class EchoController {
        static echo() {
          return {};
        }

        static getItem() {
          return {};
        }

        static updateItem() {
          return {};
        }
      }
      post('echo')(EchoController, 'echo');
      get('items/{id}')(EchoController, 'getItem');
      patch('items/{id}', { cors: true })(EchoController, 'updateItem');
      const handlers = initSegment({ segmentName: 'method-not-allowed', controllers: { EchoController } });

      const response = await call(handlers, 'PUT', 'echo');

      strictEqual(response.status, 405);
      strictEqual(response.headers.get('allow'), 'POST');
      deepStrictEqual(await response.json(), {
        statusCode: 405,
        message: "Method PUT is not allowed for route 'echo' at segment 'method-not-allowed'",
        isError: true,
      });
      // a GET route answers HEAD, a cors route answers the preflight
      strictEqual((await call(handlers, 'DELETE', 'items/1')).headers.get('allow'), 'GET, HEAD, PATCH, OPTIONS');
      strictEqual((await call(handlers, 'PUT', 'missing')).status, 404);
    });

    it('Appends the params of a procedure to an auto path when skipSchemaEmission leaves them out', async () => {
      class HiddenParamsController {
        static getHidden = procedure({
          params: z.object({ id: z.string() }),
          skipSchemaEmission: ['params'],
        }).handle(async (_req, params) => params);
      }
      get.auto()(HiddenParamsController, 'getHidden');
      const handlers = initSegment({ segmentName: 'hidden-params', controllers: { HiddenParamsController } });

      const response = await call(handlers, 'GET', 'get-hidden/42');

      strictEqual(response.status, 200);
      deepStrictEqual(await response.json(), { id: '42' });
    });

    it('Reads a param whose name has characters outside \\w, as the client substitutes it', async () => {
      class DashedParamController {
        static getItem(_req: VovkRequest, params: Record<string, string>) {
          return params;
        }
      }
      get('items/{user-id}')(DashedParamController, 'getItem');
      const handlers = initSegment({ segmentName: 'dashed-param', controllers: { DashedParamController } });

      const response = await call(handlers, 'GET', 'items/42');

      strictEqual(response.status, 200);
      deepStrictEqual(await response.json(), { 'user-id': '42' });
    });

    it('Serves the routes a decorate() controller inherits over two levels in any controller order', async () => {
      class GrandparentController {
        static a = decorate(get('a')).handle(async () => 'a');
      }
      class ParentController extends GrandparentController {
        static b = decorate(get('b')).handle(async () => 'b');
      }
      class ChildController extends ParentController {
        static c = decorate(get('c')).handle(async () => 'c');
      }
      prefix('child')(ChildController);
      // the child comes first
      const handlers = initSegment({
        segmentName: 'inheritance',
        controllers: { ChildController, ParentController, GrandparentController },
      });

      for (const path of ['child/a', 'child/b', 'child/c']) {
        strictEqual((await call(handlers, 'GET', path)).status, 200, path);
      }
    });

    it('Keeps long paths out of the route match cache', async () => {
      // the gc() the test runner doesn't expose, to measure what the cache retains
      setFlagsFromString('--expose-gc');
      const gc = runInNewContext('gc') as () => void;
      class LongIdController {
        static getUser(_req: VovkRequest, params: Record<string, string>) {
          return { length: params.id.length };
        }
      }
      get('users/{id}')(LongIdController, 'getUser');
      const handlers = initSegment({ segmentName: 'long-ids', controllers: { LongIdController } });

      gc();
      const heapBefore = process.memoryUsage().heapUsed;
      for (let i = 0; i < 1000; i++) {
        await (await call(handlers, 'GET', `users/${i}-${'x'.repeat(15_000)}`)).text();
      }
      gc();
      const retained = process.memoryUsage().heapUsed - heapBefore;

      ok(
        retained < 10 * 1024 * 1024,
        `${(retained / 1024 / 1024).toFixed(1)} MB retained by 1000 requests with 15 KB ids`
      );
    });

    it('Finds the catch-all under a dynamic parent folder', async () => {
      class LocalizedController {
        static users() {
          return [{ id: 1 }];
        }
      }
      get('users')(LocalizedController, 'users');
      const handlers = initSegment({ segmentName: 'localized', controllers: { LocalizedController } });

      // app/[lang]/api/[[...vovk]]/route.ts
      const response = await call(handlers, 'GET', 'users', {}, { lang: 'en' });

      strictEqual(response.status, 200);
      deepStrictEqual(await response.json(), [{ id: 1 }]);
    });

    it('Serves a controller listed in two segments from both, each with its own onError', async () => {
      const errors: string[] = [];
      class SharedController {
        static ping() {
          return { pong: true };
        }

        static fail() {
          throw new HttpException(HttpStatus.BAD_REQUEST, 'Failed');
        }
      }
      get('ping')(SharedController, 'ping');
      get('fail')(SharedController, 'fail');
      const v1 = initSegment({
        segmentName: 'v1',
        controllers: { SharedRPC: SharedController },
        onError: () => {
          errors.push('v1');
        },
      });
      const v2 = initSegment({
        segmentName: 'v2',
        controllers: { SharedRPC: SharedController },
        onError: () => {
          errors.push('v2');
        },
      });

      strictEqual((await call(v1, 'GET', 'ping')).status, 200);
      strictEqual((await call(v2, 'GET', 'ping')).status, 200);
      await call(v1, 'GET', 'fail');
      await call(v2, 'GET', 'fail');
      deepStrictEqual(errors, ['v1', 'v2']);
    });

    describe('A clone of a decorate() controller in another segment', () => {
      const defineControllers = () => {
        class UserController {
          static prefix = 'users';

          static getUser = decorate(get('{id}'), procedure({ params: z.object({ id: z.string() }) })).handle(
            async (_req, { id }) => ({ id })
          );
        }
        class UserControllerV2 extends UserController {}
        prefix('v2')(UserControllerV2);
        cloneControllerMetadata()(UserControllerV2);
        return { UserController, UserControllerV2 };
      };
      // what the clone's segment answers at v2/1, and the path its schema emits for the RPC method
      const getServed = async (handlers: Handlers) => {
        const response = await call(handlers, 'GET', 'v2/1');
        const { schema } = await (await call(handlers, 'GET', '_schema_')).json();
        return {
          status: response.status,
          body: await response.json(),
          path: schema.controllers.UserRPC.handlers.getUser?.path,
        };
      };
      const served = { status: 200, body: { id: '1' }, path: '{id}' };

      // as on a platform that runs each route.ts in its own function
      it("Serves and emits the parent's routes when its segment is the only one loaded", async () => {
        const { UserControllerV2 } = defineControllers();

        await withNodeEnv('development', async () => {
          const v2 = initSegment({ segmentName: 'clone-alone', controllers: { UserRPC: UserControllerV2 } });

          deepStrictEqual(await getServed(v2), served);
        });
      });

      it("Serves and emits the parent's routes after the parent's own segment", async () => {
        const { UserController, UserControllerV2 } = defineControllers();

        await withNodeEnv('development', async () => {
          const v1 = initSegment({ segmentName: 'clone-parent', controllers: { UserRPC: UserController } });
          const v2 = initSegment({ segmentName: 'clone-child', controllers: { UserRPC: UserControllerV2 } });

          deepStrictEqual(await getServed(v2), served);
          strictEqual((await call(v1, 'GET', 'users/1')).status, 200);
        });
      });
    });

    it('Trims the slashes of a static prefix, as @prefix() does', async () => {
      await withNodeEnv('development', async () => {
        class MemberController {
          static prefix = '/members/';

          static getMember = decorate(get('{id}'), procedure({ params: z.object({ id: z.string() }) })).handle(
            async (_req, { id }) => ({ id })
          );
        }
        const handlers = initSegment({ segmentName: 'static-prefix', controllers: { MemberRPC: MemberController } });

        const response = await call(handlers, 'GET', 'members/1');

        strictEqual(response.status, 200);
        deepStrictEqual(await response.json(), { id: '1' });
        const { schema } = await (await call(handlers, 'GET', '_schema_')).json();
        strictEqual(schema.controllers.MemberRPC.prefix, 'members');
      });
    });
  });

  // a server component, a server action, a tools route or a unit test imports the controller, not the segment's
  // route.ts, so no initSegment has run in that process
  describe('decorate() before initSegment', () => {
    // a controller whose guard refuses a call without a user, and how many times the guard ran
    const defineSecretController = () => {
      const guard = { runs: 0 };
      const authGuard = createDecorator(async (req, next) => {
        guard.runs++;
        if (!req.vovk.meta<{ userId?: string }>().userId) {
          throw new HttpException(HttpStatus.UNAUTHORIZED, 'Missing token');
        }
        return next();
      });
      class SecretController {
        static getSecret = decorate(
          get('secret'),
          authGuard(),
          procedure({ operationObject: { summary: 'Get the secret' } })
        ).handle(async () => ({ secret: 'top secret' }));
      }
      return { SecretController, guard };
    };

    it('Runs the guard of a decorate() procedure on fn()', async () => {
      const { SecretController, guard } = defineSecretController();

      await rejects(SecretController.getSecret.fn(), { statusCode: 401, message: 'Missing token' });

      // the segment loaded later wraps the procedure no second time
      const handlers = initSegment({ segmentName: 'secret', controllers: { SecretController } });
      strictEqual((await call(handlers, 'GET', 'secret')).status, 401);
      await rejects(SecretController.getSecret.fn(), { statusCode: 401 });
      strictEqual(guard.runs, 3);
    });

    it('Runs the guard of a decorate() procedure in its derived tool', async () => {
      const { SecretController, guard } = defineSecretController();
      const [tool] = deriveTools({ modules: { SecretController } });

      deepStrictEqual(await tool.execute({}), { error: 'Missing token' });
      strictEqual(guard.runs, 1);
    });

    it('Derives a tool from the operation() of a decorate() procedure', () => {
      // the decorate() form of @operation() above @get()
      class ReportController {
        static getReport = decorate(operation({ summary: 'Get the report' }), get('report'), procedure()).handle(
          async () => ({ rows: [] })
        );
      }

      deepStrictEqual(
        deriveTools({ modules: { ReportController } }).map(({ name, title }) => ({ name, title })),
        [{ name: 'ReportController_getReport', title: 'Get the report' }]
      );
    });

    it('Serves no route of a controller deriveTools gets through a segment that does not list it', async () => {
      class MountedController {
        static a = decorate(get('a')).handle(async () => 'a');
      }
      class UnmountedController {
        static b = decorate(get('b'), procedure({ operationObject: { summary: 'Get b' } })).handle(async () => 'b');
      }
      const handlers = initSegment({ controllers: { MountedController } });

      deriveTools({ modules: { UnmountedController } });

      // deriveTools registered the route, as initSegment would
      ok(Object.hasOwn(vovkApp.routes.GET.get(UnmountedController as never) ?? {}, 'b'));
      strictEqual((await call(handlers, 'GET', 'a')).status, 200);
      strictEqual((await call(handlers, 'GET', 'b')).status, 404);
    });
  });

  describe('Responses', () => {
    let finalized = false;
    class ResponseController {
      static proxy() {
        // fetch() responses have immutable headers
        return fetch('data:application/json,{"upstream":true}');
      }

      static secure() {
        return { ok: true };
      }

      static async *ticks() {
        try {
          while (true) {
            yield { tick: true };
            await wait(5);
          }
        } finally {
          finalized = true;
        }
      }
    }
    get('proxy', { cors: true })(ResponseController, 'proxy');
    post('secure', { cors: true })(ResponseController, 'secure');
    get('ticks')(ResponseController, 'ticks');
    const handlers = initSegment({
      segmentName: 'responses',
      controllers: { ResponseController },
      onBefore: (req) => {
        if (!req.headers.get('authorization')) throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
      },
    });
    const authorized = { headers: { authorization: 'Bearer token' } };

    it('Adds the CORS headers to a fetch() response', async () => {
      const response = await call(handlers, 'GET', 'proxy', authorized);

      strictEqual(response.status, 200);
      strictEqual(response.headers.get('access-control-allow-origin'), '*');
      deepStrictEqual(await response.json(), { upstream: true });
    });

    it('Skips the segment onBefore for the CORS preflight', async () => {
      const preflight = await call(handlers, 'OPTIONS', 'secure');

      strictEqual(preflight.status, 200);
      strictEqual(preflight.headers.get('access-control-allow-origin'), '*');
      strictEqual((await call(handlers, 'POST', 'secure')).status, 401);
    });

    it('Answers HEAD from a generator GET route and returns the generator', async () => {
      finalized = false;
      const response = await call(handlers, 'HEAD', 'ticks', authorized);

      strictEqual(response.status, 200);
      strictEqual(response.body, null);
      await wait(50);
      strictEqual(finalized, true);
    });

    it('Returns the generator when onSuccess throws', async () => {
      let isReturned = false;
      class FailingOnSuccessController {
        static async *ticks() {
          try {
            while (true) {
              yield { tick: true };
              await wait(5);
            }
          } finally {
            isReturned = true;
          }
        }
      }
      get('ticks')(FailingOnSuccessController, 'ticks');
      const failingHandlers = initSegment({
        segmentName: 'failing-on-success',
        controllers: { FailingOnSuccessController },
        onSuccess: () => {
          throw new Error('onSuccess failed');
        },
      });

      const response = await call(failingHandlers, 'GET', 'ticks');

      strictEqual(response.status, 500);
      deepStrictEqual(await response.json(), { statusCode: 500, message: 'onSuccess failed', isError: true });
      await wait(50);
      strictEqual(isReturned, true);
    });
  });

  describe('CORS', () => {
    const calls: string[] = [];
    class UsersController {
      static list() {
        return [];
      }

      static create() {
        calls.push('create');
        return {};
      }

      static remove() {
        return {};
      }

      static replace() {
        return {};
      }

      static update() {
        return {};
      }
    }
    get('users', { cors: true })(UsersController, 'list');
    post('users')(UsersController, 'create');
    del('users')(UsersController, 'remove');
    post('users/{id}', { cors: true })(UsersController, 'replace');
    patch('users/{id}', { cors: true })(UsersController, 'update');
    const handlers = initSegment({ segmentName: 'cors', controllers: { UsersController } });
    const preflight = (path: string, method: string) =>
      call(handlers, 'OPTIONS', path, {
        headers: { origin: 'https://app.example', 'access-control-request-method': method },
      });

    it('Answers a preflight for a method whose route has cors', async () => {
      const response = await preflight('users', 'GET');

      strictEqual(response.status, 200);
      strictEqual(response.headers.get('access-control-allow-origin'), '*');
      strictEqual(response.headers.get('access-control-allow-methods'), 'GET, HEAD');
    });

    it('Refuses a preflight for a method whose route on the same path has no cors', async () => {
      const response = await preflight('users', 'POST');

      ok(!response.ok, `status ${response.status}`);
      strictEqual(response.headers.get('access-control-allow-origin'), null);
      strictEqual(response.headers.get('access-control-allow-methods'), null);
      deepStrictEqual(calls, []);
    });

    it('Lists the methods with cors on a templated path', async () => {
      const response = await preflight('users/1', 'PATCH');

      strictEqual(response.status, 200);
      strictEqual(response.headers.get('access-control-allow-origin'), '*');
      strictEqual(response.headers.get('access-control-allow-methods'), 'POST, PATCH');
    });
  });

  describe('JSON Lines streams', () => {
    let blobsProduced = 0;
    let ticksProduced = 0;
    let largeBlobsProduced = 0;
    let finalized = false;
    class StreamController {
      static async *blobs() {
        while (true) {
          blobsProduced++;
          yield { blob: 'x'.repeat(100_000) };
        }
      }

      static async *largeBlobs() {
        while (true) {
          largeBlobsProduced++;
          yield { blob: 'x'.repeat(1_000_000) };
        }
      }

      static async *ticks() {
        try {
          while (true) {
            ticksProduced++;
            yield { tick: ticksProduced };
            await wait(5);
          }
        } finally {
          finalized = true;
        }
      }
    }
    get('blobs')(StreamController, 'blobs');
    get('large-blobs')(StreamController, 'largeBlobs');
    get('ticks')(StreamController, 'ticks');
    const handlers = initSegment({ segmentName: 'streams', controllers: { StreamController } });

    it('Stops pulling from a generator while the client reads slower than it yields', async () => {
      const response = await call(handlers, 'GET', 'blobs');
      // the server piping the body holds a reader, a slow client keeps it from reading
      const reader = response.body?.getReader();
      ok(reader);
      await wait(300);

      ok(blobsProduced <= 3, `${blobsProduced} items of 100 KB produced for a client that read nothing`);
      await reader.cancel();
    });

    it('Bounds what a generator queues for a response that nothing reads', async () => {
      const response = await call(handlers, 'GET', 'large-blobs');
      await wait(300);

      ok(largeBlobsProduced <= 20, `${largeBlobsProduced} items of 1 MB queued for a response nothing reads`);
      await response.body?.cancel();
    });

    it('Returns the generator when the client cancels the body', async () => {
      finalized = false;
      const response = await call(handlers, 'GET', 'ticks');
      const reader = response.body?.getReader();
      ok(reader);
      await reader.read();
      await reader.read();
      await reader.cancel();
      await wait(50);

      strictEqual(finalized, true);
      const producedAtFinalize = ticksProduced;
      await wait(50);
      strictEqual(ticksProduced, producedAtFinalize);
    });

    it('Returns the generator when the request is aborted', async () => {
      finalized = false;
      const abortController = new AbortController();
      const response = await call(handlers, 'GET', 'ticks', { signal: abortController.signal });
      const reader = response.body?.getReader();
      ok(reader);
      await reader.read();
      await reader.read();
      abortController.abort();
      await wait(50);

      strictEqual(finalized, true);
    });
  });

  describe('JSON Lines responder', () => {
    const errors: string[] = [];
    let isClosedAfterClose = false;
    let finalized = false;
    class ResponderController {
      static throwAfterSend(req: VovkRequest) {
        const responder = new JSONLinesResponder<{ n: number | string }>(req);
        void responder.send({ n: 1 });
        void responder.throw(new Error('boom'));
        void responder.send({ n: 'after throw' });
        return responder;
      }

      static sendAfterClose(req: VovkRequest) {
        const responder = new JSONLinesResponder<{ n: number }>(req);
        void responder.send({ n: 1 });
        void responder.close();
        isClosedAfterClose = responder.isClosed;
        void responder.send({ n: 2 });
        return responder;
      }

      static invalidItem = procedure({ iteration: z.object({ n: z.number() }) }).handle(async (req) => {
        const responder = new JSONLinesResponder<{ n: number }>(req);
        void (async () => {
          await responder.send({ n: 'one' } as unknown as { n: number });
          await responder.send({ n: 2 });
          await responder.close();
        })();
        return responder;
      });

      static async *bigIntItem() {
        try {
          yield { n: 1 };
          yield { n: BigInt(2) };
          yield { n: 3 };
        } finally {
          finalized = true;
        }
      }

      static async *undefinedItem() {
        yield 1;
        yield undefined;
        yield 3;
      }

      static async *throwCycle() {
        yield 1;
        const cycle: Record<string, unknown> = {};
        cycle.self = cycle;
        throw cycle;
      }
    }
    get('throw-after-send')(ResponderController, 'throwAfterSend');
    get('send-after-close')(ResponderController, 'sendAfterClose');
    get('invalid-item')(ResponderController, 'invalidItem');
    get('big-int-item')(ResponderController, 'bigIntItem');
    get('undefined-item')(ResponderController, 'undefinedItem');
    get('throw-cycle')(ResponderController, 'throwCycle');
    const handlers = initSegment({
      segmentName: 'responder',
      controllers: { ResponderController },
      onError: (error) => {
        errors.push(error.message);
      },
    });
    const readLines = async (response: Response) =>
      (await response.text())
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line));

    it('Writes the error line of throw() after the earlier sends and drops the later ones', async () => {
      const lines = await readLines(await call(handlers, 'GET', 'throw-after-send'));

      deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'boom' }]);
    });

    it('Drops a send after close()', async () => {
      const lines = await readLines(await call(handlers, 'GET', 'send-after-close'));

      deepStrictEqual(lines, [{ n: 1 }]);
      strictEqual(isClosedAfterClose, true);
    });

    it('Ends the stream and calls onError when a send fails validation', async () => {
      errors.length = 0;
      const lines = await readLines(await call(handlers, 'GET', 'invalid-item'));

      strictEqual(lines.length, 1);
      strictEqual(lines[0].isError, true);
      ok(lines[0].reason.startsWith('Validation failed. Invalid iteration #0'), lines[0].reason);
      deepStrictEqual(errors, [lines[0].reason]);
    });

    it('Ends the stream, calls onError and returns the generator when an item fails to serialize', async () => {
      errors.length = 0;
      const lines = await readLines(await call(handlers, 'GET', 'big-int-item'));
      await wait(10);

      deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Do not know how to serialize a BigInt' }]);
      deepStrictEqual(errors, ['Do not know how to serialize a BigInt']);
      strictEqual(finalized, true);
    });

    it('Writes an undefined item as null, as the JSON response does', async () => {
      const response = await call(handlers, 'GET', 'undefined-item');

      strictEqual(await response.text(), '1\nnull\n3\n');
    });

    // the stream used to stay open, so a regression hangs without the timeout
    it('Ends the stream when the thrown value can not be serialized', { timeout: 1000 }, async () => {
      const lines = await readLines(await call(handlers, 'GET', 'throw-cycle'));

      deepStrictEqual(lines, [1, { isError: true, reason: '[object Object]' }]);
    });
  });

  describe('Validation', () => {
    it('Answers a wrong Content-Type with 415 before reading the body', async () => {
      let isBodyRead = false;
      class UploadController {
        static upload = procedure({ body: z.object({ a: z.string() }) }).handle(async () => ({}));
      }
      post('upload')(UploadController, 'upload');
      const handlers = initSegment({ segmentName: 'upload', controllers: { UploadController } });
      // a zero high water mark, so only a read pulls the body
      const body = new ReadableStream(
        {
          pull(controller) {
            isBodyRead = true;
            controller.enqueue(new TextEncoder().encode('{"a":"b"}'));
            controller.close();
          },
        },
        { highWaterMark: 0 }
      );

      const response = await call(handlers, 'POST', 'upload', {
        body,
        headers: { 'content-type': 'text/plain' },
        duplex: 'half',
      } as RequestInit);

      strictEqual(response.status, 415);
      strictEqual(isBodyRead, false);
    });

    it('Skips the declared content type of a procedure without a body schema for a request without a body', async () => {
      class PingController {
        static ping = procedure({ contentType: 'text/plain' }).handle(async () => ({ ok: true }));
      }
      post('ping')(PingController, 'ping');
      const handlers = initSegment({ segmentName: 'typed-ping', controllers: { PingController } });

      strictEqual((await call(handlers, 'POST', 'ping')).status, 200);
      strictEqual(
        (await call(handlers, 'POST', 'ping', { headers: { 'content-type': 'application/json' }, body: '{}' })).status,
        415
      );
    });

    it('Enforces the declared content type of a procedure without a body schema for a chunked body', async () => {
      class EchoController {
        static echo = procedure({ contentType: 'text/plain' }).handle(async (req) => ({ body: await req.vovk.body() }));
      }
      post('echo')(EchoController, 'echo');
      const handlers = initSegment({ segmentName: 'typed-echo', controllers: { EchoController } });
      // a chunked request carries its transfer-encoding header and no content-length
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"admin":true}'));
          controller.close();
        },
      });

      const response = await call(handlers, 'POST', 'echo', {
        body,
        headers: { 'transfer-encoding': 'chunked' },
        duplex: 'half',
      } as RequestInit);

      strictEqual(response.status, 415);
    });

    it('Passes the validated params to the handler through fn()', async () => {
      const getItem = procedure({ params: z.object({ id: z.coerce.number() }) }).handle(async (_req, params) => params);

      deepStrictEqual(await getItem.fn({ params: { id: '5', ownerId: 'someone-else' } as unknown as { id: number } }), {
        id: 5,
      });
    });

    it('Lists the first 20 issues of an invalid body', async () => {
      class TagController {
        static tags = procedure({ body: z.object({ tags: z.array(z.string()) }) }).handle(async () => ({ ok: true }));
      }
      post('tags')(TagController, 'tags');
      const handlers = initSegment({ segmentName: 'tags', controllers: { TagController } });

      const response = await call(handlers, 'POST', 'tags', {
        body: JSON.stringify({ tags: new Array(100_000).fill(0) }),
        headers: { 'content-type': 'application/json' },
      });
      const { message, cause } = await response.json();
      const issues = Array.from(
        { length: 20 },
        (_, i) => `Invalid input: expected string, received number at tags.${i}`
      );

      strictEqual(response.status, 400);
      strictEqual(message, `Validation failed. Invalid body: ${issues.join(', ')}, and 99980 more`);
      strictEqual(cause.issues.length, 20);
    });

    it('Validates a body that a decorator and the segment onBefore read first', async () => {
      const ownerGuard = createDecorator(async (req: VovkRequest<{ ownerId: string }>, next) => {
        const { ownerId } = await req.vovk.body();
        if (ownerId !== 'me') throw new HttpException(HttpStatus.FORBIDDEN, 'Not yours');
        return next();
      });
      class NoteController {
        static create = procedure({ body: z.object({ ownerId: z.string(), title: z.string() }) }).handle(
          async (req) => ({ body: await req.vovk.body(), text: await req.text() })
        );
      }
      ownerGuard()(NoteController, 'create');
      post('create')(NoteController, 'create');
      const bodiesBefore: unknown[] = [];
      const handlers = initSegment({
        segmentName: 'notes',
        controllers: { NoteController },
        onBefore: async (req) => {
          bodiesBefore.push(await req.vovk.body());
        },
      });
      const text = JSON.stringify({ ownerId: 'me', title: 'Hello' });

      const response = await call(handlers, 'POST', 'create', {
        body: text,
        headers: { 'content-type': 'application/json' },
      });

      strictEqual(response.status, 200);
      deepStrictEqual(await response.json(), { body: { ownerId: 'me', title: 'Hello' }, text });
      deepStrictEqual(bodiesBefore, [{ ownerId: 'me', title: 'Hello' }]);
    });

    it('Lets a decorator copy a request whose body was validated, to forward or log it', async () => {
      const forward = createDecorator(async (req, next) => {
        const result = await next();
        const upstream = 'http://upstream.example/notes';
        return {
          result,
          cloned: await req.clone().text(),
          copied: await new Request(upstream, req).text(),
          // as fetch(upstream, init) builds its request
          forwarded: await new Request(upstream, {
            method: req.method,
            headers: req.headers,
            body: req.body,
            duplex: 'half',
          } as RequestInit).text(),
        };
      });
      class ForwardController {
        static create = procedure({ body: z.object({ title: z.string() }) }).handle(async (req) => req.vovk.body());
      }
      forward()(ForwardController, 'create');
      post('create')(ForwardController, 'create');
      const handlers = initSegment({ segmentName: 'forward', controllers: { ForwardController } });
      const text = JSON.stringify({ title: 'Hello' });

      const response = await call(handlers, 'POST', 'create', {
        body: text,
        headers: { 'content-type': 'application/json' },
      });

      strictEqual(response.status, 200);
      deepStrictEqual(await response.json(), {
        result: { title: 'Hello' },
        cloned: text,
        copied: text,
        forwarded: text,
      });
    });

    it('Validates a missing body as undefined, so an optional body can be left out', async () => {
      class DraftController {
        static optional = procedure({ body: z.object({ title: z.string() }).optional() }).handle(async (req) => ({
          body: (await req.vovk.body()) ?? 'none',
        }));

        static required = procedure({ body: z.object({ title: z.string() }) }).handle(async () => ({ ok: true }));
      }
      post('optional')(DraftController, 'optional');
      post('required')(DraftController, 'required');
      const handlers = initSegment({ segmentName: 'drafts', controllers: { DraftController } });

      const optional = await call(handlers, 'POST', 'optional');
      strictEqual(optional.status, 200);
      deepStrictEqual(await optional.json(), { body: 'none' });
      deepStrictEqual(await DraftController.optional.fn(), { body: 'none' });

      const required = await call(handlers, 'POST', 'required');
      strictEqual(required.status, 400);
      strictEqual(
        (await required.json()).message,
        'Validation failed. Invalid body: Invalid input: expected object, received undefined'
      );
    });

    it('Validates the items of a sync generator', async () => {
      class CountController {
        static count = procedure({ iteration: z.object({ n: z.number() }) }).handle(function* () {
          yield { n: 1 };
          yield { n: 2 };
        });

        static wrong = procedure({ iteration: z.object({ n: z.number() }) }).handle(function* () {
          yield { n: 'one' };
        });
      }
      get('count')(CountController, 'count');
      get('wrong')(CountController, 'wrong');
      const handlers = initSegment({ segmentName: 'count', controllers: { CountController } });
      const readLines = async (response: Response) =>
        (await response.text())
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));

      const response = await call(handlers, 'GET', 'count');

      strictEqual(response.status, 200);
      deepStrictEqual(await readLines(response), [{ n: 1 }, { n: 2 }]);
      deepStrictEqual(await readLines(await call(handlers, 'GET', 'wrong')), [
        {
          isError: true,
          reason: 'Validation failed. Invalid iteration #0: Invalid input: expected number, received string at n',
        },
      ]);
    });

    it('Names the file of a binary body after filename* first', async () => {
      class FileController {
        static upload = procedure({ contentType: 'application/octet-stream', body: z.file() }).handle(async (req) => ({
          name: (await req.vovk.body()).name,
        }));
      }
      post('upload')(FileController, 'upload');
      const handlers = initSegment({ segmentName: 'files', controllers: { FileController } });
      const upload = async (disposition: string) => {
        const response = await call(handlers, 'POST', 'upload', {
          body: new Uint8Array([37, 80, 68, 70]),
          headers: { 'content-type': 'application/octet-stream', 'content-disposition': disposition },
        });
        return (await response.json()).name;
      };

      // what the TypeScript client sends for a File named résumé.pdf
      strictEqual(
        await upload(`attachment; filename="r_sum_.pdf"; filename*=UTF-8''r%C3%A9sum%C3%A9.pdf`),
        'résumé.pdf'
      );
      strictEqual(await upload('attachment; filename="say \\"hi\\".pdf"'), 'say "hi".pdf');
      strictEqual(await upload('attachment; FILENAME=report.pdf'), 'report.pdf');
      strictEqual(await upload(`attachment; filename*=UTF-8''%E0%A4%A; filename="fallback.pdf"`), 'fallback.pdf');
      strictEqual(await upload('attachment; filename=""'), 'file');
      strictEqual(await upload('attachment'), 'file');
    });

    it('Serves the schema of a segment with a type JSON Schema cannot describe', async () => {
      await withNodeEnv('development', async () => {
        class EventController {
          static list = procedure({ query: z.object({ from: z.coerce.date() }) }).handle(async (req) =>
            req.vovk.query()
          );

          static day = procedure({ params: z.object({ date: z.coerce.date() }) }).handle(
            async (_req, params) => params
          );
        }
        get('events')(EventController, 'list');
        get.auto()(EventController, 'day');
        const handlers = initSegment({ segmentName: 'events', controllers: { EventRPC: EventController } });

        const response = await call(handlers, 'GET', '_schema_');
        const { schema } = await response.json();

        strictEqual(response.status, 200);
        deepStrictEqual(schema.controllers.EventRPC.handlers.list.validation.query.properties, { from: {} });
        strictEqual(schema.controllers.EventRPC.handlers.day.path, 'day/{date}');
      });
    });
  });

  // a client sends a body as the content type the schema declares for it, which a hidden body schema must keep
  describe('Content types of a hidden body schema', () => {
    const defineController = (skipSchemaEmission?: ['body']) => {
      class ImportController {
        static csv = procedure({ contentType: 'text/csv', body: z.string(), skipSchemaEmission }).handle(
          async (req) => ({ rows: (await req.vovk.body()).split('\n').length })
        );

        static form = procedure({
          contentType: 'multipart/form-data',
          body: z.object({ name: z.string() }),
          skipSchemaEmission,
        }).handle(async (req) => req.vovk.body());

        static pdf = procedure({ contentType: 'application/pdf', body: z.file(), skipSchemaEmission }).handle(
          async (req) => ({ size: (await req.vovk.body()).size })
        );
      }
      post('csv')(ImportController, 'csv');
      post('form')(ImportController, 'form');
      post('pdf')(ImportController, 'pdf');
      return ImportController;
    };

    // the results of the calls of an RPC module built from the schema the segment serves, as the generated client is
    const callThroughClient = async (
      segmentName: string,
      ImportController: ReturnType<typeof defineController>,
      exposeValidation?: boolean
    ) => {
      let handlers = {} as Handlers;
      await withNodeEnv('development', async () => {
        handlers = initSegment({ segmentName, controllers: { ImportRPC: ImportController }, exposeValidation });
      });
      const { schema } = await (await call(handlers, 'GET', '_schema_')).json();
      // the body schema itself stays hidden
      for (const { validation } of Object.values<{ validation?: { body?: object } }>(
        schema.controllers.ImportRPC.handlers
      )) {
        ok(!validation?.body || !('type' in validation.body));
      }
      const ImportRPC = createRPC<typeof ImportController>(
        { segments: { [segmentName]: schema } },
        segmentName,
        'ImportRPC',
        undefined,
        { apiRoot: 'http://localhost/api' }
      );
      const original = globalThis.fetch;
      // routed as Next.js routes app/api/<segmentName>/[[...vovk]]/route.ts
      globalThis.fetch = (async (url: string, init: RequestInit) => {
        const req = new Request(url, init);
        const path = new URL(req.url).pathname.split('/').slice(3);
        return handlers[req.method as keyof Handlers](req, { params: Promise.resolve({ vovk: path }) });
      }) as typeof fetch;
      const outcome = (promise: Promise<unknown>) =>
        promise.catch((error: HttpException) => `${error.statusCode} ${error.message}`);
      try {
        return await Promise.all([
          outcome(ImportRPC.csv({ body: 'a,b\nc,d' })),
          outcome(ImportRPC.form({ body: { name: 'me' } })),
          outcome(ImportRPC.pdf({ body: new File(['%PDF'], 'report.pdf') })),
        ]);
      } finally {
        globalThis.fetch = original;
      }
    };
    const results = [{ rows: 2 }, { name: 'me' }, { size: 4 }];

    it('Reach the client when exposeValidation is false', async () => {
      deepStrictEqual(await callThroughClient('hidden-validation', defineController(), false), results);
    });

    it('Reach the client when skipSchemaEmission skips the body', async () => {
      deepStrictEqual(await callThroughClient('skipped-body', defineController(['body'])), results);
    });

    it('Leave out the content type of a body whose JSON Schema cannot be built when exposeValidation is false', async () => {
      const throwConversion = (): Record<string, unknown> => {
        throw new Error('No JSON Schema for this type');
      };
      // a Standard Schema whose JSON Schema conversion throws
      const opaque = {
        '~standard': {
          version: 1 as const,
          vendor: 'opaque',
          validate: (value: unknown) => ({ value }),
          jsonSchema: { input: throwConversion, output: throwConversion },
        },
      };
      class OpaqueController {
        static upload = procedure({ contentType: 'text/csv', body: opaque }).handle(async () => ({ ok: true }));
      }
      post('upload')(OpaqueController, 'upload');
      let handlers = {} as Handlers;
      await withNodeEnv('development', async () => {
        handlers = initSegment({
          segmentName: 'opaque-body',
          controllers: { OpaqueRPC: OpaqueController },
          exposeValidation: false,
        });
      });

      const response = await call(handlers, 'GET', '_schema_');

      strictEqual(response.status, 200);
      deepStrictEqual((await response.json()).schema.controllers.OpaqueRPC.handlers.upload, {
        path: 'upload',
        httpMethod: 'POST',
      });
    });
  });

  describe('Query', () => {
    class SearchController {
      static search(req: VovkRequest) {
        return req.vovk.query();
      }
    }
    get('search')(SearchController, 'search');
    const handlers = initSegment({ segmentName: 'search', controllers: { SearchController } });

    it('Answers a malformed percent-encoding with 400', async () => {
      const response = await call(handlers, 'GET', 'search?q=%E0%A4%A');

      strictEqual(response.status, 400);
      deepStrictEqual(await response.json(), {
        statusCode: 400,
        message: 'Malformed query string: %E0%A4%A',
        isError: true,
      });
    });

    it('Decodes + as a space', async () => {
      const response = await call(handlers, 'GET', `search?${new URLSearchParams({ q: 'new york', tag: 'a+b' })}`);

      deepStrictEqual(await response.json(), { q: 'new york', tag: 'a+b' });
    });

    it('Collects the values of a repeated key, and keeps the last value of a repeated index', async () => {
      const response = await call(
        handlers,
        'GET',
        'search?tag=a&tag=b&filter[status]=open&filter[status]=closed&page[0]=1&page[0]=2'
      );

      deepStrictEqual(await response.json(), {
        tag: ['a', 'b'],
        filter: { status: ['open', 'closed'] },
        page: ['2'],
      });
    });

    it('Keeps a plain value given before the same key with []', async () => {
      const response = await call(handlers, 'GET', 'search?x=1&x[]=2&y=1&y[]=2&y[]=3');

      deepStrictEqual(await response.json(), { x: ['1', '2'], y: ['1', '2', '3'] });
    });

    it('Appends [] after the highest index', async () => {
      const response = await call(handlers, 'GET', 'search?a[1]=x&a[]=y&b[0]=x&b[2]=z&b[]=y&c[]=1&c[]=2');

      deepStrictEqual(await response.json(), {
        a: { 1: 'x', 2: 'y' },
        b: { 0: 'x', 2: 'z', 3: 'y' },
        c: ['1', '2'],
      });
    });

    it('Fills the last element of [] until it holds the key again', async () => {
      const response = await call(
        handlers,
        'GET',
        'search?items[][name]=a&items[][price]=1&items[][name]=b&tags[][list][]=x&tags[][list][]=y'
      );

      deepStrictEqual(await response.json(), {
        items: [{ name: 'a', price: '1' }, { name: 'b' }],
        tags: [{ list: ['x', 'y'] }],
      });
    });

    it('Answers a key nested deeper than 32 levels with 400', async () => {
      const errors: string[] = [];
      const guarded = initSegment({
        segmentName: 'search-depth',
        controllers: { SearchController },
        onError: (error) => {
          errors.push(error.constructor.name);
        },
      });

      const deepest = await call(guarded, 'GET', `search?a${'[b]'.repeat(32)}=1`);
      strictEqual(deepest.status, 200);

      const response = await call(guarded, 'GET', `search?a${'[]'.repeat(3000)}=1`);

      strictEqual(response.status, 400);
      deepStrictEqual(await response.json(), {
        statusCode: 400,
        message: 'Query string nested deeper than 32 levels',
        isError: true,
      });
      deepStrictEqual(errors, ['HttpException']);
    });
  });

  describe('controllersToStaticParams', () => {
    it('Fills the params of the prefix and keeps a value with a slash in one segment', () => {
      class PostsController {
        static list() {
          return [];
        }

        static getPost() {
          return {};
        }
      }
      prefix('users/{userId}')(PostsController);
      get('posts', { staticParams: [{ userId: '1' }, { userId: '2' }] })(PostsController, 'list');
      get('posts/{postId}', { staticParams: [{ userId: '1', postId: 'a/b' }] })(PostsController, 'getPost');

      const staticParams = controllersToStaticParams({ PostsController });

      deepStrictEqual(
        staticParams.map(({ vovk }) => vovk),
        [['_schema_'], ['users', '1', 'posts'], ['users', '2', 'posts'], ['users', '1', 'posts', 'a/b']]
      );
    });
  });

  describe('multitenant', () => {
    it('Treats an empty from as the prefix of every path', () => {
      const result = multitenant({
        requestUrl: 'https://admin.example.com/settings/users?tab=2',
        requestHost: 'admin.example.com',
        targetHost: 'example.com',
        overrides: {
          admin: [
            { from: 'api', to: 'api/admin' },
            { from: '', to: 'admin' },
          ],
        },
      });

      strictEqual(result.action, 'rewrite');
      strictEqual(result.destination, 'https://admin.example.com/admin/settings/users?tab=2');
    });
  });

  // SEC-01: grouping repeated field names by copying the array on every repeat cost O(N^2), so a few hundred KB of
  // `a&a&...` blocked the server for seconds before validation, on any endpoint that reads a form body
  describe('Form body with a repeated field name', () => {
    class RepeatedFieldController {
      static form = procedure({
        contentType: 'application/x-www-form-urlencoded',
        body: z.object({ name: z.string() }),
      }).handle(async (req: VovkRequest<{ name: string }>) => ({ name: (await req.vovk.body()).name }));
    }
    post('form')(RepeatedFieldController, 'form');
    const handlers = initSegment({ segmentName: 'repeated-field', controllers: { RepeatedFieldController } });

    it('parses a body that repeats one field name 100000 times in linear time', async () => {
      const body = `${'a&'.repeat(100_000)}name=x`;
      const started = Date.now();
      const response = await call(handlers, 'POST', 'form', {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body,
      });
      const elapsed = Date.now() - started;

      strictEqual(response.status, 200);
      deepStrictEqual(await response.json(), { name: 'x' });
      // the same byte count with distinct names parses in tens of ms; the quadratic path takes several seconds
      ok(elapsed < 3000, `parsing ${Math.round(body.length / 1024)} KB of repeated keys took ${elapsed} ms`);
    });
  });
});
