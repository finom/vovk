import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import {
  createDecorator,
  get,
  HttpException,
  HttpStatus,
  initSegment,
  prefix,
  procedure,
  type VovkRequest,
} from 'vovk';

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
  });
});
