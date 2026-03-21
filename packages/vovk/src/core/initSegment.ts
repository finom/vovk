import { vovkApp } from './vovkApp.js';
import { trimPath } from '../utils/trimPath.js';
import { getSchema } from './getSchema.js';
import type { ComposeMetadata } from './compose.js';
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

  // Phase 1: Apply compose metadata for all controllers
  for (const [rpcModuleName, controller] of controllerEntries) {
    controller._segmentName = segmentName;
    controller._rpcModuleName = rpcModuleName;
    controller._onError = options?.onError;
    controller._onSuccess = options?.onSuccess;
    controller._onBefore = options?.onBefore;

    // Apply compose() metadata: call decorator appliers for each composed handler
    for (const key of Object.getOwnPropertyNames(controller)) {
      const method = controller[key] as KnownAny;
      if (typeof method === 'function' && method._composeMetadata) {
        const metadata = method._composeMetadata as ComposeMetadata;
        if (metadata.decoratorAppliers) {
          // Apply in reverse order to match decorator semantics (bottom-up)
          for (let i = metadata.decoratorAppliers.length - 1; i >= 0; i--) {
            // Call decorator function with (controller, propertyKey) simulating experimental decorator context
            metadata.decoratorAppliers[i](controller, key);
          }
        }
      }
    }
  }

  // Phase 2: Re-clone metadata for controllers that extend another registered controller.
  // This is needed because cloneControllerMetadata() may run before compose metadata is applied
  // (e.g., when using class-level compose with a parent that uses method-level compose).
  const controllerSet = new Set(controllerEntries.map(([, c]) => c));
  for (const [, controller] of controllerEntries) {
    const parent = Object.getPrototypeOf(controller) as VovkController;
    if (parent && controllerSet.has(parent) && parent._handlers) {
      controller._handlers = { ...parent._handlers, ...controller._handlers };
      controller._handlersMetadata = { ...parent._handlersMetadata, ...controller._handlersMetadata };
      Object.values(vovkApp.routes).forEach((methods) => {
        const parentMethods = methods.get(parent) ?? {};
        methods.set(controller, { ...parentMethods, ...methods.get(controller) });
      });
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
