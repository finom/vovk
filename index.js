"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CombinedRoute_callMethod;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouter = exports.HttpException = exports.HttpStatus = void 0;
const server_1 = require("next/server");
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["CONTINUE"] = 100] = "CONTINUE";
    HttpStatus[HttpStatus["SWITCHING_PROTOCOLS"] = 101] = "SWITCHING_PROTOCOLS";
    HttpStatus[HttpStatus["PROCESSING"] = 102] = "PROCESSING";
    HttpStatus[HttpStatus["EARLYHINTS"] = 103] = "EARLYHINTS";
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["ACCEPTED"] = 202] = "ACCEPTED";
    HttpStatus[HttpStatus["NON_AUTHORITATIVE_INFORMATION"] = 203] = "NON_AUTHORITATIVE_INFORMATION";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatus[HttpStatus["RESET_CONTENT"] = 205] = "RESET_CONTENT";
    HttpStatus[HttpStatus["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
    HttpStatus[HttpStatus["AMBIGUOUS"] = 300] = "AMBIGUOUS";
    HttpStatus[HttpStatus["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
    HttpStatus[HttpStatus["FOUND"] = 302] = "FOUND";
    HttpStatus[HttpStatus["SEE_OTHER"] = 303] = "SEE_OTHER";
    HttpStatus[HttpStatus["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
    HttpStatus[HttpStatus["TEMPORARY_REDIRECT"] = 307] = "TEMPORARY_REDIRECT";
    HttpStatus[HttpStatus["PERMANENT_REDIRECT"] = 308] = "PERMANENT_REDIRECT";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["PAYMENT_REQUIRED"] = 402] = "PAYMENT_REQUIRED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    HttpStatus[HttpStatus["NOT_ACCEPTABLE"] = 406] = "NOT_ACCEPTABLE";
    HttpStatus[HttpStatus["PROXY_AUTHENTICATION_REQUIRED"] = 407] = "PROXY_AUTHENTICATION_REQUIRED";
    HttpStatus[HttpStatus["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["GONE"] = 410] = "GONE";
    HttpStatus[HttpStatus["LENGTH_REQUIRED"] = 411] = "LENGTH_REQUIRED";
    HttpStatus[HttpStatus["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
    HttpStatus[HttpStatus["PAYLOAD_TOO_LARGE"] = 413] = "PAYLOAD_TOO_LARGE";
    HttpStatus[HttpStatus["URI_TOO_LONG"] = 414] = "URI_TOO_LONG";
    HttpStatus[HttpStatus["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
    HttpStatus[HttpStatus["REQUESTED_RANGE_NOT_SATISFIABLE"] = 416] = "REQUESTED_RANGE_NOT_SATISFIABLE";
    HttpStatus[HttpStatus["EXPECTATION_FAILED"] = 417] = "EXPECTATION_FAILED";
    HttpStatus[HttpStatus["I_AM_A_TEAPOT"] = 418] = "I_AM_A_TEAPOT";
    HttpStatus[HttpStatus["MISDIRECTED"] = 421] = "MISDIRECTED";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["FAILED_DEPENDENCY"] = 424] = "FAILED_DEPENDENCY";
    HttpStatus[HttpStatus["PRECONDITION_REQUIRED"] = 428] = "PRECONDITION_REQUIRED";
    HttpStatus[HttpStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    HttpStatus[HttpStatus["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    HttpStatus[HttpStatus["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
    HttpStatus[HttpStatus["HTTP_VERSION_NOT_SUPPORTED"] = 505] = "HTTP_VERSION_NOT_SUPPORTED";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
const getPath = (params) => {
    const keys = Object.keys(params);
    const path = typeof keys[0] === 'string' ? params[keys[0]].join('/') : '';
    return path.endsWith('/') ? path.slice(0, -1) : path;
};
class HttpException extends Error {
    constructor(status, message) {
        super(String(message));
        this.status = status;
        this.message = String(message);
        throw this;
    }
}
exports.HttpException = HttpException;
class CombinedRoute {
    constructor() {
        this._routes = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {},
        };
        this.GET = (req, data) => {
            return __classPrivateFieldGet(this, _CombinedRoute_callMethod, "f").call(this, 'GET', req, data.params);
        };
        this.POST = (req, data) => {
            return __classPrivateFieldGet(this, _CombinedRoute_callMethod, "f").call(this, 'POST', req, data.params);
        };
        this.PUT = (req, data) => {
            return __classPrivateFieldGet(this, _CombinedRoute_callMethod, "f").call(this, 'PUT', req, data.params);
        };
        this.DELETE = (req, data) => {
            return __classPrivateFieldGet(this, _CombinedRoute_callMethod, "f").call(this, 'DELETE', req, data.params);
        };
        _CombinedRoute_callMethod.set(this, (httpMethod, req, params) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const path = getPath(params);
            if (!path) {
                return new server_1.NextResponse('Path is not given', { status: 400 });
            }
            const method = this._routes[httpMethod][path];
            if (!method) {
                return new server_1.NextResponse('Route is not found', { status: 404 });
            }
            try {
                // console.log(JSON.stringify(method.call(this, req, params)), method.call(this, req, params))
                return server_1.NextResponse.json(yield method.call(this, req, params));
            }
            catch (e) {
                const err = e;
                if (err.status && err.message) {
                    return new server_1.NextResponse(JSON.stringify({
                        status: err.status,
                        message: err.message,
                        error: true,
                    }), { status: (_a = err.status) !== null && _a !== void 0 ? _a : 400 });
                }
            }
        }));
    }
}
_CombinedRoute_callMethod = new WeakMap();
function createRouter() {
    const r = new CombinedRoute();
    const getDecorator = (httpMethod) => {
        return (givenPath = '') => {
            const path = givenPath.startsWith('/') ? givenPath.slice(1) : givenPath;
            // eslint-disable-next-line @typescript-eslint/ban-types
            return (target, _propertyKey) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                r._routes[httpMethod][path] = target[_propertyKey];
            };
        };
    };
    return {
        get: getDecorator('GET'),
        post: getDecorator('POST'),
        put: getDecorator('PUT'),
        del: getDecorator('DELETE'),
        GET: r.GET,
        POST: r.POST,
        PUT: r.PUT,
        DELETE: r.DELETE,
    };
}
exports.createRouter = createRouter;
