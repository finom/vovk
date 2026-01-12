import { NextRequest } from 'next/server.js';
import type { HttpMethod, StaticClass, VovkController, VovkRequest } from '../types.js';
import { vovkApp } from './vovkApp.js';
import { trimPath } from '../utils/trimPath.js';
import { getSchema } from './getSchema.js';

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
  for (const [rpcModuleName, controller] of Object.entries(options.controllers ?? {}) as [string, VovkController][]) {
    controller._segmentName = segmentName;
    controller._rpcModuleName = rpcModuleName;
    controller._onError = options?.onError;
    controller._onSuccess = options?.onSuccess;
    controller._onBefore = options?.onBefore;
  }

  async function GET_DEV(req: NextRequest, data: { params: Promise<Record<string, string[]>> }) {
    const params = await data.params;
    if (params[Object.keys(params)[0]]?.[0] === '_schema_') {
      const schema = await getSchema(options);
      return vovkApp.respond({
        req: req as unknown as VovkRequest,
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
    (req: NextRequest, data: { params: Promise<Record<string, string[]>> }) => Promise<unknown>
  >;
};
