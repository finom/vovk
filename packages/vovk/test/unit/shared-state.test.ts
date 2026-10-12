import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import {
  cloneControllerMetadata,
  controllersToStaticParams,
  createDecorator,
  deriveTools,
  get,
  HttpException,
  HttpStatus,
  initSegment,
  operation,
  post,
  prefix,
  procedure,
  type VovkRequest,
} from 'vovk';
import type { VovkHandlerSchema } from 'vovk/create-rpc';
import { z } from 'zod';

type Handlers = ReturnType<typeof initSegment>;

// dispatches as Next.js does for app/api/[[...vovk]]/route.ts
const call = (handlers: Handlers, method: keyof Handlers, url: string, init: RequestInit = {}) => {
  const req = new Request(`http://localhost/api/${url}`, { method, ...init });
  // NextRequest's nextUrl, req.vovk.query() reads it
  Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) });
  // Next.js decodes each segment of the catch-all
  const path = new URL(req.url).pathname.split('/').slice(2).filter(Boolean).map(decodeURIComponent);
  return handlers[method](req, { params: Promise.resolve({ vovk: path }) });
};

// GET answers _schema_ only in development, as vovk dev reads it
const initSegmentInDevelopment = (options: Parameters<typeof initSegment>[0]) => {
  // NODE_ENV is typed read-only by the next types, override it while the segment is made
  const env = process.env as Record<string, string | undefined>;
  const original = env.NODE_ENV;
  env.NODE_ENV = 'development';
  try {
    return initSegment(options);
  } finally {
    env.NODE_ENV = original;
  }
};

const getHandlerNames = async (handlers: Handlers, rpcModuleName: string) => {
  const { schema } = await (await call(handlers, 'GET', '_schema_')).json();
  return Object.keys(schema.controllers[rpcModuleName].handlers);
};

// the RBAC guard of the decorator examples page, reduced to a header check
const roleGuard = createDecorator((req: VovkRequest, next, role: string) => {
  if (req.headers.get('x-role') !== role) throw new HttpException(HttpStatus.FORBIDDEN, `${role} only`);
  return next();
});

describe('Shared state', () => {
  describe('A procedure on two routes', () => {
    it('Runs the guard of each route', async () => {
      // a validated service, as the fn page shows, whose procedure two controllers attach
      class UserProcedures {
        static getUser = procedure().handle((_req, params) => ({ id: params.id }));
      }
      class AdminUserController {
        static getUser = UserProcedures.getUser;
      }
      // @get('{id}') @roleGuard('admin')
      roleGuard('admin')(AdminUserController, 'getUser');
      get('{id}')(AdminUserController, 'getUser');
      prefix('admin/users')(AdminUserController);
      class UserController {
        static getUser = UserProcedures.getUser;
      }
      roleGuard('user')(UserController, 'getUser');
      get('{id}')(UserController, 'getUser');
      prefix('users')(UserController);
      const handlers = initSegment({
        segmentName: 'shared-procedure-guards',
        controllers: { AdminUserRPC: AdminUserController, UserRPC: UserController },
      });

      const status = async (url: string, role: string) =>
        (await call(handlers, 'GET', url, { headers: { 'x-role': role } })).status;

      deepStrictEqual(
        {
          adminRouteAsUser: await status('admin/users/1', 'user'),
          adminRouteAsAdmin: await status('admin/users/1', 'admin'),
          userRouteAsUser: await status('users/1', 'user'),
          userRouteAsAdmin: await status('users/1', 'admin'),
        },
        { adminRouteAsUser: 403, adminRouteAsAdmin: 200, userRouteAsUser: 200, userRouteAsAdmin: 403 }
      );
    });

    it('Keeps the guard of a route when another controller attaches the procedure without one', async () => {
      const stats = procedure().handle(() => ({ users: 42 }));
      class AdminStatsController {
        static stats = stats;
      }
      roleGuard('admin')(AdminStatsController, 'stats');
      get('stats')(AdminStatsController, 'stats');
      prefix('admin')(AdminStatsController);
      const handlers = initSegment({
        segmentName: 'shared-procedure-unguarded',
        controllers: { AdminStatsRPC: AdminStatsController },
      });
      // in another module, not even in this segment
      class PublicStatsController {
        static stats = stats;
      }
      get('stats')(PublicStatsController, 'stats');

      strictEqual((await call(handlers, 'GET', 'admin/stats')).status, 403);
    });

    it('Runs the guard of the member a local call goes through', async () => {
      // a local call has no headers, the guard reads the meta the caller passes
      const metaRoleGuard = createDecorator((req: VovkRequest, next, role: string) => {
        if (req.vovk.meta<{ role?: string }>().role !== role) {
          throw new HttpException(HttpStatus.FORBIDDEN, 'Forbidden');
        }
        return next();
      });
      const getReport = procedure().handle(() => ({ total: 1 }));
      class AdminReportController {
        static getReport = getReport;
      }
      metaRoleGuard('admin')(AdminReportController, 'getReport');
      get('report')(AdminReportController, 'getReport');
      class UserReportController {
        static getReport = getReport;
      }
      metaRoleGuard('user')(UserReportController, 'getReport');
      get('report')(UserReportController, 'getReport');

      const asRole = async (role: string) => {
        try {
          await AdminReportController.getReport.fn({ meta: { role } });
          return 'ran';
        } catch (error) {
          return (error as HttpException).statusCode;
        }
      };

      deepStrictEqual(
        { asUser: await asRole('user'), asAdmin: await asRole('admin') },
        { asUser: 403, asAdmin: 'ran' }
      );
    });

    it('Keeps the before hook and the headers of each route', async () => {
      const requireToken = (req: VovkRequest) => {
        if (req.headers.get('authorization') !== 'Bearer secret') {
          throw new HttpException(HttpStatus.UNAUTHORIZED, 'Token required');
        }
      };
      const report = procedure().handle(() => ({ total: 1 }));
      class PrivateReportController {
        static report = report;
      }
      get('report', { before: requireToken })(PrivateReportController, 'report');
      prefix('private')(PrivateReportController);
      class PublicReportController {
        static report = report;
      }
      get('report', { cors: true, headers: { 'cache-control': 'public, s-maxage=60' } })(
        PublicReportController,
        'report'
      );
      prefix('public')(PublicReportController);
      const handlers = initSegment({
        segmentName: 'shared-procedure-options',
        controllers: { PrivateReportRPC: PrivateReportController, PublicReportRPC: PublicReportController },
      });

      const withoutToken = await call(handlers, 'GET', 'private/report');
      const withToken = await call(handlers, 'GET', 'private/report', { headers: { authorization: 'Bearer secret' } });
      const publicResponse = await call(handlers, 'GET', 'public/report');

      deepStrictEqual(
        {
          privateWithoutToken: withoutToken.status,
          privateCacheControl: withToken.headers.get('cache-control'),
          privateCors: withToken.headers.get('access-control-allow-origin'),
          publicStatus: publicResponse.status,
          publicCacheControl: publicResponse.headers.get('cache-control'),
          publicCors: publicResponse.headers.get('access-control-allow-origin'),
        },
        {
          privateWithoutToken: 401,
          privateCacheControl: null,
          privateCors: null,
          publicStatus: 200,
          publicCacheControl: 'public, s-maxage=60',
          publicCors: '*',
        }
      );
    });

    it('Runs a decorator placed above the HTTP decorator on the route and in fn()', async () => {
      const greet = createDecorator((req: VovkRequest, next, greeting: string) => {
        req.vovk.meta({ greeting });
        return next();
      });
      class GreetingController {
        static greet = procedure().handle(({ vovk }) => ({ greeting: vovk.meta<{ greeting?: string }>().greeting }));
      }
      // @greet('hello') @get('greeting')
      get('greeting')(GreetingController, 'greet');
      greet('hello')(GreetingController, 'greet');
      const handlers = initSegment({
        segmentName: 'decorator-above',
        controllers: { GreetingRPC: GreetingController },
      });

      deepStrictEqual(
        {
          route: await (await call(handlers, 'GET', 'greeting')).json(),
          fn: await GreetingController.greet.fn(),
        },
        { route: { greeting: 'hello' }, fn: { greeting: 'hello' } }
      );
    });

    it('Runs no controller decorators in fn() of the procedure itself, nor in its tool', async () => {
      class ReportProcedures {
        static getReport = procedure({ operationObject: { summary: 'Get the report' } }).handle(() => ({ total: 1 }));
      }
      class AdminReportController {
        static getReport = ReportProcedures.getReport;
      }
      roleGuard('admin')(AdminReportController, 'getReport');
      get('report')(AdminReportController, 'getReport');
      const [tool] = deriveTools({ modules: { ReportProcedures } });

      deepStrictEqual(
        { fn: await ReportProcedures.getReport.fn(), tool: await tool.execute({}) },
        { fn: { total: 1 }, tool: { total: 1 } }
      );
    });
  });

  describe('A member that another controller reuses', () => {
    it("Carries the schema its decorators added, which the controller's own decorators override", async () => {
      class UserController {
        static getUser = procedure().handle(() => ({ id: '1' }));
      }
      // @operation({ summary: 'Get a user' }) @get('{id}')
      get('{id}')(UserController, 'getUser');
      operation({ summary: 'Get a user' })(UserController, 'getUser');
      // the decorated member itself, on a route of its own
      class AdminUserController {
        static getUser = UserController.getUser;
      }
      get('admin/{id}')(AdminUserController, 'getUser');
      class SupportUserController {
        static getUser = UserController.getUser;
      }
      get('support/{id}')(SupportUserController, 'getUser');
      operation({ summary: 'Get a user for support' })(SupportUserController, 'getUser');
      const handlers = initSegmentInDevelopment({
        segmentName: 'reused-member',
        controllers: {
          UserRPC: UserController,
          AdminUserRPC: AdminUserController,
          SupportUserRPC: SupportUserController,
        },
      });
      const { schema } = await (await call(handlers, 'GET', '_schema_')).json();
      const getEmitted = (rpcModuleName: string) => {
        const { path, operationObject } = schema.controllers[rpcModuleName].handlers.getUser;
        return { path, summary: operationObject?.summary };
      };
      const getMember = ({ schema: { path, operationObject } }: { schema: VovkHandlerSchema }) => ({
        path,
        summary: operationObject?.summary,
      });
      const getToolTitles = (modules: Record<string, object>) => deriveTools({ modules }).map(({ title }) => title);

      deepStrictEqual(
        {
          members: [UserController, AdminUserController, SupportUserController].map(({ getUser }) =>
            getMember(getUser)
          ),
          emitted: ['UserRPC', 'AdminUserRPC', 'SupportUserRPC'].map(getEmitted),
          tools: (
            [{ UserController }, { AdminUserController }, { SupportUserController }] as Record<string, object>[]
          ).map(getToolTitles),
        },
        {
          members: [
            { path: '{id}', summary: 'Get a user' },
            { path: 'admin/{id}', summary: 'Get a user' },
            { path: 'support/{id}', summary: 'Get a user for support' },
          ],
          emitted: [
            { path: '{id}', summary: 'Get a user' },
            { path: 'admin/{id}', summary: 'Get a user' },
            { path: 'support/{id}', summary: 'Get a user for support' },
          ],
          tools: [['Get a user'], ['Get a user'], ['Get a user for support']],
        }
      );
    });

    it('Gives each controller its own copy of a procedure attached without decorators', async () => {
      class UserProcedures {
        static getUser = procedure({ operationObject: { summary: 'Get a user' } }).handle((_req, params) => ({
          id: params.id,
        }));
      }
      class UserController {
        static getUser = UserProcedures.getUser;
      }
      get('{id}')(UserController, 'getUser');
      prefix('users')(UserController);
      class AdminUserController {
        static getUser = UserProcedures.getUser;
      }
      get('admin/{id}')(AdminUserController, 'getUser');
      const handlers = initSegmentInDevelopment({
        segmentName: 'copied-procedure',
        controllers: { UserRPC: UserController, AdminUserRPC: AdminUserController },
      });
      const { schema } = await (await call(handlers, 'GET', '_schema_')).json();

      deepStrictEqual(
        {
          copies:
            UserController.getUser !== AdminUserController.getUser && UserController.getUser !== UserProcedures.getUser,
          paths: [UserProcedures, UserController, AdminUserController].map(({ getUser }) => getUser.schema.path),
          emitted: ['UserRPC', 'AdminUserRPC'].map((name) => schema.controllers[name].handlers.getUser.path),
          fn: await Promise.all(
            [UserProcedures, UserController, AdminUserController].map(({ getUser }) =>
              getUser.fn({ params: { id: '1' } })
            )
          ),
          tools: ([{ UserProcedures }, { UserController }, { AdminUserController }] as Record<string, object>[]).map(
            (modules) => deriveTools({ modules }).length
          ),
          routes: [(await call(handlers, 'GET', 'users/1')).status, (await call(handlers, 'GET', 'admin/1')).status],
        },
        {
          copies: true,
          paths: [undefined, '{id}', 'admin/{id}'],
          emitted: ['{id}', 'admin/{id}'],
          fn: [{ id: '1' }, { id: '1' }, { id: '1' }],
          tools: [1, 1, 1],
          routes: [200, 200],
        }
      );
    });
  });

  describe('A controller that clones another one', () => {
    const adminGuard = createDecorator((req: VovkRequest, next) => {
      if (req.headers.get('authorization') !== 'Bearer admin') {
        throw new HttpException(HttpStatus.UNAUTHORIZED, 'Admins only');
      }
      return next();
    });

    it("Serves the parent's member with its guard where the clone overrides it with a plain method", async () => {
      class SecretController {
        static secret() {
          return 'parent';
        }
      }
      adminGuard()(SecretController, 'secret');
      get('secret')(SecretController, 'secret');
      prefix('secrets')(SecretController);
      class ChildSecretController extends SecretController {
        static secret() {
          return 'child';
        }
      }
      prefix('child-secrets')(ChildSecretController);
      cloneControllerMetadata()(ChildSecretController);
      const handlers = initSegment({
        segmentName: 'clone-override',
        controllers: { SecretRPC: SecretController, ChildSecretRPC: ChildSecretController },
      });

      strictEqual((await call(handlers, 'GET', 'child-secrets/secret')).status, 401);
    });

    it('Keeps the guard a clone adds to an inherited procedure off the route of the parent', async () => {
      class UserController {
        static getUser = procedure().handle((_req, params) => ({ id: params.id }));
      }
      get('{id}')(UserController, 'getUser');
      prefix('users')(UserController);
      // the documented way to reuse a controller in another segment, with a guard there
      class AdminUserController extends UserController {
        static getUser = UserController.getUser;
      }
      adminGuard()(AdminUserController, 'getUser');
      get('{id}')(AdminUserController, 'getUser');
      prefix('admin/users')(AdminUserController);
      cloneControllerMetadata()(AdminUserController);
      const publicHandlers = initSegment({ segmentName: 'clone-public', controllers: { UserRPC: UserController } });
      const adminHandlers = initSegment({
        segmentName: 'clone-admin',
        controllers: { AdminUserRPC: AdminUserController },
      });

      deepStrictEqual(
        {
          publicRoute: (await call(publicHandlers, 'GET', 'users/1')).status,
          adminRoute: (await call(adminHandlers, 'GET', 'admin/users/1')).status,
        },
        { publicRoute: 200, adminRoute: 401 }
      );
    });
  });

  describe('A controller that extends another one', () => {
    it('Serves an inherited route exactly when the schema of the segment lists it', async () => {
      class BaseController {
        static health() {
          return 'ok';
        }
      }
      get('health')(BaseController, 'health');
      class ItemController extends BaseController {
        static list() {
          return [];
        }
      }
      get('list')(ItemController, 'list');
      prefix('items')(ItemController);
      const handlers = initSegmentInDevelopment({
        segmentName: 'inherited-without-parent',
        controllers: { ItemRPC: ItemController },
      });

      const isListed = (await getHandlerNames(handlers, 'ItemRPC')).includes('health');
      const status = (await call(handlers, 'GET', 'items/health')).status;

      strictEqual(status === 200, isListed, `the schema lists health: ${isListed}, GET items/health: ${status}`);
    });

    it('Serves the same routes in a segment whichever other segment loads first', async () => {
      const getStatus = async (otherSegmentFirst: boolean) => {
        class BaseController {
          static health() {
            return 'ok';
          }
        }
        get('health')(BaseController, 'health');
        class ItemController extends BaseController {}
        prefix('items')(ItemController);
        const name = `inherited-${otherSegmentFirst ? 'parent-first' : 'child-first'}`;
        const initOther = () =>
          initSegment({
            segmentName: `${name}-admin`,
            controllers: { BaseRPC: BaseController, ItemRPC: ItemController },
          });

        if (otherSegmentFirst) initOther();
        const handlers = initSegment({ segmentName: name, controllers: { ItemRPC: ItemController } });
        const first = (await call(handlers, 'GET', 'items/health')).status;
        if (!otherSegmentFirst) initOther();
        const second = (await call(handlers, 'GET', 'items/health')).status;
        return { first, second };
      };

      deepStrictEqual(await getStatus(true), await getStatus(false));
    });

    it("Lists, serves and gives static params for its parent's routes only where the parent is in the segment", async () => {
      class BaseController {
        static health() {
          return 'ok';
        }
      }
      get('health')(BaseController, 'health');
      class ItemController extends BaseController {
        static list() {
          return [];
        }
      }
      get('list')(ItemController, 'list');
      prefix('items')(ItemController);
      const withParent = { BaseRPC: BaseController, ItemRPC: ItemController };
      const alone = { ItemRPC: ItemController };
      const withParentHandlers = initSegmentInDevelopment({
        segmentName: 'inherited-with-parent',
        controllers: withParent,
      });
      const aloneHandlers = initSegmentInDevelopment({ segmentName: 'inherited-alone', controllers: alone });
      const getPaths = (controllers: Record<string, typeof BaseController>) =>
        controllersToStaticParams(controllers).map(({ vovk }) => vovk.join('/'));

      deepStrictEqual(
        {
          withParent: {
            handlers: await getHandlerNames(withParentHandlers, 'ItemRPC'),
            status: (await call(withParentHandlers, 'GET', 'items/health')).status,
            staticParams: getPaths(withParent),
          },
          alone: {
            handlers: await getHandlerNames(aloneHandlers, 'ItemRPC'),
            status: (await call(aloneHandlers, 'GET', 'items/health')).status,
            staticParams: getPaths(alone),
          },
        },
        {
          withParent: {
            handlers: ['health', 'list'],
            status: 200,
            staticParams: ['health', 'items/health', 'items/list'],
          },
          alone: { handlers: ['list'], status: 404, staticParams: ['items/list'] },
        }
      );
    });
  });

  describe('One request through a procedure twice', () => {
    // retries the handler once, as for a transient database error
    const retryOnce = createDecorator(async (_req: VovkRequest, next) => {
      try {
        return await next();
      } catch {
        return next();
      }
    });

    it('Validates the input as sent when a decorator calls next() again', async () => {
      let attempts = 0;
      class RetryController {
        static create = procedure({
          body: z.object({ name: z.string().transform((name) => `${name}!`) }),
          query: z.object({ n: z.string().transform(Number) }),
        }).handle(async (req) => {
          attempts++;
          if (attempts === 1) throw new Error('Transient error');
          return { body: await req.vovk.body(), query: req.vovk.query() };
        });
      }
      retryOnce()(RetryController, 'create');
      post('create')(RetryController, 'create');
      const handlers = initSegment({ segmentName: 'retry', controllers: { RetryController } });

      const response = await call(handlers, 'POST', 'create?n=5', {
        body: JSON.stringify({ name: 'ann' }),
        headers: { 'content-type': 'application/json' },
      });

      strictEqual(response.status, 200);
      deepStrictEqual(await response.json(), { body: { name: 'ann!' }, query: { n: 5 } });
    });

    it('Applies a transform once per pass, over HTTP and in fn()', async () => {
      let attempts = 0;
      class PaymentController {
        // dollars to cents, a transform that keeps the type
        static charge = procedure({
          body: z.object({ amount: z.number().transform((dollars) => dollars * 100) }),
        }).handle(async (req) => {
          attempts++;
          const { amount } = await req.vovk.body();
          if (attempts % 2 === 1) throw new Error('Transient error');
          return { chargedCents: amount };
        });
      }
      retryOnce()(PaymentController, 'charge');
      post('charge')(PaymentController, 'charge');
      const handlers = initSegment({ segmentName: 'retry-payment', controllers: { PaymentController } });

      const response = await call(handlers, 'POST', 'charge', {
        body: JSON.stringify({ amount: 5 }),
        headers: { 'content-type': 'application/json' },
      });

      deepStrictEqual(
        { http: await response.json(), fn: await PaymentController.charge.fn({ body: { amount: 5 } }) },
        { http: { chargedCents: 500 }, fn: { chargedCents: 500 } }
      );
    });
  });

  describe('A segment initialized again', () => {
    it('Lets the controllers it replaced be collected', async () => {
      // as a dev reload does: the module runs again and defines its controllers anew
      const defineSegment = () => {
        class ReloadController {
          static create = procedure({ params: z.object({ id: z.string() }) }).handle(() => null);
        }
        // @operation({ summary: 'Create' }) @post('{id}')
        post('{id}')(ReloadController, 'create');
        operation({ summary: 'Create' })(ReloadController, 'create');
        prefix('reload')(ReloadController);
        initSegment({ segmentName: 'reload', emitSchema: true, controllers: { ReloadController } });
        return new WeakRef(ReloadController);
      };
      const replaced = defineSegment();
      defineSegment();

      setFlagsFromString('--expose-gc');
      const gc = runInNewContext('gc') as () => void;
      // a WeakRef keeps its target until the current job ends
      await new Promise((resolve) => setImmediate(resolve));
      gc();

      strictEqual(replaced.deref(), undefined);
    });
  });
});
