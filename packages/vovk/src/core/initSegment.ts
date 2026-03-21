import { vovkApp } from './vovkApp.js';
import { trimPath } from '../utils/trimPath.js';
import { getSchema } from './getSchema.js';
import type { DecorateMetadata } from './decorate.js';
import type { HttpMethod } from '../types/enums.js';
import type { VovkController } from '../types/core.js';
import type { VovkRequest } from '../types/request.js';
import type { KnownAny, StaticClass } from '../types/utils.js';

export const initSegment = (options: {
  segmentName?: string;
  controllers: Record<string, StaticClass>;
  exposeValidation?: boolean;
  emitSchema?: boolean;
  onError?: (err: Error, req: VovkRequest) => void | Promise<void>;
  onSuccess?: (resp: unknown, req: VovkRequest) => void | Promise<void>;
  onBefore?: (req: VovkRequest) => void | Promise<void>;
}) => {
  const segmentName = trimPath(options.segmentName ?? '');
  options.segmentName = segmentName;
  const controllerEntries = Object.entries(options.controllers ?? {}) as [string, VovkController][];
  const controllerSet = new Set(controllerEntries.map(([, c]) => c));

  // Sort so parent controllers are initialized before their children
  controllerEntries.sort(([, a], [, b]) => {
    return (
      Number(controllerSet.has(Object.getPrototypeOf(a) as VovkController)) -
      Number(controllerSet.has(Object.getPrototypeOf(b) as VovkController))
    );
  });

  for (const [rpcModuleName, controller] of controllerEntries) {
    controller._segmentName = segmentName;
    controller._rpcModuleName = rpcModuleName;
    controller._onError = options?.onError;
    controller._onSuccess = options?.onSuccess;
    controller._onBefore = options?.onBefore;

    // Apply deferred decorate() decorator appliers in reverse order (bottom-up, matching stacked decorator semantics)
    for (const key of Object.getOwnPropertyNames(controller)) {
      const appliers = ((controller[key] as KnownAny)?._decorateMetadata as DecorateMetadata | undefined)
        ?.decoratorAppliers;
      if (appliers) {
        for (let i = appliers.length - 1; i >= 0; i--) {
          appliers[i](controller, key);
        }
      }
    }

    // Re-clone metadata if this controller extends another registered controller
    // (cloneControllerMetadata() runs at class-definition time, before decorate() metadata is applied)
    const parent = Object.getPrototypeOf(controller) as VovkController;
    if (controllerSet.has(parent) && parent._handlers) {
      controller._handlers = { ...parent._handlers, ...controller._handlers };
      controller._handlersMetadata = { ...parent._handlersMetadata, ...controller._handlersMetadata };
      for (const methods of Object.values(vovkApp.routes)) {
        methods.set(controller, { ...(methods.get(parent) ?? {}), ...methods.get(controller) });
      }
    }
  }

  async function GET_DEV(req: Request, data: { params: Promise<Record<string, string[]>> }) {
    const params = await data.params;
    if (params[Object.keys(params)[0]]?.[0] === '_schema_') {
      const schema = await getSchema(options);
      return vovkApp.respond({
        req,
        statusCode: 200,
        responseBody: { schema },
      });
    }
    return vovkApp.GET(req, data, segmentName);
  }

  return {
    GET: process.env.NODE_ENV === 'development' ? GET_DEV : (req, data) => vovkApp.GET(req, data, segmentName),
    POST: (req, data) => vovkApp.POST(req, data, segmentName),
    PUT: (req, data) => vovkApp.PUT(req, data, segmentName),
    PATCH: (req, data) => vovkApp.PATCH(req, data, segmentName),
    DELETE: (req, data) => vovkApp.DELETE(req, data, segmentName),
    HEAD: (req, data) => vovkApp.HEAD(req, data, segmentName),
    OPTIONS: (req, data) => vovkApp.OPTIONS(req, data, segmentName),
  } satisfies Record<
    HttpMethod,
    (req: Request, data: { params: Promise<Record<string, string[]>> }) => Promise<unknown>
  >;
};
