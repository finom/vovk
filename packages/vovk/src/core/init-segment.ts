import type { VovkController } from '../types/core.js';
import type { HttpMethod } from '../types/enums.js';
import type { VovkRequest } from '../types/request.js';
import type { StaticClass } from '../types/utils.js';
import { trimPath } from '../utils/trim-path.js';
import { getSchema } from './get-schema.js';
import { getCatchAllPath, type VovkRouteParams, vovkApp } from './vovk-app.js';

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

  // ancestors first, so a controller copies the routes of a parent that already has its own parent's
  const getDepth = (controller: object) => {
    let depth = 0;
    for (let parent = Object.getPrototypeOf(controller); parent; parent = Object.getPrototypeOf(parent)) depth++;
    return depth;
  };
  controllerEntries.sort(([, a], [, b]) => getDepth(a) - getDepth(b));

  for (const [rpcModuleName, controller] of controllerEntries) {
    controller._segmentName = segmentName;
    controller._rpcModuleName = rpcModuleName;
    controller._onError = options?.onError;
    controller._onSuccess = options?.onSuccess;
    controller._onBefore = options?.onBefore;

    // a controller that extends another one in the segment serves its parent's routes too
    const parent = Object.getPrototypeOf(controller) as VovkController;
    if (controllerSet.has(parent) && parent._handlers) {
      controller._handlers = { ...parent._handlers, ...controller._handlers };
      controller._handlersMetadata = { ...parent._handlersMetadata, ...controller._handlersMetadata };
      for (const methods of Object.values(vovkApp.routes)) {
        methods.set(controller, { ...(methods.get(parent) ?? {}), ...methods.get(controller) });
      }
    }
  }

  vovkApp.setSegment(segmentName, {
    controllers: controllerSet,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onBefore: options.onBefore,
  });

  async function GET_DEV(req: Request, data: { params: Promise<VovkRouteParams> }) {
    const params = await data.params;
    if (getCatchAllPath(params)[0] === '_schema_') {
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
  } satisfies Record<HttpMethod, (req: Request, data: { params: Promise<VovkRouteParams> }) => Promise<unknown>>;
};
