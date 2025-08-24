//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion

//#region ../packages/vovk/mjs/types.js
var require_types$3 = __commonJS({ "../packages/vovk/mjs/types.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VovkSchemaIdEnum = exports.HttpStatus = exports.HttpMethod = void 0;
	var HttpMethod$1;
	(function(HttpMethod$2) {
		HttpMethod$2["GET"] = "GET";
		HttpMethod$2["POST"] = "POST";
		HttpMethod$2["PUT"] = "PUT";
		HttpMethod$2["PATCH"] = "PATCH";
		HttpMethod$2["DELETE"] = "DELETE";
		HttpMethod$2["HEAD"] = "HEAD";
		HttpMethod$2["OPTIONS"] = "OPTIONS";
	})(HttpMethod$1 || (exports.HttpMethod = HttpMethod$1 = {}));
	var HttpStatus$1;
	(function(HttpStatus$2) {
		HttpStatus$2[HttpStatus$2["NULL"] = 0] = "NULL";
		HttpStatus$2[HttpStatus$2["CONTINUE"] = 100] = "CONTINUE";
		HttpStatus$2[HttpStatus$2["SWITCHING_PROTOCOLS"] = 101] = "SWITCHING_PROTOCOLS";
		HttpStatus$2[HttpStatus$2["PROCESSING"] = 102] = "PROCESSING";
		HttpStatus$2[HttpStatus$2["EARLYHINTS"] = 103] = "EARLYHINTS";
		HttpStatus$2[HttpStatus$2["OK"] = 200] = "OK";
		HttpStatus$2[HttpStatus$2["CREATED"] = 201] = "CREATED";
		HttpStatus$2[HttpStatus$2["ACCEPTED"] = 202] = "ACCEPTED";
		HttpStatus$2[HttpStatus$2["NON_AUTHORITATIVE_INFORMATION"] = 203] = "NON_AUTHORITATIVE_INFORMATION";
		HttpStatus$2[HttpStatus$2["NO_CONTENT"] = 204] = "NO_CONTENT";
		HttpStatus$2[HttpStatus$2["RESET_CONTENT"] = 205] = "RESET_CONTENT";
		HttpStatus$2[HttpStatus$2["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
		HttpStatus$2[HttpStatus$2["AMBIGUOUS"] = 300] = "AMBIGUOUS";
		HttpStatus$2[HttpStatus$2["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
		HttpStatus$2[HttpStatus$2["FOUND"] = 302] = "FOUND";
		HttpStatus$2[HttpStatus$2["SEE_OTHER"] = 303] = "SEE_OTHER";
		HttpStatus$2[HttpStatus$2["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
		HttpStatus$2[HttpStatus$2["TEMPORARY_REDIRECT"] = 307] = "TEMPORARY_REDIRECT";
		HttpStatus$2[HttpStatus$2["PERMANENT_REDIRECT"] = 308] = "PERMANENT_REDIRECT";
		HttpStatus$2[HttpStatus$2["BAD_REQUEST"] = 400] = "BAD_REQUEST";
		HttpStatus$2[HttpStatus$2["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
		HttpStatus$2[HttpStatus$2["PAYMENT_REQUIRED"] = 402] = "PAYMENT_REQUIRED";
		HttpStatus$2[HttpStatus$2["FORBIDDEN"] = 403] = "FORBIDDEN";
		HttpStatus$2[HttpStatus$2["NOT_FOUND"] = 404] = "NOT_FOUND";
		HttpStatus$2[HttpStatus$2["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
		HttpStatus$2[HttpStatus$2["NOT_ACCEPTABLE"] = 406] = "NOT_ACCEPTABLE";
		HttpStatus$2[HttpStatus$2["PROXY_AUTHENTICATION_REQUIRED"] = 407] = "PROXY_AUTHENTICATION_REQUIRED";
		HttpStatus$2[HttpStatus$2["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
		HttpStatus$2[HttpStatus$2["CONFLICT"] = 409] = "CONFLICT";
		HttpStatus$2[HttpStatus$2["GONE"] = 410] = "GONE";
		HttpStatus$2[HttpStatus$2["LENGTH_REQUIRED"] = 411] = "LENGTH_REQUIRED";
		HttpStatus$2[HttpStatus$2["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
		HttpStatus$2[HttpStatus$2["PAYLOAD_TOO_LARGE"] = 413] = "PAYLOAD_TOO_LARGE";
		HttpStatus$2[HttpStatus$2["URI_TOO_LONG"] = 414] = "URI_TOO_LONG";
		HttpStatus$2[HttpStatus$2["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
		HttpStatus$2[HttpStatus$2["REQUESTED_RANGE_NOT_SATISFIABLE"] = 416] = "REQUESTED_RANGE_NOT_SATISFIABLE";
		HttpStatus$2[HttpStatus$2["EXPECTATION_FAILED"] = 417] = "EXPECTATION_FAILED";
		HttpStatus$2[HttpStatus$2["I_AM_A_TEAPOT"] = 418] = "I_AM_A_TEAPOT";
		HttpStatus$2[HttpStatus$2["MISDIRECTED"] = 421] = "MISDIRECTED";
		HttpStatus$2[HttpStatus$2["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
		HttpStatus$2[HttpStatus$2["FAILED_DEPENDENCY"] = 424] = "FAILED_DEPENDENCY";
		HttpStatus$2[HttpStatus$2["PRECONDITION_REQUIRED"] = 428] = "PRECONDITION_REQUIRED";
		HttpStatus$2[HttpStatus$2["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
		HttpStatus$2[HttpStatus$2["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
		HttpStatus$2[HttpStatus$2["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
		HttpStatus$2[HttpStatus$2["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
		HttpStatus$2[HttpStatus$2["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
		HttpStatus$2[HttpStatus$2["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
		HttpStatus$2[HttpStatus$2["HTTP_VERSION_NOT_SUPPORTED"] = 505] = "HTTP_VERSION_NOT_SUPPORTED";
	})(HttpStatus$1 || (exports.HttpStatus = HttpStatus$1 = {}));
	var VovkSchemaIdEnum$1;
	(function(VovkSchemaIdEnum$2) {
		VovkSchemaIdEnum$2["META"] = "https://vovk.dev/api/schema/v3/meta.json";
		VovkSchemaIdEnum$2["CONFIG"] = "https://vovk.dev/api/schema/v3/config.json";
		VovkSchemaIdEnum$2["SEGMENT"] = "https://vovk.dev/api/schema/v3/segment.json";
		VovkSchemaIdEnum$2["SCHEMA"] = "https://vovk.dev/api/schema/v3/schema.json";
	})(VovkSchemaIdEnum$1 || (exports.VovkSchemaIdEnum = VovkSchemaIdEnum$1 = {}));
} });

//#endregion
//#region ../packages/vovk/mjs/HttpException.js
var require_HttpException$1 = __commonJS({ "../packages/vovk/mjs/HttpException.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HttpException = void 0;
	var HttpException$1 = class extends Error {
		statusCode;
		message;
		cause;
		constructor(statusCode, message, cause) {
			super(message);
			this.statusCode = statusCode;
			this.message = message;
			this.cause = cause;
		}
	};
	exports.HttpException = HttpException$1;
} });

//#endregion
//#region ../packages/vovk/mjs/utils/shim.js
var require_shim$1 = __commonJS({ "../packages/vovk/mjs/utils/shim.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	if (typeof Symbol.dispose !== "symbol") Object.defineProperty(Symbol, "dispose", {
		configurable: false,
		enumerable: false,
		writable: false,
		value: Symbol.for("dispose")
	});
	if (typeof Symbol.asyncDispose !== "symbol") Object.defineProperty(Symbol, "asyncDispose", {
		configurable: false,
		enumerable: false,
		writable: false,
		value: Symbol.for("asyncDispose")
	});
} });

//#endregion
//#region ../packages/vovk/mjs/JSONLinesResponse.js
var require_JSONLinesResponse$1 = __commonJS({ "../packages/vovk/mjs/JSONLinesResponse.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JSONLinesResponse = void 0;
	require_shim$1();
	var JSONLinesResponse$1 = class extends Response {
		isClosed = false;
		controller;
		encoder;
		readableStream;
		iteratorQueue = [];
		iteratorResolvers = [];
		constructor(request, init) {
			const encoder = new TextEncoder();
			let readableController;
			const readableStream = new ReadableStream({
				cancel: () => {
					this.isClosed = true;
				},
				start: (controller) => {
					readableController = controller;
				}
			});
			const accept = request?.headers?.get("accept");
			super(readableStream, {
				...init,
				headers: {
					"content-type": !request || accept?.includes("application/jsonl") ? "application/jsonl; charset=utf-8" : "text/plain; charset=utf-8",
					...init?.headers
				}
			});
			this.readableStream = request ? readableStream : null;
			this.encoder = request ? encoder : null;
			this.controller = request ? readableController : null;
			request?.signal?.addEventListener("abort", this.close, { once: true });
		}
		send = (data) => {
			const { controller, encoder } = this;
			if (this.isClosed) return;
			controller?.enqueue(encoder?.encode(JSON.stringify(data) + "\n"));
			if (this.iteratorResolvers.length > 0) {
				const resolve$3 = this.iteratorResolvers.shift();
				resolve$3({
					value: data,
					done: false
				});
			} else this.iteratorQueue.push(data);
		};
		close = () => {
			const { controller } = this;
			if (this.isClosed) return;
			this.isClosed = true;
			controller?.close();
			while (this.iteratorResolvers.length > 0) {
				const resolve$3 = this.iteratorResolvers.shift();
				resolve$3({
					done: true,
					value: void 0
				});
			}
		};
		throw = (e) => {
			this.send({
				isError: true,
				reason: e instanceof Error ? e.message : e
			});
			return this.close();
		};
		[Symbol.dispose] = () => this.close();
		[Symbol.asyncDispose] = () => this.close();
		[Symbol.asyncIterator] = () => {
			return { next: async () => {
				if (this.iteratorQueue.length > 0) {
					const value = this.iteratorQueue.shift();
					return {
						value,
						done: false
					};
				}
				if (this.isClosed) return {
					done: true,
					value: void 0
				};
				return new Promise((resolve$3) => {
					this.iteratorResolvers.push(resolve$3);
				});
			} };
		};
	};
	exports.JSONLinesResponse = JSONLinesResponse$1;
} });

//#endregion
//#region ../packages/vovk/mjs/utils/parseQuery.js
var require_parseQuery$1 = __commonJS({ "../packages/vovk/mjs/utils/parseQuery.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = parseQuery$1;
	/**
	* Parse a bracket-based key (e.g. "z[d][0][x]" or "arr[]")
	* into an array of path segments (strings or special push-markers).
	*
	* Example: "z[d][0][x]" => ["z", "d", "0", "x"]
	* Example: "arr[]"      => ["arr", "" ]  // "" indicates "push" onto array
	*/
	function parseKey$1(key) {
		const segments$1 = [];
		const topKeyMatch = key.match(/^([^[\]]+)/);
		if (topKeyMatch) segments$1.push(topKeyMatch[1]);
		else segments$1.push("");
		const bracketRegex = /\[([^[\]]*)\]/g;
		let match;
		while ((match = bracketRegex.exec(key)) !== null) segments$1.push(match[1]);
		return segments$1;
	}
	/**
	* Recursively set a value in a nested object/array, given a path of segments.
	* - If segment is numeric => treat as array index
	* - If segment is empty "" => push to array
	* - Else => object property
	*/
	function setValue$1(obj, path, value) {
		let current = obj;
		for (let i = 0; i < path.length; i++) {
			const segment = path[i];
			if (i === path.length - 1) if (segment === "") {
				if (!Array.isArray(current)) current = [];
				current.push(value);
			} else if (!isNaN(Number(segment))) {
				const idx = Number(segment);
				if (!Array.isArray(current)) current = [];
				current[idx] = value;
			} else current[segment] = value;
			else {
				const nextSegment = path[i + 1];
				if (segment === "") {
					if (!Array.isArray(current)) current = [];
					if (current.length === 0) current.push(typeof nextSegment === "string" && !isNaN(Number(nextSegment)) ? [] : {});
					else if (typeof nextSegment === "string" && !isNaN(Number(nextSegment))) {
						if (!Array.isArray(current[current.length - 1])) current[current.length - 1] = [];
					} else if (typeof current[current.length - 1] !== "object") current[current.length - 1] = {};
					current = current[current.length - 1];
				} else if (!isNaN(Number(segment))) {
					const idx = Number(segment);
					if (!Array.isArray(current)) current = [];
					if (current[idx] === void 0) current[idx] = typeof nextSegment === "string" && !isNaN(Number(nextSegment)) ? [] : {};
					current = current[idx];
				} else {
					if (current[segment] === void 0) current[segment] = typeof nextSegment === "string" && !isNaN(Number(nextSegment)) ? [] : {};
					current = current[segment];
				}
			}
		}
	}
	/**
	* Deserialize a bracket-based query string into an object.
	*
	* Supports:
	*   - Key/value pairs with nested brackets (e.g. "a[b][0]=value")
	*   - Arrays with empty bracket (e.g. "arr[]=1&arr[]=2")
	*   - Mixed arrays of objects, etc.
	*
	* @example
	*   parseQuery("x=xx&y[0]=yy&y[1]=uu&z[f]=x&z[u][0]=uu&z[u][1]=xx&z[d][x]=ee")
	*   => {
	*        x: "xx",
	*        y: ["yy", "uu"],
	*        z: {
	*          f: "x",
	*          u: ["uu", "xx"],
	*          d: { x: "ee" }
	*        }
	*      }
	*
	* @param queryString - The raw query string (e.g. location.search.slice(1))
	* @returns           - A nested object representing the query params
	*/
	function parseQuery$1(queryString) {
		const result = {};
		if (!queryString) return result;
		const pairs = queryString.replace(/^\?/, "").split("&");
		for (const pair of pairs) {
			const [rawKey, rawVal = ""] = pair.split("=");
			const decodedKey = decodeURIComponent(rawKey);
			const decodedVal = decodeURIComponent(rawVal);
			const pathSegments = parseKey$1(decodedKey);
			setValue$1(result, pathSegments, decodedVal);
		}
		return result;
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/reqQuery.js
var require_reqQuery$1 = __commonJS({ "../packages/vovk/mjs/utils/reqQuery.js"(exports) {
	var __importDefault$10 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = reqQuery$1;
	const parseQuery_1$1 = __importDefault$10(require_parseQuery$1());
	function reqQuery$1(req) {
		return (0, parseQuery_1$1.default)(req.nextUrl.search);
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/reqMeta.js
var require_reqMeta$1 = __commonJS({ "../packages/vovk/mjs/utils/reqMeta.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = reqMeta$1;
	const metaMap$1 = /* @__PURE__ */ new WeakMap();
	function reqMeta$1(req, meta) {
		if (meta) metaMap$1.set(req, {
			...metaMap$1.get(req),
			...meta
		});
		else if (meta === null) metaMap$1.delete(req);
		return metaMap$1.get(req) ?? {};
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/reqForm.js
var require_reqForm$1 = __commonJS({ "../packages/vovk/mjs/utils/reqForm.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = reqForm$1;
	const formMap$1 = /* @__PURE__ */ new WeakMap();
	async function reqForm$1(req) {
		if (formMap$1.has(req)) return formMap$1.get(req);
		const body = await req.formData();
		req.formData = () => Promise.resolve(body);
		const formData = {};
		for (const [key, value] of body.entries()) if (value instanceof File) if (formData[key]) if (Array.isArray(formData[key])) formData[key].push(value);
		else formData[key] = [formData[key], value];
		else formData[key] = value;
		else formData[key] = value.toString();
		formMap$1.set(req, formData);
		return formData;
	}
} });

//#endregion
//#region ../packages/vovk/mjs/VovkApp.js
var require_VovkApp$1 = __commonJS({ "../packages/vovk/mjs/VovkApp.js"(exports) {
	var __importDefault$9 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	var _a$3;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VovkApp = void 0;
	const types_1$23 = require_types$3();
	const HttpException_1$13 = require_HttpException$1();
	const JSONLinesResponse_1$3 = require_JSONLinesResponse$1();
	const reqQuery_1$1 = __importDefault$9(require_reqQuery$1());
	const reqMeta_1$3 = __importDefault$9(require_reqMeta$1());
	const reqForm_1$1 = __importDefault$9(require_reqForm$1());
	var VovkApp$1 = class {
		static getHeadersFromOptions(options) {
			if (!options) return {};
			const corsHeaders = {
				"access-control-allow-origin": "*",
				"access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
				"access-control-allow-headers": "content-type, authorization"
			};
			const headers = {
				...options.cors ? corsHeaders : {},
				...options.headers ?? {}
			};
			return headers;
		}
		routes = {
			GET: /* @__PURE__ */ new Map(),
			POST: /* @__PURE__ */ new Map(),
			PUT: /* @__PURE__ */ new Map(),
			PATCH: /* @__PURE__ */ new Map(),
			DELETE: /* @__PURE__ */ new Map(),
			HEAD: /* @__PURE__ */ new Map(),
			OPTIONS: /* @__PURE__ */ new Map()
		};
		GET = async (req, data) => this.#callMethod(types_1$23.HttpMethod.GET, req, await data.params);
		POST = async (req, data) => this.#callMethod(types_1$23.HttpMethod.POST, req, await data.params);
		PUT = async (req, data) => this.#callMethod(types_1$23.HttpMethod.PUT, req, await data.params);
		PATCH = async (req, data) => this.#callMethod(types_1$23.HttpMethod.PATCH, req, await data.params);
		DELETE = async (req, data) => this.#callMethod(types_1$23.HttpMethod.DELETE, req, await data.params);
		HEAD = async (req, data) => this.#callMethod(types_1$23.HttpMethod.HEAD, req, await data.params);
		OPTIONS = async (req, data) => this.#callMethod(types_1$23.HttpMethod.OPTIONS, req, await data.params);
		respond = (status, body, options) => {
			return new Response(JSON.stringify(body), {
				status,
				headers: {
					"content-type": "application/json",
					..._a$3.getHeadersFromOptions(options)
				}
			});
		};
		#respondWithError = (statusCode, message, options, cause) => {
			return this.respond(statusCode, {
				cause,
				statusCode,
				message,
				isError: true
			}, options);
		};
		#getHandler = ({ handlers, path, params }) => {
			let methodParams = {};
			if (Object.keys(params).length === 0) return {
				handler: handlers[""],
				methodParams
			};
			const allMethodKeys = Object.keys(handlers);
			let methodKeys = [];
			const pathStr = path.join("/");
			methodKeys = allMethodKeys.filter((p) => {
				if (p.includes("{")) return false;
				return p === pathStr;
			});
			if (!methodKeys.length) methodKeys = allMethodKeys.filter((p) => {
				const routeSegments = p.split("/");
				if (routeSegments.length !== path.length) return false;
				const params$1 = {};
				for (let i = 0; i < routeSegments.length; i++) {
					const routeSegment = routeSegments[i];
					const pathSegment = path[i];
					if (routeSegment.includes("{")) {
						const regexPattern = routeSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\{(\w+)\\}/g, "(?<$1>[^/]+)");
						const values = pathSegment.match(new RegExp(`^${regexPattern}$`))?.groups ?? {};
						for (const parameter in values) {
							if (!Object.prototype.hasOwnProperty.call(values, parameter)) continue;
							if (parameter in params$1) throw new HttpException_1$13.HttpException(types_1$23.HttpStatus.INTERNAL_SERVER_ERROR, `Duplicate parameter "${parameter}" at ${p}`);
							params$1[parameter] = values[parameter];
						}
					} else if (routeSegment !== pathSegment) return false;
				}
				methodParams = params$1;
				return true;
			});
			if (methodKeys.length > 1) throw new HttpException_1$13.HttpException(types_1$23.HttpStatus.INTERNAL_SERVER_ERROR, `Conflicting routes found: ${methodKeys.join(", ")}`);
			const [methodKey] = methodKeys;
			if (methodKey) return {
				handler: handlers[methodKey],
				methodParams
			};
			return {
				handler: null,
				methodParams
			};
		};
		#callMethod = async (httpMethod, nextReq, params) => {
			const req = nextReq;
			const controllers$2 = this.routes[httpMethod];
			const path = params[Object.keys(params)[0]];
			const handlers = {};
			let headerList;
			try {
				headerList = nextReq.headers;
			} catch {
				headerList = null;
			}
			const xMeta = headerList?.get("x-meta");
			const xMetaHeader = xMeta && JSON.parse(xMeta);
			if (xMetaHeader) (0, reqMeta_1$3.default)(req, { xMetaHeader });
			controllers$2.forEach((staticMethods, controller$1) => {
				const prefix = controller$1._prefix ?? "";
				Object.entries(staticMethods ?? {}).forEach(([path$1, staticMethod$1]) => {
					const fullPath = [prefix, path$1].filter(Boolean).join("/");
					handlers[fullPath] = {
						staticMethod: staticMethod$1,
						controller: controller$1
					};
				});
			});
			const { handler, methodParams } = this.#getHandler({
				handlers,
				path,
				params
			});
			if (!handler) return this.#respondWithError(types_1$23.HttpStatus.NOT_FOUND, `${Object.keys(handlers)} - Route ${path.join("/")} is not found`);
			const { staticMethod, controller } = handler;
			req.vovk = {
				body: () => req.json(),
				query: () => (0, reqQuery_1$1.default)(req),
				meta: (meta) => (0, reqMeta_1$3.default)(req, meta),
				form: () => (0, reqForm_1$1.default)(req),
				params: () => methodParams
			};
			try {
				await staticMethod._options?.before?.call(controller, req);
				const result = await staticMethod.call(controller, req, methodParams);
				if (result instanceof Response) return result;
				const isIterator = typeof result === "object" && !!result && !(result instanceof Array) && (Reflect.has(result, Symbol.iterator) && typeof result[Symbol.iterator] === "function" || Reflect.has(result, Symbol.asyncIterator) && typeof result[Symbol.asyncIterator] === "function");
				if (isIterator) {
					const streamResponse = new JSONLinesResponse_1$3.JSONLinesResponse(req, { headers: { ..._a$3.getHeadersFromOptions(staticMethod._options) } });
					(async () => {
						try {
							for await (const chunk of result) streamResponse.send(chunk);
						} catch (e) {
							return streamResponse.throw(e);
						}
						return streamResponse.close();
					})();
					return streamResponse;
				}
				return this.respond(200, result ?? null, staticMethod._options);
			} catch (e) {
				const err = e;
				try {
					await controller._onError?.(err, req);
				} catch (onErrorError) {
					console.error(onErrorError);
				}
				if (err.message !== "NEXT_REDIRECT" && err.message !== "NEXT_NOT_FOUND") {
					const statusCode = err.statusCode || types_1$23.HttpStatus.INTERNAL_SERVER_ERROR;
					return this.#respondWithError(statusCode, err.message, staticMethod._options, err.cause);
				}
				throw e;
			}
		};
	};
	exports.VovkApp = VovkApp$1;
	_a$3 = VovkApp$1;
} });

//#endregion
//#region ../packages/vovk/mjs/utils/getSchema.js
var require_getSchema$1 = __commonJS({ "../packages/vovk/mjs/utils/getSchema.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getControllerSchema = getControllerSchema$1;
	exports.default = getSchema$1;
	const types_1$22 = require_types$3();
	async function getControllerSchema$1(controller, rpcModuleName, exposeValidation) {
		const handlers = exposeValidation ? controller._handlers ?? {} : Object.fromEntries(Object.entries(controller._handlers ?? {}).map(([key, { validation: _v,...value }]) => [key, value]));
		return {
			rpcModuleName,
			originalControllerName: controller.name,
			prefix: controller._prefix ?? "",
			handlers
		};
	}
	async function getSchema$1(options) {
		const exposeValidation = options?.exposeValidation ?? true;
		const emitSchema$2 = options.emitSchema ?? true;
		const schema$1 = {
			$schema: types_1$22.VovkSchemaIdEnum.SEGMENT,
			emitSchema: emitSchema$2,
			segmentName: options.segmentName ?? "",
			segmentType: "segment",
			controllers: {}
		};
		if (options.forceApiRoot) schema$1.forceApiRoot = options.forceApiRoot;
		if (!emitSchema$2) return schema$1;
		for (const [rpcModuleName, controller] of Object.entries(options.controllers ?? {})) schema$1.controllers[rpcModuleName] = await getControllerSchema$1(controller, rpcModuleName, exposeValidation);
		return schema$1;
	}
} });

//#endregion
//#region ../packages/vovk/mjs/createVovkApp.js
var require_createVovkApp$1 = __commonJS({ "../packages/vovk/mjs/createVovkApp.js"(exports) {
	var __importDefault$8 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createVovkApp = createVovkApp$1;
	const VovkApp_1$1 = require_VovkApp$1();
	const types_1$21 = require_types$3();
	const getSchema_1$1 = __importDefault$8(require_getSchema$1());
	const trimPath$3 = (path) => path.trim().replace(/^\/|\/$/g, "");
	const isClass$1 = (func) => typeof func === "function" && /class/.test(func.toString());
	const toKebabCase$1 = (str$2) => str$2.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z])(?=[a-z])/g, "$1-$2").toLowerCase().replace(/^-/, "");
	const assignSchema$1 = ({ controller, propertyKey, path, options, httpMethod, vovkApp }) => {
		if (typeof window !== "undefined") throw new Error("HTTP decorators can be used on server-side only. You have probably imported a controller on the client-side.");
		if (!isClass$1(controller)) {
			let decoratorName = httpMethod.toLowerCase();
			if (decoratorName === "delete") decoratorName = "del";
			throw new Error(`Decorator must be used on a static class method. Check the controller method named "${propertyKey}" used with @${decoratorName}().`);
		}
		const methods = vovkApp.routes[httpMethod].get(controller) ?? {};
		vovkApp.routes[httpMethod].set(controller, methods);
		if (options?.cors) {
			const optionsMethods = vovkApp.routes.OPTIONS.get(controller) ?? {};
			optionsMethods[path] = () => {};
			optionsMethods[path]._options = options;
			vovkApp.routes.OPTIONS.set(controller, optionsMethods);
		}
		const originalMethod = controller[propertyKey];
		originalMethod._controller = controller;
		originalMethod._sourceMethod = originalMethod._sourceMethod ?? originalMethod;
		const schema$1 = originalMethod._sourceMethod._getSchema?.(controller);
		originalMethod.schema = schema$1;
		originalMethod.fn = originalMethod._sourceMethod?.fn;
		originalMethod.models = originalMethod._sourceMethod?.models;
		originalMethod._sourceMethod.wrapper = originalMethod;
		controller._handlers = {
			...controller._handlers,
			[propertyKey]: {
				...schema$1,
				...(controller._handlers ?? {})[propertyKey],
				path,
				httpMethod
			}
		};
		methods[path] = originalMethod;
		methods[path]._options = options;
		controller._handlersMetadata = {
			...controller._handlersMetadata,
			[propertyKey]: {
				...(controller._handlersMetadata ?? {})[propertyKey],
				staticParams: options?.staticParams
			}
		};
	};
	function createVovkApp$1() {
		const vovkApp = new VovkApp_1$1.VovkApp();
		function createHTTPDecorator(httpMethod) {
			function decoratorCreator(givenPath = "", options) {
				const path = trimPath$3(givenPath);
				function decorator(givenTarget, propertyKey) {
					const controller = givenTarget;
					assignSchema$1({
						controller,
						propertyKey,
						path,
						options,
						httpMethod,
						vovkApp
					});
				}
				return decorator;
			}
			const auto = (options) => {
				function decorator(givenTarget, propertyKey) {
					const controller = givenTarget;
					const methods = vovkApp.routes[httpMethod].get(controller) ?? {};
					vovkApp.routes[httpMethod].set(controller, methods);
					controller._handlers = {
						...controller._handlers,
						[propertyKey]: {
							...(controller._handlers ?? {})[propertyKey],
							httpMethod
						}
					};
					const properties = Object.keys(controller._handlers[propertyKey]?.validation?.params?.properties ?? {});
					const kebab = toKebabCase$1(propertyKey);
					const path = properties.length ? `${kebab}/${properties.map((prop) => `:${prop}`).join("/")}` : kebab;
					assignSchema$1({
						controller,
						propertyKey,
						path,
						options,
						httpMethod,
						vovkApp
					});
				}
				return decorator;
			};
			const enhancedDecoratorCreator = decoratorCreator;
			enhancedDecoratorCreator.auto = auto;
			return enhancedDecoratorCreator;
		}
		const prefix = (givenPath = "") => {
			const path = trimPath$3(givenPath);
			return (givenTarget) => {
				const controller = givenTarget;
				controller._prefix = path;
				return givenTarget;
			};
		};
		const initSegment = (options) => {
			options.segmentName = trimPath$3(options.segmentName ?? "");
			for (const [rpcModuleName, controller] of Object.entries(options.controllers ?? {})) {
				controller._rpcModuleName = rpcModuleName;
				controller._onError = options?.onError;
			}
			async function GET_DEV(req, data) {
				const params = await data.params;
				if (params[Object.keys(params)[0]]?.[0] === "_schema_") {
					const schema$1 = await (0, getSchema_1$1.default)(options);
					return vovkApp.respond(200, { schema: schema$1 });
				}
				return vovkApp.GET(req, data);
			}
			return {
				GET: process.env.NODE_ENV === "development" ? GET_DEV : vovkApp.GET,
				POST: vovkApp.POST,
				PUT: vovkApp.PUT,
				PATCH: vovkApp.PATCH,
				DELETE: vovkApp.DELETE,
				HEAD: vovkApp.HEAD,
				OPTIONS: vovkApp.OPTIONS
			};
		};
		return {
			get: createHTTPDecorator(types_1$21.HttpMethod.GET),
			post: createHTTPDecorator(types_1$21.HttpMethod.POST),
			put: createHTTPDecorator(types_1$21.HttpMethod.PUT),
			patch: createHTTPDecorator(types_1$21.HttpMethod.PATCH),
			del: createHTTPDecorator(types_1$21.HttpMethod.DELETE),
			head: createHTTPDecorator(types_1$21.HttpMethod.HEAD),
			options: createHTTPDecorator(types_1$21.HttpMethod.OPTIONS),
			prefix,
			initSegment
		};
	}
} });

//#endregion
//#region ../packages/vovk/mjs/client/fetcher.js
var require_fetcher$1 = __commonJS({ "../packages/vovk/mjs/client/fetcher.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fetcher = exports.DEFAULT_ERROR_MESSAGE = void 0;
	exports.createFetcher = createFetcher$1;
	const types_1$20 = require_types$3();
	const HttpException_1$12 = require_HttpException$1();
	exports.DEFAULT_ERROR_MESSAGE = "Unknown error at default fetcher";
	function createFetcher$1({ prepareRequestInit, transformResponse, onSuccess, onError } = {}) {
		const newFetcher = async ({ httpMethod, getEndpoint, validate: validate$1, defaultHandler: defaultHandler$2, defaultStreamHandler: defaultStreamHandler$2, schema: schema$1 }, inputOptions) => {
			let response = null;
			let respData = null;
			let requestInit = null;
			try {
				const { meta, apiRoot, disableClientValidation, init, interpretAs } = inputOptions;
				let { body, query, params } = inputOptions;
				const endpoint = getEndpoint({
					apiRoot,
					params,
					query
				});
				const unusedParams = Array.from(new URL(endpoint.startsWith("/") ? `http://localhost${endpoint}` : endpoint).pathname.matchAll(/\{([^}]+)\}/g)).map((m) => m[1]);
				if (unusedParams.length) throw new HttpException_1$12.HttpException(types_1$20.HttpStatus.NULL, `Unused params: ${unusedParams.join(", ")} in ${endpoint}`, {
					body,
					query,
					params,
					endpoint
				});
				if (!disableClientValidation) try {
					({body, query, params} = await validate$1(inputOptions, { endpoint }) ?? {
						body,
						query,
						params
					});
				} catch (e) {
					if (e instanceof HttpException_1$12.HttpException) throw e;
					throw new HttpException_1$12.HttpException(types_1$20.HttpStatus.NULL, e.message ?? exports.DEFAULT_ERROR_MESSAGE, {
						body,
						query,
						params,
						endpoint
					});
				}
				requestInit = {
					method: httpMethod,
					...init,
					headers: {
						accept: "application/jsonl, application/json",
						...body instanceof FormData ? {} : { "content-type": "application/json" },
						...meta ? { "x-meta": JSON.stringify(meta) } : {},
						...init?.headers
					}
				};
				if (body instanceof FormData) requestInit.body = body;
				else if (body) requestInit.body = JSON.stringify(body);
				const controller = new AbortController();
				requestInit.signal = controller.signal;
				requestInit = prepareRequestInit ? await prepareRequestInit(requestInit, inputOptions) : requestInit;
				try {
					response = await fetch(endpoint, requestInit);
				} catch (e) {
					throw new HttpException_1$12.HttpException(types_1$20.HttpStatus.NULL, (e?.message ?? exports.DEFAULT_ERROR_MESSAGE) + " " + endpoint, {
						body,
						query,
						params,
						endpoint
					});
				}
				const contentType = interpretAs ?? response.headers.get("content-type");
				if (contentType?.startsWith("application/jsonl")) respData = defaultStreamHandler$2({
					response,
					controller,
					schema: schema$1
				});
				else if (contentType?.startsWith("application/json")) respData = defaultHandler$2({
					response,
					schema: schema$1
				});
				else respData = response;
				respData = await respData;
				respData = transformResponse ? await transformResponse(respData, inputOptions, response, requestInit) : respData;
				await onSuccess?.(respData, inputOptions, response, requestInit);
				return [respData, response];
			} catch (error$41) {
				await onError?.(error$41, inputOptions, response, requestInit, respData);
				throw error$41;
			}
		};
		return newFetcher;
	}
	exports.fetcher = createFetcher$1();
} });

//#endregion
//#region ../packages/vovk/mjs/client/defaultHandler.js
var require_defaultHandler$1 = __commonJS({ "../packages/vovk/mjs/client/defaultHandler.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultHandler = exports.DEFAULT_ERROR_MESSAGE = void 0;
	const HttpException_1$11 = require_HttpException$1();
	exports.DEFAULT_ERROR_MESSAGE = "Unknown error at defaultHandler";
	const getNestedValue$1 = (obj, path) => {
		return path.split(".").reduce((o, key) => o && typeof o === "object" ? o[key] : void 0, obj);
	};
	const defaultHandler$1 = async ({ response, schema: schema$1 }) => {
		let result;
		try {
			result = await response.json();
		} catch (e) {
			throw new HttpException_1$11.HttpException(response.status, e?.message ?? exports.DEFAULT_ERROR_MESSAGE);
		}
		if (!response.ok) {
			const errorKey = schema$1.openapi && "x-errorMessageKey" in schema$1.openapi ? schema$1.openapi["x-errorMessageKey"] : "message";
			const errorResponse = result;
			throw new HttpException_1$11.HttpException(response.status, getNestedValue$1(errorResponse, errorKey) ?? exports.DEFAULT_ERROR_MESSAGE, errorResponse?.cause ?? JSON.stringify(result));
		}
		return result;
	};
	exports.defaultHandler = defaultHandler$1;
} });

//#endregion
//#region ../packages/vovk/mjs/client/defaultStreamHandler.js
var require_defaultStreamHandler$1 = __commonJS({ "../packages/vovk/mjs/client/defaultStreamHandler.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultStreamHandler = exports.DEFAULT_ERROR_MESSAGE = void 0;
	const types_1$19 = require_types$3();
	const HttpException_1$10 = require_HttpException$1();
	require_shim$1();
	exports.DEFAULT_ERROR_MESSAGE = "Unknown error at defaultStreamHandler";
	const defaultStreamHandler$1 = async ({ response, controller }) => {
		if (!response.ok) {
			let result;
			try {
				result = await response.json();
			} catch {}
			throw new HttpException_1$10.HttpException(response.status, result.message ?? exports.DEFAULT_ERROR_MESSAGE);
		}
		if (!response.body) throw new HttpException_1$10.HttpException(types_1$19.HttpStatus.NULL, "Stream body is falsy. Check your controller code.");
		const reader = response.body.getReader();
		let canceled = false;
		const subscribers = /* @__PURE__ */ new Set();
		async function* asyncIterator() {
			let prepend = "";
			let i = 0;
			while (true) {
				let value;
				try {
					let done;
					if (canceled) break;
					({value, done} = await reader.read());
					if (done) break;
				} catch (error$41) {
					const err = new Error("JSONLines stream error. " + String(error$41));
					err.cause = error$41;
					throw err;
				}
				const string = typeof value === "number" ? String.fromCharCode(value) : new TextDecoder().decode(value);
				prepend += string;
				const lines = prepend.split("\n").filter(Boolean);
				for (const line$2 of lines) {
					let data;
					try {
						data = JSON.parse(line$2);
						prepend = prepend.slice(line$2.length + 1);
					} catch {
						break;
					}
					if (data) {
						subscribers.forEach((cb) => {
							if (!canceled) cb(data, i);
						});
						i++;
						if ("isError" in data && "reason" in data) {
							const upcomingError = data.reason;
							canceled = true;
							controller.abort(data.reason);
							if (typeof upcomingError === "string") throw new Error(upcomingError);
							controller.abort("Stream disposed");
							throw upcomingError;
						} else if (!canceled) yield data;
					}
				}
			}
		}
		return {
			status: response.status,
			[Symbol.asyncIterator]: asyncIterator,
			[Symbol.dispose]: () => {
				canceled = true;
				controller.abort("Stream disposed");
			},
			[Symbol.asyncDispose]: () => {
				canceled = true;
				controller.abort("Stream async disposed");
			},
			onIterate: (cb) => {
				if (canceled) return () => {};
				subscribers.add(cb);
				return () => {
					subscribers.delete(cb);
				};
			},
			cancel: (reason) => {
				canceled = true;
				return controller.abort(reason ?? "Stream aborted intentionally");
			}
		};
	};
	exports.defaultStreamHandler = defaultStreamHandler$1;
} });

//#endregion
//#region ../packages/vovk/mjs/utils/serializeQuery.js
var require_serializeQuery$1 = __commonJS({ "../packages/vovk/mjs/utils/serializeQuery.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = serializeQuery$1;
	/**
	* Recursively build query parameters from an object.
	*
	* @param key      - The query key so far (e.g. 'user', 'user[0]', 'user[0][name]')
	* @param value    - The current value to serialize
	* @returns        - An array of `key=value` strings
	*/
	function buildParams$1(key, value) {
		if (value === null || value === void 0) return [];
		if (typeof value === "object") {
			if (Array.isArray(value))
 /**
			* We use index-based bracket notation here:
			*   e.g. for value = ['aa', 'bb'] and key = 'foo'
			*   => "foo[0]=aa&foo[1]=bb"
			*
			* If you prefer "foo[]=aa&foo[]=bb" style, replace:
			*   `${key}[${i}]`
			* with:
			*   `${key}[]`
			*/
			return value.flatMap((v, i) => {
				const newKey = `${key}[${i}]`;
				return buildParams$1(newKey, v);
			});
			return Object.keys(value).flatMap((k) => {
				const newKey = `${key}[${k}]`;
				return buildParams$1(newKey, value[k]);
			});
		}
		return [`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`];
	}
	/**
	* Serialize a nested object (including arrays, arrays of objects, etc.)
	* into a bracket-based query string.
	*
	* @example
	*   serializeQuery({ x: 'xx', y: [1, 2], z: { f: 'x' } })
	*   => "x=xx&y[0]=1&y[1]=2&z[f]=x"
	*
	* @param obj - The input object to be serialized
	* @returns   - A bracket-based query string (without leading "?")
	*/
	function serializeQuery$1(obj) {
		if (!obj || typeof obj !== "object") return "";
		const segments$1 = [];
		for (const key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const value = obj[key];
			segments$1.push(...buildParams$1(key, value));
		}
		return segments$1.join("&");
	}
} });

//#endregion
//#region ../packages/vovk/mjs/client/createRPC.js
var require_createRPC$1 = __commonJS({ "../packages/vovk/mjs/client/createRPC.js"(exports) {
	var __importDefault$7 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createRPC = void 0;
	const fetcher_1$3 = require_fetcher$1();
	const defaultHandler_1$1 = require_defaultHandler$1();
	const defaultStreamHandler_1$1 = require_defaultStreamHandler$1();
	const serializeQuery_1$1 = __importDefault$7(require_serializeQuery$1());
	const trimPath$2 = (path) => path.trim().replace(/^\/|\/$/g, "");
	const getHandlerPath$1 = (endpoint, params, query) => {
		let result = endpoint;
		const queryStr = query ? (0, serializeQuery_1$1.default)(query) : null;
		for (const [key, value] of Object.entries(params ?? {})) result = result.replace(`{${key}}`, value);
		return `${result}${queryStr ? "?" : ""}${queryStr}`;
	};
	const createRPC$2 = (schema$1, segmentName$2, rpcModuleName, fetcher$1, options) => {
		fetcher$1 ??= fetcher_1$3.fetcher;
		const segmentNamePath = options?.segmentNameOverride ?? segmentName$2;
		const segmentSchema = schema$1.segments[segmentName$2];
		if (!segmentSchema) throw new Error(`Unable to create RPC module. Segment schema is missing for segment "${segmentName$2}".`);
		const controllerSchema = schema$1.segments[segmentName$2]?.controllers[rpcModuleName];
		const client = {};
		if (!controllerSchema) throw new Error(`Unable to create RPC module. Controller schema is missing for module "${rpcModuleName}" from segment "${segmentName$2}".`);
		const controllerPrefix = trimPath$2(controllerSchema.prefix ?? "");
		for (const [staticMethodName, handlerSchema] of Object.entries(controllerSchema.handlers ?? {})) {
			const { path, httpMethod, validation: validation$3 } = handlerSchema;
			const getEndpoint = ({ apiRoot, params, query }) => {
				const forceApiRoot = controllerSchema.forceApiRoot ?? segmentSchema.forceApiRoot;
				apiRoot = apiRoot ?? forceApiRoot ?? options?.apiRoot ?? "/api";
				const endpoint = [
					apiRoot.startsWith("http://") || apiRoot.startsWith("https://") || apiRoot.startsWith("/") ? "" : "/",
					apiRoot,
					forceApiRoot ? "" : segmentNamePath,
					getHandlerPath$1([controllerPrefix, path].filter(Boolean).join("/"), params, query)
				].filter(Boolean).join("/").replace(/([^:])\/+/g, "$1/");
				return endpoint;
			};
			const handler = async (input = {}) => {
				const validate$1 = async (validationInput, { endpoint }) => {
					const validateOnClient$1 = input.validateOnClient ?? options?.validateOnClient;
					if (validateOnClient$1 && validation$3) {
						if (typeof validateOnClient$1 !== "function") throw new Error("validateOnClient must be a function");
						return await validateOnClient$1({ ...validationInput }, validation$3, {
							fullSchema: schema$1,
							endpoint
						}) ?? validationInput;
					}
					return validationInput;
				};
				const internalOptions = {
					name: staticMethodName,
					httpMethod,
					getEndpoint,
					validate: validate$1,
					defaultHandler: defaultHandler_1$1.defaultHandler,
					defaultStreamHandler: defaultStreamHandler_1$1.defaultStreamHandler,
					schema: handlerSchema
				};
				const internalInput = {
					...options,
					...input,
					body: input.body ?? null,
					query: input.query ?? {},
					params: input.params ?? {}
				};
				if (!fetcher$1) throw new Error("Fetcher is not provided");
				const [respData, resp] = await fetcher$1(internalOptions, internalInput);
				return input.transform ? input.transform(respData, resp) : respData;
			};
			handler.schema = handlerSchema;
			handler.controllerSchema = controllerSchema;
			handler.segmentSchema = segmentSchema;
			handler.fullSchema = schema$1;
			handler.isRPC = true;
			handler.path = [
				segmentNamePath,
				controllerPrefix,
				path
			].filter(Boolean).join("/");
			handler.queryKey = (key) => [
				handler.segmentSchema.segmentName,
				handler.controllerSchema.prefix ?? "",
				handler.controllerSchema.rpcModuleName,
				handler.schema.path,
				handler.schema.httpMethod,
				...key ?? []
			];
			client[staticMethodName] = handler;
		}
		return client;
	};
	exports.createRPC = createRPC$2;
} });

//#endregion
//#region ../packages/vovk/mjs/client/progressive.js
var require_progressive$1 = __commonJS({ "../packages/vovk/mjs/client/progressive.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.progressive = progressive$1;
	function progressive$1(fn, ...args) {
		const [arg] = args;
		const reg = {};
		fn(arg).then(async (result) => {
			for await (const item of result) for (const [key, value] of Object.entries(item)) if (key in reg) {
				if (!reg[key].isSettled) {
					reg[key].isSettled = true;
					reg[key].resolve(value);
				}
			} else {
				const { promise, resolve: resolve$3, reject } = Promise.withResolvers();
				reg[key] = {
					resolve: resolve$3,
					reject,
					promise,
					isSettled: true
				};
				reg[key].resolve(value);
			}
			Object.keys(reg).forEach((key) => {
				if (reg[key].isSettled) return;
				reg[key].isSettled = true;
				reg[key].reject(new Error(`The connection was closed without sending a value for "${key}"`));
			});
			return result;
		}).catch((error$41) => {
			Object.keys(reg).forEach((key) => {
				if (reg[key].isSettled) return;
				reg[key].isSettled = true;
				reg[key].reject(error$41);
			});
			return error$41;
		});
		return new Proxy({}, {
			get(_target, prop) {
				if (prop in reg) return reg[prop].promise;
				const { promise, resolve: resolve$3, reject } = Promise.withResolvers();
				reg[prop] = {
					resolve: resolve$3,
					reject,
					promise,
					isSettled: false
				};
				return promise;
			},
			ownKeys: () => {
				throw new Error("Getting own keys is not possible as they are dynamically created");
			}
		});
	}
} });

//#endregion
//#region ../packages/vovk/mjs/client/index.js
var require_client$1 = __commonJS({ "../packages/vovk/mjs/client/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.progressive = exports.createFetcher = exports.fetcher = exports.createRPC = void 0;
	var createRPC_1$1 = require_createRPC$1();
	Object.defineProperty(exports, "createRPC", {
		enumerable: true,
		get: function() {
			return createRPC_1$1.createRPC;
		}
	});
	var fetcher_1$2 = require_fetcher$1();
	Object.defineProperty(exports, "fetcher", {
		enumerable: true,
		get: function() {
			return fetcher_1$2.fetcher;
		}
	});
	Object.defineProperty(exports, "createFetcher", {
		enumerable: true,
		get: function() {
			return fetcher_1$2.createFetcher;
		}
	});
	var progressive_1$1 = require_progressive$1();
	Object.defineProperty(exports, "progressive", {
		enumerable: true,
		get: function() {
			return progressive_1$1.progressive;
		}
	});
} });

//#endregion
//#region ../packages/vovk/mjs/utils/getJSONSchemaExample.js
var require_getJSONSchemaExample$1 = __commonJS({ "../packages/vovk/mjs/utils/getJSONSchemaExample.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getJSONSchemaExample = getJSONSchemaExample$1;
	exports.getSampleValue = getSampleValue$1;
	function getJSONSchemaExample$1(schema$1, options, rootSchema) {
		const { comment = "//", stripQuotes = false, indent = 0, nestingIndent = 4, ignoreBinary = false } = options;
		if (!schema$1 || typeof schema$1 !== "object") return "null";
		rootSchema = rootSchema || schema$1;
		const sampleValue = getSampleValue$1(schema$1, rootSchema, ignoreBinary);
		return formatWithDescriptions$1(sampleValue, schema$1, rootSchema, comment, stripQuotes, indent, nestingIndent, ignoreBinary);
	}
	function getSampleValue$1(schema$1, rootSchema, ignoreBinary) {
		if (!schema$1 || typeof schema$1 !== "object") return null;
		rootSchema = rootSchema || schema$1;
		if (ignoreBinary && schema$1.type === "string" && schema$1.format === "binary") return void 0;
		if (schema$1.example !== void 0) return schema$1.example;
		if (schema$1.examples && schema$1.examples.length > 0) return schema$1.examples[0];
		if (schema$1.const !== void 0) return schema$1.const;
		if (schema$1.$ref) return handleRef$3(schema$1.$ref, rootSchema, ignoreBinary);
		if (schema$1.enum && schema$1.enum.length > 0) return schema$1.enum[0];
		if (schema$1.oneOf && schema$1.oneOf.length > 0) return getSampleValue$1(schema$1.oneOf[0], rootSchema, ignoreBinary);
		if (schema$1.anyOf && schema$1.anyOf.length > 0) return getSampleValue$1(schema$1.anyOf[0], rootSchema, ignoreBinary);
		if (schema$1.allOf && schema$1.allOf.length > 0) {
			const mergedSchema = schema$1.allOf.reduce((acc, s) => ({
				...acc,
				...s
			}), {});
			return getSampleValue$1(mergedSchema, rootSchema, ignoreBinary);
		}
		if (schema$1.type) switch (schema$1.type) {
			case "string": return handleString$3(schema$1);
			case "number":
			case "integer": return handleNumber$3(schema$1);
			case "boolean": return handleBoolean$3();
			case "object": return handleObject$3(schema$1, rootSchema, ignoreBinary);
			case "array": return handleArray$3(schema$1, rootSchema, ignoreBinary);
			case "null": return null;
			default: return null;
		}
		if (schema$1.properties) return handleObject$3(schema$1, rootSchema, ignoreBinary);
		return null;
	}
	function formatWithDescriptions$1(value, schema$1, rootSchema, comment, stripQuotes, indent, nestingIndent, ignoreBinary) {
		const indentStr = " ".repeat(indent);
		const nestIndentStr = " ".repeat(nestingIndent);
		if (value === void 0) return "";
		if (value === null) return "null";
		if (typeof value !== "object" || value instanceof Date) return JSON.stringify(value);
		if (Array.isArray(value)) {
			if (value.length === 0) return "[]";
			const items = value.map((item) => {
				const itemSchema = schema$1.items || {};
				const formattedItem = formatWithDescriptions$1(item, itemSchema, rootSchema, comment, stripQuotes, indent + nestingIndent, nestingIndent, ignoreBinary);
				return `${indentStr}${nestIndentStr}${formattedItem}`;
			});
			return `[\n${items.join(",\n")}\n${indentStr}]`;
		}
		if (typeof value === "object") {
			const entries = Object.entries(value);
			if (entries.length === 0) return "{}";
			const formattedEntries = [];
			const isTopLevel = indent === 0;
			if (isTopLevel && schema$1.type === "object" && schema$1.description) {
				const descLines = schema$1.description.split("\n");
				formattedEntries.push(`${indentStr}${nestIndentStr}${comment} -----`);
				descLines.forEach((line$2) => {
					formattedEntries.push(`${indentStr}${nestIndentStr}${comment} ${line$2.trim()}`);
				});
				formattedEntries.push(`${indentStr}${nestIndentStr}${comment} -----`);
			}
			entries.forEach(([key, val], index) => {
				const propSchema = schema$1.properties?.[key] ?? {};
				let resolvedPropSchema = propSchema;
				if (propSchema.$ref) resolvedPropSchema = resolveRef$5(propSchema.$ref, rootSchema);
				if (resolvedPropSchema.description) {
					const descLines = resolvedPropSchema.description.split("\n");
					descLines.forEach((line$2) => {
						formattedEntries.push(`${indentStr}${nestIndentStr}${comment} ${line$2.trim()}`);
					});
				}
				const formattedKey = stripQuotes && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(key) ? key : JSON.stringify(key);
				const formattedValue = formatWithDescriptions$1(val, resolvedPropSchema, rootSchema, comment, stripQuotes, indent + nestingIndent, nestingIndent, ignoreBinary);
				formattedEntries.push(`${indentStr}${nestIndentStr}${formattedKey}: ${formattedValue}${index < entries.length - 1 ? "," : ""}`);
			});
			return `{\n${formattedEntries.join("\n")}\n${indentStr}}`;
		}
		return JSON.stringify(value);
	}
	function resolveRef$5(ref, rootSchema) {
		const path = ref.split("/").slice(1);
		let current = rootSchema;
		for (const segment of path) {
			current = current[segment];
			if (current === void 0) return {};
		}
		return current;
	}
	function handleRef$3(ref, rootSchema, ignoreBinary) {
		const resolved = resolveRef$5(ref, rootSchema);
		return getSampleValue$1(resolved, rootSchema, ignoreBinary);
	}
	function handleString$3(schema$1) {
		if (schema$1.format) switch (schema$1.format) {
			case "email":
			case "idn-email": return "user@example.com";
			case "uri":
			case "url":
			case "iri": return "https://example.com";
			case "date": return "2023-01-01";
			case "date-time": return "2023-01-01T00:00:00Z";
			case "time": return "12:00:00Z";
			case "duration": return "PT1H";
			case "uuid": return "00000000-0000-0000-0000-000000000000";
			case "regex": return "^[a-zA-Z0-9]+$";
			case "relative-json-pointer": return "/some/relative/path";
			case "color": return "#000000";
			case "hostname": return "example.com";
			case "zipcode": return "12345";
			case "phone": return "+123-456-7890";
			case "password": return "******";
			case "binary": return "binary-data";
			default: return "string";
		}
		if (schema$1.pattern) return "pattern-string";
		return "string";
	}
	function handleNumber$3(schema$1) {
		if (schema$1.minimum !== void 0 && schema$1.maximum !== void 0) return schema$1.minimum;
		else if (schema$1.minimum !== void 0) return schema$1.minimum;
		else if (schema$1.maximum !== void 0) return schema$1.maximum;
		return 0;
	}
	function handleBoolean$3() {
		return true;
	}
	function handleObject$3(schema$1, rootSchema, ignoreBinary) {
		const result = {};
		if (schema$1.properties) {
			const required = schema$1.required || [];
			for (const [key, propSchema] of Object.entries(schema$1.properties)) if (required.includes(key) || required.length === 0) {
				const value = getSampleValue$1(propSchema, rootSchema, ignoreBinary);
				if (value !== void 0) result[key] = value;
			}
		}
		if (schema$1.additionalProperties && typeof schema$1.additionalProperties === "object") {
			const value = getSampleValue$1(schema$1.additionalProperties, rootSchema, ignoreBinary);
			if (value !== void 0) result["additionalProp"] = value;
		}
		return result;
	}
	function handleArray$3(schema$1, rootSchema, ignoreBinary) {
		if (schema$1.items) {
			const itemSchema = schema$1.items;
			if (ignoreBinary && itemSchema.type === "string" && itemSchema.format === "binary") return void 0;
			const minItems = schema$1.minItems || 1;
			const numItems = Math.min(minItems, 3);
			const items = Array.from({ length: numItems }, () => getSampleValue$1(itemSchema, rootSchema, ignoreBinary)).filter((item) => item !== void 0);
			if (items.length === 0 && numItems > 0) return void 0;
			return items;
		}
		return [];
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/createCodeExamples.js
var require_createCodeExamples$1 = __commonJS({ "../packages/vovk/mjs/utils/createCodeExamples.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createCodeExamples = createCodeExamples$1;
	const getJSONSchemaExample_1$1 = require_getJSONSchemaExample$1();
	const toSnakeCase$1 = (str$2) => str$2.replace(/-/g, "_").replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/([A-Z])([A-Z])(?=[a-z])/g, "$1_$2").toLowerCase().replace(/^_/, "");
	const getIndentSpaces$1 = (level) => " ".repeat(level);
	function isTextFormat$1(mimeType) {
		if (!mimeType) return false;
		return mimeType.startsWith("text/") || [
			"application/json",
			"application/ld+json",
			"application/xml",
			"application/xhtml+xml",
			"application/javascript",
			"application/typescript",
			"application/yaml",
			"application/x-yaml",
			"application/toml",
			"application/sql",
			"application/graphql",
			"application/x-www-form-urlencoded"
		].includes(mimeType) || mimeType.endsWith("+json") || mimeType.endsWith("+xml");
	}
	function generateTypeScriptCode$1({ handlerName, rpcName, packageName, queryValidation, bodyValidation, paramsValidation, outputValidation, iterationValidation, hasArg }) {
		const getTsSample = (schema$1, indent) => (0, getJSONSchemaExample_1$1.getJSONSchemaExample)(schema$1, {
			stripQuotes: true,
			indent: indent ?? 4
		});
		const getTsFormSample = (schema$1) => {
			let formSample = "\nconst formData = new FormData();";
			for (const [key, prop] of Object.entries(schema$1.properties || {})) {
				const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
				const desc = target.description ?? prop.description ?? void 0;
				if (target.type === "array" && target.items) {
					formSample += getTsFormAppend(target.items, key, desc);
					formSample += getTsFormAppend(target.items, key, desc);
				} else formSample += getTsFormAppend(target, key, desc);
			}
			return formSample;
		};
		const getTsFormAppend = (schema$1, key, description) => {
			let sampleValue;
			if (schema$1.type === "string" && schema$1.format === "binary") sampleValue = `new Blob(${isTextFormat$1(schema$1.contentMediaType) ? "[\"text_content\"]" : "[binary_data]"}${schema$1.contentMediaType ? `, { type: "${schema$1.contentMediaType}" }` : ""})`;
			else if (schema$1.type === "object") sampleValue = "\"object_unknown\"";
			else sampleValue = `"${(0, getJSONSchemaExample_1$1.getSampleValue)(schema$1)}"`;
			const desc = schema$1.description ?? description;
			return `\n${desc ? `// ${desc}\n` : ""}formData.append("${key}", ${sampleValue});`;
		};
		const tsArgs = hasArg ? `{
${[
			bodyValidation ? `    body: ${bodyValidation["x-isForm"] ? "formData" : getTsSample(bodyValidation)},` : null,
			queryValidation ? `    query: ${getTsSample(queryValidation)},` : null,
			paramsValidation ? `    params: ${getTsSample(paramsValidation)},` : null
		].filter(Boolean).join("\n")}
}` : "";
		const TS_CODE = `import { ${rpcName} } from '${packageName}';
${bodyValidation?.["x-isForm"] ? getTsFormSample(bodyValidation) + "\n" : ""}
${iterationValidation ? "using" : "const"} response = await ${rpcName}.${handlerName}(${tsArgs});
${outputValidation ? `
console.log(response); 
/* 
${getTsSample(outputValidation, 0)}
*/` : ""}${iterationValidation ? `
for await (const item of response) {
    console.log(item); 
    /*
    ${getTsSample(iterationValidation)}
    */
}` : ""}`;
		return TS_CODE.trim();
	}
	function generatePythonCode$1({ handlerName, rpcName, packageName, queryValidation, bodyValidation, paramsValidation, outputValidation, iterationValidation, hasArg }) {
		const getPySample = (schema$1, indent) => (0, getJSONSchemaExample_1$1.getJSONSchemaExample)(schema$1, {
			stripQuotes: false,
			indent: indent ?? 4,
			comment: "#",
			ignoreBinary: true,
			nestingIndent: 4
		});
		const handlerNameSnake = toSnakeCase$1(handlerName);
		const getFileTouple = (schema$1) => {
			return `('name.ext', BytesIO(${isTextFormat$1(schema$1.contentMediaType) ? "\"text_content\".encode(\"utf-8\")" : "binary_data"})${schema$1.contentMediaType ? `, "${schema$1.contentMediaType}"` : ""})`;
		};
		const getPyFiles = (schema$1) => {
			return Object.entries(schema$1.properties ?? {}).reduce((acc, [key, prop]) => {
				const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
				const desc = target.description ?? prop.description ?? void 0;
				if (target.type === "string" && target.format === "binary") acc.push(`${desc ? `${getIndentSpaces$1(8)}# ${desc}\n` : ""}${getIndentSpaces$1(8)}('${key}', ${getFileTouple(target)})`);
				else if (target.type === "array" && target.items?.format === "binary") {
					const val = `${desc ? `${getIndentSpaces$1(8)}# ${desc}\n` : ""}${getIndentSpaces$1(8)}('${key}', ${getFileTouple(target.items)})`;
					acc.push(val, val);
				}
				return acc;
			}, []);
		};
		const pyFiles = bodyValidation ? getPyFiles(bodyValidation) : null;
		const pyFilesArg = pyFiles?.length ? `${getIndentSpaces$1(4)}files=[\n${pyFiles.join(",\n")}\n${getIndentSpaces$1(4)}],` : null;
		const PY_CODE = `from ${packageName} import ${rpcName}
${bodyValidation?.["x-isForm"] ? "from io import BytesIO\n" : ""}
response = ${rpcName}.${handlerNameSnake}(${hasArg ? "\n" + [
			bodyValidation ? `    body=${getPySample(bodyValidation)},` : null,
			pyFilesArg,
			queryValidation ? `    query=${getPySample(queryValidation)},` : null,
			paramsValidation ? `    params=${getPySample(paramsValidation)},` : null
		].filter(Boolean).join("\n") + "\n" : ""})

${outputValidation ? `print(response)\n${getPySample(outputValidation, 0)}` : ""}${iterationValidation ? `for i, item in enumerate(response):
    print(f"iteration #{i}:\\n {item}")
    # iteration #0:
    ${getPySample(iterationValidation)}` : ""}`;
		return PY_CODE.trim();
	}
	function generateRustCode$1({ handlerName, rpcName, packageName, queryValidation, bodyValidation, paramsValidation, outputValidation, iterationValidation }) {
		const getRsJSONSample = (schema$1, indent) => (0, getJSONSchemaExample_1$1.getJSONSchemaExample)(schema$1, {
			stripQuotes: false,
			indent: indent ?? 4
		});
		const getRsOutputSample = (schema$1, indent) => (0, getJSONSchemaExample_1$1.getJSONSchemaExample)(schema$1, {
			stripQuotes: true,
			indent: indent ?? 4
		});
		const getRsFormSample = (schema$1) => {
			let formSample = "let form = multipart::Form::new()";
			for (const [key, prop] of Object.entries(schema$1.properties || {})) {
				const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
				const desc = target.description ?? prop.description ?? void 0;
				if (target.type === "array" && target.items) {
					formSample += getRsFormPart(target.items, key, desc);
					formSample += getRsFormPart(target.items, key, desc);
				} else formSample += getRsFormPart(target, key, desc);
			}
			return formSample;
		};
		const getRsFormPart = (schema$1, key, description) => {
			let sampleValue;
			if (schema$1.type === "string" && schema$1.format === "binary") {
				sampleValue = isTextFormat$1(schema$1.contentMediaType) ? "multipart::Part::text(\"text_content\")" : "multipart::Part::bytes(binary_data)";
				if (schema$1.contentMediaType) sampleValue += `.mime_str("${schema$1.contentMediaType}").unwrap()`;
			} else if (schema$1.type === "object") sampleValue = "\"object_unknown\"";
			else sampleValue = `"${(0, getJSONSchemaExample_1$1.getSampleValue)(schema$1)}"`;
			const desc = schema$1.description ?? description;
			return `\n${getIndentSpaces$1(4)}${desc ? `// ${desc}\n` : ""}${getIndentSpaces$1(4)}.part("${key}", ${sampleValue});`;
		};
		const getBody = (schema$1) => {
			if (schema$1["x-isForm"]) return "form";
			return serdeUnwrap(getRsJSONSample(schema$1));
		};
		const handlerNameSnake = toSnakeCase$1(handlerName);
		const rpcNameSnake = toSnakeCase$1(rpcName);
		const serdeUnwrap = (fake) => `from_value(json!(${fake})).unwrap()`;
		const RS_CODE = `use ${packageName}::${rpcNameSnake};
use serde_json::{ 
  from_value, 
  json 
};
${bodyValidation?.["x-isForm"] ? `use multipart;` : ""}

pub fn main() {${bodyValidation?.["x-isForm"] ? "\n  " + getRsFormSample(bodyValidation) + "\n" : ""}
  let response = ${rpcNameSnake}::${handlerNameSnake}(
    ${bodyValidation ? getBody(bodyValidation) : "()"}, /* body */ 
    ${queryValidation ? serdeUnwrap(getRsJSONSample(queryValidation)) : "()"}, /* query */ 
    ${paramsValidation ? serdeUnwrap(getRsJSONSample(paramsValidation)) : "()"}, /* params */ 
    None, /* headers (HashMap) */ 
    None, /* api_root */ 
    false, /* disable_client_validation */
  );${outputValidation ? `\n\nmatch response {
    Ok(output) => println!("{:?}", output),
    /* 
    output ${getRsOutputSample(outputValidation)} 
    */
    Err(e) => println!("error: {:?}", e),
  }` : ""}${iterationValidation ? `\n\nmatch response {
    Ok(stream) => {
      for (i, item) in stream.enumerate() {
        println!("#{}: {:?}", i, item);
        /*
        #0: iteration ${getRsOutputSample(iterationValidation, 8)}
        */
      }
    },
    Err(e) => println!("Error initiating stream: {:?}", e),
  }` : ""}
}`;
		return RS_CODE.trim();
	}
	function createCodeExamples$1({ handlerName, handlerSchema, controllerSchema, package: packageJson }) {
		const queryValidation = handlerSchema?.validation?.query;
		const bodyValidation = handlerSchema?.validation?.body;
		const paramsValidation = handlerSchema?.validation?.params;
		const outputValidation = handlerSchema?.validation?.output;
		const iterationValidation = handlerSchema?.validation?.iteration;
		const hasArg = !!queryValidation || !!bodyValidation || !!paramsValidation;
		const rpcName = controllerSchema.rpcModuleName;
		const packageName = packageJson?.name || "vovk-client";
		const packageNameSnake = toSnakeCase$1(packageName);
		const pyPackageName = packageJson?.py_name ?? packageNameSnake;
		const rsPackageName = packageJson?.rs_name ?? packageNameSnake;
		const commonParams = {
			handlerName,
			rpcName,
			packageName,
			queryValidation,
			bodyValidation,
			paramsValidation,
			outputValidation,
			iterationValidation,
			hasArg
		};
		const ts = generateTypeScriptCode$1(commonParams);
		const py = generatePythonCode$1({
			...commonParams,
			packageName: pyPackageName
		});
		const rs = generateRustCode$1({
			...commonParams,
			packageName: rsPackageName
		});
		return {
			ts,
			py,
			rs
		};
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/getJSONSchemaSample.js
var require_getJSONSchemaSample$1 = __commonJS({ "../packages/vovk/mjs/utils/getJSONSchemaSample.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getJSONSchemaSample = getJSONSchemaSample$1;
	function getJSONSchemaSample$1(schema$1, rootSchema) {
		if (!schema$1 || typeof schema$1 !== "object") return null;
		rootSchema = rootSchema || schema$1;
		if (schema$1.example !== void 0) return schema$1.example;
		if (schema$1.examples && schema$1.examples.length > 0) return schema$1.examples[0];
		if (schema$1.const !== void 0) return schema$1.const;
		if (schema$1.$ref) return handleRef$2(schema$1.$ref, rootSchema);
		if (schema$1.enum && schema$1.enum.length > 0) return schema$1.enum[0];
		if (schema$1.oneOf && schema$1.oneOf.length > 0) return getJSONSchemaSample$1(schema$1.oneOf[0], rootSchema);
		if (schema$1.anyOf && schema$1.anyOf.length > 0) return getJSONSchemaSample$1(schema$1.anyOf[0], rootSchema);
		if (schema$1.allOf && schema$1.allOf.length > 0) {
			const mergedSchema = schema$1.allOf.reduce((acc, s) => ({
				...acc,
				...s
			}), {});
			return getJSONSchemaSample$1(mergedSchema, rootSchema);
		}
		if (schema$1.type) switch (schema$1.type) {
			case "string": return handleString$2(schema$1);
			case "number":
			case "integer": return handleNumber$2(schema$1);
			case "boolean": return handleBoolean$2();
			case "object": return handleObject$2(schema$1, rootSchema);
			case "array": return handleArray$2(schema$1, rootSchema);
			case "null": return null;
			default: return null;
		}
		if (schema$1.properties) return handleObject$2(schema$1, rootSchema);
		return null;
	}
	function handleRef$2(ref, rootSchema) {
		const path = ref.split("/").slice(1);
		let current = rootSchema;
		for (const segment of path) {
			current = current[segment];
			if (current === void 0) return null;
		}
		return getJSONSchemaSample$1(current, rootSchema);
	}
	function handleString$2(schema$1) {
		if (schema$1.format) switch (schema$1.format) {
			case "email":
			case "idn-email": return "user@example.com";
			case "uri":
			case "url":
			case "iri": return "https://example.com";
			case "date": return "2023-01-01";
			case "date-time": return "2023-01-01T00:00:00Z";
			case "time": return "12:00:00Z";
			case "duration": return "PT1H";
			case "uuid": return "00000000-0000-0000-0000-000000000000";
			case "regex": return "^[a-zA-Z0-9]+$";
			case "relative-json-pointer": return "/some/relative/path";
			case "color": return "#000000";
			case "hostname": return "example.com";
			case "zipcode": return "12345";
			case "phone": return "+123-456-7890";
			case "password": return "******";
			default: return "string";
		}
		if (schema$1.pattern) return "pattern-string";
		return "string";
	}
	function handleNumber$2(schema$1) {
		if (schema$1.minimum !== void 0 && schema$1.maximum !== void 0) return schema$1.minimum;
		else if (schema$1.minimum !== void 0) return schema$1.minimum;
		else if (schema$1.maximum !== void 0) return schema$1.maximum;
		return 0;
	}
	function handleBoolean$2() {
		return true;
	}
	function handleObject$2(schema$1, rootSchema) {
		const result = {};
		if (schema$1.properties) {
			const required = schema$1.required || [];
			for (const [key, propSchema] of Object.entries(schema$1.properties)) if (required.includes(key) || required.length === 0) result[key] = getJSONSchemaSample$1(propSchema, rootSchema);
		}
		if (schema$1.additionalProperties && typeof schema$1.additionalProperties === "object") result["additionalProp"] = getJSONSchemaSample$1(schema$1.additionalProperties, rootSchema);
		return result;
	}
	function handleArray$2(schema$1, rootSchema) {
		if (schema$1.items) {
			const itemSchema = schema$1.items;
			const minItems = schema$1.minItems || 1;
			const numItems = Math.min(minItems, 3);
			return Array.from({ length: numItems }, () => getJSONSchemaSample$1(itemSchema, rootSchema));
		}
		return [];
	}
} });

//#endregion
//#region ../packages/vovk/mjs/openapi/vovkSchemaToOpenAPI.js
var require_vovkSchemaToOpenAPI$1 = __commonJS({ "../packages/vovk/mjs/openapi/vovkSchemaToOpenAPI.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.vovkSchemaToOpenAPI = vovkSchemaToOpenAPI$1;
	const createCodeExamples_1$3 = require_createCodeExamples$1();
	const types_1$18 = require_types$3();
	const getJSONSchemaSample_1$1 = require_getJSONSchemaSample$1();
	function extractComponents$1(schema$1) {
		if (!schema$1) return [void 0, {}];
		const components = {};
		const process$1 = (obj, path = []) => {
			if (!obj || typeof obj !== "object") return obj;
			if (Array.isArray(obj)) return obj.map((item) => process$1(item, path));
			const result = {};
			Object.entries({
				...obj.definitions,
				...obj.$defs
			}).forEach(([key, value]) => {
				components[key] = process$1(value, [...path, key]);
			});
			for (const [key, value] of Object.entries(obj ?? {})) {
				if (key === "$defs" || key === "definitions") continue;
				if (key === "$ref" && typeof value === "string") {
					const refParts = value.split("/");
					const refName = refParts[refParts.length - 1];
					result[key] = `#/components/schemas/${refName}`;
				} else result[key] = process$1(value, [...path, key]);
			}
			return result;
		};
		const processedSchema = process$1(schema$1);
		return [processedSchema, components];
	}
	function vovkSchemaToOpenAPI$1({ rootEntry, schema: fullSchema, openAPIObject = {}, package: packageJson = { name: "my-rpc-client" } }) {
		const paths = {};
		const components = {};
		for (const [segmentName$2, segmentSchema] of Object.entries(fullSchema.segments ?? {})) for (const c of Object.values(segmentSchema.controllers)) for (const [handlerName, h] of Object.entries(c.handlers ?? {})) if (h.openapi) {
			const [queryValidation, queryComponents] = extractComponents$1(h?.validation?.query);
			const [bodyValidation, bodyComponents] = extractComponents$1(h?.validation?.body);
			const [paramsValidation, paramsComponents] = extractComponents$1(h?.validation?.params);
			const [outputValidation, outputComponents] = extractComponents$1(h?.validation?.output);
			const [iterationValidation, iterationComponents] = extractComponents$1(h?.validation?.iteration);
			Object.assign(components, queryComponents, bodyComponents, paramsComponents, outputComponents, iterationComponents);
			const { ts, rs, py } = (0, createCodeExamples_1$3.createCodeExamples)({
				package: packageJson,
				handlerName,
				handlerSchema: h,
				controllerSchema: c
			});
			const queryParameters = queryValidation && "type" in queryValidation && "properties" in queryValidation ? Object.entries(queryValidation.properties ?? {}).map(([propName, propSchema]) => ({
				name: propName,
				in: "query",
				required: queryValidation.required ? queryValidation.required.includes(propName) : false,
				schema: propSchema
			})) : null;
			const pathParameters = paramsValidation && "type" in paramsValidation && "properties" in paramsValidation ? Object.entries(paramsValidation.properties ?? {}).map(([propName, propSchema]) => ({
				name: propName,
				in: "path",
				required: paramsValidation.required ? paramsValidation.required.includes(propName) : false,
				schema: propSchema
			})) : null;
			const path = "/" + [
				rootEntry.replace(/^\/+|\/+$/g, ""),
				segmentName$2,
				c.prefix,
				h.path
			].filter(Boolean).join("/");
			paths[path] = paths[path] ?? {};
			const httpMethod = h.httpMethod.toLowerCase();
			paths[path][httpMethod] ??= {};
			paths[path][httpMethod] = {
				...h.openapi,
				...paths[path][httpMethod],
				"x-codeSamples": [
					...paths[path][httpMethod]["x-codeSamples"] ?? [],
					...h.openapi["x-codeSamples"] ?? [],
					{
						label: "TypeScript RPC",
						lang: "typescript",
						source: ts
					},
					{
						label: "Python RPC",
						lang: "python",
						source: py
					},
					{
						label: "Rust RPC",
						lang: "rust",
						source: rs
					}
				],
				...queryParameters || pathParameters ? { parameters: h.openapi.parameters ?? [...queryParameters || [], ...pathParameters || []] } : {},
				...paths[path][httpMethod].parameters ? { parameters: paths[path][httpMethod].parameters } : {},
				...outputValidation && "type" in outputValidation ? { responses: {
					200: {
						description: "description" in outputValidation ? outputValidation.description : "Success",
						content: { "application/json": { schema: outputValidation } }
					},
					...h.openapi?.responses
				} } : {},
				...iterationValidation && "type" in iterationValidation ? { responses: {
					200: {
						description: "description" in iterationValidation ? iterationValidation.description : "JSON Lines response",
						content: { "application/jsonl": { schema: {
							...iterationValidation,
							examples: iterationValidation.examples ?? [[
								JSON.stringify((0, getJSONSchemaSample_1$1.getJSONSchemaSample)(iterationValidation)),
								JSON.stringify((0, getJSONSchemaSample_1$1.getJSONSchemaSample)(iterationValidation)),
								JSON.stringify((0, getJSONSchemaSample_1$1.getJSONSchemaSample)(iterationValidation))
							].join("\n")]
						} } }
					},
					...h.openapi?.responses
				} } : {},
				...paths[path][httpMethod].responses ? { responses: paths[path][httpMethod].responses } : {},
				...bodyValidation && "type" in bodyValidation ? { requestBody: h.openapi?.requestBody ?? {
					description: "description" in bodyValidation ? bodyValidation.description : "Request body",
					required: true,
					content: { "application/json": { schema: bodyValidation } }
				} } : {},
				...paths[path][httpMethod].requestBody ? { requestBody: paths[path][httpMethod].requestBody } : {},
				tags: paths[path][httpMethod].tags ?? h.openapi?.tags
			};
		}
		return {
			...openAPIObject,
			openapi: "3.1.0",
			info: {
				title: packageJson?.description ?? "API",
				version: packageJson?.version ?? "0.0.1",
				...openAPIObject?.info
			},
			components: { schemas: {
				...openAPIObject?.components?.schemas ?? components,
				HttpStatus: {
					type: "integer",
					description: "HTTP status code",
					enum: Object.keys(types_1$18.HttpStatus).map((k) => types_1$18.HttpStatus[k]).filter(Boolean).filter((v) => typeof v === "number")
				},
				VovkErrorResponse: {
					type: "object",
					description: "Vovk error response",
					properties: {
						cause: { description: "Error cause of any shape" },
						statusCode: { $ref: "#/components/schemas/HttpStatus" },
						message: {
							type: "string",
							description: "Error message"
						},
						isError: {
							type: "boolean",
							const: true,
							description: "Indicates that this object represents an error"
						}
					},
					required: [
						"statusCode",
						"message",
						"isError"
					],
					additionalProperties: false
				},
				...openAPIObject?.components?.schemas
			} },
			paths
		};
	}
} });

//#endregion
//#region ../packages/vovk/mjs/openapi/generateFnName.js
var require_generateFnName$1 = __commonJS({ "../packages/vovk/mjs/openapi/generateFnName.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VERB_MAP = void 0;
	exports.capitalize = capitalize$1;
	exports.generateFnName = generateFnName$1;
	exports.VERB_MAP = {
		GET: {
			noParams: "list",
			withParams: "get"
		},
		POST: { default: "create" },
		PUT: { default: "update" },
		PATCH: { default: "patch" },
		DELETE: { default: "delete" },
		HEAD: { default: "head" },
		OPTIONS: { default: "options" }
	};
	function capitalize$1(str$2) {
		if (str$2.length === 0) return "";
		return str$2[0].toUpperCase() + str$2.slice(1);
	}
	const DEFAULT_OPTIONS$1 = { ignoreSegments: ["api"] };
	/**
	* Turn an HTTP method + OpenAPI path into a camelCased function name.
	*
	* Examples:
	*   generateFnName('GET', '/users')                     // "listUsers"
	*   generateFnName('GET', '/users/{id}')                // "getUsersById"
	*   generateFnName('POST', '/v1/api/orders')            // "createOrders"
	*   generateFnName('PATCH', '/users/{userId}/profile')  // "patchUsersProfileByUserId"
	*/
	function generateFnName$1(method, rawPath, opts = {}) {
		const { ignoreSegments } = {
			...DEFAULT_OPTIONS$1,
			...opts
		};
		const parts = rawPath.replace(/^\/|\/$/g, "").split("/").filter((seg) => !ignoreSegments?.includes(seg.toLowerCase())).filter(Boolean);
		const resources = [];
		const params = [];
		parts.forEach((seg) => {
			const match = seg.match(/^{?([^}]+)}?$/);
			if (match) params.push(match[1]);
			else resources.push(seg);
		});
		let baseVerb;
		if (method === "GET") baseVerb = params.length ? exports.VERB_MAP.GET.withParams : exports.VERB_MAP.GET.noParams;
		else baseVerb = exports.VERB_MAP[method].default;
		const resourcePart = resources.map(capitalize$1).join("");
		const byParams = params.length ? "By" + params.map(capitalize$1).join("") : "";
		const rawName = `${baseVerb}${resourcePart}${byParams}`;
		return rawName[0].toLowerCase() + rawName.slice(1);
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/camelCase.js
var require_camelCase$1 = __commonJS({ "../packages/vovk/mjs/utils/camelCase.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.camelCase = camelCase$1;
	function toString$1(value) {
		return value == null ? "" : String(value);
	}
	const reUnicodeWord$1 = /[\p{Lu}]{2,}(?=[\p{Lu}][\p{Ll}]+[0-9]*|\b)|[\p{Lu}]?[\p{Ll}]+[0-9]*|[\p{Lu}]|[0-9]+/gu;
	/**
	* Splits string into an array of words based on Unicode word boundaries
	* @param {string} str
	* @returns {string[]}
	*/
	function unicodeWords$1(str$2) {
		return str$2.match(reUnicodeWord$1) || [];
	}
	/**
	* Converts string to camel case.
	* @param {*} input - The value to convert to camel case.
	* @returns {string}
	*/
	function camelCase$1(input) {
		const str$2 = toString$1(input);
		const sanitized = str$2.replace(/[\s_-]+/g, " ").trim();
		const words = unicodeWords$1(sanitized);
		return words.map((word, index) => {
			const lower = word.toLowerCase();
			if (index === 0) return lower;
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		}).join("");
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/upperFirst.js
var require_upperFirst$1 = __commonJS({ "../packages/vovk/mjs/utils/upperFirst.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.upperFirst = upperFirst$1;
	function upperFirst$1(str$2) {
		return str$2.charAt(0).toUpperCase() + str$2.slice(1);
	}
} });

//#endregion
//#region ../packages/vovk/mjs/openapi/openAPIToVovkSchema/applyComponentsSchemas.js
var require_applyComponentsSchemas$1 = __commonJS({ "../packages/vovk/mjs/openapi/openAPIToVovkSchema/applyComponentsSchemas.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.applyComponentsSchemas = applyComponentsSchemas$1;
	const camelCase_1$3 = require_camelCase$1();
	const upperFirst_1$1 = require_upperFirst$1();
	function cloneJSON$1(obj) {
		if (obj === null || typeof obj !== "object") return obj;
		if (Array.isArray(obj)) return obj.map(cloneJSON$1);
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			if (value instanceof Date || value instanceof RegExp || typeof value === "function") continue;
			result[key] = cloneJSON$1(value);
		}
		return result;
	}
	function applyComponentsSchemas$1(schema$1, components, mixinName) {
		const key = "components/schemas";
		if (!components || !Object.keys(components).length) return schema$1;
		const result = cloneJSON$1(schema$1);
		result.$defs = result.$defs || {};
		const addedComponents = /* @__PURE__ */ new Set();
		function processSchema(obj) {
			if (!obj || typeof obj !== "object") return obj;
			if (Array.isArray(obj)) return obj.map((item) => processSchema(item));
			const newObj = { ...obj };
			const $ref = newObj.$ref;
			if ($ref && typeof $ref === "string" && $ref.startsWith(`#/${key}/`)) {
				const componentName = $ref.replace(`#/${key}/`, "");
				if (components[componentName]) {
					newObj.$ref = `#/$defs/${componentName}`;
					newObj["x-tsType"] ??= `Mixins.${(0, upperFirst_1$1.upperFirst)((0, camelCase_1$3.camelCase)(mixinName))}.${(0, upperFirst_1$1.upperFirst)((0, camelCase_1$3.camelCase)(componentName))}`;
				} else delete newObj.$ref;
				if (!addedComponents.has(componentName) && components[componentName]) {
					addedComponents.add(componentName);
					result.$defs[componentName] = processSchema(cloneJSON$1(components[componentName]));
				}
			}
			for (const key$1 in newObj) if (Object.prototype.hasOwnProperty.call(newObj, key$1)) newObj[key$1] = processSchema(newObj[key$1]);
			return newObj;
		}
		return processSchema(result);
	}
} });

//#endregion
//#region ../packages/vovk/mjs/openapi/openAPIToVovkSchema/inlineRefs.js
var require_inlineRefs$1 = __commonJS({ "../packages/vovk/mjs/openapi/openAPIToVovkSchema/inlineRefs.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.inlineRefs = inlineRefs$1;
	/**
	* Resolves $ref references at the first level only (except for components/schemas references)
	* For arrays, checks each item at the first level
	* @param obj - The object to process (may contain $ref properties)
	* @param openAPIObject - The complete OpenAPI document containing definitions
	* @returns The object with resolved references (except components/schemas)
	*/
	function inlineRefs$1(obj, openAPIObject) {
		if (obj === null || obj === void 0) return obj;
		if (Array.isArray(obj)) return obj.map((item) => {
			if (item && typeof item === "object" && "$ref" in item && typeof item.$ref === "string") {
				if (item.$ref.startsWith("#/components/schemas/")) return item;
				const resolved = resolveRef$4(item.$ref, openAPIObject);
				if (resolved !== void 0) {
					const { $ref: _$ref,...additionalProps } = item;
					if (Object.keys(additionalProps).length > 0) return {
						...resolved,
						...additionalProps
					};
					return resolved;
				}
			}
			return item;
		});
		if (typeof obj !== "object") return obj;
		if ("$ref" in obj && typeof obj.$ref === "string") {
			if (obj.$ref.startsWith("#/components/schemas/")) return obj;
			const resolved = resolveRef$4(obj.$ref, openAPIObject);
			if (resolved !== void 0) {
				const { $ref: _$ref,...additionalProps } = obj;
				if (Object.keys(additionalProps).length > 0) return {
					...resolved,
					...additionalProps
				};
				return resolved;
			}
		}
		return obj;
	}
	/**
	* Resolves a JSON Reference ($ref) to its target value
	* @param ref - The reference string (e.g., "#/components/parameters/id")
	* @param openAPIObject - The complete OpenAPI document
	* @returns The resolved value or undefined if not found
	*/
	function resolveRef$4(ref, openAPIObject) {
		if (!ref.startsWith("#/")) {
			console.warn(`External references are not supported: ${ref}`);
			return void 0;
		}
		const path = ref.substring(1).split("/").filter((p) => p !== "");
		let current = openAPIObject;
		for (const segment of path) {
			const decodedSegment = segment.replace(/~1/g, "/").replace(/~0/g, "~");
			if (current && typeof current === "object" && decodedSegment in current) current = current[decodedSegment];
			else {
				console.warn(`Could not resolve reference: ${ref}`);
				return void 0;
			}
		}
		return current;
	}
} });

//#endregion
//#region ../packages/vovk/mjs/openapi/openAPIToVovkSchema/index.js
var require_openAPIToVovkSchema$1 = __commonJS({ "../packages/vovk/mjs/openapi/openAPIToVovkSchema/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.openAPIToVovkSchema = openAPIToVovkSchema$1;
	const types_1$17 = require_types$3();
	const generateFnName_1$1 = require_generateFnName$1();
	const camelCase_1$2 = require_camelCase$1();
	const applyComponentsSchemas_1$1 = require_applyComponentsSchemas$1();
	const inlineRefs_1$1 = require_inlineRefs$1();
	const getNamesNestJS$1 = (operationObject) => {
		const operationId = operationObject.operationId;
		if (!operationId) throw new Error("Operation ID is required for NestJS module name generation");
		const controllerHandlerMatch = operationId?.match(/^([A-Z][a-zA-Z0-9]*)_([a-zA-Z0-9_]+)/);
		if (!controllerHandlerMatch) throw new Error(`Invalid operationId format for NestJS: ${operationId}`);
		const [controllerName, handlerName] = controllerHandlerMatch.slice(1, 3);
		return [controllerName.replace(/Controller$/, "RPC"), handlerName];
	};
	const normalizeGetModuleName$1 = (getModuleName) => {
		if (getModuleName === "nestjs-operation-id") getModuleName = ({ operationObject }) => getNamesNestJS$1(operationObject)[0];
		else if (typeof getModuleName === "string") {
			const moduleName = getModuleName;
			getModuleName = () => moduleName;
		} else if (typeof getModuleName !== "function") throw new Error("getModuleName must be a function or one of the predefined strings");
		return getModuleName;
	};
	const normalizeGetMethodName$1 = (getMethodName) => {
		if (getMethodName === "nestjs-operation-id") getMethodName = ({ operationObject }) => getNamesNestJS$1(operationObject)[1];
		else if (getMethodName === "camel-case-operation-id") getMethodName = ({ operationObject }) => {
			const operationId = operationObject.operationId;
			if (!operationId) throw new Error("Operation ID is required for camel-case method name generation");
			return (0, camelCase_1$2.camelCase)(operationId);
		};
		else if (getMethodName === "auto") getMethodName = ({ operationObject, method, path }) => {
			const operationId = operationObject.operationId;
			const isCamelCase = operationId && /^[a-z][a-zA-Z0-9]*$/.test(operationId);
			const isSnakeCase = operationId && /^[a-z][a-z0-9_]+$/.test(operationId);
			return isCamelCase ? operationId : isSnakeCase ? (0, camelCase_1$2.camelCase)(operationId) : (0, generateFnName_1$1.generateFnName)(method, path);
		};
		else if (typeof getMethodName !== "function") throw new Error("getMethodName must be a function or one of the predefined strings");
		return getMethodName;
	};
	function openAPIToVovkSchema$1({ apiRoot, source: { object: openAPIObject }, getModuleName = "api", getMethodName = "auto", errorMessageKey, package: packageJson, mixinName }) {
		const forceApiRoot = apiRoot ?? openAPIObject.servers?.[0]?.url ?? ("host" in openAPIObject ? `https://${openAPIObject.host}${"basePath" in openAPIObject ? openAPIObject.basePath : ""}` : null);
		if (!forceApiRoot) throw new Error("API root URL is required in OpenAPI configuration");
		const schema$1 = {
			$schema: types_1$17.VovkSchemaIdEnum.SCHEMA,
			segments: { [mixinName]: {
				$schema: types_1$17.VovkSchemaIdEnum.SEGMENT,
				emitSchema: true,
				segmentName: mixinName,
				segmentType: "mixin",
				controllers: {},
				meta: {
					components: openAPIObject.components,
					package: Object.assign({}, packageJson, openAPIObject.info ? { description: packageJson?.description ?? `**${openAPIObject.info.title}**\n${openAPIObject.info.description ?? ""}` } : {})
				}
			} }
		};
		const segment = schema$1.segments[mixinName];
		getModuleName = normalizeGetModuleName$1(getModuleName);
		getMethodName = normalizeGetMethodName$1(getMethodName);
		return Object.entries(openAPIObject.paths ?? {}).reduce((acc, [path, operations]) => {
			Object.entries(operations ?? {}).filter(([, operation]) => operation && typeof operation === "object").forEach(([method, operation]) => {
				const rpcModuleName = getModuleName({
					method: method.toUpperCase(),
					path,
					openAPIObject,
					operationObject: operation
				});
				const handlerName = getMethodName({
					method: method.toUpperCase(),
					path,
					openAPIObject,
					operationObject: operation
				});
				segment.controllers[rpcModuleName] ??= {
					forceApiRoot,
					rpcModuleName,
					handlers: {}
				};
				const parameters = (0, inlineRefs_1$1.inlineRefs)(operation.parameters ?? [], openAPIObject);
				const queryProperties = parameters.filter((p) => p.in === "query") ?? null;
				const pathProperties = parameters.filter((p) => p.in === "path") ?? null;
				const query = queryProperties?.length ? {
					type: "object",
					properties: Object.fromEntries(queryProperties.map((p) => [p.name, p.schema])),
					required: queryProperties.filter((p) => p.required).map((p) => p.name)
				} : null;
				const params = pathProperties?.length ? {
					type: "object",
					properties: Object.fromEntries(pathProperties.map((p) => [p.name, p.schema])),
					required: pathProperties.filter((p) => p.required).map((p) => p.name)
				} : null;
				const requestBodyContent = (0, inlineRefs_1$1.inlineRefs)(operation.requestBody, openAPIObject)?.content ?? {};
				const jsonBody = requestBodyContent["application/json"]?.schema ?? null;
				const formDataBody = requestBodyContent["multipart/form-data"]?.schema ?? null;
				let urlEncodedBody = requestBodyContent["application/x-www-form-urlencoded"]?.schema ?? null;
				if (formDataBody && urlEncodedBody && JSON.stringify(formDataBody) === JSON.stringify(urlEncodedBody)) urlEncodedBody = null;
				if (formDataBody) Object.assign(formDataBody, {
					"x-isForm": true,
					"x-tsType": "FormData"
				});
				if (urlEncodedBody) Object.assign(urlEncodedBody, {
					"x-isForm": true,
					"x-tsType": "FormData"
				});
				const bodySchemas = [
					jsonBody,
					formDataBody,
					urlEncodedBody
				].filter(Boolean);
				const body = !bodySchemas.length ? null : bodySchemas.length === 1 ? bodySchemas[0] : { anyOf: bodySchemas };
				const output = operation.responses?.["200"]?.content?.["application/json"]?.schema ?? operation.responses?.["201"]?.content?.["application/json"]?.schema ?? null;
				const iteration = operation.responses?.["200"]?.content?.["application/jsonl"]?.schema ?? operation.responses?.["201"]?.content?.["application/jsonl"]?.schema ?? operation.responses?.["200"]?.content?.["application/jsonlines"]?.schema ?? operation.responses?.["201"]?.content?.["application/jsonlines"]?.schema ?? null;
				if (errorMessageKey) operation["x-errorMessageKey"] = errorMessageKey;
				const componentsSchemas = openAPIObject.components?.schemas ?? ("definitions" in openAPIObject ? openAPIObject.definitions : {});
				segment.controllers[rpcModuleName].handlers[handlerName] = {
					httpMethod: method.toUpperCase(),
					path,
					openapi: operation,
					validation: {
						...query && { query: (0, applyComponentsSchemas_1$1.applyComponentsSchemas)(query, componentsSchemas, mixinName) },
						...params && { params: (0, applyComponentsSchemas_1$1.applyComponentsSchemas)(params, componentsSchemas, mixinName) },
						...body && { body: (0, applyComponentsSchemas_1$1.applyComponentsSchemas)(body, componentsSchemas, mixinName) },
						...output && { output: (0, applyComponentsSchemas_1$1.applyComponentsSchemas)(output, componentsSchemas, mixinName) },
						...iteration && { iteration: (0, applyComponentsSchemas_1$1.applyComponentsSchemas)(iteration, componentsSchemas, mixinName) }
					}
				};
			});
			return acc;
		}, schema$1);
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/createDecorator.js
var require_createDecorator$1 = __commonJS({ "../packages/vovk/mjs/utils/createDecorator.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createDecorator = createDecorator$1;
	function createDecorator$1(handler, initHandler) {
		return function decoratorCreator(...args) {
			return function decorator(target, propertyKey) {
				const controller = target;
				const originalMethod = controller[propertyKey];
				if (typeof originalMethod !== "function") throw new Error(`Unable to decorate: ${propertyKey} is not a function`);
				const sourceMethod = originalMethod._sourceMethod ?? originalMethod;
				const method = function method$1(req, params) {
					const next$1 = async () => {
						return await originalMethod.call(controller, req, params);
					};
					return handler ? handler.call(controller, req, next$1, ...args) : next$1();
				};
				controller[propertyKey] = method;
				method._controller = controller;
				method._sourceMethod = sourceMethod;
				method.fn = originalMethod.fn;
				method.models = originalMethod.models;
				sourceMethod.wrapper = method;
				originalMethod._controller = controller;
				const handlerSchema = controller._handlers?.[propertyKey] ?? null;
				const initResultReturn = initHandler?.call(controller, ...args);
				const initResult = typeof initResultReturn === "function" ? initResultReturn(handlerSchema, { handlerName: propertyKey }) : initResultReturn;
				const methodSchema = {
					...handlerSchema,
					...initResult?.validation ? { validation: initResult.validation } : {},
					...initResult?.openapi ? { openapi: initResult.openapi } : {},
					...initResult?.misc ? { misc: initResult.misc } : {}
				};
				method.schema = methodSchema;
				controller._handlers = {
					...controller._handlers,
					[propertyKey]: methodSchema
				};
			};
		};
	}
} });

//#endregion
//#region ../packages/vovk/mjs/openapi/error.js
var require_error$1 = __commonJS({ "../packages/vovk/mjs/openapi/error.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.error = void 0;
	const types_1$16 = require_types$3();
	const createDecorator_1$5 = require_createDecorator$1();
	const statusDisplayText$1 = {
		[types_1$16.HttpStatus.NULL]: "Error",
		[types_1$16.HttpStatus.CONTINUE]: "Continue",
		[types_1$16.HttpStatus.SWITCHING_PROTOCOLS]: "Switching Protocols",
		[types_1$16.HttpStatus.PROCESSING]: "Processing",
		[types_1$16.HttpStatus.EARLYHINTS]: "Early Hints",
		[types_1$16.HttpStatus.OK]: "OK",
		[types_1$16.HttpStatus.CREATED]: "Created",
		[types_1$16.HttpStatus.ACCEPTED]: "Accepted",
		[types_1$16.HttpStatus.NON_AUTHORITATIVE_INFORMATION]: "Non Authoritative Information",
		[types_1$16.HttpStatus.NO_CONTENT]: "No Content",
		[types_1$16.HttpStatus.RESET_CONTENT]: "Reset Content",
		[types_1$16.HttpStatus.PARTIAL_CONTENT]: "Partial Content",
		[types_1$16.HttpStatus.AMBIGUOUS]: "Ambiguous",
		[types_1$16.HttpStatus.MOVED_PERMANENTLY]: "Moved Permanently",
		[types_1$16.HttpStatus.FOUND]: "Found",
		[types_1$16.HttpStatus.SEE_OTHER]: "See Other",
		[types_1$16.HttpStatus.NOT_MODIFIED]: "Not Modified",
		[types_1$16.HttpStatus.TEMPORARY_REDIRECT]: "Temporary Redirect",
		[types_1$16.HttpStatus.PERMANENT_REDIRECT]: "Permanent Redirect",
		[types_1$16.HttpStatus.BAD_REQUEST]: "Bad Request",
		[types_1$16.HttpStatus.UNAUTHORIZED]: "Unauthorized",
		[types_1$16.HttpStatus.PAYMENT_REQUIRED]: "Payment Required",
		[types_1$16.HttpStatus.FORBIDDEN]: "Forbidden",
		[types_1$16.HttpStatus.NOT_FOUND]: "Not Found",
		[types_1$16.HttpStatus.METHOD_NOT_ALLOWED]: "Method Not Allowed",
		[types_1$16.HttpStatus.NOT_ACCEPTABLE]: "Not Acceptable",
		[types_1$16.HttpStatus.PROXY_AUTHENTICATION_REQUIRED]: "Proxy Authentication Required",
		[types_1$16.HttpStatus.REQUEST_TIMEOUT]: "Request Timeout",
		[types_1$16.HttpStatus.CONFLICT]: "Conflict",
		[types_1$16.HttpStatus.GONE]: "Gone",
		[types_1$16.HttpStatus.LENGTH_REQUIRED]: "Length Required",
		[types_1$16.HttpStatus.PRECONDITION_FAILED]: "Precondition Failed",
		[types_1$16.HttpStatus.PAYLOAD_TOO_LARGE]: "Payload Too Large",
		[types_1$16.HttpStatus.URI_TOO_LONG]: "URI Too Long",
		[types_1$16.HttpStatus.UNSUPPORTED_MEDIA_TYPE]: "Unsupported Media Type",
		[types_1$16.HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]: "Requested Range Not Satisfiable",
		[types_1$16.HttpStatus.EXPECTATION_FAILED]: "Expectation Failed",
		[types_1$16.HttpStatus.I_AM_A_TEAPOT]: "I am a teapot",
		[types_1$16.HttpStatus.MISDIRECTED]: "Misdirected",
		[types_1$16.HttpStatus.UNPROCESSABLE_ENTITY]: "Unprocessable Entity",
		[types_1$16.HttpStatus.FAILED_DEPENDENCY]: "Failed Dependency",
		[types_1$16.HttpStatus.PRECONDITION_REQUIRED]: "Precondition Required",
		[types_1$16.HttpStatus.TOO_MANY_REQUESTS]: "Too Many Requests",
		[types_1$16.HttpStatus.INTERNAL_SERVER_ERROR]: "Internal Server Error",
		[types_1$16.HttpStatus.NOT_IMPLEMENTED]: "Not Implemented",
		[types_1$16.HttpStatus.BAD_GATEWAY]: "Bad Gateway",
		[types_1$16.HttpStatus.SERVICE_UNAVAILABLE]: "Service Unavailable",
		[types_1$16.HttpStatus.GATEWAY_TIMEOUT]: "Gateway Timeout",
		[types_1$16.HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: "HTTP Version Not Supported"
	};
	exports.error = (0, createDecorator_1$5.createDecorator)(null, (status, message) => {
		return (handlerSchema) => {
			return {
				...handlerSchema,
				openapi: {
					...handlerSchema?.openapi,
					responses: {
						...handlerSchema?.openapi?.responses,
						[status]: {
							description: `${status} ${statusDisplayText$1[status]}`,
							content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/VovkErrorResponse" }, {
								type: "object",
								properties: {
									message: {
										type: "string",
										enum: [message, ...handlerSchema?.openapi?.responses?.[status]?.content?.["application/json"]?.schema?.allOf?.[1]?.properties?.message?.enum ?? []]
									},
									statusCode: {
										type: "integer",
										enum: [status]
									}
								}
							}] } } }
						}
					}
				}
			};
		};
	});
} });

//#endregion
//#region ../packages/vovk/mjs/openapi/index.js
var require_openapi$1 = __commonJS({ "../packages/vovk/mjs/openapi/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.openAPIToVovkSchema = exports.vovkSchemaToOpenAPI = exports.openapi = exports.openapiDecorator = void 0;
	const vovkSchemaToOpenAPI_1$1 = require_vovkSchemaToOpenAPI$1();
	Object.defineProperty(exports, "vovkSchemaToOpenAPI", {
		enumerable: true,
		get: function() {
			return vovkSchemaToOpenAPI_1$1.vovkSchemaToOpenAPI;
		}
	});
	const index_1$3 = require_openAPIToVovkSchema$1();
	Object.defineProperty(exports, "openAPIToVovkSchema", {
		enumerable: true,
		get: function() {
			return index_1$3.openAPIToVovkSchema;
		}
	});
	const error_1$1 = require_error$1();
	const createDecorator_1$4 = require_createDecorator$1();
	exports.openapiDecorator = (0, createDecorator_1$4.createDecorator)(null, (openAPIOperationObject = {}) => {
		return (handlerSchema) => {
			return {
				...handlerSchema,
				openapi: {
					...handlerSchema?.openapi,
					...openAPIOperationObject
				}
			};
		};
	});
	exports.openapi = Object.assign(exports.openapiDecorator, { error: error_1$1.error });
} });

//#endregion
//#region ../packages/vovk/mjs/utils/generateStaticAPI.js
var require_generateStaticAPI$1 = __commonJS({ "../packages/vovk/mjs/utils/generateStaticAPI.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateStaticAPI = generateStaticAPI$1;
	function generateStaticAPI$1(c, slug = "vovk") {
		const controllers$2 = c;
		return [{ [slug]: ["_schema_"] }, ...Object.values(controllers$2).map((controller) => {
			const handlers = controller._handlers;
			const splitPrefix = controller._prefix?.split("/") ?? [];
			return Object.entries(handlers ?? {}).map(([name, handler]) => {
				const staticParams = controller._handlersMetadata?.[name]?.staticParams;
				if (staticParams?.length) return staticParams.map((paramsItem) => {
					let path = handler.path;
					for (const [key, value] of Object.entries(paramsItem ?? {})) path = path.replace(`{${key}}`, value);
					return { [slug]: [...splitPrefix, ...path.split("/")].filter(Boolean) };
				});
				return [{ [slug]: [...splitPrefix, ...handler.path.split("/")].filter(Boolean) }];
			}).flat();
		}).flat()];
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/setHandlerSchema.js
var require_setHandlerSchema$1 = __commonJS({ "../packages/vovk/mjs/utils/setHandlerSchema.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.setHandlerSchema = setHandlerSchema$1;
	async function setHandlerSchema$1(h, schema$1) {
		h._getSchema = (controller) => {
			if (!controller) throw new Error("Error setting client validators. Controller not found. Did you forget to use an HTTP decorator?");
			const handlerName = Object.getOwnPropertyNames(controller).find((key) => controller[key]._sourceMethod === h);
			if (!handlerName) throw new Error("Error setting client validators. Handler not found.");
			return schema$1;
		};
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/withValidationLibrary.js
var require_withValidationLibrary$1 = __commonJS({ "../packages/vovk/mjs/utils/withValidationLibrary.js"(exports) {
	var __importDefault$6 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.withValidationLibrary = withValidationLibrary$1;
	const HttpException_1$9 = require_HttpException$1();
	const types_1$15 = require_types$3();
	const reqMeta_1$2 = __importDefault$6(require_reqMeta$1());
	const setHandlerSchema_1$1 = require_setHandlerSchema$1();
	const validationTypes$1 = [
		"body",
		"query",
		"params",
		"output",
		"iteration"
	];
	function withValidationLibrary$1({ isForm, disableServerSideValidation, skipSchemaEmission, validateEachIteration, body, query, params, output, iteration, handle, toJSONSchema, validate: validate$1 }) {
		const disableServerSideValidationKeys = disableServerSideValidation === false ? [] : disableServerSideValidation === true ? validationTypes$1 : disableServerSideValidation ?? [];
		const skipSchemaEmissionKeys = skipSchemaEmission === false ? [] : skipSchemaEmission === true ? validationTypes$1 : skipSchemaEmission ?? [];
		const outputHandler = async (req, handlerParams) => {
			const { __disableClientValidation } = req.vovk.meta();
			let data = await handle(req, handlerParams);
			if (__disableClientValidation) return data;
			if (output && iteration) throw new HttpException_1$9.HttpException(types_1$15.HttpStatus.INTERNAL_SERVER_ERROR, "Output and iteration are mutually exclusive. You can't use them together.");
			if (output && !disableServerSideValidationKeys.includes("output")) {
				if (!data) throw new HttpException_1$9.HttpException(types_1$15.HttpStatus.INTERNAL_SERVER_ERROR, "Output is required. You probably forgot to return something from your handler.");
				data = await validate$1(data, output, {
					type: "output",
					req
				}) ?? data;
			}
			if (iteration && !disableServerSideValidationKeys.includes("iteration")) {
				if (!data || typeof data[Symbol.asyncIterator] !== "function") throw new HttpException_1$9.HttpException(types_1$15.HttpStatus.INTERNAL_SERVER_ERROR, "Data is not an async iterable but iteration validation is defined.");
				return async function* () {
					let i = 0;
					for await (let item of data) {
						if (validateEachIteration || i === 0) item = await validate$1(item, iteration, {
							type: "iteration",
							req,
							status: 200,
							i
						}) ?? item;
						i++;
						yield item;
					}
				}();
			} else if (validateEachIteration) throw new HttpException_1$9.HttpException(types_1$15.HttpStatus.INTERNAL_SERVER_ERROR, "validateEachIteration is set but iteration is not defined.");
			return data;
		};
		const resultHandler = async (req, handlerParams) => {
			const { __disableClientValidation } = req.vovk.meta();
			if (!__disableClientValidation) {
				if (body && !disableServerSideValidationKeys.includes("body")) {
					const data = await req.vovk[isForm ? "form" : "body"]();
					const instance = await validate$1(data, body, {
						type: isForm ? "form" : "body",
						req
					}) ?? data;
					req.json = () => Promise.resolve(data);
					req.vovk[isForm ? "form" : "body"] = () => Promise.resolve(instance);
				}
				if (query && !disableServerSideValidationKeys.includes("query")) {
					const data = req.vovk.query();
					const instance = await validate$1(data, query, {
						type: "query",
						req
					}) ?? data;
					req.vovk.query = () => instance;
				}
				if (params && !disableServerSideValidationKeys.includes("params")) {
					const data = req.vovk.params();
					const instance = await validate$1(data, params, {
						type: "params",
						req
					}) ?? data;
					req.vovk.params = () => instance;
				}
			}
			return outputHandler(req, handlerParams);
		};
		function fn(input) {
			const fakeReq = { vovk: {
				body: () => Promise.resolve(input?.body ?? {}),
				query: () => input?.query ?? {},
				params: () => input?.params ?? {},
				meta: (meta) => (0, reqMeta_1$2.default)(fakeReq, meta),
				form: () => {
					throw new Error("Form data is not supported in this context.");
				}
			} };
			fakeReq.vovk.meta({
				__disableClientValidation: input?.disableClientValidation,
				...input?.meta
			});
			return (resultHandler.wrapper ?? resultHandler)(fakeReq, input?.params ?? {});
		}
		const models = {
			...body !== void 0 ? { body } : {},
			...query !== void 0 ? { query } : {},
			...params !== void 0 ? { params } : {},
			...output !== void 0 ? { output } : {},
			...iteration !== void 0 ? { iteration } : {}
		};
		const resultHandlerEnhanced = Object.assign(resultHandler, {
			fn,
			models
		});
		if (toJSONSchema) {
			const getJsonSchema = (model, type) => Object.assign(toJSONSchema(model, { type }), type === "body" && isForm ? { "x-isForm": isForm } : {});
			const validation$3 = {};
			if (body && !skipSchemaEmissionKeys.includes("body")) validation$3.body = getJsonSchema(body, "body");
			if (query && !skipSchemaEmissionKeys.includes("query")) validation$3.query = getJsonSchema(query, "query");
			if (params && !skipSchemaEmissionKeys.includes("params")) validation$3.params = getJsonSchema(params, "params");
			if (output && !skipSchemaEmissionKeys.includes("output")) validation$3.output = getJsonSchema(output, "output");
			if (iteration && !skipSchemaEmissionKeys.includes("iteration")) validation$3.iteration = getJsonSchema(iteration, "iteration");
			(0, setHandlerSchema_1$1.setHandlerSchema)(resultHandlerEnhanced, { validation: validation$3 });
		}
		return resultHandlerEnhanced;
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/createStandardValidation.js
var require_createStandardValidation$1 = __commonJS({ "../packages/vovk/mjs/utils/createStandardValidation.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createStandardValidation = createStandardValidation$1;
	const types_1$14 = require_types$3();
	const withValidationLibrary_1$3 = require_withValidationLibrary$1();
	const HttpException_1$8 = require_HttpException$1();
	function createStandardValidation$1({ toJSONSchema }) {
		function withStandard({ isForm, body, query, params, output, iteration, handle, disableServerSideValidation, skipSchemaEmission, validateEachIteration }) {
			return (0, withValidationLibrary_1$3.withValidationLibrary)({
				isForm,
				body,
				query,
				params,
				output,
				iteration,
				disableServerSideValidation,
				skipSchemaEmission,
				validateEachIteration,
				handle,
				toJSONSchema,
				validate: async (data, model, { type, i }) => {
					const result = await model["~standard"].validate(data);
					if (result.issues?.length) throw new HttpException_1$8.HttpException(types_1$14.HttpStatus.BAD_REQUEST, `Validation failed. Invalid ${type === "iteration" ? `${type} #${i}` : type} on server: ${result.issues.map(({ message, path }) => `${message}${path ? ` at ${path.join(".")}` : ""}`).join(", ")}`, {
						[type]: data,
						result
					});
					return result.value;
				}
			});
		}
		return withStandard;
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/multitenant.js
var require_multitenant$1 = __commonJS({ "../packages/vovk/mjs/utils/multitenant.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.multitenant = multitenant$1;
	const getReservedPaths$1 = (overrides) => {
		return Object.keys(overrides).filter((key) => !key.includes("[") && !key.includes("]"));
	};
	/**
	* Convert a pattern with [placeholders] to a regex pattern and extract placeholder names
	*/
	const patternToRegex$1 = (pattern) => {
		const paramNames = [];
		const regexPattern = pattern.replace(/\[([^\]]+)\]/g, (_$2, name) => {
			paramNames.push(name);
			return "([^.]+)";
		}).replace(/\./g, "\\.");
		return {
			regex: new RegExp(`^${regexPattern}$`),
			paramNames
		};
	};
	function multitenant$1(config$1) {
		const { requestUrl, requestHost, targetHost, overrides } = config$1;
		const urlObj = new URL(requestUrl);
		const pathname = urlObj.pathname.slice(1);
		if (pathname.endsWith("_schema_")) return {
			action: null,
			destination: null,
			message: "Schema endpoint, bypassing overrides",
			subdomains: null
		};
		const pathSegments = pathname.split("/").filter(Boolean);
		const reservedPaths = getReservedPaths$1(overrides);
		for (let i = 0; i < pathSegments.length; i++) {
			const segment = pathSegments[i];
			if (reservedPaths.includes(segment)) {
				const destinationHost = `${segment}.${targetHost}`;
				const beforeSegments = pathSegments.slice(0, i);
				const afterSegments = pathSegments.slice(i + 1);
				const newPath = [...beforeSegments, ...afterSegments].join("/");
				const destinationUrl = new URL(`${urlObj.protocol}//${destinationHost}`);
				if (newPath) destinationUrl.pathname = `/${newPath}`;
				destinationUrl.search = urlObj.search;
				return {
					action: "redirect",
					destination: destinationUrl.toString(),
					message: `Redirecting to ${segment} subdomain`,
					subdomains: null
				};
			}
		}
		for (const pattern in overrides) {
			const fullPattern = `${pattern}.${targetHost}`;
			const { regex: regex$1, paramNames } = patternToRegex$1(fullPattern);
			const match = requestHost.match(regex$1);
			if (match) {
				const overrideRules = overrides[pattern];
				const params = {};
				if (match.length > 1) for (let i = 0; i < paramNames.length; i++) params[paramNames[i]] = match[i + 1];
				for (const rule of overrideRules) if (pathname === rule.from || pathname.startsWith(`${rule.from}/`)) {
					let destination = pathname.replace(rule.from, rule.to);
					if (Object.keys(params).length > 0) Object.entries(params).forEach(([key, value]) => {
						destination = destination.replace(`[${key}]`, value);
					});
					const wildcardSubdomains = paramNames.length > 0 ? params : null;
					return {
						action: "rewrite",
						destination: `${urlObj.protocol}//${urlObj.host}/${destination}${urlObj.search}`,
						message: `Rewriting to ${destination}`,
						subdomains: wildcardSubdomains
					};
				}
			}
		}
		if (pathSegments.length > 0 && reservedPaths.includes(pathSegments[0])) {
			const reservedPath = pathSegments[0];
			const restPath = pathSegments.slice(1).join("/");
			const destinationHost = `${reservedPath}.${targetHost}`;
			const destinationUrl = new URL(`${urlObj.protocol}//${destinationHost}`);
			if (restPath) destinationUrl.pathname = `/${restPath}`;
			destinationUrl.search = urlObj.search;
			return {
				action: "redirect",
				destination: destinationUrl.toString(),
				message: `Redirecting to ${reservedPath} subdomain`,
				subdomains: null
			};
		}
		return {
			action: null,
			destination: null,
			message: "No action",
			subdomains: null
		};
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/createLLMTools.js
var require_createLLMTools$1 = __commonJS({ "../packages/vovk/mjs/utils/createLLMTools.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createLLMTools = createLLMTools$1;
	const createLLMTool$1 = ({ moduleName, handlerName, caller, module: module$1, init, meta, onExecute, onError }) => {
		if (!module$1) throw new Error(`Module "${moduleName}" not found.`);
		const handler = module$1[handlerName];
		if (!handler) throw new Error(`Handler "${handlerName}" not found in module "${moduleName}".`);
		const { schema: schema$1, models } = handler;
		if (!schema$1 || !schema$1.openapi) throw new Error(`Handler "${handlerName}" in module "${moduleName}" does not have a valid schema.`);
		const execute = (input, options) => {
			const { body, query, params } = input;
			const callerInput = {
				schema: schema$1,
				models,
				handler,
				body,
				query,
				params,
				init,
				meta,
				handlerName,
				moduleName
			};
			return caller(callerInput, options).then((data) => onExecute(data, callerInput, options) ?? data).catch((error$41) => onError?.(error$41, callerInput, options) ?? error$41);
		};
		const parametersProperties = {
			...schema$1?.validation?.body ? { body: schema$1.validation.body } : {},
			...schema$1?.validation?.query ? { query: schema$1.validation.query } : {},
			...schema$1?.validation?.params ? { params: schema$1.validation.params } : {}
		};
		return {
			type: "function",
			execute,
			name: `${moduleName}_${handlerName}`,
			description: schema$1.openapi?.["x-tool-description"] ?? ([schema$1.openapi?.summary ?? "", schema$1.openapi?.description ?? ""].filter(Boolean).join("\n") || handlerName),
			parameters: {
				type: "object",
				properties: parametersProperties,
				required: Object.keys(parametersProperties),
				additionalProperties: false
			},
			models
		};
	};
	async function defaultCaller$1({ handler, body, query, params, init, meta }, _options) {
		if (handler.isRPC) return handler({
			handler,
			body,
			query,
			params,
			init,
			meta
		});
		if (handler.fn) return handler.fn({
			body,
			query,
			params,
			meta
		});
		throw new Error("Handler is not a valid RPC or controller method");
	}
	function createLLMTools$1({ modules, caller = defaultCaller$1, meta, onExecute = (result) => result, onError = () => {} }) {
		const moduleWithConfig = modules;
		const tools = Object.entries(moduleWithConfig ?? {}).map(([moduleName, moduleWithconfig]) => {
			let init;
			let module$1;
			if (Array.isArray(moduleWithconfig)) [module$1, {init}] = moduleWithconfig;
			else module$1 = moduleWithconfig;
			return Object.entries(module$1 ?? {}).filter(([, handler]) => handler?.schema?.openapi && !handler?.schema?.openapi?.["x-tool-exclude"]).map(([handlerName]) => createLLMTool$1({
				moduleName,
				handlerName,
				caller,
				module: module$1,
				init,
				meta,
				onExecute,
				onError
			}));
		}).flat();
		return { tools };
	}
} });

//#endregion
//#region ../packages/vovk/mjs/utils/createValidateOnClient.js
var require_createValidateOnClient$1 = __commonJS({ "../packages/vovk/mjs/utils/createValidateOnClient.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createValidateOnClient = createValidateOnClient$1;
	function createValidateOnClient$1({ validate: validate$1 }) {
		const validateOnClient$1 = async function validateOnClient$2(input, validation$3, meta) {
			const newInput = { ...input };
			if (input.body && validation$3.body) newInput.body = await validate$1(input.body, validation$3.body, {
				...meta,
				type: "body"
			}) ?? input.body;
			if (input.query && validation$3.query) newInput.query = await validate$1(input.query, validation$3.query, {
				...meta,
				type: "query"
			}) ?? input.query;
			if (input.params && validation$3.params) newInput.params = await validate$1(input.params, validation$3.params, {
				...meta,
				type: "params"
			}) ?? input.params;
			return newInput;
		};
		return validateOnClient$1;
	}
} });

//#endregion
//#region ../packages/vovk/mjs/index.js
var require_mjs = __commonJS({ "../packages/vovk/mjs/index.js"(exports) {
	var _a$2;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.initSegment = exports.prefix = exports.options = exports.head = exports.del = exports.patch = exports.put = exports.post = exports.get = exports.vovkSchemaToOpenAPI = exports.openAPIToVovkSchema = exports.openapi = exports.progressive = exports.createValidateOnClient = exports.createCodeExamples = exports.createLLMTools = exports.multitenant = exports.createStandardValidation = exports.withValidationLibrary = exports.generateStaticAPI = exports.createFetcher = exports.fetcher = exports.createRPC = exports.createDecorator = exports.createVovkApp = exports.HttpMethod = exports.HttpStatus = exports.HttpException = exports.JSONLinesResponse = exports.VovkSchemaIdEnum = void 0;
	const createVovkApp_1$1 = require_createVovkApp$1();
	Object.defineProperty(exports, "createVovkApp", {
		enumerable: true,
		get: function() {
			return createVovkApp_1$1.createVovkApp;
		}
	});
	const types_1$13 = require_types$3();
	Object.defineProperty(exports, "HttpStatus", {
		enumerable: true,
		get: function() {
			return types_1$13.HttpStatus;
		}
	});
	Object.defineProperty(exports, "HttpMethod", {
		enumerable: true,
		get: function() {
			return types_1$13.HttpMethod;
		}
	});
	Object.defineProperty(exports, "VovkSchemaIdEnum", {
		enumerable: true,
		get: function() {
			return types_1$13.VovkSchemaIdEnum;
		}
	});
	const index_1$2 = require_client$1();
	Object.defineProperty(exports, "createRPC", {
		enumerable: true,
		get: function() {
			return index_1$2.createRPC;
		}
	});
	Object.defineProperty(exports, "fetcher", {
		enumerable: true,
		get: function() {
			return index_1$2.fetcher;
		}
	});
	Object.defineProperty(exports, "createFetcher", {
		enumerable: true,
		get: function() {
			return index_1$2.createFetcher;
		}
	});
	Object.defineProperty(exports, "progressive", {
		enumerable: true,
		get: function() {
			return index_1$2.progressive;
		}
	});
	const index_2$1 = require_openapi$1();
	Object.defineProperty(exports, "openapi", {
		enumerable: true,
		get: function() {
			return index_2$1.openapi;
		}
	});
	Object.defineProperty(exports, "openAPIToVovkSchema", {
		enumerable: true,
		get: function() {
			return index_2$1.openAPIToVovkSchema;
		}
	});
	Object.defineProperty(exports, "vovkSchemaToOpenAPI", {
		enumerable: true,
		get: function() {
			return index_2$1.vovkSchemaToOpenAPI;
		}
	});
	const HttpException_1$7 = require_HttpException$1();
	Object.defineProperty(exports, "HttpException", {
		enumerable: true,
		get: function() {
			return HttpException_1$7.HttpException;
		}
	});
	const createDecorator_1$3 = require_createDecorator$1();
	Object.defineProperty(exports, "createDecorator", {
		enumerable: true,
		get: function() {
			return createDecorator_1$3.createDecorator;
		}
	});
	const JSONLinesResponse_1$2 = require_JSONLinesResponse$1();
	Object.defineProperty(exports, "JSONLinesResponse", {
		enumerable: true,
		get: function() {
			return JSONLinesResponse_1$2.JSONLinesResponse;
		}
	});
	const generateStaticAPI_1$1 = require_generateStaticAPI$1();
	Object.defineProperty(exports, "generateStaticAPI", {
		enumerable: true,
		get: function() {
			return generateStaticAPI_1$1.generateStaticAPI;
		}
	});
	const withValidationLibrary_1$2 = require_withValidationLibrary$1();
	Object.defineProperty(exports, "withValidationLibrary", {
		enumerable: true,
		get: function() {
			return withValidationLibrary_1$2.withValidationLibrary;
		}
	});
	const createStandardValidation_1$1 = require_createStandardValidation$1();
	Object.defineProperty(exports, "createStandardValidation", {
		enumerable: true,
		get: function() {
			return createStandardValidation_1$1.createStandardValidation;
		}
	});
	const multitenant_1$1 = require_multitenant$1();
	Object.defineProperty(exports, "multitenant", {
		enumerable: true,
		get: function() {
			return multitenant_1$1.multitenant;
		}
	});
	const createLLMTools_1$1 = require_createLLMTools$1();
	Object.defineProperty(exports, "createLLMTools", {
		enumerable: true,
		get: function() {
			return createLLMTools_1$1.createLLMTools;
		}
	});
	const createCodeExamples_1$2 = require_createCodeExamples$1();
	Object.defineProperty(exports, "createCodeExamples", {
		enumerable: true,
		get: function() {
			return createCodeExamples_1$2.createCodeExamples;
		}
	});
	const createValidateOnClient_1$1 = require_createValidateOnClient$1();
	Object.defineProperty(exports, "createValidateOnClient", {
		enumerable: true,
		get: function() {
			return createValidateOnClient_1$1.createValidateOnClient;
		}
	});
	_a$2 = (0, createVovkApp_1$1.createVovkApp)(), exports.get = _a$2.get, exports.post = _a$2.post, exports.put = _a$2.put, exports.patch = _a$2.patch, exports.del = _a$2.del, exports.head = _a$2.head, exports.options = _a$2.options, exports.prefix = _a$2.prefix, exports.initSegment = _a$2.initSegment;
} });

//#endregion
//#region .vovk-schema/_meta.json
var config = {
	"libs": {},
	"$schema": "https://vovk.dev/api/schema/v3/config.json"
};
var _meta_default = { config };

//#endregion
//#region .vovk-schema/foo/client.json
var $schema$1 = "https://vovk.dev/api/schema/v3/segment.json";
var emitSchema$1 = true;
var segmentName$1 = "foo/client";
var segmentType$1 = "segment";
var controllers$1 = {
	"CommonControllerRPC": {
		"rpcModuleName": "CommonControllerRPC",
		"originalControllerName": "CommonController",
		"prefix": "common",
		"handlers": {
			"getHelloWorldResponseObject": {
				"httpMethod": "GET",
				"path": "get-hello-world-response-object"
			},
			"getHelloWorldObjectLiteral": {
				"httpMethod": "GET",
				"path": "get-hello-world-object-literal"
			},
			"getHelloWorldNextResponseObjectPromise": {
				"httpMethod": "GET",
				"path": "get-hello-world-next-response-object-promise"
			},
			"getHelloWorldRawResponseObjectPromise": {
				"httpMethod": "GET",
				"path": "get-hello-world-raw-response-object-promise"
			},
			"getHelloWorldObjectLiteralPromise": {
				"httpMethod": "GET",
				"path": "get-hello-world-object-literal-promise"
			},
			"getHelloWorldHeaders": {
				"httpMethod": "GET",
				"path": "get-hello-world-headers"
			},
			"getHelloWorldArray": {
				"httpMethod": "GET",
				"path": "get-hello-world-array"
			},
			"getHelloWorldAndEmptyGeneric": {
				"httpMethod": "GET",
				"path": "get-hello-world-and-empty-generic"
			},
			"getWithParams": {
				"path": "with-params/{hello}",
				"httpMethod": "GET"
			},
			"postWithAll": {
				"path": "with-all/{hello}",
				"httpMethod": "POST"
			},
			"postWithBodyAndQueryUsingReqVovk": {
				"path": "with-all-using-req-vovk",
				"httpMethod": "POST"
			},
			"getNestedQuery": {
				"path": "nested-query",
				"httpMethod": "GET"
			},
			"postWithFormDataUsingReqVovk": {
				"path": "form-data",
				"httpMethod": "POST"
			},
			"getErrorResponse": {
				"path": "error",
				"httpMethod": "GET"
			},
			"getJsonTextResponse": {
				"path": "json-text",
				"httpMethod": "GET"
			},
			"getJsonlResponse": {
				"path": "jsonl",
				"httpMethod": "GET"
			},
			"getJsonlTextResponse": {
				"path": "jsonl-text",
				"httpMethod": "GET"
			}
		}
	},
	"StreamingControllerRPC": {
		"rpcModuleName": "StreamingControllerRPC",
		"originalControllerName": "StreamingController",
		"prefix": "streaming",
		"handlers": {
			"postWithStreaming": {
				"httpMethod": "POST",
				"path": "post-with-streaming"
			},
			"postWithStreamingAndImmediateError": {
				"httpMethod": "POST",
				"path": "post-with-streaming-and-immediate-error"
			},
			"postWithStreamingAndDelayedError": {
				"httpMethod": "POST",
				"path": "post-with-streaming-and-delayed-error"
			},
			"postWithStreamingAndDelayedCustomError": {
				"httpMethod": "POST",
				"path": "post-with-streaming-and-delayed-custom-error"
			},
			"postWithStreamingAndDelayedUnhandledError": {
				"httpMethod": "POST",
				"path": "post-with-streaming-and-delayed-unhandled-error"
			}
		}
	},
	"StreamingGeneratorControllerRPC": {
		"rpcModuleName": "StreamingGeneratorControllerRPC",
		"originalControllerName": "StreamingGeneratorController",
		"prefix": "streaming-generator",
		"handlers": {
			"getWithStreaming": {
				"httpMethod": "GET",
				"path": "get-with-streaming"
			},
			"postWithAsyncStreaming": {
				"httpMethod": "POST",
				"path": "post-with-async-streaming"
			},
			"postWithStreaming": {
				"httpMethod": "POST",
				"path": "post-with-streaming"
			},
			"postWithStreamingAndImmediateError": {
				"httpMethod": "POST",
				"path": "post-with-streaming-and-immediate-error"
			},
			"postWithStreamingAndDelayedError": {
				"httpMethod": "POST",
				"path": "post-with-streaming-and-delayed-error"
			},
			"postWithStreamingAndDelayedCustomError": {
				"httpMethod": "POST",
				"path": "post-with-streaming-and-delayed-custom-error"
			},
			"postWithStreamingAndDelayedUnhandledError": {
				"httpMethod": "POST",
				"path": "post-with-streaming-and-delayed-unhandled-error"
			}
		}
	},
	"CustomSchemaControllerRPC": {
		"rpcModuleName": "CustomSchemaControllerRPC",
		"originalControllerName": "CustomSchemaController",
		"prefix": "",
		"handlers": { "getWithCustomSchema": {
			"misc": { "hello": "world" },
			"httpMethod": "GET",
			"path": "get-with-custom-schema"
		} }
	},
	"WithZodClientControllerRPC": {
		"rpcModuleName": "WithZodClientControllerRPC",
		"originalControllerName": "WithZodClientController",
		"prefix": "with-zod",
		"handlers": {
			"handleAll": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "hello": { "type": "string" } },
						"required": ["hello"],
						"additionalProperties": false
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "search": { "type": "string" } },
						"required": ["search"],
						"additionalProperties": false
					},
					"params": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"foo": { "type": "string" },
							"bar": { "type": "string" }
						},
						"required": ["foo", "bar"],
						"additionalProperties": false
					},
					"output": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"body": {
								"type": "object",
								"properties": { "hello": { "type": "string" } },
								"required": ["hello"],
								"additionalProperties": false
							},
							"query": {
								"type": "object",
								"properties": { "search": { "type": "string" } },
								"required": ["search"],
								"additionalProperties": false
							},
							"params": {
								"type": "object",
								"properties": {
									"foo": { "type": "string" },
									"bar": { "type": "string" }
								},
								"required": ["foo", "bar"],
								"additionalProperties": false
							},
							"vovkParams": {
								"type": "object",
								"properties": {
									"foo": { "type": "string" },
									"bar": { "type": "string" }
								},
								"required": ["foo", "bar"],
								"additionalProperties": false
							}
						},
						"required": [
							"body",
							"query",
							"params",
							"vovkParams"
						],
						"additionalProperties": false
					}
				},
				"path": "all/{foo}/{bar}",
				"httpMethod": "POST",
				"openapi": {
					"responses": { "400": {
						"description": "400 Bad Request",
						"content": { "application/json": { "schema": { "allOf": [{ "$ref": "#/components/schemas/VovkErrorResponse" }, {
							"type": "object",
							"properties": {
								"message": {
									"type": "string",
									"enum": ["This is a bad request"]
								},
								"statusCode": {
									"type": "integer",
									"enum": [400]
								}
							}
						}] } } }
					} },
					"summary": "This is a summary",
					"description": "This is a description"
				}
			},
			"handleQuery": {
				"validation": { "query": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": { "search": {
						"type": "string",
						"maxLength": 5
					} },
					"required": ["search"],
					"additionalProperties": false
				} },
				"httpMethod": "GET",
				"path": "handle-query"
			},
			"handleBody": {
				"validation": { "body": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": { "hello": {
						"type": "string",
						"maxLength": 5
					} },
					"required": ["hello"],
					"additionalProperties": false
				} },
				"httpMethod": "POST",
				"path": "handle-body"
			},
			"handleBodyZod3": {
				"validation": { "body": {
					"type": "object",
					"properties": { "hello": {
						"type": "string",
						"maxLength": 5
					} },
					"required": ["hello"],
					"additionalProperties": false,
					"$schema": "http://json-schema.org/draft-07/schema#"
				} },
				"httpMethod": "POST",
				"path": "handle-body-zod3"
			},
			"handleParams": {
				"validation": { "params": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": {
						"foo": {
							"type": "string",
							"maxLength": 5
						},
						"bar": {
							"type": "string",
							"maxLength": 5
						}
					},
					"required": ["foo", "bar"],
					"additionalProperties": false
				} },
				"path": "x/{foo}/{bar}/y",
				"httpMethod": "PUT"
			},
			"handleNestedQuery": {
				"validation": { "query": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": {
						"x": {
							"type": "string",
							"maxLength": 5
						},
						"y": {
							"type": "array",
							"items": { "type": "string" }
						},
						"z": {
							"type": "object",
							"properties": {
								"f": { "type": "string" },
								"u": {
									"type": "array",
									"items": { "type": "string" }
								},
								"d": {
									"type": "object",
									"properties": {
										"x": { "type": "string" },
										"arrOfObjects": {
											"type": "array",
											"items": {
												"type": "object",
												"properties": {
													"foo": { "type": "string" },
													"nestedArr": {
														"type": "array",
														"items": { "type": "string" }
													},
													"nestedObj": {
														"type": "object",
														"properties": { "deepKey": { "type": "string" } },
														"required": ["deepKey"],
														"additionalProperties": false
													}
												},
												"required": ["foo"],
												"additionalProperties": false
											}
										}
									},
									"required": ["x", "arrOfObjects"],
									"additionalProperties": false
								}
							},
							"required": [
								"f",
								"u",
								"d"
							],
							"additionalProperties": false
						}
					},
					"required": [
						"x",
						"y",
						"z"
					],
					"additionalProperties": false
				} },
				"httpMethod": "GET",
				"path": "handle-nested-query"
			},
			"handleOutput": {
				"validation": {
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "helloOutput": { "type": "string" } },
						"required": ["helloOutput"],
						"additionalProperties": false
					},
					"output": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "hello": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["hello"],
						"additionalProperties": false
					}
				},
				"httpMethod": "GET",
				"path": "handle-output"
			},
			"handleStream": {
				"validation": {
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "values": {
							"type": "array",
							"items": { "type": "string" }
						} },
						"required": ["values"],
						"additionalProperties": false
					},
					"iteration": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "value": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["value"],
						"additionalProperties": false
					}
				},
				"httpMethod": "GET",
				"path": "handle-stream"
			},
			"handleSchemaConstraints": {
				"validation": { "body": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": {
						"enum_value": {
							"type": "string",
							"enum": [
								"a",
								"b",
								"c"
							]
						},
						"num_minimum": {
							"type": "number",
							"minimum": 1
						},
						"num_maximum": {
							"type": "number",
							"maximum": 100
						},
						"num_exclusiveMinimum": {
							"type": "number",
							"exclusiveMinimum": 1
						},
						"num_exclusiveMaximum": {
							"type": "number",
							"exclusiveMaximum": 100
						},
						"num_multipleOf": {
							"type": "number",
							"multipleOf": 5
						},
						"num_int": {
							"type": "integer",
							"minimum": -9007199254740991,
							"maximum": 9007199254740991
						},
						"num_int32": {
							"type": "integer",
							"minimum": -2147483648,
							"maximum": 2147483647
						},
						"str_minLength": {
							"type": "string",
							"minLength": 3
						},
						"str_maxLength": {
							"type": "string",
							"maxLength": 50
						},
						"str_pattern": {
							"type": "string",
							"pattern": "^[A-Z][a-z]*$"
						},
						"str_email": {
							"type": "string",
							"format": "email",
							"pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
						},
						"str_url": {
							"type": "string",
							"format": "uri"
						},
						"str_uuid": {
							"type": "string",
							"format": "uuid",
							"pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$"
						},
						"str_datetime": {
							"type": "string",
							"format": "date-time",
							"pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
						},
						"arr_minItems": {
							"minItems": 1,
							"type": "array",
							"items": { "type": "string" }
						},
						"arr_maxItems": {
							"maxItems": 10,
							"type": "array",
							"items": { "type": "string" }
						},
						"obj_required": {
							"type": "object",
							"properties": {
								"requiredField": { "type": "string" },
								"optionalField": { "type": "number" }
							},
							"required": ["requiredField"],
							"additionalProperties": false
						},
						"obj_strict": {
							"type": "object",
							"properties": { "knownField": { "type": "string" } },
							"required": ["knownField"],
							"additionalProperties": false
						},
						"logical_anyOf": { "anyOf": [
							{
								"type": "string",
								"maxLength": 5
							},
							{ "type": "number" },
							{ "type": "boolean" }
						] },
						"logical_allOf": { "allOf": [{
							"type": "object",
							"properties": { "a": { "type": "string" } },
							"required": ["a"],
							"additionalProperties": {}
						}, {
							"type": "object",
							"properties": { "b": { "type": "number" } },
							"required": ["b"],
							"additionalProperties": {}
						}] }
					},
					"required": [
						"enum_value",
						"num_minimum",
						"num_maximum",
						"num_exclusiveMinimum",
						"num_exclusiveMaximum",
						"num_multipleOf",
						"num_int",
						"num_int32",
						"str_minLength",
						"str_maxLength",
						"str_pattern",
						"str_email",
						"str_url",
						"str_uuid",
						"str_datetime",
						"arr_minItems",
						"arr_maxItems",
						"obj_required",
						"obj_strict",
						"logical_anyOf",
						"logical_allOf"
					],
					"additionalProperties": false
				} },
				"httpMethod": "POST",
				"path": "handle-schema-constraints"
			},
			"handleNothitng": {
				"validation": {},
				"httpMethod": "POST",
				"path": "handle-nothitng"
			},
			"handleFormData": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "hello": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["hello"],
						"additionalProperties": false,
						"x-isForm": true
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "search": { "type": "string" } },
						"required": ["search"],
						"additionalProperties": false
					},
					"output": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"hello": {
								"type": "string",
								"maxLength": 5
							},
							"search": { "type": "string" }
						},
						"required": ["hello", "search"],
						"additionalProperties": false
					}
				},
				"httpMethod": "POST",
				"path": "handle-form-data"
			},
			"handleFormDataWithFile": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"hello": {
								"type": "string",
								"maxLength": 5
							},
							"file": {
								"type": "string",
								"format": "binary",
								"contentEncoding": "binary"
							}
						},
						"required": ["hello", "file"],
						"additionalProperties": false,
						"x-isForm": true
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "search": { "type": "string" } },
						"required": ["search"],
						"additionalProperties": false
					},
					"output": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"hello": {
								"type": "string",
								"maxLength": 5
							},
							"file": { "type": "string" },
							"search": { "type": "string" }
						},
						"required": [
							"hello",
							"file",
							"search"
						],
						"additionalProperties": false
					}
				},
				"httpMethod": "POST",
				"path": "handle-form-data-with-file"
			},
			"handleFormDataWithMultipleFiles": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"hello": {
								"type": "string",
								"maxLength": 5
							},
							"files": {
								"type": "array",
								"items": {
									"type": "string",
									"format": "binary",
									"contentEncoding": "binary"
								}
							}
						},
						"required": ["hello", "files"],
						"additionalProperties": false,
						"x-isForm": true
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "search": { "type": "string" } },
						"required": ["search"],
						"additionalProperties": false
					},
					"output": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"hello": {
								"type": "string",
								"maxLength": 5
							},
							"files": {
								"type": "array",
								"items": { "type": "string" }
							},
							"search": { "type": "string" }
						},
						"required": [
							"hello",
							"files",
							"search"
						],
						"additionalProperties": false
					}
				},
				"httpMethod": "POST",
				"path": "handle-form-data-with-multiple-files"
			},
			"disableServerSideValidationBool": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "hello": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["hello"],
						"additionalProperties": false
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "search": { "type": "string" } },
						"required": ["search"],
						"additionalProperties": false
					}
				},
				"httpMethod": "POST",
				"path": "disable-server-side-validation-bool"
			},
			"disableServerSideValidationStrings": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "hello": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["hello"],
						"additionalProperties": false
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "search": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["search"],
						"additionalProperties": false
					}
				},
				"httpMethod": "POST",
				"path": "disable-server-side-validation-strings"
			},
			"skipSchemaEmissionBool": {
				"validation": {},
				"httpMethod": "POST",
				"path": "skip-schema-emission-bool"
			},
			"skipSchemaEmissionStrings": {
				"validation": { "query": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": { "search": { "type": "string" } },
					"required": ["search"],
					"additionalProperties": false
				} },
				"httpMethod": "POST",
				"path": "skip-schema-emission-strings"
			},
			"validateEachIteration": {
				"validation": {
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "values": {
							"type": "array",
							"items": { "type": "string" }
						} },
						"required": ["values"],
						"additionalProperties": false
					},
					"iteration": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "value": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["value"],
						"additionalProperties": false
					}
				},
				"httpMethod": "POST",
				"path": "validate-each-iteration"
			},
			"handleAllAsFunction": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "hello": { "type": "string" } },
						"required": ["hello"],
						"additionalProperties": false
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "search": { "type": "string" } },
						"required": ["search"],
						"additionalProperties": false
					},
					"params": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"foo": { "type": "string" },
							"bar": { "type": "string" }
						},
						"required": ["foo", "bar"],
						"additionalProperties": false
					},
					"output": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"body": {
								"type": "object",
								"properties": { "hello": { "type": "string" } },
								"required": ["hello"],
								"additionalProperties": false
							},
							"query": {
								"type": "object",
								"properties": { "search": { "type": "string" } },
								"required": ["search"],
								"additionalProperties": false
							},
							"params": {
								"type": "object",
								"properties": {
									"foo": { "type": "string" },
									"bar": { "type": "string" }
								},
								"required": ["foo", "bar"],
								"additionalProperties": false
							},
							"vovkParams": {
								"type": "object",
								"properties": {
									"foo": { "type": "string" },
									"bar": { "type": "string" }
								},
								"required": ["foo", "bar"],
								"additionalProperties": false
							}
						},
						"required": [
							"body",
							"query",
							"params",
							"vovkParams"
						],
						"additionalProperties": false
					}
				},
				"path": "all-as-func/{foo}/{bar}",
				"httpMethod": "POST"
			},
			"handleAllNoHttpAsFunction": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "hello": { "type": "string" } },
						"required": ["hello"],
						"additionalProperties": false
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "search": { "type": "string" } },
						"required": ["search"],
						"additionalProperties": false
					},
					"params": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"foo": { "type": "string" },
							"bar": { "type": "string" }
						},
						"required": ["foo", "bar"],
						"additionalProperties": false
					},
					"output": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"body": {
								"type": "object",
								"properties": { "hello": { "type": "string" } },
								"required": ["hello"],
								"additionalProperties": false
							},
							"query": {
								"type": "object",
								"properties": { "search": { "type": "string" } },
								"required": ["search"],
								"additionalProperties": false
							},
							"params": {
								"type": "object",
								"properties": {
									"foo": { "type": "string" },
									"bar": { "type": "string" }
								},
								"required": ["foo", "bar"],
								"additionalProperties": false
							},
							"vovkParams": {
								"type": "object",
								"properties": {
									"foo": { "type": "string" },
									"bar": { "type": "string" }
								},
								"required": ["foo", "bar"],
								"additionalProperties": false
							}
						},
						"required": [
							"body",
							"query",
							"params",
							"vovkParams"
						],
						"additionalProperties": false
					}
				},
				"path": "all-no-http-as-func/{foo}/{bar}",
				"httpMethod": "POST"
			},
			"handlePagination": {
				"validation": {
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"page": { "type": "string" },
							"limit": { "type": "string" }
						},
						"required": ["page", "limit"],
						"additionalProperties": false
					},
					"output": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": {
							"items": {
								"type": "array",
								"items": {
									"type": "object",
									"properties": {
										"id": { "type": "number" },
										"name": { "type": "string" }
									},
									"required": ["id", "name"],
									"additionalProperties": false
								}
							},
							"hasNextPage": { "type": "boolean" },
							"nextPage": { "type": "number" }
						},
						"required": ["items", "hasNextPage"],
						"additionalProperties": false
					}
				},
				"httpMethod": "GET",
				"path": "handle-pagination"
			}
		}
	},
	"WithYupClientControllerRPC": {
		"rpcModuleName": "WithYupClientControllerRPC",
		"originalControllerName": "WithYupClientController",
		"prefix": "with-yup",
		"handlers": {
			"handleAll": {
				"validation": {
					"body": {
						"type": "object",
						"properties": { "hello": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["hello"]
					},
					"query": {
						"type": "object",
						"properties": { "search": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["search"]
					},
					"params": {
						"type": "object",
						"properties": {
							"foo": {
								"type": "string",
								"maxLength": 5
							},
							"bar": {
								"type": "string",
								"maxLength": 5
							}
						},
						"required": ["foo", "bar"]
					},
					"output": {
						"type": "object",
						"properties": {
							"body": {
								"type": "object",
								"properties": { "hello": {
									"type": "string",
									"maxLength": 5
								} },
								"required": ["hello"]
							},
							"query": {
								"type": "object",
								"properties": { "search": {
									"type": "string",
									"maxLength": 5
								} },
								"required": ["search"]
							},
							"params": {
								"type": "object",
								"properties": {
									"foo": {
										"type": "string",
										"maxLength": 5
									},
									"bar": {
										"type": "string",
										"maxLength": 5
									}
								},
								"required": ["foo", "bar"]
							},
							"vovkParams": {
								"type": "object",
								"properties": {
									"foo": {
										"type": "string",
										"maxLength": 5
									},
									"bar": {
										"type": "string",
										"maxLength": 5
									}
								},
								"required": ["foo", "bar"]
							}
						},
						"required": [
							"body",
							"query",
							"params",
							"vovkParams"
						]
					}
				},
				"path": "all/{foo}/{bar}",
				"httpMethod": "POST",
				"openapi": {
					"responses": { "400": {
						"description": "400 Bad Request",
						"content": { "application/json": { "schema": { "allOf": [{ "$ref": "#/components/schemas/VovkErrorResponse" }, {
							"type": "object",
							"properties": {
								"message": {
									"type": "string",
									"enum": ["This is a bad request"]
								},
								"statusCode": {
									"type": "integer",
									"enum": [400]
								}
							}
						}] } } }
					} },
					"summary": "This is a summary",
					"description": "This is a description"
				}
			},
			"handleQuery": {
				"validation": { "query": {
					"type": "object",
					"properties": { "search": {
						"type": "string",
						"maxLength": 5
					} },
					"required": ["search"]
				} },
				"httpMethod": "GET",
				"path": "handle-query"
			},
			"handleBody": {
				"validation": { "body": {
					"type": "object",
					"properties": { "hello": {
						"type": "string",
						"maxLength": 5
					} },
					"required": ["hello"]
				} },
				"httpMethod": "POST",
				"path": "handle-body"
			},
			"handleParams": {
				"validation": { "params": {
					"type": "object",
					"properties": {
						"foo": {
							"type": "string",
							"maxLength": 5
						},
						"bar": {
							"type": "string",
							"maxLength": 5
						}
					},
					"required": ["foo", "bar"]
				} },
				"path": "x/{foo}/{bar}/y",
				"httpMethod": "PUT"
			},
			"handleNestedQuery": {
				"validation": { "query": {
					"type": "object",
					"properties": {
						"x": {
							"type": "string",
							"maxLength": 5
						},
						"y": {
							"type": "array",
							"items": { "type": "string" }
						},
						"z": {
							"type": "object",
							"properties": {
								"f": { "type": "string" },
								"u": {
									"type": "array",
									"items": { "type": "string" }
								},
								"d": {
									"type": "object",
									"properties": {
										"x": { "type": "string" },
										"arrOfObjects": {
											"type": "array",
											"items": {
												"type": "object",
												"default": { "nestedObj": {} },
												"properties": {
													"foo": { "type": "string" },
													"nestedArr": {
														"type": "array",
														"items": { "type": "string" }
													},
													"nestedObj": {
														"type": "object",
														"default": {},
														"properties": { "deepKey": { "type": "string" } }
													}
												},
												"required": ["foo"]
											}
										}
									},
									"required": ["x", "arrOfObjects"]
								}
							},
							"required": [
								"f",
								"u",
								"d"
							]
						}
					},
					"required": [
						"x",
						"y",
						"z"
					]
				} },
				"httpMethod": "GET",
				"path": "handle-nested-query"
			},
			"handleOutput": {
				"validation": {
					"query": {
						"type": "object",
						"properties": { "helloOutput": { "type": "string" } },
						"required": ["helloOutput"]
					},
					"output": {
						"type": "object",
						"properties": { "hello": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["hello"]
					}
				},
				"httpMethod": "GET",
				"path": "handle-output"
			},
			"handleStream": {
				"validation": {
					"query": {
						"type": "object",
						"properties": { "values": {
							"type": "array",
							"items": { "type": "string" }
						} },
						"required": ["values"]
					},
					"iteration": {
						"type": "object",
						"properties": { "value": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["value"]
					}
				},
				"httpMethod": "GET",
				"path": "handle-stream"
			},
			"handleSchemaConstraints": {
				"validation": { "body": {
					"type": "object",
					"default": {
						"logical_allOf": {},
						"obj_strict": {},
						"obj_required": {}
					},
					"properties": {
						"enum_value": {
							"type": "string",
							"enum": [
								"a",
								"b",
								"c"
							]
						},
						"num_minimum": {
							"type": "number",
							"minimum": 1
						},
						"num_maximum": {
							"type": "number",
							"maximum": 100
						},
						"num_exclusiveMinimum": {
							"type": "number",
							"exclusiveMinimum": 1
						},
						"num_exclusiveMaximum": {
							"type": "number",
							"exclusiveMaximum": 100
						},
						"num_multipleOf": { "type": "number" },
						"num_int": { "type": "integer" },
						"num_int32": {
							"type": "integer",
							"maximum": 2147483647,
							"minimum": -2147483648
						},
						"str_minLength": {
							"type": "string",
							"minLength": 3
						},
						"str_maxLength": {
							"type": "string",
							"maxLength": 50
						},
						"str_pattern": {
							"type": "string",
							"pattern": "^[A-Z][a-z]*$"
						},
						"str_email": {
							"type": "string",
							"format": "email"
						},
						"str_url": {
							"type": "string",
							"format": "uri"
						},
						"str_uuid": {
							"type": "string",
							"pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
						},
						"str_datetime": { "type": "string" },
						"arr_minItems": {
							"type": "array",
							"items": { "type": "string" },
							"minItems": 1
						},
						"arr_maxItems": {
							"type": "array",
							"items": { "type": "string" },
							"maxItems": 10
						},
						"obj_required": {
							"type": "object",
							"default": {},
							"properties": {
								"requiredField": { "type": "string" },
								"optionalField": { "type": "number" }
							},
							"required": ["requiredField"]
						},
						"obj_strict": {
							"type": "object",
							"default": {},
							"properties": { "knownField": { "type": "string" } }
						},
						"logical_anyOf": {
							"type": "string",
							"maxLength": 5
						},
						"logical_allOf": {
							"type": "object",
							"properties": {
								"a": { "type": "string" },
								"b": { "type": "number" }
							},
							"required": ["a", "b"]
						}
					}
				} },
				"httpMethod": "POST",
				"path": "handle-schema-constraints"
			},
			"handleNothitng": {
				"validation": {},
				"httpMethod": "POST",
				"path": "handle-nothitng"
			},
			"handleFormData": {
				"validation": {
					"body": {
						"type": "object",
						"properties": { "hello": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["hello"],
						"x-isForm": true
					},
					"query": {
						"type": "object",
						"properties": { "search": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["search"]
					}
				},
				"httpMethod": "POST",
				"path": "handle-form-data"
			},
			"disableServerSideValidationBool": {
				"validation": {
					"body": {
						"type": "object",
						"properties": { "hello": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["hello"]
					},
					"query": {
						"type": "object",
						"properties": { "search": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["search"]
					}
				},
				"httpMethod": "POST",
				"path": "disable-server-side-validation-bool"
			},
			"disableServerSideValidationStrings": {
				"validation": {
					"body": {
						"type": "object",
						"properties": { "hello": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["hello"]
					},
					"query": {
						"type": "object",
						"properties": { "search": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["search"]
					}
				},
				"httpMethod": "POST",
				"path": "disable-server-side-validation-strings"
			},
			"skipSchemaEmissionBool": {
				"validation": {},
				"httpMethod": "POST",
				"path": "skip-schema-emission-bool"
			},
			"skipSchemaEmissionStrings": {
				"validation": { "query": {
					"type": "object",
					"properties": { "search": {
						"type": "string",
						"maxLength": 5
					} },
					"required": ["search"]
				} },
				"httpMethod": "POST",
				"path": "skip-schema-emission-strings"
			},
			"validateEachIteration": {
				"validation": {
					"query": {
						"type": "object",
						"properties": { "values": {
							"type": "array",
							"items": { "type": "string" }
						} },
						"required": ["values"]
					},
					"iteration": {
						"type": "object",
						"properties": { "value": {
							"type": "string",
							"maxLength": 5
						} },
						"required": ["value"]
					}
				},
				"httpMethod": "POST",
				"path": "validate-each-iteration"
			}
		}
	},
	"WithDtoClientControllerRPC": {
		"rpcModuleName": "WithDtoClientControllerRPC",
		"originalControllerName": "WithDtoClientController",
		"prefix": "with-dto",
		"handlers": {
			"handleAll": {
				"validation": {
					"body": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "hello": {
							"maxLength": 5,
							"type": "string"
						} },
						"type": "object",
						"required": ["hello"]
					},
					"query": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "search": {
							"maxLength": 5,
							"type": "string"
						} },
						"type": "object",
						"required": ["search"]
					},
					"params": {
						"x-isDto": true,
						"definitions": {},
						"properties": {
							"foo": {
								"maxLength": 5,
								"type": "string"
							},
							"bar": {
								"maxLength": 5,
								"type": "string"
							}
						},
						"type": "object",
						"required": ["foo", "bar"]
					},
					"output": {
						"x-isDto": true,
						"definitions": {
							"HandleAllBodyDto": {
								"properties": { "hello": {
									"maxLength": 5,
									"type": "string"
								} },
								"type": "object",
								"required": ["hello"]
							},
							"HandleAllQueryDto": {
								"properties": { "search": {
									"maxLength": 5,
									"type": "string"
								} },
								"type": "object",
								"required": ["search"]
							},
							"HandleAllParamsDto": {
								"properties": {
									"foo": {
										"maxLength": 5,
										"type": "string"
									},
									"bar": {
										"maxLength": 5,
										"type": "string"
									}
								},
								"type": "object",
								"required": ["foo", "bar"]
							}
						},
						"properties": {
							"body": { "$ref": "#/definitions/HandleAllBodyDto" },
							"query": { "$ref": "#/definitions/HandleAllQueryDto" },
							"params": { "$ref": "#/definitions/HandleAllParamsDto" },
							"vovkParams": { "$ref": "#/definitions/HandleAllParamsDto" }
						},
						"type": "object",
						"required": [
							"body",
							"query",
							"params",
							"vovkParams"
						]
					}
				},
				"path": "all/{foo}/{bar}",
				"httpMethod": "POST",
				"openapi": {
					"responses": { "400": {
						"description": "400 Bad Request",
						"content": { "application/json": { "schema": { "allOf": [{ "$ref": "#/components/schemas/VovkErrorResponse" }, {
							"type": "object",
							"properties": {
								"message": {
									"type": "string",
									"enum": ["This is a bad request"]
								},
								"statusCode": {
									"type": "integer",
									"enum": [400]
								}
							}
						}] } } }
					} },
					"summary": "This is a summary",
					"description": "This is a description"
				}
			},
			"handleNestedQuery": {
				"validation": { "query": {
					"x-isDto": true,
					"definitions": {
						"ZDto": {
							"properties": {
								"f": { "type": "string" },
								"u": {
									"items": { "type": "string" },
									"type": "array"
								},
								"d": { "$ref": "#/definitions/DDto" }
							},
							"type": "object",
							"required": [
								"f",
								"u",
								"d"
							]
						},
						"DDto": {
							"properties": { "x": { "type": "string" } },
							"type": "object",
							"required": ["x"]
						}
					},
					"properties": {
						"x": {
							"type": "string",
							"maxLength": 5
						},
						"y": {
							"items": { "type": "string" },
							"type": "array"
						},
						"z": { "$ref": "#/definitions/ZDto" }
					},
					"type": "object",
					"required": [
						"x",
						"y",
						"z"
					]
				} },
				"httpMethod": "GET",
				"path": "handle-nested-query"
			},
			"handleNestedQueryClient": {
				"httpMethod": "GET",
				"path": "handle-nested-query-client"
			},
			"handleOutput": {
				"validation": {
					"query": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "helloOutput": { "type": "string" } },
						"type": "object",
						"required": ["helloOutput"]
					},
					"output": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "hello": {
							"maxLength": 5,
							"type": "string"
						} },
						"type": "object",
						"required": ["hello"]
					}
				},
				"httpMethod": "GET",
				"path": "handle-output"
			},
			"handleOutputClient": {
				"httpMethod": "GET",
				"path": "handle-output-client"
			},
			"handleStream": {
				"validation": {
					"query": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "values": {
							"items": { "type": "string" },
							"type": "array"
						} },
						"type": "object",
						"required": ["values"]
					},
					"iteration": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "value": {
							"type": "string",
							"enum": [
								"a",
								"b",
								"c",
								"d"
							]
						} },
						"type": "object",
						"required": ["value"]
					}
				},
				"httpMethod": "GET",
				"path": "handle-stream"
			},
			"handleSchemaConstraints": {
				"validation": { "body": {
					"x-isDto": true,
					"definitions": {
						"RequiredObject": {
							"properties": {
								"requiredField": {
									"type": "string",
									"not": { "type": "null" }
								},
								"optionalField": { "type": "number" }
							},
							"type": "object",
							"required": ["requiredField"]
						},
						"StrictObject": {
							"properties": { "knownField": { "type": "string" } },
							"type": "object",
							"required": ["knownField"]
						}
					},
					"properties": {
						"enum_value": {
							"type": "string",
							"enum": [
								"a",
								"b",
								"c"
							]
						},
						"num_minimum": {
							"minimum": 1,
							"type": "number"
						},
						"num_maximum": {
							"maximum": 100,
							"type": "number"
						},
						"num_exclusiveMinimum": { "type": "number" },
						"num_exclusiveMaximum": { "type": "number" },
						"num_multipleOf": { "type": "number" },
						"num_int": { "type": "integer" },
						"num_int32": {
							"minimum": -2147483648,
							"type": "integer",
							"maximum": 2147483647
						},
						"str_minLength": {
							"minLength": 3,
							"type": "string"
						},
						"str_maxLength": {
							"maxLength": 50,
							"type": "string"
						},
						"str_pattern": {
							"pattern": "^[A-Z][a-z]*$",
							"type": "string"
						},
						"str_email": {
							"format": "email",
							"type": "string"
						},
						"str_url": {
							"format": "uri",
							"type": "string"
						},
						"str_uuid": {
							"format": "uuid",
							"type": "string"
						},
						"str_datetime": { "oneOf": [{
							"format": "date",
							"type": "string"
						}, {
							"format": "date-time",
							"type": "string"
						}] },
						"arr_minItems": {
							"items": { "type": "string" },
							"type": "array",
							"maxItems": 10,
							"minItems": 1
						},
						"arr_maxItems": {
							"items": { "type": "string" },
							"type": "array",
							"maxItems": 10,
							"minItems": 1
						},
						"obj_required": { "$ref": "#/definitions/RequiredObject" },
						"obj_strict": { "$ref": "#/definitions/StrictObject" },
						"logical_allOf": { "type": "object" }
					},
					"type": "object",
					"required": [
						"enum_value",
						"num_minimum",
						"num_maximum",
						"num_exclusiveMinimum",
						"num_exclusiveMaximum",
						"num_multipleOf",
						"num_int",
						"num_int32",
						"str_minLength",
						"str_maxLength",
						"str_pattern",
						"str_email",
						"str_url",
						"str_uuid",
						"str_datetime",
						"arr_minItems",
						"arr_maxItems",
						"obj_required",
						"obj_strict",
						"logical_allOf"
					]
				} },
				"httpMethod": "POST",
				"path": "handle-schema-constraints"
			},
			"handleNothitng": {
				"validation": {},
				"httpMethod": "POST",
				"path": "handle-nothitng"
			},
			"handleFormData": {
				"validation": {
					"body": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "hello": {
							"maxLength": 5,
							"type": "string"
						} },
						"type": "object",
						"required": ["hello"],
						"x-isForm": true
					},
					"query": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "search": {
							"maxLength": 5,
							"type": "string"
						} },
						"type": "object",
						"required": ["search"]
					}
				},
				"httpMethod": "POST",
				"path": "handle-form-data"
			},
			"handleFormDataClient": {
				"httpMethod": "POST",
				"path": "handle-form-data-client"
			},
			"disableServerSideValidationBool": {
				"validation": {
					"body": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "hello": {
							"maxLength": 5,
							"type": "string"
						} },
						"type": "object",
						"required": ["hello"]
					},
					"query": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "search": {
							"maxLength": 5,
							"type": "string"
						} },
						"type": "object",
						"required": ["search"]
					}
				},
				"httpMethod": "POST",
				"path": "disable-server-side-validation-bool"
			},
			"disableServerSideValidationStrings": {
				"validation": {
					"body": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "hello": {
							"maxLength": 5,
							"type": "string"
						} },
						"type": "object",
						"required": ["hello"]
					},
					"query": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "search": {
							"maxLength": 5,
							"type": "string"
						} },
						"type": "object",
						"required": ["search"]
					}
				},
				"httpMethod": "POST",
				"path": "disable-server-side-validation-strings"
			},
			"skipSchemaEmissionBool": {
				"validation": {},
				"httpMethod": "POST",
				"path": "skip-schema-emission-bool"
			},
			"skipSchemaEmissionStrings": {
				"validation": { "query": {
					"x-isDto": true,
					"definitions": {},
					"properties": { "search": {
						"maxLength": 5,
						"type": "string"
					} },
					"type": "object",
					"required": ["search"]
				} },
				"httpMethod": "POST",
				"path": "skip-schema-emission-strings"
			},
			"validateEachIteration": {
				"validation": {
					"query": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "values": {
							"items": {},
							"type": "array"
						} },
						"type": "object",
						"required": ["values"]
					},
					"iteration": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "value": {
							"type": "string",
							"enum": [
								"a",
								"b",
								"c",
								"d"
							]
						} },
						"type": "object",
						"required": ["value"]
					}
				},
				"httpMethod": "POST",
				"path": "validate-each-iteration"
			},
			"handleAllClient": {
				"path": "all/{foo}/{bar}/client",
				"httpMethod": "POST"
			},
			"handleQuery": {
				"validation": { "query": {
					"x-isDto": true,
					"definitions": {},
					"properties": { "search": {
						"maxLength": 5,
						"type": "string"
					} },
					"type": "object",
					"required": ["search"]
				} },
				"httpMethod": "GET",
				"path": "handle-query"
			},
			"handleQueryClient": {
				"httpMethod": "GET",
				"path": "handle-query-client"
			},
			"handleBody": {
				"validation": { "body": {
					"x-isDto": true,
					"definitions": {},
					"properties": { "hello": {
						"maxLength": 5,
						"type": "string"
					} },
					"type": "object",
					"required": ["hello"]
				} },
				"httpMethod": "POST",
				"path": "handle-body"
			},
			"handleBodyClient": {
				"httpMethod": "POST",
				"path": "handle-body-client"
			},
			"handleParams": {
				"validation": { "params": {
					"x-isDto": true,
					"definitions": {},
					"properties": {
						"foo": {
							"maxLength": 5,
							"type": "string"
						},
						"bar": {
							"maxLength": 5,
							"type": "string"
						}
					},
					"type": "object",
					"required": ["foo", "bar"]
				} },
				"path": "x/{foo}/{bar}/y",
				"httpMethod": "PUT"
			},
			"handleParamsClient": {
				"path": "x/{foo}/{bar}/y/client",
				"httpMethod": "PUT"
			}
		}
	},
	"OpenApiControllerRPC": {
		"rpcModuleName": "OpenApiControllerRPC",
		"originalControllerName": "OpenApiController",
		"prefix": "openapi",
		"handlers": { "getFromSchema": {
			"openapi": {
				"responses": { "418": {
					"description": "418 I am a teapot",
					"content": { "application/json": { "schema": { "allOf": [{ "$ref": "#/components/schemas/VovkErrorResponse" }, {
						"type": "object",
						"properties": {
							"message": {
								"type": "string",
								"enum": ["I am a teapot error"]
							},
							"statusCode": {
								"type": "integer",
								"enum": [418]
							}
						}
					}] } } }
				} },
				"summary": "Hello, World!"
			},
			"path": "",
			"httpMethod": "GET"
		} }
	}
};
var client_default = {
	$schema: $schema$1,
	emitSchema: emitSchema$1,
	segmentName: segmentName$1,
	segmentType: segmentType$1,
	controllers: controllers$1
};

//#endregion
//#region .vovk-schema/generated.json
var $schema = "https://vovk.dev/api/schema/v3/segment.json";
var emitSchema = true;
var segmentName = "generated";
var segmentType = "segment";
var controllers = {
	"NoValidationControllerOnlyEntityRPC": {
		"rpcModuleName": "NoValidationControllerOnlyEntityRPC",
		"originalControllerName": "NoValidationControllerOnlyEntityController",
		"prefix": "no-validation-controller-only-entities",
		"handlers": {
			"getNoValidationControllerOnlyEntities": {
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get NoValidationControllerOnlyEntities" }
			},
			"updateNoValidationControllerOnlyEntity": {
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update NoValidationControllerOnlyEntity" }
			},
			"createNoValidationControllerOnlyEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteNoValidationControllerOnlyEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"NoValidationControllerAndServiceEntityRPC": {
		"rpcModuleName": "NoValidationControllerAndServiceEntityRPC",
		"originalControllerName": "NoValidationControllerAndServiceEntityController",
		"prefix": "no-validation-controller-and-service-entities",
		"handlers": {
			"getNoValidationControllerAndServiceEntities": {
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get NoValidationControllerAndServiceEntities" }
			},
			"updateNoValidationControllerAndServiceEntity": {
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update NoValidationControllerAndServiceEntity" }
			},
			"createNoValidationControllerAndServiceEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteNoValidationControllerAndServiceEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"ZodControllerOnlyEntityRPC": {
		"rpcModuleName": "ZodControllerOnlyEntityRPC",
		"originalControllerName": "ZodControllerOnlyEntityController",
		"prefix": "zod-controller-only-entities",
		"handlers": {
			"getZodControllerOnlyEntities": {
				"validation": { "query": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": { "search": { "type": "string" } },
					"required": ["search"],
					"additionalProperties": false
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get ZodControllerOnlyEntities" }
			},
			"updateZodControllerOnlyEntity": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "foo": { "anyOf": [{
							"type": "string",
							"const": "bar"
						}, {
							"type": "string",
							"const": "baz"
						}] } },
						"required": ["foo"],
						"additionalProperties": false
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "q": { "type": "string" } },
						"required": ["q"],
						"additionalProperties": false
					},
					"params": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "id": { "type": "string" } },
						"required": ["id"],
						"additionalProperties": false
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update ZodControllerOnlyEntity" }
			},
			"createZodControllerOnlyEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteZodControllerOnlyEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"ZodControllerAndServiceEntityRPC": {
		"rpcModuleName": "ZodControllerAndServiceEntityRPC",
		"originalControllerName": "ZodControllerAndServiceEntityController",
		"prefix": "zod-controller-and-service-entities",
		"handlers": {
			"getZodControllerAndServiceEntities": {
				"validation": { "query": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": { "search": { "type": "string" } },
					"required": ["search"],
					"additionalProperties": false
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get ZodControllerAndServiceEntities" }
			},
			"updateZodControllerAndServiceEntity": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "foo": { "anyOf": [{
							"type": "string",
							"const": "bar"
						}, {
							"type": "string",
							"const": "baz"
						}] } },
						"required": ["foo"],
						"additionalProperties": false
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "q": { "type": "string" } },
						"required": ["q"],
						"additionalProperties": false
					},
					"params": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "id": { "type": "string" } },
						"required": ["id"],
						"additionalProperties": false
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update ZodControllerAndServiceEntity" }
			},
			"createZodControllerAndServiceEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteZodControllerAndServiceEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"YupControllerOnlyEntityRPC": {
		"rpcModuleName": "YupControllerOnlyEntityRPC",
		"originalControllerName": "YupControllerOnlyEntityController",
		"prefix": "yup-controller-only-entities",
		"handlers": {
			"getYupControllerOnlyEntities": {
				"validation": { "query": {
					"type": "object",
					"default": {},
					"properties": { "search": { "type": "string" } }
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get YupControllerOnlyEntities" }
			},
			"updateYupControllerOnlyEntity": {
				"validation": {
					"body": {
						"type": "object",
						"properties": { "foo": {
							"type": ["string"],
							"enum": ["bar", "baz"]
						} },
						"required": ["foo"]
					},
					"query": {
						"type": "object",
						"default": {},
						"properties": { "q": { "type": "string" } }
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update YupControllerOnlyEntity" }
			},
			"createYupControllerOnlyEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteYupControllerOnlyEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"YupControllerAndServiceEntityRPC": {
		"rpcModuleName": "YupControllerAndServiceEntityRPC",
		"originalControllerName": "YupControllerAndServiceEntityController",
		"prefix": "yup-controller-and-service-entities",
		"handlers": {
			"getYupControllerAndServiceEntities": {
				"validation": { "query": {
					"type": "object",
					"default": {},
					"properties": { "search": { "type": "string" } }
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get YupControllerAndServiceEntities" }
			},
			"updateYupControllerAndServiceEntity": {
				"validation": {
					"body": {
						"type": "object",
						"properties": { "foo": {
							"type": ["string"],
							"enum": ["bar", "baz"]
						} },
						"required": ["foo"]
					},
					"query": {
						"type": "object",
						"default": {},
						"properties": { "q": { "type": "string" } }
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update YupControllerAndServiceEntity" }
			},
			"createYupControllerAndServiceEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteYupControllerAndServiceEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"DtoControllerOnlyEntityRPC": {
		"rpcModuleName": "DtoControllerOnlyEntityRPC",
		"originalControllerName": "DtoControllerOnlyEntityController",
		"prefix": "dto-controller-only-entities",
		"handlers": {
			"getDtoControllerOnlyEntities": {
				"validation": { "query": {
					"x-isDto": true,
					"definitions": {},
					"properties": { "search": { "type": "string" } },
					"type": "object",
					"required": ["search"]
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get DtoControllerOnlyEntities" }
			},
			"updateDtoControllerOnlyEntity": {
				"validation": {
					"body": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "foo": {
							"type": "string",
							"enum": ["bar", "baz"]
						} },
						"type": "object",
						"required": ["foo"]
					},
					"query": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "q": { "type": "string" } },
						"type": "object",
						"required": ["q"]
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update DtoControllerOnlyEntity" }
			},
			"createDtoControllerOnlyEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteDtoControllerOnlyEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"DtoControllerAndServiceEntityRPC": {
		"rpcModuleName": "DtoControllerAndServiceEntityRPC",
		"originalControllerName": "DtoControllerAndServiceEntityController",
		"prefix": "dto-controller-and-service-entities",
		"handlers": {
			"getDtoControllerAndServiceEntities": {
				"validation": { "query": {
					"x-isDto": true,
					"definitions": {},
					"properties": { "search": { "type": "string" } },
					"type": "object",
					"required": ["search"]
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get DtoControllerAndServiceEntities" }
			},
			"updateDtoControllerAndServiceEntity": {
				"validation": {
					"body": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "foo": {
							"type": "string",
							"enum": ["bar", "baz"]
						} },
						"type": "object",
						"required": ["foo"]
					},
					"query": {
						"x-isDto": true,
						"definitions": {},
						"properties": { "q": { "type": "string" } },
						"type": "object",
						"required": ["q"]
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update DtoControllerAndServiceEntity" }
			},
			"createDtoControllerAndServiceEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteDtoControllerAndServiceEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"ValibotControllerOnlyEntityRPC": {
		"rpcModuleName": "ValibotControllerOnlyEntityRPC",
		"originalControllerName": "ValibotControllerOnlyEntityController",
		"prefix": "valibot-controller-only-entities",
		"handlers": {
			"getValibotControllerOnlyEntities": {
				"validation": { "query": {
					"$schema": "http://json-schema.org/draft-07/schema#",
					"type": "object",
					"properties": { "search": { "type": "string" } },
					"required": ["search"]
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get ValibotControllerOnlyEntities" }
			},
			"updateValibotControllerOnlyEntity": {
				"validation": {
					"body": {
						"$schema": "http://json-schema.org/draft-07/schema#",
						"type": "object",
						"properties": { "foo": { "anyOf": [{ "const": "bar" }, { "const": "baz" }] } },
						"required": ["foo"]
					},
					"query": {
						"$schema": "http://json-schema.org/draft-07/schema#",
						"type": "object",
						"properties": { "q": { "type": "string" } },
						"required": ["q"]
					},
					"params": {
						"$schema": "http://json-schema.org/draft-07/schema#",
						"type": "object",
						"properties": { "id": { "type": "string" } },
						"required": ["id"]
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update ValibotControllerOnlyEntity" }
			},
			"createValibotControllerOnlyEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteValibotControllerOnlyEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"ValibotControllerAndServiceEntityRPC": {
		"rpcModuleName": "ValibotControllerAndServiceEntityRPC",
		"originalControllerName": "ValibotControllerAndServiceEntityController",
		"prefix": "valibot-controller-and-service-entities",
		"handlers": {
			"getValibotControllerAndServiceEntities": {
				"validation": { "query": {
					"$schema": "http://json-schema.org/draft-07/schema#",
					"type": "object",
					"properties": { "search": { "type": "string" } },
					"required": ["search"]
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get ValibotControllerAndServiceEntities" }
			},
			"updateValibotControllerAndServiceEntity": {
				"validation": {
					"body": {
						"$schema": "http://json-schema.org/draft-07/schema#",
						"type": "object",
						"properties": { "foo": { "anyOf": [{ "const": "bar" }, { "const": "baz" }] } },
						"required": ["foo"]
					},
					"query": {
						"$schema": "http://json-schema.org/draft-07/schema#",
						"type": "object",
						"properties": { "q": { "type": "string" } },
						"required": ["q"]
					},
					"params": {
						"$schema": "http://json-schema.org/draft-07/schema#",
						"type": "object",
						"properties": { "id": { "type": "string" } },
						"required": ["id"]
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update ValibotControllerAndServiceEntity" }
			},
			"createValibotControllerAndServiceEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteValibotControllerAndServiceEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"ArktypeControllerOnlyEntityRPC": {
		"rpcModuleName": "ArktypeControllerOnlyEntityRPC",
		"originalControllerName": "ArktypeControllerOnlyEntityController",
		"prefix": "arktype-controller-only-entities",
		"handlers": {
			"getArktypeControllerOnlyEntities": {
				"validation": { "query": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": { "search": { "type": "string" } },
					"required": ["search"]
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get ArktypeControllerOnlyEntities" }
			},
			"updateArktypeControllerOnlyEntity": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "foo": { "enum": ["bar", "baz"] } },
						"required": ["foo"]
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "q": { "type": "string" } },
						"required": ["q"]
					},
					"params": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "id": { "type": "string" } },
						"required": ["id"]
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update ArktypeControllerOnlyEntity" }
			},
			"createArktypeControllerOnlyEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteArktypeControllerOnlyEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	},
	"ArktypeControllerAndServiceEntityRPC": {
		"rpcModuleName": "ArktypeControllerAndServiceEntityRPC",
		"originalControllerName": "ArktypeControllerAndServiceEntityController",
		"prefix": "arktype-controller-and-service-entities",
		"handlers": {
			"getArktypeControllerAndServiceEntities": {
				"validation": { "query": {
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type": "object",
					"properties": { "search": { "type": "string" } },
					"required": ["search"]
				} },
				"path": "",
				"httpMethod": "GET",
				"openapi": { "summary": "Get ArktypeControllerAndServiceEntities" }
			},
			"updateArktypeControllerAndServiceEntity": {
				"validation": {
					"body": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "foo": { "enum": ["bar", "baz"] } },
						"required": ["foo"]
					},
					"query": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "q": { "type": "string" } },
						"required": ["q"]
					},
					"params": {
						"$schema": "https://json-schema.org/draft/2020-12/schema",
						"type": "object",
						"properties": { "id": { "type": "string" } },
						"required": ["id"]
					}
				},
				"path": "{id}",
				"httpMethod": "PUT",
				"openapi": { "summary": "Update ArktypeControllerAndServiceEntity" }
			},
			"createArktypeControllerAndServiceEntity": {
				"path": "",
				"httpMethod": "POST"
			},
			"deleteArktypeControllerAndServiceEntity": {
				"path": ":id",
				"httpMethod": "DELETE"
			}
		}
	}
};
var generated_default = {
	$schema,
	emitSchema,
	segmentName,
	segmentType,
	controllers
};

//#endregion
//#region tmp_prebundle/schema.ts
const segments = {
	"foo/client": client_default,
	"generated": generated_default
};
const schema = {
	$schema: "https://vovk.dev/api/schema/v3/schema.json",
	segments,
	meta: {
		$schema: "https://vovk.dev/api/schema/v3/meta.json",
		apiRoot: "http://localhost:3210/api",
		..._meta_default
	}
};

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/codegen/code.js
var require_code$3 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/codegen/code.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
	var _CodeOrName$1 = class {};
	exports._CodeOrName = _CodeOrName$1;
	exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
	var Name$1 = class extends _CodeOrName$1 {
		constructor(s) {
			super();
			if (!exports.IDENTIFIER.test(s)) throw new Error("CodeGen: name must be a valid identifier");
			this.str = s;
		}
		toString() {
			return this.str;
		}
		emptyStr() {
			return false;
		}
		get names() {
			return { [this.str]: 1 };
		}
	};
	exports.Name = Name$1;
	var _Code$1 = class extends _CodeOrName$1 {
		constructor(code) {
			super();
			this._items = typeof code === "string" ? [code] : code;
		}
		toString() {
			return this.str;
		}
		emptyStr() {
			if (this._items.length > 1) return false;
			const item = this._items[0];
			return item === "" || item === "\"\"";
		}
		get str() {
			var _a$4;
			return (_a$4 = this._str) !== null && _a$4 !== void 0 ? _a$4 : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
		}
		get names() {
			var _a$4;
			return (_a$4 = this._names) !== null && _a$4 !== void 0 ? _a$4 : this._names = this._items.reduce((names$2, c) => {
				if (c instanceof Name$1) names$2[c.str] = (names$2[c.str] || 0) + 1;
				return names$2;
			}, {});
		}
	};
	exports._Code = _Code$1;
	exports.nil = new _Code$1("");
	function _$1(strs, ...args) {
		const code = [strs[0]];
		let i = 0;
		while (i < args.length) {
			addCodeArg$1(code, args[i]);
			code.push(strs[++i]);
		}
		return new _Code$1(code);
	}
	exports._ = _$1;
	const plus$1 = new _Code$1("+");
	function str$1(strs, ...args) {
		const expr = [safeStringify$1(strs[0])];
		let i = 0;
		while (i < args.length) {
			expr.push(plus$1);
			addCodeArg$1(expr, args[i]);
			expr.push(plus$1, safeStringify$1(strs[++i]));
		}
		optimize$1(expr);
		return new _Code$1(expr);
	}
	exports.str = str$1;
	function addCodeArg$1(code, arg) {
		if (arg instanceof _Code$1) code.push(...arg._items);
		else if (arg instanceof Name$1) code.push(arg);
		else code.push(interpolate$1(arg));
	}
	exports.addCodeArg = addCodeArg$1;
	function optimize$1(expr) {
		let i = 1;
		while (i < expr.length - 1) {
			if (expr[i] === plus$1) {
				const res = mergeExprItems$1(expr[i - 1], expr[i + 1]);
				if (res !== void 0) {
					expr.splice(i - 1, 3, res);
					continue;
				}
				expr[i++] = "+";
			}
			i++;
		}
	}
	function mergeExprItems$1(a, b) {
		if (b === "\"\"") return a;
		if (a === "\"\"") return b;
		if (typeof a == "string") {
			if (b instanceof Name$1 || a[a.length - 1] !== "\"") return;
			if (typeof b != "string") return `${a.slice(0, -1)}${b}"`;
			if (b[0] === "\"") return a.slice(0, -1) + b.slice(1);
			return;
		}
		if (typeof b == "string" && b[0] === "\"" && !(a instanceof Name$1)) return `"${a}${b.slice(1)}`;
		return;
	}
	function strConcat$1(c1, c2) {
		return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str$1`${c1}${c2}`;
	}
	exports.strConcat = strConcat$1;
	function interpolate$1(x) {
		return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify$1(Array.isArray(x) ? x.join(",") : x);
	}
	function stringify$1(x) {
		return new _Code$1(safeStringify$1(x));
	}
	exports.stringify = stringify$1;
	function safeStringify$1(x) {
		return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
	}
	exports.safeStringify = safeStringify$1;
	function getProperty$1(key) {
		return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code$1(`.${key}`) : _$1`[${key}]`;
	}
	exports.getProperty = getProperty$1;
	function getEsmExportName$1(key) {
		if (typeof key == "string" && exports.IDENTIFIER.test(key)) return new _Code$1(`${key}`);
		throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
	}
	exports.getEsmExportName = getEsmExportName$1;
	function regexpCode$1(rx) {
		return new _Code$1(rx.toString());
	}
	exports.regexpCode = regexpCode$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/codegen/scope.js
var require_scope$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/codegen/scope.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
	const code_1$28 = require_code$3();
	var ValueError$1 = class extends Error {
		constructor(name) {
			super(`CodeGen: "code" for ${name} not defined`);
			this.value = name.value;
		}
	};
	var UsedValueState$1;
	(function(UsedValueState$2) {
		UsedValueState$2[UsedValueState$2["Started"] = 0] = "Started";
		UsedValueState$2[UsedValueState$2["Completed"] = 1] = "Completed";
	})(UsedValueState$1 || (exports.UsedValueState = UsedValueState$1 = {}));
	exports.varKinds = {
		const: new code_1$28.Name("const"),
		let: new code_1$28.Name("let"),
		var: new code_1$28.Name("var")
	};
	var Scope$1 = class {
		constructor({ prefixes, parent } = {}) {
			this._names = {};
			this._prefixes = prefixes;
			this._parent = parent;
		}
		toName(nameOrPrefix) {
			return nameOrPrefix instanceof code_1$28.Name ? nameOrPrefix : this.name(nameOrPrefix);
		}
		name(prefix) {
			return new code_1$28.Name(this._newName(prefix));
		}
		_newName(prefix) {
			const ng = this._names[prefix] || this._nameGroup(prefix);
			return `${prefix}${ng.index++}`;
		}
		_nameGroup(prefix) {
			var _a$4, _b;
			if (((_b = (_a$4 = this._parent) === null || _a$4 === void 0 ? void 0 : _a$4._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
			return this._names[prefix] = {
				prefix,
				index: 0
			};
		}
	};
	exports.Scope = Scope$1;
	var ValueScopeName$1 = class extends code_1$28.Name {
		constructor(prefix, nameStr) {
			super(nameStr);
			this.prefix = prefix;
		}
		setValue(value, { property, itemIndex }) {
			this.value = value;
			this.scopePath = (0, code_1$28._)`.${new code_1$28.Name(property)}[${itemIndex}]`;
		}
	};
	exports.ValueScopeName = ValueScopeName$1;
	const line$1 = (0, code_1$28._)`\n`;
	var ValueScope$1 = class extends Scope$1 {
		constructor(opts) {
			super(opts);
			this._values = {};
			this._scope = opts.scope;
			this.opts = {
				...opts,
				_n: opts.lines ? line$1 : code_1$28.nil
			};
		}
		get() {
			return this._scope;
		}
		name(prefix) {
			return new ValueScopeName$1(prefix, this._newName(prefix));
		}
		value(nameOrPrefix, value) {
			var _a$4;
			if (value.ref === void 0) throw new Error("CodeGen: ref must be passed in value");
			const name = this.toName(nameOrPrefix);
			const { prefix } = name;
			const valueKey = (_a$4 = value.key) !== null && _a$4 !== void 0 ? _a$4 : value.ref;
			let vs = this._values[prefix];
			if (vs) {
				const _name = vs.get(valueKey);
				if (_name) return _name;
			} else vs = this._values[prefix] = /* @__PURE__ */ new Map();
			vs.set(valueKey, name);
			const s = this._scope[prefix] || (this._scope[prefix] = []);
			const itemIndex = s.length;
			s[itemIndex] = value.ref;
			name.setValue(value, {
				property: prefix,
				itemIndex
			});
			return name;
		}
		getValue(prefix, keyOrRef) {
			const vs = this._values[prefix];
			if (!vs) return;
			return vs.get(keyOrRef);
		}
		scopeRefs(scopeName, values = this._values) {
			return this._reduceValues(values, (name) => {
				if (name.scopePath === void 0) throw new Error(`CodeGen: name "${name}" has no value`);
				return (0, code_1$28._)`${scopeName}${name.scopePath}`;
			});
		}
		scopeCode(values = this._values, usedValues, getCode) {
			return this._reduceValues(values, (name) => {
				if (name.value === void 0) throw new Error(`CodeGen: name "${name}" has no value`);
				return name.value.code;
			}, usedValues, getCode);
		}
		_reduceValues(values, valueCode, usedValues = {}, getCode) {
			let code = code_1$28.nil;
			for (const prefix in values) {
				const vs = values[prefix];
				if (!vs) continue;
				const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
				vs.forEach((name) => {
					if (nameSet.has(name)) return;
					nameSet.set(name, UsedValueState$1.Started);
					let c = valueCode(name);
					if (c) {
						const def$69 = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
						code = (0, code_1$28._)`${code}${def$69} ${name} = ${c};${this.opts._n}`;
					} else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) code = (0, code_1$28._)`${code}${c}${this.opts._n}`;
					else throw new ValueError$1(name);
					nameSet.set(name, UsedValueState$1.Completed);
				});
			}
			return code;
		}
	};
	exports.ValueScope = ValueScope$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/codegen/index.js
var require_codegen$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/codegen/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
	const code_1$27 = require_code$3();
	const scope_1$1 = require_scope$1();
	var code_2$1 = require_code$3();
	Object.defineProperty(exports, "_", {
		enumerable: true,
		get: function() {
			return code_2$1._;
		}
	});
	Object.defineProperty(exports, "str", {
		enumerable: true,
		get: function() {
			return code_2$1.str;
		}
	});
	Object.defineProperty(exports, "strConcat", {
		enumerable: true,
		get: function() {
			return code_2$1.strConcat;
		}
	});
	Object.defineProperty(exports, "nil", {
		enumerable: true,
		get: function() {
			return code_2$1.nil;
		}
	});
	Object.defineProperty(exports, "getProperty", {
		enumerable: true,
		get: function() {
			return code_2$1.getProperty;
		}
	});
	Object.defineProperty(exports, "stringify", {
		enumerable: true,
		get: function() {
			return code_2$1.stringify;
		}
	});
	Object.defineProperty(exports, "regexpCode", {
		enumerable: true,
		get: function() {
			return code_2$1.regexpCode;
		}
	});
	Object.defineProperty(exports, "Name", {
		enumerable: true,
		get: function() {
			return code_2$1.Name;
		}
	});
	var scope_2$1 = require_scope$1();
	Object.defineProperty(exports, "Scope", {
		enumerable: true,
		get: function() {
			return scope_2$1.Scope;
		}
	});
	Object.defineProperty(exports, "ValueScope", {
		enumerable: true,
		get: function() {
			return scope_2$1.ValueScope;
		}
	});
	Object.defineProperty(exports, "ValueScopeName", {
		enumerable: true,
		get: function() {
			return scope_2$1.ValueScopeName;
		}
	});
	Object.defineProperty(exports, "varKinds", {
		enumerable: true,
		get: function() {
			return scope_2$1.varKinds;
		}
	});
	exports.operators = {
		GT: new code_1$27._Code(">"),
		GTE: new code_1$27._Code(">="),
		LT: new code_1$27._Code("<"),
		LTE: new code_1$27._Code("<="),
		EQ: new code_1$27._Code("==="),
		NEQ: new code_1$27._Code("!=="),
		NOT: new code_1$27._Code("!"),
		OR: new code_1$27._Code("||"),
		AND: new code_1$27._Code("&&"),
		ADD: new code_1$27._Code("+")
	};
	var Node$1 = class {
		optimizeNodes() {
			return this;
		}
		optimizeNames(_names, _constants) {
			return this;
		}
	};
	var Def$1 = class extends Node$1 {
		constructor(varKind, name, rhs) {
			super();
			this.varKind = varKind;
			this.name = name;
			this.rhs = rhs;
		}
		render({ es5, _n }) {
			const varKind = es5 ? scope_1$1.varKinds.var : this.varKind;
			const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
			return `${varKind} ${this.name}${rhs};` + _n;
		}
		optimizeNames(names$2, constants) {
			if (!names$2[this.name.str]) return;
			if (this.rhs) this.rhs = optimizeExpr$1(this.rhs, names$2, constants);
			return this;
		}
		get names() {
			return this.rhs instanceof code_1$27._CodeOrName ? this.rhs.names : {};
		}
	};
	var Assign$1 = class extends Node$1 {
		constructor(lhs, rhs, sideEffects) {
			super();
			this.lhs = lhs;
			this.rhs = rhs;
			this.sideEffects = sideEffects;
		}
		render({ _n }) {
			return `${this.lhs} = ${this.rhs};` + _n;
		}
		optimizeNames(names$2, constants) {
			if (this.lhs instanceof code_1$27.Name && !names$2[this.lhs.str] && !this.sideEffects) return;
			this.rhs = optimizeExpr$1(this.rhs, names$2, constants);
			return this;
		}
		get names() {
			const names$2 = this.lhs instanceof code_1$27.Name ? {} : { ...this.lhs.names };
			return addExprNames$1(names$2, this.rhs);
		}
	};
	var AssignOp$1 = class extends Assign$1 {
		constructor(lhs, op, rhs, sideEffects) {
			super(lhs, rhs, sideEffects);
			this.op = op;
		}
		render({ _n }) {
			return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
		}
	};
	var Label$1 = class extends Node$1 {
		constructor(label) {
			super();
			this.label = label;
			this.names = {};
		}
		render({ _n }) {
			return `${this.label}:` + _n;
		}
	};
	var Break$1 = class extends Node$1 {
		constructor(label) {
			super();
			this.label = label;
			this.names = {};
		}
		render({ _n }) {
			const label = this.label ? ` ${this.label}` : "";
			return `break${label};` + _n;
		}
	};
	var Throw$1 = class extends Node$1 {
		constructor(error$41) {
			super();
			this.error = error$41;
		}
		render({ _n }) {
			return `throw ${this.error};` + _n;
		}
		get names() {
			return this.error.names;
		}
	};
	var AnyCode$1 = class extends Node$1 {
		constructor(code) {
			super();
			this.code = code;
		}
		render({ _n }) {
			return `${this.code};` + _n;
		}
		optimizeNodes() {
			return `${this.code}` ? this : void 0;
		}
		optimizeNames(names$2, constants) {
			this.code = optimizeExpr$1(this.code, names$2, constants);
			return this;
		}
		get names() {
			return this.code instanceof code_1$27._CodeOrName ? this.code.names : {};
		}
	};
	var ParentNode$1 = class extends Node$1 {
		constructor(nodes = []) {
			super();
			this.nodes = nodes;
		}
		render(opts) {
			return this.nodes.reduce((code, n) => code + n.render(opts), "");
		}
		optimizeNodes() {
			const { nodes } = this;
			let i = nodes.length;
			while (i--) {
				const n = nodes[i].optimizeNodes();
				if (Array.isArray(n)) nodes.splice(i, 1, ...n);
				else if (n) nodes[i] = n;
				else nodes.splice(i, 1);
			}
			return nodes.length > 0 ? this : void 0;
		}
		optimizeNames(names$2, constants) {
			const { nodes } = this;
			let i = nodes.length;
			while (i--) {
				const n = nodes[i];
				if (n.optimizeNames(names$2, constants)) continue;
				subtractNames$1(names$2, n.names);
				nodes.splice(i, 1);
			}
			return nodes.length > 0 ? this : void 0;
		}
		get names() {
			return this.nodes.reduce((names$2, n) => addNames$1(names$2, n.names), {});
		}
	};
	var BlockNode$1 = class extends ParentNode$1 {
		render(opts) {
			return "{" + opts._n + super.render(opts) + "}" + opts._n;
		}
	};
	var Root$1 = class extends ParentNode$1 {};
	var Else$1 = class extends BlockNode$1 {};
	Else$1.kind = "else";
	var If$1 = class If$1 extends BlockNode$1 {
		constructor(condition, nodes) {
			super(nodes);
			this.condition = condition;
		}
		render(opts) {
			let code = `if(${this.condition})` + super.render(opts);
			if (this.else) code += "else " + this.else.render(opts);
			return code;
		}
		optimizeNodes() {
			super.optimizeNodes();
			const cond = this.condition;
			if (cond === true) return this.nodes;
			let e = this.else;
			if (e) {
				const ns = e.optimizeNodes();
				e = this.else = Array.isArray(ns) ? new Else$1(ns) : ns;
			}
			if (e) {
				if (cond === false) return e instanceof If$1 ? e : e.nodes;
				if (this.nodes.length) return this;
				return new If$1(not$1(cond), e instanceof If$1 ? [e] : e.nodes);
			}
			if (cond === false || !this.nodes.length) return void 0;
			return this;
		}
		optimizeNames(names$2, constants) {
			var _a$4;
			this.else = (_a$4 = this.else) === null || _a$4 === void 0 ? void 0 : _a$4.optimizeNames(names$2, constants);
			if (!(super.optimizeNames(names$2, constants) || this.else)) return;
			this.condition = optimizeExpr$1(this.condition, names$2, constants);
			return this;
		}
		get names() {
			const names$2 = super.names;
			addExprNames$1(names$2, this.condition);
			if (this.else) addNames$1(names$2, this.else.names);
			return names$2;
		}
	};
	If$1.kind = "if";
	var For$1 = class extends BlockNode$1 {};
	For$1.kind = "for";
	var ForLoop$1 = class extends For$1 {
		constructor(iteration) {
			super();
			this.iteration = iteration;
		}
		render(opts) {
			return `for(${this.iteration})` + super.render(opts);
		}
		optimizeNames(names$2, constants) {
			if (!super.optimizeNames(names$2, constants)) return;
			this.iteration = optimizeExpr$1(this.iteration, names$2, constants);
			return this;
		}
		get names() {
			return addNames$1(super.names, this.iteration.names);
		}
	};
	var ForRange$1 = class extends For$1 {
		constructor(varKind, name, from, to) {
			super();
			this.varKind = varKind;
			this.name = name;
			this.from = from;
			this.to = to;
		}
		render(opts) {
			const varKind = opts.es5 ? scope_1$1.varKinds.var : this.varKind;
			const { name, from, to } = this;
			return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
		}
		get names() {
			const names$2 = addExprNames$1(super.names, this.from);
			return addExprNames$1(names$2, this.to);
		}
	};
	var ForIter$1 = class extends For$1 {
		constructor(loop, varKind, name, iterable) {
			super();
			this.loop = loop;
			this.varKind = varKind;
			this.name = name;
			this.iterable = iterable;
		}
		render(opts) {
			return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
		}
		optimizeNames(names$2, constants) {
			if (!super.optimizeNames(names$2, constants)) return;
			this.iterable = optimizeExpr$1(this.iterable, names$2, constants);
			return this;
		}
		get names() {
			return addNames$1(super.names, this.iterable.names);
		}
	};
	var Func$1 = class extends BlockNode$1 {
		constructor(name, args, async) {
			super();
			this.name = name;
			this.args = args;
			this.async = async;
		}
		render(opts) {
			const _async = this.async ? "async " : "";
			return `${_async}function ${this.name}(${this.args})` + super.render(opts);
		}
	};
	Func$1.kind = "func";
	var Return$1 = class extends ParentNode$1 {
		render(opts) {
			return "return " + super.render(opts);
		}
	};
	Return$1.kind = "return";
	var Try$1 = class extends BlockNode$1 {
		render(opts) {
			let code = "try" + super.render(opts);
			if (this.catch) code += this.catch.render(opts);
			if (this.finally) code += this.finally.render(opts);
			return code;
		}
		optimizeNodes() {
			var _a$4, _b;
			super.optimizeNodes();
			(_a$4 = this.catch) === null || _a$4 === void 0 || _a$4.optimizeNodes();
			(_b = this.finally) === null || _b === void 0 || _b.optimizeNodes();
			return this;
		}
		optimizeNames(names$2, constants) {
			var _a$4, _b;
			super.optimizeNames(names$2, constants);
			(_a$4 = this.catch) === null || _a$4 === void 0 || _a$4.optimizeNames(names$2, constants);
			(_b = this.finally) === null || _b === void 0 || _b.optimizeNames(names$2, constants);
			return this;
		}
		get names() {
			const names$2 = super.names;
			if (this.catch) addNames$1(names$2, this.catch.names);
			if (this.finally) addNames$1(names$2, this.finally.names);
			return names$2;
		}
	};
	var Catch$1 = class extends BlockNode$1 {
		constructor(error$41) {
			super();
			this.error = error$41;
		}
		render(opts) {
			return `catch(${this.error})` + super.render(opts);
		}
	};
	Catch$1.kind = "catch";
	var Finally$1 = class extends BlockNode$1 {
		render(opts) {
			return "finally" + super.render(opts);
		}
	};
	Finally$1.kind = "finally";
	var CodeGen$1 = class {
		constructor(extScope, opts = {}) {
			this._values = {};
			this._blockStarts = [];
			this._constants = {};
			this.opts = {
				...opts,
				_n: opts.lines ? "\n" : ""
			};
			this._extScope = extScope;
			this._scope = new scope_1$1.Scope({ parent: extScope });
			this._nodes = [new Root$1()];
		}
		toString() {
			return this._root.render(this.opts);
		}
		name(prefix) {
			return this._scope.name(prefix);
		}
		scopeName(prefix) {
			return this._extScope.name(prefix);
		}
		scopeValue(prefixOrName, value) {
			const name = this._extScope.value(prefixOrName, value);
			const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
			vs.add(name);
			return name;
		}
		getScopeValue(prefix, keyOrRef) {
			return this._extScope.getValue(prefix, keyOrRef);
		}
		scopeRefs(scopeName) {
			return this._extScope.scopeRefs(scopeName, this._values);
		}
		scopeCode() {
			return this._extScope.scopeCode(this._values);
		}
		_def(varKind, nameOrPrefix, rhs, constant) {
			const name = this._scope.toName(nameOrPrefix);
			if (rhs !== void 0 && constant) this._constants[name.str] = rhs;
			this._leafNode(new Def$1(varKind, name, rhs));
			return name;
		}
		const(nameOrPrefix, rhs, _constant) {
			return this._def(scope_1$1.varKinds.const, nameOrPrefix, rhs, _constant);
		}
		let(nameOrPrefix, rhs, _constant) {
			return this._def(scope_1$1.varKinds.let, nameOrPrefix, rhs, _constant);
		}
		var(nameOrPrefix, rhs, _constant) {
			return this._def(scope_1$1.varKinds.var, nameOrPrefix, rhs, _constant);
		}
		assign(lhs, rhs, sideEffects) {
			return this._leafNode(new Assign$1(lhs, rhs, sideEffects));
		}
		add(lhs, rhs) {
			return this._leafNode(new AssignOp$1(lhs, exports.operators.ADD, rhs));
		}
		code(c) {
			if (typeof c == "function") c();
			else if (c !== code_1$27.nil) this._leafNode(new AnyCode$1(c));
			return this;
		}
		object(...keyValues) {
			const code = ["{"];
			for (const [key, value] of keyValues) {
				if (code.length > 1) code.push(",");
				code.push(key);
				if (key !== value || this.opts.es5) {
					code.push(":");
					(0, code_1$27.addCodeArg)(code, value);
				}
			}
			code.push("}");
			return new code_1$27._Code(code);
		}
		if(condition, thenBody, elseBody) {
			this._blockNode(new If$1(condition));
			if (thenBody && elseBody) this.code(thenBody).else().code(elseBody).endIf();
			else if (thenBody) this.code(thenBody).endIf();
			else if (elseBody) throw new Error("CodeGen: \"else\" body without \"then\" body");
			return this;
		}
		elseIf(condition) {
			return this._elseNode(new If$1(condition));
		}
		else() {
			return this._elseNode(new Else$1());
		}
		endIf() {
			return this._endBlockNode(If$1, Else$1);
		}
		_for(node, forBody) {
			this._blockNode(node);
			if (forBody) this.code(forBody).endFor();
			return this;
		}
		for(iteration, forBody) {
			return this._for(new ForLoop$1(iteration), forBody);
		}
		forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1$1.varKinds.var : scope_1$1.varKinds.let) {
			const name = this._scope.toName(nameOrPrefix);
			return this._for(new ForRange$1(varKind, name, from, to), () => forBody(name));
		}
		forOf(nameOrPrefix, iterable, forBody, varKind = scope_1$1.varKinds.const) {
			const name = this._scope.toName(nameOrPrefix);
			if (this.opts.es5) {
				const arr = iterable instanceof code_1$27.Name ? iterable : this.var("_arr", iterable);
				return this.forRange("_i", 0, (0, code_1$27._)`${arr}.length`, (i) => {
					this.var(name, (0, code_1$27._)`${arr}[${i}]`);
					forBody(name);
				});
			}
			return this._for(new ForIter$1("of", varKind, name, iterable), () => forBody(name));
		}
		forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1$1.varKinds.var : scope_1$1.varKinds.const) {
			if (this.opts.ownProperties) return this.forOf(nameOrPrefix, (0, code_1$27._)`Object.keys(${obj})`, forBody);
			const name = this._scope.toName(nameOrPrefix);
			return this._for(new ForIter$1("in", varKind, name, obj), () => forBody(name));
		}
		endFor() {
			return this._endBlockNode(For$1);
		}
		label(label) {
			return this._leafNode(new Label$1(label));
		}
		break(label) {
			return this._leafNode(new Break$1(label));
		}
		return(value) {
			const node = new Return$1();
			this._blockNode(node);
			this.code(value);
			if (node.nodes.length !== 1) throw new Error("CodeGen: \"return\" should have one node");
			return this._endBlockNode(Return$1);
		}
		try(tryBody, catchCode, finallyCode) {
			if (!catchCode && !finallyCode) throw new Error("CodeGen: \"try\" without \"catch\" and \"finally\"");
			const node = new Try$1();
			this._blockNode(node);
			this.code(tryBody);
			if (catchCode) {
				const error$41 = this.name("e");
				this._currNode = node.catch = new Catch$1(error$41);
				catchCode(error$41);
			}
			if (finallyCode) {
				this._currNode = node.finally = new Finally$1();
				this.code(finallyCode);
			}
			return this._endBlockNode(Catch$1, Finally$1);
		}
		throw(error$41) {
			return this._leafNode(new Throw$1(error$41));
		}
		block(body, nodeCount) {
			this._blockStarts.push(this._nodes.length);
			if (body) this.code(body).endBlock(nodeCount);
			return this;
		}
		endBlock(nodeCount) {
			const len = this._blockStarts.pop();
			if (len === void 0) throw new Error("CodeGen: not in self-balancing block");
			const toClose = this._nodes.length - len;
			if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
			this._nodes.length = len;
			return this;
		}
		func(name, args = code_1$27.nil, async, funcBody) {
			this._blockNode(new Func$1(name, args, async));
			if (funcBody) this.code(funcBody).endFunc();
			return this;
		}
		endFunc() {
			return this._endBlockNode(Func$1);
		}
		optimize(n = 1) {
			while (n-- > 0) {
				this._root.optimizeNodes();
				this._root.optimizeNames(this._root.names, this._constants);
			}
		}
		_leafNode(node) {
			this._currNode.nodes.push(node);
			return this;
		}
		_blockNode(node) {
			this._currNode.nodes.push(node);
			this._nodes.push(node);
		}
		_endBlockNode(N1, N2) {
			const n = this._currNode;
			if (n instanceof N1 || N2 && n instanceof N2) {
				this._nodes.pop();
				return this;
			}
			throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
		}
		_elseNode(node) {
			const n = this._currNode;
			if (!(n instanceof If$1)) throw new Error("CodeGen: \"else\" without \"if\"");
			this._currNode = n.else = node;
			return this;
		}
		get _root() {
			return this._nodes[0];
		}
		get _currNode() {
			const ns = this._nodes;
			return ns[ns.length - 1];
		}
		set _currNode(node) {
			const ns = this._nodes;
			ns[ns.length - 1] = node;
		}
	};
	exports.CodeGen = CodeGen$1;
	function addNames$1(names$2, from) {
		for (const n in from) names$2[n] = (names$2[n] || 0) + (from[n] || 0);
		return names$2;
	}
	function addExprNames$1(names$2, from) {
		return from instanceof code_1$27._CodeOrName ? addNames$1(names$2, from.names) : names$2;
	}
	function optimizeExpr$1(expr, names$2, constants) {
		if (expr instanceof code_1$27.Name) return replaceName(expr);
		if (!canOptimize(expr)) return expr;
		return new code_1$27._Code(expr._items.reduce((items, c) => {
			if (c instanceof code_1$27.Name) c = replaceName(c);
			if (c instanceof code_1$27._Code) items.push(...c._items);
			else items.push(c);
			return items;
		}, []));
		function replaceName(n) {
			const c = constants[n.str];
			if (c === void 0 || names$2[n.str] !== 1) return n;
			delete names$2[n.str];
			return c;
		}
		function canOptimize(e) {
			return e instanceof code_1$27._Code && e._items.some((c) => c instanceof code_1$27.Name && names$2[c.str] === 1 && constants[c.str] !== void 0);
		}
	}
	function subtractNames$1(names$2, from) {
		for (const n in from) names$2[n] = (names$2[n] || 0) - (from[n] || 0);
	}
	function not$1(x) {
		return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1$27._)`!${par$1(x)}`;
	}
	exports.not = not$1;
	const andCode$1 = mappend$1(exports.operators.AND);
	function and$1(...args) {
		return args.reduce(andCode$1);
	}
	exports.and = and$1;
	const orCode$1 = mappend$1(exports.operators.OR);
	function or$1(...args) {
		return args.reduce(orCode$1);
	}
	exports.or = or$1;
	function mappend$1(op) {
		return (x, y) => x === code_1$27.nil ? y : y === code_1$27.nil ? x : (0, code_1$27._)`${par$1(x)} ${op} ${par$1(y)}`;
	}
	function par$1(x) {
		return x instanceof code_1$27.Name ? x : (0, code_1$27._)`(${x})`;
	}
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/util.js
var require_util$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/util.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
	const codegen_1$79 = require_codegen$1();
	const code_1$26 = require_code$3();
	function toHash$1(arr) {
		const hash = {};
		for (const item of arr) hash[item] = true;
		return hash;
	}
	exports.toHash = toHash$1;
	function alwaysValidSchema$1(it, schema$1) {
		if (typeof schema$1 == "boolean") return schema$1;
		if (Object.keys(schema$1).length === 0) return true;
		checkUnknownRules$1(it, schema$1);
		return !schemaHasRules$1(schema$1, it.self.RULES.all);
	}
	exports.alwaysValidSchema = alwaysValidSchema$1;
	function checkUnknownRules$1(it, schema$1 = it.schema) {
		const { opts, self } = it;
		if (!opts.strictSchema) return;
		if (typeof schema$1 === "boolean") return;
		const rules = self.RULES.keywords;
		for (const key in schema$1) if (!rules[key]) checkStrictMode$1(it, `unknown keyword: "${key}"`);
	}
	exports.checkUnknownRules = checkUnknownRules$1;
	function schemaHasRules$1(schema$1, rules) {
		if (typeof schema$1 == "boolean") return !schema$1;
		for (const key in schema$1) if (rules[key]) return true;
		return false;
	}
	exports.schemaHasRules = schemaHasRules$1;
	function schemaHasRulesButRef$1(schema$1, RULES) {
		if (typeof schema$1 == "boolean") return !schema$1;
		for (const key in schema$1) if (key !== "$ref" && RULES.all[key]) return true;
		return false;
	}
	exports.schemaHasRulesButRef = schemaHasRulesButRef$1;
	function schemaRefOrVal$1({ topSchemaRef, schemaPath }, schema$1, keyword$1, $data) {
		if (!$data) {
			if (typeof schema$1 == "number" || typeof schema$1 == "boolean") return schema$1;
			if (typeof schema$1 == "string") return (0, codegen_1$79._)`${schema$1}`;
		}
		return (0, codegen_1$79._)`${topSchemaRef}${schemaPath}${(0, codegen_1$79.getProperty)(keyword$1)}`;
	}
	exports.schemaRefOrVal = schemaRefOrVal$1;
	function unescapeFragment$1(str$2) {
		return unescapeJsonPointer$1(decodeURIComponent(str$2));
	}
	exports.unescapeFragment = unescapeFragment$1;
	function escapeFragment$1(str$2) {
		return encodeURIComponent(escapeJsonPointer$1(str$2));
	}
	exports.escapeFragment = escapeFragment$1;
	function escapeJsonPointer$1(str$2) {
		if (typeof str$2 == "number") return `${str$2}`;
		return str$2.replace(/~/g, "~0").replace(/\//g, "~1");
	}
	exports.escapeJsonPointer = escapeJsonPointer$1;
	function unescapeJsonPointer$1(str$2) {
		return str$2.replace(/~1/g, "/").replace(/~0/g, "~");
	}
	exports.unescapeJsonPointer = unescapeJsonPointer$1;
	function eachItem$1(xs, f) {
		if (Array.isArray(xs)) for (const x of xs) f(x);
		else f(xs);
	}
	exports.eachItem = eachItem$1;
	function makeMergeEvaluated$1({ mergeNames, mergeToName, mergeValues, resultToName }) {
		return (gen, from, to, toName) => {
			const res = to === void 0 ? from : to instanceof codegen_1$79.Name ? (from instanceof codegen_1$79.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1$79.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
			return toName === codegen_1$79.Name && !(res instanceof codegen_1$79.Name) ? resultToName(gen, res) : res;
		};
	}
	exports.mergeEvaluated = {
		props: makeMergeEvaluated$1({
			mergeNames: (gen, from, to) => gen.if((0, codegen_1$79._)`${to} !== true && ${from} !== undefined`, () => {
				gen.if((0, codegen_1$79._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1$79._)`${to} || {}`).code((0, codegen_1$79._)`Object.assign(${to}, ${from})`));
			}),
			mergeToName: (gen, from, to) => gen.if((0, codegen_1$79._)`${to} !== true`, () => {
				if (from === true) gen.assign(to, true);
				else {
					gen.assign(to, (0, codegen_1$79._)`${to} || {}`);
					setEvaluated$1(gen, to, from);
				}
			}),
			mergeValues: (from, to) => from === true ? true : {
				...from,
				...to
			},
			resultToName: evaluatedPropsToName$1
		}),
		items: makeMergeEvaluated$1({
			mergeNames: (gen, from, to) => gen.if((0, codegen_1$79._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1$79._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
			mergeToName: (gen, from, to) => gen.if((0, codegen_1$79._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1$79._)`${to} > ${from} ? ${to} : ${from}`)),
			mergeValues: (from, to) => from === true ? true : Math.max(from, to),
			resultToName: (gen, items) => gen.var("items", items)
		})
	};
	function evaluatedPropsToName$1(gen, ps) {
		if (ps === true) return gen.var("props", true);
		const props = gen.var("props", (0, codegen_1$79._)`{}`);
		if (ps !== void 0) setEvaluated$1(gen, props, ps);
		return props;
	}
	exports.evaluatedPropsToName = evaluatedPropsToName$1;
	function setEvaluated$1(gen, props, ps) {
		Object.keys(ps).forEach((p) => gen.assign((0, codegen_1$79._)`${props}${(0, codegen_1$79.getProperty)(p)}`, true));
	}
	exports.setEvaluated = setEvaluated$1;
	const snippets$1 = {};
	function useFunc$1(gen, f) {
		return gen.scopeValue("func", {
			ref: f,
			code: snippets$1[f.code] || (snippets$1[f.code] = new code_1$26._Code(f.code))
		});
	}
	exports.useFunc = useFunc$1;
	var Type$1;
	(function(Type$2) {
		Type$2[Type$2["Num"] = 0] = "Num";
		Type$2[Type$2["Str"] = 1] = "Str";
	})(Type$1 || (exports.Type = Type$1 = {}));
	function getErrorPath$1(dataProp, dataPropType, jsPropertySyntax) {
		if (dataProp instanceof codegen_1$79.Name) {
			const isNumber = dataPropType === Type$1.Num;
			return jsPropertySyntax ? isNumber ? (0, codegen_1$79._)`"[" + ${dataProp} + "]"` : (0, codegen_1$79._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1$79._)`"/" + ${dataProp}` : (0, codegen_1$79._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
		}
		return jsPropertySyntax ? (0, codegen_1$79.getProperty)(dataProp).toString() : "/" + escapeJsonPointer$1(dataProp);
	}
	exports.getErrorPath = getErrorPath$1;
	function checkStrictMode$1(it, msg, mode = it.opts.strictSchema) {
		if (!mode) return;
		msg = `strict mode: ${msg}`;
		if (mode === true) throw new Error(msg);
		it.self.logger.warn(msg);
	}
	exports.checkStrictMode = checkStrictMode$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/names.js
var require_names$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/names.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$78 = require_codegen$1();
	const names$1 = {
		data: new codegen_1$78.Name("data"),
		valCxt: new codegen_1$78.Name("valCxt"),
		instancePath: new codegen_1$78.Name("instancePath"),
		parentData: new codegen_1$78.Name("parentData"),
		parentDataProperty: new codegen_1$78.Name("parentDataProperty"),
		rootData: new codegen_1$78.Name("rootData"),
		dynamicAnchors: new codegen_1$78.Name("dynamicAnchors"),
		vErrors: new codegen_1$78.Name("vErrors"),
		errors: new codegen_1$78.Name("errors"),
		this: new codegen_1$78.Name("this"),
		self: new codegen_1$78.Name("self"),
		scope: new codegen_1$78.Name("scope"),
		json: new codegen_1$78.Name("json"),
		jsonPos: new codegen_1$78.Name("jsonPos"),
		jsonLen: new codegen_1$78.Name("jsonLen"),
		jsonPart: new codegen_1$78.Name("jsonPart")
	};
	exports.default = names$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/errors.js
var require_errors$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/errors.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
	const codegen_1$77 = require_codegen$1();
	const util_1$63 = require_util$1();
	const names_1$19 = require_names$1();
	exports.keywordError = { message: ({ keyword: keyword$1 }) => (0, codegen_1$77.str)`must pass "${keyword$1}" keyword validation` };
	exports.keyword$DataError = { message: ({ keyword: keyword$1, schemaType }) => schemaType ? (0, codegen_1$77.str)`"${keyword$1}" keyword must be ${schemaType} ($data)` : (0, codegen_1$77.str)`"${keyword$1}" keyword is invalid ($data)` };
	function reportError$1(cxt, error$41 = exports.keywordError, errorPaths, overrideAllErrors) {
		const { it } = cxt;
		const { gen, compositeRule, allErrors } = it;
		const errObj = errorObjectCode$1(cxt, error$41, errorPaths);
		if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) addError$1(gen, errObj);
		else returnErrors$1(it, (0, codegen_1$77._)`[${errObj}]`);
	}
	exports.reportError = reportError$1;
	function reportExtraError$1(cxt, error$41 = exports.keywordError, errorPaths) {
		const { it } = cxt;
		const { gen, compositeRule, allErrors } = it;
		const errObj = errorObjectCode$1(cxt, error$41, errorPaths);
		addError$1(gen, errObj);
		if (!(compositeRule || allErrors)) returnErrors$1(it, names_1$19.default.vErrors);
	}
	exports.reportExtraError = reportExtraError$1;
	function resetErrorsCount$1(gen, errsCount) {
		gen.assign(names_1$19.default.errors, errsCount);
		gen.if((0, codegen_1$77._)`${names_1$19.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1$77._)`${names_1$19.default.vErrors}.length`, errsCount), () => gen.assign(names_1$19.default.vErrors, null)));
	}
	exports.resetErrorsCount = resetErrorsCount$1;
	function extendErrors$1({ gen, keyword: keyword$1, schemaValue, data, errsCount, it }) {
		/* istanbul ignore if */
		if (errsCount === void 0) throw new Error("ajv implementation error");
		const err = gen.name("err");
		gen.forRange("i", errsCount, names_1$19.default.errors, (i) => {
			gen.const(err, (0, codegen_1$77._)`${names_1$19.default.vErrors}[${i}]`);
			gen.if((0, codegen_1$77._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1$77._)`${err}.instancePath`, (0, codegen_1$77.strConcat)(names_1$19.default.instancePath, it.errorPath)));
			gen.assign((0, codegen_1$77._)`${err}.schemaPath`, (0, codegen_1$77.str)`${it.errSchemaPath}/${keyword$1}`);
			if (it.opts.verbose) {
				gen.assign((0, codegen_1$77._)`${err}.schema`, schemaValue);
				gen.assign((0, codegen_1$77._)`${err}.data`, data);
			}
		});
	}
	exports.extendErrors = extendErrors$1;
	function addError$1(gen, errObj) {
		const err = gen.const("err", errObj);
		gen.if((0, codegen_1$77._)`${names_1$19.default.vErrors} === null`, () => gen.assign(names_1$19.default.vErrors, (0, codegen_1$77._)`[${err}]`), (0, codegen_1$77._)`${names_1$19.default.vErrors}.push(${err})`);
		gen.code((0, codegen_1$77._)`${names_1$19.default.errors}++`);
	}
	function returnErrors$1(it, errs) {
		const { gen, validateName, schemaEnv } = it;
		if (schemaEnv.$async) gen.throw((0, codegen_1$77._)`new ${it.ValidationError}(${errs})`);
		else {
			gen.assign((0, codegen_1$77._)`${validateName}.errors`, errs);
			gen.return(false);
		}
	}
	const E$1 = {
		keyword: new codegen_1$77.Name("keyword"),
		schemaPath: new codegen_1$77.Name("schemaPath"),
		params: new codegen_1$77.Name("params"),
		propertyName: new codegen_1$77.Name("propertyName"),
		message: new codegen_1$77.Name("message"),
		schema: new codegen_1$77.Name("schema"),
		parentSchema: new codegen_1$77.Name("parentSchema")
	};
	function errorObjectCode$1(cxt, error$41, errorPaths) {
		const { createErrors } = cxt.it;
		if (createErrors === false) return (0, codegen_1$77._)`{}`;
		return errorObject$1(cxt, error$41, errorPaths);
	}
	function errorObject$1(cxt, error$41, errorPaths = {}) {
		const { gen, it } = cxt;
		const keyValues = [errorInstancePath$1(it, errorPaths), errorSchemaPath$1(cxt, errorPaths)];
		extraErrorProps$1(cxt, error$41, keyValues);
		return gen.object(...keyValues);
	}
	function errorInstancePath$1({ errorPath }, { instancePath }) {
		const instPath = instancePath ? (0, codegen_1$77.str)`${errorPath}${(0, util_1$63.getErrorPath)(instancePath, util_1$63.Type.Str)}` : errorPath;
		return [names_1$19.default.instancePath, (0, codegen_1$77.strConcat)(names_1$19.default.instancePath, instPath)];
	}
	function errorSchemaPath$1({ keyword: keyword$1, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
		let schPath = parentSchema ? errSchemaPath : (0, codegen_1$77.str)`${errSchemaPath}/${keyword$1}`;
		if (schemaPath) schPath = (0, codegen_1$77.str)`${schPath}${(0, util_1$63.getErrorPath)(schemaPath, util_1$63.Type.Str)}`;
		return [E$1.schemaPath, schPath];
	}
	function extraErrorProps$1(cxt, { params, message }, keyValues) {
		const { keyword: keyword$1, data, schemaValue, it } = cxt;
		const { opts, propertyName, topSchemaRef, schemaPath } = it;
		keyValues.push([E$1.keyword, keyword$1], [E$1.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1$77._)`{}`]);
		if (opts.messages) keyValues.push([E$1.message, typeof message == "function" ? message(cxt) : message]);
		if (opts.verbose) keyValues.push([E$1.schema, schemaValue], [E$1.parentSchema, (0, codegen_1$77._)`${topSchemaRef}${schemaPath}`], [names_1$19.default.data, data]);
		if (propertyName) keyValues.push([E$1.propertyName, propertyName]);
	}
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/boolSchema.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
	const errors_1$8 = require_errors$1();
	const codegen_1$76 = require_codegen$1();
	const names_1$18 = require_names$1();
	const boolError$1 = { message: "boolean schema is false" };
	function topBoolOrEmptySchema$1(it) {
		const { gen, schema: schema$1, validateName } = it;
		if (schema$1 === false) falseSchemaError$1(it, false);
		else if (typeof schema$1 == "object" && schema$1.$async === true) gen.return(names_1$18.default.data);
		else {
			gen.assign((0, codegen_1$76._)`${validateName}.errors`, null);
			gen.return(true);
		}
	}
	exports.topBoolOrEmptySchema = topBoolOrEmptySchema$1;
	function boolOrEmptySchema$1(it, valid) {
		const { gen, schema: schema$1 } = it;
		if (schema$1 === false) {
			gen.var(valid, false);
			falseSchemaError$1(it);
		} else gen.var(valid, true);
	}
	exports.boolOrEmptySchema = boolOrEmptySchema$1;
	function falseSchemaError$1(it, overrideAllErrors) {
		const { gen, data } = it;
		const cxt = {
			gen,
			keyword: "false schema",
			data,
			schema: false,
			schemaCode: false,
			schemaValue: false,
			params: {},
			it
		};
		(0, errors_1$8.reportError)(cxt, boolError$1, void 0, overrideAllErrors);
	}
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/rules.js
var require_rules$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/rules.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getRules = exports.isJSONType = void 0;
	const _jsonTypes$1 = [
		"string",
		"number",
		"integer",
		"boolean",
		"null",
		"object",
		"array"
	];
	const jsonTypes$1 = new Set(_jsonTypes$1);
	function isJSONType$1(x) {
		return typeof x == "string" && jsonTypes$1.has(x);
	}
	exports.isJSONType = isJSONType$1;
	function getRules$1() {
		const groups = {
			number: {
				type: "number",
				rules: []
			},
			string: {
				type: "string",
				rules: []
			},
			array: {
				type: "array",
				rules: []
			},
			object: {
				type: "object",
				rules: []
			}
		};
		return {
			types: {
				...groups,
				integer: true,
				boolean: true,
				null: true
			},
			rules: [
				{ rules: [] },
				groups.number,
				groups.string,
				groups.array,
				groups.object
			],
			post: { rules: [] },
			all: {},
			keywords: {}
		};
	}
	exports.getRules = getRules$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/applicability.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
	function schemaHasRulesForType$1({ schema: schema$1, self }, type) {
		const group = self.RULES.types[type];
		return group && group !== true && shouldUseGroup$1(schema$1, group);
	}
	exports.schemaHasRulesForType = schemaHasRulesForType$1;
	function shouldUseGroup$1(schema$1, group) {
		return group.rules.some((rule) => shouldUseRule$1(schema$1, rule));
	}
	exports.shouldUseGroup = shouldUseGroup$1;
	function shouldUseRule$1(schema$1, rule) {
		var _a$4;
		return schema$1[rule.keyword] !== void 0 || ((_a$4 = rule.definition.implements) === null || _a$4 === void 0 ? void 0 : _a$4.some((kwd) => schema$1[kwd] !== void 0));
	}
	exports.shouldUseRule = shouldUseRule$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/dataType.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
	const rules_1$3 = require_rules$1();
	const applicability_1$3 = require_applicability$1();
	const errors_1$7 = require_errors$1();
	const codegen_1$75 = require_codegen$1();
	const util_1$62 = require_util$1();
	var DataType$1;
	(function(DataType$2) {
		DataType$2[DataType$2["Correct"] = 0] = "Correct";
		DataType$2[DataType$2["Wrong"] = 1] = "Wrong";
	})(DataType$1 || (exports.DataType = DataType$1 = {}));
	function getSchemaTypes$1(schema$1) {
		const types = getJSONTypes$1(schema$1.type);
		const hasNull = types.includes("null");
		if (hasNull) {
			if (schema$1.nullable === false) throw new Error("type: null contradicts nullable: false");
		} else {
			if (!types.length && schema$1.nullable !== void 0) throw new Error("\"nullable\" cannot be used without \"type\"");
			if (schema$1.nullable === true) types.push("null");
		}
		return types;
	}
	exports.getSchemaTypes = getSchemaTypes$1;
	function getJSONTypes$1(ts) {
		const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
		if (types.every(rules_1$3.isJSONType)) return types;
		throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
	}
	exports.getJSONTypes = getJSONTypes$1;
	function coerceAndCheckDataType$1(it, types) {
		const { gen, data, opts } = it;
		const coerceTo = coerceToTypes$1(types, opts.coerceTypes);
		const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1$3.schemaHasRulesForType)(it, types[0]));
		if (checkTypes) {
			const wrongType = checkDataTypes$1(types, data, opts.strictNumbers, DataType$1.Wrong);
			gen.if(wrongType, () => {
				if (coerceTo.length) coerceData$1(it, types, coerceTo);
				else reportTypeError$1(it);
			});
		}
		return checkTypes;
	}
	exports.coerceAndCheckDataType = coerceAndCheckDataType$1;
	const COERCIBLE$1 = new Set([
		"string",
		"number",
		"integer",
		"boolean",
		"null"
	]);
	function coerceToTypes$1(types, coerceTypes) {
		return coerceTypes ? types.filter((t) => COERCIBLE$1.has(t) || coerceTypes === "array" && t === "array") : [];
	}
	function coerceData$1(it, types, coerceTo) {
		const { gen, data, opts } = it;
		const dataType = gen.let("dataType", (0, codegen_1$75._)`typeof ${data}`);
		const coerced = gen.let("coerced", (0, codegen_1$75._)`undefined`);
		if (opts.coerceTypes === "array") gen.if((0, codegen_1$75._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1$75._)`${data}[0]`).assign(dataType, (0, codegen_1$75._)`typeof ${data}`).if(checkDataTypes$1(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
		gen.if((0, codegen_1$75._)`${coerced} !== undefined`);
		for (const t of coerceTo) if (COERCIBLE$1.has(t) || t === "array" && opts.coerceTypes === "array") coerceSpecificType(t);
		gen.else();
		reportTypeError$1(it);
		gen.endIf();
		gen.if((0, codegen_1$75._)`${coerced} !== undefined`, () => {
			gen.assign(data, coerced);
			assignParentData$1(it, coerced);
		});
		function coerceSpecificType(t) {
			switch (t) {
				case "string":
					gen.elseIf((0, codegen_1$75._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1$75._)`"" + ${data}`).elseIf((0, codegen_1$75._)`${data} === null`).assign(coerced, (0, codegen_1$75._)`""`);
					return;
				case "number":
					gen.elseIf((0, codegen_1$75._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1$75._)`+${data}`);
					return;
				case "integer":
					gen.elseIf((0, codegen_1$75._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1$75._)`+${data}`);
					return;
				case "boolean":
					gen.elseIf((0, codegen_1$75._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1$75._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
					return;
				case "null":
					gen.elseIf((0, codegen_1$75._)`${data} === "" || ${data} === 0 || ${data} === false`);
					gen.assign(coerced, null);
					return;
				case "array": gen.elseIf((0, codegen_1$75._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1$75._)`[${data}]`);
			}
		}
	}
	function assignParentData$1({ gen, parentData, parentDataProperty }, expr) {
		gen.if((0, codegen_1$75._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1$75._)`${parentData}[${parentDataProperty}]`, expr));
	}
	function checkDataType$1(dataType, data, strictNums, correct = DataType$1.Correct) {
		const EQ = correct === DataType$1.Correct ? codegen_1$75.operators.EQ : codegen_1$75.operators.NEQ;
		let cond;
		switch (dataType) {
			case "null": return (0, codegen_1$75._)`${data} ${EQ} null`;
			case "array":
				cond = (0, codegen_1$75._)`Array.isArray(${data})`;
				break;
			case "object":
				cond = (0, codegen_1$75._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
				break;
			case "integer":
				cond = numCond((0, codegen_1$75._)`!(${data} % 1) && !isNaN(${data})`);
				break;
			case "number":
				cond = numCond();
				break;
			default: return (0, codegen_1$75._)`typeof ${data} ${EQ} ${dataType}`;
		}
		return correct === DataType$1.Correct ? cond : (0, codegen_1$75.not)(cond);
		function numCond(_cond = codegen_1$75.nil) {
			return (0, codegen_1$75.and)((0, codegen_1$75._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1$75._)`isFinite(${data})` : codegen_1$75.nil);
		}
	}
	exports.checkDataType = checkDataType$1;
	function checkDataTypes$1(dataTypes, data, strictNums, correct) {
		if (dataTypes.length === 1) return checkDataType$1(dataTypes[0], data, strictNums, correct);
		let cond;
		const types = (0, util_1$62.toHash)(dataTypes);
		if (types.array && types.object) {
			const notObj = (0, codegen_1$75._)`typeof ${data} != "object"`;
			cond = types.null ? notObj : (0, codegen_1$75._)`!${data} || ${notObj}`;
			delete types.null;
			delete types.array;
			delete types.object;
		} else cond = codegen_1$75.nil;
		if (types.number) delete types.integer;
		for (const t in types) cond = (0, codegen_1$75.and)(cond, checkDataType$1(t, data, strictNums, correct));
		return cond;
	}
	exports.checkDataTypes = checkDataTypes$1;
	const typeError$1 = {
		message: ({ schema: schema$1 }) => `must be ${schema$1}`,
		params: ({ schema: schema$1, schemaValue }) => typeof schema$1 == "string" ? (0, codegen_1$75._)`{type: ${schema$1}}` : (0, codegen_1$75._)`{type: ${schemaValue}}`
	};
	function reportTypeError$1(it) {
		const cxt = getTypeErrorContext$1(it);
		(0, errors_1$7.reportError)(cxt, typeError$1);
	}
	exports.reportTypeError = reportTypeError$1;
	function getTypeErrorContext$1(it) {
		const { gen, data, schema: schema$1 } = it;
		const schemaCode = (0, util_1$62.schemaRefOrVal)(it, schema$1, "type");
		return {
			gen,
			keyword: "type",
			data,
			schema: schema$1.type,
			schemaCode,
			schemaValue: schemaCode,
			parentSchema: schema$1,
			params: {},
			it
		};
	}
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/defaults.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.assignDefaults = void 0;
	const codegen_1$74 = require_codegen$1();
	const util_1$61 = require_util$1();
	function assignDefaults$1(it, ty) {
		const { properties, items } = it.schema;
		if (ty === "object" && properties) for (const key in properties) assignDefault$1(it, key, properties[key].default);
		else if (ty === "array" && Array.isArray(items)) items.forEach((sch, i) => assignDefault$1(it, i, sch.default));
	}
	exports.assignDefaults = assignDefaults$1;
	function assignDefault$1(it, prop, defaultValue) {
		const { gen, compositeRule, data, opts } = it;
		if (defaultValue === void 0) return;
		const childData = (0, codegen_1$74._)`${data}${(0, codegen_1$74.getProperty)(prop)}`;
		if (compositeRule) {
			(0, util_1$61.checkStrictMode)(it, `default is ignored for: ${childData}`);
			return;
		}
		let condition = (0, codegen_1$74._)`${childData} === undefined`;
		if (opts.useDefaults === "empty") condition = (0, codegen_1$74._)`${condition} || ${childData} === null || ${childData} === ""`;
		gen.if(condition, (0, codegen_1$74._)`${childData} = ${(0, codegen_1$74.stringify)(defaultValue)}`);
	}
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/code.js
var require_code$2 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/code.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
	const codegen_1$73 = require_codegen$1();
	const util_1$60 = require_util$1();
	const names_1$17 = require_names$1();
	const util_2$3 = require_util$1();
	function checkReportMissingProp$1(cxt, prop) {
		const { gen, data, it } = cxt;
		gen.if(noPropertyInData$1(gen, data, prop, it.opts.ownProperties), () => {
			cxt.setParams({ missingProperty: (0, codegen_1$73._)`${prop}` }, true);
			cxt.error();
		});
	}
	exports.checkReportMissingProp = checkReportMissingProp$1;
	function checkMissingProp$1({ gen, data, it: { opts } }, properties, missing) {
		return (0, codegen_1$73.or)(...properties.map((prop) => (0, codegen_1$73.and)(noPropertyInData$1(gen, data, prop, opts.ownProperties), (0, codegen_1$73._)`${missing} = ${prop}`)));
	}
	exports.checkMissingProp = checkMissingProp$1;
	function reportMissingProp$1(cxt, missing) {
		cxt.setParams({ missingProperty: missing }, true);
		cxt.error();
	}
	exports.reportMissingProp = reportMissingProp$1;
	function hasPropFunc$1(gen) {
		return gen.scopeValue("func", {
			ref: Object.prototype.hasOwnProperty,
			code: (0, codegen_1$73._)`Object.prototype.hasOwnProperty`
		});
	}
	exports.hasPropFunc = hasPropFunc$1;
	function isOwnProperty$1(gen, data, property) {
		return (0, codegen_1$73._)`${hasPropFunc$1(gen)}.call(${data}, ${property})`;
	}
	exports.isOwnProperty = isOwnProperty$1;
	function propertyInData$1(gen, data, property, ownProperties) {
		const cond = (0, codegen_1$73._)`${data}${(0, codegen_1$73.getProperty)(property)} !== undefined`;
		return ownProperties ? (0, codegen_1$73._)`${cond} && ${isOwnProperty$1(gen, data, property)}` : cond;
	}
	exports.propertyInData = propertyInData$1;
	function noPropertyInData$1(gen, data, property, ownProperties) {
		const cond = (0, codegen_1$73._)`${data}${(0, codegen_1$73.getProperty)(property)} === undefined`;
		return ownProperties ? (0, codegen_1$73.or)(cond, (0, codegen_1$73.not)(isOwnProperty$1(gen, data, property))) : cond;
	}
	exports.noPropertyInData = noPropertyInData$1;
	function allSchemaProperties$1(schemaMap) {
		return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
	}
	exports.allSchemaProperties = allSchemaProperties$1;
	function schemaProperties$1(it, schemaMap) {
		return allSchemaProperties$1(schemaMap).filter((p) => !(0, util_1$60.alwaysValidSchema)(it, schemaMap[p]));
	}
	exports.schemaProperties = schemaProperties$1;
	function callValidateCode$1({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
		const dataAndSchema = passSchema ? (0, codegen_1$73._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
		const valCxt = [
			[names_1$17.default.instancePath, (0, codegen_1$73.strConcat)(names_1$17.default.instancePath, errorPath)],
			[names_1$17.default.parentData, it.parentData],
			[names_1$17.default.parentDataProperty, it.parentDataProperty],
			[names_1$17.default.rootData, names_1$17.default.rootData]
		];
		if (it.opts.dynamicRef) valCxt.push([names_1$17.default.dynamicAnchors, names_1$17.default.dynamicAnchors]);
		const args = (0, codegen_1$73._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
		return context !== codegen_1$73.nil ? (0, codegen_1$73._)`${func}.call(${context}, ${args})` : (0, codegen_1$73._)`${func}(${args})`;
	}
	exports.callValidateCode = callValidateCode$1;
	const newRegExp$1 = (0, codegen_1$73._)`new RegExp`;
	function usePattern$1({ gen, it: { opts } }, pattern) {
		const u = opts.unicodeRegExp ? "u" : "";
		const { regExp } = opts.code;
		const rx = regExp(pattern, u);
		return gen.scopeValue("pattern", {
			key: rx.toString(),
			ref: rx,
			code: (0, codegen_1$73._)`${regExp.code === "new RegExp" ? newRegExp$1 : (0, util_2$3.useFunc)(gen, regExp)}(${pattern}, ${u})`
		});
	}
	exports.usePattern = usePattern$1;
	function validateArray$1(cxt) {
		const { gen, data, keyword: keyword$1, it } = cxt;
		const valid = gen.name("valid");
		if (it.allErrors) {
			const validArr = gen.let("valid", true);
			validateItems(() => gen.assign(validArr, false));
			return validArr;
		}
		gen.var(valid, true);
		validateItems(() => gen.break());
		return valid;
		function validateItems(notValid) {
			const len = gen.const("len", (0, codegen_1$73._)`${data}.length`);
			gen.forRange("i", 0, len, (i) => {
				cxt.subschema({
					keyword: keyword$1,
					dataProp: i,
					dataPropType: util_1$60.Type.Num
				}, valid);
				gen.if((0, codegen_1$73.not)(valid), notValid);
			});
		}
	}
	exports.validateArray = validateArray$1;
	function validateUnion$1(cxt) {
		const { gen, schema: schema$1, keyword: keyword$1, it } = cxt;
		/* istanbul ignore if */
		if (!Array.isArray(schema$1)) throw new Error("ajv implementation error");
		const alwaysValid = schema$1.some((sch) => (0, util_1$60.alwaysValidSchema)(it, sch));
		if (alwaysValid && !it.opts.unevaluated) return;
		const valid = gen.let("valid", false);
		const schValid = gen.name("_valid");
		gen.block(() => schema$1.forEach((_sch, i) => {
			const schCxt = cxt.subschema({
				keyword: keyword$1,
				schemaProp: i,
				compositeRule: true
			}, schValid);
			gen.assign(valid, (0, codegen_1$73._)`${valid} || ${schValid}`);
			const merged = cxt.mergeValidEvaluated(schCxt, schValid);
			if (!merged) gen.if((0, codegen_1$73.not)(valid));
		}));
		cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
	}
	exports.validateUnion = validateUnion$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/keyword.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
	const codegen_1$72 = require_codegen$1();
	const names_1$16 = require_names$1();
	const code_1$25 = require_code$2();
	const errors_1$6 = require_errors$1();
	function macroKeywordCode$1(cxt, def$69) {
		const { gen, keyword: keyword$1, schema: schema$1, parentSchema, it } = cxt;
		const macroSchema = def$69.macro.call(it.self, schema$1, parentSchema, it);
		const schemaRef = useKeyword$1(gen, keyword$1, macroSchema);
		if (it.opts.validateSchema !== false) it.self.validateSchema(macroSchema, true);
		const valid = gen.name("valid");
		cxt.subschema({
			schema: macroSchema,
			schemaPath: codegen_1$72.nil,
			errSchemaPath: `${it.errSchemaPath}/${keyword$1}`,
			topSchemaRef: schemaRef,
			compositeRule: true
		}, valid);
		cxt.pass(valid, () => cxt.error(true));
	}
	exports.macroKeywordCode = macroKeywordCode$1;
	function funcKeywordCode$1(cxt, def$69) {
		var _a$4;
		const { gen, keyword: keyword$1, schema: schema$1, parentSchema, $data, it } = cxt;
		checkAsyncKeyword$1(it, def$69);
		const validate$1 = !$data && def$69.compile ? def$69.compile.call(it.self, schema$1, parentSchema, it) : def$69.validate;
		const validateRef = useKeyword$1(gen, keyword$1, validate$1);
		const valid = gen.let("valid");
		cxt.block$data(valid, validateKeyword);
		cxt.ok((_a$4 = def$69.valid) !== null && _a$4 !== void 0 ? _a$4 : valid);
		function validateKeyword() {
			if (def$69.errors === false) {
				assignValid();
				if (def$69.modifying) modifyData$1(cxt);
				reportErrs(() => cxt.error());
			} else {
				const ruleErrs = def$69.async ? validateAsync() : validateSync();
				if (def$69.modifying) modifyData$1(cxt);
				reportErrs(() => addErrs$1(cxt, ruleErrs));
			}
		}
		function validateAsync() {
			const ruleErrs = gen.let("ruleErrs", null);
			gen.try(() => assignValid((0, codegen_1$72._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1$72._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1$72._)`${e}.errors`), () => gen.throw(e)));
			return ruleErrs;
		}
		function validateSync() {
			const validateErrs = (0, codegen_1$72._)`${validateRef}.errors`;
			gen.assign(validateErrs, null);
			assignValid(codegen_1$72.nil);
			return validateErrs;
		}
		function assignValid(_await = def$69.async ? (0, codegen_1$72._)`await ` : codegen_1$72.nil) {
			const passCxt = it.opts.passContext ? names_1$16.default.this : names_1$16.default.self;
			const passSchema = !("compile" in def$69 && !$data || def$69.schema === false);
			gen.assign(valid, (0, codegen_1$72._)`${_await}${(0, code_1$25.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def$69.modifying);
		}
		function reportErrs(errors) {
			var _a$5;
			gen.if((0, codegen_1$72.not)((_a$5 = def$69.valid) !== null && _a$5 !== void 0 ? _a$5 : valid), errors);
		}
	}
	exports.funcKeywordCode = funcKeywordCode$1;
	function modifyData$1(cxt) {
		const { gen, data, it } = cxt;
		gen.if(it.parentData, () => gen.assign(data, (0, codegen_1$72._)`${it.parentData}[${it.parentDataProperty}]`));
	}
	function addErrs$1(cxt, errs) {
		const { gen } = cxt;
		gen.if((0, codegen_1$72._)`Array.isArray(${errs})`, () => {
			gen.assign(names_1$16.default.vErrors, (0, codegen_1$72._)`${names_1$16.default.vErrors} === null ? ${errs} : ${names_1$16.default.vErrors}.concat(${errs})`).assign(names_1$16.default.errors, (0, codegen_1$72._)`${names_1$16.default.vErrors}.length`);
			(0, errors_1$6.extendErrors)(cxt);
		}, () => cxt.error());
	}
	function checkAsyncKeyword$1({ schemaEnv }, def$69) {
		if (def$69.async && !schemaEnv.$async) throw new Error("async keyword in sync schema");
	}
	function useKeyword$1(gen, keyword$1, result) {
		if (result === void 0) throw new Error(`keyword "${keyword$1}" failed to compile`);
		return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : {
			ref: result,
			code: (0, codegen_1$72.stringify)(result)
		});
	}
	function validSchemaType$1(schema$1, schemaType, allowUndefined = false) {
		return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema$1) : st === "object" ? schema$1 && typeof schema$1 == "object" && !Array.isArray(schema$1) : typeof schema$1 == st || allowUndefined && typeof schema$1 == "undefined");
	}
	exports.validSchemaType = validSchemaType$1;
	function validateKeywordUsage$1({ schema: schema$1, opts, self, errSchemaPath }, def$69, keyword$1) {
		/* istanbul ignore if */
		if (Array.isArray(def$69.keyword) ? !def$69.keyword.includes(keyword$1) : def$69.keyword !== keyword$1) throw new Error("ajv implementation error");
		const deps = def$69.dependencies;
		if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema$1, kwd))) throw new Error(`parent schema must have dependencies of ${keyword$1}: ${deps.join(",")}`);
		if (def$69.validateSchema) {
			const valid = def$69.validateSchema(schema$1[keyword$1]);
			if (!valid) {
				const msg = `keyword "${keyword$1}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def$69.validateSchema.errors);
				if (opts.validateSchema === "log") self.logger.error(msg);
				else throw new Error(msg);
			}
		}
	}
	exports.validateKeywordUsage = validateKeywordUsage$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/subschema.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
	const codegen_1$71 = require_codegen$1();
	const util_1$59 = require_util$1();
	function getSubschema$1(it, { keyword: keyword$1, schemaProp, schema: schema$1, schemaPath, errSchemaPath, topSchemaRef }) {
		if (keyword$1 !== void 0 && schema$1 !== void 0) throw new Error("both \"keyword\" and \"schema\" passed, only one allowed");
		if (keyword$1 !== void 0) {
			const sch = it.schema[keyword$1];
			return schemaProp === void 0 ? {
				schema: sch,
				schemaPath: (0, codegen_1$71._)`${it.schemaPath}${(0, codegen_1$71.getProperty)(keyword$1)}`,
				errSchemaPath: `${it.errSchemaPath}/${keyword$1}`
			} : {
				schema: sch[schemaProp],
				schemaPath: (0, codegen_1$71._)`${it.schemaPath}${(0, codegen_1$71.getProperty)(keyword$1)}${(0, codegen_1$71.getProperty)(schemaProp)}`,
				errSchemaPath: `${it.errSchemaPath}/${keyword$1}/${(0, util_1$59.escapeFragment)(schemaProp)}`
			};
		}
		if (schema$1 !== void 0) {
			if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) throw new Error("\"schemaPath\", \"errSchemaPath\" and \"topSchemaRef\" are required with \"schema\"");
			return {
				schema: schema$1,
				schemaPath,
				topSchemaRef,
				errSchemaPath
			};
		}
		throw new Error("either \"keyword\" or \"schema\" must be passed");
	}
	exports.getSubschema = getSubschema$1;
	function extendSubschemaData$1(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
		if (data !== void 0 && dataProp !== void 0) throw new Error("both \"data\" and \"dataProp\" passed, only one allowed");
		const { gen } = it;
		if (dataProp !== void 0) {
			const { errorPath, dataPathArr, opts } = it;
			const nextData = gen.let("data", (0, codegen_1$71._)`${it.data}${(0, codegen_1$71.getProperty)(dataProp)}`, true);
			dataContextProps(nextData);
			subschema.errorPath = (0, codegen_1$71.str)`${errorPath}${(0, util_1$59.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
			subschema.parentDataProperty = (0, codegen_1$71._)`${dataProp}`;
			subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
		}
		if (data !== void 0) {
			const nextData = data instanceof codegen_1$71.Name ? data : gen.let("data", data, true);
			dataContextProps(nextData);
			if (propertyName !== void 0) subschema.propertyName = propertyName;
		}
		if (dataTypes) subschema.dataTypes = dataTypes;
		function dataContextProps(_nextData) {
			subschema.data = _nextData;
			subschema.dataLevel = it.dataLevel + 1;
			subschema.dataTypes = [];
			it.definedProperties = /* @__PURE__ */ new Set();
			subschema.parentData = it.data;
			subschema.dataNames = [...it.dataNames, _nextData];
		}
	}
	exports.extendSubschemaData = extendSubschemaData$1;
	function extendSubschemaMode$1(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
		if (compositeRule !== void 0) subschema.compositeRule = compositeRule;
		if (createErrors !== void 0) subschema.createErrors = createErrors;
		if (allErrors !== void 0) subschema.allErrors = allErrors;
		subschema.jtdDiscriminator = jtdDiscriminator;
		subschema.jtdMetadata = jtdMetadata;
	}
	exports.extendSubschemaMode = extendSubschemaMode$1;
} });

//#endregion
//#region ../node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({ "../node_modules/fast-deep-equal/index.js"(exports, module) {
	module.exports = function equal$5(a, b) {
		if (a === b) return true;
		if (a && b && typeof a == "object" && typeof b == "object") {
			if (a.constructor !== b.constructor) return false;
			var length, i, keys;
			if (Array.isArray(a)) {
				length = a.length;
				if (length != b.length) return false;
				for (i = length; i-- !== 0;) if (!equal$5(a[i], b[i])) return false;
				return true;
			}
			if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
			if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
			if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
			keys = Object.keys(a);
			length = keys.length;
			if (length !== Object.keys(b).length) return false;
			for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
			for (i = length; i-- !== 0;) {
				var key = keys[i];
				if (!equal$5(a[key], b[key])) return false;
			}
			return true;
		}
		return a !== a && b !== b;
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/json-schema-traverse/index.js
var require_json_schema_traverse$1 = __commonJS({ "../packages/vovk-ajv/node_modules/json-schema-traverse/index.js"(exports, module) {
	var traverse$3 = module.exports = function(schema$1, opts, cb) {
		if (typeof opts == "function") {
			cb = opts;
			opts = {};
		}
		cb = opts.cb || cb;
		var pre = typeof cb == "function" ? cb : cb.pre || function() {};
		var post = cb.post || function() {};
		_traverse$1(opts, pre, post, schema$1, "", schema$1);
	};
	traverse$3.keywords = {
		additionalItems: true,
		items: true,
		contains: true,
		additionalProperties: true,
		propertyNames: true,
		not: true,
		if: true,
		then: true,
		else: true
	};
	traverse$3.arrayKeywords = {
		items: true,
		allOf: true,
		anyOf: true,
		oneOf: true
	};
	traverse$3.propsKeywords = {
		$defs: true,
		definitions: true,
		properties: true,
		patternProperties: true,
		dependencies: true
	};
	traverse$3.skipKeywords = {
		default: true,
		enum: true,
		const: true,
		required: true,
		maximum: true,
		minimum: true,
		exclusiveMaximum: true,
		exclusiveMinimum: true,
		multipleOf: true,
		maxLength: true,
		minLength: true,
		pattern: true,
		format: true,
		maxItems: true,
		minItems: true,
		uniqueItems: true,
		maxProperties: true,
		minProperties: true
	};
	function _traverse$1(opts, pre, post, schema$1, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
		if (schema$1 && typeof schema$1 == "object" && !Array.isArray(schema$1)) {
			pre(schema$1, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
			for (var key in schema$1) {
				var sch = schema$1[key];
				if (Array.isArray(sch)) {
					if (key in traverse$3.arrayKeywords) for (var i = 0; i < sch.length; i++) _traverse$1(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema$1, i);
				} else if (key in traverse$3.propsKeywords) {
					if (sch && typeof sch == "object") for (var prop in sch) _traverse$1(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr$1(prop), rootSchema, jsonPtr, key, schema$1, prop);
				} else if (key in traverse$3.keywords || opts.allKeys && !(key in traverse$3.skipKeywords)) _traverse$1(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema$1);
			}
			post(schema$1, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
		}
	}
	function escapeJsonPtr$1(str$2) {
		return str$2.replace(/~/g, "~0").replace(/\//g, "~1");
	}
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/resolve.js
var require_resolve$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/resolve.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
	const util_1$58 = require_util$1();
	const equal$4 = require_fast_deep_equal();
	const traverse$2 = require_json_schema_traverse$1();
	const SIMPLE_INLINED$1 = new Set([
		"type",
		"format",
		"pattern",
		"maxLength",
		"minLength",
		"maxProperties",
		"minProperties",
		"maxItems",
		"minItems",
		"maximum",
		"minimum",
		"uniqueItems",
		"multipleOf",
		"required",
		"enum",
		"const"
	]);
	function inlineRef$1(schema$1, limit = true) {
		if (typeof schema$1 == "boolean") return true;
		if (limit === true) return !hasRef$1(schema$1);
		if (!limit) return false;
		return countKeys$1(schema$1) <= limit;
	}
	exports.inlineRef = inlineRef$1;
	const REF_KEYWORDS$1 = new Set([
		"$ref",
		"$recursiveRef",
		"$recursiveAnchor",
		"$dynamicRef",
		"$dynamicAnchor"
	]);
	function hasRef$1(schema$1) {
		for (const key in schema$1) {
			if (REF_KEYWORDS$1.has(key)) return true;
			const sch = schema$1[key];
			if (Array.isArray(sch) && sch.some(hasRef$1)) return true;
			if (typeof sch == "object" && hasRef$1(sch)) return true;
		}
		return false;
	}
	function countKeys$1(schema$1) {
		let count = 0;
		for (const key in schema$1) {
			if (key === "$ref") return Infinity;
			count++;
			if (SIMPLE_INLINED$1.has(key)) continue;
			if (typeof schema$1[key] == "object") (0, util_1$58.eachItem)(schema$1[key], (sch) => count += countKeys$1(sch));
			if (count === Infinity) return Infinity;
		}
		return count;
	}
	function getFullPath$1(resolver, id = "", normalize$1) {
		if (normalize$1 !== false) id = normalizeId$1(id);
		const p = resolver.parse(id);
		return _getFullPath$1(resolver, p);
	}
	exports.getFullPath = getFullPath$1;
	function _getFullPath$1(resolver, p) {
		const serialized = resolver.serialize(p);
		return serialized.split("#")[0] + "#";
	}
	exports._getFullPath = _getFullPath$1;
	const TRAILING_SLASH_HASH$1 = /#\/?$/;
	function normalizeId$1(id) {
		return id ? id.replace(TRAILING_SLASH_HASH$1, "") : "";
	}
	exports.normalizeId = normalizeId$1;
	function resolveUrl$1(resolver, baseId, id) {
		id = normalizeId$1(id);
		return resolver.resolve(baseId, id);
	}
	exports.resolveUrl = resolveUrl$1;
	const ANCHOR$1 = /^[a-z_][-a-z0-9._]*$/i;
	function getSchemaRefs$1(schema$1, baseId) {
		if (typeof schema$1 == "boolean") return {};
		const { schemaId, uriResolver } = this.opts;
		const schId = normalizeId$1(schema$1[schemaId] || baseId);
		const baseIds = { "": schId };
		const pathPrefix = getFullPath$1(uriResolver, schId, false);
		const localRefs = {};
		const schemaRefs = /* @__PURE__ */ new Set();
		traverse$2(schema$1, { allKeys: true }, (sch, jsonPtr, _$2, parentJsonPtr) => {
			if (parentJsonPtr === void 0) return;
			const fullPath = pathPrefix + jsonPtr;
			let innerBaseId = baseIds[parentJsonPtr];
			if (typeof sch[schemaId] == "string") innerBaseId = addRef.call(this, sch[schemaId]);
			addAnchor.call(this, sch.$anchor);
			addAnchor.call(this, sch.$dynamicAnchor);
			baseIds[jsonPtr] = innerBaseId;
			function addRef(ref) {
				const _resolve = this.opts.uriResolver.resolve;
				ref = normalizeId$1(innerBaseId ? _resolve(innerBaseId, ref) : ref);
				if (schemaRefs.has(ref)) throw ambiguos(ref);
				schemaRefs.add(ref);
				let schOrRef = this.refs[ref];
				if (typeof schOrRef == "string") schOrRef = this.refs[schOrRef];
				if (typeof schOrRef == "object") checkAmbiguosRef(sch, schOrRef.schema, ref);
				else if (ref !== normalizeId$1(fullPath)) if (ref[0] === "#") {
					checkAmbiguosRef(sch, localRefs[ref], ref);
					localRefs[ref] = sch;
				} else this.refs[ref] = fullPath;
				return ref;
			}
			function addAnchor(anchor) {
				if (typeof anchor == "string") {
					if (!ANCHOR$1.test(anchor)) throw new Error(`invalid anchor "${anchor}"`);
					addRef.call(this, `#${anchor}`);
				}
			}
		});
		return localRefs;
		function checkAmbiguosRef(sch1, sch2, ref) {
			if (sch2 !== void 0 && !equal$4(sch1, sch2)) throw ambiguos(ref);
		}
		function ambiguos(ref) {
			return new Error(`reference "${ref}" resolves to more than one schema`);
		}
	}
	exports.getSchemaRefs = getSchemaRefs$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/index.js
var require_validate$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/validate/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
	const boolSchema_1$1 = require_boolSchema$1();
	const dataType_1$5 = require_dataType$1();
	const applicability_1$2 = require_applicability$1();
	const dataType_2$1 = require_dataType$1();
	const defaults_1$1 = require_defaults$1();
	const keyword_1$1 = require_keyword$1();
	const subschema_1$1 = require_subschema$1();
	const codegen_1$70 = require_codegen$1();
	const names_1$15 = require_names$1();
	const resolve_1$7 = require_resolve$1();
	const util_1$57 = require_util$1();
	const errors_1$5 = require_errors$1();
	function validateFunctionCode$1(it) {
		if (isSchemaObj$1(it)) {
			checkKeywords$1(it);
			if (schemaCxtHasRules$1(it)) {
				topSchemaObjCode$1(it);
				return;
			}
		}
		validateFunction$1(it, () => (0, boolSchema_1$1.topBoolOrEmptySchema)(it));
	}
	exports.validateFunctionCode = validateFunctionCode$1;
	function validateFunction$1({ gen, validateName, schema: schema$1, schemaEnv, opts }, body) {
		if (opts.code.es5) gen.func(validateName, (0, codegen_1$70._)`${names_1$15.default.data}, ${names_1$15.default.valCxt}`, schemaEnv.$async, () => {
			gen.code((0, codegen_1$70._)`"use strict"; ${funcSourceUrl$1(schema$1, opts)}`);
			destructureValCxtES5$1(gen, opts);
			gen.code(body);
		});
		else gen.func(validateName, (0, codegen_1$70._)`${names_1$15.default.data}, ${destructureValCxt$1(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl$1(schema$1, opts)).code(body));
	}
	function destructureValCxt$1(opts) {
		return (0, codegen_1$70._)`{${names_1$15.default.instancePath}="", ${names_1$15.default.parentData}, ${names_1$15.default.parentDataProperty}, ${names_1$15.default.rootData}=${names_1$15.default.data}${opts.dynamicRef ? (0, codegen_1$70._)`, ${names_1$15.default.dynamicAnchors}={}` : codegen_1$70.nil}}={}`;
	}
	function destructureValCxtES5$1(gen, opts) {
		gen.if(names_1$15.default.valCxt, () => {
			gen.var(names_1$15.default.instancePath, (0, codegen_1$70._)`${names_1$15.default.valCxt}.${names_1$15.default.instancePath}`);
			gen.var(names_1$15.default.parentData, (0, codegen_1$70._)`${names_1$15.default.valCxt}.${names_1$15.default.parentData}`);
			gen.var(names_1$15.default.parentDataProperty, (0, codegen_1$70._)`${names_1$15.default.valCxt}.${names_1$15.default.parentDataProperty}`);
			gen.var(names_1$15.default.rootData, (0, codegen_1$70._)`${names_1$15.default.valCxt}.${names_1$15.default.rootData}`);
			if (opts.dynamicRef) gen.var(names_1$15.default.dynamicAnchors, (0, codegen_1$70._)`${names_1$15.default.valCxt}.${names_1$15.default.dynamicAnchors}`);
		}, () => {
			gen.var(names_1$15.default.instancePath, (0, codegen_1$70._)`""`);
			gen.var(names_1$15.default.parentData, (0, codegen_1$70._)`undefined`);
			gen.var(names_1$15.default.parentDataProperty, (0, codegen_1$70._)`undefined`);
			gen.var(names_1$15.default.rootData, names_1$15.default.data);
			if (opts.dynamicRef) gen.var(names_1$15.default.dynamicAnchors, (0, codegen_1$70._)`{}`);
		});
	}
	function topSchemaObjCode$1(it) {
		const { schema: schema$1, opts, gen } = it;
		validateFunction$1(it, () => {
			if (opts.$comment && schema$1.$comment) commentKeyword$1(it);
			checkNoDefault$1(it);
			gen.let(names_1$15.default.vErrors, null);
			gen.let(names_1$15.default.errors, 0);
			if (opts.unevaluated) resetEvaluated$1(it);
			typeAndKeywords$1(it);
			returnResults$1(it);
		});
		return;
	}
	function resetEvaluated$1(it) {
		const { gen, validateName } = it;
		it.evaluated = gen.const("evaluated", (0, codegen_1$70._)`${validateName}.evaluated`);
		gen.if((0, codegen_1$70._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1$70._)`${it.evaluated}.props`, (0, codegen_1$70._)`undefined`));
		gen.if((0, codegen_1$70._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1$70._)`${it.evaluated}.items`, (0, codegen_1$70._)`undefined`));
	}
	function funcSourceUrl$1(schema$1, opts) {
		const schId = typeof schema$1 == "object" && schema$1[opts.schemaId];
		return schId && (opts.code.source || opts.code.process) ? (0, codegen_1$70._)`/*# sourceURL=${schId} */` : codegen_1$70.nil;
	}
	function subschemaCode$1(it, valid) {
		if (isSchemaObj$1(it)) {
			checkKeywords$1(it);
			if (schemaCxtHasRules$1(it)) {
				subSchemaObjCode$1(it, valid);
				return;
			}
		}
		(0, boolSchema_1$1.boolOrEmptySchema)(it, valid);
	}
	function schemaCxtHasRules$1({ schema: schema$1, self }) {
		if (typeof schema$1 == "boolean") return !schema$1;
		for (const key in schema$1) if (self.RULES.all[key]) return true;
		return false;
	}
	function isSchemaObj$1(it) {
		return typeof it.schema != "boolean";
	}
	function subSchemaObjCode$1(it, valid) {
		const { schema: schema$1, gen, opts } = it;
		if (opts.$comment && schema$1.$comment) commentKeyword$1(it);
		updateContext$1(it);
		checkAsyncSchema$1(it);
		const errsCount = gen.const("_errs", names_1$15.default.errors);
		typeAndKeywords$1(it, errsCount);
		gen.var(valid, (0, codegen_1$70._)`${errsCount} === ${names_1$15.default.errors}`);
	}
	function checkKeywords$1(it) {
		(0, util_1$57.checkUnknownRules)(it);
		checkRefsAndKeywords$1(it);
	}
	function typeAndKeywords$1(it, errsCount) {
		if (it.opts.jtd) return schemaKeywords$1(it, [], false, errsCount);
		const types = (0, dataType_1$5.getSchemaTypes)(it.schema);
		const checkedTypes = (0, dataType_1$5.coerceAndCheckDataType)(it, types);
		schemaKeywords$1(it, types, !checkedTypes, errsCount);
	}
	function checkRefsAndKeywords$1(it) {
		const { schema: schema$1, errSchemaPath, opts, self } = it;
		if (schema$1.$ref && opts.ignoreKeywordsWithRef && (0, util_1$57.schemaHasRulesButRef)(schema$1, self.RULES)) self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
	}
	function checkNoDefault$1(it) {
		const { schema: schema$1, opts } = it;
		if (schema$1.default !== void 0 && opts.useDefaults && opts.strictSchema) (0, util_1$57.checkStrictMode)(it, "default is ignored in the schema root");
	}
	function updateContext$1(it) {
		const schId = it.schema[it.opts.schemaId];
		if (schId) it.baseId = (0, resolve_1$7.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
	}
	function checkAsyncSchema$1(it) {
		if (it.schema.$async && !it.schemaEnv.$async) throw new Error("async schema in sync schema");
	}
	function commentKeyword$1({ gen, schemaEnv, schema: schema$1, errSchemaPath, opts }) {
		const msg = schema$1.$comment;
		if (opts.$comment === true) gen.code((0, codegen_1$70._)`${names_1$15.default.self}.logger.log(${msg})`);
		else if (typeof opts.$comment == "function") {
			const schemaPath = (0, codegen_1$70.str)`${errSchemaPath}/$comment`;
			const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
			gen.code((0, codegen_1$70._)`${names_1$15.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
		}
	}
	function returnResults$1(it) {
		const { gen, schemaEnv, validateName, ValidationError: ValidationError$2, opts } = it;
		if (schemaEnv.$async) gen.if((0, codegen_1$70._)`${names_1$15.default.errors} === 0`, () => gen.return(names_1$15.default.data), () => gen.throw((0, codegen_1$70._)`new ${ValidationError$2}(${names_1$15.default.vErrors})`));
		else {
			gen.assign((0, codegen_1$70._)`${validateName}.errors`, names_1$15.default.vErrors);
			if (opts.unevaluated) assignEvaluated$1(it);
			gen.return((0, codegen_1$70._)`${names_1$15.default.errors} === 0`);
		}
	}
	function assignEvaluated$1({ gen, evaluated, props, items }) {
		if (props instanceof codegen_1$70.Name) gen.assign((0, codegen_1$70._)`${evaluated}.props`, props);
		if (items instanceof codegen_1$70.Name) gen.assign((0, codegen_1$70._)`${evaluated}.items`, items);
	}
	function schemaKeywords$1(it, types, typeErrors, errsCount) {
		const { gen, schema: schema$1, data, allErrors, opts, self } = it;
		const { RULES } = self;
		if (schema$1.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1$57.schemaHasRulesButRef)(schema$1, RULES))) {
			gen.block(() => keywordCode$1(it, "$ref", RULES.all.$ref.definition));
			return;
		}
		if (!opts.jtd) checkStrictTypes$1(it, types);
		gen.block(() => {
			for (const group of RULES.rules) groupKeywords(group);
			groupKeywords(RULES.post);
		});
		function groupKeywords(group) {
			if (!(0, applicability_1$2.shouldUseGroup)(schema$1, group)) return;
			if (group.type) {
				gen.if((0, dataType_2$1.checkDataType)(group.type, data, opts.strictNumbers));
				iterateKeywords$1(it, group);
				if (types.length === 1 && types[0] === group.type && typeErrors) {
					gen.else();
					(0, dataType_2$1.reportTypeError)(it);
				}
				gen.endIf();
			} else iterateKeywords$1(it, group);
			if (!allErrors) gen.if((0, codegen_1$70._)`${names_1$15.default.errors} === ${errsCount || 0}`);
		}
	}
	function iterateKeywords$1(it, group) {
		const { gen, schema: schema$1, opts: { useDefaults } } = it;
		if (useDefaults) (0, defaults_1$1.assignDefaults)(it, group.type);
		gen.block(() => {
			for (const rule of group.rules) if ((0, applicability_1$2.shouldUseRule)(schema$1, rule)) keywordCode$1(it, rule.keyword, rule.definition, group.type);
		});
	}
	function checkStrictTypes$1(it, types) {
		if (it.schemaEnv.meta || !it.opts.strictTypes) return;
		checkContextTypes$1(it, types);
		if (!it.opts.allowUnionTypes) checkMultipleTypes$1(it, types);
		checkKeywordTypes$1(it, it.dataTypes);
	}
	function checkContextTypes$1(it, types) {
		if (!types.length) return;
		if (!it.dataTypes.length) {
			it.dataTypes = types;
			return;
		}
		types.forEach((t) => {
			if (!includesType$1(it.dataTypes, t)) strictTypesError$1(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
		});
		narrowSchemaTypes$1(it, types);
	}
	function checkMultipleTypes$1(it, ts) {
		if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) strictTypesError$1(it, "use allowUnionTypes to allow union type keyword");
	}
	function checkKeywordTypes$1(it, ts) {
		const rules = it.self.RULES.all;
		for (const keyword$1 in rules) {
			const rule = rules[keyword$1];
			if (typeof rule == "object" && (0, applicability_1$2.shouldUseRule)(it.schema, rule)) {
				const { type } = rule.definition;
				if (type.length && !type.some((t) => hasApplicableType$1(ts, t))) strictTypesError$1(it, `missing type "${type.join(",")}" for keyword "${keyword$1}"`);
			}
		}
	}
	function hasApplicableType$1(schTs, kwdT) {
		return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
	}
	function includesType$1(ts, t) {
		return ts.includes(t) || t === "integer" && ts.includes("number");
	}
	function narrowSchemaTypes$1(it, withTypes) {
		const ts = [];
		for (const t of it.dataTypes) if (includesType$1(withTypes, t)) ts.push(t);
		else if (withTypes.includes("integer") && t === "number") ts.push("integer");
		it.dataTypes = ts;
	}
	function strictTypesError$1(it, msg) {
		const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
		msg += ` at "${schemaPath}" (strictTypes)`;
		(0, util_1$57.checkStrictMode)(it, msg, it.opts.strictTypes);
	}
	var KeywordCxt$1 = class {
		constructor(it, def$69, keyword$1) {
			(0, keyword_1$1.validateKeywordUsage)(it, def$69, keyword$1);
			this.gen = it.gen;
			this.allErrors = it.allErrors;
			this.keyword = keyword$1;
			this.data = it.data;
			this.schema = it.schema[keyword$1];
			this.$data = def$69.$data && it.opts.$data && this.schema && this.schema.$data;
			this.schemaValue = (0, util_1$57.schemaRefOrVal)(it, this.schema, keyword$1, this.$data);
			this.schemaType = def$69.schemaType;
			this.parentSchema = it.schema;
			this.params = {};
			this.it = it;
			this.def = def$69;
			if (this.$data) this.schemaCode = it.gen.const("vSchema", getData$1(this.$data, it));
			else {
				this.schemaCode = this.schemaValue;
				if (!(0, keyword_1$1.validSchemaType)(this.schema, def$69.schemaType, def$69.allowUndefined)) throw new Error(`${keyword$1} value must be ${JSON.stringify(def$69.schemaType)}`);
			}
			if ("code" in def$69 ? def$69.trackErrors : def$69.errors !== false) this.errsCount = it.gen.const("_errs", names_1$15.default.errors);
		}
		result(condition, successAction, failAction) {
			this.failResult((0, codegen_1$70.not)(condition), successAction, failAction);
		}
		failResult(condition, successAction, failAction) {
			this.gen.if(condition);
			if (failAction) failAction();
			else this.error();
			if (successAction) {
				this.gen.else();
				successAction();
				if (this.allErrors) this.gen.endIf();
			} else if (this.allErrors) this.gen.endIf();
			else this.gen.else();
		}
		pass(condition, failAction) {
			this.failResult((0, codegen_1$70.not)(condition), void 0, failAction);
		}
		fail(condition) {
			if (condition === void 0) {
				this.error();
				if (!this.allErrors) this.gen.if(false);
				return;
			}
			this.gen.if(condition);
			this.error();
			if (this.allErrors) this.gen.endIf();
			else this.gen.else();
		}
		fail$data(condition) {
			if (!this.$data) return this.fail(condition);
			const { schemaCode } = this;
			this.fail((0, codegen_1$70._)`${schemaCode} !== undefined && (${(0, codegen_1$70.or)(this.invalid$data(), condition)})`);
		}
		error(append, errorParams, errorPaths) {
			if (errorParams) {
				this.setParams(errorParams);
				this._error(append, errorPaths);
				this.setParams({});
				return;
			}
			this._error(append, errorPaths);
		}
		_error(append, errorPaths) {
			(append ? errors_1$5.reportExtraError : errors_1$5.reportError)(this, this.def.error, errorPaths);
		}
		$dataError() {
			(0, errors_1$5.reportError)(this, this.def.$dataError || errors_1$5.keyword$DataError);
		}
		reset() {
			if (this.errsCount === void 0) throw new Error("add \"trackErrors\" to keyword definition");
			(0, errors_1$5.resetErrorsCount)(this.gen, this.errsCount);
		}
		ok(cond) {
			if (!this.allErrors) this.gen.if(cond);
		}
		setParams(obj, assign) {
			if (assign) Object.assign(this.params, obj);
			else this.params = obj;
		}
		block$data(valid, codeBlock, $dataValid = codegen_1$70.nil) {
			this.gen.block(() => {
				this.check$data(valid, $dataValid);
				codeBlock();
			});
		}
		check$data(valid = codegen_1$70.nil, $dataValid = codegen_1$70.nil) {
			if (!this.$data) return;
			const { gen, schemaCode, schemaType, def: def$69 } = this;
			gen.if((0, codegen_1$70.or)((0, codegen_1$70._)`${schemaCode} === undefined`, $dataValid));
			if (valid !== codegen_1$70.nil) gen.assign(valid, true);
			if (schemaType.length || def$69.validateSchema) {
				gen.elseIf(this.invalid$data());
				this.$dataError();
				if (valid !== codegen_1$70.nil) gen.assign(valid, false);
			}
			gen.else();
		}
		invalid$data() {
			const { gen, schemaCode, schemaType, def: def$69, it } = this;
			return (0, codegen_1$70.or)(wrong$DataType(), invalid$DataSchema());
			function wrong$DataType() {
				if (schemaType.length) {
					/* istanbul ignore if */
					if (!(schemaCode instanceof codegen_1$70.Name)) throw new Error("ajv implementation error");
					const st = Array.isArray(schemaType) ? schemaType : [schemaType];
					return (0, codegen_1$70._)`${(0, dataType_2$1.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2$1.DataType.Wrong)}`;
				}
				return codegen_1$70.nil;
			}
			function invalid$DataSchema() {
				if (def$69.validateSchema) {
					const validateSchemaRef = gen.scopeValue("validate$data", { ref: def$69.validateSchema });
					return (0, codegen_1$70._)`!${validateSchemaRef}(${schemaCode})`;
				}
				return codegen_1$70.nil;
			}
		}
		subschema(appl, valid) {
			const subschema = (0, subschema_1$1.getSubschema)(this.it, appl);
			(0, subschema_1$1.extendSubschemaData)(subschema, this.it, appl);
			(0, subschema_1$1.extendSubschemaMode)(subschema, appl);
			const nextContext = {
				...this.it,
				...subschema,
				items: void 0,
				props: void 0
			};
			subschemaCode$1(nextContext, valid);
			return nextContext;
		}
		mergeEvaluated(schemaCxt, toName) {
			const { it, gen } = this;
			if (!it.opts.unevaluated) return;
			if (it.props !== true && schemaCxt.props !== void 0) it.props = util_1$57.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
			if (it.items !== true && schemaCxt.items !== void 0) it.items = util_1$57.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
		}
		mergeValidEvaluated(schemaCxt, valid) {
			const { it, gen } = this;
			if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
				gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1$70.Name));
				return true;
			}
		}
	};
	exports.KeywordCxt = KeywordCxt$1;
	function keywordCode$1(it, keyword$1, def$69, ruleType) {
		const cxt = new KeywordCxt$1(it, def$69, keyword$1);
		if ("code" in def$69) def$69.code(cxt, ruleType);
		else if (cxt.$data && def$69.validate) (0, keyword_1$1.funcKeywordCode)(cxt, def$69);
		else if ("macro" in def$69) (0, keyword_1$1.macroKeywordCode)(cxt, def$69);
		else if (def$69.compile || def$69.validate) (0, keyword_1$1.funcKeywordCode)(cxt, def$69);
	}
	const JSON_POINTER$1 = /^\/(?:[^~]|~0|~1)*$/;
	const RELATIVE_JSON_POINTER$1 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
	function getData$1($data, { dataLevel, dataNames, dataPathArr }) {
		let jsonPointer;
		let data;
		if ($data === "") return names_1$15.default.rootData;
		if ($data[0] === "/") {
			if (!JSON_POINTER$1.test($data)) throw new Error(`Invalid JSON-pointer: ${$data}`);
			jsonPointer = $data;
			data = names_1$15.default.rootData;
		} else {
			const matches = RELATIVE_JSON_POINTER$1.exec($data);
			if (!matches) throw new Error(`Invalid JSON-pointer: ${$data}`);
			const up = +matches[1];
			jsonPointer = matches[2];
			if (jsonPointer === "#") {
				if (up >= dataLevel) throw new Error(errorMsg("property/index", up));
				return dataPathArr[dataLevel - up];
			}
			if (up > dataLevel) throw new Error(errorMsg("data", up));
			data = dataNames[dataLevel - up];
			if (!jsonPointer) return data;
		}
		let expr = data;
		const segments$1 = jsonPointer.split("/");
		for (const segment of segments$1) if (segment) {
			data = (0, codegen_1$70._)`${data}${(0, codegen_1$70.getProperty)((0, util_1$57.unescapeJsonPointer)(segment))}`;
			expr = (0, codegen_1$70._)`${expr} && ${data}`;
		}
		return expr;
		function errorMsg(pointerType, up) {
			return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
		}
	}
	exports.getData = getData$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/runtime/validation_error.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	var ValidationError$1 = class extends Error {
		constructor(errors) {
			super("validation failed");
			this.errors = errors;
			this.ajv = this.validation = true;
		}
	};
	exports.default = ValidationError$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/ref_error.js
var require_ref_error$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/ref_error.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const resolve_1$6 = require_resolve$1();
	var MissingRefError$1 = class extends Error {
		constructor(resolver, baseId, ref, msg) {
			super(msg || `can't resolve reference ${ref} from id ${baseId}`);
			this.missingRef = (0, resolve_1$6.resolveUrl)(resolver, baseId, ref);
			this.missingSchema = (0, resolve_1$6.normalizeId)((0, resolve_1$6.getFullPath)(resolver, this.missingRef));
		}
	};
	exports.default = MissingRefError$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/compile/index.js
var require_compile$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/compile/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
	const codegen_1$69 = require_codegen$1();
	const validation_error_1$6 = require_validation_error$1();
	const names_1$14 = require_names$1();
	const resolve_1$5 = require_resolve$1();
	const util_1$56 = require_util$1();
	const validate_1$9 = require_validate$1();
	var SchemaEnv$1 = class {
		constructor(env) {
			var _a$4;
			this.refs = {};
			this.dynamicAnchors = {};
			let schema$1;
			if (typeof env.schema == "object") schema$1 = env.schema;
			this.schema = env.schema;
			this.schemaId = env.schemaId;
			this.root = env.root || this;
			this.baseId = (_a$4 = env.baseId) !== null && _a$4 !== void 0 ? _a$4 : (0, resolve_1$5.normalizeId)(schema$1 === null || schema$1 === void 0 ? void 0 : schema$1[env.schemaId || "$id"]);
			this.schemaPath = env.schemaPath;
			this.localRefs = env.localRefs;
			this.meta = env.meta;
			this.$async = schema$1 === null || schema$1 === void 0 ? void 0 : schema$1.$async;
			this.refs = {};
		}
	};
	exports.SchemaEnv = SchemaEnv$1;
	function compileSchema$1(sch) {
		const _sch = getCompilingSchema$1.call(this, sch);
		if (_sch) return _sch;
		const rootId = (0, resolve_1$5.getFullPath)(this.opts.uriResolver, sch.root.baseId);
		const { es5, lines } = this.opts.code;
		const { ownProperties } = this.opts;
		const gen = new codegen_1$69.CodeGen(this.scope, {
			es5,
			lines,
			ownProperties
		});
		let _ValidationError;
		if (sch.$async) _ValidationError = gen.scopeValue("Error", {
			ref: validation_error_1$6.default,
			code: (0, codegen_1$69._)`require("ajv/dist/runtime/validation_error").default`
		});
		const validateName = gen.scopeName("validate");
		sch.validateName = validateName;
		const schemaCxt = {
			gen,
			allErrors: this.opts.allErrors,
			data: names_1$14.default.data,
			parentData: names_1$14.default.parentData,
			parentDataProperty: names_1$14.default.parentDataProperty,
			dataNames: [names_1$14.default.data],
			dataPathArr: [codegen_1$69.nil],
			dataLevel: 0,
			dataTypes: [],
			definedProperties: /* @__PURE__ */ new Set(),
			topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? {
				ref: sch.schema,
				code: (0, codegen_1$69.stringify)(sch.schema)
			} : { ref: sch.schema }),
			validateName,
			ValidationError: _ValidationError,
			schema: sch.schema,
			schemaEnv: sch,
			rootId,
			baseId: sch.baseId || rootId,
			schemaPath: codegen_1$69.nil,
			errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
			errorPath: (0, codegen_1$69._)`""`,
			opts: this.opts,
			self: this
		};
		let sourceCode;
		try {
			this._compilations.add(sch);
			(0, validate_1$9.validateFunctionCode)(schemaCxt);
			gen.optimize(this.opts.code.optimize);
			const validateCode = gen.toString();
			sourceCode = `${gen.scopeRefs(names_1$14.default.scope)}return ${validateCode}`;
			if (this.opts.code.process) sourceCode = this.opts.code.process(sourceCode, sch);
			const makeValidate = new Function(`${names_1$14.default.self}`, `${names_1$14.default.scope}`, sourceCode);
			const validate$1 = makeValidate(this, this.scope.get());
			this.scope.value(validateName, { ref: validate$1 });
			validate$1.errors = null;
			validate$1.schema = sch.schema;
			validate$1.schemaEnv = sch;
			if (sch.$async) validate$1.$async = true;
			if (this.opts.code.source === true) validate$1.source = {
				validateName,
				validateCode,
				scopeValues: gen._values
			};
			if (this.opts.unevaluated) {
				const { props, items } = schemaCxt;
				validate$1.evaluated = {
					props: props instanceof codegen_1$69.Name ? void 0 : props,
					items: items instanceof codegen_1$69.Name ? void 0 : items,
					dynamicProps: props instanceof codegen_1$69.Name,
					dynamicItems: items instanceof codegen_1$69.Name
				};
				if (validate$1.source) validate$1.source.evaluated = (0, codegen_1$69.stringify)(validate$1.evaluated);
			}
			sch.validate = validate$1;
			return sch;
		} catch (e) {
			delete sch.validate;
			delete sch.validateName;
			if (sourceCode) this.logger.error("Error compiling schema, function code:", sourceCode);
			throw e;
		} finally {
			this._compilations.delete(sch);
		}
	}
	exports.compileSchema = compileSchema$1;
	function resolveRef$3(root, baseId, ref) {
		var _a$4;
		ref = (0, resolve_1$5.resolveUrl)(this.opts.uriResolver, baseId, ref);
		const schOrFunc = root.refs[ref];
		if (schOrFunc) return schOrFunc;
		let _sch = resolve$2.call(this, root, ref);
		if (_sch === void 0) {
			const schema$1 = (_a$4 = root.localRefs) === null || _a$4 === void 0 ? void 0 : _a$4[ref];
			const { schemaId } = this.opts;
			if (schema$1) _sch = new SchemaEnv$1({
				schema: schema$1,
				schemaId,
				root,
				baseId
			});
		}
		if (_sch === void 0) return;
		return root.refs[ref] = inlineOrCompile$1.call(this, _sch);
	}
	exports.resolveRef = resolveRef$3;
	function inlineOrCompile$1(sch) {
		if ((0, resolve_1$5.inlineRef)(sch.schema, this.opts.inlineRefs)) return sch.schema;
		return sch.validate ? sch : compileSchema$1.call(this, sch);
	}
	function getCompilingSchema$1(schEnv) {
		for (const sch of this._compilations) if (sameSchemaEnv$1(sch, schEnv)) return sch;
	}
	exports.getCompilingSchema = getCompilingSchema$1;
	function sameSchemaEnv$1(s1, s2) {
		return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
	}
	function resolve$2(root, ref) {
		let sch;
		while (typeof (sch = this.refs[ref]) == "string") ref = sch;
		return sch || this.schemas[ref] || resolveSchema$1.call(this, root, ref);
	}
	function resolveSchema$1(root, ref) {
		const p = this.opts.uriResolver.parse(ref);
		const refPath = (0, resolve_1$5._getFullPath)(this.opts.uriResolver, p);
		let baseId = (0, resolve_1$5.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
		if (Object.keys(root.schema).length > 0 && refPath === baseId) return getJsonPointer$1.call(this, p, root);
		const id = (0, resolve_1$5.normalizeId)(refPath);
		const schOrRef = this.refs[id] || this.schemas[id];
		if (typeof schOrRef == "string") {
			const sch = resolveSchema$1.call(this, root, schOrRef);
			if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object") return;
			return getJsonPointer$1.call(this, p, sch);
		}
		if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object") return;
		if (!schOrRef.validate) compileSchema$1.call(this, schOrRef);
		if (id === (0, resolve_1$5.normalizeId)(ref)) {
			const { schema: schema$1 } = schOrRef;
			const { schemaId } = this.opts;
			const schId = schema$1[schemaId];
			if (schId) baseId = (0, resolve_1$5.resolveUrl)(this.opts.uriResolver, baseId, schId);
			return new SchemaEnv$1({
				schema: schema$1,
				schemaId,
				root,
				baseId
			});
		}
		return getJsonPointer$1.call(this, p, schOrRef);
	}
	exports.resolveSchema = resolveSchema$1;
	const PREVENT_SCOPE_CHANGE$1 = new Set([
		"properties",
		"patternProperties",
		"enum",
		"dependencies",
		"definitions"
	]);
	function getJsonPointer$1(parsedRef, { baseId, schema: schema$1, root }) {
		var _a$4;
		if (((_a$4 = parsedRef.fragment) === null || _a$4 === void 0 ? void 0 : _a$4[0]) !== "/") return;
		for (const part of parsedRef.fragment.slice(1).split("/")) {
			if (typeof schema$1 === "boolean") return;
			const partSchema = schema$1[(0, util_1$56.unescapeFragment)(part)];
			if (partSchema === void 0) return;
			schema$1 = partSchema;
			const schId = typeof schema$1 === "object" && schema$1[this.opts.schemaId];
			if (!PREVENT_SCOPE_CHANGE$1.has(part) && schId) baseId = (0, resolve_1$5.resolveUrl)(this.opts.uriResolver, baseId, schId);
		}
		let env;
		if (typeof schema$1 != "boolean" && schema$1.$ref && !(0, util_1$56.schemaHasRulesButRef)(schema$1, this.RULES)) {
			const $ref = (0, resolve_1$5.resolveUrl)(this.opts.uriResolver, baseId, schema$1.$ref);
			env = resolveSchema$1.call(this, root, $ref);
		}
		const { schemaId } = this.opts;
		env = env || new SchemaEnv$1({
			schema: schema$1,
			schemaId,
			root,
			baseId
		});
		if (env.schema !== env.root.schema) return env;
		return void 0;
	}
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/data.json
var require_data$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/data.json"(exports, module) {
	module.exports = {
		"$id": "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
		"description": "Meta-schema for $data reference (JSON AnySchema extension proposal)",
		"type": "object",
		"required": ["$data"],
		"properties": { "$data": {
			"type": "string",
			"anyOf": [{ "format": "relative-json-pointer" }, { "format": "json-pointer" }]
		} },
		"additionalProperties": false
	};
} });

//#endregion
//#region ../node_modules/fast-uri/lib/scopedChars.js
var require_scopedChars = __commonJS({ "../node_modules/fast-uri/lib/scopedChars.js"(exports, module) {
	const HEX$1 = {
		0: 0,
		1: 1,
		2: 2,
		3: 3,
		4: 4,
		5: 5,
		6: 6,
		7: 7,
		8: 8,
		9: 9,
		a: 10,
		A: 10,
		b: 11,
		B: 11,
		c: 12,
		C: 12,
		d: 13,
		D: 13,
		e: 14,
		E: 14,
		f: 15,
		F: 15
	};
	module.exports = { HEX: HEX$1 };
} });

//#endregion
//#region ../node_modules/fast-uri/lib/utils.js
var require_utils = __commonJS({ "../node_modules/fast-uri/lib/utils.js"(exports, module) {
	const { HEX } = require_scopedChars();
	const IPV4_REG = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
	function normalizeIPv4$1(host) {
		if (findToken(host, ".") < 3) return {
			host,
			isIPV4: false
		};
		const matches = host.match(IPV4_REG) || [];
		const [address] = matches;
		if (address) return {
			host: stripLeadingZeros(address, "."),
			isIPV4: true
		};
		else return {
			host,
			isIPV4: false
		};
	}
	/**
	* @param {string[]} input
	* @param {boolean} [keepZero=false]
	* @returns {string|undefined}
	*/
	function stringArrayToHexStripped(input, keepZero = false) {
		let acc = "";
		let strip = true;
		for (const c of input) {
			if (HEX[c] === void 0) return void 0;
			if (c !== "0" && strip === true) strip = false;
			if (!strip) acc += c;
		}
		if (keepZero && acc.length === 0) acc = "0";
		return acc;
	}
	function getIPV6(input) {
		let tokenCount = 0;
		const output = {
			error: false,
			address: "",
			zone: ""
		};
		const address = [];
		const buffer = [];
		let isZone = false;
		let endipv6Encountered = false;
		let endIpv6 = false;
		function consume() {
			if (buffer.length) {
				if (isZone === false) {
					const hex = stringArrayToHexStripped(buffer);
					if (hex !== void 0) address.push(hex);
					else {
						output.error = true;
						return false;
					}
				}
				buffer.length = 0;
			}
			return true;
		}
		for (let i = 0; i < input.length; i++) {
			const cursor = input[i];
			if (cursor === "[" || cursor === "]") continue;
			if (cursor === ":") {
				if (endipv6Encountered === true) endIpv6 = true;
				if (!consume()) break;
				tokenCount++;
				address.push(":");
				if (tokenCount > 7) {
					output.error = true;
					break;
				}
				if (i - 1 >= 0 && input[i - 1] === ":") endipv6Encountered = true;
				continue;
			} else if (cursor === "%") {
				if (!consume()) break;
				isZone = true;
			} else {
				buffer.push(cursor);
				continue;
			}
		}
		if (buffer.length) if (isZone) output.zone = buffer.join("");
		else if (endIpv6) address.push(buffer.join(""));
		else address.push(stringArrayToHexStripped(buffer));
		output.address = address.join("");
		return output;
	}
	function normalizeIPv6$1(host) {
		if (findToken(host, ":") < 2) return {
			host,
			isIPV6: false
		};
		const ipv6 = getIPV6(host);
		if (!ipv6.error) {
			let newHost = ipv6.address;
			let escapedHost = ipv6.address;
			if (ipv6.zone) {
				newHost += "%" + ipv6.zone;
				escapedHost += "%25" + ipv6.zone;
			}
			return {
				host: newHost,
				escapedHost,
				isIPV6: true
			};
		} else return {
			host,
			isIPV6: false
		};
	}
	function stripLeadingZeros(str$2, token) {
		let out = "";
		let skip = true;
		const l = str$2.length;
		for (let i = 0; i < l; i++) {
			const c = str$2[i];
			if (c === "0" && skip) {
				if (i + 1 <= l && str$2[i + 1] === token || i + 1 === l) {
					out += c;
					skip = false;
				}
			} else {
				if (c === token) skip = true;
				else skip = false;
				out += c;
			}
		}
		return out;
	}
	function findToken(str$2, token) {
		let ind = 0;
		for (let i = 0; i < str$2.length; i++) if (str$2[i] === token) ind++;
		return ind;
	}
	const RDS1 = /^\.\.?\//u;
	const RDS2 = /^\/\.(?:\/|$)/u;
	const RDS3 = /^\/\.\.(?:\/|$)/u;
	const RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/u;
	function removeDotSegments$1(input) {
		const output = [];
		while (input.length) if (input.match(RDS1)) input = input.replace(RDS1, "");
		else if (input.match(RDS2)) input = input.replace(RDS2, "/");
		else if (input.match(RDS3)) {
			input = input.replace(RDS3, "/");
			output.pop();
		} else if (input === "." || input === "..") input = "";
		else {
			const im = input.match(RDS5);
			if (im) {
				const s = im[0];
				input = input.slice(s.length);
				output.push(s);
			} else throw new Error("Unexpected dot segment condition");
		}
		return output.join("");
	}
	function normalizeComponentEncoding$1(components, esc) {
		const func = esc !== true ? escape : unescape;
		if (components.scheme !== void 0) components.scheme = func(components.scheme);
		if (components.userinfo !== void 0) components.userinfo = func(components.userinfo);
		if (components.host !== void 0) components.host = func(components.host);
		if (components.path !== void 0) components.path = func(components.path);
		if (components.query !== void 0) components.query = func(components.query);
		if (components.fragment !== void 0) components.fragment = func(components.fragment);
		return components;
	}
	function recomposeAuthority$1(components) {
		const uriTokens = [];
		if (components.userinfo !== void 0) {
			uriTokens.push(components.userinfo);
			uriTokens.push("@");
		}
		if (components.host !== void 0) {
			let host = unescape(components.host);
			const ipV4res = normalizeIPv4$1(host);
			if (ipV4res.isIPV4) host = ipV4res.host;
			else {
				const ipV6res = normalizeIPv6$1(ipV4res.host);
				if (ipV6res.isIPV6 === true) host = `[${ipV6res.escapedHost}]`;
				else host = components.host;
			}
			uriTokens.push(host);
		}
		if (typeof components.port === "number" || typeof components.port === "string") {
			uriTokens.push(":");
			uriTokens.push(String(components.port));
		}
		return uriTokens.length ? uriTokens.join("") : void 0;
	}
	module.exports = {
		recomposeAuthority: recomposeAuthority$1,
		normalizeComponentEncoding: normalizeComponentEncoding$1,
		removeDotSegments: removeDotSegments$1,
		normalizeIPv4: normalizeIPv4$1,
		normalizeIPv6: normalizeIPv6$1,
		stringArrayToHexStripped
	};
} });

//#endregion
//#region ../node_modules/fast-uri/lib/schemes.js
var require_schemes = __commonJS({ "../node_modules/fast-uri/lib/schemes.js"(exports, module) {
	const UUID_REG = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu;
	const URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
	function isSecure(wsComponents) {
		return typeof wsComponents.secure === "boolean" ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === "wss";
	}
	function httpParse(components) {
		if (!components.host) components.error = components.error || "HTTP URIs must have a host.";
		return components;
	}
	function httpSerialize(components) {
		const secure = String(components.scheme).toLowerCase() === "https";
		if (components.port === (secure ? 443 : 80) || components.port === "") components.port = void 0;
		if (!components.path) components.path = "/";
		return components;
	}
	function wsParse(wsComponents) {
		wsComponents.secure = isSecure(wsComponents);
		wsComponents.resourceName = (wsComponents.path || "/") + (wsComponents.query ? "?" + wsComponents.query : "");
		wsComponents.path = void 0;
		wsComponents.query = void 0;
		return wsComponents;
	}
	function wsSerialize(wsComponents) {
		if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") wsComponents.port = void 0;
		if (typeof wsComponents.secure === "boolean") {
			wsComponents.scheme = wsComponents.secure ? "wss" : "ws";
			wsComponents.secure = void 0;
		}
		if (wsComponents.resourceName) {
			const [path, query] = wsComponents.resourceName.split("?");
			wsComponents.path = path && path !== "/" ? path : void 0;
			wsComponents.query = query;
			wsComponents.resourceName = void 0;
		}
		wsComponents.fragment = void 0;
		return wsComponents;
	}
	function urnParse(urnComponents, options) {
		if (!urnComponents.path) {
			urnComponents.error = "URN can not be parsed";
			return urnComponents;
		}
		const matches = urnComponents.path.match(URN_REG);
		if (matches) {
			const scheme = options.scheme || urnComponents.scheme || "urn";
			urnComponents.nid = matches[1].toLowerCase();
			urnComponents.nss = matches[2];
			const urnScheme = `${scheme}:${options.nid || urnComponents.nid}`;
			const schemeHandler = SCHEMES$1[urnScheme];
			urnComponents.path = void 0;
			if (schemeHandler) urnComponents = schemeHandler.parse(urnComponents, options);
		} else urnComponents.error = urnComponents.error || "URN can not be parsed.";
		return urnComponents;
	}
	function urnSerialize(urnComponents, options) {
		const scheme = options.scheme || urnComponents.scheme || "urn";
		const nid = urnComponents.nid.toLowerCase();
		const urnScheme = `${scheme}:${options.nid || nid}`;
		const schemeHandler = SCHEMES$1[urnScheme];
		if (schemeHandler) urnComponents = schemeHandler.serialize(urnComponents, options);
		const uriComponents = urnComponents;
		const nss = urnComponents.nss;
		uriComponents.path = `${nid || options.nid}:${nss}`;
		options.skipEscape = true;
		return uriComponents;
	}
	function urnuuidParse(urnComponents, options) {
		const uuidComponents = urnComponents;
		uuidComponents.uuid = uuidComponents.nss;
		uuidComponents.nss = void 0;
		if (!options.tolerant && (!uuidComponents.uuid || !UUID_REG.test(uuidComponents.uuid))) uuidComponents.error = uuidComponents.error || "UUID is not valid.";
		return uuidComponents;
	}
	function urnuuidSerialize(uuidComponents) {
		const urnComponents = uuidComponents;
		urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
		return urnComponents;
	}
	const http = {
		scheme: "http",
		domainHost: true,
		parse: httpParse,
		serialize: httpSerialize
	};
	const https = {
		scheme: "https",
		domainHost: http.domainHost,
		parse: httpParse,
		serialize: httpSerialize
	};
	const ws = {
		scheme: "ws",
		domainHost: true,
		parse: wsParse,
		serialize: wsSerialize
	};
	const wss = {
		scheme: "wss",
		domainHost: ws.domainHost,
		parse: ws.parse,
		serialize: ws.serialize
	};
	const urn = {
		scheme: "urn",
		parse: urnParse,
		serialize: urnSerialize,
		skipNormalize: true
	};
	const urnuuid = {
		scheme: "urn:uuid",
		parse: urnuuidParse,
		serialize: urnuuidSerialize,
		skipNormalize: true
	};
	const SCHEMES$1 = {
		http,
		https,
		ws,
		wss,
		urn,
		"urn:uuid": urnuuid
	};
	module.exports = SCHEMES$1;
} });

//#endregion
//#region ../node_modules/fast-uri/index.js
var require_fast_uri = __commonJS({ "../node_modules/fast-uri/index.js"(exports, module) {
	const { normalizeIPv6, normalizeIPv4, removeDotSegments, recomposeAuthority, normalizeComponentEncoding } = require_utils();
	const SCHEMES = require_schemes();
	function normalize(uri$3, options) {
		if (typeof uri$3 === "string") uri$3 = serialize(parse(uri$3, options), options);
		else if (typeof uri$3 === "object") uri$3 = parse(serialize(uri$3, options), options);
		return uri$3;
	}
	function resolve$1(baseURI, relativeURI, options) {
		const schemelessOptions = Object.assign({ scheme: "null" }, options);
		const resolved = resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true);
		return serialize(resolved, {
			...schemelessOptions,
			skipEscape: true
		});
	}
	function resolveComponents(base, relative, options, skipNormalization) {
		const target = {};
		if (!skipNormalization) {
			base = parse(serialize(base, options), options);
			relative = parse(serialize(relative, options), options);
		}
		options = options || {};
		if (!options.tolerant && relative.scheme) {
			target.scheme = relative.scheme;
			target.userinfo = relative.userinfo;
			target.host = relative.host;
			target.port = relative.port;
			target.path = removeDotSegments(relative.path || "");
			target.query = relative.query;
		} else {
			if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
				target.userinfo = relative.userinfo;
				target.host = relative.host;
				target.port = relative.port;
				target.path = removeDotSegments(relative.path || "");
				target.query = relative.query;
			} else {
				if (!relative.path) {
					target.path = base.path;
					if (relative.query !== void 0) target.query = relative.query;
					else target.query = base.query;
				} else {
					if (relative.path.charAt(0) === "/") target.path = removeDotSegments(relative.path);
					else {
						if ((base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0) && !base.path) target.path = "/" + relative.path;
						else if (!base.path) target.path = relative.path;
						else target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
						target.path = removeDotSegments(target.path);
					}
					target.query = relative.query;
				}
				target.userinfo = base.userinfo;
				target.host = base.host;
				target.port = base.port;
			}
			target.scheme = base.scheme;
		}
		target.fragment = relative.fragment;
		return target;
	}
	function equal$3(uriA, uriB, options) {
		if (typeof uriA === "string") {
			uriA = unescape(uriA);
			uriA = serialize(normalizeComponentEncoding(parse(uriA, options), true), {
				...options,
				skipEscape: true
			});
		} else if (typeof uriA === "object") uriA = serialize(normalizeComponentEncoding(uriA, true), {
			...options,
			skipEscape: true
		});
		if (typeof uriB === "string") {
			uriB = unescape(uriB);
			uriB = serialize(normalizeComponentEncoding(parse(uriB, options), true), {
				...options,
				skipEscape: true
			});
		} else if (typeof uriB === "object") uriB = serialize(normalizeComponentEncoding(uriB, true), {
			...options,
			skipEscape: true
		});
		return uriA.toLowerCase() === uriB.toLowerCase();
	}
	function serialize(cmpts, opts) {
		const components = {
			host: cmpts.host,
			scheme: cmpts.scheme,
			userinfo: cmpts.userinfo,
			port: cmpts.port,
			path: cmpts.path,
			query: cmpts.query,
			nid: cmpts.nid,
			nss: cmpts.nss,
			uuid: cmpts.uuid,
			fragment: cmpts.fragment,
			reference: cmpts.reference,
			resourceName: cmpts.resourceName,
			secure: cmpts.secure,
			error: ""
		};
		const options = Object.assign({}, opts);
		const uriTokens = [];
		const schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
		if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
		if (components.path !== void 0) if (!options.skipEscape) {
			components.path = escape(components.path);
			if (components.scheme !== void 0) components.path = components.path.split("%3A").join(":");
		} else components.path = unescape(components.path);
		if (options.reference !== "suffix" && components.scheme) uriTokens.push(components.scheme, ":");
		const authority = recomposeAuthority(components);
		if (authority !== void 0) {
			if (options.reference !== "suffix") uriTokens.push("//");
			uriTokens.push(authority);
			if (components.path && components.path.charAt(0) !== "/") uriTokens.push("/");
		}
		if (components.path !== void 0) {
			let s = components.path;
			if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) s = removeDotSegments(s);
			if (authority === void 0) s = s.replace(/^\/\//u, "/%2F");
			uriTokens.push(s);
		}
		if (components.query !== void 0) uriTokens.push("?", components.query);
		if (components.fragment !== void 0) uriTokens.push("#", components.fragment);
		return uriTokens.join("");
	}
	const hexLookUp = Array.from({ length: 127 }, (_v, k) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(k)));
	function nonSimpleDomain(value) {
		let code = 0;
		for (let i = 0, len = value.length; i < len; ++i) {
			code = value.charCodeAt(i);
			if (code > 126 || hexLookUp[code]) return true;
		}
		return false;
	}
	const URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
	function parse(uri$3, opts) {
		const options = Object.assign({}, opts);
		const parsed = {
			scheme: void 0,
			userinfo: void 0,
			host: "",
			port: void 0,
			path: "",
			query: void 0,
			fragment: void 0
		};
		const gotEncoding = uri$3.indexOf("%") !== -1;
		let isIP = false;
		if (options.reference === "suffix") uri$3 = (options.scheme ? options.scheme + ":" : "") + "//" + uri$3;
		const matches = uri$3.match(URI_PARSE);
		if (matches) {
			parsed.scheme = matches[1];
			parsed.userinfo = matches[3];
			parsed.host = matches[4];
			parsed.port = parseInt(matches[5], 10);
			parsed.path = matches[6] || "";
			parsed.query = matches[7];
			parsed.fragment = matches[8];
			if (isNaN(parsed.port)) parsed.port = matches[5];
			if (parsed.host) {
				const ipv4result = normalizeIPv4(parsed.host);
				if (ipv4result.isIPV4 === false) {
					const ipv6result = normalizeIPv6(ipv4result.host);
					parsed.host = ipv6result.host.toLowerCase();
					isIP = ipv6result.isIPV6;
				} else {
					parsed.host = ipv4result.host;
					isIP = true;
				}
			}
			if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && parsed.query === void 0 && !parsed.path) parsed.reference = "same-document";
			else if (parsed.scheme === void 0) parsed.reference = "relative";
			else if (parsed.fragment === void 0) parsed.reference = "absolute";
			else parsed.reference = "uri";
			if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
			const schemeHandler = SCHEMES[(options.scheme || parsed.scheme || "").toLowerCase()];
			if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
				if (parsed.host && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) try {
					parsed.host = URL.domainToASCII(parsed.host.toLowerCase());
				} catch (e) {
					parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
				}
			}
			if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
				if (gotEncoding && parsed.scheme !== void 0) parsed.scheme = unescape(parsed.scheme);
				if (gotEncoding && parsed.host !== void 0) parsed.host = unescape(parsed.host);
				if (parsed.path) parsed.path = escape(unescape(parsed.path));
				if (parsed.fragment) parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
			}
			if (schemeHandler && schemeHandler.parse) schemeHandler.parse(parsed, options);
		} else parsed.error = parsed.error || "URI can not be parsed.";
		return parsed;
	}
	const fastUri = {
		SCHEMES,
		normalize,
		resolve: resolve$1,
		resolveComponents,
		equal: equal$3,
		serialize,
		parse
	};
	module.exports = fastUri;
	module.exports.default = fastUri;
	module.exports.fastUri = fastUri;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/runtime/uri.js
var require_uri$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/runtime/uri.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const uri$2 = require_fast_uri();
	uri$2.code = "require(\"ajv/dist/runtime/uri\").default";
	exports.default = uri$2;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/core.js
var require_core$4 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/core.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
	var validate_1$8 = require_validate$1();
	Object.defineProperty(exports, "KeywordCxt", {
		enumerable: true,
		get: function() {
			return validate_1$8.KeywordCxt;
		}
	});
	var codegen_1$68 = require_codegen$1();
	Object.defineProperty(exports, "_", {
		enumerable: true,
		get: function() {
			return codegen_1$68._;
		}
	});
	Object.defineProperty(exports, "str", {
		enumerable: true,
		get: function() {
			return codegen_1$68.str;
		}
	});
	Object.defineProperty(exports, "stringify", {
		enumerable: true,
		get: function() {
			return codegen_1$68.stringify;
		}
	});
	Object.defineProperty(exports, "nil", {
		enumerable: true,
		get: function() {
			return codegen_1$68.nil;
		}
	});
	Object.defineProperty(exports, "Name", {
		enumerable: true,
		get: function() {
			return codegen_1$68.Name;
		}
	});
	Object.defineProperty(exports, "CodeGen", {
		enumerable: true,
		get: function() {
			return codegen_1$68.CodeGen;
		}
	});
	const validation_error_1$5 = require_validation_error$1();
	const ref_error_1$8 = require_ref_error$1();
	const rules_1$2 = require_rules$1();
	const compile_1$6 = require_compile$1();
	const codegen_2$1 = require_codegen$1();
	const resolve_1$4 = require_resolve$1();
	const dataType_1$4 = require_dataType$1();
	const util_1$55 = require_util$1();
	const $dataRefSchema$1 = require_data$1();
	const uri_1$1 = require_uri$1();
	const defaultRegExp$1 = (str$2, flags) => new RegExp(str$2, flags);
	defaultRegExp$1.code = "new RegExp";
	const META_IGNORE_OPTIONS$1 = [
		"removeAdditional",
		"useDefaults",
		"coerceTypes"
	];
	const EXT_SCOPE_NAMES$1 = new Set([
		"validate",
		"serialize",
		"parse",
		"wrapper",
		"root",
		"schema",
		"keyword",
		"pattern",
		"formats",
		"validate$data",
		"func",
		"obj",
		"Error"
	]);
	const removedOptions$1 = {
		errorDataPath: "",
		format: "`validateFormats: false` can be used instead.",
		nullable: "\"nullable\" keyword is supported by default.",
		jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
		extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
		missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
		processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
		sourceCode: "Use option `code: {source: true}`",
		strictDefaults: "It is default now, see option `strict`.",
		strictKeywords: "It is default now, see option `strict`.",
		uniqueItems: "\"uniqueItems\" keyword is always validated.",
		unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
		cache: "Map is used as cache, schema object as key.",
		serialize: "Map is used as cache, schema object as key.",
		ajvErrors: "It is default now."
	};
	const deprecatedOptions$1 = {
		ignoreKeywordsWithRef: "",
		jsPropertySyntax: "",
		unicode: "\"minLength\"/\"maxLength\" account for unicode characters by default."
	};
	const MAX_EXPRESSION$1 = 200;
	function requiredOptions$1(o) {
		var _a$4, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
		const s = o.strict;
		const _optz = (_a$4 = o.code) === null || _a$4 === void 0 ? void 0 : _a$4.optimize;
		const optimize$2 = _optz === true || _optz === void 0 ? 1 : _optz || 0;
		const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp$1;
		const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1$1.default;
		return {
			strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
			strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
			strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
			strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
			strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
			code: o.code ? {
				...o.code,
				optimize: optimize$2,
				regExp
			} : {
				optimize: optimize$2,
				regExp
			},
			loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION$1,
			loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION$1,
			meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
			messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
			inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
			schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
			addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
			validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
			validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
			unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
			int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
			uriResolver
		};
	}
	var Ajv$3 = class {
		constructor(opts = {}) {
			this.schemas = {};
			this.refs = {};
			this.formats = {};
			this._compilations = /* @__PURE__ */ new Set();
			this._loading = {};
			this._cache = /* @__PURE__ */ new Map();
			opts = this.opts = {
				...opts,
				...requiredOptions$1(opts)
			};
			const { es5, lines } = this.opts.code;
			this.scope = new codegen_2$1.ValueScope({
				scope: {},
				prefixes: EXT_SCOPE_NAMES$1,
				es5,
				lines
			});
			this.logger = getLogger$1(opts.logger);
			const formatOpt = opts.validateFormats;
			opts.validateFormats = false;
			this.RULES = (0, rules_1$2.getRules)();
			checkOptions$1.call(this, removedOptions$1, opts, "NOT SUPPORTED");
			checkOptions$1.call(this, deprecatedOptions$1, opts, "DEPRECATED", "warn");
			this._metaOpts = getMetaSchemaOptions$1.call(this);
			if (opts.formats) addInitialFormats$1.call(this);
			this._addVocabularies();
			this._addDefaultMetaSchema();
			if (opts.keywords) addInitialKeywords$1.call(this, opts.keywords);
			if (typeof opts.meta == "object") this.addMetaSchema(opts.meta);
			addInitialSchemas$1.call(this);
			opts.validateFormats = formatOpt;
		}
		_addVocabularies() {
			this.addKeyword("$async");
		}
		_addDefaultMetaSchema() {
			const { $data, meta, schemaId } = this.opts;
			let _dataRefSchema = $dataRefSchema$1;
			if (schemaId === "id") {
				_dataRefSchema = { ...$dataRefSchema$1 };
				_dataRefSchema.id = _dataRefSchema.$id;
				delete _dataRefSchema.$id;
			}
			if (meta && $data) this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
		}
		defaultMeta() {
			const { meta, schemaId } = this.opts;
			return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
		}
		validate(schemaKeyRef, data) {
			let v;
			if (typeof schemaKeyRef == "string") {
				v = this.getSchema(schemaKeyRef);
				if (!v) throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
			} else v = this.compile(schemaKeyRef);
			const valid = v(data);
			if (!("$async" in v)) this.errors = v.errors;
			return valid;
		}
		compile(schema$1, _meta) {
			const sch = this._addSchema(schema$1, _meta);
			return sch.validate || this._compileSchemaEnv(sch);
		}
		compileAsync(schema$1, meta) {
			if (typeof this.opts.loadSchema != "function") throw new Error("options.loadSchema should be a function");
			const { loadSchema } = this.opts;
			return runCompileAsync.call(this, schema$1, meta);
			async function runCompileAsync(_schema, _meta) {
				await loadMetaSchema.call(this, _schema.$schema);
				const sch = this._addSchema(_schema, _meta);
				return sch.validate || _compileAsync.call(this, sch);
			}
			async function loadMetaSchema($ref) {
				if ($ref && !this.getSchema($ref)) await runCompileAsync.call(this, { $ref }, true);
			}
			async function _compileAsync(sch) {
				try {
					return this._compileSchemaEnv(sch);
				} catch (e) {
					if (!(e instanceof ref_error_1$8.default)) throw e;
					checkLoaded.call(this, e);
					await loadMissingSchema.call(this, e.missingSchema);
					return _compileAsync.call(this, sch);
				}
			}
			function checkLoaded({ missingSchema: ref, missingRef }) {
				if (this.refs[ref]) throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
			}
			async function loadMissingSchema(ref) {
				const _schema = await _loadSchema.call(this, ref);
				if (!this.refs[ref]) await loadMetaSchema.call(this, _schema.$schema);
				if (!this.refs[ref]) this.addSchema(_schema, ref, meta);
			}
			async function _loadSchema(ref) {
				const p = this._loading[ref];
				if (p) return p;
				try {
					return await (this._loading[ref] = loadSchema(ref));
				} finally {
					delete this._loading[ref];
				}
			}
		}
		addSchema(schema$1, key, _meta, _validateSchema = this.opts.validateSchema) {
			if (Array.isArray(schema$1)) {
				for (const sch of schema$1) this.addSchema(sch, void 0, _meta, _validateSchema);
				return this;
			}
			let id;
			if (typeof schema$1 === "object") {
				const { schemaId } = this.opts;
				id = schema$1[schemaId];
				if (id !== void 0 && typeof id != "string") throw new Error(`schema ${schemaId} must be string`);
			}
			key = (0, resolve_1$4.normalizeId)(key || id);
			this._checkUnique(key);
			this.schemas[key] = this._addSchema(schema$1, _meta, key, _validateSchema, true);
			return this;
		}
		addMetaSchema(schema$1, key, _validateSchema = this.opts.validateSchema) {
			this.addSchema(schema$1, key, true, _validateSchema);
			return this;
		}
		validateSchema(schema$1, throwOrLogError) {
			if (typeof schema$1 == "boolean") return true;
			let $schema$2;
			$schema$2 = schema$1.$schema;
			if ($schema$2 !== void 0 && typeof $schema$2 != "string") throw new Error("$schema must be a string");
			$schema$2 = $schema$2 || this.opts.defaultMeta || this.defaultMeta();
			if (!$schema$2) {
				this.logger.warn("meta-schema not available");
				this.errors = null;
				return true;
			}
			const valid = this.validate($schema$2, schema$1);
			if (!valid && throwOrLogError) {
				const message = "schema is invalid: " + this.errorsText();
				if (this.opts.validateSchema === "log") this.logger.error(message);
				else throw new Error(message);
			}
			return valid;
		}
		getSchema(keyRef) {
			let sch;
			while (typeof (sch = getSchEnv$1.call(this, keyRef)) == "string") keyRef = sch;
			if (sch === void 0) {
				const { schemaId } = this.opts;
				const root = new compile_1$6.SchemaEnv({
					schema: {},
					schemaId
				});
				sch = compile_1$6.resolveSchema.call(this, root, keyRef);
				if (!sch) return;
				this.refs[keyRef] = sch;
			}
			return sch.validate || this._compileSchemaEnv(sch);
		}
		removeSchema(schemaKeyRef) {
			if (schemaKeyRef instanceof RegExp) {
				this._removeAllSchemas(this.schemas, schemaKeyRef);
				this._removeAllSchemas(this.refs, schemaKeyRef);
				return this;
			}
			switch (typeof schemaKeyRef) {
				case "undefined":
					this._removeAllSchemas(this.schemas);
					this._removeAllSchemas(this.refs);
					this._cache.clear();
					return this;
				case "string": {
					const sch = getSchEnv$1.call(this, schemaKeyRef);
					if (typeof sch == "object") this._cache.delete(sch.schema);
					delete this.schemas[schemaKeyRef];
					delete this.refs[schemaKeyRef];
					return this;
				}
				case "object": {
					const cacheKey = schemaKeyRef;
					this._cache.delete(cacheKey);
					let id = schemaKeyRef[this.opts.schemaId];
					if (id) {
						id = (0, resolve_1$4.normalizeId)(id);
						delete this.schemas[id];
						delete this.refs[id];
					}
					return this;
				}
				default: throw new Error("ajv.removeSchema: invalid parameter");
			}
		}
		addVocabulary(definitions) {
			for (const def$69 of definitions) this.addKeyword(def$69);
			return this;
		}
		addKeyword(kwdOrDef, def$69) {
			let keyword$1;
			if (typeof kwdOrDef == "string") {
				keyword$1 = kwdOrDef;
				if (typeof def$69 == "object") {
					this.logger.warn("these parameters are deprecated, see docs for addKeyword");
					def$69.keyword = keyword$1;
				}
			} else if (typeof kwdOrDef == "object" && def$69 === void 0) {
				def$69 = kwdOrDef;
				keyword$1 = def$69.keyword;
				if (Array.isArray(keyword$1) && !keyword$1.length) throw new Error("addKeywords: keyword must be string or non-empty array");
			} else throw new Error("invalid addKeywords parameters");
			checkKeyword$1.call(this, keyword$1, def$69);
			if (!def$69) {
				(0, util_1$55.eachItem)(keyword$1, (kwd) => addRule$1.call(this, kwd));
				return this;
			}
			keywordMetaschema$1.call(this, def$69);
			const definition = {
				...def$69,
				type: (0, dataType_1$4.getJSONTypes)(def$69.type),
				schemaType: (0, dataType_1$4.getJSONTypes)(def$69.schemaType)
			};
			(0, util_1$55.eachItem)(keyword$1, definition.type.length === 0 ? (k) => addRule$1.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule$1.call(this, k, definition, t)));
			return this;
		}
		getKeyword(keyword$1) {
			const rule = this.RULES.all[keyword$1];
			return typeof rule == "object" ? rule.definition : !!rule;
		}
		removeKeyword(keyword$1) {
			const { RULES } = this;
			delete RULES.keywords[keyword$1];
			delete RULES.all[keyword$1];
			for (const group of RULES.rules) {
				const i = group.rules.findIndex((rule) => rule.keyword === keyword$1);
				if (i >= 0) group.rules.splice(i, 1);
			}
			return this;
		}
		addFormat(name, format$3) {
			if (typeof format$3 == "string") format$3 = new RegExp(format$3);
			this.formats[name] = format$3;
			return this;
		}
		errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
			if (!errors || errors.length === 0) return "No errors";
			return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
		}
		$dataMetaSchema(metaSchema$1, keywordsJsonPointers) {
			const rules = this.RULES.all;
			metaSchema$1 = JSON.parse(JSON.stringify(metaSchema$1));
			for (const jsonPointer of keywordsJsonPointers) {
				const segments$1 = jsonPointer.split("/").slice(1);
				let keywords = metaSchema$1;
				for (const seg of segments$1) keywords = keywords[seg];
				for (const key in rules) {
					const rule = rules[key];
					if (typeof rule != "object") continue;
					const { $data } = rule.definition;
					const schema$1 = keywords[key];
					if ($data && schema$1) keywords[key] = schemaOrData$1(schema$1);
				}
			}
			return metaSchema$1;
		}
		_removeAllSchemas(schemas, regex$1) {
			for (const keyRef in schemas) {
				const sch = schemas[keyRef];
				if (!regex$1 || regex$1.test(keyRef)) {
					if (typeof sch == "string") delete schemas[keyRef];
					else if (sch && !sch.meta) {
						this._cache.delete(sch.schema);
						delete schemas[keyRef];
					}
				}
			}
		}
		_addSchema(schema$1, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
			let id;
			const { schemaId } = this.opts;
			if (typeof schema$1 == "object") id = schema$1[schemaId];
			else if (this.opts.jtd) throw new Error("schema must be object");
			else if (typeof schema$1 != "boolean") throw new Error("schema must be object or boolean");
			let sch = this._cache.get(schema$1);
			if (sch !== void 0) return sch;
			baseId = (0, resolve_1$4.normalizeId)(id || baseId);
			const localRefs = resolve_1$4.getSchemaRefs.call(this, schema$1, baseId);
			sch = new compile_1$6.SchemaEnv({
				schema: schema$1,
				schemaId,
				meta,
				baseId,
				localRefs
			});
			this._cache.set(sch.schema, sch);
			if (addSchema && !baseId.startsWith("#")) {
				if (baseId) this._checkUnique(baseId);
				this.refs[baseId] = sch;
			}
			if (validateSchema) this.validateSchema(schema$1, true);
			return sch;
		}
		_checkUnique(id) {
			if (this.schemas[id] || this.refs[id]) throw new Error(`schema with key or id "${id}" already exists`);
		}
		_compileSchemaEnv(sch) {
			if (sch.meta) this._compileMetaSchema(sch);
			else compile_1$6.compileSchema.call(this, sch);
			/* istanbul ignore if */
			if (!sch.validate) throw new Error("ajv implementation error");
			return sch.validate;
		}
		_compileMetaSchema(sch) {
			const currentOpts = this.opts;
			this.opts = this._metaOpts;
			try {
				compile_1$6.compileSchema.call(this, sch);
			} finally {
				this.opts = currentOpts;
			}
		}
	};
	Ajv$3.ValidationError = validation_error_1$5.default;
	Ajv$3.MissingRefError = ref_error_1$8.default;
	exports.default = Ajv$3;
	function checkOptions$1(checkOpts, options, msg, log = "error") {
		for (const key in checkOpts) {
			const opt = key;
			if (opt in options) this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
		}
	}
	function getSchEnv$1(keyRef) {
		keyRef = (0, resolve_1$4.normalizeId)(keyRef);
		return this.schemas[keyRef] || this.refs[keyRef];
	}
	function addInitialSchemas$1() {
		const optsSchemas = this.opts.schemas;
		if (!optsSchemas) return;
		if (Array.isArray(optsSchemas)) this.addSchema(optsSchemas);
		else for (const key in optsSchemas) this.addSchema(optsSchemas[key], key);
	}
	function addInitialFormats$1() {
		for (const name in this.opts.formats) {
			const format$3 = this.opts.formats[name];
			if (format$3) this.addFormat(name, format$3);
		}
	}
	function addInitialKeywords$1(defs) {
		if (Array.isArray(defs)) {
			this.addVocabulary(defs);
			return;
		}
		this.logger.warn("keywords option as map is deprecated, pass array");
		for (const keyword$1 in defs) {
			const def$69 = defs[keyword$1];
			if (!def$69.keyword) def$69.keyword = keyword$1;
			this.addKeyword(def$69);
		}
	}
	function getMetaSchemaOptions$1() {
		const metaOpts = { ...this.opts };
		for (const opt of META_IGNORE_OPTIONS$1) delete metaOpts[opt];
		return metaOpts;
	}
	const noLogs$1 = {
		log() {},
		warn() {},
		error() {}
	};
	function getLogger$1(logger) {
		if (logger === false) return noLogs$1;
		if (logger === void 0) return console;
		if (logger.log && logger.warn && logger.error) return logger;
		throw new Error("logger must implement log, warn and error methods");
	}
	const KEYWORD_NAME$1 = /^[a-z_$][a-z0-9_$:-]*$/i;
	function checkKeyword$1(keyword$1, def$69) {
		const { RULES } = this;
		(0, util_1$55.eachItem)(keyword$1, (kwd) => {
			if (RULES.keywords[kwd]) throw new Error(`Keyword ${kwd} is already defined`);
			if (!KEYWORD_NAME$1.test(kwd)) throw new Error(`Keyword ${kwd} has invalid name`);
		});
		if (!def$69) return;
		if (def$69.$data && !("code" in def$69 || "validate" in def$69)) throw new Error("$data keyword must have \"code\" or \"validate\" function");
	}
	function addRule$1(keyword$1, definition, dataType) {
		var _a$4;
		const post = definition === null || definition === void 0 ? void 0 : definition.post;
		if (dataType && post) throw new Error("keyword with \"post\" flag cannot have \"type\"");
		const { RULES } = this;
		let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
		if (!ruleGroup) {
			ruleGroup = {
				type: dataType,
				rules: []
			};
			RULES.rules.push(ruleGroup);
		}
		RULES.keywords[keyword$1] = true;
		if (!definition) return;
		const rule = {
			keyword: keyword$1,
			definition: {
				...definition,
				type: (0, dataType_1$4.getJSONTypes)(definition.type),
				schemaType: (0, dataType_1$4.getJSONTypes)(definition.schemaType)
			}
		};
		if (definition.before) addBeforeRule$1.call(this, ruleGroup, rule, definition.before);
		else ruleGroup.rules.push(rule);
		RULES.all[keyword$1] = rule;
		(_a$4 = definition.implements) === null || _a$4 === void 0 || _a$4.forEach((kwd) => this.addKeyword(kwd));
	}
	function addBeforeRule$1(ruleGroup, rule, before) {
		const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
		if (i >= 0) ruleGroup.rules.splice(i, 0, rule);
		else {
			ruleGroup.rules.push(rule);
			this.logger.warn(`rule ${before} is not defined`);
		}
	}
	function keywordMetaschema$1(def$69) {
		let { metaSchema: metaSchema$1 } = def$69;
		if (metaSchema$1 === void 0) return;
		if (def$69.$data && this.opts.$data) metaSchema$1 = schemaOrData$1(metaSchema$1);
		def$69.validateSchema = this.compile(metaSchema$1, true);
	}
	const $dataRef$1 = { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" };
	function schemaOrData$1(schema$1) {
		return { anyOf: [schema$1, $dataRef$1] };
	}
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/core/id.js
var require_id$2 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/core/id.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const def$68 = {
		keyword: "id",
		code() {
			throw new Error("NOT SUPPORTED: keyword \"id\", use \"$id\" for schema ID");
		}
	};
	exports.default = def$68;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/core/ref.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.callRef = exports.getValidate = void 0;
	const ref_error_1$7 = require_ref_error$1();
	const code_1$24 = require_code$2();
	const codegen_1$67 = require_codegen$1();
	const names_1$13 = require_names$1();
	const compile_1$5 = require_compile$1();
	const util_1$54 = require_util$1();
	const def$67 = {
		keyword: "$ref",
		schemaType: "string",
		code(cxt) {
			const { gen, schema: $ref, it } = cxt;
			const { baseId, schemaEnv: env, validateName, opts, self } = it;
			const { root } = env;
			if (($ref === "#" || $ref === "#/") && baseId === root.baseId) return callRootRef();
			const schOrEnv = compile_1$5.resolveRef.call(self, root, baseId, $ref);
			if (schOrEnv === void 0) throw new ref_error_1$7.default(it.opts.uriResolver, baseId, $ref);
			if (schOrEnv instanceof compile_1$5.SchemaEnv) return callValidate(schOrEnv);
			return inlineRefSchema(schOrEnv);
			function callRootRef() {
				if (env === root) return callRef$1(cxt, validateName, env, env.$async);
				const rootName = gen.scopeValue("root", { ref: root });
				return callRef$1(cxt, (0, codegen_1$67._)`${rootName}.validate`, root, root.$async);
			}
			function callValidate(sch) {
				const v = getValidate$1(cxt, sch);
				callRef$1(cxt, v, sch, sch.$async);
			}
			function inlineRefSchema(sch) {
				const schName = gen.scopeValue("schema", opts.code.source === true ? {
					ref: sch,
					code: (0, codegen_1$67.stringify)(sch)
				} : { ref: sch });
				const valid = gen.name("valid");
				const schCxt = cxt.subschema({
					schema: sch,
					dataTypes: [],
					schemaPath: codegen_1$67.nil,
					topSchemaRef: schName,
					errSchemaPath: $ref
				}, valid);
				cxt.mergeEvaluated(schCxt);
				cxt.ok(valid);
			}
		}
	};
	function getValidate$1(cxt, sch) {
		const { gen } = cxt;
		return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1$67._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
	}
	exports.getValidate = getValidate$1;
	function callRef$1(cxt, v, sch, $async) {
		const { gen, it } = cxt;
		const { allErrors, schemaEnv: env, opts } = it;
		const passCxt = opts.passContext ? names_1$13.default.this : codegen_1$67.nil;
		if ($async) callAsyncRef();
		else callSyncRef();
		function callAsyncRef() {
			if (!env.$async) throw new Error("async schema referenced by sync schema");
			const valid = gen.let("valid");
			gen.try(() => {
				gen.code((0, codegen_1$67._)`await ${(0, code_1$24.callValidateCode)(cxt, v, passCxt)}`);
				addEvaluatedFrom(v);
				if (!allErrors) gen.assign(valid, true);
			}, (e) => {
				gen.if((0, codegen_1$67._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
				addErrorsFrom(e);
				if (!allErrors) gen.assign(valid, false);
			});
			cxt.ok(valid);
		}
		function callSyncRef() {
			cxt.result((0, code_1$24.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
		}
		function addErrorsFrom(source) {
			const errs = (0, codegen_1$67._)`${source}.errors`;
			gen.assign(names_1$13.default.vErrors, (0, codegen_1$67._)`${names_1$13.default.vErrors} === null ? ${errs} : ${names_1$13.default.vErrors}.concat(${errs})`);
			gen.assign(names_1$13.default.errors, (0, codegen_1$67._)`${names_1$13.default.vErrors}.length`);
		}
		function addEvaluatedFrom(source) {
			var _a$4;
			if (!it.opts.unevaluated) return;
			const schEvaluated = (_a$4 = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a$4 === void 0 ? void 0 : _a$4.evaluated;
			if (it.props !== true) if (schEvaluated && !schEvaluated.dynamicProps) {
				if (schEvaluated.props !== void 0) it.props = util_1$54.mergeEvaluated.props(gen, schEvaluated.props, it.props);
			} else {
				const props = gen.var("props", (0, codegen_1$67._)`${source}.evaluated.props`);
				it.props = util_1$54.mergeEvaluated.props(gen, props, it.props, codegen_1$67.Name);
			}
			if (it.items !== true) if (schEvaluated && !schEvaluated.dynamicItems) {
				if (schEvaluated.items !== void 0) it.items = util_1$54.mergeEvaluated.items(gen, schEvaluated.items, it.items);
			} else {
				const items = gen.var("items", (0, codegen_1$67._)`${source}.evaluated.items`);
				it.items = util_1$54.mergeEvaluated.items(gen, items, it.items, codegen_1$67.Name);
			}
		}
	}
	exports.callRef = callRef$1;
	exports.default = def$67;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/core/index.js
var require_core$3 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/core/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const id_1$1 = require_id$2();
	const ref_1$3 = require_ref$1();
	const core$2 = [
		"$schema",
		"$id",
		"$defs",
		"$vocabulary",
		{ keyword: "$comment" },
		"definitions",
		id_1$1.default,
		ref_1$3.default
	];
	exports.default = core$2;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$66 = require_codegen$1();
	const ops$2 = codegen_1$66.operators;
	const KWDs$2 = {
		maximum: {
			okStr: "<=",
			ok: ops$2.LTE,
			fail: ops$2.GT
		},
		minimum: {
			okStr: ">=",
			ok: ops$2.GTE,
			fail: ops$2.LT
		},
		exclusiveMaximum: {
			okStr: "<",
			ok: ops$2.LT,
			fail: ops$2.GTE
		},
		exclusiveMinimum: {
			okStr: ">",
			ok: ops$2.GT,
			fail: ops$2.LTE
		}
	};
	const error$40 = {
		message: ({ keyword: keyword$1, schemaCode }) => (0, codegen_1$66.str)`must be ${KWDs$2[keyword$1].okStr} ${schemaCode}`,
		params: ({ keyword: keyword$1, schemaCode }) => (0, codegen_1$66._)`{comparison: ${KWDs$2[keyword$1].okStr}, limit: ${schemaCode}}`
	};
	const def$66 = {
		keyword: Object.keys(KWDs$2),
		type: "number",
		schemaType: "number",
		$data: true,
		error: error$40,
		code(cxt) {
			const { keyword: keyword$1, data, schemaCode } = cxt;
			cxt.fail$data((0, codegen_1$66._)`${data} ${KWDs$2[keyword$1].fail} ${schemaCode} || isNaN(${data})`);
		}
	};
	exports.default = def$66;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$65 = require_codegen$1();
	const error$39 = {
		message: ({ schemaCode }) => (0, codegen_1$65.str)`must be multiple of ${schemaCode}`,
		params: ({ schemaCode }) => (0, codegen_1$65._)`{multipleOf: ${schemaCode}}`
	};
	const def$65 = {
		keyword: "multipleOf",
		type: "number",
		schemaType: "number",
		$data: true,
		error: error$39,
		code(cxt) {
			const { gen, data, schemaCode, it } = cxt;
			const prec = it.opts.multipleOfPrecision;
			const res = gen.let("res");
			const invalid = prec ? (0, codegen_1$65._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1$65._)`${res} !== parseInt(${res})`;
			cxt.fail$data((0, codegen_1$65._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
		}
	};
	exports.default = def$65;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function ucs2length$1(str$2) {
		const len = str$2.length;
		let length = 0;
		let pos = 0;
		let value;
		while (pos < len) {
			length++;
			value = str$2.charCodeAt(pos++);
			if (value >= 55296 && value <= 56319 && pos < len) {
				value = str$2.charCodeAt(pos);
				if ((value & 64512) === 56320) pos++;
			}
		}
		return length;
	}
	exports.default = ucs2length$1;
	ucs2length$1.code = "require(\"ajv/dist/runtime/ucs2length\").default";
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$64 = require_codegen$1();
	const util_1$53 = require_util$1();
	const ucs2length_1$1 = require_ucs2length$1();
	const error$38 = {
		message({ keyword: keyword$1, schemaCode }) {
			const comp = keyword$1 === "maxLength" ? "more" : "fewer";
			return (0, codegen_1$64.str)`must NOT have ${comp} than ${schemaCode} characters`;
		},
		params: ({ schemaCode }) => (0, codegen_1$64._)`{limit: ${schemaCode}}`
	};
	const def$64 = {
		keyword: ["maxLength", "minLength"],
		type: "string",
		schemaType: "number",
		$data: true,
		error: error$38,
		code(cxt) {
			const { keyword: keyword$1, data, schemaCode, it } = cxt;
			const op = keyword$1 === "maxLength" ? codegen_1$64.operators.GT : codegen_1$64.operators.LT;
			const len = it.opts.unicode === false ? (0, codegen_1$64._)`${data}.length` : (0, codegen_1$64._)`${(0, util_1$53.useFunc)(cxt.gen, ucs2length_1$1.default)}(${data})`;
			cxt.fail$data((0, codegen_1$64._)`${len} ${op} ${schemaCode}`);
		}
	};
	exports.default = def$64;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$23 = require_code$2();
	const codegen_1$63 = require_codegen$1();
	const error$37 = {
		message: ({ schemaCode }) => (0, codegen_1$63.str)`must match pattern "${schemaCode}"`,
		params: ({ schemaCode }) => (0, codegen_1$63._)`{pattern: ${schemaCode}}`
	};
	const def$63 = {
		keyword: "pattern",
		type: "string",
		schemaType: "string",
		$data: true,
		error: error$37,
		code(cxt) {
			const { data, $data, schema: schema$1, schemaCode, it } = cxt;
			const u = it.opts.unicodeRegExp ? "u" : "";
			const regExp = $data ? (0, codegen_1$63._)`(new RegExp(${schemaCode}, ${u}))` : (0, code_1$23.usePattern)(cxt, schema$1);
			cxt.fail$data((0, codegen_1$63._)`!${regExp}.test(${data})`);
		}
	};
	exports.default = def$63;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$62 = require_codegen$1();
	const error$36 = {
		message({ keyword: keyword$1, schemaCode }) {
			const comp = keyword$1 === "maxProperties" ? "more" : "fewer";
			return (0, codegen_1$62.str)`must NOT have ${comp} than ${schemaCode} properties`;
		},
		params: ({ schemaCode }) => (0, codegen_1$62._)`{limit: ${schemaCode}}`
	};
	const def$62 = {
		keyword: ["maxProperties", "minProperties"],
		type: "object",
		schemaType: "number",
		$data: true,
		error: error$36,
		code(cxt) {
			const { keyword: keyword$1, data, schemaCode } = cxt;
			const op = keyword$1 === "maxProperties" ? codegen_1$62.operators.GT : codegen_1$62.operators.LT;
			cxt.fail$data((0, codegen_1$62._)`Object.keys(${data}).length ${op} ${schemaCode}`);
		}
	};
	exports.default = def$62;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/required.js
var require_required$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/required.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$22 = require_code$2();
	const codegen_1$61 = require_codegen$1();
	const util_1$52 = require_util$1();
	const error$35 = {
		message: ({ params: { missingProperty } }) => (0, codegen_1$61.str)`must have required property '${missingProperty}'`,
		params: ({ params: { missingProperty } }) => (0, codegen_1$61._)`{missingProperty: ${missingProperty}}`
	};
	const def$61 = {
		keyword: "required",
		type: "object",
		schemaType: "array",
		$data: true,
		error: error$35,
		code(cxt) {
			const { gen, schema: schema$1, schemaCode, data, $data, it } = cxt;
			const { opts } = it;
			if (!$data && schema$1.length === 0) return;
			const useLoop = schema$1.length >= opts.loopRequired;
			if (it.allErrors) allErrorsMode();
			else exitOnErrorMode();
			if (opts.strictRequired) {
				const props = cxt.parentSchema.properties;
				const { definedProperties } = cxt.it;
				for (const requiredKey of schema$1) if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
					const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
					const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
					(0, util_1$52.checkStrictMode)(it, msg, it.opts.strictRequired);
				}
			}
			function allErrorsMode() {
				if (useLoop || $data) cxt.block$data(codegen_1$61.nil, loopAllRequired);
				else for (const prop of schema$1) (0, code_1$22.checkReportMissingProp)(cxt, prop);
			}
			function exitOnErrorMode() {
				const missing = gen.let("missing");
				if (useLoop || $data) {
					const valid = gen.let("valid", true);
					cxt.block$data(valid, () => loopUntilMissing(missing, valid));
					cxt.ok(valid);
				} else {
					gen.if((0, code_1$22.checkMissingProp)(cxt, schema$1, missing));
					(0, code_1$22.reportMissingProp)(cxt, missing);
					gen.else();
				}
			}
			function loopAllRequired() {
				gen.forOf("prop", schemaCode, (prop) => {
					cxt.setParams({ missingProperty: prop });
					gen.if((0, code_1$22.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
				});
			}
			function loopUntilMissing(missing, valid) {
				cxt.setParams({ missingProperty: missing });
				gen.forOf(missing, schemaCode, () => {
					gen.assign(valid, (0, code_1$22.propertyInData)(gen, data, missing, opts.ownProperties));
					gen.if((0, codegen_1$61.not)(valid), () => {
						cxt.error();
						gen.break();
					});
				}, codegen_1$61.nil);
			}
		}
	};
	exports.default = def$61;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$60 = require_codegen$1();
	const error$34 = {
		message({ keyword: keyword$1, schemaCode }) {
			const comp = keyword$1 === "maxItems" ? "more" : "fewer";
			return (0, codegen_1$60.str)`must NOT have ${comp} than ${schemaCode} items`;
		},
		params: ({ schemaCode }) => (0, codegen_1$60._)`{limit: ${schemaCode}}`
	};
	const def$60 = {
		keyword: ["maxItems", "minItems"],
		type: "array",
		schemaType: "number",
		$data: true,
		error: error$34,
		code(cxt) {
			const { keyword: keyword$1, data, schemaCode } = cxt;
			const op = keyword$1 === "maxItems" ? codegen_1$60.operators.GT : codegen_1$60.operators.LT;
			cxt.fail$data((0, codegen_1$60._)`${data}.length ${op} ${schemaCode}`);
		}
	};
	exports.default = def$60;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/runtime/equal.js
var require_equal$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/runtime/equal.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const equal$2 = require_fast_deep_equal();
	equal$2.code = "require(\"ajv/dist/runtime/equal\").default";
	exports.default = equal$2;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const dataType_1$3 = require_dataType$1();
	const codegen_1$59 = require_codegen$1();
	const util_1$51 = require_util$1();
	const equal_1$5 = require_equal$1();
	const error$33 = {
		message: ({ params: { i, j } }) => (0, codegen_1$59.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
		params: ({ params: { i, j } }) => (0, codegen_1$59._)`{i: ${i}, j: ${j}}`
	};
	const def$59 = {
		keyword: "uniqueItems",
		type: "array",
		schemaType: "boolean",
		$data: true,
		error: error$33,
		code(cxt) {
			const { gen, data, $data, schema: schema$1, parentSchema, schemaCode, it } = cxt;
			if (!$data && !schema$1) return;
			const valid = gen.let("valid");
			const itemTypes = parentSchema.items ? (0, dataType_1$3.getSchemaTypes)(parentSchema.items) : [];
			cxt.block$data(valid, validateUniqueItems, (0, codegen_1$59._)`${schemaCode} === false`);
			cxt.ok(valid);
			function validateUniqueItems() {
				const i = gen.let("i", (0, codegen_1$59._)`${data}.length`);
				const j = gen.let("j");
				cxt.setParams({
					i,
					j
				});
				gen.assign(valid, true);
				gen.if((0, codegen_1$59._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
			}
			function canOptimize() {
				return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
			}
			function loopN(i, j) {
				const item = gen.name("item");
				const wrongType = (0, dataType_1$3.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1$3.DataType.Wrong);
				const indices = gen.const("indices", (0, codegen_1$59._)`{}`);
				gen.for((0, codegen_1$59._)`;${i}--;`, () => {
					gen.let(item, (0, codegen_1$59._)`${data}[${i}]`);
					gen.if(wrongType, (0, codegen_1$59._)`continue`);
					if (itemTypes.length > 1) gen.if((0, codegen_1$59._)`typeof ${item} == "string"`, (0, codegen_1$59._)`${item} += "_"`);
					gen.if((0, codegen_1$59._)`typeof ${indices}[${item}] == "number"`, () => {
						gen.assign(j, (0, codegen_1$59._)`${indices}[${item}]`);
						cxt.error();
						gen.assign(valid, false).break();
					}).code((0, codegen_1$59._)`${indices}[${item}] = ${i}`);
				});
			}
			function loopN2(i, j) {
				const eql = (0, util_1$51.useFunc)(gen, equal_1$5.default);
				const outer = gen.name("outer");
				gen.label(outer).for((0, codegen_1$59._)`;${i}--;`, () => gen.for((0, codegen_1$59._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1$59._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
					cxt.error();
					gen.assign(valid, false).break(outer);
				})));
			}
		}
	};
	exports.default = def$59;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/const.js
var require_const$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/const.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$58 = require_codegen$1();
	const util_1$50 = require_util$1();
	const equal_1$4 = require_equal$1();
	const error$32 = {
		message: "must be equal to constant",
		params: ({ schemaCode }) => (0, codegen_1$58._)`{allowedValue: ${schemaCode}}`
	};
	const def$58 = {
		keyword: "const",
		$data: true,
		error: error$32,
		code(cxt) {
			const { gen, data, $data, schemaCode, schema: schema$1 } = cxt;
			if ($data || schema$1 && typeof schema$1 == "object") cxt.fail$data((0, codegen_1$58._)`!${(0, util_1$50.useFunc)(gen, equal_1$4.default)}(${data}, ${schemaCode})`);
			else cxt.fail((0, codegen_1$58._)`${schema$1} !== ${data}`);
		}
	};
	exports.default = def$58;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/enum.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$57 = require_codegen$1();
	const util_1$49 = require_util$1();
	const equal_1$3 = require_equal$1();
	const error$31 = {
		message: "must be equal to one of the allowed values",
		params: ({ schemaCode }) => (0, codegen_1$57._)`{allowedValues: ${schemaCode}}`
	};
	const def$57 = {
		keyword: "enum",
		schemaType: "array",
		$data: true,
		error: error$31,
		code(cxt) {
			const { gen, data, $data, schema: schema$1, schemaCode, it } = cxt;
			if (!$data && schema$1.length === 0) throw new Error("enum must have non-empty array");
			const useLoop = schema$1.length >= it.opts.loopEnum;
			let eql;
			const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1$49.useFunc)(gen, equal_1$3.default);
			let valid;
			if (useLoop || $data) {
				valid = gen.let("valid");
				cxt.block$data(valid, loopEnum);
			} else {
				/* istanbul ignore if */
				if (!Array.isArray(schema$1)) throw new Error("ajv implementation error");
				const vSchema = gen.const("vSchema", schemaCode);
				valid = (0, codegen_1$57.or)(...schema$1.map((_x, i) => equalCode(vSchema, i)));
			}
			cxt.pass(valid);
			function loopEnum() {
				gen.assign(valid, false);
				gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1$57._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
			}
			function equalCode(vSchema, i) {
				const sch = schema$1[i];
				return typeof sch === "object" && sch !== null ? (0, codegen_1$57._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1$57._)`${data} === ${sch}`;
			}
		}
	};
	exports.default = def$57;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation$2 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const limitNumber_1$1 = require_limitNumber$1();
	const multipleOf_1$1 = require_multipleOf$1();
	const limitLength_1$1 = require_limitLength$1();
	const pattern_1$1 = require_pattern$1();
	const limitProperties_1$1 = require_limitProperties$1();
	const required_1$1 = require_required$1();
	const limitItems_1$1 = require_limitItems$1();
	const uniqueItems_1$1 = require_uniqueItems$1();
	const const_1$1 = require_const$1();
	const enum_1$1 = require_enum$1();
	const validation$2 = [
		limitNumber_1$1.default,
		multipleOf_1$1.default,
		limitLength_1$1.default,
		pattern_1$1.default,
		limitProperties_1$1.default,
		required_1$1.default,
		limitItems_1$1.default,
		uniqueItems_1$1.default,
		{
			keyword: "type",
			schemaType: ["string", "array"]
		},
		{
			keyword: "nullable",
			schemaType: "boolean"
		},
		const_1$1.default,
		enum_1$1.default
	];
	exports.default = validation$2;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateAdditionalItems = void 0;
	const codegen_1$56 = require_codegen$1();
	const util_1$48 = require_util$1();
	const error$30 = {
		message: ({ params: { len } }) => (0, codegen_1$56.str)`must NOT have more than ${len} items`,
		params: ({ params: { len } }) => (0, codegen_1$56._)`{limit: ${len}}`
	};
	const def$56 = {
		keyword: "additionalItems",
		type: "array",
		schemaType: ["boolean", "object"],
		before: "uniqueItems",
		error: error$30,
		code(cxt) {
			const { parentSchema, it } = cxt;
			const { items } = parentSchema;
			if (!Array.isArray(items)) {
				(0, util_1$48.checkStrictMode)(it, "\"additionalItems\" is ignored when \"items\" is not an array of schemas");
				return;
			}
			validateAdditionalItems$1(cxt, items);
		}
	};
	function validateAdditionalItems$1(cxt, items) {
		const { gen, schema: schema$1, data, keyword: keyword$1, it } = cxt;
		it.items = true;
		const len = gen.const("len", (0, codegen_1$56._)`${data}.length`);
		if (schema$1 === false) {
			cxt.setParams({ len: items.length });
			cxt.pass((0, codegen_1$56._)`${len} <= ${items.length}`);
		} else if (typeof schema$1 == "object" && !(0, util_1$48.alwaysValidSchema)(it, schema$1)) {
			const valid = gen.var("valid", (0, codegen_1$56._)`${len} <= ${items.length}`);
			gen.if((0, codegen_1$56.not)(valid), () => validateItems(valid));
			cxt.ok(valid);
		}
		function validateItems(valid) {
			gen.forRange("i", items.length, len, (i) => {
				cxt.subschema({
					keyword: keyword$1,
					dataProp: i,
					dataPropType: util_1$48.Type.Num
				}, valid);
				if (!it.allErrors) gen.if((0, codegen_1$56.not)(valid), () => gen.break());
			});
		}
	}
	exports.validateAdditionalItems = validateAdditionalItems$1;
	exports.default = def$56;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/items.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateTuple = void 0;
	const codegen_1$55 = require_codegen$1();
	const util_1$47 = require_util$1();
	const code_1$21 = require_code$2();
	const def$55 = {
		keyword: "items",
		type: "array",
		schemaType: [
			"object",
			"array",
			"boolean"
		],
		before: "uniqueItems",
		code(cxt) {
			const { schema: schema$1, it } = cxt;
			if (Array.isArray(schema$1)) return validateTuple$1(cxt, "additionalItems", schema$1);
			it.items = true;
			if ((0, util_1$47.alwaysValidSchema)(it, schema$1)) return;
			cxt.ok((0, code_1$21.validateArray)(cxt));
		}
	};
	function validateTuple$1(cxt, extraItems, schArr = cxt.schema) {
		const { gen, parentSchema, data, keyword: keyword$1, it } = cxt;
		checkStrictTuple(parentSchema);
		if (it.opts.unevaluated && schArr.length && it.items !== true) it.items = util_1$47.mergeEvaluated.items(gen, schArr.length, it.items);
		const valid = gen.name("valid");
		const len = gen.const("len", (0, codegen_1$55._)`${data}.length`);
		schArr.forEach((sch, i) => {
			if ((0, util_1$47.alwaysValidSchema)(it, sch)) return;
			gen.if((0, codegen_1$55._)`${len} > ${i}`, () => cxt.subschema({
				keyword: keyword$1,
				schemaProp: i,
				dataProp: i
			}, valid));
			cxt.ok(valid);
		});
		function checkStrictTuple(sch) {
			const { opts, errSchemaPath } = it;
			const l = schArr.length;
			const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
			if (opts.strictTuples && !fullTuple) {
				const msg = `"${keyword$1}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
				(0, util_1$47.checkStrictMode)(it, msg, opts.strictTuples);
			}
		}
	}
	exports.validateTuple = validateTuple$1;
	exports.default = def$55;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const items_1$3 = require_items$1();
	const def$54 = {
		keyword: "prefixItems",
		type: "array",
		schemaType: ["array"],
		before: "uniqueItems",
		code: (cxt) => (0, items_1$3.validateTuple)(cxt, "items")
	};
	exports.default = def$54;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$54 = require_codegen$1();
	const util_1$46 = require_util$1();
	const code_1$20 = require_code$2();
	const additionalItems_1$3 = require_additionalItems$1();
	const error$29 = {
		message: ({ params: { len } }) => (0, codegen_1$54.str)`must NOT have more than ${len} items`,
		params: ({ params: { len } }) => (0, codegen_1$54._)`{limit: ${len}}`
	};
	const def$53 = {
		keyword: "items",
		type: "array",
		schemaType: ["object", "boolean"],
		before: "uniqueItems",
		error: error$29,
		code(cxt) {
			const { schema: schema$1, parentSchema, it } = cxt;
			const { prefixItems } = parentSchema;
			it.items = true;
			if ((0, util_1$46.alwaysValidSchema)(it, schema$1)) return;
			if (prefixItems) (0, additionalItems_1$3.validateAdditionalItems)(cxt, prefixItems);
			else cxt.ok((0, code_1$20.validateArray)(cxt));
		}
	};
	exports.default = def$53;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$53 = require_codegen$1();
	const util_1$45 = require_util$1();
	const error$28 = {
		message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$53.str)`must contain at least ${min} valid item(s)` : (0, codegen_1$53.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
		params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$53._)`{minContains: ${min}}` : (0, codegen_1$53._)`{minContains: ${min}, maxContains: ${max}}`
	};
	const def$52 = {
		keyword: "contains",
		type: "array",
		schemaType: ["object", "boolean"],
		before: "uniqueItems",
		trackErrors: true,
		error: error$28,
		code(cxt) {
			const { gen, schema: schema$1, parentSchema, data, it } = cxt;
			let min;
			let max;
			const { minContains, maxContains } = parentSchema;
			if (it.opts.next) {
				min = minContains === void 0 ? 1 : minContains;
				max = maxContains;
			} else min = 1;
			const len = gen.const("len", (0, codegen_1$53._)`${data}.length`);
			cxt.setParams({
				min,
				max
			});
			if (max === void 0 && min === 0) {
				(0, util_1$45.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
				return;
			}
			if (max !== void 0 && min > max) {
				(0, util_1$45.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
				cxt.fail();
				return;
			}
			if ((0, util_1$45.alwaysValidSchema)(it, schema$1)) {
				let cond = (0, codegen_1$53._)`${len} >= ${min}`;
				if (max !== void 0) cond = (0, codegen_1$53._)`${cond} && ${len} <= ${max}`;
				cxt.pass(cond);
				return;
			}
			it.items = true;
			const valid = gen.name("valid");
			if (max === void 0 && min === 1) validateItems(valid, () => gen.if(valid, () => gen.break()));
			else if (min === 0) {
				gen.let(valid, true);
				if (max !== void 0) gen.if((0, codegen_1$53._)`${data}.length > 0`, validateItemsWithCount);
			} else {
				gen.let(valid, false);
				validateItemsWithCount();
			}
			cxt.result(valid, () => cxt.reset());
			function validateItemsWithCount() {
				const schValid = gen.name("_valid");
				const count = gen.let("count", 0);
				validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
			}
			function validateItems(_valid, block) {
				gen.forRange("i", 0, len, (i) => {
					cxt.subschema({
						keyword: "contains",
						dataProp: i,
						dataPropType: util_1$45.Type.Num,
						compositeRule: true
					}, _valid);
					block();
				});
			}
			function checkLimits(count) {
				gen.code((0, codegen_1$53._)`${count}++`);
				if (max === void 0) gen.if((0, codegen_1$53._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
				else {
					gen.if((0, codegen_1$53._)`${count} > ${max}`, () => gen.assign(valid, false).break());
					if (min === 1) gen.assign(valid, true);
					else gen.if((0, codegen_1$53._)`${count} >= ${min}`, () => gen.assign(valid, true));
				}
			}
		}
	};
	exports.default = def$52;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
	const codegen_1$52 = require_codegen$1();
	const util_1$44 = require_util$1();
	const code_1$19 = require_code$2();
	exports.error = {
		message: ({ params: { property, depsCount, deps } }) => {
			const property_ies = depsCount === 1 ? "property" : "properties";
			return (0, codegen_1$52.str)`must have ${property_ies} ${deps} when property ${property} is present`;
		},
		params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1$52._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
	};
	const def$51 = {
		keyword: "dependencies",
		type: "object",
		schemaType: "object",
		error: exports.error,
		code(cxt) {
			const [propDeps, schDeps] = splitDependencies$1(cxt);
			validatePropertyDeps$1(cxt, propDeps);
			validateSchemaDeps$1(cxt, schDeps);
		}
	};
	function splitDependencies$1({ schema: schema$1 }) {
		const propertyDeps = {};
		const schemaDeps = {};
		for (const key in schema$1) {
			if (key === "__proto__") continue;
			const deps = Array.isArray(schema$1[key]) ? propertyDeps : schemaDeps;
			deps[key] = schema$1[key];
		}
		return [propertyDeps, schemaDeps];
	}
	function validatePropertyDeps$1(cxt, propertyDeps = cxt.schema) {
		const { gen, data, it } = cxt;
		if (Object.keys(propertyDeps).length === 0) return;
		const missing = gen.let("missing");
		for (const prop in propertyDeps) {
			const deps = propertyDeps[prop];
			if (deps.length === 0) continue;
			const hasProperty = (0, code_1$19.propertyInData)(gen, data, prop, it.opts.ownProperties);
			cxt.setParams({
				property: prop,
				depsCount: deps.length,
				deps: deps.join(", ")
			});
			if (it.allErrors) gen.if(hasProperty, () => {
				for (const depProp of deps) (0, code_1$19.checkReportMissingProp)(cxt, depProp);
			});
			else {
				gen.if((0, codegen_1$52._)`${hasProperty} && (${(0, code_1$19.checkMissingProp)(cxt, deps, missing)})`);
				(0, code_1$19.reportMissingProp)(cxt, missing);
				gen.else();
			}
		}
	}
	exports.validatePropertyDeps = validatePropertyDeps$1;
	function validateSchemaDeps$1(cxt, schemaDeps = cxt.schema) {
		const { gen, data, keyword: keyword$1, it } = cxt;
		const valid = gen.name("valid");
		for (const prop in schemaDeps) {
			if ((0, util_1$44.alwaysValidSchema)(it, schemaDeps[prop])) continue;
			gen.if((0, code_1$19.propertyInData)(gen, data, prop, it.opts.ownProperties), () => {
				const schCxt = cxt.subschema({
					keyword: keyword$1,
					schemaProp: prop
				}, valid);
				cxt.mergeValidEvaluated(schCxt, valid);
			}, () => gen.var(valid, true));
			cxt.ok(valid);
		}
	}
	exports.validateSchemaDeps = validateSchemaDeps$1;
	exports.default = def$51;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$51 = require_codegen$1();
	const util_1$43 = require_util$1();
	const error$27 = {
		message: "property name must be valid",
		params: ({ params }) => (0, codegen_1$51._)`{propertyName: ${params.propertyName}}`
	};
	const def$50 = {
		keyword: "propertyNames",
		type: "object",
		schemaType: ["object", "boolean"],
		error: error$27,
		code(cxt) {
			const { gen, schema: schema$1, data, it } = cxt;
			if ((0, util_1$43.alwaysValidSchema)(it, schema$1)) return;
			const valid = gen.name("valid");
			gen.forIn("key", data, (key) => {
				cxt.setParams({ propertyName: key });
				cxt.subschema({
					keyword: "propertyNames",
					data: key,
					dataTypes: ["string"],
					propertyName: key,
					compositeRule: true
				}, valid);
				gen.if((0, codegen_1$51.not)(valid), () => {
					cxt.error(true);
					if (!it.allErrors) gen.break();
				});
			});
			cxt.ok(valid);
		}
	};
	exports.default = def$50;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$18 = require_code$2();
	const codegen_1$50 = require_codegen$1();
	const names_1$12 = require_names$1();
	const util_1$42 = require_util$1();
	const error$26 = {
		message: "must NOT have additional properties",
		params: ({ params }) => (0, codegen_1$50._)`{additionalProperty: ${params.additionalProperty}}`
	};
	const def$49 = {
		keyword: "additionalProperties",
		type: ["object"],
		schemaType: ["boolean", "object"],
		allowUndefined: true,
		trackErrors: true,
		error: error$26,
		code(cxt) {
			const { gen, schema: schema$1, parentSchema, data, errsCount, it } = cxt;
			/* istanbul ignore if */
			if (!errsCount) throw new Error("ajv implementation error");
			const { allErrors, opts } = it;
			it.props = true;
			if (opts.removeAdditional !== "all" && (0, util_1$42.alwaysValidSchema)(it, schema$1)) return;
			const props = (0, code_1$18.allSchemaProperties)(parentSchema.properties);
			const patProps = (0, code_1$18.allSchemaProperties)(parentSchema.patternProperties);
			checkAdditionalProperties();
			cxt.ok((0, codegen_1$50._)`${errsCount} === ${names_1$12.default.errors}`);
			function checkAdditionalProperties() {
				gen.forIn("key", data, (key) => {
					if (!props.length && !patProps.length) additionalPropertyCode(key);
					else gen.if(isAdditional(key), () => additionalPropertyCode(key));
				});
			}
			function isAdditional(key) {
				let definedProp;
				if (props.length > 8) {
					const propsSchema = (0, util_1$42.schemaRefOrVal)(it, parentSchema.properties, "properties");
					definedProp = (0, code_1$18.isOwnProperty)(gen, propsSchema, key);
				} else if (props.length) definedProp = (0, codegen_1$50.or)(...props.map((p) => (0, codegen_1$50._)`${key} === ${p}`));
				else definedProp = codegen_1$50.nil;
				if (patProps.length) definedProp = (0, codegen_1$50.or)(definedProp, ...patProps.map((p) => (0, codegen_1$50._)`${(0, code_1$18.usePattern)(cxt, p)}.test(${key})`));
				return (0, codegen_1$50.not)(definedProp);
			}
			function deleteAdditional(key) {
				gen.code((0, codegen_1$50._)`delete ${data}[${key}]`);
			}
			function additionalPropertyCode(key) {
				if (opts.removeAdditional === "all" || opts.removeAdditional && schema$1 === false) {
					deleteAdditional(key);
					return;
				}
				if (schema$1 === false) {
					cxt.setParams({ additionalProperty: key });
					cxt.error();
					if (!allErrors) gen.break();
					return;
				}
				if (typeof schema$1 == "object" && !(0, util_1$42.alwaysValidSchema)(it, schema$1)) {
					const valid = gen.name("valid");
					if (opts.removeAdditional === "failing") {
						applyAdditionalSchema(key, valid, false);
						gen.if((0, codegen_1$50.not)(valid), () => {
							cxt.reset();
							deleteAdditional(key);
						});
					} else {
						applyAdditionalSchema(key, valid);
						if (!allErrors) gen.if((0, codegen_1$50.not)(valid), () => gen.break());
					}
				}
			}
			function applyAdditionalSchema(key, valid, errors) {
				const subschema = {
					keyword: "additionalProperties",
					dataProp: key,
					dataPropType: util_1$42.Type.Str
				};
				if (errors === false) Object.assign(subschema, {
					compositeRule: true,
					createErrors: false,
					allErrors: false
				});
				cxt.subschema(subschema, valid);
			}
		}
	};
	exports.default = def$49;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const validate_1$7 = require_validate$1();
	const code_1$17 = require_code$2();
	const util_1$41 = require_util$1();
	const additionalProperties_1$3 = require_additionalProperties$1();
	const def$48 = {
		keyword: "properties",
		type: "object",
		schemaType: "object",
		code(cxt) {
			const { gen, schema: schema$1, parentSchema, data, it } = cxt;
			if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) additionalProperties_1$3.default.code(new validate_1$7.KeywordCxt(it, additionalProperties_1$3.default, "additionalProperties"));
			const allProps = (0, code_1$17.allSchemaProperties)(schema$1);
			for (const prop of allProps) it.definedProperties.add(prop);
			if (it.opts.unevaluated && allProps.length && it.props !== true) it.props = util_1$41.mergeEvaluated.props(gen, (0, util_1$41.toHash)(allProps), it.props);
			const properties = allProps.filter((p) => !(0, util_1$41.alwaysValidSchema)(it, schema$1[p]));
			if (properties.length === 0) return;
			const valid = gen.name("valid");
			for (const prop of properties) {
				if (hasDefault(prop)) applyPropertySchema(prop);
				else {
					gen.if((0, code_1$17.propertyInData)(gen, data, prop, it.opts.ownProperties));
					applyPropertySchema(prop);
					if (!it.allErrors) gen.else().var(valid, true);
					gen.endIf();
				}
				cxt.it.definedProperties.add(prop);
				cxt.ok(valid);
			}
			function hasDefault(prop) {
				return it.opts.useDefaults && !it.compositeRule && schema$1[prop].default !== void 0;
			}
			function applyPropertySchema(prop) {
				cxt.subschema({
					keyword: "properties",
					schemaProp: prop,
					dataProp: prop
				}, valid);
			}
		}
	};
	exports.default = def$48;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$16 = require_code$2();
	const codegen_1$49 = require_codegen$1();
	const util_1$40 = require_util$1();
	const util_2$2 = require_util$1();
	const def$47 = {
		keyword: "patternProperties",
		type: "object",
		schemaType: "object",
		code(cxt) {
			const { gen, schema: schema$1, data, parentSchema, it } = cxt;
			const { opts } = it;
			const patterns = (0, code_1$16.allSchemaProperties)(schema$1);
			const alwaysValidPatterns = patterns.filter((p) => (0, util_1$40.alwaysValidSchema)(it, schema$1[p]));
			if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) return;
			const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
			const valid = gen.name("valid");
			if (it.props !== true && !(it.props instanceof codegen_1$49.Name)) it.props = (0, util_2$2.evaluatedPropsToName)(gen, it.props);
			const { props } = it;
			validatePatternProperties();
			function validatePatternProperties() {
				for (const pat of patterns) {
					if (checkProperties) checkMatchingProperties(pat);
					if (it.allErrors) validateProperties(pat);
					else {
						gen.var(valid, true);
						validateProperties(pat);
						gen.if(valid);
					}
				}
			}
			function checkMatchingProperties(pat) {
				for (const prop in checkProperties) if (new RegExp(pat).test(prop)) (0, util_1$40.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
			}
			function validateProperties(pat) {
				gen.forIn("key", data, (key) => {
					gen.if((0, codegen_1$49._)`${(0, code_1$16.usePattern)(cxt, pat)}.test(${key})`, () => {
						const alwaysValid = alwaysValidPatterns.includes(pat);
						if (!alwaysValid) cxt.subschema({
							keyword: "patternProperties",
							schemaProp: pat,
							dataProp: key,
							dataPropType: util_2$2.Type.Str
						}, valid);
						if (it.opts.unevaluated && props !== true) gen.assign((0, codegen_1$49._)`${props}[${key}]`, true);
						else if (!alwaysValid && !it.allErrors) gen.if((0, codegen_1$49.not)(valid), () => gen.break());
					});
				});
			}
		}
	};
	exports.default = def$47;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/not.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const util_1$39 = require_util$1();
	const def$46 = {
		keyword: "not",
		schemaType: ["object", "boolean"],
		trackErrors: true,
		code(cxt) {
			const { gen, schema: schema$1, it } = cxt;
			if ((0, util_1$39.alwaysValidSchema)(it, schema$1)) {
				cxt.fail();
				return;
			}
			const valid = gen.name("valid");
			cxt.subschema({
				keyword: "not",
				compositeRule: true,
				createErrors: false,
				allErrors: false
			}, valid);
			cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
		},
		error: { message: "must NOT be valid" }
	};
	exports.default = def$46;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$15 = require_code$2();
	const def$45 = {
		keyword: "anyOf",
		schemaType: "array",
		trackErrors: true,
		code: code_1$15.validateUnion,
		error: { message: "must match a schema in anyOf" }
	};
	exports.default = def$45;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$48 = require_codegen$1();
	const util_1$38 = require_util$1();
	const error$25 = {
		message: "must match exactly one schema in oneOf",
		params: ({ params }) => (0, codegen_1$48._)`{passingSchemas: ${params.passing}}`
	};
	const def$44 = {
		keyword: "oneOf",
		schemaType: "array",
		trackErrors: true,
		error: error$25,
		code(cxt) {
			const { gen, schema: schema$1, parentSchema, it } = cxt;
			/* istanbul ignore if */
			if (!Array.isArray(schema$1)) throw new Error("ajv implementation error");
			if (it.opts.discriminator && parentSchema.discriminator) return;
			const schArr = schema$1;
			const valid = gen.let("valid", false);
			const passing = gen.let("passing", null);
			const schValid = gen.name("_valid");
			cxt.setParams({ passing });
			gen.block(validateOneOf);
			cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
			function validateOneOf() {
				schArr.forEach((sch, i) => {
					let schCxt;
					if ((0, util_1$38.alwaysValidSchema)(it, sch)) gen.var(schValid, true);
					else schCxt = cxt.subschema({
						keyword: "oneOf",
						schemaProp: i,
						compositeRule: true
					}, schValid);
					if (i > 0) gen.if((0, codegen_1$48._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1$48._)`[${passing}, ${i}]`).else();
					gen.if(schValid, () => {
						gen.assign(valid, true);
						gen.assign(passing, i);
						if (schCxt) cxt.mergeEvaluated(schCxt, codegen_1$48.Name);
					});
				});
			}
		}
	};
	exports.default = def$44;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const util_1$37 = require_util$1();
	const def$43 = {
		keyword: "allOf",
		schemaType: "array",
		code(cxt) {
			const { gen, schema: schema$1, it } = cxt;
			/* istanbul ignore if */
			if (!Array.isArray(schema$1)) throw new Error("ajv implementation error");
			const valid = gen.name("valid");
			schema$1.forEach((sch, i) => {
				if ((0, util_1$37.alwaysValidSchema)(it, sch)) return;
				const schCxt = cxt.subschema({
					keyword: "allOf",
					schemaProp: i
				}, valid);
				cxt.ok(valid);
				cxt.mergeEvaluated(schCxt);
			});
		}
	};
	exports.default = def$43;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/if.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$47 = require_codegen$1();
	const util_1$36 = require_util$1();
	const error$24 = {
		message: ({ params }) => (0, codegen_1$47.str)`must match "${params.ifClause}" schema`,
		params: ({ params }) => (0, codegen_1$47._)`{failingKeyword: ${params.ifClause}}`
	};
	const def$42 = {
		keyword: "if",
		schemaType: ["object", "boolean"],
		trackErrors: true,
		error: error$24,
		code(cxt) {
			const { gen, parentSchema, it } = cxt;
			if (parentSchema.then === void 0 && parentSchema.else === void 0) (0, util_1$36.checkStrictMode)(it, "\"if\" without \"then\" and \"else\" is ignored");
			const hasThen = hasSchema$1(it, "then");
			const hasElse = hasSchema$1(it, "else");
			if (!hasThen && !hasElse) return;
			const valid = gen.let("valid", true);
			const schValid = gen.name("_valid");
			validateIf();
			cxt.reset();
			if (hasThen && hasElse) {
				const ifClause = gen.let("ifClause");
				cxt.setParams({ ifClause });
				gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
			} else if (hasThen) gen.if(schValid, validateClause("then"));
			else gen.if((0, codegen_1$47.not)(schValid), validateClause("else"));
			cxt.pass(valid, () => cxt.error(true));
			function validateIf() {
				const schCxt = cxt.subschema({
					keyword: "if",
					compositeRule: true,
					createErrors: false,
					allErrors: false
				}, schValid);
				cxt.mergeEvaluated(schCxt);
			}
			function validateClause(keyword$1, ifClause) {
				return () => {
					const schCxt = cxt.subschema({ keyword: keyword$1 }, schValid);
					gen.assign(valid, schValid);
					cxt.mergeValidEvaluated(schCxt, valid);
					if (ifClause) gen.assign(ifClause, (0, codegen_1$47._)`${keyword$1}`);
					else cxt.setParams({ ifClause: keyword$1 });
				};
			}
		}
	};
	function hasSchema$1(it, keyword$1) {
		const schema$1 = it.schema[keyword$1];
		return schema$1 !== void 0 && !(0, util_1$36.alwaysValidSchema)(it, schema$1);
	}
	exports.default = def$42;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const util_1$35 = require_util$1();
	const def$41 = {
		keyword: ["then", "else"],
		schemaType: ["object", "boolean"],
		code({ keyword: keyword$1, parentSchema, it }) {
			if (parentSchema.if === void 0) (0, util_1$35.checkStrictMode)(it, `"${keyword$1}" without "if" is ignored`);
		}
	};
	exports.default = def$41;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator$2 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const additionalItems_1$2 = require_additionalItems$1();
	const prefixItems_1$1 = require_prefixItems$1();
	const items_1$2 = require_items$1();
	const items2020_1$1 = require_items2020$1();
	const contains_1$1 = require_contains$1();
	const dependencies_1$3 = require_dependencies$1();
	const propertyNames_1$1 = require_propertyNames$1();
	const additionalProperties_1$2 = require_additionalProperties$1();
	const properties_1$1 = require_properties$1();
	const patternProperties_1$1 = require_patternProperties$1();
	const not_1$1 = require_not$1();
	const anyOf_1$1 = require_anyOf$1();
	const oneOf_1$1 = require_oneOf$1();
	const allOf_1$1 = require_allOf$1();
	const if_1$1 = require_if$1();
	const thenElse_1$1 = require_thenElse$1();
	function getApplicator$1(draft2020 = false) {
		const applicator$1 = [
			not_1$1.default,
			anyOf_1$1.default,
			oneOf_1$1.default,
			allOf_1$1.default,
			if_1$1.default,
			thenElse_1$1.default,
			propertyNames_1$1.default,
			additionalProperties_1$2.default,
			dependencies_1$3.default,
			properties_1$1.default,
			patternProperties_1$1.default
		];
		if (draft2020) applicator$1.push(prefixItems_1$1.default, items2020_1$1.default);
		else applicator$1.push(additionalItems_1$2.default, items_1$2.default);
		applicator$1.push(contains_1$1.default);
		return applicator$1;
	}
	exports.default = getApplicator$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/format/format.js
var require_format$3 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/format/format.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$46 = require_codegen$1();
	const error$23 = {
		message: ({ schemaCode }) => (0, codegen_1$46.str)`must match format "${schemaCode}"`,
		params: ({ schemaCode }) => (0, codegen_1$46._)`{format: ${schemaCode}}`
	};
	const def$40 = {
		keyword: "format",
		type: ["number", "string"],
		schemaType: "string",
		$data: true,
		error: error$23,
		code(cxt, ruleType) {
			const { gen, data, $data, schema: schema$1, schemaCode, it } = cxt;
			const { opts, errSchemaPath, schemaEnv, self } = it;
			if (!opts.validateFormats) return;
			if ($data) validate$DataFormat();
			else validateFormat();
			function validate$DataFormat() {
				const fmts = gen.scopeValue("formats", {
					ref: self.formats,
					code: opts.code.formats
				});
				const fDef = gen.const("fDef", (0, codegen_1$46._)`${fmts}[${schemaCode}]`);
				const fType = gen.let("fType");
				const format$3 = gen.let("format");
				gen.if((0, codegen_1$46._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1$46._)`${fDef}.type || "string"`).assign(format$3, (0, codegen_1$46._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1$46._)`"string"`).assign(format$3, fDef));
				cxt.fail$data((0, codegen_1$46.or)(unknownFmt(), invalidFmt()));
				function unknownFmt() {
					if (opts.strictSchema === false) return codegen_1$46.nil;
					return (0, codegen_1$46._)`${schemaCode} && !${format$3}`;
				}
				function invalidFmt() {
					const callFormat = schemaEnv.$async ? (0, codegen_1$46._)`(${fDef}.async ? await ${format$3}(${data}) : ${format$3}(${data}))` : (0, codegen_1$46._)`${format$3}(${data})`;
					const validData = (0, codegen_1$46._)`(typeof ${format$3} == "function" ? ${callFormat} : ${format$3}.test(${data}))`;
					return (0, codegen_1$46._)`${format$3} && ${format$3} !== true && ${fType} === ${ruleType} && !${validData}`;
				}
			}
			function validateFormat() {
				const formatDef = self.formats[schema$1];
				if (!formatDef) {
					unknownFormat();
					return;
				}
				if (formatDef === true) return;
				const [fmtType, format$3, fmtRef] = getFormat(formatDef);
				if (fmtType === ruleType) cxt.pass(validCondition());
				function unknownFormat() {
					if (opts.strictSchema === false) {
						self.logger.warn(unknownMsg());
						return;
					}
					throw new Error(unknownMsg());
					function unknownMsg() {
						return `unknown format "${schema$1}" ignored in schema at path "${errSchemaPath}"`;
					}
				}
				function getFormat(fmtDef$1) {
					const code = fmtDef$1 instanceof RegExp ? (0, codegen_1$46.regexpCode)(fmtDef$1) : opts.code.formats ? (0, codegen_1$46._)`${opts.code.formats}${(0, codegen_1$46.getProperty)(schema$1)}` : void 0;
					const fmt = gen.scopeValue("formats", {
						key: schema$1,
						ref: fmtDef$1,
						code
					});
					if (typeof fmtDef$1 == "object" && !(fmtDef$1 instanceof RegExp)) return [
						fmtDef$1.type || "string",
						fmtDef$1.validate,
						(0, codegen_1$46._)`${fmt}.validate`
					];
					return [
						"string",
						fmtDef$1,
						fmt
					];
				}
				function validCondition() {
					if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
						if (!schemaEnv.$async) throw new Error("async format in sync schema");
						return (0, codegen_1$46._)`await ${fmtRef}(${data})`;
					}
					return typeof format$3 == "function" ? (0, codegen_1$46._)`${fmtRef}(${data})` : (0, codegen_1$46._)`${fmtRef}.test(${data})`;
				}
			}
		}
	};
	exports.default = def$40;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/format/index.js
var require_format$2 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/format/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const format_1$4 = require_format$3();
	const format$2 = [format_1$4.default];
	exports.default = format$2;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/metadata.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.contentVocabulary = exports.metadataVocabulary = void 0;
	exports.metadataVocabulary = [
		"title",
		"description",
		"default",
		"deprecated",
		"readOnly",
		"writeOnly",
		"examples"
	];
	exports.contentVocabulary = [
		"contentMediaType",
		"contentEncoding",
		"contentSchema"
	];
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/draft7.js
var require_draft7$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/draft7.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const core_1$5 = require_core$3();
	const validation_1$2 = require_validation$2();
	const applicator_1$2 = require_applicator$2();
	const format_1$3 = require_format$2();
	const metadata_1$2 = require_metadata$1();
	const draft7Vocabularies$1 = [
		core_1$5.default,
		validation_1$2.default,
		(0, applicator_1$2.default)(),
		format_1$3.default,
		metadata_1$2.metadataVocabulary,
		metadata_1$2.contentVocabulary
	];
	exports.default = draft7Vocabularies$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types$2 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DiscrError = void 0;
	var DiscrError$1;
	(function(DiscrError$2) {
		DiscrError$2["Tag"] = "tag";
		DiscrError$2["Mapping"] = "mapping";
	})(DiscrError$1 || (exports.DiscrError = DiscrError$1 = {}));
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$45 = require_codegen$1();
	const types_1$12 = require_types$2();
	const compile_1$4 = require_compile$1();
	const ref_error_1$6 = require_ref_error$1();
	const util_1$34 = require_util$1();
	const error$22 = {
		message: ({ params: { discrError, tagName } }) => discrError === types_1$12.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
		params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1$45._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
	};
	const def$39 = {
		keyword: "discriminator",
		type: "object",
		schemaType: "object",
		error: error$22,
		code(cxt) {
			const { gen, data, schema: schema$1, parentSchema, it } = cxt;
			const { oneOf } = parentSchema;
			if (!it.opts.discriminator) throw new Error("discriminator: requires discriminator option");
			const tagName = schema$1.propertyName;
			if (typeof tagName != "string") throw new Error("discriminator: requires propertyName");
			if (schema$1.mapping) throw new Error("discriminator: mapping is not supported");
			if (!oneOf) throw new Error("discriminator: requires oneOf keyword");
			const valid = gen.let("valid", false);
			const tag = gen.const("tag", (0, codegen_1$45._)`${data}${(0, codegen_1$45.getProperty)(tagName)}`);
			gen.if((0, codegen_1$45._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, {
				discrError: types_1$12.DiscrError.Tag,
				tag,
				tagName
			}));
			cxt.ok(valid);
			function validateMapping() {
				const mapping = getMapping();
				gen.if(false);
				for (const tagValue in mapping) {
					gen.elseIf((0, codegen_1$45._)`${tag} === ${tagValue}`);
					gen.assign(valid, applyTagSchema(mapping[tagValue]));
				}
				gen.else();
				cxt.error(false, {
					discrError: types_1$12.DiscrError.Mapping,
					tag,
					tagName
				});
				gen.endIf();
			}
			function applyTagSchema(schemaProp) {
				const _valid = gen.name("valid");
				const schCxt = cxt.subschema({
					keyword: "oneOf",
					schemaProp
				}, _valid);
				cxt.mergeEvaluated(schCxt, codegen_1$45.Name);
				return _valid;
			}
			function getMapping() {
				var _a$4;
				const oneOfMapping = {};
				const topRequired = hasRequired(parentSchema);
				let tagRequired = true;
				for (let i = 0; i < oneOf.length; i++) {
					let sch = oneOf[i];
					if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1$34.schemaHasRulesButRef)(sch, it.self.RULES)) {
						const ref = sch.$ref;
						sch = compile_1$4.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
						if (sch instanceof compile_1$4.SchemaEnv) sch = sch.schema;
						if (sch === void 0) throw new ref_error_1$6.default(it.opts.uriResolver, it.baseId, ref);
					}
					const propSch = (_a$4 = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a$4 === void 0 ? void 0 : _a$4[tagName];
					if (typeof propSch != "object") throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
					tagRequired = tagRequired && (topRequired || hasRequired(sch));
					addMappings(propSch, i);
				}
				if (!tagRequired) throw new Error(`discriminator: "${tagName}" must be required`);
				return oneOfMapping;
				function hasRequired({ required }) {
					return Array.isArray(required) && required.includes(tagName);
				}
				function addMappings(sch, i) {
					if (sch.const) addMapping(sch.const, i);
					else if (sch.enum) for (const tagValue of sch.enum) addMapping(tagValue, i);
					else throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
				}
				function addMapping(tagValue, i) {
					if (typeof tagValue != "string" || tagValue in oneOfMapping) throw new Error(`discriminator: "${tagName}" values must be unique strings`);
					oneOfMapping[tagValue] = i;
				}
			}
		}
	};
	exports.default = def$39;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-draft-07.json
var require_json_schema_draft_07$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-draft-07.json"(exports, module) {
	module.exports = {
		"$schema": "http://json-schema.org/draft-07/schema#",
		"$id": "http://json-schema.org/draft-07/schema#",
		"title": "Core schema meta-schema",
		"definitions": {
			"schemaArray": {
				"type": "array",
				"minItems": 1,
				"items": { "$ref": "#" }
			},
			"nonNegativeInteger": {
				"type": "integer",
				"minimum": 0
			},
			"nonNegativeIntegerDefault0": { "allOf": [{ "$ref": "#/definitions/nonNegativeInteger" }, { "default": 0 }] },
			"simpleTypes": { "enum": [
				"array",
				"boolean",
				"integer",
				"null",
				"number",
				"object",
				"string"
			] },
			"stringArray": {
				"type": "array",
				"items": { "type": "string" },
				"uniqueItems": true,
				"default": []
			}
		},
		"type": ["object", "boolean"],
		"properties": {
			"$id": {
				"type": "string",
				"format": "uri-reference"
			},
			"$schema": {
				"type": "string",
				"format": "uri"
			},
			"$ref": {
				"type": "string",
				"format": "uri-reference"
			},
			"$comment": { "type": "string" },
			"title": { "type": "string" },
			"description": { "type": "string" },
			"default": true,
			"readOnly": {
				"type": "boolean",
				"default": false
			},
			"examples": {
				"type": "array",
				"items": true
			},
			"multipleOf": {
				"type": "number",
				"exclusiveMinimum": 0
			},
			"maximum": { "type": "number" },
			"exclusiveMaximum": { "type": "number" },
			"minimum": { "type": "number" },
			"exclusiveMinimum": { "type": "number" },
			"maxLength": { "$ref": "#/definitions/nonNegativeInteger" },
			"minLength": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
			"pattern": {
				"type": "string",
				"format": "regex"
			},
			"additionalItems": { "$ref": "#" },
			"items": {
				"anyOf": [{ "$ref": "#" }, { "$ref": "#/definitions/schemaArray" }],
				"default": true
			},
			"maxItems": { "$ref": "#/definitions/nonNegativeInteger" },
			"minItems": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
			"uniqueItems": {
				"type": "boolean",
				"default": false
			},
			"contains": { "$ref": "#" },
			"maxProperties": { "$ref": "#/definitions/nonNegativeInteger" },
			"minProperties": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
			"required": { "$ref": "#/definitions/stringArray" },
			"additionalProperties": { "$ref": "#" },
			"definitions": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"default": {}
			},
			"properties": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"default": {}
			},
			"patternProperties": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"propertyNames": { "format": "regex" },
				"default": {}
			},
			"dependencies": {
				"type": "object",
				"additionalProperties": { "anyOf": [{ "$ref": "#" }, { "$ref": "#/definitions/stringArray" }] }
			},
			"propertyNames": { "$ref": "#" },
			"const": true,
			"enum": {
				"type": "array",
				"items": true,
				"minItems": 1,
				"uniqueItems": true
			},
			"type": { "anyOf": [{ "$ref": "#/definitions/simpleTypes" }, {
				"type": "array",
				"items": { "$ref": "#/definitions/simpleTypes" },
				"minItems": 1,
				"uniqueItems": true
			}] },
			"format": { "type": "string" },
			"contentMediaType": { "type": "string" },
			"contentEncoding": { "type": "string" },
			"if": { "$ref": "#" },
			"then": { "$ref": "#" },
			"else": { "$ref": "#" },
			"allOf": { "$ref": "#/definitions/schemaArray" },
			"anyOf": { "$ref": "#/definitions/schemaArray" },
			"oneOf": { "$ref": "#/definitions/schemaArray" },
			"not": { "$ref": "#" }
		},
		"default": true
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/ajv.js
var require_ajv$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/ajv.js"(exports, module) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = void 0;
	const core_1$4 = require_core$4();
	const draft7_1$1 = require_draft7$1();
	const discriminator_1$2 = require_discriminator$1();
	const draft7MetaSchema$1 = require_json_schema_draft_07$1();
	const META_SUPPORT_DATA$2 = ["/properties"];
	const META_SCHEMA_ID$2 = "http://json-schema.org/draft-07/schema";
	var Ajv$2 = class extends core_1$4.default {
		_addVocabularies() {
			super._addVocabularies();
			draft7_1$1.default.forEach((v) => this.addVocabulary(v));
			if (this.opts.discriminator) this.addKeyword(discriminator_1$2.default);
		}
		_addDefaultMetaSchema() {
			super._addDefaultMetaSchema();
			if (!this.opts.meta) return;
			const metaSchema$1 = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema$1, META_SUPPORT_DATA$2) : draft7MetaSchema$1;
			this.addMetaSchema(metaSchema$1, META_SCHEMA_ID$2, false);
			this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID$2;
		}
		defaultMeta() {
			return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID$2) ? META_SCHEMA_ID$2 : void 0);
		}
	};
	exports.Ajv = Ajv$2;
	module.exports = exports = Ajv$2;
	module.exports.Ajv = Ajv$2;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Ajv$2;
	var validate_1$6 = require_validate$1();
	Object.defineProperty(exports, "KeywordCxt", {
		enumerable: true,
		get: function() {
			return validate_1$6.KeywordCxt;
		}
	});
	var codegen_1$44 = require_codegen$1();
	Object.defineProperty(exports, "_", {
		enumerable: true,
		get: function() {
			return codegen_1$44._;
		}
	});
	Object.defineProperty(exports, "str", {
		enumerable: true,
		get: function() {
			return codegen_1$44.str;
		}
	});
	Object.defineProperty(exports, "stringify", {
		enumerable: true,
		get: function() {
			return codegen_1$44.stringify;
		}
	});
	Object.defineProperty(exports, "nil", {
		enumerable: true,
		get: function() {
			return codegen_1$44.nil;
		}
	});
	Object.defineProperty(exports, "Name", {
		enumerable: true,
		get: function() {
			return codegen_1$44.Name;
		}
	});
	Object.defineProperty(exports, "CodeGen", {
		enumerable: true,
		get: function() {
			return codegen_1$44.CodeGen;
		}
	});
	var validation_error_1$4 = require_validation_error$1();
	Object.defineProperty(exports, "ValidationError", {
		enumerable: true,
		get: function() {
			return validation_error_1$4.default;
		}
	});
	var ref_error_1$5 = require_ref_error$1();
	Object.defineProperty(exports, "MissingRefError", {
		enumerable: true,
		get: function() {
			return ref_error_1$5.default;
		}
	});
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js
var require_dynamicAnchor = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.dynamicAnchor = void 0;
	const codegen_1$43 = require_codegen$1();
	const names_1$11 = require_names$1();
	const compile_1$3 = require_compile$1();
	const ref_1$2 = require_ref$1();
	const def$38 = {
		keyword: "$dynamicAnchor",
		schemaType: "string",
		code: (cxt) => dynamicAnchor(cxt, cxt.schema)
	};
	function dynamicAnchor(cxt, anchor) {
		const { gen, it } = cxt;
		it.schemaEnv.root.dynamicAnchors[anchor] = true;
		const v = (0, codegen_1$43._)`${names_1$11.default.dynamicAnchors}${(0, codegen_1$43.getProperty)(anchor)}`;
		const validate$1 = it.errSchemaPath === "#" ? it.validateName : _getValidate(cxt);
		gen.if((0, codegen_1$43._)`!${v}`, () => gen.assign(v, validate$1));
	}
	exports.dynamicAnchor = dynamicAnchor;
	function _getValidate(cxt) {
		const { schemaEnv, schema: schema$1, self } = cxt.it;
		const { root, baseId, localRefs, meta } = schemaEnv.root;
		const { schemaId } = self.opts;
		const sch = new compile_1$3.SchemaEnv({
			schema: schema$1,
			schemaId,
			root,
			baseId,
			localRefs,
			meta
		});
		compile_1$3.compileSchema.call(self, sch);
		return (0, ref_1$2.getValidate)(cxt, sch);
	}
	exports.default = def$38;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js
var require_dynamicRef = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.dynamicRef = void 0;
	const codegen_1$42 = require_codegen$1();
	const names_1$10 = require_names$1();
	const ref_1$1 = require_ref$1();
	const def$37 = {
		keyword: "$dynamicRef",
		schemaType: "string",
		code: (cxt) => dynamicRef(cxt, cxt.schema)
	};
	function dynamicRef(cxt, ref) {
		const { gen, keyword: keyword$1, it } = cxt;
		if (ref[0] !== "#") throw new Error(`"${keyword$1}" only supports hash fragment reference`);
		const anchor = ref.slice(1);
		if (it.allErrors) _dynamicRef();
		else {
			const valid = gen.let("valid", false);
			_dynamicRef(valid);
			cxt.ok(valid);
		}
		function _dynamicRef(valid) {
			if (it.schemaEnv.root.dynamicAnchors[anchor]) {
				const v = gen.let("_v", (0, codegen_1$42._)`${names_1$10.default.dynamicAnchors}${(0, codegen_1$42.getProperty)(anchor)}`);
				gen.if(v, _callRef(v, valid), _callRef(it.validateName, valid));
			} else _callRef(it.validateName, valid)();
		}
		function _callRef(validate$1, valid) {
			return valid ? () => gen.block(() => {
				(0, ref_1$1.callRef)(cxt, validate$1);
				gen.let(valid, true);
			}) : () => (0, ref_1$1.callRef)(cxt, validate$1);
		}
	}
	exports.dynamicRef = dynamicRef;
	exports.default = def$37;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js
var require_recursiveAnchor = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const dynamicAnchor_1$1 = require_dynamicAnchor();
	const util_1$33 = require_util$1();
	const def$36 = {
		keyword: "$recursiveAnchor",
		schemaType: "boolean",
		code(cxt) {
			if (cxt.schema) (0, dynamicAnchor_1$1.dynamicAnchor)(cxt, "");
			else (0, util_1$33.checkStrictMode)(cxt.it, "$recursiveAnchor: false is ignored");
		}
	};
	exports.default = def$36;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js
var require_recursiveRef = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const dynamicRef_1$1 = require_dynamicRef();
	const def$35 = {
		keyword: "$recursiveRef",
		schemaType: "string",
		code: (cxt) => (0, dynamicRef_1$1.dynamicRef)(cxt, cxt.schema)
	};
	exports.default = def$35;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/index.js
var require_dynamic = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/dynamic/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const dynamicAnchor_1 = require_dynamicAnchor();
	const dynamicRef_1 = require_dynamicRef();
	const recursiveAnchor_1 = require_recursiveAnchor();
	const recursiveRef_1 = require_recursiveRef();
	const dynamic = [
		dynamicAnchor_1.default,
		dynamicRef_1.default,
		recursiveAnchor_1.default,
		recursiveRef_1.default
	];
	exports.default = dynamic;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/dependentRequired.js
var require_dependentRequired = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/dependentRequired.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const dependencies_1$2 = require_dependencies$1();
	const def$34 = {
		keyword: "dependentRequired",
		type: "object",
		schemaType: "object",
		error: dependencies_1$2.error,
		code: (cxt) => (0, dependencies_1$2.validatePropertyDeps)(cxt)
	};
	exports.default = def$34;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js
var require_dependentSchemas = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const dependencies_1$1 = require_dependencies$1();
	const def$33 = {
		keyword: "dependentSchemas",
		type: "object",
		schemaType: "object",
		code: (cxt) => (0, dependencies_1$1.validateSchemaDeps)(cxt)
	};
	exports.default = def$33;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitContains.js
var require_limitContains = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/validation/limitContains.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const util_1$32 = require_util$1();
	const def$32 = {
		keyword: ["maxContains", "minContains"],
		type: "array",
		schemaType: "number",
		code({ keyword: keyword$1, parentSchema, it }) {
			if (parentSchema.contains === void 0) (0, util_1$32.checkStrictMode)(it, `"${keyword$1}" without "contains" is ignored`);
		}
	};
	exports.default = def$32;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/next.js
var require_next = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/next.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const dependentRequired_1 = require_dependentRequired();
	const dependentSchemas_1 = require_dependentSchemas();
	const limitContains_1 = require_limitContains();
	const next = [
		dependentRequired_1.default,
		dependentSchemas_1.default,
		limitContains_1.default
	];
	exports.default = next;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js
var require_unevaluatedProperties = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$41 = require_codegen$1();
	const util_1$31 = require_util$1();
	const names_1$9 = require_names$1();
	const error$21 = {
		message: "must NOT have unevaluated properties",
		params: ({ params }) => (0, codegen_1$41._)`{unevaluatedProperty: ${params.unevaluatedProperty}}`
	};
	const def$31 = {
		keyword: "unevaluatedProperties",
		type: "object",
		schemaType: ["boolean", "object"],
		trackErrors: true,
		error: error$21,
		code(cxt) {
			const { gen, schema: schema$1, data, errsCount, it } = cxt;
			/* istanbul ignore if */
			if (!errsCount) throw new Error("ajv implementation error");
			const { allErrors, props } = it;
			if (props instanceof codegen_1$41.Name) gen.if((0, codegen_1$41._)`${props} !== true`, () => gen.forIn("key", data, (key) => gen.if(unevaluatedDynamic(props, key), () => unevaluatedPropCode(key))));
			else if (props !== true) gen.forIn("key", data, (key) => props === void 0 ? unevaluatedPropCode(key) : gen.if(unevaluatedStatic(props, key), () => unevaluatedPropCode(key)));
			it.props = true;
			cxt.ok((0, codegen_1$41._)`${errsCount} === ${names_1$9.default.errors}`);
			function unevaluatedPropCode(key) {
				if (schema$1 === false) {
					cxt.setParams({ unevaluatedProperty: key });
					cxt.error();
					if (!allErrors) gen.break();
					return;
				}
				if (!(0, util_1$31.alwaysValidSchema)(it, schema$1)) {
					const valid = gen.name("valid");
					cxt.subschema({
						keyword: "unevaluatedProperties",
						dataProp: key,
						dataPropType: util_1$31.Type.Str
					}, valid);
					if (!allErrors) gen.if((0, codegen_1$41.not)(valid), () => gen.break());
				}
			}
			function unevaluatedDynamic(evaluatedProps, key) {
				return (0, codegen_1$41._)`!${evaluatedProps} || !${evaluatedProps}[${key}]`;
			}
			function unevaluatedStatic(evaluatedProps, key) {
				const ps = [];
				for (const p in evaluatedProps) if (evaluatedProps[p] === true) ps.push((0, codegen_1$41._)`${key} !== ${p}`);
				return (0, codegen_1$41.and)(...ps);
			}
		}
	};
	exports.default = def$31;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js
var require_unevaluatedItems = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$40 = require_codegen$1();
	const util_1$30 = require_util$1();
	const error$20 = {
		message: ({ params: { len } }) => (0, codegen_1$40.str)`must NOT have more than ${len} items`,
		params: ({ params: { len } }) => (0, codegen_1$40._)`{limit: ${len}}`
	};
	const def$30 = {
		keyword: "unevaluatedItems",
		type: "array",
		schemaType: ["boolean", "object"],
		error: error$20,
		code(cxt) {
			const { gen, schema: schema$1, data, it } = cxt;
			const items = it.items || 0;
			if (items === true) return;
			const len = gen.const("len", (0, codegen_1$40._)`${data}.length`);
			if (schema$1 === false) {
				cxt.setParams({ len: items });
				cxt.fail((0, codegen_1$40._)`${len} > ${items}`);
			} else if (typeof schema$1 == "object" && !(0, util_1$30.alwaysValidSchema)(it, schema$1)) {
				const valid = gen.var("valid", (0, codegen_1$40._)`${len} <= ${items}`);
				gen.if((0, codegen_1$40.not)(valid), () => validateItems(valid, items));
				cxt.ok(valid);
			}
			it.items = true;
			function validateItems(valid, from) {
				gen.forRange("i", from, len, (i) => {
					cxt.subschema({
						keyword: "unevaluatedItems",
						dataProp: i,
						dataPropType: util_1$30.Type.Num
					}, valid);
					if (!it.allErrors) gen.if((0, codegen_1$40.not)(valid), () => gen.break());
				});
			}
		}
	};
	exports.default = def$30;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/unevaluated/index.js
var require_unevaluated$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/unevaluated/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const unevaluatedProperties_1 = require_unevaluatedProperties();
	const unevaluatedItems_1 = require_unevaluatedItems();
	const unevaluated$1 = [unevaluatedProperties_1.default, unevaluatedItems_1.default];
	exports.default = unevaluated$1;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/draft2020.js
var require_draft2020 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/vocabularies/draft2020.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const core_1$3 = require_core$3();
	const validation_1$1 = require_validation$2();
	const applicator_1$1 = require_applicator$2();
	const dynamic_1 = require_dynamic();
	const next_1 = require_next();
	const unevaluated_1 = require_unevaluated$1();
	const format_1$2 = require_format$2();
	const metadata_1$1 = require_metadata$1();
	const draft2020Vocabularies = [
		dynamic_1.default,
		core_1$3.default,
		validation_1$1.default,
		(0, applicator_1$1.default)(true),
		format_1$2.default,
		metadata_1$1.metadataVocabulary,
		metadata_1$1.contentVocabulary,
		next_1.default,
		unevaluated_1.default
	];
	exports.default = draft2020Vocabularies;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/schema.json
var require_schema = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/schema.json"(exports, module) {
	module.exports = {
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://json-schema.org/draft/2020-12/schema",
		"$vocabulary": {
			"https://json-schema.org/draft/2020-12/vocab/core": true,
			"https://json-schema.org/draft/2020-12/vocab/applicator": true,
			"https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
			"https://json-schema.org/draft/2020-12/vocab/validation": true,
			"https://json-schema.org/draft/2020-12/vocab/meta-data": true,
			"https://json-schema.org/draft/2020-12/vocab/format-annotation": true,
			"https://json-schema.org/draft/2020-12/vocab/content": true
		},
		"$dynamicAnchor": "meta",
		"title": "Core and Validation specifications meta-schema",
		"allOf": [
			{ "$ref": "meta/core" },
			{ "$ref": "meta/applicator" },
			{ "$ref": "meta/unevaluated" },
			{ "$ref": "meta/validation" },
			{ "$ref": "meta/meta-data" },
			{ "$ref": "meta/format-annotation" },
			{ "$ref": "meta/content" }
		],
		"type": ["object", "boolean"],
		"$comment": "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.",
		"properties": {
			"definitions": {
				"$comment": "\"definitions\" has been replaced by \"$defs\".",
				"type": "object",
				"additionalProperties": { "$dynamicRef": "#meta" },
				"deprecated": true,
				"default": {}
			},
			"dependencies": {
				"$comment": "\"dependencies\" has been split and replaced by \"dependentSchemas\" and \"dependentRequired\" in order to serve their differing semantics.",
				"type": "object",
				"additionalProperties": { "anyOf": [{ "$dynamicRef": "#meta" }, { "$ref": "meta/validation#/$defs/stringArray" }] },
				"deprecated": true,
				"default": {}
			},
			"$recursiveAnchor": {
				"$comment": "\"$recursiveAnchor\" has been replaced by \"$dynamicAnchor\".",
				"$ref": "meta/core#/$defs/anchorString",
				"deprecated": true
			},
			"$recursiveRef": {
				"$comment": "\"$recursiveRef\" has been replaced by \"$dynamicRef\".",
				"$ref": "meta/core#/$defs/uriReferenceString",
				"deprecated": true
			}
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json
var require_applicator$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json"(exports, module) {
	module.exports = {
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://json-schema.org/draft/2020-12/meta/applicator",
		"$vocabulary": { "https://json-schema.org/draft/2020-12/vocab/applicator": true },
		"$dynamicAnchor": "meta",
		"title": "Applicator vocabulary meta-schema",
		"type": ["object", "boolean"],
		"properties": {
			"prefixItems": { "$ref": "#/$defs/schemaArray" },
			"items": { "$dynamicRef": "#meta" },
			"contains": { "$dynamicRef": "#meta" },
			"additionalProperties": { "$dynamicRef": "#meta" },
			"properties": {
				"type": "object",
				"additionalProperties": { "$dynamicRef": "#meta" },
				"default": {}
			},
			"patternProperties": {
				"type": "object",
				"additionalProperties": { "$dynamicRef": "#meta" },
				"propertyNames": { "format": "regex" },
				"default": {}
			},
			"dependentSchemas": {
				"type": "object",
				"additionalProperties": { "$dynamicRef": "#meta" },
				"default": {}
			},
			"propertyNames": { "$dynamicRef": "#meta" },
			"if": { "$dynamicRef": "#meta" },
			"then": { "$dynamicRef": "#meta" },
			"else": { "$dynamicRef": "#meta" },
			"allOf": { "$ref": "#/$defs/schemaArray" },
			"anyOf": { "$ref": "#/$defs/schemaArray" },
			"oneOf": { "$ref": "#/$defs/schemaArray" },
			"not": { "$dynamicRef": "#meta" }
		},
		"$defs": { "schemaArray": {
			"type": "array",
			"minItems": 1,
			"items": { "$dynamicRef": "#meta" }
		} }
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json
var require_unevaluated = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json"(exports, module) {
	module.exports = {
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://json-schema.org/draft/2020-12/meta/unevaluated",
		"$vocabulary": { "https://json-schema.org/draft/2020-12/vocab/unevaluated": true },
		"$dynamicAnchor": "meta",
		"title": "Unevaluated applicator vocabulary meta-schema",
		"type": ["object", "boolean"],
		"properties": {
			"unevaluatedItems": { "$dynamicRef": "#meta" },
			"unevaluatedProperties": { "$dynamicRef": "#meta" }
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json
var require_content = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json"(exports, module) {
	module.exports = {
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://json-schema.org/draft/2020-12/meta/content",
		"$vocabulary": { "https://json-schema.org/draft/2020-12/vocab/content": true },
		"$dynamicAnchor": "meta",
		"title": "Content vocabulary meta-schema",
		"type": ["object", "boolean"],
		"properties": {
			"contentEncoding": { "type": "string" },
			"contentMediaType": { "type": "string" },
			"contentSchema": { "$dynamicRef": "#meta" }
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json
var require_core$2 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json"(exports, module) {
	module.exports = {
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://json-schema.org/draft/2020-12/meta/core",
		"$vocabulary": { "https://json-schema.org/draft/2020-12/vocab/core": true },
		"$dynamicAnchor": "meta",
		"title": "Core vocabulary meta-schema",
		"type": ["object", "boolean"],
		"properties": {
			"$id": {
				"$ref": "#/$defs/uriReferenceString",
				"$comment": "Non-empty fragments not allowed.",
				"pattern": "^[^#]*#?$"
			},
			"$schema": { "$ref": "#/$defs/uriString" },
			"$ref": { "$ref": "#/$defs/uriReferenceString" },
			"$anchor": { "$ref": "#/$defs/anchorString" },
			"$dynamicRef": { "$ref": "#/$defs/uriReferenceString" },
			"$dynamicAnchor": { "$ref": "#/$defs/anchorString" },
			"$vocabulary": {
				"type": "object",
				"propertyNames": { "$ref": "#/$defs/uriString" },
				"additionalProperties": { "type": "boolean" }
			},
			"$comment": { "type": "string" },
			"$defs": {
				"type": "object",
				"additionalProperties": { "$dynamicRef": "#meta" }
			}
		},
		"$defs": {
			"anchorString": {
				"type": "string",
				"pattern": "^[A-Za-z_][-A-Za-z0-9._]*$"
			},
			"uriString": {
				"type": "string",
				"format": "uri"
			},
			"uriReferenceString": {
				"type": "string",
				"format": "uri-reference"
			}
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json
var require_format_annotation = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json"(exports, module) {
	module.exports = {
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://json-schema.org/draft/2020-12/meta/format-annotation",
		"$vocabulary": { "https://json-schema.org/draft/2020-12/vocab/format-annotation": true },
		"$dynamicAnchor": "meta",
		"title": "Format vocabulary meta-schema for annotation results",
		"type": ["object", "boolean"],
		"properties": { "format": { "type": "string" } }
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json
var require_meta_data = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json"(exports, module) {
	module.exports = {
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://json-schema.org/draft/2020-12/meta/meta-data",
		"$vocabulary": { "https://json-schema.org/draft/2020-12/vocab/meta-data": true },
		"$dynamicAnchor": "meta",
		"title": "Meta-data vocabulary meta-schema",
		"type": ["object", "boolean"],
		"properties": {
			"title": { "type": "string" },
			"description": { "type": "string" },
			"default": true,
			"deprecated": {
				"type": "boolean",
				"default": false
			},
			"readOnly": {
				"type": "boolean",
				"default": false
			},
			"writeOnly": {
				"type": "boolean",
				"default": false
			},
			"examples": {
				"type": "array",
				"items": true
			}
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json
var require_validation$1 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json"(exports, module) {
	module.exports = {
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://json-schema.org/draft/2020-12/meta/validation",
		"$vocabulary": { "https://json-schema.org/draft/2020-12/vocab/validation": true },
		"$dynamicAnchor": "meta",
		"title": "Validation vocabulary meta-schema",
		"type": ["object", "boolean"],
		"properties": {
			"type": { "anyOf": [{ "$ref": "#/$defs/simpleTypes" }, {
				"type": "array",
				"items": { "$ref": "#/$defs/simpleTypes" },
				"minItems": 1,
				"uniqueItems": true
			}] },
			"const": true,
			"enum": {
				"type": "array",
				"items": true
			},
			"multipleOf": {
				"type": "number",
				"exclusiveMinimum": 0
			},
			"maximum": { "type": "number" },
			"exclusiveMaximum": { "type": "number" },
			"minimum": { "type": "number" },
			"exclusiveMinimum": { "type": "number" },
			"maxLength": { "$ref": "#/$defs/nonNegativeInteger" },
			"minLength": { "$ref": "#/$defs/nonNegativeIntegerDefault0" },
			"pattern": {
				"type": "string",
				"format": "regex"
			},
			"maxItems": { "$ref": "#/$defs/nonNegativeInteger" },
			"minItems": { "$ref": "#/$defs/nonNegativeIntegerDefault0" },
			"uniqueItems": {
				"type": "boolean",
				"default": false
			},
			"maxContains": { "$ref": "#/$defs/nonNegativeInteger" },
			"minContains": {
				"$ref": "#/$defs/nonNegativeInteger",
				"default": 1
			},
			"maxProperties": { "$ref": "#/$defs/nonNegativeInteger" },
			"minProperties": { "$ref": "#/$defs/nonNegativeIntegerDefault0" },
			"required": { "$ref": "#/$defs/stringArray" },
			"dependentRequired": {
				"type": "object",
				"additionalProperties": { "$ref": "#/$defs/stringArray" }
			}
		},
		"$defs": {
			"nonNegativeInteger": {
				"type": "integer",
				"minimum": 0
			},
			"nonNegativeIntegerDefault0": {
				"$ref": "#/$defs/nonNegativeInteger",
				"default": 0
			},
			"simpleTypes": { "enum": [
				"array",
				"boolean",
				"integer",
				"null",
				"number",
				"object",
				"string"
			] },
			"stringArray": {
				"type": "array",
				"items": { "type": "string" },
				"uniqueItems": true,
				"default": []
			}
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/index.js
var require_json_schema_2020_12 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/refs/json-schema-2020-12/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const metaSchema = require_schema();
	const applicator = require_applicator$1();
	const unevaluated = require_unevaluated();
	const content = require_content();
	const core$1 = require_core$2();
	const format$1 = require_format_annotation();
	const metadata = require_meta_data();
	const validation$1 = require_validation$1();
	const META_SUPPORT_DATA$1 = ["/properties"];
	function addMetaSchema2020($data) {
		[
			metaSchema,
			applicator,
			unevaluated,
			content,
			core$1,
			with$data(this, format$1),
			metadata,
			with$data(this, validation$1)
		].forEach((sch) => this.addMetaSchema(sch, void 0, false));
		return this;
		function with$data(ajv, sch) {
			return $data ? ajv.$dataMetaSchema(sch, META_SUPPORT_DATA$1) : sch;
		}
	}
	exports.default = addMetaSchema2020;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv/dist/2020.js
var require__2020 = __commonJS({ "../packages/vovk-ajv/node_modules/ajv/dist/2020.js"(exports, module) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv2020 = void 0;
	const core_1$2 = require_core$4();
	const draft2020_1 = require_draft2020();
	const discriminator_1$1 = require_discriminator$1();
	const json_schema_2020_12_1 = require_json_schema_2020_12();
	const META_SCHEMA_ID$1 = "https://json-schema.org/draft/2020-12/schema";
	var Ajv2020 = class extends core_1$2.default {
		constructor(opts = {}) {
			super({
				...opts,
				dynamicRef: true,
				next: true,
				unevaluated: true
			});
		}
		_addVocabularies() {
			super._addVocabularies();
			draft2020_1.default.forEach((v) => this.addVocabulary(v));
			if (this.opts.discriminator) this.addKeyword(discriminator_1$1.default);
		}
		_addDefaultMetaSchema() {
			super._addDefaultMetaSchema();
			const { $data, meta } = this.opts;
			if (!meta) return;
			json_schema_2020_12_1.default.call(this, $data);
			this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID$1;
		}
		defaultMeta() {
			return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID$1) ? META_SCHEMA_ID$1 : void 0);
		}
	};
	exports.Ajv2020 = Ajv2020;
	module.exports = exports = Ajv2020;
	module.exports.Ajv2020 = Ajv2020;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Ajv2020;
	var validate_1$5 = require_validate$1();
	Object.defineProperty(exports, "KeywordCxt", {
		enumerable: true,
		get: function() {
			return validate_1$5.KeywordCxt;
		}
	});
	var codegen_1$39 = require_codegen$1();
	Object.defineProperty(exports, "_", {
		enumerable: true,
		get: function() {
			return codegen_1$39._;
		}
	});
	Object.defineProperty(exports, "str", {
		enumerable: true,
		get: function() {
			return codegen_1$39.str;
		}
	});
	Object.defineProperty(exports, "stringify", {
		enumerable: true,
		get: function() {
			return codegen_1$39.stringify;
		}
	});
	Object.defineProperty(exports, "nil", {
		enumerable: true,
		get: function() {
			return codegen_1$39.nil;
		}
	});
	Object.defineProperty(exports, "Name", {
		enumerable: true,
		get: function() {
			return codegen_1$39.Name;
		}
	});
	Object.defineProperty(exports, "CodeGen", {
		enumerable: true,
		get: function() {
			return codegen_1$39.CodeGen;
		}
	});
	var validation_error_1$3 = require_validation_error$1();
	Object.defineProperty(exports, "ValidationError", {
		enumerable: true,
		get: function() {
			return validation_error_1$3.default;
		}
	});
	var ref_error_1$4 = require_ref_error$1();
	Object.defineProperty(exports, "MissingRefError", {
		enumerable: true,
		get: function() {
			return ref_error_1$4.default;
		}
	});
} });

//#endregion
//#region ../node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS({ "../node_modules/ajv-formats/dist/formats.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.formatNames = exports.fastFormats = exports.fullFormats = void 0;
	function fmtDef(validate$1, compare) {
		return {
			validate: validate$1,
			compare
		};
	}
	exports.fullFormats = {
		date: fmtDef(date, compareDate),
		time: fmtDef(getTime(true), compareTime),
		"date-time": fmtDef(getDateTime(true), compareDateTime),
		"iso-time": fmtDef(getTime(), compareIsoTime),
		"iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
		duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
		uri: uri$1,
		"uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
		"uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
		url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
		email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
		hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
		ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
		ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
		regex,
		uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
		"json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
		"json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
		"relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
		byte,
		int32: {
			type: "number",
			validate: validateInt32
		},
		int64: {
			type: "number",
			validate: validateInt64
		},
		float: {
			type: "number",
			validate: validateNumber
		},
		double: {
			type: "number",
			validate: validateNumber
		},
		password: true,
		binary: true
	};
	exports.fastFormats = {
		...exports.fullFormats,
		date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
		time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
		"date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
		"iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
		"iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
		uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
		"uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
		email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
	};
	exports.formatNames = Object.keys(exports.fullFormats);
	function isLeapYear(year) {
		return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	}
	const DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
	const DAYS = [
		0,
		31,
		28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	];
	function date(str$2) {
		const matches = DATE.exec(str$2);
		if (!matches) return false;
		const year = +matches[1];
		const month = +matches[2];
		const day = +matches[3];
		return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
	}
	function compareDate(d1, d2) {
		if (!(d1 && d2)) return void 0;
		if (d1 > d2) return 1;
		if (d1 < d2) return -1;
		return 0;
	}
	const TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
	function getTime(strictTimeZone) {
		return function time(str$2) {
			const matches = TIME.exec(str$2);
			if (!matches) return false;
			const hr = +matches[1];
			const min = +matches[2];
			const sec = +matches[3];
			const tz = matches[4];
			const tzSign = matches[5] === "-" ? -1 : 1;
			const tzH = +(matches[6] || 0);
			const tzM = +(matches[7] || 0);
			if (tzH > 23 || tzM > 59 || strictTimeZone && !tz) return false;
			if (hr <= 23 && min <= 59 && sec < 60) return true;
			const utcMin = min - tzM * tzSign;
			const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
			return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
		};
	}
	function compareTime(s1, s2) {
		if (!(s1 && s2)) return void 0;
		const t1 = new Date("2020-01-01T" + s1).valueOf();
		const t2 = new Date("2020-01-01T" + s2).valueOf();
		if (!(t1 && t2)) return void 0;
		return t1 - t2;
	}
	function compareIsoTime(t1, t2) {
		if (!(t1 && t2)) return void 0;
		const a1 = TIME.exec(t1);
		const a2 = TIME.exec(t2);
		if (!(a1 && a2)) return void 0;
		t1 = a1[1] + a1[2] + a1[3];
		t2 = a2[1] + a2[2] + a2[3];
		if (t1 > t2) return 1;
		if (t1 < t2) return -1;
		return 0;
	}
	const DATE_TIME_SEPARATOR = /t|\s/i;
	function getDateTime(strictTimeZone) {
		const time = getTime(strictTimeZone);
		return function date_time(str$2) {
			const dateTime = str$2.split(DATE_TIME_SEPARATOR);
			return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
		};
	}
	function compareDateTime(dt1, dt2) {
		if (!(dt1 && dt2)) return void 0;
		const d1 = new Date(dt1).valueOf();
		const d2 = new Date(dt2).valueOf();
		if (!(d1 && d2)) return void 0;
		return d1 - d2;
	}
	function compareIsoDateTime(dt1, dt2) {
		if (!(dt1 && dt2)) return void 0;
		const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
		const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
		const res = compareDate(d1, d2);
		if (res === void 0) return void 0;
		return res || compareTime(t1, t2);
	}
	const NOT_URI_FRAGMENT = /\/|:/;
	const URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
	function uri$1(str$2) {
		return NOT_URI_FRAGMENT.test(str$2) && URI.test(str$2);
	}
	const BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
	function byte(str$2) {
		BYTE.lastIndex = 0;
		return BYTE.test(str$2);
	}
	const MIN_INT32 = -(2 ** 31);
	const MAX_INT32 = 2 ** 31 - 1;
	function validateInt32(value) {
		return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
	}
	function validateInt64(value) {
		return Number.isInteger(value);
	}
	function validateNumber() {
		return true;
	}
	const Z_ANCHOR = /[^\\]\\Z/;
	function regex(str$2) {
		if (Z_ANCHOR.test(str$2)) return false;
		try {
			new RegExp(str$2);
			return true;
		} catch (e) {
			return false;
		}
	}
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/codegen/code.js
var require_code$1 = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/codegen/code.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
	var _CodeOrName = class {};
	exports._CodeOrName = _CodeOrName;
	exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
	var Name = class extends _CodeOrName {
		constructor(s) {
			super();
			if (!exports.IDENTIFIER.test(s)) throw new Error("CodeGen: name must be a valid identifier");
			this.str = s;
		}
		toString() {
			return this.str;
		}
		emptyStr() {
			return false;
		}
		get names() {
			return { [this.str]: 1 };
		}
	};
	exports.Name = Name;
	var _Code = class extends _CodeOrName {
		constructor(code) {
			super();
			this._items = typeof code === "string" ? [code] : code;
		}
		toString() {
			return this.str;
		}
		emptyStr() {
			if (this._items.length > 1) return false;
			const item = this._items[0];
			return item === "" || item === "\"\"";
		}
		get str() {
			var _a$4;
			return (_a$4 = this._str) !== null && _a$4 !== void 0 ? _a$4 : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
		}
		get names() {
			var _a$4;
			return (_a$4 = this._names) !== null && _a$4 !== void 0 ? _a$4 : this._names = this._items.reduce((names$2, c) => {
				if (c instanceof Name) names$2[c.str] = (names$2[c.str] || 0) + 1;
				return names$2;
			}, {});
		}
	};
	exports._Code = _Code;
	exports.nil = new _Code("");
	function _(strs, ...args) {
		const code = [strs[0]];
		let i = 0;
		while (i < args.length) {
			addCodeArg(code, args[i]);
			code.push(strs[++i]);
		}
		return new _Code(code);
	}
	exports._ = _;
	const plus = new _Code("+");
	function str(strs, ...args) {
		const expr = [safeStringify(strs[0])];
		let i = 0;
		while (i < args.length) {
			expr.push(plus);
			addCodeArg(expr, args[i]);
			expr.push(plus, safeStringify(strs[++i]));
		}
		optimize(expr);
		return new _Code(expr);
	}
	exports.str = str;
	function addCodeArg(code, arg) {
		if (arg instanceof _Code) code.push(...arg._items);
		else if (arg instanceof Name) code.push(arg);
		else code.push(interpolate(arg));
	}
	exports.addCodeArg = addCodeArg;
	function optimize(expr) {
		let i = 1;
		while (i < expr.length - 1) {
			if (expr[i] === plus) {
				const res = mergeExprItems(expr[i - 1], expr[i + 1]);
				if (res !== void 0) {
					expr.splice(i - 1, 3, res);
					continue;
				}
				expr[i++] = "+";
			}
			i++;
		}
	}
	function mergeExprItems(a, b) {
		if (b === "\"\"") return a;
		if (a === "\"\"") return b;
		if (typeof a == "string") {
			if (b instanceof Name || a[a.length - 1] !== "\"") return;
			if (typeof b != "string") return `${a.slice(0, -1)}${b}"`;
			if (b[0] === "\"") return a.slice(0, -1) + b.slice(1);
			return;
		}
		if (typeof b == "string" && b[0] === "\"" && !(a instanceof Name)) return `"${a}${b.slice(1)}`;
		return;
	}
	function strConcat(c1, c2) {
		return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
	}
	exports.strConcat = strConcat;
	function interpolate(x) {
		return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
	}
	function stringify(x) {
		return new _Code(safeStringify(x));
	}
	exports.stringify = stringify;
	function safeStringify(x) {
		return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
	}
	exports.safeStringify = safeStringify;
	function getProperty(key) {
		return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
	}
	exports.getProperty = getProperty;
	function getEsmExportName(key) {
		if (typeof key == "string" && exports.IDENTIFIER.test(key)) return new _Code(`${key}`);
		throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
	}
	exports.getEsmExportName = getEsmExportName;
	function regexpCode(rx) {
		return new _Code(rx.toString());
	}
	exports.regexpCode = regexpCode;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/codegen/scope.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
	const code_1$14 = require_code$1();
	var ValueError = class extends Error {
		constructor(name) {
			super(`CodeGen: "code" for ${name} not defined`);
			this.value = name.value;
		}
	};
	var UsedValueState;
	(function(UsedValueState$2) {
		UsedValueState$2[UsedValueState$2["Started"] = 0] = "Started";
		UsedValueState$2[UsedValueState$2["Completed"] = 1] = "Completed";
	})(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
	exports.varKinds = {
		const: new code_1$14.Name("const"),
		let: new code_1$14.Name("let"),
		var: new code_1$14.Name("var")
	};
	var Scope = class {
		constructor({ prefixes, parent } = {}) {
			this._names = {};
			this._prefixes = prefixes;
			this._parent = parent;
		}
		toName(nameOrPrefix) {
			return nameOrPrefix instanceof code_1$14.Name ? nameOrPrefix : this.name(nameOrPrefix);
		}
		name(prefix) {
			return new code_1$14.Name(this._newName(prefix));
		}
		_newName(prefix) {
			const ng = this._names[prefix] || this._nameGroup(prefix);
			return `${prefix}${ng.index++}`;
		}
		_nameGroup(prefix) {
			var _a$4, _b;
			if (((_b = (_a$4 = this._parent) === null || _a$4 === void 0 ? void 0 : _a$4._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
			return this._names[prefix] = {
				prefix,
				index: 0
			};
		}
	};
	exports.Scope = Scope;
	var ValueScopeName = class extends code_1$14.Name {
		constructor(prefix, nameStr) {
			super(nameStr);
			this.prefix = prefix;
		}
		setValue(value, { property, itemIndex }) {
			this.value = value;
			this.scopePath = (0, code_1$14._)`.${new code_1$14.Name(property)}[${itemIndex}]`;
		}
	};
	exports.ValueScopeName = ValueScopeName;
	const line = (0, code_1$14._)`\n`;
	var ValueScope = class extends Scope {
		constructor(opts) {
			super(opts);
			this._values = {};
			this._scope = opts.scope;
			this.opts = {
				...opts,
				_n: opts.lines ? line : code_1$14.nil
			};
		}
		get() {
			return this._scope;
		}
		name(prefix) {
			return new ValueScopeName(prefix, this._newName(prefix));
		}
		value(nameOrPrefix, value) {
			var _a$4;
			if (value.ref === void 0) throw new Error("CodeGen: ref must be passed in value");
			const name = this.toName(nameOrPrefix);
			const { prefix } = name;
			const valueKey = (_a$4 = value.key) !== null && _a$4 !== void 0 ? _a$4 : value.ref;
			let vs = this._values[prefix];
			if (vs) {
				const _name = vs.get(valueKey);
				if (_name) return _name;
			} else vs = this._values[prefix] = /* @__PURE__ */ new Map();
			vs.set(valueKey, name);
			const s = this._scope[prefix] || (this._scope[prefix] = []);
			const itemIndex = s.length;
			s[itemIndex] = value.ref;
			name.setValue(value, {
				property: prefix,
				itemIndex
			});
			return name;
		}
		getValue(prefix, keyOrRef) {
			const vs = this._values[prefix];
			if (!vs) return;
			return vs.get(keyOrRef);
		}
		scopeRefs(scopeName, values = this._values) {
			return this._reduceValues(values, (name) => {
				if (name.scopePath === void 0) throw new Error(`CodeGen: name "${name}" has no value`);
				return (0, code_1$14._)`${scopeName}${name.scopePath}`;
			});
		}
		scopeCode(values = this._values, usedValues, getCode) {
			return this._reduceValues(values, (name) => {
				if (name.value === void 0) throw new Error(`CodeGen: name "${name}" has no value`);
				return name.value.code;
			}, usedValues, getCode);
		}
		_reduceValues(values, valueCode, usedValues = {}, getCode) {
			let code = code_1$14.nil;
			for (const prefix in values) {
				const vs = values[prefix];
				if (!vs) continue;
				const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
				vs.forEach((name) => {
					if (nameSet.has(name)) return;
					nameSet.set(name, UsedValueState.Started);
					let c = valueCode(name);
					if (c) {
						const def$69 = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
						code = (0, code_1$14._)`${code}${def$69} ${name} = ${c};${this.opts._n}`;
					} else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) code = (0, code_1$14._)`${code}${c}${this.opts._n}`;
					else throw new ValueError(name);
					nameSet.set(name, UsedValueState.Completed);
				});
			}
			return code;
		}
	};
	exports.ValueScope = ValueScope;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/codegen/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
	const code_1$13 = require_code$1();
	const scope_1 = require_scope();
	var code_2 = require_code$1();
	Object.defineProperty(exports, "_", {
		enumerable: true,
		get: function() {
			return code_2._;
		}
	});
	Object.defineProperty(exports, "str", {
		enumerable: true,
		get: function() {
			return code_2.str;
		}
	});
	Object.defineProperty(exports, "strConcat", {
		enumerable: true,
		get: function() {
			return code_2.strConcat;
		}
	});
	Object.defineProperty(exports, "nil", {
		enumerable: true,
		get: function() {
			return code_2.nil;
		}
	});
	Object.defineProperty(exports, "getProperty", {
		enumerable: true,
		get: function() {
			return code_2.getProperty;
		}
	});
	Object.defineProperty(exports, "stringify", {
		enumerable: true,
		get: function() {
			return code_2.stringify;
		}
	});
	Object.defineProperty(exports, "regexpCode", {
		enumerable: true,
		get: function() {
			return code_2.regexpCode;
		}
	});
	Object.defineProperty(exports, "Name", {
		enumerable: true,
		get: function() {
			return code_2.Name;
		}
	});
	var scope_2 = require_scope();
	Object.defineProperty(exports, "Scope", {
		enumerable: true,
		get: function() {
			return scope_2.Scope;
		}
	});
	Object.defineProperty(exports, "ValueScope", {
		enumerable: true,
		get: function() {
			return scope_2.ValueScope;
		}
	});
	Object.defineProperty(exports, "ValueScopeName", {
		enumerable: true,
		get: function() {
			return scope_2.ValueScopeName;
		}
	});
	Object.defineProperty(exports, "varKinds", {
		enumerable: true,
		get: function() {
			return scope_2.varKinds;
		}
	});
	exports.operators = {
		GT: new code_1$13._Code(">"),
		GTE: new code_1$13._Code(">="),
		LT: new code_1$13._Code("<"),
		LTE: new code_1$13._Code("<="),
		EQ: new code_1$13._Code("==="),
		NEQ: new code_1$13._Code("!=="),
		NOT: new code_1$13._Code("!"),
		OR: new code_1$13._Code("||"),
		AND: new code_1$13._Code("&&"),
		ADD: new code_1$13._Code("+")
	};
	var Node = class {
		optimizeNodes() {
			return this;
		}
		optimizeNames(_names, _constants) {
			return this;
		}
	};
	var Def = class extends Node {
		constructor(varKind, name, rhs) {
			super();
			this.varKind = varKind;
			this.name = name;
			this.rhs = rhs;
		}
		render({ es5, _n }) {
			const varKind = es5 ? scope_1.varKinds.var : this.varKind;
			const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
			return `${varKind} ${this.name}${rhs};` + _n;
		}
		optimizeNames(names$2, constants) {
			if (!names$2[this.name.str]) return;
			if (this.rhs) this.rhs = optimizeExpr(this.rhs, names$2, constants);
			return this;
		}
		get names() {
			return this.rhs instanceof code_1$13._CodeOrName ? this.rhs.names : {};
		}
	};
	var Assign = class extends Node {
		constructor(lhs, rhs, sideEffects) {
			super();
			this.lhs = lhs;
			this.rhs = rhs;
			this.sideEffects = sideEffects;
		}
		render({ _n }) {
			return `${this.lhs} = ${this.rhs};` + _n;
		}
		optimizeNames(names$2, constants) {
			if (this.lhs instanceof code_1$13.Name && !names$2[this.lhs.str] && !this.sideEffects) return;
			this.rhs = optimizeExpr(this.rhs, names$2, constants);
			return this;
		}
		get names() {
			const names$2 = this.lhs instanceof code_1$13.Name ? {} : { ...this.lhs.names };
			return addExprNames(names$2, this.rhs);
		}
	};
	var AssignOp = class extends Assign {
		constructor(lhs, op, rhs, sideEffects) {
			super(lhs, rhs, sideEffects);
			this.op = op;
		}
		render({ _n }) {
			return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
		}
	};
	var Label = class extends Node {
		constructor(label) {
			super();
			this.label = label;
			this.names = {};
		}
		render({ _n }) {
			return `${this.label}:` + _n;
		}
	};
	var Break = class extends Node {
		constructor(label) {
			super();
			this.label = label;
			this.names = {};
		}
		render({ _n }) {
			const label = this.label ? ` ${this.label}` : "";
			return `break${label};` + _n;
		}
	};
	var Throw = class extends Node {
		constructor(error$41) {
			super();
			this.error = error$41;
		}
		render({ _n }) {
			return `throw ${this.error};` + _n;
		}
		get names() {
			return this.error.names;
		}
	};
	var AnyCode = class extends Node {
		constructor(code) {
			super();
			this.code = code;
		}
		render({ _n }) {
			return `${this.code};` + _n;
		}
		optimizeNodes() {
			return `${this.code}` ? this : void 0;
		}
		optimizeNames(names$2, constants) {
			this.code = optimizeExpr(this.code, names$2, constants);
			return this;
		}
		get names() {
			return this.code instanceof code_1$13._CodeOrName ? this.code.names : {};
		}
	};
	var ParentNode = class extends Node {
		constructor(nodes = []) {
			super();
			this.nodes = nodes;
		}
		render(opts) {
			return this.nodes.reduce((code, n) => code + n.render(opts), "");
		}
		optimizeNodes() {
			const { nodes } = this;
			let i = nodes.length;
			while (i--) {
				const n = nodes[i].optimizeNodes();
				if (Array.isArray(n)) nodes.splice(i, 1, ...n);
				else if (n) nodes[i] = n;
				else nodes.splice(i, 1);
			}
			return nodes.length > 0 ? this : void 0;
		}
		optimizeNames(names$2, constants) {
			const { nodes } = this;
			let i = nodes.length;
			while (i--) {
				const n = nodes[i];
				if (n.optimizeNames(names$2, constants)) continue;
				subtractNames(names$2, n.names);
				nodes.splice(i, 1);
			}
			return nodes.length > 0 ? this : void 0;
		}
		get names() {
			return this.nodes.reduce((names$2, n) => addNames(names$2, n.names), {});
		}
	};
	var BlockNode = class extends ParentNode {
		render(opts) {
			return "{" + opts._n + super.render(opts) + "}" + opts._n;
		}
	};
	var Root = class extends ParentNode {};
	var Else = class extends BlockNode {};
	Else.kind = "else";
	var If = class If extends BlockNode {
		constructor(condition, nodes) {
			super(nodes);
			this.condition = condition;
		}
		render(opts) {
			let code = `if(${this.condition})` + super.render(opts);
			if (this.else) code += "else " + this.else.render(opts);
			return code;
		}
		optimizeNodes() {
			super.optimizeNodes();
			const cond = this.condition;
			if (cond === true) return this.nodes;
			let e = this.else;
			if (e) {
				const ns = e.optimizeNodes();
				e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
			}
			if (e) {
				if (cond === false) return e instanceof If ? e : e.nodes;
				if (this.nodes.length) return this;
				return new If(not(cond), e instanceof If ? [e] : e.nodes);
			}
			if (cond === false || !this.nodes.length) return void 0;
			return this;
		}
		optimizeNames(names$2, constants) {
			var _a$4;
			this.else = (_a$4 = this.else) === null || _a$4 === void 0 ? void 0 : _a$4.optimizeNames(names$2, constants);
			if (!(super.optimizeNames(names$2, constants) || this.else)) return;
			this.condition = optimizeExpr(this.condition, names$2, constants);
			return this;
		}
		get names() {
			const names$2 = super.names;
			addExprNames(names$2, this.condition);
			if (this.else) addNames(names$2, this.else.names);
			return names$2;
		}
	};
	If.kind = "if";
	var For = class extends BlockNode {};
	For.kind = "for";
	var ForLoop = class extends For {
		constructor(iteration) {
			super();
			this.iteration = iteration;
		}
		render(opts) {
			return `for(${this.iteration})` + super.render(opts);
		}
		optimizeNames(names$2, constants) {
			if (!super.optimizeNames(names$2, constants)) return;
			this.iteration = optimizeExpr(this.iteration, names$2, constants);
			return this;
		}
		get names() {
			return addNames(super.names, this.iteration.names);
		}
	};
	var ForRange = class extends For {
		constructor(varKind, name, from, to) {
			super();
			this.varKind = varKind;
			this.name = name;
			this.from = from;
			this.to = to;
		}
		render(opts) {
			const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
			const { name, from, to } = this;
			return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
		}
		get names() {
			const names$2 = addExprNames(super.names, this.from);
			return addExprNames(names$2, this.to);
		}
	};
	var ForIter = class extends For {
		constructor(loop, varKind, name, iterable) {
			super();
			this.loop = loop;
			this.varKind = varKind;
			this.name = name;
			this.iterable = iterable;
		}
		render(opts) {
			return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
		}
		optimizeNames(names$2, constants) {
			if (!super.optimizeNames(names$2, constants)) return;
			this.iterable = optimizeExpr(this.iterable, names$2, constants);
			return this;
		}
		get names() {
			return addNames(super.names, this.iterable.names);
		}
	};
	var Func = class extends BlockNode {
		constructor(name, args, async) {
			super();
			this.name = name;
			this.args = args;
			this.async = async;
		}
		render(opts) {
			const _async = this.async ? "async " : "";
			return `${_async}function ${this.name}(${this.args})` + super.render(opts);
		}
	};
	Func.kind = "func";
	var Return = class extends ParentNode {
		render(opts) {
			return "return " + super.render(opts);
		}
	};
	Return.kind = "return";
	var Try = class extends BlockNode {
		render(opts) {
			let code = "try" + super.render(opts);
			if (this.catch) code += this.catch.render(opts);
			if (this.finally) code += this.finally.render(opts);
			return code;
		}
		optimizeNodes() {
			var _a$4, _b;
			super.optimizeNodes();
			(_a$4 = this.catch) === null || _a$4 === void 0 || _a$4.optimizeNodes();
			(_b = this.finally) === null || _b === void 0 || _b.optimizeNodes();
			return this;
		}
		optimizeNames(names$2, constants) {
			var _a$4, _b;
			super.optimizeNames(names$2, constants);
			(_a$4 = this.catch) === null || _a$4 === void 0 || _a$4.optimizeNames(names$2, constants);
			(_b = this.finally) === null || _b === void 0 || _b.optimizeNames(names$2, constants);
			return this;
		}
		get names() {
			const names$2 = super.names;
			if (this.catch) addNames(names$2, this.catch.names);
			if (this.finally) addNames(names$2, this.finally.names);
			return names$2;
		}
	};
	var Catch = class extends BlockNode {
		constructor(error$41) {
			super();
			this.error = error$41;
		}
		render(opts) {
			return `catch(${this.error})` + super.render(opts);
		}
	};
	Catch.kind = "catch";
	var Finally = class extends BlockNode {
		render(opts) {
			return "finally" + super.render(opts);
		}
	};
	Finally.kind = "finally";
	var CodeGen = class {
		constructor(extScope, opts = {}) {
			this._values = {};
			this._blockStarts = [];
			this._constants = {};
			this.opts = {
				...opts,
				_n: opts.lines ? "\n" : ""
			};
			this._extScope = extScope;
			this._scope = new scope_1.Scope({ parent: extScope });
			this._nodes = [new Root()];
		}
		toString() {
			return this._root.render(this.opts);
		}
		name(prefix) {
			return this._scope.name(prefix);
		}
		scopeName(prefix) {
			return this._extScope.name(prefix);
		}
		scopeValue(prefixOrName, value) {
			const name = this._extScope.value(prefixOrName, value);
			const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
			vs.add(name);
			return name;
		}
		getScopeValue(prefix, keyOrRef) {
			return this._extScope.getValue(prefix, keyOrRef);
		}
		scopeRefs(scopeName) {
			return this._extScope.scopeRefs(scopeName, this._values);
		}
		scopeCode() {
			return this._extScope.scopeCode(this._values);
		}
		_def(varKind, nameOrPrefix, rhs, constant) {
			const name = this._scope.toName(nameOrPrefix);
			if (rhs !== void 0 && constant) this._constants[name.str] = rhs;
			this._leafNode(new Def(varKind, name, rhs));
			return name;
		}
		const(nameOrPrefix, rhs, _constant) {
			return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
		}
		let(nameOrPrefix, rhs, _constant) {
			return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
		}
		var(nameOrPrefix, rhs, _constant) {
			return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
		}
		assign(lhs, rhs, sideEffects) {
			return this._leafNode(new Assign(lhs, rhs, sideEffects));
		}
		add(lhs, rhs) {
			return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
		}
		code(c) {
			if (typeof c == "function") c();
			else if (c !== code_1$13.nil) this._leafNode(new AnyCode(c));
			return this;
		}
		object(...keyValues) {
			const code = ["{"];
			for (const [key, value] of keyValues) {
				if (code.length > 1) code.push(",");
				code.push(key);
				if (key !== value || this.opts.es5) {
					code.push(":");
					(0, code_1$13.addCodeArg)(code, value);
				}
			}
			code.push("}");
			return new code_1$13._Code(code);
		}
		if(condition, thenBody, elseBody) {
			this._blockNode(new If(condition));
			if (thenBody && elseBody) this.code(thenBody).else().code(elseBody).endIf();
			else if (thenBody) this.code(thenBody).endIf();
			else if (elseBody) throw new Error("CodeGen: \"else\" body without \"then\" body");
			return this;
		}
		elseIf(condition) {
			return this._elseNode(new If(condition));
		}
		else() {
			return this._elseNode(new Else());
		}
		endIf() {
			return this._endBlockNode(If, Else);
		}
		_for(node, forBody) {
			this._blockNode(node);
			if (forBody) this.code(forBody).endFor();
			return this;
		}
		for(iteration, forBody) {
			return this._for(new ForLoop(iteration), forBody);
		}
		forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
			const name = this._scope.toName(nameOrPrefix);
			return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
		}
		forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
			const name = this._scope.toName(nameOrPrefix);
			if (this.opts.es5) {
				const arr = iterable instanceof code_1$13.Name ? iterable : this.var("_arr", iterable);
				return this.forRange("_i", 0, (0, code_1$13._)`${arr}.length`, (i) => {
					this.var(name, (0, code_1$13._)`${arr}[${i}]`);
					forBody(name);
				});
			}
			return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
		}
		forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
			if (this.opts.ownProperties) return this.forOf(nameOrPrefix, (0, code_1$13._)`Object.keys(${obj})`, forBody);
			const name = this._scope.toName(nameOrPrefix);
			return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
		}
		endFor() {
			return this._endBlockNode(For);
		}
		label(label) {
			return this._leafNode(new Label(label));
		}
		break(label) {
			return this._leafNode(new Break(label));
		}
		return(value) {
			const node = new Return();
			this._blockNode(node);
			this.code(value);
			if (node.nodes.length !== 1) throw new Error("CodeGen: \"return\" should have one node");
			return this._endBlockNode(Return);
		}
		try(tryBody, catchCode, finallyCode) {
			if (!catchCode && !finallyCode) throw new Error("CodeGen: \"try\" without \"catch\" and \"finally\"");
			const node = new Try();
			this._blockNode(node);
			this.code(tryBody);
			if (catchCode) {
				const error$41 = this.name("e");
				this._currNode = node.catch = new Catch(error$41);
				catchCode(error$41);
			}
			if (finallyCode) {
				this._currNode = node.finally = new Finally();
				this.code(finallyCode);
			}
			return this._endBlockNode(Catch, Finally);
		}
		throw(error$41) {
			return this._leafNode(new Throw(error$41));
		}
		block(body, nodeCount) {
			this._blockStarts.push(this._nodes.length);
			if (body) this.code(body).endBlock(nodeCount);
			return this;
		}
		endBlock(nodeCount) {
			const len = this._blockStarts.pop();
			if (len === void 0) throw new Error("CodeGen: not in self-balancing block");
			const toClose = this._nodes.length - len;
			if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
			this._nodes.length = len;
			return this;
		}
		func(name, args = code_1$13.nil, async, funcBody) {
			this._blockNode(new Func(name, args, async));
			if (funcBody) this.code(funcBody).endFunc();
			return this;
		}
		endFunc() {
			return this._endBlockNode(Func);
		}
		optimize(n = 1) {
			while (n-- > 0) {
				this._root.optimizeNodes();
				this._root.optimizeNames(this._root.names, this._constants);
			}
		}
		_leafNode(node) {
			this._currNode.nodes.push(node);
			return this;
		}
		_blockNode(node) {
			this._currNode.nodes.push(node);
			this._nodes.push(node);
		}
		_endBlockNode(N1, N2) {
			const n = this._currNode;
			if (n instanceof N1 || N2 && n instanceof N2) {
				this._nodes.pop();
				return this;
			}
			throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
		}
		_elseNode(node) {
			const n = this._currNode;
			if (!(n instanceof If)) throw new Error("CodeGen: \"else\" without \"if\"");
			this._currNode = n.else = node;
			return this;
		}
		get _root() {
			return this._nodes[0];
		}
		get _currNode() {
			const ns = this._nodes;
			return ns[ns.length - 1];
		}
		set _currNode(node) {
			const ns = this._nodes;
			ns[ns.length - 1] = node;
		}
	};
	exports.CodeGen = CodeGen;
	function addNames(names$2, from) {
		for (const n in from) names$2[n] = (names$2[n] || 0) + (from[n] || 0);
		return names$2;
	}
	function addExprNames(names$2, from) {
		return from instanceof code_1$13._CodeOrName ? addNames(names$2, from.names) : names$2;
	}
	function optimizeExpr(expr, names$2, constants) {
		if (expr instanceof code_1$13.Name) return replaceName(expr);
		if (!canOptimize(expr)) return expr;
		return new code_1$13._Code(expr._items.reduce((items, c) => {
			if (c instanceof code_1$13.Name) c = replaceName(c);
			if (c instanceof code_1$13._Code) items.push(...c._items);
			else items.push(c);
			return items;
		}, []));
		function replaceName(n) {
			const c = constants[n.str];
			if (c === void 0 || names$2[n.str] !== 1) return n;
			delete names$2[n.str];
			return c;
		}
		function canOptimize(e) {
			return e instanceof code_1$13._Code && e._items.some((c) => c instanceof code_1$13.Name && names$2[c.str] === 1 && constants[c.str] !== void 0);
		}
	}
	function subtractNames(names$2, from) {
		for (const n in from) names$2[n] = (names$2[n] || 0) - (from[n] || 0);
	}
	function not(x) {
		return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1$13._)`!${par(x)}`;
	}
	exports.not = not;
	const andCode = mappend(exports.operators.AND);
	function and(...args) {
		return args.reduce(andCode);
	}
	exports.and = and;
	const orCode = mappend(exports.operators.OR);
	function or(...args) {
		return args.reduce(orCode);
	}
	exports.or = or;
	function mappend(op) {
		return (x, y) => x === code_1$13.nil ? y : y === code_1$13.nil ? x : (0, code_1$13._)`${par(x)} ${op} ${par(y)}`;
	}
	function par(x) {
		return x instanceof code_1$13.Name ? x : (0, code_1$13._)`(${x})`;
	}
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/util.js
var require_util = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/util.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
	const codegen_1$38 = require_codegen();
	const code_1$12 = require_code$1();
	function toHash(arr) {
		const hash = {};
		for (const item of arr) hash[item] = true;
		return hash;
	}
	exports.toHash = toHash;
	function alwaysValidSchema(it, schema$1) {
		if (typeof schema$1 == "boolean") return schema$1;
		if (Object.keys(schema$1).length === 0) return true;
		checkUnknownRules(it, schema$1);
		return !schemaHasRules(schema$1, it.self.RULES.all);
	}
	exports.alwaysValidSchema = alwaysValidSchema;
	function checkUnknownRules(it, schema$1 = it.schema) {
		const { opts, self } = it;
		if (!opts.strictSchema) return;
		if (typeof schema$1 === "boolean") return;
		const rules = self.RULES.keywords;
		for (const key in schema$1) if (!rules[key]) checkStrictMode(it, `unknown keyword: "${key}"`);
	}
	exports.checkUnknownRules = checkUnknownRules;
	function schemaHasRules(schema$1, rules) {
		if (typeof schema$1 == "boolean") return !schema$1;
		for (const key in schema$1) if (rules[key]) return true;
		return false;
	}
	exports.schemaHasRules = schemaHasRules;
	function schemaHasRulesButRef(schema$1, RULES) {
		if (typeof schema$1 == "boolean") return !schema$1;
		for (const key in schema$1) if (key !== "$ref" && RULES.all[key]) return true;
		return false;
	}
	exports.schemaHasRulesButRef = schemaHasRulesButRef;
	function schemaRefOrVal({ topSchemaRef, schemaPath }, schema$1, keyword$1, $data) {
		if (!$data) {
			if (typeof schema$1 == "number" || typeof schema$1 == "boolean") return schema$1;
			if (typeof schema$1 == "string") return (0, codegen_1$38._)`${schema$1}`;
		}
		return (0, codegen_1$38._)`${topSchemaRef}${schemaPath}${(0, codegen_1$38.getProperty)(keyword$1)}`;
	}
	exports.schemaRefOrVal = schemaRefOrVal;
	function unescapeFragment(str$2) {
		return unescapeJsonPointer(decodeURIComponent(str$2));
	}
	exports.unescapeFragment = unescapeFragment;
	function escapeFragment(str$2) {
		return encodeURIComponent(escapeJsonPointer(str$2));
	}
	exports.escapeFragment = escapeFragment;
	function escapeJsonPointer(str$2) {
		if (typeof str$2 == "number") return `${str$2}`;
		return str$2.replace(/~/g, "~0").replace(/\//g, "~1");
	}
	exports.escapeJsonPointer = escapeJsonPointer;
	function unescapeJsonPointer(str$2) {
		return str$2.replace(/~1/g, "/").replace(/~0/g, "~");
	}
	exports.unescapeJsonPointer = unescapeJsonPointer;
	function eachItem(xs, f) {
		if (Array.isArray(xs)) for (const x of xs) f(x);
		else f(xs);
	}
	exports.eachItem = eachItem;
	function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
		return (gen, from, to, toName) => {
			const res = to === void 0 ? from : to instanceof codegen_1$38.Name ? (from instanceof codegen_1$38.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1$38.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
			return toName === codegen_1$38.Name && !(res instanceof codegen_1$38.Name) ? resultToName(gen, res) : res;
		};
	}
	exports.mergeEvaluated = {
		props: makeMergeEvaluated({
			mergeNames: (gen, from, to) => gen.if((0, codegen_1$38._)`${to} !== true && ${from} !== undefined`, () => {
				gen.if((0, codegen_1$38._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1$38._)`${to} || {}`).code((0, codegen_1$38._)`Object.assign(${to}, ${from})`));
			}),
			mergeToName: (gen, from, to) => gen.if((0, codegen_1$38._)`${to} !== true`, () => {
				if (from === true) gen.assign(to, true);
				else {
					gen.assign(to, (0, codegen_1$38._)`${to} || {}`);
					setEvaluated(gen, to, from);
				}
			}),
			mergeValues: (from, to) => from === true ? true : {
				...from,
				...to
			},
			resultToName: evaluatedPropsToName
		}),
		items: makeMergeEvaluated({
			mergeNames: (gen, from, to) => gen.if((0, codegen_1$38._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1$38._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
			mergeToName: (gen, from, to) => gen.if((0, codegen_1$38._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1$38._)`${to} > ${from} ? ${to} : ${from}`)),
			mergeValues: (from, to) => from === true ? true : Math.max(from, to),
			resultToName: (gen, items) => gen.var("items", items)
		})
	};
	function evaluatedPropsToName(gen, ps) {
		if (ps === true) return gen.var("props", true);
		const props = gen.var("props", (0, codegen_1$38._)`{}`);
		if (ps !== void 0) setEvaluated(gen, props, ps);
		return props;
	}
	exports.evaluatedPropsToName = evaluatedPropsToName;
	function setEvaluated(gen, props, ps) {
		Object.keys(ps).forEach((p) => gen.assign((0, codegen_1$38._)`${props}${(0, codegen_1$38.getProperty)(p)}`, true));
	}
	exports.setEvaluated = setEvaluated;
	const snippets = {};
	function useFunc(gen, f) {
		return gen.scopeValue("func", {
			ref: f,
			code: snippets[f.code] || (snippets[f.code] = new code_1$12._Code(f.code))
		});
	}
	exports.useFunc = useFunc;
	var Type;
	(function(Type$2) {
		Type$2[Type$2["Num"] = 0] = "Num";
		Type$2[Type$2["Str"] = 1] = "Str";
	})(Type || (exports.Type = Type = {}));
	function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
		if (dataProp instanceof codegen_1$38.Name) {
			const isNumber = dataPropType === Type.Num;
			return jsPropertySyntax ? isNumber ? (0, codegen_1$38._)`"[" + ${dataProp} + "]"` : (0, codegen_1$38._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1$38._)`"/" + ${dataProp}` : (0, codegen_1$38._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
		}
		return jsPropertySyntax ? (0, codegen_1$38.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
	}
	exports.getErrorPath = getErrorPath;
	function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
		if (!mode) return;
		msg = `strict mode: ${msg}`;
		if (mode === true) throw new Error(msg);
		it.self.logger.warn(msg);
	}
	exports.checkStrictMode = checkStrictMode;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/names.js
var require_names = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/names.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$37 = require_codegen();
	const names = {
		data: new codegen_1$37.Name("data"),
		valCxt: new codegen_1$37.Name("valCxt"),
		instancePath: new codegen_1$37.Name("instancePath"),
		parentData: new codegen_1$37.Name("parentData"),
		parentDataProperty: new codegen_1$37.Name("parentDataProperty"),
		rootData: new codegen_1$37.Name("rootData"),
		dynamicAnchors: new codegen_1$37.Name("dynamicAnchors"),
		vErrors: new codegen_1$37.Name("vErrors"),
		errors: new codegen_1$37.Name("errors"),
		this: new codegen_1$37.Name("this"),
		self: new codegen_1$37.Name("self"),
		scope: new codegen_1$37.Name("scope"),
		json: new codegen_1$37.Name("json"),
		jsonPos: new codegen_1$37.Name("jsonPos"),
		jsonLen: new codegen_1$37.Name("jsonLen"),
		jsonPart: new codegen_1$37.Name("jsonPart")
	};
	exports.default = names;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/errors.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
	const codegen_1$36 = require_codegen();
	const util_1$29 = require_util();
	const names_1$8 = require_names();
	exports.keywordError = { message: ({ keyword: keyword$1 }) => (0, codegen_1$36.str)`must pass "${keyword$1}" keyword validation` };
	exports.keyword$DataError = { message: ({ keyword: keyword$1, schemaType }) => schemaType ? (0, codegen_1$36.str)`"${keyword$1}" keyword must be ${schemaType} ($data)` : (0, codegen_1$36.str)`"${keyword$1}" keyword is invalid ($data)` };
	function reportError(cxt, error$41 = exports.keywordError, errorPaths, overrideAllErrors) {
		const { it } = cxt;
		const { gen, compositeRule, allErrors } = it;
		const errObj = errorObjectCode(cxt, error$41, errorPaths);
		if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) addError(gen, errObj);
		else returnErrors(it, (0, codegen_1$36._)`[${errObj}]`);
	}
	exports.reportError = reportError;
	function reportExtraError(cxt, error$41 = exports.keywordError, errorPaths) {
		const { it } = cxt;
		const { gen, compositeRule, allErrors } = it;
		const errObj = errorObjectCode(cxt, error$41, errorPaths);
		addError(gen, errObj);
		if (!(compositeRule || allErrors)) returnErrors(it, names_1$8.default.vErrors);
	}
	exports.reportExtraError = reportExtraError;
	function resetErrorsCount(gen, errsCount) {
		gen.assign(names_1$8.default.errors, errsCount);
		gen.if((0, codegen_1$36._)`${names_1$8.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1$36._)`${names_1$8.default.vErrors}.length`, errsCount), () => gen.assign(names_1$8.default.vErrors, null)));
	}
	exports.resetErrorsCount = resetErrorsCount;
	function extendErrors({ gen, keyword: keyword$1, schemaValue, data, errsCount, it }) {
		/* istanbul ignore if */
		if (errsCount === void 0) throw new Error("ajv implementation error");
		const err = gen.name("err");
		gen.forRange("i", errsCount, names_1$8.default.errors, (i) => {
			gen.const(err, (0, codegen_1$36._)`${names_1$8.default.vErrors}[${i}]`);
			gen.if((0, codegen_1$36._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1$36._)`${err}.instancePath`, (0, codegen_1$36.strConcat)(names_1$8.default.instancePath, it.errorPath)));
			gen.assign((0, codegen_1$36._)`${err}.schemaPath`, (0, codegen_1$36.str)`${it.errSchemaPath}/${keyword$1}`);
			if (it.opts.verbose) {
				gen.assign((0, codegen_1$36._)`${err}.schema`, schemaValue);
				gen.assign((0, codegen_1$36._)`${err}.data`, data);
			}
		});
	}
	exports.extendErrors = extendErrors;
	function addError(gen, errObj) {
		const err = gen.const("err", errObj);
		gen.if((0, codegen_1$36._)`${names_1$8.default.vErrors} === null`, () => gen.assign(names_1$8.default.vErrors, (0, codegen_1$36._)`[${err}]`), (0, codegen_1$36._)`${names_1$8.default.vErrors}.push(${err})`);
		gen.code((0, codegen_1$36._)`${names_1$8.default.errors}++`);
	}
	function returnErrors(it, errs) {
		const { gen, validateName, schemaEnv } = it;
		if (schemaEnv.$async) gen.throw((0, codegen_1$36._)`new ${it.ValidationError}(${errs})`);
		else {
			gen.assign((0, codegen_1$36._)`${validateName}.errors`, errs);
			gen.return(false);
		}
	}
	const E = {
		keyword: new codegen_1$36.Name("keyword"),
		schemaPath: new codegen_1$36.Name("schemaPath"),
		params: new codegen_1$36.Name("params"),
		propertyName: new codegen_1$36.Name("propertyName"),
		message: new codegen_1$36.Name("message"),
		schema: new codegen_1$36.Name("schema"),
		parentSchema: new codegen_1$36.Name("parentSchema")
	};
	function errorObjectCode(cxt, error$41, errorPaths) {
		const { createErrors } = cxt.it;
		if (createErrors === false) return (0, codegen_1$36._)`{}`;
		return errorObject(cxt, error$41, errorPaths);
	}
	function errorObject(cxt, error$41, errorPaths = {}) {
		const { gen, it } = cxt;
		const keyValues = [errorInstancePath(it, errorPaths), errorSchemaPath(cxt, errorPaths)];
		extraErrorProps(cxt, error$41, keyValues);
		return gen.object(...keyValues);
	}
	function errorInstancePath({ errorPath }, { instancePath }) {
		const instPath = instancePath ? (0, codegen_1$36.str)`${errorPath}${(0, util_1$29.getErrorPath)(instancePath, util_1$29.Type.Str)}` : errorPath;
		return [names_1$8.default.instancePath, (0, codegen_1$36.strConcat)(names_1$8.default.instancePath, instPath)];
	}
	function errorSchemaPath({ keyword: keyword$1, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
		let schPath = parentSchema ? errSchemaPath : (0, codegen_1$36.str)`${errSchemaPath}/${keyword$1}`;
		if (schemaPath) schPath = (0, codegen_1$36.str)`${schPath}${(0, util_1$29.getErrorPath)(schemaPath, util_1$29.Type.Str)}`;
		return [E.schemaPath, schPath];
	}
	function extraErrorProps(cxt, { params, message }, keyValues) {
		const { keyword: keyword$1, data, schemaValue, it } = cxt;
		const { opts, propertyName, topSchemaRef, schemaPath } = it;
		keyValues.push([E.keyword, keyword$1], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1$36._)`{}`]);
		if (opts.messages) keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
		if (opts.verbose) keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1$36._)`${topSchemaRef}${schemaPath}`], [names_1$8.default.data, data]);
		if (propertyName) keyValues.push([E.propertyName, propertyName]);
	}
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/boolSchema.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
	const errors_1$4 = require_errors();
	const codegen_1$35 = require_codegen();
	const names_1$7 = require_names();
	const boolError = { message: "boolean schema is false" };
	function topBoolOrEmptySchema(it) {
		const { gen, schema: schema$1, validateName } = it;
		if (schema$1 === false) falseSchemaError(it, false);
		else if (typeof schema$1 == "object" && schema$1.$async === true) gen.return(names_1$7.default.data);
		else {
			gen.assign((0, codegen_1$35._)`${validateName}.errors`, null);
			gen.return(true);
		}
	}
	exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
	function boolOrEmptySchema(it, valid) {
		const { gen, schema: schema$1 } = it;
		if (schema$1 === false) {
			gen.var(valid, false);
			falseSchemaError(it);
		} else gen.var(valid, true);
	}
	exports.boolOrEmptySchema = boolOrEmptySchema;
	function falseSchemaError(it, overrideAllErrors) {
		const { gen, data } = it;
		const cxt = {
			gen,
			keyword: "false schema",
			data,
			schema: false,
			schemaCode: false,
			schemaValue: false,
			params: {},
			it
		};
		(0, errors_1$4.reportError)(cxt, boolError, void 0, overrideAllErrors);
	}
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/rules.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getRules = exports.isJSONType = void 0;
	const _jsonTypes = [
		"string",
		"number",
		"integer",
		"boolean",
		"null",
		"object",
		"array"
	];
	const jsonTypes = new Set(_jsonTypes);
	function isJSONType(x) {
		return typeof x == "string" && jsonTypes.has(x);
	}
	exports.isJSONType = isJSONType;
	function getRules() {
		const groups = {
			number: {
				type: "number",
				rules: []
			},
			string: {
				type: "string",
				rules: []
			},
			array: {
				type: "array",
				rules: []
			},
			object: {
				type: "object",
				rules: []
			}
		};
		return {
			types: {
				...groups,
				integer: true,
				boolean: true,
				null: true
			},
			rules: [
				{ rules: [] },
				groups.number,
				groups.string,
				groups.array,
				groups.object
			],
			post: { rules: [] },
			all: {},
			keywords: {}
		};
	}
	exports.getRules = getRules;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/applicability.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
	function schemaHasRulesForType({ schema: schema$1, self }, type) {
		const group = self.RULES.types[type];
		return group && group !== true && shouldUseGroup(schema$1, group);
	}
	exports.schemaHasRulesForType = schemaHasRulesForType;
	function shouldUseGroup(schema$1, group) {
		return group.rules.some((rule) => shouldUseRule(schema$1, rule));
	}
	exports.shouldUseGroup = shouldUseGroup;
	function shouldUseRule(schema$1, rule) {
		var _a$4;
		return schema$1[rule.keyword] !== void 0 || ((_a$4 = rule.definition.implements) === null || _a$4 === void 0 ? void 0 : _a$4.some((kwd) => schema$1[kwd] !== void 0));
	}
	exports.shouldUseRule = shouldUseRule;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/dataType.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
	const rules_1$1 = require_rules();
	const applicability_1$1 = require_applicability();
	const errors_1$3 = require_errors();
	const codegen_1$34 = require_codegen();
	const util_1$28 = require_util();
	var DataType;
	(function(DataType$2) {
		DataType$2[DataType$2["Correct"] = 0] = "Correct";
		DataType$2[DataType$2["Wrong"] = 1] = "Wrong";
	})(DataType || (exports.DataType = DataType = {}));
	function getSchemaTypes(schema$1) {
		const types = getJSONTypes(schema$1.type);
		const hasNull = types.includes("null");
		if (hasNull) {
			if (schema$1.nullable === false) throw new Error("type: null contradicts nullable: false");
		} else {
			if (!types.length && schema$1.nullable !== void 0) throw new Error("\"nullable\" cannot be used without \"type\"");
			if (schema$1.nullable === true) types.push("null");
		}
		return types;
	}
	exports.getSchemaTypes = getSchemaTypes;
	function getJSONTypes(ts) {
		const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
		if (types.every(rules_1$1.isJSONType)) return types;
		throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
	}
	exports.getJSONTypes = getJSONTypes;
	function coerceAndCheckDataType(it, types) {
		const { gen, data, opts } = it;
		const coerceTo = coerceToTypes(types, opts.coerceTypes);
		const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1$1.schemaHasRulesForType)(it, types[0]));
		if (checkTypes) {
			const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
			gen.if(wrongType, () => {
				if (coerceTo.length) coerceData(it, types, coerceTo);
				else reportTypeError(it);
			});
		}
		return checkTypes;
	}
	exports.coerceAndCheckDataType = coerceAndCheckDataType;
	const COERCIBLE = new Set([
		"string",
		"number",
		"integer",
		"boolean",
		"null"
	]);
	function coerceToTypes(types, coerceTypes) {
		return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
	}
	function coerceData(it, types, coerceTo) {
		const { gen, data, opts } = it;
		const dataType = gen.let("dataType", (0, codegen_1$34._)`typeof ${data}`);
		const coerced = gen.let("coerced", (0, codegen_1$34._)`undefined`);
		if (opts.coerceTypes === "array") gen.if((0, codegen_1$34._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1$34._)`${data}[0]`).assign(dataType, (0, codegen_1$34._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
		gen.if((0, codegen_1$34._)`${coerced} !== undefined`);
		for (const t of coerceTo) if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") coerceSpecificType(t);
		gen.else();
		reportTypeError(it);
		gen.endIf();
		gen.if((0, codegen_1$34._)`${coerced} !== undefined`, () => {
			gen.assign(data, coerced);
			assignParentData(it, coerced);
		});
		function coerceSpecificType(t) {
			switch (t) {
				case "string":
					gen.elseIf((0, codegen_1$34._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1$34._)`"" + ${data}`).elseIf((0, codegen_1$34._)`${data} === null`).assign(coerced, (0, codegen_1$34._)`""`);
					return;
				case "number":
					gen.elseIf((0, codegen_1$34._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1$34._)`+${data}`);
					return;
				case "integer":
					gen.elseIf((0, codegen_1$34._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1$34._)`+${data}`);
					return;
				case "boolean":
					gen.elseIf((0, codegen_1$34._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1$34._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
					return;
				case "null":
					gen.elseIf((0, codegen_1$34._)`${data} === "" || ${data} === 0 || ${data} === false`);
					gen.assign(coerced, null);
					return;
				case "array": gen.elseIf((0, codegen_1$34._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1$34._)`[${data}]`);
			}
		}
	}
	function assignParentData({ gen, parentData, parentDataProperty }, expr) {
		gen.if((0, codegen_1$34._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1$34._)`${parentData}[${parentDataProperty}]`, expr));
	}
	function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
		const EQ = correct === DataType.Correct ? codegen_1$34.operators.EQ : codegen_1$34.operators.NEQ;
		let cond;
		switch (dataType) {
			case "null": return (0, codegen_1$34._)`${data} ${EQ} null`;
			case "array":
				cond = (0, codegen_1$34._)`Array.isArray(${data})`;
				break;
			case "object":
				cond = (0, codegen_1$34._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
				break;
			case "integer":
				cond = numCond((0, codegen_1$34._)`!(${data} % 1) && !isNaN(${data})`);
				break;
			case "number":
				cond = numCond();
				break;
			default: return (0, codegen_1$34._)`typeof ${data} ${EQ} ${dataType}`;
		}
		return correct === DataType.Correct ? cond : (0, codegen_1$34.not)(cond);
		function numCond(_cond = codegen_1$34.nil) {
			return (0, codegen_1$34.and)((0, codegen_1$34._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1$34._)`isFinite(${data})` : codegen_1$34.nil);
		}
	}
	exports.checkDataType = checkDataType;
	function checkDataTypes(dataTypes, data, strictNums, correct) {
		if (dataTypes.length === 1) return checkDataType(dataTypes[0], data, strictNums, correct);
		let cond;
		const types = (0, util_1$28.toHash)(dataTypes);
		if (types.array && types.object) {
			const notObj = (0, codegen_1$34._)`typeof ${data} != "object"`;
			cond = types.null ? notObj : (0, codegen_1$34._)`!${data} || ${notObj}`;
			delete types.null;
			delete types.array;
			delete types.object;
		} else cond = codegen_1$34.nil;
		if (types.number) delete types.integer;
		for (const t in types) cond = (0, codegen_1$34.and)(cond, checkDataType(t, data, strictNums, correct));
		return cond;
	}
	exports.checkDataTypes = checkDataTypes;
	const typeError = {
		message: ({ schema: schema$1 }) => `must be ${schema$1}`,
		params: ({ schema: schema$1, schemaValue }) => typeof schema$1 == "string" ? (0, codegen_1$34._)`{type: ${schema$1}}` : (0, codegen_1$34._)`{type: ${schemaValue}}`
	};
	function reportTypeError(it) {
		const cxt = getTypeErrorContext(it);
		(0, errors_1$3.reportError)(cxt, typeError);
	}
	exports.reportTypeError = reportTypeError;
	function getTypeErrorContext(it) {
		const { gen, data, schema: schema$1 } = it;
		const schemaCode = (0, util_1$28.schemaRefOrVal)(it, schema$1, "type");
		return {
			gen,
			keyword: "type",
			data,
			schema: schema$1.type,
			schemaCode,
			schemaValue: schemaCode,
			parentSchema: schema$1,
			params: {},
			it
		};
	}
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/defaults.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.assignDefaults = void 0;
	const codegen_1$33 = require_codegen();
	const util_1$27 = require_util();
	function assignDefaults(it, ty) {
		const { properties, items } = it.schema;
		if (ty === "object" && properties) for (const key in properties) assignDefault(it, key, properties[key].default);
		else if (ty === "array" && Array.isArray(items)) items.forEach((sch, i) => assignDefault(it, i, sch.default));
	}
	exports.assignDefaults = assignDefaults;
	function assignDefault(it, prop, defaultValue) {
		const { gen, compositeRule, data, opts } = it;
		if (defaultValue === void 0) return;
		const childData = (0, codegen_1$33._)`${data}${(0, codegen_1$33.getProperty)(prop)}`;
		if (compositeRule) {
			(0, util_1$27.checkStrictMode)(it, `default is ignored for: ${childData}`);
			return;
		}
		let condition = (0, codegen_1$33._)`${childData} === undefined`;
		if (opts.useDefaults === "empty") condition = (0, codegen_1$33._)`${condition} || ${childData} === null || ${childData} === ""`;
		gen.if(condition, (0, codegen_1$33._)`${childData} = ${(0, codegen_1$33.stringify)(defaultValue)}`);
	}
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/code.js
var require_code = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/code.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
	const codegen_1$32 = require_codegen();
	const util_1$26 = require_util();
	const names_1$6 = require_names();
	const util_2$1 = require_util();
	function checkReportMissingProp(cxt, prop) {
		const { gen, data, it } = cxt;
		gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
			cxt.setParams({ missingProperty: (0, codegen_1$32._)`${prop}` }, true);
			cxt.error();
		});
	}
	exports.checkReportMissingProp = checkReportMissingProp;
	function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
		return (0, codegen_1$32.or)(...properties.map((prop) => (0, codegen_1$32.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1$32._)`${missing} = ${prop}`)));
	}
	exports.checkMissingProp = checkMissingProp;
	function reportMissingProp(cxt, missing) {
		cxt.setParams({ missingProperty: missing }, true);
		cxt.error();
	}
	exports.reportMissingProp = reportMissingProp;
	function hasPropFunc(gen) {
		return gen.scopeValue("func", {
			ref: Object.prototype.hasOwnProperty,
			code: (0, codegen_1$32._)`Object.prototype.hasOwnProperty`
		});
	}
	exports.hasPropFunc = hasPropFunc;
	function isOwnProperty(gen, data, property) {
		return (0, codegen_1$32._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
	}
	exports.isOwnProperty = isOwnProperty;
	function propertyInData(gen, data, property, ownProperties) {
		const cond = (0, codegen_1$32._)`${data}${(0, codegen_1$32.getProperty)(property)} !== undefined`;
		return ownProperties ? (0, codegen_1$32._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
	}
	exports.propertyInData = propertyInData;
	function noPropertyInData(gen, data, property, ownProperties) {
		const cond = (0, codegen_1$32._)`${data}${(0, codegen_1$32.getProperty)(property)} === undefined`;
		return ownProperties ? (0, codegen_1$32.or)(cond, (0, codegen_1$32.not)(isOwnProperty(gen, data, property))) : cond;
	}
	exports.noPropertyInData = noPropertyInData;
	function allSchemaProperties(schemaMap) {
		return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
	}
	exports.allSchemaProperties = allSchemaProperties;
	function schemaProperties(it, schemaMap) {
		return allSchemaProperties(schemaMap).filter((p) => !(0, util_1$26.alwaysValidSchema)(it, schemaMap[p]));
	}
	exports.schemaProperties = schemaProperties;
	function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
		const dataAndSchema = passSchema ? (0, codegen_1$32._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
		const valCxt = [
			[names_1$6.default.instancePath, (0, codegen_1$32.strConcat)(names_1$6.default.instancePath, errorPath)],
			[names_1$6.default.parentData, it.parentData],
			[names_1$6.default.parentDataProperty, it.parentDataProperty],
			[names_1$6.default.rootData, names_1$6.default.rootData]
		];
		if (it.opts.dynamicRef) valCxt.push([names_1$6.default.dynamicAnchors, names_1$6.default.dynamicAnchors]);
		const args = (0, codegen_1$32._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
		return context !== codegen_1$32.nil ? (0, codegen_1$32._)`${func}.call(${context}, ${args})` : (0, codegen_1$32._)`${func}(${args})`;
	}
	exports.callValidateCode = callValidateCode;
	const newRegExp = (0, codegen_1$32._)`new RegExp`;
	function usePattern({ gen, it: { opts } }, pattern) {
		const u = opts.unicodeRegExp ? "u" : "";
		const { regExp } = opts.code;
		const rx = regExp(pattern, u);
		return gen.scopeValue("pattern", {
			key: rx.toString(),
			ref: rx,
			code: (0, codegen_1$32._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2$1.useFunc)(gen, regExp)}(${pattern}, ${u})`
		});
	}
	exports.usePattern = usePattern;
	function validateArray(cxt) {
		const { gen, data, keyword: keyword$1, it } = cxt;
		const valid = gen.name("valid");
		if (it.allErrors) {
			const validArr = gen.let("valid", true);
			validateItems(() => gen.assign(validArr, false));
			return validArr;
		}
		gen.var(valid, true);
		validateItems(() => gen.break());
		return valid;
		function validateItems(notValid) {
			const len = gen.const("len", (0, codegen_1$32._)`${data}.length`);
			gen.forRange("i", 0, len, (i) => {
				cxt.subschema({
					keyword: keyword$1,
					dataProp: i,
					dataPropType: util_1$26.Type.Num
				}, valid);
				gen.if((0, codegen_1$32.not)(valid), notValid);
			});
		}
	}
	exports.validateArray = validateArray;
	function validateUnion(cxt) {
		const { gen, schema: schema$1, keyword: keyword$1, it } = cxt;
		/* istanbul ignore if */
		if (!Array.isArray(schema$1)) throw new Error("ajv implementation error");
		const alwaysValid = schema$1.some((sch) => (0, util_1$26.alwaysValidSchema)(it, sch));
		if (alwaysValid && !it.opts.unevaluated) return;
		const valid = gen.let("valid", false);
		const schValid = gen.name("_valid");
		gen.block(() => schema$1.forEach((_sch, i) => {
			const schCxt = cxt.subschema({
				keyword: keyword$1,
				schemaProp: i,
				compositeRule: true
			}, schValid);
			gen.assign(valid, (0, codegen_1$32._)`${valid} || ${schValid}`);
			const merged = cxt.mergeValidEvaluated(schCxt, schValid);
			if (!merged) gen.if((0, codegen_1$32.not)(valid));
		}));
		cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
	}
	exports.validateUnion = validateUnion;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/keyword.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
	const codegen_1$31 = require_codegen();
	const names_1$5 = require_names();
	const code_1$11 = require_code();
	const errors_1$2 = require_errors();
	function macroKeywordCode(cxt, def$69) {
		const { gen, keyword: keyword$1, schema: schema$1, parentSchema, it } = cxt;
		const macroSchema = def$69.macro.call(it.self, schema$1, parentSchema, it);
		const schemaRef = useKeyword(gen, keyword$1, macroSchema);
		if (it.opts.validateSchema !== false) it.self.validateSchema(macroSchema, true);
		const valid = gen.name("valid");
		cxt.subschema({
			schema: macroSchema,
			schemaPath: codegen_1$31.nil,
			errSchemaPath: `${it.errSchemaPath}/${keyword$1}`,
			topSchemaRef: schemaRef,
			compositeRule: true
		}, valid);
		cxt.pass(valid, () => cxt.error(true));
	}
	exports.macroKeywordCode = macroKeywordCode;
	function funcKeywordCode(cxt, def$69) {
		var _a$4;
		const { gen, keyword: keyword$1, schema: schema$1, parentSchema, $data, it } = cxt;
		checkAsyncKeyword(it, def$69);
		const validate$1 = !$data && def$69.compile ? def$69.compile.call(it.self, schema$1, parentSchema, it) : def$69.validate;
		const validateRef = useKeyword(gen, keyword$1, validate$1);
		const valid = gen.let("valid");
		cxt.block$data(valid, validateKeyword);
		cxt.ok((_a$4 = def$69.valid) !== null && _a$4 !== void 0 ? _a$4 : valid);
		function validateKeyword() {
			if (def$69.errors === false) {
				assignValid();
				if (def$69.modifying) modifyData(cxt);
				reportErrs(() => cxt.error());
			} else {
				const ruleErrs = def$69.async ? validateAsync() : validateSync();
				if (def$69.modifying) modifyData(cxt);
				reportErrs(() => addErrs(cxt, ruleErrs));
			}
		}
		function validateAsync() {
			const ruleErrs = gen.let("ruleErrs", null);
			gen.try(() => assignValid((0, codegen_1$31._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1$31._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1$31._)`${e}.errors`), () => gen.throw(e)));
			return ruleErrs;
		}
		function validateSync() {
			const validateErrs = (0, codegen_1$31._)`${validateRef}.errors`;
			gen.assign(validateErrs, null);
			assignValid(codegen_1$31.nil);
			return validateErrs;
		}
		function assignValid(_await = def$69.async ? (0, codegen_1$31._)`await ` : codegen_1$31.nil) {
			const passCxt = it.opts.passContext ? names_1$5.default.this : names_1$5.default.self;
			const passSchema = !("compile" in def$69 && !$data || def$69.schema === false);
			gen.assign(valid, (0, codegen_1$31._)`${_await}${(0, code_1$11.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def$69.modifying);
		}
		function reportErrs(errors) {
			var _a$5;
			gen.if((0, codegen_1$31.not)((_a$5 = def$69.valid) !== null && _a$5 !== void 0 ? _a$5 : valid), errors);
		}
	}
	exports.funcKeywordCode = funcKeywordCode;
	function modifyData(cxt) {
		const { gen, data, it } = cxt;
		gen.if(it.parentData, () => gen.assign(data, (0, codegen_1$31._)`${it.parentData}[${it.parentDataProperty}]`));
	}
	function addErrs(cxt, errs) {
		const { gen } = cxt;
		gen.if((0, codegen_1$31._)`Array.isArray(${errs})`, () => {
			gen.assign(names_1$5.default.vErrors, (0, codegen_1$31._)`${names_1$5.default.vErrors} === null ? ${errs} : ${names_1$5.default.vErrors}.concat(${errs})`).assign(names_1$5.default.errors, (0, codegen_1$31._)`${names_1$5.default.vErrors}.length`);
			(0, errors_1$2.extendErrors)(cxt);
		}, () => cxt.error());
	}
	function checkAsyncKeyword({ schemaEnv }, def$69) {
		if (def$69.async && !schemaEnv.$async) throw new Error("async keyword in sync schema");
	}
	function useKeyword(gen, keyword$1, result) {
		if (result === void 0) throw new Error(`keyword "${keyword$1}" failed to compile`);
		return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : {
			ref: result,
			code: (0, codegen_1$31.stringify)(result)
		});
	}
	function validSchemaType(schema$1, schemaType, allowUndefined = false) {
		return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema$1) : st === "object" ? schema$1 && typeof schema$1 == "object" && !Array.isArray(schema$1) : typeof schema$1 == st || allowUndefined && typeof schema$1 == "undefined");
	}
	exports.validSchemaType = validSchemaType;
	function validateKeywordUsage({ schema: schema$1, opts, self, errSchemaPath }, def$69, keyword$1) {
		/* istanbul ignore if */
		if (Array.isArray(def$69.keyword) ? !def$69.keyword.includes(keyword$1) : def$69.keyword !== keyword$1) throw new Error("ajv implementation error");
		const deps = def$69.dependencies;
		if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema$1, kwd))) throw new Error(`parent schema must have dependencies of ${keyword$1}: ${deps.join(",")}`);
		if (def$69.validateSchema) {
			const valid = def$69.validateSchema(schema$1[keyword$1]);
			if (!valid) {
				const msg = `keyword "${keyword$1}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def$69.validateSchema.errors);
				if (opts.validateSchema === "log") self.logger.error(msg);
				else throw new Error(msg);
			}
		}
	}
	exports.validateKeywordUsage = validateKeywordUsage;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/subschema.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
	const codegen_1$30 = require_codegen();
	const util_1$25 = require_util();
	function getSubschema(it, { keyword: keyword$1, schemaProp, schema: schema$1, schemaPath, errSchemaPath, topSchemaRef }) {
		if (keyword$1 !== void 0 && schema$1 !== void 0) throw new Error("both \"keyword\" and \"schema\" passed, only one allowed");
		if (keyword$1 !== void 0) {
			const sch = it.schema[keyword$1];
			return schemaProp === void 0 ? {
				schema: sch,
				schemaPath: (0, codegen_1$30._)`${it.schemaPath}${(0, codegen_1$30.getProperty)(keyword$1)}`,
				errSchemaPath: `${it.errSchemaPath}/${keyword$1}`
			} : {
				schema: sch[schemaProp],
				schemaPath: (0, codegen_1$30._)`${it.schemaPath}${(0, codegen_1$30.getProperty)(keyword$1)}${(0, codegen_1$30.getProperty)(schemaProp)}`,
				errSchemaPath: `${it.errSchemaPath}/${keyword$1}/${(0, util_1$25.escapeFragment)(schemaProp)}`
			};
		}
		if (schema$1 !== void 0) {
			if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) throw new Error("\"schemaPath\", \"errSchemaPath\" and \"topSchemaRef\" are required with \"schema\"");
			return {
				schema: schema$1,
				schemaPath,
				topSchemaRef,
				errSchemaPath
			};
		}
		throw new Error("either \"keyword\" or \"schema\" must be passed");
	}
	exports.getSubschema = getSubschema;
	function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
		if (data !== void 0 && dataProp !== void 0) throw new Error("both \"data\" and \"dataProp\" passed, only one allowed");
		const { gen } = it;
		if (dataProp !== void 0) {
			const { errorPath, dataPathArr, opts } = it;
			const nextData = gen.let("data", (0, codegen_1$30._)`${it.data}${(0, codegen_1$30.getProperty)(dataProp)}`, true);
			dataContextProps(nextData);
			subschema.errorPath = (0, codegen_1$30.str)`${errorPath}${(0, util_1$25.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
			subschema.parentDataProperty = (0, codegen_1$30._)`${dataProp}`;
			subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
		}
		if (data !== void 0) {
			const nextData = data instanceof codegen_1$30.Name ? data : gen.let("data", data, true);
			dataContextProps(nextData);
			if (propertyName !== void 0) subschema.propertyName = propertyName;
		}
		if (dataTypes) subschema.dataTypes = dataTypes;
		function dataContextProps(_nextData) {
			subschema.data = _nextData;
			subschema.dataLevel = it.dataLevel + 1;
			subschema.dataTypes = [];
			it.definedProperties = /* @__PURE__ */ new Set();
			subschema.parentData = it.data;
			subschema.dataNames = [...it.dataNames, _nextData];
		}
	}
	exports.extendSubschemaData = extendSubschemaData;
	function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
		if (compositeRule !== void 0) subschema.compositeRule = compositeRule;
		if (createErrors !== void 0) subschema.createErrors = createErrors;
		if (allErrors !== void 0) subschema.allErrors = allErrors;
		subschema.jtdDiscriminator = jtdDiscriminator;
		subschema.jtdMetadata = jtdMetadata;
	}
	exports.extendSubschemaMode = extendSubschemaMode;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS({ "../node_modules/ajv-formats/node_modules/json-schema-traverse/index.js"(exports, module) {
	var traverse$1 = module.exports = function(schema$1, opts, cb) {
		if (typeof opts == "function") {
			cb = opts;
			opts = {};
		}
		cb = opts.cb || cb;
		var pre = typeof cb == "function" ? cb : cb.pre || function() {};
		var post = cb.post || function() {};
		_traverse(opts, pre, post, schema$1, "", schema$1);
	};
	traverse$1.keywords = {
		additionalItems: true,
		items: true,
		contains: true,
		additionalProperties: true,
		propertyNames: true,
		not: true,
		if: true,
		then: true,
		else: true
	};
	traverse$1.arrayKeywords = {
		items: true,
		allOf: true,
		anyOf: true,
		oneOf: true
	};
	traverse$1.propsKeywords = {
		$defs: true,
		definitions: true,
		properties: true,
		patternProperties: true,
		dependencies: true
	};
	traverse$1.skipKeywords = {
		default: true,
		enum: true,
		const: true,
		required: true,
		maximum: true,
		minimum: true,
		exclusiveMaximum: true,
		exclusiveMinimum: true,
		multipleOf: true,
		maxLength: true,
		minLength: true,
		pattern: true,
		format: true,
		maxItems: true,
		minItems: true,
		uniqueItems: true,
		maxProperties: true,
		minProperties: true
	};
	function _traverse(opts, pre, post, schema$1, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
		if (schema$1 && typeof schema$1 == "object" && !Array.isArray(schema$1)) {
			pre(schema$1, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
			for (var key in schema$1) {
				var sch = schema$1[key];
				if (Array.isArray(sch)) {
					if (key in traverse$1.arrayKeywords) for (var i = 0; i < sch.length; i++) _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema$1, i);
				} else if (key in traverse$1.propsKeywords) {
					if (sch && typeof sch == "object") for (var prop in sch) _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema$1, prop);
				} else if (key in traverse$1.keywords || opts.allKeys && !(key in traverse$1.skipKeywords)) _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema$1);
			}
			post(schema$1, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
		}
	}
	function escapeJsonPtr(str$2) {
		return str$2.replace(/~/g, "~0").replace(/\//g, "~1");
	}
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/resolve.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
	const util_1$24 = require_util();
	const equal$1 = require_fast_deep_equal();
	const traverse = require_json_schema_traverse();
	const SIMPLE_INLINED = new Set([
		"type",
		"format",
		"pattern",
		"maxLength",
		"minLength",
		"maxProperties",
		"minProperties",
		"maxItems",
		"minItems",
		"maximum",
		"minimum",
		"uniqueItems",
		"multipleOf",
		"required",
		"enum",
		"const"
	]);
	function inlineRef(schema$1, limit = true) {
		if (typeof schema$1 == "boolean") return true;
		if (limit === true) return !hasRef(schema$1);
		if (!limit) return false;
		return countKeys(schema$1) <= limit;
	}
	exports.inlineRef = inlineRef;
	const REF_KEYWORDS = new Set([
		"$ref",
		"$recursiveRef",
		"$recursiveAnchor",
		"$dynamicRef",
		"$dynamicAnchor"
	]);
	function hasRef(schema$1) {
		for (const key in schema$1) {
			if (REF_KEYWORDS.has(key)) return true;
			const sch = schema$1[key];
			if (Array.isArray(sch) && sch.some(hasRef)) return true;
			if (typeof sch == "object" && hasRef(sch)) return true;
		}
		return false;
	}
	function countKeys(schema$1) {
		let count = 0;
		for (const key in schema$1) {
			if (key === "$ref") return Infinity;
			count++;
			if (SIMPLE_INLINED.has(key)) continue;
			if (typeof schema$1[key] == "object") (0, util_1$24.eachItem)(schema$1[key], (sch) => count += countKeys(sch));
			if (count === Infinity) return Infinity;
		}
		return count;
	}
	function getFullPath(resolver, id = "", normalize$1) {
		if (normalize$1 !== false) id = normalizeId(id);
		const p = resolver.parse(id);
		return _getFullPath(resolver, p);
	}
	exports.getFullPath = getFullPath;
	function _getFullPath(resolver, p) {
		const serialized = resolver.serialize(p);
		return serialized.split("#")[0] + "#";
	}
	exports._getFullPath = _getFullPath;
	const TRAILING_SLASH_HASH = /#\/?$/;
	function normalizeId(id) {
		return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
	}
	exports.normalizeId = normalizeId;
	function resolveUrl(resolver, baseId, id) {
		id = normalizeId(id);
		return resolver.resolve(baseId, id);
	}
	exports.resolveUrl = resolveUrl;
	const ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
	function getSchemaRefs(schema$1, baseId) {
		if (typeof schema$1 == "boolean") return {};
		const { schemaId, uriResolver } = this.opts;
		const schId = normalizeId(schema$1[schemaId] || baseId);
		const baseIds = { "": schId };
		const pathPrefix = getFullPath(uriResolver, schId, false);
		const localRefs = {};
		const schemaRefs = /* @__PURE__ */ new Set();
		traverse(schema$1, { allKeys: true }, (sch, jsonPtr, _$2, parentJsonPtr) => {
			if (parentJsonPtr === void 0) return;
			const fullPath = pathPrefix + jsonPtr;
			let innerBaseId = baseIds[parentJsonPtr];
			if (typeof sch[schemaId] == "string") innerBaseId = addRef.call(this, sch[schemaId]);
			addAnchor.call(this, sch.$anchor);
			addAnchor.call(this, sch.$dynamicAnchor);
			baseIds[jsonPtr] = innerBaseId;
			function addRef(ref) {
				const _resolve = this.opts.uriResolver.resolve;
				ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
				if (schemaRefs.has(ref)) throw ambiguos(ref);
				schemaRefs.add(ref);
				let schOrRef = this.refs[ref];
				if (typeof schOrRef == "string") schOrRef = this.refs[schOrRef];
				if (typeof schOrRef == "object") checkAmbiguosRef(sch, schOrRef.schema, ref);
				else if (ref !== normalizeId(fullPath)) if (ref[0] === "#") {
					checkAmbiguosRef(sch, localRefs[ref], ref);
					localRefs[ref] = sch;
				} else this.refs[ref] = fullPath;
				return ref;
			}
			function addAnchor(anchor) {
				if (typeof anchor == "string") {
					if (!ANCHOR.test(anchor)) throw new Error(`invalid anchor "${anchor}"`);
					addRef.call(this, `#${anchor}`);
				}
			}
		});
		return localRefs;
		function checkAmbiguosRef(sch1, sch2, ref) {
			if (sch2 !== void 0 && !equal$1(sch1, sch2)) throw ambiguos(ref);
		}
		function ambiguos(ref) {
			return new Error(`reference "${ref}" resolves to more than one schema`);
		}
	}
	exports.getSchemaRefs = getSchemaRefs;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
	const boolSchema_1 = require_boolSchema();
	const dataType_1$2 = require_dataType();
	const applicability_1 = require_applicability();
	const dataType_2 = require_dataType();
	const defaults_1 = require_defaults();
	const keyword_1 = require_keyword();
	const subschema_1 = require_subschema();
	const codegen_1$29 = require_codegen();
	const names_1$4 = require_names();
	const resolve_1$3 = require_resolve();
	const util_1$23 = require_util();
	const errors_1$1 = require_errors();
	function validateFunctionCode(it) {
		if (isSchemaObj(it)) {
			checkKeywords(it);
			if (schemaCxtHasRules(it)) {
				topSchemaObjCode(it);
				return;
			}
		}
		validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
	}
	exports.validateFunctionCode = validateFunctionCode;
	function validateFunction({ gen, validateName, schema: schema$1, schemaEnv, opts }, body) {
		if (opts.code.es5) gen.func(validateName, (0, codegen_1$29._)`${names_1$4.default.data}, ${names_1$4.default.valCxt}`, schemaEnv.$async, () => {
			gen.code((0, codegen_1$29._)`"use strict"; ${funcSourceUrl(schema$1, opts)}`);
			destructureValCxtES5(gen, opts);
			gen.code(body);
		});
		else gen.func(validateName, (0, codegen_1$29._)`${names_1$4.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema$1, opts)).code(body));
	}
	function destructureValCxt(opts) {
		return (0, codegen_1$29._)`{${names_1$4.default.instancePath}="", ${names_1$4.default.parentData}, ${names_1$4.default.parentDataProperty}, ${names_1$4.default.rootData}=${names_1$4.default.data}${opts.dynamicRef ? (0, codegen_1$29._)`, ${names_1$4.default.dynamicAnchors}={}` : codegen_1$29.nil}}={}`;
	}
	function destructureValCxtES5(gen, opts) {
		gen.if(names_1$4.default.valCxt, () => {
			gen.var(names_1$4.default.instancePath, (0, codegen_1$29._)`${names_1$4.default.valCxt}.${names_1$4.default.instancePath}`);
			gen.var(names_1$4.default.parentData, (0, codegen_1$29._)`${names_1$4.default.valCxt}.${names_1$4.default.parentData}`);
			gen.var(names_1$4.default.parentDataProperty, (0, codegen_1$29._)`${names_1$4.default.valCxt}.${names_1$4.default.parentDataProperty}`);
			gen.var(names_1$4.default.rootData, (0, codegen_1$29._)`${names_1$4.default.valCxt}.${names_1$4.default.rootData}`);
			if (opts.dynamicRef) gen.var(names_1$4.default.dynamicAnchors, (0, codegen_1$29._)`${names_1$4.default.valCxt}.${names_1$4.default.dynamicAnchors}`);
		}, () => {
			gen.var(names_1$4.default.instancePath, (0, codegen_1$29._)`""`);
			gen.var(names_1$4.default.parentData, (0, codegen_1$29._)`undefined`);
			gen.var(names_1$4.default.parentDataProperty, (0, codegen_1$29._)`undefined`);
			gen.var(names_1$4.default.rootData, names_1$4.default.data);
			if (opts.dynamicRef) gen.var(names_1$4.default.dynamicAnchors, (0, codegen_1$29._)`{}`);
		});
	}
	function topSchemaObjCode(it) {
		const { schema: schema$1, opts, gen } = it;
		validateFunction(it, () => {
			if (opts.$comment && schema$1.$comment) commentKeyword(it);
			checkNoDefault(it);
			gen.let(names_1$4.default.vErrors, null);
			gen.let(names_1$4.default.errors, 0);
			if (opts.unevaluated) resetEvaluated(it);
			typeAndKeywords(it);
			returnResults(it);
		});
		return;
	}
	function resetEvaluated(it) {
		const { gen, validateName } = it;
		it.evaluated = gen.const("evaluated", (0, codegen_1$29._)`${validateName}.evaluated`);
		gen.if((0, codegen_1$29._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1$29._)`${it.evaluated}.props`, (0, codegen_1$29._)`undefined`));
		gen.if((0, codegen_1$29._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1$29._)`${it.evaluated}.items`, (0, codegen_1$29._)`undefined`));
	}
	function funcSourceUrl(schema$1, opts) {
		const schId = typeof schema$1 == "object" && schema$1[opts.schemaId];
		return schId && (opts.code.source || opts.code.process) ? (0, codegen_1$29._)`/*# sourceURL=${schId} */` : codegen_1$29.nil;
	}
	function subschemaCode(it, valid) {
		if (isSchemaObj(it)) {
			checkKeywords(it);
			if (schemaCxtHasRules(it)) {
				subSchemaObjCode(it, valid);
				return;
			}
		}
		(0, boolSchema_1.boolOrEmptySchema)(it, valid);
	}
	function schemaCxtHasRules({ schema: schema$1, self }) {
		if (typeof schema$1 == "boolean") return !schema$1;
		for (const key in schema$1) if (self.RULES.all[key]) return true;
		return false;
	}
	function isSchemaObj(it) {
		return typeof it.schema != "boolean";
	}
	function subSchemaObjCode(it, valid) {
		const { schema: schema$1, gen, opts } = it;
		if (opts.$comment && schema$1.$comment) commentKeyword(it);
		updateContext(it);
		checkAsyncSchema(it);
		const errsCount = gen.const("_errs", names_1$4.default.errors);
		typeAndKeywords(it, errsCount);
		gen.var(valid, (0, codegen_1$29._)`${errsCount} === ${names_1$4.default.errors}`);
	}
	function checkKeywords(it) {
		(0, util_1$23.checkUnknownRules)(it);
		checkRefsAndKeywords(it);
	}
	function typeAndKeywords(it, errsCount) {
		if (it.opts.jtd) return schemaKeywords(it, [], false, errsCount);
		const types = (0, dataType_1$2.getSchemaTypes)(it.schema);
		const checkedTypes = (0, dataType_1$2.coerceAndCheckDataType)(it, types);
		schemaKeywords(it, types, !checkedTypes, errsCount);
	}
	function checkRefsAndKeywords(it) {
		const { schema: schema$1, errSchemaPath, opts, self } = it;
		if (schema$1.$ref && opts.ignoreKeywordsWithRef && (0, util_1$23.schemaHasRulesButRef)(schema$1, self.RULES)) self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
	}
	function checkNoDefault(it) {
		const { schema: schema$1, opts } = it;
		if (schema$1.default !== void 0 && opts.useDefaults && opts.strictSchema) (0, util_1$23.checkStrictMode)(it, "default is ignored in the schema root");
	}
	function updateContext(it) {
		const schId = it.schema[it.opts.schemaId];
		if (schId) it.baseId = (0, resolve_1$3.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
	}
	function checkAsyncSchema(it) {
		if (it.schema.$async && !it.schemaEnv.$async) throw new Error("async schema in sync schema");
	}
	function commentKeyword({ gen, schemaEnv, schema: schema$1, errSchemaPath, opts }) {
		const msg = schema$1.$comment;
		if (opts.$comment === true) gen.code((0, codegen_1$29._)`${names_1$4.default.self}.logger.log(${msg})`);
		else if (typeof opts.$comment == "function") {
			const schemaPath = (0, codegen_1$29.str)`${errSchemaPath}/$comment`;
			const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
			gen.code((0, codegen_1$29._)`${names_1$4.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
		}
	}
	function returnResults(it) {
		const { gen, schemaEnv, validateName, ValidationError: ValidationError$2, opts } = it;
		if (schemaEnv.$async) gen.if((0, codegen_1$29._)`${names_1$4.default.errors} === 0`, () => gen.return(names_1$4.default.data), () => gen.throw((0, codegen_1$29._)`new ${ValidationError$2}(${names_1$4.default.vErrors})`));
		else {
			gen.assign((0, codegen_1$29._)`${validateName}.errors`, names_1$4.default.vErrors);
			if (opts.unevaluated) assignEvaluated(it);
			gen.return((0, codegen_1$29._)`${names_1$4.default.errors} === 0`);
		}
	}
	function assignEvaluated({ gen, evaluated, props, items }) {
		if (props instanceof codegen_1$29.Name) gen.assign((0, codegen_1$29._)`${evaluated}.props`, props);
		if (items instanceof codegen_1$29.Name) gen.assign((0, codegen_1$29._)`${evaluated}.items`, items);
	}
	function schemaKeywords(it, types, typeErrors, errsCount) {
		const { gen, schema: schema$1, data, allErrors, opts, self } = it;
		const { RULES } = self;
		if (schema$1.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1$23.schemaHasRulesButRef)(schema$1, RULES))) {
			gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
			return;
		}
		if (!opts.jtd) checkStrictTypes(it, types);
		gen.block(() => {
			for (const group of RULES.rules) groupKeywords(group);
			groupKeywords(RULES.post);
		});
		function groupKeywords(group) {
			if (!(0, applicability_1.shouldUseGroup)(schema$1, group)) return;
			if (group.type) {
				gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
				iterateKeywords(it, group);
				if (types.length === 1 && types[0] === group.type && typeErrors) {
					gen.else();
					(0, dataType_2.reportTypeError)(it);
				}
				gen.endIf();
			} else iterateKeywords(it, group);
			if (!allErrors) gen.if((0, codegen_1$29._)`${names_1$4.default.errors} === ${errsCount || 0}`);
		}
	}
	function iterateKeywords(it, group) {
		const { gen, schema: schema$1, opts: { useDefaults } } = it;
		if (useDefaults) (0, defaults_1.assignDefaults)(it, group.type);
		gen.block(() => {
			for (const rule of group.rules) if ((0, applicability_1.shouldUseRule)(schema$1, rule)) keywordCode(it, rule.keyword, rule.definition, group.type);
		});
	}
	function checkStrictTypes(it, types) {
		if (it.schemaEnv.meta || !it.opts.strictTypes) return;
		checkContextTypes(it, types);
		if (!it.opts.allowUnionTypes) checkMultipleTypes(it, types);
		checkKeywordTypes(it, it.dataTypes);
	}
	function checkContextTypes(it, types) {
		if (!types.length) return;
		if (!it.dataTypes.length) {
			it.dataTypes = types;
			return;
		}
		types.forEach((t) => {
			if (!includesType(it.dataTypes, t)) strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
		});
		narrowSchemaTypes(it, types);
	}
	function checkMultipleTypes(it, ts) {
		if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) strictTypesError(it, "use allowUnionTypes to allow union type keyword");
	}
	function checkKeywordTypes(it, ts) {
		const rules = it.self.RULES.all;
		for (const keyword$1 in rules) {
			const rule = rules[keyword$1];
			if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
				const { type } = rule.definition;
				if (type.length && !type.some((t) => hasApplicableType(ts, t))) strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword$1}"`);
			}
		}
	}
	function hasApplicableType(schTs, kwdT) {
		return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
	}
	function includesType(ts, t) {
		return ts.includes(t) || t === "integer" && ts.includes("number");
	}
	function narrowSchemaTypes(it, withTypes) {
		const ts = [];
		for (const t of it.dataTypes) if (includesType(withTypes, t)) ts.push(t);
		else if (withTypes.includes("integer") && t === "number") ts.push("integer");
		it.dataTypes = ts;
	}
	function strictTypesError(it, msg) {
		const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
		msg += ` at "${schemaPath}" (strictTypes)`;
		(0, util_1$23.checkStrictMode)(it, msg, it.opts.strictTypes);
	}
	var KeywordCxt = class {
		constructor(it, def$69, keyword$1) {
			(0, keyword_1.validateKeywordUsage)(it, def$69, keyword$1);
			this.gen = it.gen;
			this.allErrors = it.allErrors;
			this.keyword = keyword$1;
			this.data = it.data;
			this.schema = it.schema[keyword$1];
			this.$data = def$69.$data && it.opts.$data && this.schema && this.schema.$data;
			this.schemaValue = (0, util_1$23.schemaRefOrVal)(it, this.schema, keyword$1, this.$data);
			this.schemaType = def$69.schemaType;
			this.parentSchema = it.schema;
			this.params = {};
			this.it = it;
			this.def = def$69;
			if (this.$data) this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
			else {
				this.schemaCode = this.schemaValue;
				if (!(0, keyword_1.validSchemaType)(this.schema, def$69.schemaType, def$69.allowUndefined)) throw new Error(`${keyword$1} value must be ${JSON.stringify(def$69.schemaType)}`);
			}
			if ("code" in def$69 ? def$69.trackErrors : def$69.errors !== false) this.errsCount = it.gen.const("_errs", names_1$4.default.errors);
		}
		result(condition, successAction, failAction) {
			this.failResult((0, codegen_1$29.not)(condition), successAction, failAction);
		}
		failResult(condition, successAction, failAction) {
			this.gen.if(condition);
			if (failAction) failAction();
			else this.error();
			if (successAction) {
				this.gen.else();
				successAction();
				if (this.allErrors) this.gen.endIf();
			} else if (this.allErrors) this.gen.endIf();
			else this.gen.else();
		}
		pass(condition, failAction) {
			this.failResult((0, codegen_1$29.not)(condition), void 0, failAction);
		}
		fail(condition) {
			if (condition === void 0) {
				this.error();
				if (!this.allErrors) this.gen.if(false);
				return;
			}
			this.gen.if(condition);
			this.error();
			if (this.allErrors) this.gen.endIf();
			else this.gen.else();
		}
		fail$data(condition) {
			if (!this.$data) return this.fail(condition);
			const { schemaCode } = this;
			this.fail((0, codegen_1$29._)`${schemaCode} !== undefined && (${(0, codegen_1$29.or)(this.invalid$data(), condition)})`);
		}
		error(append, errorParams, errorPaths) {
			if (errorParams) {
				this.setParams(errorParams);
				this._error(append, errorPaths);
				this.setParams({});
				return;
			}
			this._error(append, errorPaths);
		}
		_error(append, errorPaths) {
			(append ? errors_1$1.reportExtraError : errors_1$1.reportError)(this, this.def.error, errorPaths);
		}
		$dataError() {
			(0, errors_1$1.reportError)(this, this.def.$dataError || errors_1$1.keyword$DataError);
		}
		reset() {
			if (this.errsCount === void 0) throw new Error("add \"trackErrors\" to keyword definition");
			(0, errors_1$1.resetErrorsCount)(this.gen, this.errsCount);
		}
		ok(cond) {
			if (!this.allErrors) this.gen.if(cond);
		}
		setParams(obj, assign) {
			if (assign) Object.assign(this.params, obj);
			else this.params = obj;
		}
		block$data(valid, codeBlock, $dataValid = codegen_1$29.nil) {
			this.gen.block(() => {
				this.check$data(valid, $dataValid);
				codeBlock();
			});
		}
		check$data(valid = codegen_1$29.nil, $dataValid = codegen_1$29.nil) {
			if (!this.$data) return;
			const { gen, schemaCode, schemaType, def: def$69 } = this;
			gen.if((0, codegen_1$29.or)((0, codegen_1$29._)`${schemaCode} === undefined`, $dataValid));
			if (valid !== codegen_1$29.nil) gen.assign(valid, true);
			if (schemaType.length || def$69.validateSchema) {
				gen.elseIf(this.invalid$data());
				this.$dataError();
				if (valid !== codegen_1$29.nil) gen.assign(valid, false);
			}
			gen.else();
		}
		invalid$data() {
			const { gen, schemaCode, schemaType, def: def$69, it } = this;
			return (0, codegen_1$29.or)(wrong$DataType(), invalid$DataSchema());
			function wrong$DataType() {
				if (schemaType.length) {
					/* istanbul ignore if */
					if (!(schemaCode instanceof codegen_1$29.Name)) throw new Error("ajv implementation error");
					const st = Array.isArray(schemaType) ? schemaType : [schemaType];
					return (0, codegen_1$29._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
				}
				return codegen_1$29.nil;
			}
			function invalid$DataSchema() {
				if (def$69.validateSchema) {
					const validateSchemaRef = gen.scopeValue("validate$data", { ref: def$69.validateSchema });
					return (0, codegen_1$29._)`!${validateSchemaRef}(${schemaCode})`;
				}
				return codegen_1$29.nil;
			}
		}
		subschema(appl, valid) {
			const subschema = (0, subschema_1.getSubschema)(this.it, appl);
			(0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
			(0, subschema_1.extendSubschemaMode)(subschema, appl);
			const nextContext = {
				...this.it,
				...subschema,
				items: void 0,
				props: void 0
			};
			subschemaCode(nextContext, valid);
			return nextContext;
		}
		mergeEvaluated(schemaCxt, toName) {
			const { it, gen } = this;
			if (!it.opts.unevaluated) return;
			if (it.props !== true && schemaCxt.props !== void 0) it.props = util_1$23.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
			if (it.items !== true && schemaCxt.items !== void 0) it.items = util_1$23.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
		}
		mergeValidEvaluated(schemaCxt, valid) {
			const { it, gen } = this;
			if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
				gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1$29.Name));
				return true;
			}
		}
	};
	exports.KeywordCxt = KeywordCxt;
	function keywordCode(it, keyword$1, def$69, ruleType) {
		const cxt = new KeywordCxt(it, def$69, keyword$1);
		if ("code" in def$69) def$69.code(cxt, ruleType);
		else if (cxt.$data && def$69.validate) (0, keyword_1.funcKeywordCode)(cxt, def$69);
		else if ("macro" in def$69) (0, keyword_1.macroKeywordCode)(cxt, def$69);
		else if (def$69.compile || def$69.validate) (0, keyword_1.funcKeywordCode)(cxt, def$69);
	}
	const JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
	const RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
	function getData($data, { dataLevel, dataNames, dataPathArr }) {
		let jsonPointer;
		let data;
		if ($data === "") return names_1$4.default.rootData;
		if ($data[0] === "/") {
			if (!JSON_POINTER.test($data)) throw new Error(`Invalid JSON-pointer: ${$data}`);
			jsonPointer = $data;
			data = names_1$4.default.rootData;
		} else {
			const matches = RELATIVE_JSON_POINTER.exec($data);
			if (!matches) throw new Error(`Invalid JSON-pointer: ${$data}`);
			const up = +matches[1];
			jsonPointer = matches[2];
			if (jsonPointer === "#") {
				if (up >= dataLevel) throw new Error(errorMsg("property/index", up));
				return dataPathArr[dataLevel - up];
			}
			if (up > dataLevel) throw new Error(errorMsg("data", up));
			data = dataNames[dataLevel - up];
			if (!jsonPointer) return data;
		}
		let expr = data;
		const segments$1 = jsonPointer.split("/");
		for (const segment of segments$1) if (segment) {
			data = (0, codegen_1$29._)`${data}${(0, codegen_1$29.getProperty)((0, util_1$23.unescapeJsonPointer)(segment))}`;
			expr = (0, codegen_1$29._)`${expr} && ${data}`;
		}
		return expr;
		function errorMsg(pointerType, up) {
			return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
		}
	}
	exports.getData = getData;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/runtime/validation_error.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	var ValidationError = class extends Error {
		constructor(errors) {
			super("validation failed");
			this.errors = errors;
			this.ajv = this.validation = true;
		}
	};
	exports.default = ValidationError;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/ref_error.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const resolve_1$2 = require_resolve();
	var MissingRefError = class extends Error {
		constructor(resolver, baseId, ref, msg) {
			super(msg || `can't resolve reference ${ref} from id ${baseId}`);
			this.missingRef = (0, resolve_1$2.resolveUrl)(resolver, baseId, ref);
			this.missingSchema = (0, resolve_1$2.normalizeId)((0, resolve_1$2.getFullPath)(resolver, this.missingRef));
		}
	};
	exports.default = MissingRefError;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/compile/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
	const codegen_1$28 = require_codegen();
	const validation_error_1$2 = require_validation_error();
	const names_1$3 = require_names();
	const resolve_1$1 = require_resolve();
	const util_1$22 = require_util();
	const validate_1$4 = require_validate();
	var SchemaEnv = class {
		constructor(env) {
			var _a$4;
			this.refs = {};
			this.dynamicAnchors = {};
			let schema$1;
			if (typeof env.schema == "object") schema$1 = env.schema;
			this.schema = env.schema;
			this.schemaId = env.schemaId;
			this.root = env.root || this;
			this.baseId = (_a$4 = env.baseId) !== null && _a$4 !== void 0 ? _a$4 : (0, resolve_1$1.normalizeId)(schema$1 === null || schema$1 === void 0 ? void 0 : schema$1[env.schemaId || "$id"]);
			this.schemaPath = env.schemaPath;
			this.localRefs = env.localRefs;
			this.meta = env.meta;
			this.$async = schema$1 === null || schema$1 === void 0 ? void 0 : schema$1.$async;
			this.refs = {};
		}
	};
	exports.SchemaEnv = SchemaEnv;
	function compileSchema(sch) {
		const _sch = getCompilingSchema.call(this, sch);
		if (_sch) return _sch;
		const rootId = (0, resolve_1$1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
		const { es5, lines } = this.opts.code;
		const { ownProperties } = this.opts;
		const gen = new codegen_1$28.CodeGen(this.scope, {
			es5,
			lines,
			ownProperties
		});
		let _ValidationError;
		if (sch.$async) _ValidationError = gen.scopeValue("Error", {
			ref: validation_error_1$2.default,
			code: (0, codegen_1$28._)`require("ajv/dist/runtime/validation_error").default`
		});
		const validateName = gen.scopeName("validate");
		sch.validateName = validateName;
		const schemaCxt = {
			gen,
			allErrors: this.opts.allErrors,
			data: names_1$3.default.data,
			parentData: names_1$3.default.parentData,
			parentDataProperty: names_1$3.default.parentDataProperty,
			dataNames: [names_1$3.default.data],
			dataPathArr: [codegen_1$28.nil],
			dataLevel: 0,
			dataTypes: [],
			definedProperties: /* @__PURE__ */ new Set(),
			topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? {
				ref: sch.schema,
				code: (0, codegen_1$28.stringify)(sch.schema)
			} : { ref: sch.schema }),
			validateName,
			ValidationError: _ValidationError,
			schema: sch.schema,
			schemaEnv: sch,
			rootId,
			baseId: sch.baseId || rootId,
			schemaPath: codegen_1$28.nil,
			errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
			errorPath: (0, codegen_1$28._)`""`,
			opts: this.opts,
			self: this
		};
		let sourceCode;
		try {
			this._compilations.add(sch);
			(0, validate_1$4.validateFunctionCode)(schemaCxt);
			gen.optimize(this.opts.code.optimize);
			const validateCode = gen.toString();
			sourceCode = `${gen.scopeRefs(names_1$3.default.scope)}return ${validateCode}`;
			if (this.opts.code.process) sourceCode = this.opts.code.process(sourceCode, sch);
			const makeValidate = new Function(`${names_1$3.default.self}`, `${names_1$3.default.scope}`, sourceCode);
			const validate$1 = makeValidate(this, this.scope.get());
			this.scope.value(validateName, { ref: validate$1 });
			validate$1.errors = null;
			validate$1.schema = sch.schema;
			validate$1.schemaEnv = sch;
			if (sch.$async) validate$1.$async = true;
			if (this.opts.code.source === true) validate$1.source = {
				validateName,
				validateCode,
				scopeValues: gen._values
			};
			if (this.opts.unevaluated) {
				const { props, items } = schemaCxt;
				validate$1.evaluated = {
					props: props instanceof codegen_1$28.Name ? void 0 : props,
					items: items instanceof codegen_1$28.Name ? void 0 : items,
					dynamicProps: props instanceof codegen_1$28.Name,
					dynamicItems: items instanceof codegen_1$28.Name
				};
				if (validate$1.source) validate$1.source.evaluated = (0, codegen_1$28.stringify)(validate$1.evaluated);
			}
			sch.validate = validate$1;
			return sch;
		} catch (e) {
			delete sch.validate;
			delete sch.validateName;
			if (sourceCode) this.logger.error("Error compiling schema, function code:", sourceCode);
			throw e;
		} finally {
			this._compilations.delete(sch);
		}
	}
	exports.compileSchema = compileSchema;
	function resolveRef$2(root, baseId, ref) {
		var _a$4;
		ref = (0, resolve_1$1.resolveUrl)(this.opts.uriResolver, baseId, ref);
		const schOrFunc = root.refs[ref];
		if (schOrFunc) return schOrFunc;
		let _sch = resolve.call(this, root, ref);
		if (_sch === void 0) {
			const schema$1 = (_a$4 = root.localRefs) === null || _a$4 === void 0 ? void 0 : _a$4[ref];
			const { schemaId } = this.opts;
			if (schema$1) _sch = new SchemaEnv({
				schema: schema$1,
				schemaId,
				root,
				baseId
			});
		}
		if (_sch === void 0) return;
		return root.refs[ref] = inlineOrCompile.call(this, _sch);
	}
	exports.resolveRef = resolveRef$2;
	function inlineOrCompile(sch) {
		if ((0, resolve_1$1.inlineRef)(sch.schema, this.opts.inlineRefs)) return sch.schema;
		return sch.validate ? sch : compileSchema.call(this, sch);
	}
	function getCompilingSchema(schEnv) {
		for (const sch of this._compilations) if (sameSchemaEnv(sch, schEnv)) return sch;
	}
	exports.getCompilingSchema = getCompilingSchema;
	function sameSchemaEnv(s1, s2) {
		return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
	}
	function resolve(root, ref) {
		let sch;
		while (typeof (sch = this.refs[ref]) == "string") ref = sch;
		return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
	}
	function resolveSchema(root, ref) {
		const p = this.opts.uriResolver.parse(ref);
		const refPath = (0, resolve_1$1._getFullPath)(this.opts.uriResolver, p);
		let baseId = (0, resolve_1$1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
		if (Object.keys(root.schema).length > 0 && refPath === baseId) return getJsonPointer.call(this, p, root);
		const id = (0, resolve_1$1.normalizeId)(refPath);
		const schOrRef = this.refs[id] || this.schemas[id];
		if (typeof schOrRef == "string") {
			const sch = resolveSchema.call(this, root, schOrRef);
			if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object") return;
			return getJsonPointer.call(this, p, sch);
		}
		if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object") return;
		if (!schOrRef.validate) compileSchema.call(this, schOrRef);
		if (id === (0, resolve_1$1.normalizeId)(ref)) {
			const { schema: schema$1 } = schOrRef;
			const { schemaId } = this.opts;
			const schId = schema$1[schemaId];
			if (schId) baseId = (0, resolve_1$1.resolveUrl)(this.opts.uriResolver, baseId, schId);
			return new SchemaEnv({
				schema: schema$1,
				schemaId,
				root,
				baseId
			});
		}
		return getJsonPointer.call(this, p, schOrRef);
	}
	exports.resolveSchema = resolveSchema;
	const PREVENT_SCOPE_CHANGE = new Set([
		"properties",
		"patternProperties",
		"enum",
		"dependencies",
		"definitions"
	]);
	function getJsonPointer(parsedRef, { baseId, schema: schema$1, root }) {
		var _a$4;
		if (((_a$4 = parsedRef.fragment) === null || _a$4 === void 0 ? void 0 : _a$4[0]) !== "/") return;
		for (const part of parsedRef.fragment.slice(1).split("/")) {
			if (typeof schema$1 === "boolean") return;
			const partSchema = schema$1[(0, util_1$22.unescapeFragment)(part)];
			if (partSchema === void 0) return;
			schema$1 = partSchema;
			const schId = typeof schema$1 === "object" && schema$1[this.opts.schemaId];
			if (!PREVENT_SCOPE_CHANGE.has(part) && schId) baseId = (0, resolve_1$1.resolveUrl)(this.opts.uriResolver, baseId, schId);
		}
		let env;
		if (typeof schema$1 != "boolean" && schema$1.$ref && !(0, util_1$22.schemaHasRulesButRef)(schema$1, this.RULES)) {
			const $ref = (0, resolve_1$1.resolveUrl)(this.opts.uriResolver, baseId, schema$1.$ref);
			env = resolveSchema.call(this, root, $ref);
		}
		const { schemaId } = this.opts;
		env = env || new SchemaEnv({
			schema: schema$1,
			schemaId,
			root,
			baseId
		});
		if (env.schema !== env.root.schema) return env;
		return void 0;
	}
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/refs/data.json
var require_data = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/refs/data.json"(exports, module) {
	module.exports = {
		"$id": "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
		"description": "Meta-schema for $data reference (JSON AnySchema extension proposal)",
		"type": "object",
		"required": ["$data"],
		"properties": { "$data": {
			"type": "string",
			"anyOf": [{ "format": "relative-json-pointer" }, { "format": "json-pointer" }]
		} },
		"additionalProperties": false
	};
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/runtime/uri.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const uri = require_fast_uri();
	uri.code = "require(\"ajv/dist/runtime/uri\").default";
	exports.default = uri;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/core.js
var require_core$1 = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/core.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
	var validate_1$3 = require_validate();
	Object.defineProperty(exports, "KeywordCxt", {
		enumerable: true,
		get: function() {
			return validate_1$3.KeywordCxt;
		}
	});
	var codegen_1$27 = require_codegen();
	Object.defineProperty(exports, "_", {
		enumerable: true,
		get: function() {
			return codegen_1$27._;
		}
	});
	Object.defineProperty(exports, "str", {
		enumerable: true,
		get: function() {
			return codegen_1$27.str;
		}
	});
	Object.defineProperty(exports, "stringify", {
		enumerable: true,
		get: function() {
			return codegen_1$27.stringify;
		}
	});
	Object.defineProperty(exports, "nil", {
		enumerable: true,
		get: function() {
			return codegen_1$27.nil;
		}
	});
	Object.defineProperty(exports, "Name", {
		enumerable: true,
		get: function() {
			return codegen_1$27.Name;
		}
	});
	Object.defineProperty(exports, "CodeGen", {
		enumerable: true,
		get: function() {
			return codegen_1$27.CodeGen;
		}
	});
	const validation_error_1$1 = require_validation_error();
	const ref_error_1$3 = require_ref_error();
	const rules_1 = require_rules();
	const compile_1$2 = require_compile();
	const codegen_2 = require_codegen();
	const resolve_1 = require_resolve();
	const dataType_1$1 = require_dataType();
	const util_1$21 = require_util();
	const $dataRefSchema = require_data();
	const uri_1 = require_uri();
	const defaultRegExp = (str$2, flags) => new RegExp(str$2, flags);
	defaultRegExp.code = "new RegExp";
	const META_IGNORE_OPTIONS = [
		"removeAdditional",
		"useDefaults",
		"coerceTypes"
	];
	const EXT_SCOPE_NAMES = new Set([
		"validate",
		"serialize",
		"parse",
		"wrapper",
		"root",
		"schema",
		"keyword",
		"pattern",
		"formats",
		"validate$data",
		"func",
		"obj",
		"Error"
	]);
	const removedOptions = {
		errorDataPath: "",
		format: "`validateFormats: false` can be used instead.",
		nullable: "\"nullable\" keyword is supported by default.",
		jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
		extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
		missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
		processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
		sourceCode: "Use option `code: {source: true}`",
		strictDefaults: "It is default now, see option `strict`.",
		strictKeywords: "It is default now, see option `strict`.",
		uniqueItems: "\"uniqueItems\" keyword is always validated.",
		unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
		cache: "Map is used as cache, schema object as key.",
		serialize: "Map is used as cache, schema object as key.",
		ajvErrors: "It is default now."
	};
	const deprecatedOptions = {
		ignoreKeywordsWithRef: "",
		jsPropertySyntax: "",
		unicode: "\"minLength\"/\"maxLength\" account for unicode characters by default."
	};
	const MAX_EXPRESSION = 200;
	function requiredOptions(o) {
		var _a$4, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
		const s = o.strict;
		const _optz = (_a$4 = o.code) === null || _a$4 === void 0 ? void 0 : _a$4.optimize;
		const optimize$2 = _optz === true || _optz === void 0 ? 1 : _optz || 0;
		const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
		const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
		return {
			strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
			strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
			strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
			strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
			strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
			code: o.code ? {
				...o.code,
				optimize: optimize$2,
				regExp
			} : {
				optimize: optimize$2,
				regExp
			},
			loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
			loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
			meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
			messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
			inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
			schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
			addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
			validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
			validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
			unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
			int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
			uriResolver
		};
	}
	var Ajv$1 = class {
		constructor(opts = {}) {
			this.schemas = {};
			this.refs = {};
			this.formats = {};
			this._compilations = /* @__PURE__ */ new Set();
			this._loading = {};
			this._cache = /* @__PURE__ */ new Map();
			opts = this.opts = {
				...opts,
				...requiredOptions(opts)
			};
			const { es5, lines } = this.opts.code;
			this.scope = new codegen_2.ValueScope({
				scope: {},
				prefixes: EXT_SCOPE_NAMES,
				es5,
				lines
			});
			this.logger = getLogger(opts.logger);
			const formatOpt = opts.validateFormats;
			opts.validateFormats = false;
			this.RULES = (0, rules_1.getRules)();
			checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
			checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
			this._metaOpts = getMetaSchemaOptions.call(this);
			if (opts.formats) addInitialFormats.call(this);
			this._addVocabularies();
			this._addDefaultMetaSchema();
			if (opts.keywords) addInitialKeywords.call(this, opts.keywords);
			if (typeof opts.meta == "object") this.addMetaSchema(opts.meta);
			addInitialSchemas.call(this);
			opts.validateFormats = formatOpt;
		}
		_addVocabularies() {
			this.addKeyword("$async");
		}
		_addDefaultMetaSchema() {
			const { $data, meta, schemaId } = this.opts;
			let _dataRefSchema = $dataRefSchema;
			if (schemaId === "id") {
				_dataRefSchema = { ...$dataRefSchema };
				_dataRefSchema.id = _dataRefSchema.$id;
				delete _dataRefSchema.$id;
			}
			if (meta && $data) this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
		}
		defaultMeta() {
			const { meta, schemaId } = this.opts;
			return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
		}
		validate(schemaKeyRef, data) {
			let v;
			if (typeof schemaKeyRef == "string") {
				v = this.getSchema(schemaKeyRef);
				if (!v) throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
			} else v = this.compile(schemaKeyRef);
			const valid = v(data);
			if (!("$async" in v)) this.errors = v.errors;
			return valid;
		}
		compile(schema$1, _meta) {
			const sch = this._addSchema(schema$1, _meta);
			return sch.validate || this._compileSchemaEnv(sch);
		}
		compileAsync(schema$1, meta) {
			if (typeof this.opts.loadSchema != "function") throw new Error("options.loadSchema should be a function");
			const { loadSchema } = this.opts;
			return runCompileAsync.call(this, schema$1, meta);
			async function runCompileAsync(_schema, _meta) {
				await loadMetaSchema.call(this, _schema.$schema);
				const sch = this._addSchema(_schema, _meta);
				return sch.validate || _compileAsync.call(this, sch);
			}
			async function loadMetaSchema($ref) {
				if ($ref && !this.getSchema($ref)) await runCompileAsync.call(this, { $ref }, true);
			}
			async function _compileAsync(sch) {
				try {
					return this._compileSchemaEnv(sch);
				} catch (e) {
					if (!(e instanceof ref_error_1$3.default)) throw e;
					checkLoaded.call(this, e);
					await loadMissingSchema.call(this, e.missingSchema);
					return _compileAsync.call(this, sch);
				}
			}
			function checkLoaded({ missingSchema: ref, missingRef }) {
				if (this.refs[ref]) throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
			}
			async function loadMissingSchema(ref) {
				const _schema = await _loadSchema.call(this, ref);
				if (!this.refs[ref]) await loadMetaSchema.call(this, _schema.$schema);
				if (!this.refs[ref]) this.addSchema(_schema, ref, meta);
			}
			async function _loadSchema(ref) {
				const p = this._loading[ref];
				if (p) return p;
				try {
					return await (this._loading[ref] = loadSchema(ref));
				} finally {
					delete this._loading[ref];
				}
			}
		}
		addSchema(schema$1, key, _meta, _validateSchema = this.opts.validateSchema) {
			if (Array.isArray(schema$1)) {
				for (const sch of schema$1) this.addSchema(sch, void 0, _meta, _validateSchema);
				return this;
			}
			let id;
			if (typeof schema$1 === "object") {
				const { schemaId } = this.opts;
				id = schema$1[schemaId];
				if (id !== void 0 && typeof id != "string") throw new Error(`schema ${schemaId} must be string`);
			}
			key = (0, resolve_1.normalizeId)(key || id);
			this._checkUnique(key);
			this.schemas[key] = this._addSchema(schema$1, _meta, key, _validateSchema, true);
			return this;
		}
		addMetaSchema(schema$1, key, _validateSchema = this.opts.validateSchema) {
			this.addSchema(schema$1, key, true, _validateSchema);
			return this;
		}
		validateSchema(schema$1, throwOrLogError) {
			if (typeof schema$1 == "boolean") return true;
			let $schema$2;
			$schema$2 = schema$1.$schema;
			if ($schema$2 !== void 0 && typeof $schema$2 != "string") throw new Error("$schema must be a string");
			$schema$2 = $schema$2 || this.opts.defaultMeta || this.defaultMeta();
			if (!$schema$2) {
				this.logger.warn("meta-schema not available");
				this.errors = null;
				return true;
			}
			const valid = this.validate($schema$2, schema$1);
			if (!valid && throwOrLogError) {
				const message = "schema is invalid: " + this.errorsText();
				if (this.opts.validateSchema === "log") this.logger.error(message);
				else throw new Error(message);
			}
			return valid;
		}
		getSchema(keyRef) {
			let sch;
			while (typeof (sch = getSchEnv.call(this, keyRef)) == "string") keyRef = sch;
			if (sch === void 0) {
				const { schemaId } = this.opts;
				const root = new compile_1$2.SchemaEnv({
					schema: {},
					schemaId
				});
				sch = compile_1$2.resolveSchema.call(this, root, keyRef);
				if (!sch) return;
				this.refs[keyRef] = sch;
			}
			return sch.validate || this._compileSchemaEnv(sch);
		}
		removeSchema(schemaKeyRef) {
			if (schemaKeyRef instanceof RegExp) {
				this._removeAllSchemas(this.schemas, schemaKeyRef);
				this._removeAllSchemas(this.refs, schemaKeyRef);
				return this;
			}
			switch (typeof schemaKeyRef) {
				case "undefined":
					this._removeAllSchemas(this.schemas);
					this._removeAllSchemas(this.refs);
					this._cache.clear();
					return this;
				case "string": {
					const sch = getSchEnv.call(this, schemaKeyRef);
					if (typeof sch == "object") this._cache.delete(sch.schema);
					delete this.schemas[schemaKeyRef];
					delete this.refs[schemaKeyRef];
					return this;
				}
				case "object": {
					const cacheKey = schemaKeyRef;
					this._cache.delete(cacheKey);
					let id = schemaKeyRef[this.opts.schemaId];
					if (id) {
						id = (0, resolve_1.normalizeId)(id);
						delete this.schemas[id];
						delete this.refs[id];
					}
					return this;
				}
				default: throw new Error("ajv.removeSchema: invalid parameter");
			}
		}
		addVocabulary(definitions) {
			for (const def$69 of definitions) this.addKeyword(def$69);
			return this;
		}
		addKeyword(kwdOrDef, def$69) {
			let keyword$1;
			if (typeof kwdOrDef == "string") {
				keyword$1 = kwdOrDef;
				if (typeof def$69 == "object") {
					this.logger.warn("these parameters are deprecated, see docs for addKeyword");
					def$69.keyword = keyword$1;
				}
			} else if (typeof kwdOrDef == "object" && def$69 === void 0) {
				def$69 = kwdOrDef;
				keyword$1 = def$69.keyword;
				if (Array.isArray(keyword$1) && !keyword$1.length) throw new Error("addKeywords: keyword must be string or non-empty array");
			} else throw new Error("invalid addKeywords parameters");
			checkKeyword.call(this, keyword$1, def$69);
			if (!def$69) {
				(0, util_1$21.eachItem)(keyword$1, (kwd) => addRule.call(this, kwd));
				return this;
			}
			keywordMetaschema.call(this, def$69);
			const definition = {
				...def$69,
				type: (0, dataType_1$1.getJSONTypes)(def$69.type),
				schemaType: (0, dataType_1$1.getJSONTypes)(def$69.schemaType)
			};
			(0, util_1$21.eachItem)(keyword$1, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
			return this;
		}
		getKeyword(keyword$1) {
			const rule = this.RULES.all[keyword$1];
			return typeof rule == "object" ? rule.definition : !!rule;
		}
		removeKeyword(keyword$1) {
			const { RULES } = this;
			delete RULES.keywords[keyword$1];
			delete RULES.all[keyword$1];
			for (const group of RULES.rules) {
				const i = group.rules.findIndex((rule) => rule.keyword === keyword$1);
				if (i >= 0) group.rules.splice(i, 1);
			}
			return this;
		}
		addFormat(name, format$3) {
			if (typeof format$3 == "string") format$3 = new RegExp(format$3);
			this.formats[name] = format$3;
			return this;
		}
		errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
			if (!errors || errors.length === 0) return "No errors";
			return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
		}
		$dataMetaSchema(metaSchema$1, keywordsJsonPointers) {
			const rules = this.RULES.all;
			metaSchema$1 = JSON.parse(JSON.stringify(metaSchema$1));
			for (const jsonPointer of keywordsJsonPointers) {
				const segments$1 = jsonPointer.split("/").slice(1);
				let keywords = metaSchema$1;
				for (const seg of segments$1) keywords = keywords[seg];
				for (const key in rules) {
					const rule = rules[key];
					if (typeof rule != "object") continue;
					const { $data } = rule.definition;
					const schema$1 = keywords[key];
					if ($data && schema$1) keywords[key] = schemaOrData(schema$1);
				}
			}
			return metaSchema$1;
		}
		_removeAllSchemas(schemas, regex$1) {
			for (const keyRef in schemas) {
				const sch = schemas[keyRef];
				if (!regex$1 || regex$1.test(keyRef)) {
					if (typeof sch == "string") delete schemas[keyRef];
					else if (sch && !sch.meta) {
						this._cache.delete(sch.schema);
						delete schemas[keyRef];
					}
				}
			}
		}
		_addSchema(schema$1, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
			let id;
			const { schemaId } = this.opts;
			if (typeof schema$1 == "object") id = schema$1[schemaId];
			else if (this.opts.jtd) throw new Error("schema must be object");
			else if (typeof schema$1 != "boolean") throw new Error("schema must be object or boolean");
			let sch = this._cache.get(schema$1);
			if (sch !== void 0) return sch;
			baseId = (0, resolve_1.normalizeId)(id || baseId);
			const localRefs = resolve_1.getSchemaRefs.call(this, schema$1, baseId);
			sch = new compile_1$2.SchemaEnv({
				schema: schema$1,
				schemaId,
				meta,
				baseId,
				localRefs
			});
			this._cache.set(sch.schema, sch);
			if (addSchema && !baseId.startsWith("#")) {
				if (baseId) this._checkUnique(baseId);
				this.refs[baseId] = sch;
			}
			if (validateSchema) this.validateSchema(schema$1, true);
			return sch;
		}
		_checkUnique(id) {
			if (this.schemas[id] || this.refs[id]) throw new Error(`schema with key or id "${id}" already exists`);
		}
		_compileSchemaEnv(sch) {
			if (sch.meta) this._compileMetaSchema(sch);
			else compile_1$2.compileSchema.call(this, sch);
			/* istanbul ignore if */
			if (!sch.validate) throw new Error("ajv implementation error");
			return sch.validate;
		}
		_compileMetaSchema(sch) {
			const currentOpts = this.opts;
			this.opts = this._metaOpts;
			try {
				compile_1$2.compileSchema.call(this, sch);
			} finally {
				this.opts = currentOpts;
			}
		}
	};
	Ajv$1.ValidationError = validation_error_1$1.default;
	Ajv$1.MissingRefError = ref_error_1$3.default;
	exports.default = Ajv$1;
	function checkOptions(checkOpts, options, msg, log = "error") {
		for (const key in checkOpts) {
			const opt = key;
			if (opt in options) this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
		}
	}
	function getSchEnv(keyRef) {
		keyRef = (0, resolve_1.normalizeId)(keyRef);
		return this.schemas[keyRef] || this.refs[keyRef];
	}
	function addInitialSchemas() {
		const optsSchemas = this.opts.schemas;
		if (!optsSchemas) return;
		if (Array.isArray(optsSchemas)) this.addSchema(optsSchemas);
		else for (const key in optsSchemas) this.addSchema(optsSchemas[key], key);
	}
	function addInitialFormats() {
		for (const name in this.opts.formats) {
			const format$3 = this.opts.formats[name];
			if (format$3) this.addFormat(name, format$3);
		}
	}
	function addInitialKeywords(defs) {
		if (Array.isArray(defs)) {
			this.addVocabulary(defs);
			return;
		}
		this.logger.warn("keywords option as map is deprecated, pass array");
		for (const keyword$1 in defs) {
			const def$69 = defs[keyword$1];
			if (!def$69.keyword) def$69.keyword = keyword$1;
			this.addKeyword(def$69);
		}
	}
	function getMetaSchemaOptions() {
		const metaOpts = { ...this.opts };
		for (const opt of META_IGNORE_OPTIONS) delete metaOpts[opt];
		return metaOpts;
	}
	const noLogs = {
		log() {},
		warn() {},
		error() {}
	};
	function getLogger(logger) {
		if (logger === false) return noLogs;
		if (logger === void 0) return console;
		if (logger.log && logger.warn && logger.error) return logger;
		throw new Error("logger must implement log, warn and error methods");
	}
	const KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
	function checkKeyword(keyword$1, def$69) {
		const { RULES } = this;
		(0, util_1$21.eachItem)(keyword$1, (kwd) => {
			if (RULES.keywords[kwd]) throw new Error(`Keyword ${kwd} is already defined`);
			if (!KEYWORD_NAME.test(kwd)) throw new Error(`Keyword ${kwd} has invalid name`);
		});
		if (!def$69) return;
		if (def$69.$data && !("code" in def$69 || "validate" in def$69)) throw new Error("$data keyword must have \"code\" or \"validate\" function");
	}
	function addRule(keyword$1, definition, dataType) {
		var _a$4;
		const post = definition === null || definition === void 0 ? void 0 : definition.post;
		if (dataType && post) throw new Error("keyword with \"post\" flag cannot have \"type\"");
		const { RULES } = this;
		let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
		if (!ruleGroup) {
			ruleGroup = {
				type: dataType,
				rules: []
			};
			RULES.rules.push(ruleGroup);
		}
		RULES.keywords[keyword$1] = true;
		if (!definition) return;
		const rule = {
			keyword: keyword$1,
			definition: {
				...definition,
				type: (0, dataType_1$1.getJSONTypes)(definition.type),
				schemaType: (0, dataType_1$1.getJSONTypes)(definition.schemaType)
			}
		};
		if (definition.before) addBeforeRule.call(this, ruleGroup, rule, definition.before);
		else ruleGroup.rules.push(rule);
		RULES.all[keyword$1] = rule;
		(_a$4 = definition.implements) === null || _a$4 === void 0 || _a$4.forEach((kwd) => this.addKeyword(kwd));
	}
	function addBeforeRule(ruleGroup, rule, before) {
		const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
		if (i >= 0) ruleGroup.rules.splice(i, 0, rule);
		else {
			ruleGroup.rules.push(rule);
			this.logger.warn(`rule ${before} is not defined`);
		}
	}
	function keywordMetaschema(def$69) {
		let { metaSchema: metaSchema$1 } = def$69;
		if (metaSchema$1 === void 0) return;
		if (def$69.$data && this.opts.$data) metaSchema$1 = schemaOrData(metaSchema$1);
		def$69.validateSchema = this.compile(metaSchema$1, true);
	}
	const $dataRef = { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" };
	function schemaOrData(schema$1) {
		return { anyOf: [schema$1, $dataRef] };
	}
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/core/id.js
var require_id$1 = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/core/id.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const def$29 = {
		keyword: "id",
		code() {
			throw new Error("NOT SUPPORTED: keyword \"id\", use \"$id\" for schema ID");
		}
	};
	exports.default = def$29;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/core/ref.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.callRef = exports.getValidate = void 0;
	const ref_error_1$2 = require_ref_error();
	const code_1$10 = require_code();
	const codegen_1$26 = require_codegen();
	const names_1$2 = require_names();
	const compile_1$1 = require_compile();
	const util_1$20 = require_util();
	const def$28 = {
		keyword: "$ref",
		schemaType: "string",
		code(cxt) {
			const { gen, schema: $ref, it } = cxt;
			const { baseId, schemaEnv: env, validateName, opts, self } = it;
			const { root } = env;
			if (($ref === "#" || $ref === "#/") && baseId === root.baseId) return callRootRef();
			const schOrEnv = compile_1$1.resolveRef.call(self, root, baseId, $ref);
			if (schOrEnv === void 0) throw new ref_error_1$2.default(it.opts.uriResolver, baseId, $ref);
			if (schOrEnv instanceof compile_1$1.SchemaEnv) return callValidate(schOrEnv);
			return inlineRefSchema(schOrEnv);
			function callRootRef() {
				if (env === root) return callRef(cxt, validateName, env, env.$async);
				const rootName = gen.scopeValue("root", { ref: root });
				return callRef(cxt, (0, codegen_1$26._)`${rootName}.validate`, root, root.$async);
			}
			function callValidate(sch) {
				const v = getValidate(cxt, sch);
				callRef(cxt, v, sch, sch.$async);
			}
			function inlineRefSchema(sch) {
				const schName = gen.scopeValue("schema", opts.code.source === true ? {
					ref: sch,
					code: (0, codegen_1$26.stringify)(sch)
				} : { ref: sch });
				const valid = gen.name("valid");
				const schCxt = cxt.subschema({
					schema: sch,
					dataTypes: [],
					schemaPath: codegen_1$26.nil,
					topSchemaRef: schName,
					errSchemaPath: $ref
				}, valid);
				cxt.mergeEvaluated(schCxt);
				cxt.ok(valid);
			}
		}
	};
	function getValidate(cxt, sch) {
		const { gen } = cxt;
		return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1$26._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
	}
	exports.getValidate = getValidate;
	function callRef(cxt, v, sch, $async) {
		const { gen, it } = cxt;
		const { allErrors, schemaEnv: env, opts } = it;
		const passCxt = opts.passContext ? names_1$2.default.this : codegen_1$26.nil;
		if ($async) callAsyncRef();
		else callSyncRef();
		function callAsyncRef() {
			if (!env.$async) throw new Error("async schema referenced by sync schema");
			const valid = gen.let("valid");
			gen.try(() => {
				gen.code((0, codegen_1$26._)`await ${(0, code_1$10.callValidateCode)(cxt, v, passCxt)}`);
				addEvaluatedFrom(v);
				if (!allErrors) gen.assign(valid, true);
			}, (e) => {
				gen.if((0, codegen_1$26._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
				addErrorsFrom(e);
				if (!allErrors) gen.assign(valid, false);
			});
			cxt.ok(valid);
		}
		function callSyncRef() {
			cxt.result((0, code_1$10.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
		}
		function addErrorsFrom(source) {
			const errs = (0, codegen_1$26._)`${source}.errors`;
			gen.assign(names_1$2.default.vErrors, (0, codegen_1$26._)`${names_1$2.default.vErrors} === null ? ${errs} : ${names_1$2.default.vErrors}.concat(${errs})`);
			gen.assign(names_1$2.default.errors, (0, codegen_1$26._)`${names_1$2.default.vErrors}.length`);
		}
		function addEvaluatedFrom(source) {
			var _a$4;
			if (!it.opts.unevaluated) return;
			const schEvaluated = (_a$4 = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a$4 === void 0 ? void 0 : _a$4.evaluated;
			if (it.props !== true) if (schEvaluated && !schEvaluated.dynamicProps) {
				if (schEvaluated.props !== void 0) it.props = util_1$20.mergeEvaluated.props(gen, schEvaluated.props, it.props);
			} else {
				const props = gen.var("props", (0, codegen_1$26._)`${source}.evaluated.props`);
				it.props = util_1$20.mergeEvaluated.props(gen, props, it.props, codegen_1$26.Name);
			}
			if (it.items !== true) if (schEvaluated && !schEvaluated.dynamicItems) {
				if (schEvaluated.items !== void 0) it.items = util_1$20.mergeEvaluated.items(gen, schEvaluated.items, it.items);
			} else {
				const items = gen.var("items", (0, codegen_1$26._)`${source}.evaluated.items`);
				it.items = util_1$20.mergeEvaluated.items(gen, items, it.items, codegen_1$26.Name);
			}
		}
	}
	exports.callRef = callRef;
	exports.default = def$28;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/core/index.js
var require_core = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/core/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const id_1 = require_id$1();
	const ref_1 = require_ref();
	const core = [
		"$schema",
		"$id",
		"$defs",
		"$vocabulary",
		{ keyword: "$comment" },
		"definitions",
		id_1.default,
		ref_1.default
	];
	exports.default = core;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$25 = require_codegen();
	const ops$1 = codegen_1$25.operators;
	const KWDs$1 = {
		maximum: {
			okStr: "<=",
			ok: ops$1.LTE,
			fail: ops$1.GT
		},
		minimum: {
			okStr: ">=",
			ok: ops$1.GTE,
			fail: ops$1.LT
		},
		exclusiveMaximum: {
			okStr: "<",
			ok: ops$1.LT,
			fail: ops$1.GTE
		},
		exclusiveMinimum: {
			okStr: ">",
			ok: ops$1.GT,
			fail: ops$1.LTE
		}
	};
	const error$19 = {
		message: ({ keyword: keyword$1, schemaCode }) => (0, codegen_1$25.str)`must be ${KWDs$1[keyword$1].okStr} ${schemaCode}`,
		params: ({ keyword: keyword$1, schemaCode }) => (0, codegen_1$25._)`{comparison: ${KWDs$1[keyword$1].okStr}, limit: ${schemaCode}}`
	};
	const def$27 = {
		keyword: Object.keys(KWDs$1),
		type: "number",
		schemaType: "number",
		$data: true,
		error: error$19,
		code(cxt) {
			const { keyword: keyword$1, data, schemaCode } = cxt;
			cxt.fail$data((0, codegen_1$25._)`${data} ${KWDs$1[keyword$1].fail} ${schemaCode} || isNaN(${data})`);
		}
	};
	exports.default = def$27;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$24 = require_codegen();
	const error$18 = {
		message: ({ schemaCode }) => (0, codegen_1$24.str)`must be multiple of ${schemaCode}`,
		params: ({ schemaCode }) => (0, codegen_1$24._)`{multipleOf: ${schemaCode}}`
	};
	const def$26 = {
		keyword: "multipleOf",
		type: "number",
		schemaType: "number",
		$data: true,
		error: error$18,
		code(cxt) {
			const { gen, data, schemaCode, it } = cxt;
			const prec = it.opts.multipleOfPrecision;
			const res = gen.let("res");
			const invalid = prec ? (0, codegen_1$24._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1$24._)`${res} !== parseInt(${res})`;
			cxt.fail$data((0, codegen_1$24._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
		}
	};
	exports.default = def$26;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function ucs2length(str$2) {
		const len = str$2.length;
		let length = 0;
		let pos = 0;
		let value;
		while (pos < len) {
			length++;
			value = str$2.charCodeAt(pos++);
			if (value >= 55296 && value <= 56319 && pos < len) {
				value = str$2.charCodeAt(pos);
				if ((value & 64512) === 56320) pos++;
			}
		}
		return length;
	}
	exports.default = ucs2length;
	ucs2length.code = "require(\"ajv/dist/runtime/ucs2length\").default";
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$23 = require_codegen();
	const util_1$19 = require_util();
	const ucs2length_1 = require_ucs2length();
	const error$17 = {
		message({ keyword: keyword$1, schemaCode }) {
			const comp = keyword$1 === "maxLength" ? "more" : "fewer";
			return (0, codegen_1$23.str)`must NOT have ${comp} than ${schemaCode} characters`;
		},
		params: ({ schemaCode }) => (0, codegen_1$23._)`{limit: ${schemaCode}}`
	};
	const def$25 = {
		keyword: ["maxLength", "minLength"],
		type: "string",
		schemaType: "number",
		$data: true,
		error: error$17,
		code(cxt) {
			const { keyword: keyword$1, data, schemaCode, it } = cxt;
			const op = keyword$1 === "maxLength" ? codegen_1$23.operators.GT : codegen_1$23.operators.LT;
			const len = it.opts.unicode === false ? (0, codegen_1$23._)`${data}.length` : (0, codegen_1$23._)`${(0, util_1$19.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
			cxt.fail$data((0, codegen_1$23._)`${len} ${op} ${schemaCode}`);
		}
	};
	exports.default = def$25;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$9 = require_code();
	const codegen_1$22 = require_codegen();
	const error$16 = {
		message: ({ schemaCode }) => (0, codegen_1$22.str)`must match pattern "${schemaCode}"`,
		params: ({ schemaCode }) => (0, codegen_1$22._)`{pattern: ${schemaCode}}`
	};
	const def$24 = {
		keyword: "pattern",
		type: "string",
		schemaType: "string",
		$data: true,
		error: error$16,
		code(cxt) {
			const { data, $data, schema: schema$1, schemaCode, it } = cxt;
			const u = it.opts.unicodeRegExp ? "u" : "";
			const regExp = $data ? (0, codegen_1$22._)`(new RegExp(${schemaCode}, ${u}))` : (0, code_1$9.usePattern)(cxt, schema$1);
			cxt.fail$data((0, codegen_1$22._)`!${regExp}.test(${data})`);
		}
	};
	exports.default = def$24;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$21 = require_codegen();
	const error$15 = {
		message({ keyword: keyword$1, schemaCode }) {
			const comp = keyword$1 === "maxProperties" ? "more" : "fewer";
			return (0, codegen_1$21.str)`must NOT have ${comp} than ${schemaCode} properties`;
		},
		params: ({ schemaCode }) => (0, codegen_1$21._)`{limit: ${schemaCode}}`
	};
	const def$23 = {
		keyword: ["maxProperties", "minProperties"],
		type: "object",
		schemaType: "number",
		$data: true,
		error: error$15,
		code(cxt) {
			const { keyword: keyword$1, data, schemaCode } = cxt;
			const op = keyword$1 === "maxProperties" ? codegen_1$21.operators.GT : codegen_1$21.operators.LT;
			cxt.fail$data((0, codegen_1$21._)`Object.keys(${data}).length ${op} ${schemaCode}`);
		}
	};
	exports.default = def$23;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/required.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$8 = require_code();
	const codegen_1$20 = require_codegen();
	const util_1$18 = require_util();
	const error$14 = {
		message: ({ params: { missingProperty } }) => (0, codegen_1$20.str)`must have required property '${missingProperty}'`,
		params: ({ params: { missingProperty } }) => (0, codegen_1$20._)`{missingProperty: ${missingProperty}}`
	};
	const def$22 = {
		keyword: "required",
		type: "object",
		schemaType: "array",
		$data: true,
		error: error$14,
		code(cxt) {
			const { gen, schema: schema$1, schemaCode, data, $data, it } = cxt;
			const { opts } = it;
			if (!$data && schema$1.length === 0) return;
			const useLoop = schema$1.length >= opts.loopRequired;
			if (it.allErrors) allErrorsMode();
			else exitOnErrorMode();
			if (opts.strictRequired) {
				const props = cxt.parentSchema.properties;
				const { definedProperties } = cxt.it;
				for (const requiredKey of schema$1) if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
					const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
					const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
					(0, util_1$18.checkStrictMode)(it, msg, it.opts.strictRequired);
				}
			}
			function allErrorsMode() {
				if (useLoop || $data) cxt.block$data(codegen_1$20.nil, loopAllRequired);
				else for (const prop of schema$1) (0, code_1$8.checkReportMissingProp)(cxt, prop);
			}
			function exitOnErrorMode() {
				const missing = gen.let("missing");
				if (useLoop || $data) {
					const valid = gen.let("valid", true);
					cxt.block$data(valid, () => loopUntilMissing(missing, valid));
					cxt.ok(valid);
				} else {
					gen.if((0, code_1$8.checkMissingProp)(cxt, schema$1, missing));
					(0, code_1$8.reportMissingProp)(cxt, missing);
					gen.else();
				}
			}
			function loopAllRequired() {
				gen.forOf("prop", schemaCode, (prop) => {
					cxt.setParams({ missingProperty: prop });
					gen.if((0, code_1$8.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
				});
			}
			function loopUntilMissing(missing, valid) {
				cxt.setParams({ missingProperty: missing });
				gen.forOf(missing, schemaCode, () => {
					gen.assign(valid, (0, code_1$8.propertyInData)(gen, data, missing, opts.ownProperties));
					gen.if((0, codegen_1$20.not)(valid), () => {
						cxt.error();
						gen.break();
					});
				}, codegen_1$20.nil);
			}
		}
	};
	exports.default = def$22;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$19 = require_codegen();
	const error$13 = {
		message({ keyword: keyword$1, schemaCode }) {
			const comp = keyword$1 === "maxItems" ? "more" : "fewer";
			return (0, codegen_1$19.str)`must NOT have ${comp} than ${schemaCode} items`;
		},
		params: ({ schemaCode }) => (0, codegen_1$19._)`{limit: ${schemaCode}}`
	};
	const def$21 = {
		keyword: ["maxItems", "minItems"],
		type: "array",
		schemaType: "number",
		$data: true,
		error: error$13,
		code(cxt) {
			const { keyword: keyword$1, data, schemaCode } = cxt;
			const op = keyword$1 === "maxItems" ? codegen_1$19.operators.GT : codegen_1$19.operators.LT;
			cxt.fail$data((0, codegen_1$19._)`${data}.length ${op} ${schemaCode}`);
		}
	};
	exports.default = def$21;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/runtime/equal.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const equal = require_fast_deep_equal();
	equal.code = "require(\"ajv/dist/runtime/equal\").default";
	exports.default = equal;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const dataType_1 = require_dataType();
	const codegen_1$18 = require_codegen();
	const util_1$17 = require_util();
	const equal_1$2 = require_equal();
	const error$12 = {
		message: ({ params: { i, j } }) => (0, codegen_1$18.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
		params: ({ params: { i, j } }) => (0, codegen_1$18._)`{i: ${i}, j: ${j}}`
	};
	const def$20 = {
		keyword: "uniqueItems",
		type: "array",
		schemaType: "boolean",
		$data: true,
		error: error$12,
		code(cxt) {
			const { gen, data, $data, schema: schema$1, parentSchema, schemaCode, it } = cxt;
			if (!$data && !schema$1) return;
			const valid = gen.let("valid");
			const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
			cxt.block$data(valid, validateUniqueItems, (0, codegen_1$18._)`${schemaCode} === false`);
			cxt.ok(valid);
			function validateUniqueItems() {
				const i = gen.let("i", (0, codegen_1$18._)`${data}.length`);
				const j = gen.let("j");
				cxt.setParams({
					i,
					j
				});
				gen.assign(valid, true);
				gen.if((0, codegen_1$18._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
			}
			function canOptimize() {
				return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
			}
			function loopN(i, j) {
				const item = gen.name("item");
				const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
				const indices = gen.const("indices", (0, codegen_1$18._)`{}`);
				gen.for((0, codegen_1$18._)`;${i}--;`, () => {
					gen.let(item, (0, codegen_1$18._)`${data}[${i}]`);
					gen.if(wrongType, (0, codegen_1$18._)`continue`);
					if (itemTypes.length > 1) gen.if((0, codegen_1$18._)`typeof ${item} == "string"`, (0, codegen_1$18._)`${item} += "_"`);
					gen.if((0, codegen_1$18._)`typeof ${indices}[${item}] == "number"`, () => {
						gen.assign(j, (0, codegen_1$18._)`${indices}[${item}]`);
						cxt.error();
						gen.assign(valid, false).break();
					}).code((0, codegen_1$18._)`${indices}[${item}] = ${i}`);
				});
			}
			function loopN2(i, j) {
				const eql = (0, util_1$17.useFunc)(gen, equal_1$2.default);
				const outer = gen.name("outer");
				gen.label(outer).for((0, codegen_1$18._)`;${i}--;`, () => gen.for((0, codegen_1$18._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1$18._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
					cxt.error();
					gen.assign(valid, false).break(outer);
				})));
			}
		}
	};
	exports.default = def$20;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/const.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$17 = require_codegen();
	const util_1$16 = require_util();
	const equal_1$1 = require_equal();
	const error$11 = {
		message: "must be equal to constant",
		params: ({ schemaCode }) => (0, codegen_1$17._)`{allowedValue: ${schemaCode}}`
	};
	const def$19 = {
		keyword: "const",
		$data: true,
		error: error$11,
		code(cxt) {
			const { gen, data, $data, schemaCode, schema: schema$1 } = cxt;
			if ($data || schema$1 && typeof schema$1 == "object") cxt.fail$data((0, codegen_1$17._)`!${(0, util_1$16.useFunc)(gen, equal_1$1.default)}(${data}, ${schemaCode})`);
			else cxt.fail((0, codegen_1$17._)`${schema$1} !== ${data}`);
		}
	};
	exports.default = def$19;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/enum.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$16 = require_codegen();
	const util_1$15 = require_util();
	const equal_1 = require_equal();
	const error$10 = {
		message: "must be equal to one of the allowed values",
		params: ({ schemaCode }) => (0, codegen_1$16._)`{allowedValues: ${schemaCode}}`
	};
	const def$18 = {
		keyword: "enum",
		schemaType: "array",
		$data: true,
		error: error$10,
		code(cxt) {
			const { gen, data, $data, schema: schema$1, schemaCode, it } = cxt;
			if (!$data && schema$1.length === 0) throw new Error("enum must have non-empty array");
			const useLoop = schema$1.length >= it.opts.loopEnum;
			let eql;
			const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1$15.useFunc)(gen, equal_1.default);
			let valid;
			if (useLoop || $data) {
				valid = gen.let("valid");
				cxt.block$data(valid, loopEnum);
			} else {
				/* istanbul ignore if */
				if (!Array.isArray(schema$1)) throw new Error("ajv implementation error");
				const vSchema = gen.const("vSchema", schemaCode);
				valid = (0, codegen_1$16.or)(...schema$1.map((_x, i) => equalCode(vSchema, i)));
			}
			cxt.pass(valid);
			function loopEnum() {
				gen.assign(valid, false);
				gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1$16._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
			}
			function equalCode(vSchema, i) {
				const sch = schema$1[i];
				return typeof sch === "object" && sch !== null ? (0, codegen_1$16._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1$16._)`${data} === ${sch}`;
			}
		}
	};
	exports.default = def$18;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/validation/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const limitNumber_1 = require_limitNumber();
	const multipleOf_1 = require_multipleOf();
	const limitLength_1 = require_limitLength();
	const pattern_1 = require_pattern();
	const limitProperties_1 = require_limitProperties();
	const required_1 = require_required();
	const limitItems_1 = require_limitItems();
	const uniqueItems_1 = require_uniqueItems();
	const const_1 = require_const();
	const enum_1 = require_enum();
	const validation = [
		limitNumber_1.default,
		multipleOf_1.default,
		limitLength_1.default,
		pattern_1.default,
		limitProperties_1.default,
		required_1.default,
		limitItems_1.default,
		uniqueItems_1.default,
		{
			keyword: "type",
			schemaType: ["string", "array"]
		},
		{
			keyword: "nullable",
			schemaType: "boolean"
		},
		const_1.default,
		enum_1.default
	];
	exports.default = validation;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateAdditionalItems = void 0;
	const codegen_1$15 = require_codegen();
	const util_1$14 = require_util();
	const error$9 = {
		message: ({ params: { len } }) => (0, codegen_1$15.str)`must NOT have more than ${len} items`,
		params: ({ params: { len } }) => (0, codegen_1$15._)`{limit: ${len}}`
	};
	const def$17 = {
		keyword: "additionalItems",
		type: "array",
		schemaType: ["boolean", "object"],
		before: "uniqueItems",
		error: error$9,
		code(cxt) {
			const { parentSchema, it } = cxt;
			const { items } = parentSchema;
			if (!Array.isArray(items)) {
				(0, util_1$14.checkStrictMode)(it, "\"additionalItems\" is ignored when \"items\" is not an array of schemas");
				return;
			}
			validateAdditionalItems(cxt, items);
		}
	};
	function validateAdditionalItems(cxt, items) {
		const { gen, schema: schema$1, data, keyword: keyword$1, it } = cxt;
		it.items = true;
		const len = gen.const("len", (0, codegen_1$15._)`${data}.length`);
		if (schema$1 === false) {
			cxt.setParams({ len: items.length });
			cxt.pass((0, codegen_1$15._)`${len} <= ${items.length}`);
		} else if (typeof schema$1 == "object" && !(0, util_1$14.alwaysValidSchema)(it, schema$1)) {
			const valid = gen.var("valid", (0, codegen_1$15._)`${len} <= ${items.length}`);
			gen.if((0, codegen_1$15.not)(valid), () => validateItems(valid));
			cxt.ok(valid);
		}
		function validateItems(valid) {
			gen.forRange("i", items.length, len, (i) => {
				cxt.subschema({
					keyword: keyword$1,
					dataProp: i,
					dataPropType: util_1$14.Type.Num
				}, valid);
				if (!it.allErrors) gen.if((0, codegen_1$15.not)(valid), () => gen.break());
			});
		}
	}
	exports.validateAdditionalItems = validateAdditionalItems;
	exports.default = def$17;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/items.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateTuple = void 0;
	const codegen_1$14 = require_codegen();
	const util_1$13 = require_util();
	const code_1$7 = require_code();
	const def$16 = {
		keyword: "items",
		type: "array",
		schemaType: [
			"object",
			"array",
			"boolean"
		],
		before: "uniqueItems",
		code(cxt) {
			const { schema: schema$1, it } = cxt;
			if (Array.isArray(schema$1)) return validateTuple(cxt, "additionalItems", schema$1);
			it.items = true;
			if ((0, util_1$13.alwaysValidSchema)(it, schema$1)) return;
			cxt.ok((0, code_1$7.validateArray)(cxt));
		}
	};
	function validateTuple(cxt, extraItems, schArr = cxt.schema) {
		const { gen, parentSchema, data, keyword: keyword$1, it } = cxt;
		checkStrictTuple(parentSchema);
		if (it.opts.unevaluated && schArr.length && it.items !== true) it.items = util_1$13.mergeEvaluated.items(gen, schArr.length, it.items);
		const valid = gen.name("valid");
		const len = gen.const("len", (0, codegen_1$14._)`${data}.length`);
		schArr.forEach((sch, i) => {
			if ((0, util_1$13.alwaysValidSchema)(it, sch)) return;
			gen.if((0, codegen_1$14._)`${len} > ${i}`, () => cxt.subschema({
				keyword: keyword$1,
				schemaProp: i,
				dataProp: i
			}, valid));
			cxt.ok(valid);
		});
		function checkStrictTuple(sch) {
			const { opts, errSchemaPath } = it;
			const l = schArr.length;
			const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
			if (opts.strictTuples && !fullTuple) {
				const msg = `"${keyword$1}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
				(0, util_1$13.checkStrictMode)(it, msg, opts.strictTuples);
			}
		}
	}
	exports.validateTuple = validateTuple;
	exports.default = def$16;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const items_1$1 = require_items();
	const def$15 = {
		keyword: "prefixItems",
		type: "array",
		schemaType: ["array"],
		before: "uniqueItems",
		code: (cxt) => (0, items_1$1.validateTuple)(cxt, "items")
	};
	exports.default = def$15;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$13 = require_codegen();
	const util_1$12 = require_util();
	const code_1$6 = require_code();
	const additionalItems_1$1 = require_additionalItems();
	const error$8 = {
		message: ({ params: { len } }) => (0, codegen_1$13.str)`must NOT have more than ${len} items`,
		params: ({ params: { len } }) => (0, codegen_1$13._)`{limit: ${len}}`
	};
	const def$14 = {
		keyword: "items",
		type: "array",
		schemaType: ["object", "boolean"],
		before: "uniqueItems",
		error: error$8,
		code(cxt) {
			const { schema: schema$1, parentSchema, it } = cxt;
			const { prefixItems } = parentSchema;
			it.items = true;
			if ((0, util_1$12.alwaysValidSchema)(it, schema$1)) return;
			if (prefixItems) (0, additionalItems_1$1.validateAdditionalItems)(cxt, prefixItems);
			else cxt.ok((0, code_1$6.validateArray)(cxt));
		}
	};
	exports.default = def$14;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$12 = require_codegen();
	const util_1$11 = require_util();
	const error$7 = {
		message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$12.str)`must contain at least ${min} valid item(s)` : (0, codegen_1$12.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
		params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$12._)`{minContains: ${min}}` : (0, codegen_1$12._)`{minContains: ${min}, maxContains: ${max}}`
	};
	const def$13 = {
		keyword: "contains",
		type: "array",
		schemaType: ["object", "boolean"],
		before: "uniqueItems",
		trackErrors: true,
		error: error$7,
		code(cxt) {
			const { gen, schema: schema$1, parentSchema, data, it } = cxt;
			let min;
			let max;
			const { minContains, maxContains } = parentSchema;
			if (it.opts.next) {
				min = minContains === void 0 ? 1 : minContains;
				max = maxContains;
			} else min = 1;
			const len = gen.const("len", (0, codegen_1$12._)`${data}.length`);
			cxt.setParams({
				min,
				max
			});
			if (max === void 0 && min === 0) {
				(0, util_1$11.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
				return;
			}
			if (max !== void 0 && min > max) {
				(0, util_1$11.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
				cxt.fail();
				return;
			}
			if ((0, util_1$11.alwaysValidSchema)(it, schema$1)) {
				let cond = (0, codegen_1$12._)`${len} >= ${min}`;
				if (max !== void 0) cond = (0, codegen_1$12._)`${cond} && ${len} <= ${max}`;
				cxt.pass(cond);
				return;
			}
			it.items = true;
			const valid = gen.name("valid");
			if (max === void 0 && min === 1) validateItems(valid, () => gen.if(valid, () => gen.break()));
			else if (min === 0) {
				gen.let(valid, true);
				if (max !== void 0) gen.if((0, codegen_1$12._)`${data}.length > 0`, validateItemsWithCount);
			} else {
				gen.let(valid, false);
				validateItemsWithCount();
			}
			cxt.result(valid, () => cxt.reset());
			function validateItemsWithCount() {
				const schValid = gen.name("_valid");
				const count = gen.let("count", 0);
				validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
			}
			function validateItems(_valid, block) {
				gen.forRange("i", 0, len, (i) => {
					cxt.subschema({
						keyword: "contains",
						dataProp: i,
						dataPropType: util_1$11.Type.Num,
						compositeRule: true
					}, _valid);
					block();
				});
			}
			function checkLimits(count) {
				gen.code((0, codegen_1$12._)`${count}++`);
				if (max === void 0) gen.if((0, codegen_1$12._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
				else {
					gen.if((0, codegen_1$12._)`${count} > ${max}`, () => gen.assign(valid, false).break());
					if (min === 1) gen.assign(valid, true);
					else gen.if((0, codegen_1$12._)`${count} >= ${min}`, () => gen.assign(valid, true));
				}
			}
		}
	};
	exports.default = def$13;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
	const codegen_1$11 = require_codegen();
	const util_1$10 = require_util();
	const code_1$5 = require_code();
	exports.error = {
		message: ({ params: { property, depsCount, deps } }) => {
			const property_ies = depsCount === 1 ? "property" : "properties";
			return (0, codegen_1$11.str)`must have ${property_ies} ${deps} when property ${property} is present`;
		},
		params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1$11._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
	};
	const def$12 = {
		keyword: "dependencies",
		type: "object",
		schemaType: "object",
		error: exports.error,
		code(cxt) {
			const [propDeps, schDeps] = splitDependencies(cxt);
			validatePropertyDeps(cxt, propDeps);
			validateSchemaDeps(cxt, schDeps);
		}
	};
	function splitDependencies({ schema: schema$1 }) {
		const propertyDeps = {};
		const schemaDeps = {};
		for (const key in schema$1) {
			if (key === "__proto__") continue;
			const deps = Array.isArray(schema$1[key]) ? propertyDeps : schemaDeps;
			deps[key] = schema$1[key];
		}
		return [propertyDeps, schemaDeps];
	}
	function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
		const { gen, data, it } = cxt;
		if (Object.keys(propertyDeps).length === 0) return;
		const missing = gen.let("missing");
		for (const prop in propertyDeps) {
			const deps = propertyDeps[prop];
			if (deps.length === 0) continue;
			const hasProperty = (0, code_1$5.propertyInData)(gen, data, prop, it.opts.ownProperties);
			cxt.setParams({
				property: prop,
				depsCount: deps.length,
				deps: deps.join(", ")
			});
			if (it.allErrors) gen.if(hasProperty, () => {
				for (const depProp of deps) (0, code_1$5.checkReportMissingProp)(cxt, depProp);
			});
			else {
				gen.if((0, codegen_1$11._)`${hasProperty} && (${(0, code_1$5.checkMissingProp)(cxt, deps, missing)})`);
				(0, code_1$5.reportMissingProp)(cxt, missing);
				gen.else();
			}
		}
	}
	exports.validatePropertyDeps = validatePropertyDeps;
	function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
		const { gen, data, keyword: keyword$1, it } = cxt;
		const valid = gen.name("valid");
		for (const prop in schemaDeps) {
			if ((0, util_1$10.alwaysValidSchema)(it, schemaDeps[prop])) continue;
			gen.if((0, code_1$5.propertyInData)(gen, data, prop, it.opts.ownProperties), () => {
				const schCxt = cxt.subschema({
					keyword: keyword$1,
					schemaProp: prop
				}, valid);
				cxt.mergeValidEvaluated(schCxt, valid);
			}, () => gen.var(valid, true));
			cxt.ok(valid);
		}
	}
	exports.validateSchemaDeps = validateSchemaDeps;
	exports.default = def$12;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$10 = require_codegen();
	const util_1$9 = require_util();
	const error$6 = {
		message: "property name must be valid",
		params: ({ params }) => (0, codegen_1$10._)`{propertyName: ${params.propertyName}}`
	};
	const def$11 = {
		keyword: "propertyNames",
		type: "object",
		schemaType: ["object", "boolean"],
		error: error$6,
		code(cxt) {
			const { gen, schema: schema$1, data, it } = cxt;
			if ((0, util_1$9.alwaysValidSchema)(it, schema$1)) return;
			const valid = gen.name("valid");
			gen.forIn("key", data, (key) => {
				cxt.setParams({ propertyName: key });
				cxt.subschema({
					keyword: "propertyNames",
					data: key,
					dataTypes: ["string"],
					propertyName: key,
					compositeRule: true
				}, valid);
				gen.if((0, codegen_1$10.not)(valid), () => {
					cxt.error(true);
					if (!it.allErrors) gen.break();
				});
			});
			cxt.ok(valid);
		}
	};
	exports.default = def$11;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$4 = require_code();
	const codegen_1$9 = require_codegen();
	const names_1$1 = require_names();
	const util_1$8 = require_util();
	const error$5 = {
		message: "must NOT have additional properties",
		params: ({ params }) => (0, codegen_1$9._)`{additionalProperty: ${params.additionalProperty}}`
	};
	const def$10 = {
		keyword: "additionalProperties",
		type: ["object"],
		schemaType: ["boolean", "object"],
		allowUndefined: true,
		trackErrors: true,
		error: error$5,
		code(cxt) {
			const { gen, schema: schema$1, parentSchema, data, errsCount, it } = cxt;
			/* istanbul ignore if */
			if (!errsCount) throw new Error("ajv implementation error");
			const { allErrors, opts } = it;
			it.props = true;
			if (opts.removeAdditional !== "all" && (0, util_1$8.alwaysValidSchema)(it, schema$1)) return;
			const props = (0, code_1$4.allSchemaProperties)(parentSchema.properties);
			const patProps = (0, code_1$4.allSchemaProperties)(parentSchema.patternProperties);
			checkAdditionalProperties();
			cxt.ok((0, codegen_1$9._)`${errsCount} === ${names_1$1.default.errors}`);
			function checkAdditionalProperties() {
				gen.forIn("key", data, (key) => {
					if (!props.length && !patProps.length) additionalPropertyCode(key);
					else gen.if(isAdditional(key), () => additionalPropertyCode(key));
				});
			}
			function isAdditional(key) {
				let definedProp;
				if (props.length > 8) {
					const propsSchema = (0, util_1$8.schemaRefOrVal)(it, parentSchema.properties, "properties");
					definedProp = (0, code_1$4.isOwnProperty)(gen, propsSchema, key);
				} else if (props.length) definedProp = (0, codegen_1$9.or)(...props.map((p) => (0, codegen_1$9._)`${key} === ${p}`));
				else definedProp = codegen_1$9.nil;
				if (patProps.length) definedProp = (0, codegen_1$9.or)(definedProp, ...patProps.map((p) => (0, codegen_1$9._)`${(0, code_1$4.usePattern)(cxt, p)}.test(${key})`));
				return (0, codegen_1$9.not)(definedProp);
			}
			function deleteAdditional(key) {
				gen.code((0, codegen_1$9._)`delete ${data}[${key}]`);
			}
			function additionalPropertyCode(key) {
				if (opts.removeAdditional === "all" || opts.removeAdditional && schema$1 === false) {
					deleteAdditional(key);
					return;
				}
				if (schema$1 === false) {
					cxt.setParams({ additionalProperty: key });
					cxt.error();
					if (!allErrors) gen.break();
					return;
				}
				if (typeof schema$1 == "object" && !(0, util_1$8.alwaysValidSchema)(it, schema$1)) {
					const valid = gen.name("valid");
					if (opts.removeAdditional === "failing") {
						applyAdditionalSchema(key, valid, false);
						gen.if((0, codegen_1$9.not)(valid), () => {
							cxt.reset();
							deleteAdditional(key);
						});
					} else {
						applyAdditionalSchema(key, valid);
						if (!allErrors) gen.if((0, codegen_1$9.not)(valid), () => gen.break());
					}
				}
			}
			function applyAdditionalSchema(key, valid, errors) {
				const subschema = {
					keyword: "additionalProperties",
					dataProp: key,
					dataPropType: util_1$8.Type.Str
				};
				if (errors === false) Object.assign(subschema, {
					compositeRule: true,
					createErrors: false,
					allErrors: false
				});
				cxt.subschema(subschema, valid);
			}
		}
	};
	exports.default = def$10;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const validate_1$2 = require_validate();
	const code_1$3 = require_code();
	const util_1$7 = require_util();
	const additionalProperties_1$1 = require_additionalProperties();
	const def$9 = {
		keyword: "properties",
		type: "object",
		schemaType: "object",
		code(cxt) {
			const { gen, schema: schema$1, parentSchema, data, it } = cxt;
			if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) additionalProperties_1$1.default.code(new validate_1$2.KeywordCxt(it, additionalProperties_1$1.default, "additionalProperties"));
			const allProps = (0, code_1$3.allSchemaProperties)(schema$1);
			for (const prop of allProps) it.definedProperties.add(prop);
			if (it.opts.unevaluated && allProps.length && it.props !== true) it.props = util_1$7.mergeEvaluated.props(gen, (0, util_1$7.toHash)(allProps), it.props);
			const properties = allProps.filter((p) => !(0, util_1$7.alwaysValidSchema)(it, schema$1[p]));
			if (properties.length === 0) return;
			const valid = gen.name("valid");
			for (const prop of properties) {
				if (hasDefault(prop)) applyPropertySchema(prop);
				else {
					gen.if((0, code_1$3.propertyInData)(gen, data, prop, it.opts.ownProperties));
					applyPropertySchema(prop);
					if (!it.allErrors) gen.else().var(valid, true);
					gen.endIf();
				}
				cxt.it.definedProperties.add(prop);
				cxt.ok(valid);
			}
			function hasDefault(prop) {
				return it.opts.useDefaults && !it.compositeRule && schema$1[prop].default !== void 0;
			}
			function applyPropertySchema(prop) {
				cxt.subschema({
					keyword: "properties",
					schemaProp: prop,
					dataProp: prop
				}, valid);
			}
		}
	};
	exports.default = def$9;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$2 = require_code();
	const codegen_1$8 = require_codegen();
	const util_1$6 = require_util();
	const util_2 = require_util();
	const def$8 = {
		keyword: "patternProperties",
		type: "object",
		schemaType: "object",
		code(cxt) {
			const { gen, schema: schema$1, data, parentSchema, it } = cxt;
			const { opts } = it;
			const patterns = (0, code_1$2.allSchemaProperties)(schema$1);
			const alwaysValidPatterns = patterns.filter((p) => (0, util_1$6.alwaysValidSchema)(it, schema$1[p]));
			if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) return;
			const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
			const valid = gen.name("valid");
			if (it.props !== true && !(it.props instanceof codegen_1$8.Name)) it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
			const { props } = it;
			validatePatternProperties();
			function validatePatternProperties() {
				for (const pat of patterns) {
					if (checkProperties) checkMatchingProperties(pat);
					if (it.allErrors) validateProperties(pat);
					else {
						gen.var(valid, true);
						validateProperties(pat);
						gen.if(valid);
					}
				}
			}
			function checkMatchingProperties(pat) {
				for (const prop in checkProperties) if (new RegExp(pat).test(prop)) (0, util_1$6.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
			}
			function validateProperties(pat) {
				gen.forIn("key", data, (key) => {
					gen.if((0, codegen_1$8._)`${(0, code_1$2.usePattern)(cxt, pat)}.test(${key})`, () => {
						const alwaysValid = alwaysValidPatterns.includes(pat);
						if (!alwaysValid) cxt.subschema({
							keyword: "patternProperties",
							schemaProp: pat,
							dataProp: key,
							dataPropType: util_2.Type.Str
						}, valid);
						if (it.opts.unevaluated && props !== true) gen.assign((0, codegen_1$8._)`${props}[${key}]`, true);
						else if (!alwaysValid && !it.allErrors) gen.if((0, codegen_1$8.not)(valid), () => gen.break());
					});
				});
			}
		}
	};
	exports.default = def$8;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/not.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const util_1$5 = require_util();
	const def$7 = {
		keyword: "not",
		schemaType: ["object", "boolean"],
		trackErrors: true,
		code(cxt) {
			const { gen, schema: schema$1, it } = cxt;
			if ((0, util_1$5.alwaysValidSchema)(it, schema$1)) {
				cxt.fail();
				return;
			}
			const valid = gen.name("valid");
			cxt.subschema({
				keyword: "not",
				compositeRule: true,
				createErrors: false,
				allErrors: false
			}, valid);
			cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
		},
		error: { message: "must NOT be valid" }
	};
	exports.default = def$7;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const code_1$1 = require_code();
	const def$6 = {
		keyword: "anyOf",
		schemaType: "array",
		trackErrors: true,
		code: code_1$1.validateUnion,
		error: { message: "must match a schema in anyOf" }
	};
	exports.default = def$6;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$7 = require_codegen();
	const util_1$4 = require_util();
	const error$4 = {
		message: "must match exactly one schema in oneOf",
		params: ({ params }) => (0, codegen_1$7._)`{passingSchemas: ${params.passing}}`
	};
	const def$5 = {
		keyword: "oneOf",
		schemaType: "array",
		trackErrors: true,
		error: error$4,
		code(cxt) {
			const { gen, schema: schema$1, parentSchema, it } = cxt;
			/* istanbul ignore if */
			if (!Array.isArray(schema$1)) throw new Error("ajv implementation error");
			if (it.opts.discriminator && parentSchema.discriminator) return;
			const schArr = schema$1;
			const valid = gen.let("valid", false);
			const passing = gen.let("passing", null);
			const schValid = gen.name("_valid");
			cxt.setParams({ passing });
			gen.block(validateOneOf);
			cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
			function validateOneOf() {
				schArr.forEach((sch, i) => {
					let schCxt;
					if ((0, util_1$4.alwaysValidSchema)(it, sch)) gen.var(schValid, true);
					else schCxt = cxt.subschema({
						keyword: "oneOf",
						schemaProp: i,
						compositeRule: true
					}, schValid);
					if (i > 0) gen.if((0, codegen_1$7._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1$7._)`[${passing}, ${i}]`).else();
					gen.if(schValid, () => {
						gen.assign(valid, true);
						gen.assign(passing, i);
						if (schCxt) cxt.mergeEvaluated(schCxt, codegen_1$7.Name);
					});
				});
			}
		}
	};
	exports.default = def$5;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const util_1$3 = require_util();
	const def$4 = {
		keyword: "allOf",
		schemaType: "array",
		code(cxt) {
			const { gen, schema: schema$1, it } = cxt;
			/* istanbul ignore if */
			if (!Array.isArray(schema$1)) throw new Error("ajv implementation error");
			const valid = gen.name("valid");
			schema$1.forEach((sch, i) => {
				if ((0, util_1$3.alwaysValidSchema)(it, sch)) return;
				const schCxt = cxt.subschema({
					keyword: "allOf",
					schemaProp: i
				}, valid);
				cxt.ok(valid);
				cxt.mergeEvaluated(schCxt);
			});
		}
	};
	exports.default = def$4;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/if.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$6 = require_codegen();
	const util_1$2 = require_util();
	const error$3 = {
		message: ({ params }) => (0, codegen_1$6.str)`must match "${params.ifClause}" schema`,
		params: ({ params }) => (0, codegen_1$6._)`{failingKeyword: ${params.ifClause}}`
	};
	const def$3 = {
		keyword: "if",
		schemaType: ["object", "boolean"],
		trackErrors: true,
		error: error$3,
		code(cxt) {
			const { gen, parentSchema, it } = cxt;
			if (parentSchema.then === void 0 && parentSchema.else === void 0) (0, util_1$2.checkStrictMode)(it, "\"if\" without \"then\" and \"else\" is ignored");
			const hasThen = hasSchema(it, "then");
			const hasElse = hasSchema(it, "else");
			if (!hasThen && !hasElse) return;
			const valid = gen.let("valid", true);
			const schValid = gen.name("_valid");
			validateIf();
			cxt.reset();
			if (hasThen && hasElse) {
				const ifClause = gen.let("ifClause");
				cxt.setParams({ ifClause });
				gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
			} else if (hasThen) gen.if(schValid, validateClause("then"));
			else gen.if((0, codegen_1$6.not)(schValid), validateClause("else"));
			cxt.pass(valid, () => cxt.error(true));
			function validateIf() {
				const schCxt = cxt.subschema({
					keyword: "if",
					compositeRule: true,
					createErrors: false,
					allErrors: false
				}, schValid);
				cxt.mergeEvaluated(schCxt);
			}
			function validateClause(keyword$1, ifClause) {
				return () => {
					const schCxt = cxt.subschema({ keyword: keyword$1 }, schValid);
					gen.assign(valid, schValid);
					cxt.mergeValidEvaluated(schCxt, valid);
					if (ifClause) gen.assign(ifClause, (0, codegen_1$6._)`${keyword$1}`);
					else cxt.setParams({ ifClause: keyword$1 });
				};
			}
		}
	};
	function hasSchema(it, keyword$1) {
		const schema$1 = it.schema[keyword$1];
		return schema$1 !== void 0 && !(0, util_1$2.alwaysValidSchema)(it, schema$1);
	}
	exports.default = def$3;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const util_1$1 = require_util();
	const def$2 = {
		keyword: ["then", "else"],
		schemaType: ["object", "boolean"],
		code({ keyword: keyword$1, parentSchema, it }) {
			if (parentSchema.if === void 0) (0, util_1$1.checkStrictMode)(it, `"${keyword$1}" without "if" is ignored`);
		}
	};
	exports.default = def$2;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/applicator/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const additionalItems_1 = require_additionalItems();
	const prefixItems_1 = require_prefixItems();
	const items_1 = require_items();
	const items2020_1 = require_items2020();
	const contains_1 = require_contains();
	const dependencies_1 = require_dependencies();
	const propertyNames_1 = require_propertyNames();
	const additionalProperties_1 = require_additionalProperties();
	const properties_1 = require_properties();
	const patternProperties_1 = require_patternProperties();
	const not_1 = require_not();
	const anyOf_1 = require_anyOf();
	const oneOf_1 = require_oneOf();
	const allOf_1 = require_allOf();
	const if_1 = require_if();
	const thenElse_1 = require_thenElse();
	function getApplicator(draft2020 = false) {
		const applicator$1 = [
			not_1.default,
			anyOf_1.default,
			oneOf_1.default,
			allOf_1.default,
			if_1.default,
			thenElse_1.default,
			propertyNames_1.default,
			additionalProperties_1.default,
			dependencies_1.default,
			properties_1.default,
			patternProperties_1.default
		];
		if (draft2020) applicator$1.push(prefixItems_1.default, items2020_1.default);
		else applicator$1.push(additionalItems_1.default, items_1.default);
		applicator$1.push(contains_1.default);
		return applicator$1;
	}
	exports.default = getApplicator;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/format/format.js
var require_format$1 = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/format/format.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$5 = require_codegen();
	const error$2 = {
		message: ({ schemaCode }) => (0, codegen_1$5.str)`must match format "${schemaCode}"`,
		params: ({ schemaCode }) => (0, codegen_1$5._)`{format: ${schemaCode}}`
	};
	const def$1 = {
		keyword: "format",
		type: ["number", "string"],
		schemaType: "string",
		$data: true,
		error: error$2,
		code(cxt, ruleType) {
			const { gen, data, $data, schema: schema$1, schemaCode, it } = cxt;
			const { opts, errSchemaPath, schemaEnv, self } = it;
			if (!opts.validateFormats) return;
			if ($data) validate$DataFormat();
			else validateFormat();
			function validate$DataFormat() {
				const fmts = gen.scopeValue("formats", {
					ref: self.formats,
					code: opts.code.formats
				});
				const fDef = gen.const("fDef", (0, codegen_1$5._)`${fmts}[${schemaCode}]`);
				const fType = gen.let("fType");
				const format$3 = gen.let("format");
				gen.if((0, codegen_1$5._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1$5._)`${fDef}.type || "string"`).assign(format$3, (0, codegen_1$5._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1$5._)`"string"`).assign(format$3, fDef));
				cxt.fail$data((0, codegen_1$5.or)(unknownFmt(), invalidFmt()));
				function unknownFmt() {
					if (opts.strictSchema === false) return codegen_1$5.nil;
					return (0, codegen_1$5._)`${schemaCode} && !${format$3}`;
				}
				function invalidFmt() {
					const callFormat = schemaEnv.$async ? (0, codegen_1$5._)`(${fDef}.async ? await ${format$3}(${data}) : ${format$3}(${data}))` : (0, codegen_1$5._)`${format$3}(${data})`;
					const validData = (0, codegen_1$5._)`(typeof ${format$3} == "function" ? ${callFormat} : ${format$3}.test(${data}))`;
					return (0, codegen_1$5._)`${format$3} && ${format$3} !== true && ${fType} === ${ruleType} && !${validData}`;
				}
			}
			function validateFormat() {
				const formatDef = self.formats[schema$1];
				if (!formatDef) {
					unknownFormat();
					return;
				}
				if (formatDef === true) return;
				const [fmtType, format$3, fmtRef] = getFormat(formatDef);
				if (fmtType === ruleType) cxt.pass(validCondition());
				function unknownFormat() {
					if (opts.strictSchema === false) {
						self.logger.warn(unknownMsg());
						return;
					}
					throw new Error(unknownMsg());
					function unknownMsg() {
						return `unknown format "${schema$1}" ignored in schema at path "${errSchemaPath}"`;
					}
				}
				function getFormat(fmtDef$1) {
					const code = fmtDef$1 instanceof RegExp ? (0, codegen_1$5.regexpCode)(fmtDef$1) : opts.code.formats ? (0, codegen_1$5._)`${opts.code.formats}${(0, codegen_1$5.getProperty)(schema$1)}` : void 0;
					const fmt = gen.scopeValue("formats", {
						key: schema$1,
						ref: fmtDef$1,
						code
					});
					if (typeof fmtDef$1 == "object" && !(fmtDef$1 instanceof RegExp)) return [
						fmtDef$1.type || "string",
						fmtDef$1.validate,
						(0, codegen_1$5._)`${fmt}.validate`
					];
					return [
						"string",
						fmtDef$1,
						fmt
					];
				}
				function validCondition() {
					if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
						if (!schemaEnv.$async) throw new Error("async format in sync schema");
						return (0, codegen_1$5._)`await ${fmtRef}(${data})`;
					}
					return typeof format$3 == "function" ? (0, codegen_1$5._)`${fmtRef}(${data})` : (0, codegen_1$5._)`${fmtRef}.test(${data})`;
				}
			}
		}
	};
	exports.default = def$1;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/format/index.js
var require_format = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/format/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const format_1$1 = require_format$1();
	const format = [format_1$1.default];
	exports.default = format;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/metadata.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.contentVocabulary = exports.metadataVocabulary = void 0;
	exports.metadataVocabulary = [
		"title",
		"description",
		"default",
		"deprecated",
		"readOnly",
		"writeOnly",
		"examples"
	];
	exports.contentVocabulary = [
		"contentMediaType",
		"contentEncoding",
		"contentSchema"
	];
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/draft7.js
var require_draft7 = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/draft7.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const core_1$1 = require_core();
	const validation_1 = require_validation();
	const applicator_1 = require_applicator();
	const format_1 = require_format();
	const metadata_1 = require_metadata();
	const draft7Vocabularies = [
		core_1$1.default,
		validation_1.default,
		(0, applicator_1.default)(),
		format_1.default,
		metadata_1.metadataVocabulary,
		metadata_1.contentVocabulary
	];
	exports.default = draft7Vocabularies;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types$1 = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DiscrError = void 0;
	var DiscrError;
	(function(DiscrError$2) {
		DiscrError$2["Tag"] = "tag";
		DiscrError$2["Mapping"] = "mapping";
	})(DiscrError || (exports.DiscrError = DiscrError = {}));
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const codegen_1$4 = require_codegen();
	const types_1$11 = require_types$1();
	const compile_1 = require_compile();
	const ref_error_1$1 = require_ref_error();
	const util_1 = require_util();
	const error$1 = {
		message: ({ params: { discrError, tagName } }) => discrError === types_1$11.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
		params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1$4._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
	};
	const def = {
		keyword: "discriminator",
		type: "object",
		schemaType: "object",
		error: error$1,
		code(cxt) {
			const { gen, data, schema: schema$1, parentSchema, it } = cxt;
			const { oneOf } = parentSchema;
			if (!it.opts.discriminator) throw new Error("discriminator: requires discriminator option");
			const tagName = schema$1.propertyName;
			if (typeof tagName != "string") throw new Error("discriminator: requires propertyName");
			if (schema$1.mapping) throw new Error("discriminator: mapping is not supported");
			if (!oneOf) throw new Error("discriminator: requires oneOf keyword");
			const valid = gen.let("valid", false);
			const tag = gen.const("tag", (0, codegen_1$4._)`${data}${(0, codegen_1$4.getProperty)(tagName)}`);
			gen.if((0, codegen_1$4._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, {
				discrError: types_1$11.DiscrError.Tag,
				tag,
				tagName
			}));
			cxt.ok(valid);
			function validateMapping() {
				const mapping = getMapping();
				gen.if(false);
				for (const tagValue in mapping) {
					gen.elseIf((0, codegen_1$4._)`${tag} === ${tagValue}`);
					gen.assign(valid, applyTagSchema(mapping[tagValue]));
				}
				gen.else();
				cxt.error(false, {
					discrError: types_1$11.DiscrError.Mapping,
					tag,
					tagName
				});
				gen.endIf();
			}
			function applyTagSchema(schemaProp) {
				const _valid = gen.name("valid");
				const schCxt = cxt.subschema({
					keyword: "oneOf",
					schemaProp
				}, _valid);
				cxt.mergeEvaluated(schCxt, codegen_1$4.Name);
				return _valid;
			}
			function getMapping() {
				var _a$4;
				const oneOfMapping = {};
				const topRequired = hasRequired(parentSchema);
				let tagRequired = true;
				for (let i = 0; i < oneOf.length; i++) {
					let sch = oneOf[i];
					if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
						const ref = sch.$ref;
						sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
						if (sch instanceof compile_1.SchemaEnv) sch = sch.schema;
						if (sch === void 0) throw new ref_error_1$1.default(it.opts.uriResolver, it.baseId, ref);
					}
					const propSch = (_a$4 = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a$4 === void 0 ? void 0 : _a$4[tagName];
					if (typeof propSch != "object") throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
					tagRequired = tagRequired && (topRequired || hasRequired(sch));
					addMappings(propSch, i);
				}
				if (!tagRequired) throw new Error(`discriminator: "${tagName}" must be required`);
				return oneOfMapping;
				function hasRequired({ required }) {
					return Array.isArray(required) && required.includes(tagName);
				}
				function addMappings(sch, i) {
					if (sch.const) addMapping(sch.const, i);
					else if (sch.enum) for (const tagValue of sch.enum) addMapping(tagValue, i);
					else throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
				}
				function addMapping(tagValue, i) {
					if (typeof tagValue != "string" || tagValue in oneOfMapping) throw new Error(`discriminator: "${tagName}" values must be unique strings`);
					oneOfMapping[tagValue] = i;
				}
			}
		}
	};
	exports.default = def;
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/refs/json-schema-draft-07.json
var require_json_schema_draft_07 = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/refs/json-schema-draft-07.json"(exports, module) {
	module.exports = {
		"$schema": "http://json-schema.org/draft-07/schema#",
		"$id": "http://json-schema.org/draft-07/schema#",
		"title": "Core schema meta-schema",
		"definitions": {
			"schemaArray": {
				"type": "array",
				"minItems": 1,
				"items": { "$ref": "#" }
			},
			"nonNegativeInteger": {
				"type": "integer",
				"minimum": 0
			},
			"nonNegativeIntegerDefault0": { "allOf": [{ "$ref": "#/definitions/nonNegativeInteger" }, { "default": 0 }] },
			"simpleTypes": { "enum": [
				"array",
				"boolean",
				"integer",
				"null",
				"number",
				"object",
				"string"
			] },
			"stringArray": {
				"type": "array",
				"items": { "type": "string" },
				"uniqueItems": true,
				"default": []
			}
		},
		"type": ["object", "boolean"],
		"properties": {
			"$id": {
				"type": "string",
				"format": "uri-reference"
			},
			"$schema": {
				"type": "string",
				"format": "uri"
			},
			"$ref": {
				"type": "string",
				"format": "uri-reference"
			},
			"$comment": { "type": "string" },
			"title": { "type": "string" },
			"description": { "type": "string" },
			"default": true,
			"readOnly": {
				"type": "boolean",
				"default": false
			},
			"examples": {
				"type": "array",
				"items": true
			},
			"multipleOf": {
				"type": "number",
				"exclusiveMinimum": 0
			},
			"maximum": { "type": "number" },
			"exclusiveMaximum": { "type": "number" },
			"minimum": { "type": "number" },
			"exclusiveMinimum": { "type": "number" },
			"maxLength": { "$ref": "#/definitions/nonNegativeInteger" },
			"minLength": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
			"pattern": {
				"type": "string",
				"format": "regex"
			},
			"additionalItems": { "$ref": "#" },
			"items": {
				"anyOf": [{ "$ref": "#" }, { "$ref": "#/definitions/schemaArray" }],
				"default": true
			},
			"maxItems": { "$ref": "#/definitions/nonNegativeInteger" },
			"minItems": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
			"uniqueItems": {
				"type": "boolean",
				"default": false
			},
			"contains": { "$ref": "#" },
			"maxProperties": { "$ref": "#/definitions/nonNegativeInteger" },
			"minProperties": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
			"required": { "$ref": "#/definitions/stringArray" },
			"additionalProperties": { "$ref": "#" },
			"definitions": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"default": {}
			},
			"properties": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"default": {}
			},
			"patternProperties": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"propertyNames": { "format": "regex" },
				"default": {}
			},
			"dependencies": {
				"type": "object",
				"additionalProperties": { "anyOf": [{ "$ref": "#" }, { "$ref": "#/definitions/stringArray" }] }
			},
			"propertyNames": { "$ref": "#" },
			"const": true,
			"enum": {
				"type": "array",
				"items": true,
				"minItems": 1,
				"uniqueItems": true
			},
			"type": { "anyOf": [{ "$ref": "#/definitions/simpleTypes" }, {
				"type": "array",
				"items": { "$ref": "#/definitions/simpleTypes" },
				"minItems": 1,
				"uniqueItems": true
			}] },
			"format": { "type": "string" },
			"contentMediaType": { "type": "string" },
			"contentEncoding": { "type": "string" },
			"if": { "$ref": "#" },
			"then": { "$ref": "#" },
			"else": { "$ref": "#" },
			"allOf": { "$ref": "#/definitions/schemaArray" },
			"anyOf": { "$ref": "#/definitions/schemaArray" },
			"oneOf": { "$ref": "#/definitions/schemaArray" },
			"not": { "$ref": "#" }
		},
		"default": true
	};
} });

//#endregion
//#region ../node_modules/ajv-formats/node_modules/ajv/dist/ajv.js
var require_ajv = __commonJS({ "../node_modules/ajv-formats/node_modules/ajv/dist/ajv.js"(exports, module) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = void 0;
	const core_1 = require_core$1();
	const draft7_1 = require_draft7();
	const discriminator_1 = require_discriminator();
	const draft7MetaSchema = require_json_schema_draft_07();
	const META_SUPPORT_DATA = ["/properties"];
	const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
	var Ajv = class extends core_1.default {
		_addVocabularies() {
			super._addVocabularies();
			draft7_1.default.forEach((v) => this.addVocabulary(v));
			if (this.opts.discriminator) this.addKeyword(discriminator_1.default);
		}
		_addDefaultMetaSchema() {
			super._addDefaultMetaSchema();
			if (!this.opts.meta) return;
			const metaSchema$1 = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
			this.addMetaSchema(metaSchema$1, META_SCHEMA_ID, false);
			this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
		}
		defaultMeta() {
			return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
		}
	};
	exports.Ajv = Ajv;
	module.exports = exports = Ajv;
	module.exports.Ajv = Ajv;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Ajv;
	var validate_1$1 = require_validate();
	Object.defineProperty(exports, "KeywordCxt", {
		enumerable: true,
		get: function() {
			return validate_1$1.KeywordCxt;
		}
	});
	var codegen_1$3 = require_codegen();
	Object.defineProperty(exports, "_", {
		enumerable: true,
		get: function() {
			return codegen_1$3._;
		}
	});
	Object.defineProperty(exports, "str", {
		enumerable: true,
		get: function() {
			return codegen_1$3.str;
		}
	});
	Object.defineProperty(exports, "stringify", {
		enumerable: true,
		get: function() {
			return codegen_1$3.stringify;
		}
	});
	Object.defineProperty(exports, "nil", {
		enumerable: true,
		get: function() {
			return codegen_1$3.nil;
		}
	});
	Object.defineProperty(exports, "Name", {
		enumerable: true,
		get: function() {
			return codegen_1$3.Name;
		}
	});
	Object.defineProperty(exports, "CodeGen", {
		enumerable: true,
		get: function() {
			return codegen_1$3.CodeGen;
		}
	});
	var validation_error_1 = require_validation_error();
	Object.defineProperty(exports, "ValidationError", {
		enumerable: true,
		get: function() {
			return validation_error_1.default;
		}
	});
	var ref_error_1 = require_ref_error();
	Object.defineProperty(exports, "MissingRefError", {
		enumerable: true,
		get: function() {
			return ref_error_1.default;
		}
	});
} });

//#endregion
//#region ../node_modules/ajv-formats/dist/limit.js
var require_limit = __commonJS({ "../node_modules/ajv-formats/dist/limit.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.formatLimitDefinition = void 0;
	const ajv_1$2 = require_ajv();
	const codegen_1$2 = require_codegen();
	const ops = codegen_1$2.operators;
	const KWDs = {
		formatMaximum: {
			okStr: "<=",
			ok: ops.LTE,
			fail: ops.GT
		},
		formatMinimum: {
			okStr: ">=",
			ok: ops.GTE,
			fail: ops.LT
		},
		formatExclusiveMaximum: {
			okStr: "<",
			ok: ops.LT,
			fail: ops.GTE
		},
		formatExclusiveMinimum: {
			okStr: ">",
			ok: ops.GT,
			fail: ops.LTE
		}
	};
	const error = {
		message: ({ keyword: keyword$1, schemaCode }) => (0, codegen_1$2.str)`should be ${KWDs[keyword$1].okStr} ${schemaCode}`,
		params: ({ keyword: keyword$1, schemaCode }) => (0, codegen_1$2._)`{comparison: ${KWDs[keyword$1].okStr}, limit: ${schemaCode}}`
	};
	exports.formatLimitDefinition = {
		keyword: Object.keys(KWDs),
		type: "string",
		schemaType: "string",
		$data: true,
		error,
		code(cxt) {
			const { gen, data, schemaCode, keyword: keyword$1, it } = cxt;
			const { opts, self } = it;
			if (!opts.validateFormats) return;
			const fCxt = new ajv_1$2.KeywordCxt(it, self.RULES.all.format.definition, "format");
			if (fCxt.$data) validate$DataFormat();
			else validateFormat();
			function validate$DataFormat() {
				const fmts = gen.scopeValue("formats", {
					ref: self.formats,
					code: opts.code.formats
				});
				const fmt = gen.const("fmt", (0, codegen_1$2._)`${fmts}[${fCxt.schemaCode}]`);
				cxt.fail$data((0, codegen_1$2.or)((0, codegen_1$2._)`typeof ${fmt} != "object"`, (0, codegen_1$2._)`${fmt} instanceof RegExp`, (0, codegen_1$2._)`typeof ${fmt}.compare != "function"`, compareCode(fmt)));
			}
			function validateFormat() {
				const format$3 = fCxt.schema;
				const fmtDef$1 = self.formats[format$3];
				if (!fmtDef$1 || fmtDef$1 === true) return;
				if (typeof fmtDef$1 != "object" || fmtDef$1 instanceof RegExp || typeof fmtDef$1.compare != "function") throw new Error(`"${keyword$1}": format "${format$3}" does not define "compare" function`);
				const fmt = gen.scopeValue("formats", {
					key: format$3,
					ref: fmtDef$1,
					code: opts.code.formats ? (0, codegen_1$2._)`${opts.code.formats}${(0, codegen_1$2.getProperty)(format$3)}` : void 0
				});
				cxt.fail$data(compareCode(fmt));
			}
			function compareCode(fmt) {
				return (0, codegen_1$2._)`${fmt}.compare(${data}, ${schemaCode}) ${KWDs[keyword$1].fail} 0`;
			}
		},
		dependencies: ["format"]
	};
	const formatLimitPlugin = (ajv) => {
		ajv.addKeyword(exports.formatLimitDefinition);
		return ajv;
	};
	exports.default = formatLimitPlugin;
} });

//#endregion
//#region ../node_modules/ajv-formats/dist/index.js
var require_dist$1 = __commonJS({ "../node_modules/ajv-formats/dist/index.js"(exports, module) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const formats_1 = require_formats();
	const limit_1 = require_limit();
	const codegen_1$1 = require_codegen();
	const fullName = new codegen_1$1.Name("fullFormats");
	const fastName = new codegen_1$1.Name("fastFormats");
	const formatsPlugin = (ajv, opts = { keywords: true }) => {
		if (Array.isArray(opts)) {
			addFormats(ajv, opts, formats_1.fullFormats, fullName);
			return ajv;
		}
		const [formats, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
		const list = opts.formats || formats_1.formatNames;
		addFormats(ajv, list, formats, exportName);
		if (opts.keywords) (0, limit_1.default)(ajv);
		return ajv;
	};
	formatsPlugin.get = (name, mode = "full") => {
		const formats = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
		const f = formats[name];
		if (!f) throw new Error(`Unknown format "${name}"`);
		return f;
	};
	function addFormats(ajv, list, fs, exportName) {
		var _a$4;
		var _b;
		(_a$4 = (_b = ajv.opts.code).formats) !== null && _a$4 !== void 0 || (_b.formats = (0, codegen_1$1._)`require("ajv-formats/dist/formats").${exportName}`);
		for (const f of list) ajv.addFormat(f, fs[f]);
	}
	module.exports = exports = formatsPlugin;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = formatsPlugin;
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/en/index.js
var require_en = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/en/index.js"(exports, module) {
	module.exports = function localize_en(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "additionalProperties":
					out = "must NOT have additional properties";
					break;
				case "anyOf":
					out = "must match a schema in \"anyOf\"";
					break;
				case "const":
					out = "must be equal to constant";
					break;
				case "contains":
					out = "must contain a valid item";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "must have propert";
					if (n == 1) out += "y";
					else out += "ies";
					out += " " + e.params.deps + " when property " + e.params.property + " is present";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "must pass \"" + e.keyword + "\" keyword validation";
					}
					break;
				case "enum":
					out = "must be equal to one of the allowed values";
					break;
				case "false schema":
					out = "boolean schema is false";
					break;
				case "format":
					out = "must match format \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "must be " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "must be " + cond;
					break;
				case "if":
					out = "must match \"" + e.params.failingKeyword + "\" schema";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "must be " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "must NOT be longer than " + n + " character";
					if (n != 1) out += "s";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "must NOT have more than " + n + " propert";
					if (n == 1) out += "y";
					else out += "ies";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "must be " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "must NOT have less than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "must NOT be shorter than " + n + " character";
					if (n != 1) out += "s";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "must NOT have less than " + n + " propert";
					if (n == 1) out += "y";
					else out += "ies";
					break;
				case "multipleOf":
					out = "must be a multiple of " + e.params.multipleOf;
					break;
				case "not":
					out = "must NOT be valid according to schema in \"not\"";
					break;
				case "oneOf":
					out = "must match exactly one schema in \"oneOf\"";
					break;
				case "pattern":
					out = "must match pattern \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "must have property matching pattern \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "property name is invalid";
					break;
				case "required":
					out = "must have required property " + e.params.missingProperty;
					break;
				case "type":
					out = "must be " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "must NOT have duplicate items (items ## " + e.params.j + " and " + e.params.i + " are identical)";
					break;
				default: out = "must pass \"" + e.keyword + "\" keyword validation";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/ar/index.js
var require_ar = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/ar/index.js"(exports, module) {
	module.exports = function localize_ar(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += " يجب أن لا يحوي أكثر من " + n + " عنصر";
					break;
				case "additionalProperties":
					out = "يجب أن لا يحوي خصائص إضافية";
					break;
				case "anyOf":
					out = "يجب أن يوافق أحد المخططات الموجودة في \"anyOf\"";
					break;
				case "const":
					out = "يجب أن يكون ثابتاً";
					break;
				case "contains":
					out = "يجب أن يحوي عنصرا صحيح";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += " يجب أن يحوي الخصائص " + e.params.deps + " عندما تكون الخاصية " + e.params.property + " موجودة";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "يجب أن تمرر كلمة التحقق المفتاحية \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "قيمة هذا الحقل يجب أن تكون مساوية لأحد القيم المعرفة مسبقاً";
					break;
				case "false schema":
					out = "المخطط المنطقي غير صحيح";
					break;
				case "format":
					out = "يجب أن يوافق الصيغة \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += " يجب أن يكون " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += " يجب أن يكون " + cond;
					break;
				case "if":
					out = "يجب أن توافق المخطط \"" + e.params.failingKeyword + "\"";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += " يجب أن يكون " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += " يجب أن لا يحوي أكثر من " + n + " عنصر";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += " يجب أن لا يحوي أكثر من " + n + " محرف";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += " يجب أن لا يحوي أكثر من " + n + " خصائص";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += " يجب أن يكون " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += " يجب أن لا يحوي أقل من " + n + " عنصر";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += " يجب أن لا يحوي أقل من " + n + " محرف";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += " يجب أن لا يحوي أقل من " + n + " خصائص";
					break;
				case "multipleOf":
					out = " يجب أن يحوي أكثر من " + e.params.multipleOf;
					break;
				case "not":
					out = "يجب أن يكون غير صحيح وفقاً للمخطط \"not\"";
					break;
				case "oneOf":
					out = "يجب أن يوافق مخطط واحد فقط موجود في \"oneOf\"";
					break;
				case "pattern":
					out = "يجب أن يوافق النمط \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "يجب أن يحوي خاصية توافق النمط \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "اسم الخاصية غير صالح";
					break;
				case "required":
					out = "هذا الحقل إلزامي";
					break;
				case "type":
					out = "قيمة هذا الحقل غير صالحة";
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "يجب أن لا يحوي عناصر مكررة (العنصر ## " + e.params.j + " و " + e.params.i + " متطابقة)";
					break;
				default: out = "يجب أن تمرر كلمة التحقق المفتاحية \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/ca/index.js
var require_ca = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/ca/index.js"(exports, module) {
	module.exports = function localize_ca(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "no ha de tenir més de " + n + " element";
					if (n != 1) out += "s";
					break;
				case "additionalProperties":
					out = "no ha de tenir propietats addicionals";
					break;
				case "anyOf":
					out = "ha de coincidir amb algun esquema definit a \"anyOf\"";
					break;
				case "const":
					out = "ha de ser igual a la constant";
					break;
				case "contains":
					out = "ha de contenir un ítem vàlid";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "ha de contenir la propietat";
					if (n != 1) out += "s";
					out += " " + e.params.deps + " quan la propietat " + e.params.property + " és present";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "ha de passar la validació de la clau \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "ha de ser igual a un dels valors predefinits";
					break;
				case "false schema":
					out = "l’esquema és fals";
					break;
				case "format":
					out = "ha de coincidir amb el format \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "ha de ser " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "ha de ser " + cond;
					break;
				case "if":
					out = "ha de correspondre’s amb l’esquema \"" + e.params.failingKeyword + "\"";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "ha de ser " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "no ha de tenir més de " + n + " ítem";
					if (n != 1) out += "s";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "no pot contenir més de " + n + " caràcter";
					if (n != 1) out += "s";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "no pot contenir més de " + n + " propietat";
					if (n != 1) out += "s";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "ha de ser " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "no ha de tenir menys de " + n + " ítem";
					if (n != 1) out += "s";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "no pot contenir menys de " + n + " caràcter";
					if (n != 1) out += "s";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "no pot contenir menys de " + n + " propietat";
					if (n != 1) out += "s";
					break;
				case "multipleOf":
					out = "ha de ser múltiple de " + e.params.multipleOf;
					break;
				case "not":
					out = "no ha de ser vàlid d’acord amb l’esquema definit a \"not\"";
					break;
				case "oneOf":
					out = "ha de coincidir només amb un esquema definit a \"oneOf\"";
					break;
				case "pattern":
					out = "ha de coincidir amb el patró \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "la propietat ha de coincidir amb el patró \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "la propietat no és vàlida";
					break;
				case "required":
					out = "ha de tenir la propietat requerida " + e.params.missingProperty;
					break;
				case "type":
					out = "ha de ser del tipus " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "no ha de tenir ítems duplicats (els ítems ## " + e.params.j + " i " + e.params.i + " són idèntics)";
					break;
				default: out = "ha de passar la validació de la clau \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/cs/index.js
var require_cs = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/cs/index.js"(exports, module) {
	module.exports = function localize_cs(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "nemůže mít víc, než " + n + " prv";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "ek";
					else out += "ků";
					break;
				case "additionalProperties":
					out = "nemůže mít další položky";
					break;
				case "anyOf":
					out = "musí vyhovět alespoň jednomu schématu v \"anyOf\"";
					break;
				case "const":
					out = "musí být roven konstantě";
					break;
				case "contains":
					out = "musí obsahovat prvek odpovídající schématu";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "musí mít polož";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "ek";
					else out += "ka";
					out += ": " + e.params.deps + ", pokud obsahuje " + e.params.property;
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "musí vyhovět \"" + e.keyword + "\" validaci";
					}
					break;
				case "enum":
					out = "musí být rovno jedné hodnotě z výčtu";
					break;
				case "false schema":
					out = "schéma je false";
					break;
				case "format":
					out = "musí být ve formátu \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "musí být " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "musí být " + cond;
					break;
				case "if":
					out = "musí vyhovět \"" + e.params.failingKeyword + "\" schématu";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "musí být " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "nesmí obsahovat víc než " + n + " prv";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "ek";
					else out += "ků";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "nesmí být delší než " + n + " zna";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "k";
					else out += "ků";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "nesmí mít víc než " + n + " polož";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "ek";
					else out += "ka";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "musí být " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "nesmí obsahovat méně než " + n + " prv";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "ek";
					else out += "ků";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "nesmí být kratší než " + n + " zna";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "k";
					else out += "ků";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "nesmí mít méně než " + n + " polož";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "ek";
					else out += "ka";
					break;
				case "multipleOf":
					out = "musí být násobkem " + e.params.multipleOf;
					break;
				case "not":
					out = "nesmí vyhovět schématu v \"not\"";
					break;
				case "oneOf":
					out = "musí vyhovět právě jednomu schématu v \"oneOf\"";
					break;
				case "pattern":
					out = "musí vyhovět regulárnímu výrazu \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "musí obsahovat položku vyhovující regulárnímu výrazu \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "název položky není platný";
					break;
				case "required":
					out = "musí obsahovat požadovanou položku " + e.params.missingProperty;
					break;
				case "type":
					out = "musí být " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "nesmí obsahovat duplicitní prvky (prvky ## " + e.params.j + " a " + e.params.i + " jsou identické)";
					break;
				default: out = "musí vyhovět \"" + e.keyword + "\" validaci";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/de/index.js
var require_de = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/de/index.js"(exports, module) {
	module.exports = function localize_de(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "darf nicht mehr als " + n + " Element";
					if (n != 1) out += "e";
					out += " enthalten";
					break;
				case "additionalProperties":
					out = "darf keine zusätzlichen Attribute haben";
					break;
				case "anyOf":
					out = "muss einem der Schemata in \"anyOf\" entsprechen";
					break;
				case "const":
					out = "muss gleich der Konstanten sein";
					break;
				case "contains":
					out = "muss ein valides Element enthalten";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "muss Attribut";
					if (n != 1) out += "e";
					out += " " + e.params.deps + " aufweisen, wenn Attribut " + e.params.property + " gesetzt ist";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "der Tag \"" + e.params.tag + "\" muss eine Zeichenkette sein";
							break;
						case "mapping":
							out = "der Wert vom Tag \"" + e.params.tag + "\" muss im oneOf enthalten sein";
							break;
						default: out = "muss die Validierung \"" + e.keyword + "\" bestehen";
					}
					break;
				case "enum":
					out = "muss einem der vorgegebenen Werte entsprechen";
					break;
				case "false schema":
					out = "boolesches Schema ist falsch";
					break;
				case "format":
					out = "muss diesem Format entsprechen: \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "muss " + cond + " sein";
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "muss " + cond + " sein";
					break;
				case "if":
					out = "muss dem Schema \"" + e.params.failingKeyword + "\" entsprechen";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "muss " + cond + " sein";
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "darf nicht mehr als " + n + " Element";
					if (n != 1) out += "e";
					out += " haben";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "darf nicht länger als " + n + " Zeichen sein";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "darf nicht mehr als " + n + " Attribut";
					if (n != 1) out += "e";
					out += " haben";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "muss " + cond + " sein";
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "darf nicht weniger als " + n + " Element";
					if (n != 1) out += "e";
					out += " haben";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "darf nicht kürzer als " + n + " Zeichen sein";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "darf nicht weniger als " + n + " Attribut";
					if (n != 1) out += "e";
					out += " haben";
					break;
				case "multipleOf":
					out = "muss ein Vielfaches von " + e.params.multipleOf + " sein";
					break;
				case "not":
					out = "muss dem in \"not\" angegebenen Schema widersprechen";
					break;
				case "oneOf":
					out = "muss genau einem der Schemata in \"oneOf\" entsprechen";
					break;
				case "pattern":
					out = "muss diesem Muster entsprechen: \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "muss ein Attribut nach folgendem Muster haben \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "Attributname ist ungültig";
					break;
				case "required":
					out = "muss das erforderliche Attribut " + e.params.missingProperty + " enthalten";
					break;
				case "type":
					out = "muss sein: " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "darf nicht mehr als " + n + " Element";
					if (n != 1) out += "e";
					out += " haben";
					break;
				case "unevaluatedProperties":
					out = "darf keine unausgewerteten Attribute haben";
					break;
				case "uniqueItems":
					out = "darf keine Duplikate enthalten (Elemente #" + e.params.j + " und #" + e.params.i + " sind gleich)";
					break;
				default: out = "muss die Validierung \"" + e.keyword + "\" bestehen";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/es/index.js
var require_es = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/es/index.js"(exports, module) {
	module.exports = function localize_es(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "no debe tener más de " + n + " elemento";
					if (n != 1) out += "s";
					break;
				case "additionalProperties":
					out = "no debe tener propiedades adicionales";
					break;
				case "anyOf":
					out = "debe coincidir con algún esquema en \"anyOf\"";
					break;
				case "const":
					out = "debe ser igual a la constante";
					break;
				case "contains":
					out = "debe contener un elemento válido";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "debe contener la";
					if (n != 1) out += "s";
					out += " propiedad";
					if (n != 1) out += "es";
					out += " " + e.params.deps + " cuando la propiedad " + e.params.property + " se encuentra presente";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "debe pasar la validación de palabra clave \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "deber ser igual a uno de los valores predefinidos";
					break;
				case "false schema":
					out = "el esquema és falso";
					break;
				case "format":
					out = "debe coincidir con el formato \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "debe ser " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "debe ser " + cond;
					break;
				case "if":
					out = "debe corresponderse con el esquema \"" + e.params.failingKeyword + "\"";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "debe ser " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "no debe contener más de " + n + " elemento";
					if (n != 1) out += "s";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "no debe contener más de " + n + " caracter";
					if (n != 1) out += "es";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "no debe contener más de " + n + " propiedad";
					if (n != 1) out += "es";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "debe ser " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "no debe contener menos de " + n + " elemento";
					if (n != 1) out += "s";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "no debe contener menos de " + n + " caracter";
					if (n != 1) out += "es";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "no debe contener menos de " + n + " propiedad";
					if (n != 1) out += "es";
					break;
				case "multipleOf":
					out = "debe ser múltiplo de " + e.params.multipleOf;
					break;
				case "not":
					out = "no debe ser válido según el esquema en \"not\"";
					break;
				case "oneOf":
					out = "debe coincidir con un solo esquema en \"oneOf\"";
					break;
				case "pattern":
					out = "debe coincidir con el patron \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "la propiedad debe coincidir con el patrón \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "la propiedad no és válida";
					break;
				case "required":
					out = "debe tener la propiedad requerida " + e.params.missingProperty;
					break;
				case "type":
					out = "debe ser " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "no debe contener elementos duplicados, (los elementos ## " + e.params.j + " y " + e.params.i + " son idénticos)";
					break;
				default: out = "debe pasar la validación de palabra clave \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/fi/index.js
var require_fi = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/fi/index.js"(exports, module) {
	module.exports = function localize_fi(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "saa sisältää enintään " + n;
					if (n == 1) out += ":n elementin";
					else out += " elementtiä";
					break;
				case "additionalProperties":
					out = "ei saa sisältää ylimääräisiä ominaisuuksia";
					break;
				case "anyOf":
					out = "täytyy vastata \"anyOf\" skeemaa";
					break;
				case "const":
					out = "täytyy olla yhtä kuin vakio";
					break;
				case "contains":
					out = "täytyy sisältää kelvollinen elementti";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "täytyy sisältää " + e.params.deps + " ominaisuu";
					if (n == 1) out += "s";
					else out += "det";
					out += " kun " + e.params.property + "-ominaisuus on läsnä";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tunniste \"" + e.params.tag + "\" täytyy olla merkkijono";
							break;
						case "mapping":
							out = "tunnisteen \"" + e.params.tag + "\" arvon muoto pitää olla oneOf";
							break;
						default: out = "täytyy läpäistä \"" + e.keyword + "\" avainsanatarkistus";
					}
					break;
				case "enum":
					out = "täytyy olla yhtä kuin jokin sallituista arvoista";
					break;
				case "false schema":
					out = "boolean skeema on väärä";
					break;
				case "format":
					out = "täytyy vastata muotoa \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "täytyy olla " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "täytyy olla " + cond;
					break;
				case "if":
					out = "täytyy vastata \"" + e.params.failingKeyword + "\" skeemaa";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "täytyy olla " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "tulee sisältää enintään " + n + " ";
					if (n == 1) out += "elementti";
					else out += "elementtiä";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "ei saa olla pidempi kuin " + n + " merkki";
					if (n != 1) out += "ä";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "tulee sisältää enintään " + n + " ";
					if (n == 1) out += "ominaisuus";
					else out += "ominaisuutta";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "täytyy olla " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "tulee sisältää vähintään " + n + " ";
					if (n == 1) out += "elementti";
					else out += "elementtiä";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "ei saa olla lyhyempi kuin " + n + " merkki";
					if (n != 1) out += "ä";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "tulee sisältää vähintään " + n + " ";
					if (n == 1) out += "ominaisuus";
					else out += "ominaisuutta";
					break;
				case "multipleOf":
					out = "täytyy olla moninkertainen: " + e.params.multipleOf;
					break;
				case "not":
					out = "ei saa olla hyväksytty skeeman \"not\" mukaan";
					break;
				case "oneOf":
					out = "täytyy vastata täsmälleen yhtä \"oneOf\" -kohdassa määriteltyä skeemaa";
					break;
				case "pattern":
					out = "täytyy vastata muotoa \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "täytyy sisältää ominaisuus joka vastaa kaavaa \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "ominaisuuden nimi on virheellinen";
					break;
				case "required":
					out = "täytyy sisältää vaadittu ominaisuus " + e.params.missingProperty;
					break;
				case "type":
					out = "";
					var t = e.params.type;
					out += "täytyy olla ";
					if (t == "number") out += "numero";
					else if (t == "integer") out += "kokonaisluku";
					else if (t == "string") out += "merkkijono";
					else if (t == "boolean") out += "boolean";
					else out += t;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "ei saa olla enemmän kuin " + n + " elementti";
					if (n != 1) out += "ä";
					break;
				case "unevaluatedProperties":
					out = "ei saa sisältää arvioimattomia ominaisuuksia";
					break;
				case "uniqueItems":
					out = "ei saa sisältää duplikaatteja (elementit ## " + e.params.j + " ja " + e.params.i + " ovat identtiset)";
					break;
				default: out = "täytyy läpäistä \"" + e.keyword + "\" avainsanatarkistus";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/fr/index.js
var require_fr = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/fr/index.js"(exports, module) {
	module.exports = function localize_fr(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "ne doit pas contenir plus de " + n + " élémént";
					if (n != 1) out += "s";
					break;
				case "additionalProperties":
					out = "ne doit pas contenir de propriétés additionnelles";
					break;
				case "anyOf":
					out = "doit correspondre à un schéma de \"anyOf\"";
					break;
				case "const":
					out = "doit être égal à la constante";
					break;
				case "contains":
					out = "doit contenir un élément valide";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "doit avoir la propriété " + e.params.deps + " quand la propriété " + e.params.property + " est présente";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "doit être valide selon le critère \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "doit être égal à une des valeurs prédéfinies";
					break;
				case "false schema":
					out = "le schema est \"false\"";
					break;
				case "format":
					out = "doit correspondre au format \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "doit être " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "doit être " + cond;
					break;
				case "if":
					out = "doit correspondre au schéma \"" + e.params.failingKeyword + "\"";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "doit être " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "ne doit pas contenir plus de " + n + " élément";
					if (n != 1) out += "s";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "ne doit pas dépasser " + n + " caractère";
					if (n != 1) out += "s";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "ne doit pas contenir plus de " + n + " propriété";
					if (n != 1) out += "s";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "doit être " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "ne doit pas contenir moins de " + n + " élément";
					if (n != 1) out += "s";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "ne doit pas faire moins de " + n + " caractère";
					if (n != 1) out += "s";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "ne doit pas contenir moins de " + n + " propriété";
					if (n != 1) out += "s";
					break;
				case "multipleOf":
					out = "doit être un multiple de " + e.params.multipleOf;
					break;
				case "not":
					out = "est invalide selon le schéma \"not\"";
					break;
				case "oneOf":
					out = "doit correspondre à exactement un schéma de \"oneOf\"";
					break;
				case "pattern":
					out = "doit correspondre au format \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "la propriété doit correspondre au format \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "le nom de propriété est invalide";
					break;
				case "required":
					out = "requiert la propriété " + e.params.missingProperty;
					break;
				case "type":
					out = "doit être de type " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "ne doit pas contenir de doublons (les éléments ## " + e.params.j + " et " + e.params.i + " sont identiques)";
					break;
				default: out = "doit être valide selon le critère \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/hu/index.js
var require_hu = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/hu/index.js"(exports, module) {
	module.exports = function localize_hu(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "nem lehet több, mint " + n + " eleme";
					break;
				case "additionalProperties":
					out = "nem lehetnek további elemei";
					break;
				case "anyOf":
					out = "meg kell feleljen legalább egy \"anyOf\" alaknak";
					break;
				case "const":
					out = "must be equal to constant";
					break;
				case "contains":
					out = "must contain a valid item";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "-nak kell legyen";
					if (n > 1) out += "ek";
					out += " a következő tulajdonsága";
					if (n != 1) out += "i";
					out += ": " + e.params.deps + ", ha van " + e.params.property + " tulajdonsága";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "must pass \"" + e.keyword + "\" keyword validation";
					}
					break;
				case "enum":
					out = "egyenlő kell legyen valamely előre meghatározott értékkel";
					break;
				case "false schema":
					out = "boolean schema is false";
					break;
				case "format":
					out = "meg kell feleljen a következő formátumnak: \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "must be " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "must be " + cond;
					break;
				case "if":
					out = "must match \"" + e.params.failingKeyword + "\" schema";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "kell legyen " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "nem lehet több, mint " + n + " eleme";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "nem lehet hosszabb, mint " + n + " szimbólum";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "nem lehet több, mint " + n + " tulajdonsága";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "kell legyen " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "nem lehet kevesebb, mint " + n + " eleme";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "nem lehet rövidebb, mint " + n + " szimbólum";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "nem lehet kevesebb, mint " + n + " tulajdonsága";
					break;
				case "multipleOf":
					out = "a többszöröse kell legyen a következő számnak: " + e.params.multipleOf;
					break;
				case "not":
					out = "nem lehet érvényes a \"not\" alaknak megfelelően";
					break;
				case "oneOf":
					out = "meg kell feleljen pontosan egy \"oneOf\" alaknak";
					break;
				case "pattern":
					out = "meg kell feleljen a következő mintának: \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "must have property matching pattern \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "property name is invalid";
					break;
				case "required":
					out = "kell legyen " + e.params.missingProperty + " tulajdonsága";
					break;
				case "type":
					out = "" + e.params.type + " kell legyen";
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "nem lehetnek azonos elemei (" + e.params.j + " és " + e.params.i + " elemek azonosak)";
					break;
				default: out = "must pass \"" + e.keyword + "\" keyword validation";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/id/index.js
var require_id = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/id/index.js"(exports, module) {
	module.exports = function localize_id(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += " tidak boleh memiliki lebih dari " + n + " item";
					break;
				case "additionalProperties":
					out = "tidak boleh memiliki properti tambahan";
					break;
				case "anyOf":
					out = "harus cocok dengan beberapa skema pada \"anyOf\"";
					break;
				case "const":
					out = "harus sama dengan konstan";
					break;
				case "contains":
					out = "harus berisi item yang valid";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += " harus memiliki properti " + e.params.deps + " ketika properti " + e.params.property + " hadir";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "harus lulus validasi kata kunci \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "harus sama dengan salah satu dari nilai yang telah ditentukan";
					break;
				case "false schema":
					out = "skema boolean salah";
					break;
				case "format":
					out = "harus cocok dengan format \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "harus " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "harus " + cond;
					break;
				case "if":
					out = "harus cocok dengan skema \"" + e.params.failingKeyword + "\"";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "harus " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += " tidak boleh memiliki lebih dari " + n + " item";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += " tidak boleh lebih dari " + n + " karakter";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += " tidak boleh memiliki lebih dari " + n + " properti";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "harus " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += " tidak boleh kurang dari " + n + " item";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += " tidak boleh lebih pendek dari " + n + " karakter";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += " tidak boleh kurang dari " + n + " properti";
					break;
				case "multipleOf":
					out = "harus merupakan kelipatan dari " + e.params.multipleOf;
					break;
				case "not":
					out = "tidak boleh valid sesuai dengan skema pada \"not\"";
					break;
				case "oneOf":
					out = "harus sama persis dengan satu skema pada \"oneOf\"";
					break;
				case "pattern":
					out = "harus cocok dengan pola \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "harus memiliki pola pencocokan properti \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "nama properti tidak valid";
					break;
				case "required":
					out = "harus memiliki properti " + e.params.missingProperty;
					break;
				case "type":
					out = "harus berupa " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "tidak boleh memiliki item duplikat (item ## " + e.params.j + " dan " + e.params.i + " identik)";
					break;
				default: out = "harus lulus validasi kata kunci \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/it/index.js
var require_it = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/it/index.js"(exports, module) {
	module.exports = function localize_it(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "non dovrebbe avere più di " + n + " element";
					if (n == 1) out += "o";
					else out += "i";
					break;
				case "additionalProperties":
					out = "non deve avere attributi aggiuntivi";
					break;
				case "anyOf":
					out = "deve corrispondere ad uno degli schema in \"anyOf\"";
					break;
				case "const":
					out = "deve essere uguale alla costante";
					break;
				case "contains":
					out = "deve contentere un elemento valido";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "dovrebbe avere ";
					if (n == 1) out += "l'";
					else out += "gli ";
					out += "attribut";
					if (n == 1) out += "o";
					else out += "i";
					out += " " + e.params.deps + " quando l'attributo " + e.params.property + " è presente";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "il tag \"" + e.params.tag + "\" deve essere di tipo stringa";
							break;
						case "mapping":
							out = "il valore del tag \"" + e.params.tag + "\" deve essere nei oneOf";
							break;
						default: out = "deve essere valido secondo il criterio \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "deve essere uguale ad uno dei valori consentiti";
					break;
				case "false schema":
					out = "lo schema booleano è falso";
					break;
				case "format":
					out = "deve corrispondere al formato \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "deve essere " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "deve essere " + cond;
					break;
				case "if":
					out = "deve corrispondere allo schema \"" + e.params.failingKeyword + "\"";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "deve essere " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "non deve avere più di " + n + " element";
					if (n == 1) out += "o";
					else out += "i";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "non deve essere più lungo di " + n + " caratter";
					if (n == 1) out += "e";
					else out += "i";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "non deve avere più di " + n + " attribut";
					if (n == 1) out += "o";
					else out += "i";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "deve essere " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "non deve avere meno di " + n + " element";
					if (n == 1) out += "o";
					else out += "i";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "non deve essere meno lungo di " + n + " caratter";
					if (n == 1) out += "e";
					else out += "i";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "non deve avere meno di " + n + " attribut";
					if (n == 1) out += "o";
					else out += "i";
					break;
				case "multipleOf":
					out = "deve essere un multiplo di " + e.params.multipleOf;
					break;
				case "not":
					out = "non deve essere valido in base allo schema di \"non\"";
					break;
				case "oneOf":
					out = "deve corrispondere esattamente ad uno degli schema in \"oneOf\"";
					break;
				case "pattern":
					out = "deve corrispondere al formato \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "deve avere un attributo che corrisponda al formato \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "il nome dell'attritbuto non è valido";
					break;
				case "required":
					out = "deve avere l'attributo obbligatorio " + e.params.missingProperty;
					break;
				case "type":
					out = "deve essere di tipo " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "non deve avere più di " + n + " elementi";
					if (n == 1) out += "o";
					else out += "i";
					break;
				case "unevaluatedProperties":
					out = "non deve avere attributi non valutati";
					break;
				case "uniqueItems":
					out = "non deve avere duplicati (gli elementi ## " + e.params.j + " e " + e.params.i + " sono uguali)";
					break;
				default: out = "deve essere valido secondo il criterio \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/ja/index.js
var require_ja = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/ja/index.js"(exports, module) {
	module.exports = function localize_ja(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "は" + n + "以上あってはいけない";
					break;
				case "additionalProperties":
					out = "追加してはいけない";
					break;
				case "anyOf":
					out = "\"anyOf\"のスキーマとマッチしなくてはいけない";
					break;
				case "const":
					out = "must be equal to constant";
					break;
				case "contains":
					out = "must contain a valid item";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "" + e.params.property + "がある場合、";
					var n = e.params.depsCount;
					out += "は" + e.params.deps + "をつけなければいけない";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "must pass \"" + e.keyword + "\" keyword validation";
					}
					break;
				case "enum":
					out = "事前に定義された値のいずれかに等しくなければいけない";
					break;
				case "false schema":
					out = "boolean schema is false";
					break;
				case "format":
					out = "\"" + e.params.format + "\"形式に揃えなければいけない";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "must be " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "must be " + cond;
					break;
				case "if":
					out = "must match \"" + e.params.failingKeyword + "\" schema";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += cond + "でなければいけない";
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "は" + n + "個以上であってはいけない";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "は" + n + "文字以上であってはいけない";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "は" + n + "個以上のプロパティを有してはいけない";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += cond + "でなければいけない";
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "は" + n + "個以下であってはいけない";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "は" + n + "文字以下であってはいけない";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "は" + n + "個以下のプロパティを有してはいけない";
					break;
				case "multipleOf":
					out = "" + e.params.multipleOf + "の倍数でなければいけない";
					break;
				case "not":
					out = "\"not\"のスキーマに従って有効としてはいけない";
					break;
				case "oneOf":
					out = "\"oneOf\"のスキーマと完全に一致しなくてはいけない";
					break;
				case "pattern":
					out = "\"" + e.params.pattern + "\"のパターンと一致しなければいけない";
					break;
				case "patternRequired":
					out = "must have property matching pattern \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "property name is invalid";
					break;
				case "required":
					out = "必要なプロパティ" + e.params.missingProperty + "がなければいけない";
					break;
				case "type":
					out = "" + e.params.type + "でなければいけない";
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "重複するアイテムがあってはいけない（" + e.params.j + "と" + e.params.i + "は同じである）";
					break;
				default: out = "must pass \"" + e.keyword + "\" keyword validation";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/ko/index.js
var require_ko = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/ko/index.js"(exports, module) {
	module.exports = function localize_ko(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += " 항목은 아이템을 " + n + "개 이상 가질 수 없습니다";
					break;
				case "additionalProperties":
					out = "추가적인 속성은 허용되지 않습니다";
					break;
				case "anyOf":
					out = "\"anyOf\"의 스키마와 일치해야 합니다";
					break;
				case "const":
					out = "상수와 같아야합니다";
					break;
				case "contains":
					out = "올바른 아이템을 포함해야 합니다";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += e.params.property + "속성이 있는 경우, " + e.params.deps + " 속성이 있어야합니다";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "\"" + e.params.tag + "\"태그는 반드시 문자열이여야 합니다";
							break;
						case "mapping":
							out = "\"" + e.params.tag + "\"태그의 값은 반드시 oneOf에 있어야 합니다";
							break;
						default: out = "\"" + e.keyword + "\"키워드 검사를 통과해야 합니다";
					}
					break;
				case "enum":
					out = "미리 정의된 값중 하나여야 합니다";
					break;
				case "false schema":
					out = "boolean 스키마는 올바르지 않습니다";
					break;
				case "format":
					out = "\"" + e.params.format + "\" 포맷과 일치해야 합니다";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += " " + cond + " 이여야 합니다";
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += " " + cond + " 이여야 합니다";
					break;
				case "if":
					out = "\"" + e.params.failingKeyword + "\" 스키마와 일치해야 합니다";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += " " + cond + " 이여야 합니다";
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "아이템이 최대 " + n + "개이여야 합니다";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "최대 " + n + "글자여야 합니다";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "속성은 최대 " + n + "개 이내여야 합니다";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += " " + cond + " 이여야 합니다";
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "아이템이 최소 " + n + "개이여야 합니다";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "최소 " + n + "글자여야 합니다";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "속성은 최소 " + n + "개 이상이여야 합니다";
					break;
				case "multipleOf":
					out = "" + e.params.multipleOf + "의 배수여야 합니다";
					break;
				case "not":
					out = "\"not\"스키마에 따라 유효하지 않아야 합니다";
					break;
				case "oneOf":
					out = "\"oneOf\" 스키마중 하나와 정확하게 일치해야 합니다";
					break;
				case "pattern":
					out = "\"" + e.params.pattern + "\"패턴과 일치해야 합니다";
					break;
				case "patternRequired":
					out = "\"" + e.params.missingPattern + "\"패턴과 일치하는 속성을 가져야 합니다";
					break;
				case "propertyNames":
					out = "속성명이 올바르지 않습니다";
					break;
				case "required":
					out = "" + e.params.missingProperty + " 속성은 필수입니다";
					break;
				case "type":
					out = "" + e.params.type + "이여야 합니다";
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "항목이 " + n + "개 아이템을 초과하면 안됩니다";
					break;
				case "unevaluatedProperties":
					out = "평가되지 않은 속성이 없어야합니다.";
					break;
				case "uniqueItems":
					out = "중복 아이템이 없어야 합니다 (아이템" + e.params.j + "과 아이템" + e.params.i + "가 동일합니다)";
					break;
				default: out = "\"" + e.keyword + "\"키워드 검사를 통과해야 합니다";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/nb/index.js
var require_nb = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/nb/index.js"(exports, module) {
	module.exports = function localize_nb(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "kan ikke ha mer enn " + n + " element";
					if (n != 1) out += "er";
					break;
				case "additionalProperties":
					out = "kan ikke ha flere egenskaper";
					break;
				case "anyOf":
					out = "må samsvare med et schema i \"anyOf\"";
					break;
				case "const":
					out = "må være lik konstanten";
					break;
				case "contains":
					out = "må inneholde et gyldig element";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "må ha egenskapen";
					if (n != 1) out += "e";
					out += " " + e.params.deps + " når egenskapen " + e.params.property + " er angitt";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "må samsvare med valideringen for " + e.keyword;
					}
					break;
				case "enum":
					out = "må være lik en av de forhåndsdefinerte verdiene";
					break;
				case "false schema":
					out = "boolsk schema er usannt";
					break;
				case "format":
					out = "må stemme overens med formatet \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "må være " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "må være " + cond;
					break;
				case "if":
					out = "must match \"" + e.params.failingKeyword + "\" schema";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "må være " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "kan ikke ha fler enn " + n + " element";
					if (n != 1) out += "er";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "kan ikke være lengre enn " + n + " tegn";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "kan ikke ha mer enn " + n + " egenskap";
					if (n != 1) out += "er";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "må være " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "kan ikke ha færre enn " + n + " element";
					if (n != 1) out += "er";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "kan ikke være kortere enn " + n + " tegn";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "kan ikke ha mindre enn " + n + " egenskap";
					if (n != 1) out += "er";
					break;
				case "multipleOf":
					out = "må være et multiplum av " + e.params.multipleOf;
					break;
				case "not":
					out = "kan ikke samsvare med schema i \"not\"";
					break;
				case "oneOf":
					out = "må samsvare med nøyaktig ett schema i \"oneOf\"";
					break;
				case "pattern":
					out = "må samsvare med mønsteret \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "må ha en egenskap som samsvarer med mønsteret \"" + e.params.missingPattern;
					break;
				case "propertyNames":
					out = "egenskapen med navnet '";
					e.params.propertyNameout += "' er ugyldig";
					break;
				case "required":
					out = "må ha den påkrevde egenskapen " + e.params.missingProperty;
					break;
				case "type":
					out = "";
					var t = e.params.type;
					out += "må være ";
					if (t == "number") out += "et tall";
					else if (t == "integer") out += "et heltall";
					else if (t == "string") out += "en streng";
					else if (t == "boolean") out += "ja eller nei";
					else out += t;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "kan ikke ha duplikate elemeneter (elementene ## " + e.params.j + " og " + e.params.i + " er identiske)";
					break;
				default: out = "må samsvare med valideringen for " + e.keyword;
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/nl/index.js
var require_nl = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/nl/index.js"(exports, module) {
	module.exports = function localize_nl(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "mag niet meer dan " + n + " item";
					if (n != 1) out += "s";
					out += " bevatten";
					break;
				case "additionalProperties":
					out = "mag geen extra eigenschappen bevatten";
					break;
				case "anyOf":
					out = "moet overeenkomen met een schema in \"anyOf\"";
					break;
				case "const":
					out = "moet gelijk zijn aan constante";
					break;
				case "contains":
					out = "moet een geldig item bevatten";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "moet de eigenschap";
					if (n != 1) out += "pen";
					out += " " + e.params.deps + " bevatten als " + e.params.property + " is gedefinieerd";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" moet een tekenreeks zijn";
							break;
						case "mapping":
							out = "de waarde van het veld \"" + e.params.tag + "\" moet voorkomen in de oneOf";
							break;
						default: out = "moet sleutelwoord validatie \"" + e.keyword + "\" doorstaan";
					}
					break;
				case "enum":
					out = "moet overeenkomen met één van de voorgedefinieerde waarden";
					break;
				case "false schema":
					out = "boolean schema is fout";
					break;
				case "format":
					out = "moet overeenkomen met het volgende formaat: \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "moet " + cond + " zijn";
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "moet " + cond + " zijn";
					break;
				case "if":
					out = "moet overeenkomen met \"" + e.params.failingKeyword + "\" schema";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "moet " + cond + " zijn";
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "mag niet meer dan " + n + " item";
					if (n != 1) out += "s";
					out += " bevatten";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "mag niet langer dan " + n + " karakter";
					if (n != 1) out += "s";
					out += " zijn";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "mag niet meer dan " + n + " eigenschap";
					if (n != 1) out += "pen";
					out += " bevatten";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "moet " + cond + " zijn";
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "mag niet minder dan " + n + " item";
					if (n != 1) out += "s";
					out += " bevatten";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "mag niet korter dan " + n + " karakter";
					if (n != 1) out += "s";
					out += " zijn";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "mag niet minder dan " + n + " eigenschap";
					if (n != 1) out += "pen";
					out += " bevatten";
					break;
				case "multipleOf":
					out = "moet een veelvoud van " + e.params.multipleOf + " zijn";
					break;
				case "not":
					out = "mag niet overeenkomen met een schema in \"not\"";
					break;
				case "oneOf":
					out = "moet overeenkomen met één schema in \"oneOf\"";
					break;
				case "pattern":
					out = "moet overeenkomen met het volgende patroon: \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "moet een eigenschap bevatten die overeenkomt met het pattroon: \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "eigenschapnaam is ongeldig";
					break;
				case "required":
					out = "moet de eigenschap " + e.params.missingProperty + " bevatten";
					break;
				case "type":
					out = "";
					var t = e.params.type;
					out += "moet een ";
					if (t == "number") out += "nummer";
					else if (t == "integer") out += "geheel getal";
					else if (t == "string") out += "tekenreeks";
					else if (t == "boolean") out += "ja of nee waarde";
					out += " (" + t + ") bevatten";
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "mag niet meer dan " + n + " item";
					if (n != 1) out += "s";
					out += " bevatten";
					break;
				case "unevaluatedProperties":
					out = "mag geen ongecontroleerde eigenschappen bevatten";
					break;
				case "uniqueItems":
					out = "mag geen gedupliceerde items bevatten (items ## " + e.params.j + " en " + e.params.i + " zijn identiek)";
					break;
				default: out = "moet sleutelwoord validatie \"" + e.keyword + "\" doorstaan";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/pl/index.js
var require_pl = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/pl/index.js"(exports, module) {
	module.exports = function localize_pl(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "nie powinien mieć więcej niż " + n + " element";
					if (n == 1) out += "u";
					else out += "ów";
					break;
				case "additionalProperties":
					out = "nie powinien zawierać dodatkowych pól";
					break;
				case "anyOf":
					out = "powinien pasować do wzoru z sekcji \"anyOf\"";
					break;
				case "const":
					out = "powinien być równy stałej";
					break;
				case "contains":
					out = "must contain a valid item";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "powinien zawierać pol";
					if (n == 1) out += "e";
					else out += "a";
					out += " " + e.params.deps + " kiedy pole " + e.params.property + " jest obecne";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "powinien przejść walidację \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "powinien być równy jednej z predefiniowanych wartości";
					break;
				case "false schema":
					out = "boolean schema is false";
					break;
				case "format":
					out = "powinien zgadzać się z formatem \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "powinien być " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "powinien być " + cond;
					break;
				case "if":
					out = "must match \"" + e.params.failingKeyword + "\" schema";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "powinien być " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "nie powinien mieć więcej niż " + n + " element";
					if (n == 1) out += "u";
					else out += "ów";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "nie powinien być dłuższy niż " + n + " znak";
					if (n != 1) out += "ów";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "nie powinien zawierać więcej niż " + n + " ";
					if (n == 1) out += "pole";
					else out += "pól";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "powinien być " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "nie powinien mieć mniej niż " + n + " element";
					if (n == 1) out += "u";
					else out += "ów";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "nie powinien być krótszy niż " + n + " znak";
					if (n != 1) out += "ów";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "nie powinien zawierać mniej niż " + n + " ";
					if (n == 1) out += "pole";
					else out += "pól";
					break;
				case "multipleOf":
					out = "powinien być wielokrotnością " + e.params.multipleOf;
					break;
				case "not":
					out = "nie powinien pasować do wzoru z sekcji \"not\"";
					break;
				case "oneOf":
					out = "powinien pasować do jednego wzoru z sekcji \"oneOf\"";
					break;
				case "pattern":
					out = "powinien zgadzać się ze wzorem \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "powinien mieć pole pasujące do wzorca \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "property name is invalid";
					break;
				case "required":
					out = "powinien zawierać wymagane pole " + e.params.missingProperty;
					break;
				case "type":
					out = "powinien być " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "nie powinien zawierać elementów które się powtarzają (elementy " + e.params.j + " i " + e.params.i + " są identyczne)";
					break;
				default: out = "powinien przejść walidację \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/pt-BR/index.js
var require_pt_BR = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/pt-BR/index.js"(exports, module) {
	module.exports = function localize_pt_BR(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "não são permitidos itens adicionais (mais do que " + n + ")";
					break;
				case "additionalProperties":
					out = "não são permitidas propriedades adicionais";
					break;
				case "anyOf":
					out = "os dados não correspondem a nenhum schema de \"anyOf\"";
					break;
				case "const":
					out = "deve ser igual à constante";
					break;
				case "contains":
					out = "deve conter um item válido";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += " deve ter propriedade";
					if (n != 1) out += "s";
					out += " " + e.params.deps + " quando a propriedade " + e.params.property + " estiver presente";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "a tag \"" + e.params.tag + "\" deve ser uma string";
							break;
						case "mapping":
							out = "o valor da tag \"" + e.params.tag + "\" deve estar no oneOf";
							break;
						default: out = "deve passar a validação da keyword \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "deve ser igual a um dos valores permitidos";
					break;
				case "false schema":
					out = "o schema booleano é \"false\"";
					break;
				case "format":
					out = "deve corresponder ao formato \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "deve ser " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "deve ser " + cond;
					break;
				case "if":
					out = "deve corresponder ao schema \"" + e.params.failingKeyword + "\"";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "deve ser " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "não deve ter mais que " + n + " elemento";
					if (n != 1) out += "s";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "não deve ser maior que " + n + " caracter";
					if (n != 1) out += "es";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "não deve ter mais que " + n + " propriedade";
					if (n != 1) out += "s";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "deve ser " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "não deve ter menos que " + n + " elemento";
					if (n != 1) out += "s";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "não deve ser mais curta que " + n + " caracter";
					if (n != 1) out += "es";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "não deve ter menos que " + n + " propriedade";
					if (n != 1) out += "s";
					break;
				case "multipleOf":
					out = "deve ser múltiplo de " + e.params.multipleOf;
					break;
				case "not":
					out = "não deve ser valido segundo o schema em \"not\"";
					break;
				case "oneOf":
					out = "deve corresponder exatamente com um schema em \"oneOf\"";
					break;
				case "pattern":
					out = "deve corresponder ao padrão \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "deve ter a propriedade correspondente ao padrão \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "o nome da propriedade é inválido";
					break;
				case "required":
					out = "deve ter a propriedade obrigatória " + e.params.missingProperty;
					break;
				case "type":
					out = "";
					var t = e.params.type;
					out += "deve ser ";
					if (t == "number") out += "um número";
					else if (t == "integer") out += "um número inteiro";
					else if (t == "string") out += "um texto";
					else if (t == "boolean") out += "um booleano";
					else out += t;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "não pode possuir mais que " + n + " ";
					if (n == 1) out += "item";
					else out += "itens";
					break;
				case "unevaluatedProperties":
					out = "não pode possuir propridades não avaliadas";
					break;
				case "uniqueItems":
					out = "não deve ter itens duplicados (os itens ## " + e.params.j + " e " + e.params.i + " são idênticos)";
					break;
				default: out = "deve passar a validação da keyword \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/ru/index.js
var require_ru = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/ru/index.js"(exports, module) {
	module.exports = function localize_ru(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "должно иметь не более, чем " + n + " элемент";
					if (n >= 2 && n <= 4) out += "а";
					else if (n != 1) out += "ов";
					break;
				case "additionalProperties":
					out = "не должно иметь дополнительных полей";
					break;
				case "anyOf":
					out = "должно соответствовать одной их схем в \"anyOf\"";
					break;
				case "const":
					out = "должно быть равно заданному значению";
					break;
				case "contains":
					out = "должно содержать значение соответствующее схеме";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "должно иметь пол";
					if (n == 1) out += "е";
					else out += "я";
					out += " " + e.params.deps + ", когда присутствует поле " + e.params.property;
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "поле \"" + e.params.tag + "\" должно быть строкой";
							break;
						case "mapping":
							out = "значение поля \"" + e.params.tag + "\" должно быть в одной из oneOf схем ";
							break;
						default: out = "должно соответствовать правилу \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "должно быть равно одному из разрешенных значений";
					break;
				case "false schema":
					out = "схема равна false";
					break;
				case "format":
					out = "должно соответствовать формату \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "должно быть " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "должно быть " + cond;
					break;
				case "if":
					out = "должно соответствовать схемe \"" + e.params.failingKeyword + "\"";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "должно быть " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "должно иметь не более, чем " + n + " элемент";
					if (n >= 2 && n <= 4) out += "а";
					else if (n != 1) out += "ов";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "должно быть не длиннее, чем " + n + " символ";
					if (n >= 2 && n <= 4) out += "а";
					else if (n != 1) out += "ов";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "должно иметь не более, чем " + n + " пол";
					if (n == 1) out += "е";
					else if (n >= 2 && n <= 4) out += "я";
					else out += "ей";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "должно быть " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "должно иметь не менее, чем " + n + " элемент";
					if (n >= 2 && n <= 4) out += "а";
					else if (n != 1) out += "ов";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "должно быть не короче, чем " + n + " символ";
					if (n >= 2 && n <= 4) out += "а";
					else if (n != 1) out += "ов";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "должно иметь не менее, чем " + n + " пол";
					if (n == 1) out += "е";
					else if (n >= 2 && n <= 4) out += "я";
					else out += "ей";
					break;
				case "multipleOf":
					out = "должно быть кратным " + e.params.multipleOf;
					break;
				case "not":
					out = "должно не соответствовать схеме в \"not\"";
					break;
				case "oneOf":
					out = "должно соответствовать в точности одной схемe в \"oneOf\"";
					break;
				case "pattern":
					out = "должно соответствовать образцу \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "должно иметь поле, соответствующее образцу \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "имя поля не соответствует схеме";
					break;
				case "required":
					out = "должно иметь обязательное поле " + e.params.missingProperty;
					break;
				case "type":
					out = "должно быть " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "должно иметь не более, чем " + n + " элемент";
					if (n >= 2 && n <= 4) out += "а";
					else if (n != 1) out += "ов";
					break;
				case "unevaluatedProperties":
					out = "не должно иметь непроверенных полей";
					break;
				case "uniqueItems":
					out = "не должно иметь повторяющихся элементов (элементы " + e.params.j + " и " + e.params.i + " идентичны)";
					break;
				default: out = "должно соответствовать правилу \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/sk/index.js
var require_sk = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/sk/index.js"(exports, module) {
	module.exports = function localize_sk(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "nemôže obsahovať viac, než " + n + " prv";
					if (n == 1) out += "ok";
					else out += "kov";
					break;
				case "additionalProperties":
					out = "nemôže obsahovať ďalšie položky";
					break;
				case "anyOf":
					out = "musí splňovať aspoň jednu zo schém v \"anyOf\"";
					break;
				case "const":
					out = "musí byť konštanta";
					break;
				case "contains":
					out = "musí obsahovať prvok zodpovedajúci schéme";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += " musí obsahovať polož";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "iek";
					else out += "ka";
					out += ": " + e.params.deps + ", ak obsahuje " + e.params.property;
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "musí splniť \"" + e.keyword + "\" validáciu";
					}
					break;
				case "enum":
					out = "musí byť jedna z definovaných hodnôt";
					break;
				case "false schema":
					out = "schéma je false";
					break;
				case "format":
					out = "musí obsahovať formát \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "musí byť " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "musí byť " + cond;
					break;
				case "if":
					out = "must match \"" + e.params.failingKeyword + "\" schema";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "musí byť " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "nesmie obsahovať viac než " + n + " prv";
					if (n == 1) out += "ok";
					else out += "kov";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "nesmie byť dlhší než " + n + " znak";
					if (n != 1) out += "ov";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "nesmie obsahovať viac než " + n + " polož";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "iek";
					else out += "ka";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "musí byť " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "nesmie obsahovať menej než " + n + " prv";
					if (n == 1) out += "ok";
					else out += "kov";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "nesmie byť kratší než " + n + " znak";
					if (n != 1) out += "ov";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "nesmie obsahovať menej než " + n + " polož";
					if (n >= 2 && n <= 4) out += "ky";
					else if (n != 1) out += "iek";
					else out += "ka";
					break;
				case "multipleOf":
					out = "musí byť násobkom " + e.params.multipleOf;
					break;
				case "not":
					out = "nesmie splňovať schému v \"not\"";
					break;
				case "oneOf":
					out = "musí splňovať práve jednu schému v \"oneOf\"";
					break;
				case "pattern":
					out = "musí splňovať regulárny výraz \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "musí obsahovať položku splňjúcu regulárny výraz \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "názov položky nezodpovedá schéme";
					break;
				case "required":
					out = "musí obsahovať požadovanú položku " + e.params.missingProperty;
					break;
				case "type":
					out = "musí byť " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "nesmie obsahovať duplicitné prvky (prvky ## " + e.params.j + " a " + e.params.i + " sú rovnaké)";
					break;
				default: out = "musí splniť \"" + e.keyword + "\" validáciu";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/sv/index.js
var require_sv = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/sv/index.js"(exports, module) {
	module.exports = function localize_sv(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "borde ha fler än " + n + " sak";
					if (n != 1) out += "er";
					break;
				case "additionalProperties":
					out = "borde inte ha fler egenskaper";
					break;
				case "anyOf":
					out = "borde matcha något schema i \"anyOf\"";
					break;
				case "const":
					out = "bör vara en konstant";
					break;
				case "contains":
					out = "bör innehålla ett giltigt objekt";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "borde ha egenskap";
					if (n != 1) out += "er";
					out += " " + e.params.deps + " när egenskap " + e.params.property + " finns tillgängligt";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" must be string";
							break;
						case "mapping":
							out = "value of tag \"" + e.params.tag + "\" must be in oneOf";
							break;
						default: out = "bör passera \"" + e.keyword + "\" nyckelord validering";
					}
					break;
				case "enum":
					out = "borde vara ekvivalent med en av dess fördefinierade värden";
					break;
				case "false schema":
					out = "boolean schema är falskt";
					break;
				case "format":
					out = "borde matcha formatet \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "bör vara " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "bör vara " + cond;
					break;
				case "if":
					out = "must match \"" + e.params.failingKeyword + "\" schema";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "borde vara " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "borde inte ha fler än " + n + " sak";
					if (n != 1) out += "er";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "borde inte vara längre än " + n + " tecken";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "borde inte ha fler än " + n + " egenskap";
					if (n != 1) out += "er";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "borde vara " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "borde inte ha färre än " + n + " sak";
					if (n != 1) out += "er";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "borde inte vara kortare än " + n + " tecken";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "borde inte ha färre än " + n + " egenskap";
					if (n != 1) out += "er";
					break;
				case "multipleOf":
					out = "borde vara en multipel av " + e.params.multipleOf;
					break;
				case "not":
					out = "borde inte vara giltigt enligt schema i \"not\"";
					break;
				case "oneOf":
					out = "borde matcha exakt ett schema i \"oneOf\"";
					break;
				case "pattern":
					out = "borde matcha mönstret \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "bör ha en egenskap som matchar mönstret \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "egenskap med namnet är inte giltig";
					break;
				case "required":
					out = "borde ha den nödvändiga egenskapen " + e.params.missingProperty;
					break;
				case "type":
					out = "borde vara " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "must NOT have more than " + n + " item";
					if (n != 1) out += "s";
					break;
				case "unevaluatedProperties":
					out = "must NOT have unevaluated properties";
					break;
				case "uniqueItems":
					out = "borde inte ha duplicerade saker (sakerna ## " + e.params.j + " och " + e.params.i + " är identiska)";
					break;
				default: out = "bör passera \"" + e.keyword + "\" nyckelord validering";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/th/index.js
var require_th = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/th/index.js"(exports, module) {
	module.exports = function localize_th(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "ต้องมีสมาชิกไม่เกิน " + n + " ตัว";
					break;
				case "additionalProperties":
					out = "ต้องไม่มี property อื่นๆ นอกเหนีอจากที่กำหนดไว้";
					break;
				case "anyOf":
					out = "ต้องตรงกับหนึ่งใน schema ที่กำหนดไว้ใน \"anyOf\"";
					break;
				case "const":
					out = "ต้องเท่ากับค่าคงที่";
					break;
				case "contains":
					out = "ต้องมีสมาชิกที่ผ่านเงื่อนไขอยู่";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "เมื่อมี property " + e.params.property + " แล้วจะต้องมี property " + e.params.deps + " ด้วย";
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "tag \"" + e.params.tag + "\" ต้องเป็น string";
							break;
						case "mapping":
							out = "ต้องมีค่าของ tag \"" + e.params.tag + "\" ใน oneOf";
							break;
						default: out = "ต้องผ่านคีย์เวิร์ด \"" + e.keyword + "\"";
					}
					break;
				case "enum":
					out = "ต้องตรงกับหนึ่งในค่าที่กำหนดไว้";
					break;
				case "false schema":
					out = "schema เป็น false";
					break;
				case "format":
					out = "ต้องเป็นรูปแบบ \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "ต้อง " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "ต้อง " + cond;
					break;
				case "if":
					out = "ต้องตรงกับ schema \"" + e.params.failingKeyword + "\"";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "ต้อง " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "ต้องมีสมาชิกไม่เกิน " + n;
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "ต้องยาวไม่เกิน " + n + " ตัวอักษร";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "ต้องมี property ไม่เกิน " + n + " ตัว";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "ต้อง " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "ควรมีสมาชิกไม่น้อยกว่า " + n;
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "ต้องมีอย่างน้อย " + n + " ตัวอักษร";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "ต้องมี property อย่างน้อย " + n + " ตัว";
					break;
				case "multipleOf":
					out = "ต้องเป็นเลขที่หาร " + e.params.multipleOf + " ลงตัว";
					break;
				case "not":
					out = "ต้องไม่ผ่าน schema ที่กำหนดไว้ใน \"not\"";
					break;
				case "oneOf":
					out = "ต้องตรงกับ schema ตัวเดียวใน \"oneOf\" เท่านั้น";
					break;
				case "pattern":
					out = "ต้องตรงตาม pattern \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "ต้องมี property ที่มีชื่อตรงตาม pattern \"" + e.params.missingPattern + "\"";
					break;
				case "propertyNames":
					out = "ชื่อ property ไม่ถูกต้อง";
					break;
				case "required":
					out = "ต้องมี property " + e.params.missingProperty + " ด้วย";
					break;
				case "type":
					out = "ต้องเป็น " + e.params.type;
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += "ต้องมีไม่เกิน " + n + " ตัว";
					break;
				case "unevaluatedProperties":
					out = "ต้องไม่มี property ที่ยังไม่ได้ผ่านการตรวจสอบเงื่อนไขใดๆ";
					break;
				case "uniqueItems":
					out = "ต้องมีสมาชิกไม่ซ้ำักัน (ลำดับที่ " + e.params.j + " กับ " + e.params.i + " ซ้ำกัน)";
					break;
				default: out = "ต้องผ่านคีย์เวิร์ด \"" + e.keyword + "\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/zh/index.js
var require_zh = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/zh/index.js"(exports, module) {
	module.exports = function localize_zh(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "不允许超过" + n + "个元素";
					break;
				case "additionalProperties":
					out = "不允许有额外的属性";
					break;
				case "anyOf":
					out = "数据应为 anyOf 所指定的其中一个";
					break;
				case "const":
					out = "应当等于常量";
					break;
				case "contains":
					out = "应当包含一个有效项";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "应当拥有属性" + e.params.property + "的依赖属性" + e.params.deps;
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "标签 \"" + e.params.tag + "\" 的类型必须为字符串";
							break;
						case "mapping":
							out = "标签 \"" + e.params.tag + "\" 的值必须在 oneOf 之中";
							break;
						default: out = "应当通过 \"" + e.keyword + " 关键词校验\"";
					}
					break;
				case "enum":
					out = "应当是预设定的枚举值之一";
					break;
				case "false schema":
					out = "布尔模式出错";
					break;
				case "format":
					out = "应当匹配格式 \"" + e.params.format + "\"";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "应当是 " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "应当是 " + cond;
					break;
				case "if":
					out = "应当匹配模式 \"" + e.params.failingKeyword + "\" ";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "应当为 " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "不应多于 " + n + " 个项";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "不应多于 " + n + " 个字符";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "不应有多于 " + n + " 个属性";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "应当为 " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "不应少于 " + n + " 个项";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "不应少于 " + n + " 个字符";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "不应有少于 " + n + " 个属性";
					break;
				case "multipleOf":
					out = "应当是 " + e.params.multipleOf + " 的整数倍";
					break;
				case "not":
					out = "不应当匹配 \"not\" schema";
					break;
				case "oneOf":
					out = "只能匹配一个 \"oneOf\" 中的 schema";
					break;
				case "pattern":
					out = "应当匹配模式 \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "应当有属性匹配模式 " + e.params.missingPattern;
					break;
				case "propertyNames":
					out = "属性名 无效";
					break;
				case "required":
					out = "应当有必需属性 " + e.params.missingProperty;
					break;
				case "type":
					out = "应当是 " + e.params.type + " 类型";
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += " 不允许有超过 " + n + " 个元素";
					break;
				case "unevaluatedProperties":
					out = "不允许存在未求值的属性";
					break;
				case "uniqueItems":
					out = "不应当含有重复项 (第 " + e.params.j + " 项与第 " + e.params.i + " 项是重复的)";
					break;
				default: out = "应当通过 \"" + e.keyword + " 关键词校验\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/zh-TW/index.js
var require_zh_TW = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/zh-TW/index.js"(exports, module) {
	module.exports = function localize_zh_TW(errors) {
		if (!(errors && errors.length)) return;
		for (const e of errors) {
			let out;
			switch (e.keyword) {
				case "additionalItems":
				case "items":
					out = "";
					var n = e.params.limit;
					out += "不可以超過" + n + "個元素";
					break;
				case "additionalProperties":
					out = "不可以有額外的屬性";
					break;
				case "anyOf":
					out = "不符合 anyOf 指定的模式";
					break;
				case "const":
					out = "應該等於常數";
					break;
				case "contains":
					out = "應該包含一個有效元素";
					break;
				case "dependencies":
				case "dependentRequired":
					out = "";
					var n = e.params.depsCount;
					out += "應該要有屬性" + e.params.property + "的依賴屬性" + e.params.deps;
					break;
				case "discriminator":
					switch (e.params.error) {
						case "tag":
							out = "標籤 \"" + e.params.tag + "\" 的類型必須是字串";
							break;
						case "mapping":
							out = "標籤 \"" + e.params.tag + "\" 必須在 oneOf 其中之一";
							break;
						default: out = "應該通過 \"" + e.keyword + " 關鍵詞檢驗\"";
					}
					break;
				case "enum":
					out = "應該要在預設的值之中";
					break;
				case "false schema":
					out = "布林模式不正確";
					break;
				case "format":
					out = "應該要符合" + e.params.format + "格式";
					break;
				case "formatMaximum":
				case "formatExclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "應該是 " + cond;
					break;
				case "formatMinimum":
				case "formatExclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "應該是 " + cond;
					break;
				case "if":
					out = "應該符合 \"" + e.params.failingKeyword + "\" schema";
					break;
				case "maximum":
				case "exclusiveMaximum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "應該要 " + cond;
					break;
				case "maxItems":
					out = "";
					var n = e.params.limit;
					out += "不應該多於 " + n + " 個";
					break;
				case "maxLength":
					out = "";
					var n = e.params.limit;
					out += "不應該多於 " + n + " 個字元";
					break;
				case "maxProperties":
					out = "";
					var n = e.params.limit;
					out += "不應該多於 " + n + " 個屬性";
					break;
				case "minimum":
				case "exclusiveMinimum":
					out = "";
					var cond = e.params.comparison + " " + e.params.limit;
					out += "應該要 " + cond;
					break;
				case "minItems":
					out = "";
					var n = e.params.limit;
					out += "不應該少於 " + n + " 個";
					break;
				case "minLength":
					out = "";
					var n = e.params.limit;
					out += "不應該少於 " + n + " 個字元";
					break;
				case "minProperties":
					out = "";
					var n = e.params.limit;
					out += "不應該少於 " + n + " 個屬性";
					break;
				case "multipleOf":
					out = "應該是 " + e.params.multipleOf + " 的整數倍";
					break;
				case "not":
					out = "不應該符合 \"not\" schema";
					break;
				case "oneOf":
					out = "只能符合一個 \"oneOf\" 中的 schema";
					break;
				case "pattern":
					out = "應該符合模式 \"" + e.params.pattern + "\"";
					break;
				case "patternRequired":
					out = "應該有屬性對應模式 " + e.params.missingPattern;
					break;
				case "propertyNames":
					out = "属性名 無效";
					break;
				case "required":
					out = "應該有必須屬性 " + e.params.missingProperty;
					break;
				case "type":
					out = "應該是 " + e.params.type + " 類型";
					break;
				case "unevaluatedItems":
					out = "";
					var n = e.params.len;
					out += " 的元素不可以超過 " + n + " 個";
					break;
				case "unevaluatedProperties":
					out = "不應該有未驗證的屬性";
					break;
				case "uniqueItems":
					out = "不應該有重複項目 (第 " + e.params.j + " 項和第 " + e.params.i + " 項是重複的)";
					break;
				default: out = "應該通過 \"" + e.keyword + " 關鍵詞檢驗\"";
			}
			e.message = out;
		}
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-i18n/localize/index.js
var require_localize = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-i18n/localize/index.js"(exports, module) {
	module.exports = {
		en: require_en(),
		ar: require_ar(),
		ca: require_ca(),
		cs: require_cs(),
		de: require_de(),
		es: require_es(),
		fi: require_fi(),
		fr: require_fr(),
		hu: require_hu(),
		id: require_id(),
		it: require_it(),
		ja: require_ja(),
		ko: require_ko(),
		nb: require_nb(),
		nl: require_nl(),
		pl: require_pl(),
		"pt-BR": require_pt_BR(),
		ru: require_ru(),
		sk: require_sk(),
		sv: require_sv(),
		th: require_th(),
		zh: require_zh(),
		"zh-TW": require_zh_TW()
	};
} });

//#endregion
//#region ../packages/vovk-ajv/node_modules/ajv-errors/dist/index.js
var require_dist = __commonJS({ "../packages/vovk-ajv/node_modules/ajv-errors/dist/index.js"(exports, module) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const ajv_1$1 = require_ajv$1();
	const codegen_1 = require_codegen$1();
	const code_1 = require_code$3();
	const validate_1 = require_validate$1();
	const errors_1 = require_errors$1();
	const names_1 = require_names$1();
	const keyword = "errorMessage";
	const used = new ajv_1$1.Name("emUsed");
	const KEYWORD_PROPERTY_PARAMS = {
		required: "missingProperty",
		dependencies: "property",
		dependentRequired: "property"
	};
	const INTERPOLATION = /\$\{[^}]+\}/;
	const INTERPOLATION_REPLACE = /\$\{([^}]+)\}/g;
	const EMPTY_STR = /^""\s*\+\s*|\s*\+\s*""$/g;
	function errorMessage(options) {
		return {
			keyword,
			schemaType: ["string", "object"],
			post: true,
			code(cxt) {
				const { gen, data, schema: schema$1, schemaValue, it } = cxt;
				if (it.createErrors === false) return;
				const sch = schema$1;
				const instancePath = codegen_1.strConcat(names_1.default.instancePath, it.errorPath);
				gen.if(ajv_1$1._`${names_1.default.errors} > 0`, () => {
					if (typeof sch == "object") {
						const [kwdPropErrors, kwdErrors] = keywordErrorsConfig(sch);
						if (kwdErrors) processKeywordErrors(kwdErrors);
						if (kwdPropErrors) processKeywordPropErrors(kwdPropErrors);
						processChildErrors(childErrorsConfig(sch));
					}
					const schMessage = typeof sch == "string" ? sch : sch._;
					if (schMessage) processAllErrors(schMessage);
					if (!options.keepErrors) removeUsedErrors();
				});
				function childErrorsConfig({ properties, items }) {
					const errors = {};
					if (properties) {
						errors.props = {};
						for (const p in properties) errors.props[p] = [];
					}
					if (items) {
						errors.items = {};
						for (let i = 0; i < items.length; i++) errors.items[i] = [];
					}
					return errors;
				}
				function keywordErrorsConfig(emSchema) {
					let propErrors;
					let errors;
					for (const k in emSchema) {
						if (k === "properties" || k === "items") continue;
						const kwdSch = emSchema[k];
						if (typeof kwdSch == "object") {
							propErrors || (propErrors = {});
							const errMap = propErrors[k] = {};
							for (const p in kwdSch) errMap[p] = [];
						} else {
							errors || (errors = {});
							errors[k] = [];
						}
					}
					return [propErrors, errors];
				}
				function processKeywordErrors(kwdErrors) {
					const kwdErrs = gen.const("emErrors", ajv_1$1.stringify(kwdErrors));
					const templates = gen.const("templates", getTemplatesCode(kwdErrors, schema$1));
					gen.forOf("err", names_1.default.vErrors, (err) => gen.if(matchKeywordError(err, kwdErrs), () => gen.code(ajv_1$1._`${kwdErrs}[${err}.keyword].push(${err})`).assign(ajv_1$1._`${err}.${used}`, true)));
					const { singleError } = options;
					if (singleError) {
						const message = gen.let("message", ajv_1$1._`""`);
						const paramsErrors = gen.let("paramsErrors", ajv_1$1._`[]`);
						loopErrors((key) => {
							gen.if(message, () => gen.code(ajv_1$1._`${message} += ${typeof singleError == "string" ? singleError : ";"}`));
							gen.code(ajv_1$1._`${message} += ${errMessage(key)}`);
							gen.assign(paramsErrors, ajv_1$1._`${paramsErrors}.concat(${kwdErrs}[${key}])`);
						});
						errors_1.reportError(cxt, {
							message,
							params: ajv_1$1._`{errors: ${paramsErrors}}`
						});
					} else loopErrors((key) => errors_1.reportError(cxt, {
						message: errMessage(key),
						params: ajv_1$1._`{errors: ${kwdErrs}[${key}]}`
					}));
					function loopErrors(body) {
						gen.forIn("key", kwdErrs, (key) => gen.if(ajv_1$1._`${kwdErrs}[${key}].length`, () => body(key)));
					}
					function errMessage(key) {
						return ajv_1$1._`${key} in ${templates} ? ${templates}[${key}]() : ${schemaValue}[${key}]`;
					}
				}
				function processKeywordPropErrors(kwdPropErrors) {
					const kwdErrs = gen.const("emErrors", ajv_1$1.stringify(kwdPropErrors));
					const templatesCode = [];
					for (const k in kwdPropErrors) templatesCode.push([k, getTemplatesCode(kwdPropErrors[k], schema$1[k])]);
					const templates = gen.const("templates", gen.object(...templatesCode));
					const kwdPropParams = gen.scopeValue("obj", {
						ref: KEYWORD_PROPERTY_PARAMS,
						code: ajv_1$1.stringify(KEYWORD_PROPERTY_PARAMS)
					});
					const propParam = gen.let("emPropParams");
					const paramsErrors = gen.let("emParamsErrors");
					gen.forOf("err", names_1.default.vErrors, (err) => gen.if(matchKeywordError(err, kwdErrs), () => {
						gen.assign(propParam, ajv_1$1._`${kwdPropParams}[${err}.keyword]`);
						gen.assign(paramsErrors, ajv_1$1._`${kwdErrs}[${err}.keyword][${err}.params[${propParam}]]`);
						gen.if(paramsErrors, () => gen.code(ajv_1$1._`${paramsErrors}.push(${err})`).assign(ajv_1$1._`${err}.${used}`, true));
					}));
					gen.forIn("key", kwdErrs, (key) => gen.forIn("keyProp", ajv_1$1._`${kwdErrs}[${key}]`, (keyProp) => {
						gen.assign(paramsErrors, ajv_1$1._`${kwdErrs}[${key}][${keyProp}]`);
						gen.if(ajv_1$1._`${paramsErrors}.length`, () => {
							const tmpl = gen.const("tmpl", ajv_1$1._`${templates}[${key}] && ${templates}[${key}][${keyProp}]`);
							errors_1.reportError(cxt, {
								message: ajv_1$1._`${tmpl} ? ${tmpl}() : ${schemaValue}[${key}][${keyProp}]`,
								params: ajv_1$1._`{errors: ${paramsErrors}}`
							});
						});
					}));
				}
				function processChildErrors(childErrors) {
					const { props, items } = childErrors;
					if (!props && !items) return;
					const isObj = ajv_1$1._`typeof ${data} == "object"`;
					const isArr = ajv_1$1._`Array.isArray(${data})`;
					const childErrs = gen.let("emErrors");
					let childKwd;
					let childProp;
					const templates = gen.let("templates");
					if (props && items) {
						childKwd = gen.let("emChildKwd");
						gen.if(isObj);
						gen.if(isArr, () => {
							init(items, schema$1.items);
							gen.assign(childKwd, ajv_1$1.str`items`);
						}, () => {
							init(props, schema$1.properties);
							gen.assign(childKwd, ajv_1$1.str`properties`);
						});
						childProp = ajv_1$1._`[${childKwd}]`;
					} else if (items) {
						gen.if(isArr);
						init(items, schema$1.items);
						childProp = ajv_1$1._`.items`;
					} else if (props) {
						gen.if(codegen_1.and(isObj, codegen_1.not(isArr)));
						init(props, schema$1.properties);
						childProp = ajv_1$1._`.properties`;
					}
					gen.forOf("err", names_1.default.vErrors, (err) => ifMatchesChildError(err, childErrs, (child) => gen.code(ajv_1$1._`${childErrs}[${child}].push(${err})`).assign(ajv_1$1._`${err}.${used}`, true)));
					gen.forIn("key", childErrs, (key) => gen.if(ajv_1$1._`${childErrs}[${key}].length`, () => {
						errors_1.reportError(cxt, {
							message: ajv_1$1._`${key} in ${templates} ? ${templates}[${key}]() : ${schemaValue}${childProp}[${key}]`,
							params: ajv_1$1._`{errors: ${childErrs}[${key}]}`
						});
						gen.assign(ajv_1$1._`${names_1.default.vErrors}[${names_1.default.errors}-1].instancePath`, ajv_1$1._`${instancePath} + "/" + ${key}.replace(/~/g, "~0").replace(/\\//g, "~1")`);
					}));
					gen.endIf();
					function init(children, msgs) {
						gen.assign(childErrs, ajv_1$1.stringify(children));
						gen.assign(templates, getTemplatesCode(children, msgs));
					}
				}
				function processAllErrors(schMessage) {
					const errs = gen.const("emErrs", ajv_1$1._`[]`);
					gen.forOf("err", names_1.default.vErrors, (err) => gen.if(matchAnyError(err), () => gen.code(ajv_1$1._`${errs}.push(${err})`).assign(ajv_1$1._`${err}.${used}`, true)));
					gen.if(ajv_1$1._`${errs}.length`, () => errors_1.reportError(cxt, {
						message: templateExpr(schMessage),
						params: ajv_1$1._`{errors: ${errs}}`
					}));
				}
				function removeUsedErrors() {
					const errs = gen.const("emErrs", ajv_1$1._`[]`);
					gen.forOf("err", names_1.default.vErrors, (err) => gen.if(ajv_1$1._`!${err}.${used}`, () => gen.code(ajv_1$1._`${errs}.push(${err})`)));
					gen.assign(names_1.default.vErrors, errs).assign(names_1.default.errors, ajv_1$1._`${errs}.length`);
				}
				function matchKeywordError(err, kwdErrs) {
					return codegen_1.and(ajv_1$1._`${err}.keyword !== ${keyword}`, ajv_1$1._`!${err}.${used}`, ajv_1$1._`${err}.instancePath === ${instancePath}`, ajv_1$1._`${err}.keyword in ${kwdErrs}`, ajv_1$1._`${err}.schemaPath.indexOf(${it.errSchemaPath}) === 0`, ajv_1$1._`/^\\/[^\\/]*$/.test(${err}.schemaPath.slice(${it.errSchemaPath.length}))`);
				}
				function ifMatchesChildError(err, childErrs, thenBody) {
					gen.if(codegen_1.and(ajv_1$1._`${err}.keyword !== ${keyword}`, ajv_1$1._`!${err}.${used}`, ajv_1$1._`${err}.instancePath.indexOf(${instancePath}) === 0`), () => {
						const childRegex = gen.scopeValue("pattern", {
							ref: /^\/([^/]*)(?:\/|$)/,
							code: ajv_1$1._`new RegExp("^\\\/([^/]*)(?:\\\/|$)")`
						});
						const matches = gen.const("emMatches", ajv_1$1._`${childRegex}.exec(${err}.instancePath.slice(${instancePath}.length))`);
						const child = gen.const("emChild", ajv_1$1._`${matches} && ${matches}[1].replace(/~1/g, "/").replace(/~0/g, "~")`);
						gen.if(ajv_1$1._`${child} !== undefined && ${child} in ${childErrs}`, () => thenBody(child));
					});
				}
				function matchAnyError(err) {
					return codegen_1.and(ajv_1$1._`${err}.keyword !== ${keyword}`, ajv_1$1._`!${err}.${used}`, codegen_1.or(ajv_1$1._`${err}.instancePath === ${instancePath}`, codegen_1.and(ajv_1$1._`${err}.instancePath.indexOf(${instancePath}) === 0`, ajv_1$1._`${err}.instancePath[${instancePath}.length] === "/"`)), ajv_1$1._`${err}.schemaPath.indexOf(${it.errSchemaPath}) === 0`, ajv_1$1._`${err}.schemaPath[${it.errSchemaPath}.length] === "/"`);
				}
				function getTemplatesCode(keys, msgs) {
					const templatesCode = [];
					for (const k in keys) {
						const msg = msgs[k];
						if (INTERPOLATION.test(msg)) templatesCode.push([k, templateFunc(msg)]);
					}
					return gen.object(...templatesCode);
				}
				function templateExpr(msg) {
					if (!INTERPOLATION.test(msg)) return ajv_1$1.stringify(msg);
					return new code_1._Code(code_1.safeStringify(msg).replace(INTERPOLATION_REPLACE, (_s, ptr) => `" + JSON.stringify(${validate_1.getData(ptr, it)}) + "`).replace(EMPTY_STR, ""));
				}
				function templateFunc(msg) {
					return ajv_1$1._`function(){return ${templateExpr(msg)}}`;
				}
			},
			metaSchema: {
				anyOf: [{ type: "string" }, {
					type: "object",
					properties: {
						properties: { $ref: "#/$defs/stringMap" },
						items: { $ref: "#/$defs/stringList" },
						required: { $ref: "#/$defs/stringOrMap" },
						dependencies: { $ref: "#/$defs/stringOrMap" }
					},
					additionalProperties: { type: "string" }
				}],
				$defs: {
					stringMap: {
						type: "object",
						additionalProperties: { type: "string" }
					},
					stringOrMap: { anyOf: [{ type: "string" }, { $ref: "#/$defs/stringMap" }] },
					stringList: {
						type: "array",
						items: { type: "string" }
					}
				}
			}
		};
	}
	const ajvErrors = (ajv, options = {}) => {
		if (!ajv.opts.allErrors) throw new Error("ajv-errors: Ajv option allErrors must be true");
		if (ajv.opts.jsPropertySyntax) throw new Error("ajv-errors: ajv option jsPropertySyntax is not supported");
		return ajv.addKeyword(errorMessage(options));
	};
	exports.default = ajvErrors;
	module.exports = ajvErrors;
	module.exports.default = ajvErrors;
} });

//#endregion
//#region ../packages/vovk/cjs/types.js
var require_types = __commonJS({ "../packages/vovk/cjs/types.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VovkSchemaIdEnum = exports.HttpStatus = exports.HttpMethod = void 0;
	var HttpMethod;
	(function(HttpMethod$2) {
		HttpMethod$2["GET"] = "GET";
		HttpMethod$2["POST"] = "POST";
		HttpMethod$2["PUT"] = "PUT";
		HttpMethod$2["PATCH"] = "PATCH";
		HttpMethod$2["DELETE"] = "DELETE";
		HttpMethod$2["HEAD"] = "HEAD";
		HttpMethod$2["OPTIONS"] = "OPTIONS";
	})(HttpMethod || (exports.HttpMethod = HttpMethod = {}));
	var HttpStatus;
	(function(HttpStatus$2) {
		HttpStatus$2[HttpStatus$2["NULL"] = 0] = "NULL";
		HttpStatus$2[HttpStatus$2["CONTINUE"] = 100] = "CONTINUE";
		HttpStatus$2[HttpStatus$2["SWITCHING_PROTOCOLS"] = 101] = "SWITCHING_PROTOCOLS";
		HttpStatus$2[HttpStatus$2["PROCESSING"] = 102] = "PROCESSING";
		HttpStatus$2[HttpStatus$2["EARLYHINTS"] = 103] = "EARLYHINTS";
		HttpStatus$2[HttpStatus$2["OK"] = 200] = "OK";
		HttpStatus$2[HttpStatus$2["CREATED"] = 201] = "CREATED";
		HttpStatus$2[HttpStatus$2["ACCEPTED"] = 202] = "ACCEPTED";
		HttpStatus$2[HttpStatus$2["NON_AUTHORITATIVE_INFORMATION"] = 203] = "NON_AUTHORITATIVE_INFORMATION";
		HttpStatus$2[HttpStatus$2["NO_CONTENT"] = 204] = "NO_CONTENT";
		HttpStatus$2[HttpStatus$2["RESET_CONTENT"] = 205] = "RESET_CONTENT";
		HttpStatus$2[HttpStatus$2["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
		HttpStatus$2[HttpStatus$2["AMBIGUOUS"] = 300] = "AMBIGUOUS";
		HttpStatus$2[HttpStatus$2["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
		HttpStatus$2[HttpStatus$2["FOUND"] = 302] = "FOUND";
		HttpStatus$2[HttpStatus$2["SEE_OTHER"] = 303] = "SEE_OTHER";
		HttpStatus$2[HttpStatus$2["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
		HttpStatus$2[HttpStatus$2["TEMPORARY_REDIRECT"] = 307] = "TEMPORARY_REDIRECT";
		HttpStatus$2[HttpStatus$2["PERMANENT_REDIRECT"] = 308] = "PERMANENT_REDIRECT";
		HttpStatus$2[HttpStatus$2["BAD_REQUEST"] = 400] = "BAD_REQUEST";
		HttpStatus$2[HttpStatus$2["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
		HttpStatus$2[HttpStatus$2["PAYMENT_REQUIRED"] = 402] = "PAYMENT_REQUIRED";
		HttpStatus$2[HttpStatus$2["FORBIDDEN"] = 403] = "FORBIDDEN";
		HttpStatus$2[HttpStatus$2["NOT_FOUND"] = 404] = "NOT_FOUND";
		HttpStatus$2[HttpStatus$2["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
		HttpStatus$2[HttpStatus$2["NOT_ACCEPTABLE"] = 406] = "NOT_ACCEPTABLE";
		HttpStatus$2[HttpStatus$2["PROXY_AUTHENTICATION_REQUIRED"] = 407] = "PROXY_AUTHENTICATION_REQUIRED";
		HttpStatus$2[HttpStatus$2["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
		HttpStatus$2[HttpStatus$2["CONFLICT"] = 409] = "CONFLICT";
		HttpStatus$2[HttpStatus$2["GONE"] = 410] = "GONE";
		HttpStatus$2[HttpStatus$2["LENGTH_REQUIRED"] = 411] = "LENGTH_REQUIRED";
		HttpStatus$2[HttpStatus$2["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
		HttpStatus$2[HttpStatus$2["PAYLOAD_TOO_LARGE"] = 413] = "PAYLOAD_TOO_LARGE";
		HttpStatus$2[HttpStatus$2["URI_TOO_LONG"] = 414] = "URI_TOO_LONG";
		HttpStatus$2[HttpStatus$2["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
		HttpStatus$2[HttpStatus$2["REQUESTED_RANGE_NOT_SATISFIABLE"] = 416] = "REQUESTED_RANGE_NOT_SATISFIABLE";
		HttpStatus$2[HttpStatus$2["EXPECTATION_FAILED"] = 417] = "EXPECTATION_FAILED";
		HttpStatus$2[HttpStatus$2["I_AM_A_TEAPOT"] = 418] = "I_AM_A_TEAPOT";
		HttpStatus$2[HttpStatus$2["MISDIRECTED"] = 421] = "MISDIRECTED";
		HttpStatus$2[HttpStatus$2["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
		HttpStatus$2[HttpStatus$2["FAILED_DEPENDENCY"] = 424] = "FAILED_DEPENDENCY";
		HttpStatus$2[HttpStatus$2["PRECONDITION_REQUIRED"] = 428] = "PRECONDITION_REQUIRED";
		HttpStatus$2[HttpStatus$2["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
		HttpStatus$2[HttpStatus$2["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
		HttpStatus$2[HttpStatus$2["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
		HttpStatus$2[HttpStatus$2["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
		HttpStatus$2[HttpStatus$2["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
		HttpStatus$2[HttpStatus$2["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
		HttpStatus$2[HttpStatus$2["HTTP_VERSION_NOT_SUPPORTED"] = 505] = "HTTP_VERSION_NOT_SUPPORTED";
	})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
	var VovkSchemaIdEnum;
	(function(VovkSchemaIdEnum$2) {
		VovkSchemaIdEnum$2["META"] = "https://vovk.dev/api/schema/v3/meta.json";
		VovkSchemaIdEnum$2["CONFIG"] = "https://vovk.dev/api/schema/v3/config.json";
		VovkSchemaIdEnum$2["SEGMENT"] = "https://vovk.dev/api/schema/v3/segment.json";
		VovkSchemaIdEnum$2["SCHEMA"] = "https://vovk.dev/api/schema/v3/schema.json";
	})(VovkSchemaIdEnum || (exports.VovkSchemaIdEnum = VovkSchemaIdEnum = {}));
} });

//#endregion
//#region ../packages/vovk/cjs/HttpException.js
var require_HttpException = __commonJS({ "../packages/vovk/cjs/HttpException.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HttpException = void 0;
	var HttpException = class extends Error {
		statusCode;
		message;
		cause;
		constructor(statusCode, message, cause) {
			super(message);
			this.statusCode = statusCode;
			this.message = message;
			this.cause = cause;
		}
	};
	exports.HttpException = HttpException;
} });

//#endregion
//#region ../packages/vovk/cjs/utils/shim.js
var require_shim = __commonJS({ "../packages/vovk/cjs/utils/shim.js"() {
	if (typeof Symbol.dispose !== "symbol") Object.defineProperty(Symbol, "dispose", {
		configurable: false,
		enumerable: false,
		writable: false,
		value: Symbol.for("dispose")
	});
	if (typeof Symbol.asyncDispose !== "symbol") Object.defineProperty(Symbol, "asyncDispose", {
		configurable: false,
		enumerable: false,
		writable: false,
		value: Symbol.for("asyncDispose")
	});
} });

//#endregion
//#region ../packages/vovk/cjs/JSONLinesResponse.js
var require_JSONLinesResponse = __commonJS({ "../packages/vovk/cjs/JSONLinesResponse.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JSONLinesResponse = void 0;
	require_shim();
	var JSONLinesResponse = class extends Response {
		isClosed = false;
		controller;
		encoder;
		readableStream;
		iteratorQueue = [];
		iteratorResolvers = [];
		constructor(request, init) {
			const encoder = new TextEncoder();
			let readableController;
			const readableStream = new ReadableStream({
				cancel: () => {
					this.isClosed = true;
				},
				start: (controller) => {
					readableController = controller;
				}
			});
			const accept = request?.headers?.get("accept");
			super(readableStream, {
				...init,
				headers: {
					"content-type": !request || accept?.includes("application/jsonl") ? "application/jsonl; charset=utf-8" : "text/plain; charset=utf-8",
					...init?.headers
				}
			});
			this.readableStream = request ? readableStream : null;
			this.encoder = request ? encoder : null;
			this.controller = request ? readableController : null;
			request?.signal?.addEventListener("abort", this.close, { once: true });
		}
		send = (data) => {
			const { controller, encoder } = this;
			if (this.isClosed) return;
			controller?.enqueue(encoder?.encode(JSON.stringify(data) + "\n"));
			if (this.iteratorResolvers.length > 0) {
				const resolve$3 = this.iteratorResolvers.shift();
				resolve$3({
					value: data,
					done: false
				});
			} else this.iteratorQueue.push(data);
		};
		close = () => {
			const { controller } = this;
			if (this.isClosed) return;
			this.isClosed = true;
			controller?.close();
			while (this.iteratorResolvers.length > 0) {
				const resolve$3 = this.iteratorResolvers.shift();
				resolve$3({
					done: true,
					value: void 0
				});
			}
		};
		throw = (e) => {
			this.send({
				isError: true,
				reason: e instanceof Error ? e.message : e
			});
			return this.close();
		};
		[Symbol.dispose] = () => this.close();
		[Symbol.asyncDispose] = () => this.close();
		[Symbol.asyncIterator] = () => {
			return { next: async () => {
				if (this.iteratorQueue.length > 0) {
					const value = this.iteratorQueue.shift();
					return {
						value,
						done: false
					};
				}
				if (this.isClosed) return {
					done: true,
					value: void 0
				};
				return new Promise((resolve$3) => {
					this.iteratorResolvers.push(resolve$3);
				});
			} };
		};
	};
	exports.JSONLinesResponse = JSONLinesResponse;
} });

//#endregion
//#region ../packages/vovk/cjs/utils/parseQuery.js
var require_parseQuery = __commonJS({ "../packages/vovk/cjs/utils/parseQuery.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = parseQuery;
	/**
	* Parse a bracket-based key (e.g. "z[d][0][x]" or "arr[]")
	* into an array of path segments (strings or special push-markers).
	*
	* Example: "z[d][0][x]" => ["z", "d", "0", "x"]
	* Example: "arr[]"      => ["arr", "" ]  // "" indicates "push" onto array
	*/
	function parseKey(key) {
		const segments$1 = [];
		const topKeyMatch = key.match(/^([^[\]]+)/);
		if (topKeyMatch) segments$1.push(topKeyMatch[1]);
		else segments$1.push("");
		const bracketRegex = /\[([^[\]]*)\]/g;
		let match;
		while ((match = bracketRegex.exec(key)) !== null) segments$1.push(match[1]);
		return segments$1;
	}
	/**
	* Recursively set a value in a nested object/array, given a path of segments.
	* - If segment is numeric => treat as array index
	* - If segment is empty "" => push to array
	* - Else => object property
	*/
	function setValue(obj, path, value) {
		let current = obj;
		for (let i = 0; i < path.length; i++) {
			const segment = path[i];
			if (i === path.length - 1) if (segment === "") {
				if (!Array.isArray(current)) current = [];
				current.push(value);
			} else if (!isNaN(Number(segment))) {
				const idx = Number(segment);
				if (!Array.isArray(current)) current = [];
				current[idx] = value;
			} else current[segment] = value;
			else {
				const nextSegment = path[i + 1];
				if (segment === "") {
					if (!Array.isArray(current)) current = [];
					if (current.length === 0) current.push(typeof nextSegment === "string" && !isNaN(Number(nextSegment)) ? [] : {});
					else if (typeof nextSegment === "string" && !isNaN(Number(nextSegment))) {
						if (!Array.isArray(current[current.length - 1])) current[current.length - 1] = [];
					} else if (typeof current[current.length - 1] !== "object") current[current.length - 1] = {};
					current = current[current.length - 1];
				} else if (!isNaN(Number(segment))) {
					const idx = Number(segment);
					if (!Array.isArray(current)) current = [];
					if (current[idx] === void 0) current[idx] = typeof nextSegment === "string" && !isNaN(Number(nextSegment)) ? [] : {};
					current = current[idx];
				} else {
					if (current[segment] === void 0) current[segment] = typeof nextSegment === "string" && !isNaN(Number(nextSegment)) ? [] : {};
					current = current[segment];
				}
			}
		}
	}
	/**
	* Deserialize a bracket-based query string into an object.
	*
	* Supports:
	*   - Key/value pairs with nested brackets (e.g. "a[b][0]=value")
	*   - Arrays with empty bracket (e.g. "arr[]=1&arr[]=2")
	*   - Mixed arrays of objects, etc.
	*
	* @example
	*   parseQuery("x=xx&y[0]=yy&y[1]=uu&z[f]=x&z[u][0]=uu&z[u][1]=xx&z[d][x]=ee")
	*   => {
	*        x: "xx",
	*        y: ["yy", "uu"],
	*        z: {
	*          f: "x",
	*          u: ["uu", "xx"],
	*          d: { x: "ee" }
	*        }
	*      }
	*
	* @param queryString - The raw query string (e.g. location.search.slice(1))
	* @returns           - A nested object representing the query params
	*/
	function parseQuery(queryString) {
		const result = {};
		if (!queryString) return result;
		const pairs = queryString.replace(/^\?/, "").split("&");
		for (const pair of pairs) {
			const [rawKey, rawVal = ""] = pair.split("=");
			const decodedKey = decodeURIComponent(rawKey);
			const decodedVal = decodeURIComponent(rawVal);
			const pathSegments = parseKey(decodedKey);
			setValue(result, pathSegments, decodedVal);
		}
		return result;
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/reqQuery.js
var require_reqQuery = __commonJS({ "../packages/vovk/cjs/utils/reqQuery.js"(exports) {
	var __importDefault$5 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = reqQuery;
	const parseQuery_1 = __importDefault$5(require_parseQuery());
	function reqQuery(req) {
		return (0, parseQuery_1.default)(req.nextUrl.search);
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/reqMeta.js
var require_reqMeta = __commonJS({ "../packages/vovk/cjs/utils/reqMeta.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = reqMeta;
	const metaMap = /* @__PURE__ */ new WeakMap();
	function reqMeta(req, meta) {
		if (meta) metaMap.set(req, {
			...metaMap.get(req),
			...meta
		});
		else if (meta === null) metaMap.delete(req);
		return metaMap.get(req) ?? {};
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/reqForm.js
var require_reqForm = __commonJS({ "../packages/vovk/cjs/utils/reqForm.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = reqForm;
	const formMap = /* @__PURE__ */ new WeakMap();
	async function reqForm(req) {
		if (formMap.has(req)) return formMap.get(req);
		const body = await req.formData();
		req.formData = () => Promise.resolve(body);
		const formData = {};
		for (const [key, value] of body.entries()) if (value instanceof File) if (formData[key]) if (Array.isArray(formData[key])) formData[key].push(value);
		else formData[key] = [formData[key], value];
		else formData[key] = value;
		else formData[key] = value.toString();
		formMap.set(req, formData);
		return formData;
	}
} });

//#endregion
//#region ../packages/vovk/cjs/VovkApp.js
var require_VovkApp = __commonJS({ "../packages/vovk/cjs/VovkApp.js"(exports) {
	var __importDefault$4 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	var _a$1;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VovkApp = void 0;
	const types_1$10 = require_types();
	const HttpException_1$6 = require_HttpException();
	const JSONLinesResponse_1$1 = require_JSONLinesResponse();
	const reqQuery_1 = __importDefault$4(require_reqQuery());
	const reqMeta_1$1 = __importDefault$4(require_reqMeta());
	const reqForm_1 = __importDefault$4(require_reqForm());
	var VovkApp = class {
		static getHeadersFromOptions(options) {
			if (!options) return {};
			const corsHeaders = {
				"access-control-allow-origin": "*",
				"access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
				"access-control-allow-headers": "content-type, authorization"
			};
			const headers = {
				...options.cors ? corsHeaders : {},
				...options.headers ?? {}
			};
			return headers;
		}
		routes = {
			GET: /* @__PURE__ */ new Map(),
			POST: /* @__PURE__ */ new Map(),
			PUT: /* @__PURE__ */ new Map(),
			PATCH: /* @__PURE__ */ new Map(),
			DELETE: /* @__PURE__ */ new Map(),
			HEAD: /* @__PURE__ */ new Map(),
			OPTIONS: /* @__PURE__ */ new Map()
		};
		GET = async (req, data) => this.#callMethod(types_1$10.HttpMethod.GET, req, await data.params);
		POST = async (req, data) => this.#callMethod(types_1$10.HttpMethod.POST, req, await data.params);
		PUT = async (req, data) => this.#callMethod(types_1$10.HttpMethod.PUT, req, await data.params);
		PATCH = async (req, data) => this.#callMethod(types_1$10.HttpMethod.PATCH, req, await data.params);
		DELETE = async (req, data) => this.#callMethod(types_1$10.HttpMethod.DELETE, req, await data.params);
		HEAD = async (req, data) => this.#callMethod(types_1$10.HttpMethod.HEAD, req, await data.params);
		OPTIONS = async (req, data) => this.#callMethod(types_1$10.HttpMethod.OPTIONS, req, await data.params);
		respond = (status, body, options) => {
			return new Response(JSON.stringify(body), {
				status,
				headers: {
					"content-type": "application/json",
					..._a$1.getHeadersFromOptions(options)
				}
			});
		};
		#respondWithError = (statusCode, message, options, cause) => {
			return this.respond(statusCode, {
				cause,
				statusCode,
				message,
				isError: true
			}, options);
		};
		#getHandler = ({ handlers, path, params }) => {
			let methodParams = {};
			if (Object.keys(params).length === 0) return {
				handler: handlers[""],
				methodParams
			};
			const allMethodKeys = Object.keys(handlers);
			let methodKeys = [];
			const pathStr = path.join("/");
			methodKeys = allMethodKeys.filter((p) => {
				if (p.includes("{")) return false;
				return p === pathStr;
			});
			if (!methodKeys.length) methodKeys = allMethodKeys.filter((p) => {
				const routeSegments = p.split("/");
				if (routeSegments.length !== path.length) return false;
				const params$1 = {};
				for (let i = 0; i < routeSegments.length; i++) {
					const routeSegment = routeSegments[i];
					const pathSegment = path[i];
					if (routeSegment.includes("{")) {
						const regexPattern = routeSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\{(\w+)\\}/g, "(?<$1>[^/]+)");
						const values = pathSegment.match(new RegExp(`^${regexPattern}$`))?.groups ?? {};
						for (const parameter in values) {
							if (!Object.prototype.hasOwnProperty.call(values, parameter)) continue;
							if (parameter in params$1) throw new HttpException_1$6.HttpException(types_1$10.HttpStatus.INTERNAL_SERVER_ERROR, `Duplicate parameter "${parameter}" at ${p}`);
							params$1[parameter] = values[parameter];
						}
					} else if (routeSegment !== pathSegment) return false;
				}
				methodParams = params$1;
				return true;
			});
			if (methodKeys.length > 1) throw new HttpException_1$6.HttpException(types_1$10.HttpStatus.INTERNAL_SERVER_ERROR, `Conflicting routes found: ${methodKeys.join(", ")}`);
			const [methodKey] = methodKeys;
			if (methodKey) return {
				handler: handlers[methodKey],
				methodParams
			};
			return {
				handler: null,
				methodParams
			};
		};
		#callMethod = async (httpMethod, nextReq, params) => {
			const req = nextReq;
			const controllers$2 = this.routes[httpMethod];
			const path = params[Object.keys(params)[0]];
			const handlers = {};
			let headerList;
			try {
				headerList = nextReq.headers;
			} catch {
				headerList = null;
			}
			const xMeta = headerList?.get("x-meta");
			const xMetaHeader = xMeta && JSON.parse(xMeta);
			if (xMetaHeader) (0, reqMeta_1$1.default)(req, { xMetaHeader });
			controllers$2.forEach((staticMethods, controller$1) => {
				const prefix = controller$1._prefix ?? "";
				Object.entries(staticMethods ?? {}).forEach(([path$1, staticMethod$1]) => {
					const fullPath = [prefix, path$1].filter(Boolean).join("/");
					handlers[fullPath] = {
						staticMethod: staticMethod$1,
						controller: controller$1
					};
				});
			});
			const { handler, methodParams } = this.#getHandler({
				handlers,
				path,
				params
			});
			if (!handler) return this.#respondWithError(types_1$10.HttpStatus.NOT_FOUND, `${Object.keys(handlers)} - Route ${path.join("/")} is not found`);
			const { staticMethod, controller } = handler;
			req.vovk = {
				body: () => req.json(),
				query: () => (0, reqQuery_1.default)(req),
				meta: (meta) => (0, reqMeta_1$1.default)(req, meta),
				form: () => (0, reqForm_1.default)(req),
				params: () => methodParams
			};
			try {
				await staticMethod._options?.before?.call(controller, req);
				const result = await staticMethod.call(controller, req, methodParams);
				if (result instanceof Response) return result;
				const isIterator = typeof result === "object" && !!result && !(result instanceof Array) && (Reflect.has(result, Symbol.iterator) && typeof result[Symbol.iterator] === "function" || Reflect.has(result, Symbol.asyncIterator) && typeof result[Symbol.asyncIterator] === "function");
				if (isIterator) {
					const streamResponse = new JSONLinesResponse_1$1.JSONLinesResponse(req, { headers: { ..._a$1.getHeadersFromOptions(staticMethod._options) } });
					(async () => {
						try {
							for await (const chunk of result) streamResponse.send(chunk);
						} catch (e) {
							return streamResponse.throw(e);
						}
						return streamResponse.close();
					})();
					return streamResponse;
				}
				return this.respond(200, result ?? null, staticMethod._options);
			} catch (e) {
				const err = e;
				try {
					await controller._onError?.(err, req);
				} catch (onErrorError) {
					console.error(onErrorError);
				}
				if (err.message !== "NEXT_REDIRECT" && err.message !== "NEXT_NOT_FOUND") {
					const statusCode = err.statusCode || types_1$10.HttpStatus.INTERNAL_SERVER_ERROR;
					return this.#respondWithError(statusCode, err.message, staticMethod._options, err.cause);
				}
				throw e;
			}
		};
	};
	exports.VovkApp = VovkApp;
	_a$1 = VovkApp;
} });

//#endregion
//#region ../packages/vovk/cjs/utils/getSchema.js
var require_getSchema = __commonJS({ "../packages/vovk/cjs/utils/getSchema.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getControllerSchema = getControllerSchema;
	exports.default = getSchema;
	const types_1$9 = require_types();
	async function getControllerSchema(controller, rpcModuleName, exposeValidation) {
		const handlers = exposeValidation ? controller._handlers ?? {} : Object.fromEntries(Object.entries(controller._handlers ?? {}).map(([key, { validation: _v,...value }]) => [key, value]));
		return {
			rpcModuleName,
			originalControllerName: controller.name,
			prefix: controller._prefix ?? "",
			handlers
		};
	}
	async function getSchema(options) {
		const exposeValidation = options?.exposeValidation ?? true;
		const emitSchema$2 = options.emitSchema ?? true;
		const schema$1 = {
			$schema: types_1$9.VovkSchemaIdEnum.SEGMENT,
			emitSchema: emitSchema$2,
			segmentName: options.segmentName ?? "",
			segmentType: "segment",
			controllers: {}
		};
		if (options.forceApiRoot) schema$1.forceApiRoot = options.forceApiRoot;
		if (!emitSchema$2) return schema$1;
		for (const [rpcModuleName, controller] of Object.entries(options.controllers ?? {})) schema$1.controllers[rpcModuleName] = await getControllerSchema(controller, rpcModuleName, exposeValidation);
		return schema$1;
	}
} });

//#endregion
//#region ../packages/vovk/cjs/createVovkApp.js
var require_createVovkApp = __commonJS({ "../packages/vovk/cjs/createVovkApp.js"(exports) {
	var __importDefault$3 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createVovkApp = createVovkApp;
	const VovkApp_1 = require_VovkApp();
	const types_1$8 = require_types();
	const getSchema_1 = __importDefault$3(require_getSchema());
	const trimPath$1 = (path) => path.trim().replace(/^\/|\/$/g, "");
	const isClass = (func) => typeof func === "function" && /class/.test(func.toString());
	const toKebabCase = (str$2) => str$2.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z])(?=[a-z])/g, "$1-$2").toLowerCase().replace(/^-/, "");
	const assignSchema = ({ controller, propertyKey, path, options, httpMethod, vovkApp }) => {
		if (typeof window !== "undefined") throw new Error("HTTP decorators can be used on server-side only. You have probably imported a controller on the client-side.");
		if (!isClass(controller)) {
			let decoratorName = httpMethod.toLowerCase();
			if (decoratorName === "delete") decoratorName = "del";
			throw new Error(`Decorator must be used on a static class method. Check the controller method named "${propertyKey}" used with @${decoratorName}().`);
		}
		const methods = vovkApp.routes[httpMethod].get(controller) ?? {};
		vovkApp.routes[httpMethod].set(controller, methods);
		if (options?.cors) {
			const optionsMethods = vovkApp.routes.OPTIONS.get(controller) ?? {};
			optionsMethods[path] = () => {};
			optionsMethods[path]._options = options;
			vovkApp.routes.OPTIONS.set(controller, optionsMethods);
		}
		const originalMethod = controller[propertyKey];
		originalMethod._controller = controller;
		originalMethod._sourceMethod = originalMethod._sourceMethod ?? originalMethod;
		const schema$1 = originalMethod._sourceMethod._getSchema?.(controller);
		originalMethod.schema = schema$1;
		originalMethod.fn = originalMethod._sourceMethod?.fn;
		originalMethod.models = originalMethod._sourceMethod?.models;
		originalMethod._sourceMethod.wrapper = originalMethod;
		controller._handlers = {
			...controller._handlers,
			[propertyKey]: {
				...schema$1,
				...(controller._handlers ?? {})[propertyKey],
				path,
				httpMethod
			}
		};
		methods[path] = originalMethod;
		methods[path]._options = options;
		controller._handlersMetadata = {
			...controller._handlersMetadata,
			[propertyKey]: {
				...(controller._handlersMetadata ?? {})[propertyKey],
				staticParams: options?.staticParams
			}
		};
	};
	function createVovkApp() {
		const vovkApp = new VovkApp_1.VovkApp();
		function createHTTPDecorator(httpMethod) {
			function decoratorCreator(givenPath = "", options) {
				const path = trimPath$1(givenPath);
				function decorator(givenTarget, propertyKey) {
					const controller = givenTarget;
					assignSchema({
						controller,
						propertyKey,
						path,
						options,
						httpMethod,
						vovkApp
					});
				}
				return decorator;
			}
			const auto = (options) => {
				function decorator(givenTarget, propertyKey) {
					const controller = givenTarget;
					const methods = vovkApp.routes[httpMethod].get(controller) ?? {};
					vovkApp.routes[httpMethod].set(controller, methods);
					controller._handlers = {
						...controller._handlers,
						[propertyKey]: {
							...(controller._handlers ?? {})[propertyKey],
							httpMethod
						}
					};
					const properties = Object.keys(controller._handlers[propertyKey]?.validation?.params?.properties ?? {});
					const kebab = toKebabCase(propertyKey);
					const path = properties.length ? `${kebab}/${properties.map((prop) => `:${prop}`).join("/")}` : kebab;
					assignSchema({
						controller,
						propertyKey,
						path,
						options,
						httpMethod,
						vovkApp
					});
				}
				return decorator;
			};
			const enhancedDecoratorCreator = decoratorCreator;
			enhancedDecoratorCreator.auto = auto;
			return enhancedDecoratorCreator;
		}
		const prefix = (givenPath = "") => {
			const path = trimPath$1(givenPath);
			return (givenTarget) => {
				const controller = givenTarget;
				controller._prefix = path;
				return givenTarget;
			};
		};
		const initSegment = (options) => {
			options.segmentName = trimPath$1(options.segmentName ?? "");
			for (const [rpcModuleName, controller] of Object.entries(options.controllers ?? {})) {
				controller._rpcModuleName = rpcModuleName;
				controller._onError = options?.onError;
			}
			async function GET_DEV(req, data) {
				const params = await data.params;
				if (params[Object.keys(params)[0]]?.[0] === "_schema_") {
					const schema$1 = await (0, getSchema_1.default)(options);
					return vovkApp.respond(200, { schema: schema$1 });
				}
				return vovkApp.GET(req, data);
			}
			return {
				GET: process.env.NODE_ENV === "development" ? GET_DEV : vovkApp.GET,
				POST: vovkApp.POST,
				PUT: vovkApp.PUT,
				PATCH: vovkApp.PATCH,
				DELETE: vovkApp.DELETE,
				HEAD: vovkApp.HEAD,
				OPTIONS: vovkApp.OPTIONS
			};
		};
		return {
			get: createHTTPDecorator(types_1$8.HttpMethod.GET),
			post: createHTTPDecorator(types_1$8.HttpMethod.POST),
			put: createHTTPDecorator(types_1$8.HttpMethod.PUT),
			patch: createHTTPDecorator(types_1$8.HttpMethod.PATCH),
			del: createHTTPDecorator(types_1$8.HttpMethod.DELETE),
			head: createHTTPDecorator(types_1$8.HttpMethod.HEAD),
			options: createHTTPDecorator(types_1$8.HttpMethod.OPTIONS),
			prefix,
			initSegment
		};
	}
} });

//#endregion
//#region ../packages/vovk/cjs/client/fetcher.js
var require_fetcher = __commonJS({ "../packages/vovk/cjs/client/fetcher.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fetcher = exports.DEFAULT_ERROR_MESSAGE = void 0;
	exports.createFetcher = createFetcher;
	const types_1$7 = require_types();
	const HttpException_1$5 = require_HttpException();
	exports.DEFAULT_ERROR_MESSAGE = "Unknown error at default fetcher";
	function createFetcher({ prepareRequestInit, transformResponse, onSuccess, onError } = {}) {
		const newFetcher = async ({ httpMethod, getEndpoint, validate: validate$1, defaultHandler: defaultHandler$2, defaultStreamHandler: defaultStreamHandler$2, schema: schema$1 }, inputOptions) => {
			let response = null;
			let respData = null;
			let requestInit = null;
			try {
				const { meta, apiRoot, disableClientValidation, init, interpretAs } = inputOptions;
				let { body, query, params } = inputOptions;
				const endpoint = getEndpoint({
					apiRoot,
					params,
					query
				});
				const unusedParams = Array.from(new URL(endpoint.startsWith("/") ? `http://localhost${endpoint}` : endpoint).pathname.matchAll(/\{([^}]+)\}/g)).map((m) => m[1]);
				if (unusedParams.length) throw new HttpException_1$5.HttpException(types_1$7.HttpStatus.NULL, `Unused params: ${unusedParams.join(", ")} in ${endpoint}`, {
					body,
					query,
					params,
					endpoint
				});
				if (!disableClientValidation) try {
					({body, query, params} = await validate$1(inputOptions, { endpoint }) ?? {
						body,
						query,
						params
					});
				} catch (e) {
					if (e instanceof HttpException_1$5.HttpException) throw e;
					throw new HttpException_1$5.HttpException(types_1$7.HttpStatus.NULL, e.message ?? exports.DEFAULT_ERROR_MESSAGE, {
						body,
						query,
						params,
						endpoint
					});
				}
				requestInit = {
					method: httpMethod,
					...init,
					headers: {
						accept: "application/jsonl, application/json",
						...body instanceof FormData ? {} : { "content-type": "application/json" },
						...meta ? { "x-meta": JSON.stringify(meta) } : {},
						...init?.headers
					}
				};
				if (body instanceof FormData) requestInit.body = body;
				else if (body) requestInit.body = JSON.stringify(body);
				const controller = new AbortController();
				requestInit.signal = controller.signal;
				requestInit = prepareRequestInit ? await prepareRequestInit(requestInit, inputOptions) : requestInit;
				try {
					response = await fetch(endpoint, requestInit);
				} catch (e) {
					throw new HttpException_1$5.HttpException(types_1$7.HttpStatus.NULL, (e?.message ?? exports.DEFAULT_ERROR_MESSAGE) + " " + endpoint, {
						body,
						query,
						params,
						endpoint
					});
				}
				const contentType = interpretAs ?? response.headers.get("content-type");
				if (contentType?.startsWith("application/jsonl")) respData = defaultStreamHandler$2({
					response,
					controller,
					schema: schema$1
				});
				else if (contentType?.startsWith("application/json")) respData = defaultHandler$2({
					response,
					schema: schema$1
				});
				else respData = response;
				respData = await respData;
				respData = transformResponse ? await transformResponse(respData, inputOptions, response, requestInit) : respData;
				await onSuccess?.(respData, inputOptions, response, requestInit);
				return [respData, response];
			} catch (error$41) {
				await onError?.(error$41, inputOptions, response, requestInit, respData);
				throw error$41;
			}
		};
		return newFetcher;
	}
	exports.fetcher = createFetcher();
} });

//#endregion
//#region ../packages/vovk/cjs/client/defaultHandler.js
var require_defaultHandler = __commonJS({ "../packages/vovk/cjs/client/defaultHandler.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultHandler = exports.DEFAULT_ERROR_MESSAGE = void 0;
	const HttpException_1$4 = require_HttpException();
	exports.DEFAULT_ERROR_MESSAGE = "Unknown error at defaultHandler";
	const getNestedValue = (obj, path) => {
		return path.split(".").reduce((o, key) => o && typeof o === "object" ? o[key] : void 0, obj);
	};
	const defaultHandler = async ({ response, schema: schema$1 }) => {
		let result;
		try {
			result = await response.json();
		} catch (e) {
			throw new HttpException_1$4.HttpException(response.status, e?.message ?? exports.DEFAULT_ERROR_MESSAGE);
		}
		if (!response.ok) {
			const errorKey = schema$1.openapi && "x-errorMessageKey" in schema$1.openapi ? schema$1.openapi["x-errorMessageKey"] : "message";
			const errorResponse = result;
			throw new HttpException_1$4.HttpException(response.status, getNestedValue(errorResponse, errorKey) ?? exports.DEFAULT_ERROR_MESSAGE, errorResponse?.cause ?? JSON.stringify(result));
		}
		return result;
	};
	exports.defaultHandler = defaultHandler;
} });

//#endregion
//#region ../packages/vovk/cjs/client/defaultStreamHandler.js
var require_defaultStreamHandler = __commonJS({ "../packages/vovk/cjs/client/defaultStreamHandler.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultStreamHandler = exports.DEFAULT_ERROR_MESSAGE = void 0;
	const types_1$6 = require_types();
	const HttpException_1$3 = require_HttpException();
	require_shim();
	exports.DEFAULT_ERROR_MESSAGE = "Unknown error at defaultStreamHandler";
	const defaultStreamHandler = async ({ response, controller }) => {
		if (!response.ok) {
			let result;
			try {
				result = await response.json();
			} catch {}
			throw new HttpException_1$3.HttpException(response.status, result.message ?? exports.DEFAULT_ERROR_MESSAGE);
		}
		if (!response.body) throw new HttpException_1$3.HttpException(types_1$6.HttpStatus.NULL, "Stream body is falsy. Check your controller code.");
		const reader = response.body.getReader();
		let canceled = false;
		const subscribers = /* @__PURE__ */ new Set();
		async function* asyncIterator() {
			let prepend = "";
			let i = 0;
			while (true) {
				let value;
				try {
					let done;
					if (canceled) break;
					({value, done} = await reader.read());
					if (done) break;
				} catch (error$41) {
					const err = new Error("JSONLines stream error. " + String(error$41));
					err.cause = error$41;
					throw err;
				}
				const string = typeof value === "number" ? String.fromCharCode(value) : new TextDecoder().decode(value);
				prepend += string;
				const lines = prepend.split("\n").filter(Boolean);
				for (const line$2 of lines) {
					let data;
					try {
						data = JSON.parse(line$2);
						prepend = prepend.slice(line$2.length + 1);
					} catch {
						break;
					}
					if (data) {
						subscribers.forEach((cb) => {
							if (!canceled) cb(data, i);
						});
						i++;
						if ("isError" in data && "reason" in data) {
							const upcomingError = data.reason;
							canceled = true;
							controller.abort(data.reason);
							if (typeof upcomingError === "string") throw new Error(upcomingError);
							controller.abort("Stream disposed");
							throw upcomingError;
						} else if (!canceled) yield data;
					}
				}
			}
		}
		return {
			status: response.status,
			[Symbol.asyncIterator]: asyncIterator,
			[Symbol.dispose]: () => {
				canceled = true;
				controller.abort("Stream disposed");
			},
			[Symbol.asyncDispose]: () => {
				canceled = true;
				controller.abort("Stream async disposed");
			},
			onIterate: (cb) => {
				if (canceled) return () => {};
				subscribers.add(cb);
				return () => {
					subscribers.delete(cb);
				};
			},
			cancel: (reason) => {
				canceled = true;
				return controller.abort(reason ?? "Stream aborted intentionally");
			}
		};
	};
	exports.defaultStreamHandler = defaultStreamHandler;
} });

//#endregion
//#region ../packages/vovk/cjs/utils/serializeQuery.js
var require_serializeQuery = __commonJS({ "../packages/vovk/cjs/utils/serializeQuery.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = serializeQuery;
	/**
	* Recursively build query parameters from an object.
	*
	* @param key      - The query key so far (e.g. 'user', 'user[0]', 'user[0][name]')
	* @param value    - The current value to serialize
	* @returns        - An array of `key=value` strings
	*/
	function buildParams(key, value) {
		if (value === null || value === void 0) return [];
		if (typeof value === "object") {
			if (Array.isArray(value))
 /**
			* We use index-based bracket notation here:
			*   e.g. for value = ['aa', 'bb'] and key = 'foo'
			*   => "foo[0]=aa&foo[1]=bb"
			*
			* If you prefer "foo[]=aa&foo[]=bb" style, replace:
			*   `${key}[${i}]`
			* with:
			*   `${key}[]`
			*/
			return value.flatMap((v, i) => {
				const newKey = `${key}[${i}]`;
				return buildParams(newKey, v);
			});
			return Object.keys(value).flatMap((k) => {
				const newKey = `${key}[${k}]`;
				return buildParams(newKey, value[k]);
			});
		}
		return [`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`];
	}
	/**
	* Serialize a nested object (including arrays, arrays of objects, etc.)
	* into a bracket-based query string.
	*
	* @example
	*   serializeQuery({ x: 'xx', y: [1, 2], z: { f: 'x' } })
	*   => "x=xx&y[0]=1&y[1]=2&z[f]=x"
	*
	* @param obj - The input object to be serialized
	* @returns   - A bracket-based query string (without leading "?")
	*/
	function serializeQuery(obj) {
		if (!obj || typeof obj !== "object") return "";
		const segments$1 = [];
		for (const key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const value = obj[key];
			segments$1.push(...buildParams(key, value));
		}
		return segments$1.join("&");
	}
} });

//#endregion
//#region ../packages/vovk/cjs/client/createRPC.js
var require_createRPC = __commonJS({ "../packages/vovk/cjs/client/createRPC.js"(exports) {
	var __importDefault$2 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createRPC = void 0;
	const fetcher_1$1 = require_fetcher();
	const defaultHandler_1 = require_defaultHandler();
	const defaultStreamHandler_1 = require_defaultStreamHandler();
	const serializeQuery_1 = __importDefault$2(require_serializeQuery());
	const trimPath = (path) => path.trim().replace(/^\/|\/$/g, "");
	const getHandlerPath = (endpoint, params, query) => {
		let result = endpoint;
		const queryStr = query ? (0, serializeQuery_1.default)(query) : null;
		for (const [key, value] of Object.entries(params ?? {})) result = result.replace(`{${key}}`, value);
		return `${result}${queryStr ? "?" : ""}${queryStr}`;
	};
	const createRPC$1 = (schema$1, segmentName$2, rpcModuleName, fetcher$1, options) => {
		fetcher$1 ??= fetcher_1$1.fetcher;
		const segmentNamePath = options?.segmentNameOverride ?? segmentName$2;
		const segmentSchema = schema$1.segments[segmentName$2];
		if (!segmentSchema) throw new Error(`Unable to create RPC module. Segment schema is missing for segment "${segmentName$2}".`);
		const controllerSchema = schema$1.segments[segmentName$2]?.controllers[rpcModuleName];
		const client = {};
		if (!controllerSchema) throw new Error(`Unable to create RPC module. Controller schema is missing for module "${rpcModuleName}" from segment "${segmentName$2}".`);
		const controllerPrefix = trimPath(controllerSchema.prefix ?? "");
		for (const [staticMethodName, handlerSchema] of Object.entries(controllerSchema.handlers ?? {})) {
			const { path, httpMethod, validation: validation$3 } = handlerSchema;
			const getEndpoint = ({ apiRoot, params, query }) => {
				const forceApiRoot = controllerSchema.forceApiRoot ?? segmentSchema.forceApiRoot;
				apiRoot = apiRoot ?? forceApiRoot ?? options?.apiRoot ?? "/api";
				const endpoint = [
					apiRoot.startsWith("http://") || apiRoot.startsWith("https://") || apiRoot.startsWith("/") ? "" : "/",
					apiRoot,
					forceApiRoot ? "" : segmentNamePath,
					getHandlerPath([controllerPrefix, path].filter(Boolean).join("/"), params, query)
				].filter(Boolean).join("/").replace(/([^:])\/+/g, "$1/");
				return endpoint;
			};
			const handler = async (input = {}) => {
				const validate$1 = async (validationInput, { endpoint }) => {
					const validateOnClient$1 = input.validateOnClient ?? options?.validateOnClient;
					if (validateOnClient$1 && validation$3) {
						if (typeof validateOnClient$1 !== "function") throw new Error("validateOnClient must be a function");
						return await validateOnClient$1({ ...validationInput }, validation$3, {
							fullSchema: schema$1,
							endpoint
						}) ?? validationInput;
					}
					return validationInput;
				};
				const internalOptions = {
					name: staticMethodName,
					httpMethod,
					getEndpoint,
					validate: validate$1,
					defaultHandler: defaultHandler_1.defaultHandler,
					defaultStreamHandler: defaultStreamHandler_1.defaultStreamHandler,
					schema: handlerSchema
				};
				const internalInput = {
					...options,
					...input,
					body: input.body ?? null,
					query: input.query ?? {},
					params: input.params ?? {}
				};
				if (!fetcher$1) throw new Error("Fetcher is not provided");
				const [respData, resp] = await fetcher$1(internalOptions, internalInput);
				return input.transform ? input.transform(respData, resp) : respData;
			};
			handler.schema = handlerSchema;
			handler.controllerSchema = controllerSchema;
			handler.segmentSchema = segmentSchema;
			handler.fullSchema = schema$1;
			handler.isRPC = true;
			handler.path = [
				segmentNamePath,
				controllerPrefix,
				path
			].filter(Boolean).join("/");
			handler.queryKey = (key) => [
				handler.segmentSchema.segmentName,
				handler.controllerSchema.prefix ?? "",
				handler.controllerSchema.rpcModuleName,
				handler.schema.path,
				handler.schema.httpMethod,
				...key ?? []
			];
			client[staticMethodName] = handler;
		}
		return client;
	};
	exports.createRPC = createRPC$1;
} });

//#endregion
//#region ../packages/vovk/cjs/client/progressive.js
var require_progressive = __commonJS({ "../packages/vovk/cjs/client/progressive.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.progressive = progressive;
	function progressive(fn, ...args) {
		const [arg] = args;
		const reg = {};
		fn(arg).then(async (result) => {
			for await (const item of result) for (const [key, value] of Object.entries(item)) if (key in reg) {
				if (!reg[key].isSettled) {
					reg[key].isSettled = true;
					reg[key].resolve(value);
				}
			} else {
				const { promise, resolve: resolve$3, reject } = Promise.withResolvers();
				reg[key] = {
					resolve: resolve$3,
					reject,
					promise,
					isSettled: true
				};
				reg[key].resolve(value);
			}
			Object.keys(reg).forEach((key) => {
				if (reg[key].isSettled) return;
				reg[key].isSettled = true;
				reg[key].reject(new Error(`The connection was closed without sending a value for "${key}"`));
			});
			return result;
		}).catch((error$41) => {
			Object.keys(reg).forEach((key) => {
				if (reg[key].isSettled) return;
				reg[key].isSettled = true;
				reg[key].reject(error$41);
			});
			return error$41;
		});
		return new Proxy({}, {
			get(_target, prop) {
				if (prop in reg) return reg[prop].promise;
				const { promise, resolve: resolve$3, reject } = Promise.withResolvers();
				reg[prop] = {
					resolve: resolve$3,
					reject,
					promise,
					isSettled: false
				};
				return promise;
			},
			ownKeys: () => {
				throw new Error("Getting own keys is not possible as they are dynamically created");
			}
		});
	}
} });

//#endregion
//#region ../packages/vovk/cjs/client/index.js
var require_client = __commonJS({ "../packages/vovk/cjs/client/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.progressive = exports.createFetcher = exports.fetcher = exports.createRPC = void 0;
	var createRPC_1 = require_createRPC();
	Object.defineProperty(exports, "createRPC", {
		enumerable: true,
		get: function() {
			return createRPC_1.createRPC;
		}
	});
	var fetcher_1 = require_fetcher();
	Object.defineProperty(exports, "fetcher", {
		enumerable: true,
		get: function() {
			return fetcher_1.fetcher;
		}
	});
	Object.defineProperty(exports, "createFetcher", {
		enumerable: true,
		get: function() {
			return fetcher_1.createFetcher;
		}
	});
	var progressive_1 = require_progressive();
	Object.defineProperty(exports, "progressive", {
		enumerable: true,
		get: function() {
			return progressive_1.progressive;
		}
	});
} });

//#endregion
//#region ../packages/vovk/cjs/utils/getJSONSchemaExample.js
var require_getJSONSchemaExample = __commonJS({ "../packages/vovk/cjs/utils/getJSONSchemaExample.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getJSONSchemaExample = getJSONSchemaExample;
	exports.getSampleValue = getSampleValue;
	function getJSONSchemaExample(schema$1, options, rootSchema) {
		const { comment = "//", stripQuotes = false, indent = 0, nestingIndent = 4, ignoreBinary = false } = options;
		if (!schema$1 || typeof schema$1 !== "object") return "null";
		rootSchema = rootSchema || schema$1;
		const sampleValue = getSampleValue(schema$1, rootSchema, ignoreBinary);
		return formatWithDescriptions(sampleValue, schema$1, rootSchema, comment, stripQuotes, indent, nestingIndent, ignoreBinary);
	}
	function getSampleValue(schema$1, rootSchema, ignoreBinary) {
		if (!schema$1 || typeof schema$1 !== "object") return null;
		rootSchema = rootSchema || schema$1;
		if (ignoreBinary && schema$1.type === "string" && schema$1.format === "binary") return void 0;
		if (schema$1.example !== void 0) return schema$1.example;
		if (schema$1.examples && schema$1.examples.length > 0) return schema$1.examples[0];
		if (schema$1.const !== void 0) return schema$1.const;
		if (schema$1.$ref) return handleRef$1(schema$1.$ref, rootSchema, ignoreBinary);
		if (schema$1.enum && schema$1.enum.length > 0) return schema$1.enum[0];
		if (schema$1.oneOf && schema$1.oneOf.length > 0) return getSampleValue(schema$1.oneOf[0], rootSchema, ignoreBinary);
		if (schema$1.anyOf && schema$1.anyOf.length > 0) return getSampleValue(schema$1.anyOf[0], rootSchema, ignoreBinary);
		if (schema$1.allOf && schema$1.allOf.length > 0) {
			const mergedSchema = schema$1.allOf.reduce((acc, s) => ({
				...acc,
				...s
			}), {});
			return getSampleValue(mergedSchema, rootSchema, ignoreBinary);
		}
		if (schema$1.type) switch (schema$1.type) {
			case "string": return handleString$1(schema$1);
			case "number":
			case "integer": return handleNumber$1(schema$1);
			case "boolean": return handleBoolean$1();
			case "object": return handleObject$1(schema$1, rootSchema, ignoreBinary);
			case "array": return handleArray$1(schema$1, rootSchema, ignoreBinary);
			case "null": return null;
			default: return null;
		}
		if (schema$1.properties) return handleObject$1(schema$1, rootSchema, ignoreBinary);
		return null;
	}
	function formatWithDescriptions(value, schema$1, rootSchema, comment, stripQuotes, indent, nestingIndent, ignoreBinary) {
		const indentStr = " ".repeat(indent);
		const nestIndentStr = " ".repeat(nestingIndent);
		if (value === void 0) return "";
		if (value === null) return "null";
		if (typeof value !== "object" || value instanceof Date) return JSON.stringify(value);
		if (Array.isArray(value)) {
			if (value.length === 0) return "[]";
			const items = value.map((item) => {
				const itemSchema = schema$1.items || {};
				const formattedItem = formatWithDescriptions(item, itemSchema, rootSchema, comment, stripQuotes, indent + nestingIndent, nestingIndent, ignoreBinary);
				return `${indentStr}${nestIndentStr}${formattedItem}`;
			});
			return `[\n${items.join(",\n")}\n${indentStr}]`;
		}
		if (typeof value === "object") {
			const entries = Object.entries(value);
			if (entries.length === 0) return "{}";
			const formattedEntries = [];
			const isTopLevel = indent === 0;
			if (isTopLevel && schema$1.type === "object" && schema$1.description) {
				const descLines = schema$1.description.split("\n");
				formattedEntries.push(`${indentStr}${nestIndentStr}${comment} -----`);
				descLines.forEach((line$2) => {
					formattedEntries.push(`${indentStr}${nestIndentStr}${comment} ${line$2.trim()}`);
				});
				formattedEntries.push(`${indentStr}${nestIndentStr}${comment} -----`);
			}
			entries.forEach(([key, val], index) => {
				const propSchema = schema$1.properties?.[key] ?? {};
				let resolvedPropSchema = propSchema;
				if (propSchema.$ref) resolvedPropSchema = resolveRef$1(propSchema.$ref, rootSchema);
				if (resolvedPropSchema.description) {
					const descLines = resolvedPropSchema.description.split("\n");
					descLines.forEach((line$2) => {
						formattedEntries.push(`${indentStr}${nestIndentStr}${comment} ${line$2.trim()}`);
					});
				}
				const formattedKey = stripQuotes && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(key) ? key : JSON.stringify(key);
				const formattedValue = formatWithDescriptions(val, resolvedPropSchema, rootSchema, comment, stripQuotes, indent + nestingIndent, nestingIndent, ignoreBinary);
				formattedEntries.push(`${indentStr}${nestIndentStr}${formattedKey}: ${formattedValue}${index < entries.length - 1 ? "," : ""}`);
			});
			return `{\n${formattedEntries.join("\n")}\n${indentStr}}`;
		}
		return JSON.stringify(value);
	}
	function resolveRef$1(ref, rootSchema) {
		const path = ref.split("/").slice(1);
		let current = rootSchema;
		for (const segment of path) {
			current = current[segment];
			if (current === void 0) return {};
		}
		return current;
	}
	function handleRef$1(ref, rootSchema, ignoreBinary) {
		const resolved = resolveRef$1(ref, rootSchema);
		return getSampleValue(resolved, rootSchema, ignoreBinary);
	}
	function handleString$1(schema$1) {
		if (schema$1.format) switch (schema$1.format) {
			case "email":
			case "idn-email": return "user@example.com";
			case "uri":
			case "url":
			case "iri": return "https://example.com";
			case "date": return "2023-01-01";
			case "date-time": return "2023-01-01T00:00:00Z";
			case "time": return "12:00:00Z";
			case "duration": return "PT1H";
			case "uuid": return "00000000-0000-0000-0000-000000000000";
			case "regex": return "^[a-zA-Z0-9]+$";
			case "relative-json-pointer": return "/some/relative/path";
			case "color": return "#000000";
			case "hostname": return "example.com";
			case "zipcode": return "12345";
			case "phone": return "+123-456-7890";
			case "password": return "******";
			case "binary": return "binary-data";
			default: return "string";
		}
		if (schema$1.pattern) return "pattern-string";
		return "string";
	}
	function handleNumber$1(schema$1) {
		if (schema$1.minimum !== void 0 && schema$1.maximum !== void 0) return schema$1.minimum;
		else if (schema$1.minimum !== void 0) return schema$1.minimum;
		else if (schema$1.maximum !== void 0) return schema$1.maximum;
		return 0;
	}
	function handleBoolean$1() {
		return true;
	}
	function handleObject$1(schema$1, rootSchema, ignoreBinary) {
		const result = {};
		if (schema$1.properties) {
			const required = schema$1.required || [];
			for (const [key, propSchema] of Object.entries(schema$1.properties)) if (required.includes(key) || required.length === 0) {
				const value = getSampleValue(propSchema, rootSchema, ignoreBinary);
				if (value !== void 0) result[key] = value;
			}
		}
		if (schema$1.additionalProperties && typeof schema$1.additionalProperties === "object") {
			const value = getSampleValue(schema$1.additionalProperties, rootSchema, ignoreBinary);
			if (value !== void 0) result["additionalProp"] = value;
		}
		return result;
	}
	function handleArray$1(schema$1, rootSchema, ignoreBinary) {
		if (schema$1.items) {
			const itemSchema = schema$1.items;
			if (ignoreBinary && itemSchema.type === "string" && itemSchema.format === "binary") return void 0;
			const minItems = schema$1.minItems || 1;
			const numItems = Math.min(minItems, 3);
			const items = Array.from({ length: numItems }, () => getSampleValue(itemSchema, rootSchema, ignoreBinary)).filter((item) => item !== void 0);
			if (items.length === 0 && numItems > 0) return void 0;
			return items;
		}
		return [];
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/createCodeExamples.js
var require_createCodeExamples = __commonJS({ "../packages/vovk/cjs/utils/createCodeExamples.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createCodeExamples = createCodeExamples;
	const getJSONSchemaExample_1 = require_getJSONSchemaExample();
	const toSnakeCase = (str$2) => str$2.replace(/-/g, "_").replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/([A-Z])([A-Z])(?=[a-z])/g, "$1_$2").toLowerCase().replace(/^_/, "");
	const getIndentSpaces = (level) => " ".repeat(level);
	function isTextFormat(mimeType) {
		if (!mimeType) return false;
		return mimeType.startsWith("text/") || [
			"application/json",
			"application/ld+json",
			"application/xml",
			"application/xhtml+xml",
			"application/javascript",
			"application/typescript",
			"application/yaml",
			"application/x-yaml",
			"application/toml",
			"application/sql",
			"application/graphql",
			"application/x-www-form-urlencoded"
		].includes(mimeType) || mimeType.endsWith("+json") || mimeType.endsWith("+xml");
	}
	function generateTypeScriptCode({ handlerName, rpcName, packageName, queryValidation, bodyValidation, paramsValidation, outputValidation, iterationValidation, hasArg }) {
		const getTsSample = (schema$1, indent) => (0, getJSONSchemaExample_1.getJSONSchemaExample)(schema$1, {
			stripQuotes: true,
			indent: indent ?? 4
		});
		const getTsFormSample = (schema$1) => {
			let formSample = "\nconst formData = new FormData();";
			for (const [key, prop] of Object.entries(schema$1.properties || {})) {
				const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
				const desc = target.description ?? prop.description ?? void 0;
				if (target.type === "array" && target.items) {
					formSample += getTsFormAppend(target.items, key, desc);
					formSample += getTsFormAppend(target.items, key, desc);
				} else formSample += getTsFormAppend(target, key, desc);
			}
			return formSample;
		};
		const getTsFormAppend = (schema$1, key, description) => {
			let sampleValue;
			if (schema$1.type === "string" && schema$1.format === "binary") sampleValue = `new Blob(${isTextFormat(schema$1.contentMediaType) ? "[\"text_content\"]" : "[binary_data]"}${schema$1.contentMediaType ? `, { type: "${schema$1.contentMediaType}" }` : ""})`;
			else if (schema$1.type === "object") sampleValue = "\"object_unknown\"";
			else sampleValue = `"${(0, getJSONSchemaExample_1.getSampleValue)(schema$1)}"`;
			const desc = schema$1.description ?? description;
			return `\n${desc ? `// ${desc}\n` : ""}formData.append("${key}", ${sampleValue});`;
		};
		const tsArgs = hasArg ? `{
${[
			bodyValidation ? `    body: ${bodyValidation["x-isForm"] ? "formData" : getTsSample(bodyValidation)},` : null,
			queryValidation ? `    query: ${getTsSample(queryValidation)},` : null,
			paramsValidation ? `    params: ${getTsSample(paramsValidation)},` : null
		].filter(Boolean).join("\n")}
}` : "";
		const TS_CODE = `import { ${rpcName} } from '${packageName}';
${bodyValidation?.["x-isForm"] ? getTsFormSample(bodyValidation) + "\n" : ""}
${iterationValidation ? "using" : "const"} response = await ${rpcName}.${handlerName}(${tsArgs});
${outputValidation ? `
console.log(response); 
/* 
${getTsSample(outputValidation, 0)}
*/` : ""}${iterationValidation ? `
for await (const item of response) {
    console.log(item); 
    /*
    ${getTsSample(iterationValidation)}
    */
}` : ""}`;
		return TS_CODE.trim();
	}
	function generatePythonCode({ handlerName, rpcName, packageName, queryValidation, bodyValidation, paramsValidation, outputValidation, iterationValidation, hasArg }) {
		const getPySample = (schema$1, indent) => (0, getJSONSchemaExample_1.getJSONSchemaExample)(schema$1, {
			stripQuotes: false,
			indent: indent ?? 4,
			comment: "#",
			ignoreBinary: true,
			nestingIndent: 4
		});
		const handlerNameSnake = toSnakeCase(handlerName);
		const getFileTouple = (schema$1) => {
			return `('name.ext', BytesIO(${isTextFormat(schema$1.contentMediaType) ? "\"text_content\".encode(\"utf-8\")" : "binary_data"})${schema$1.contentMediaType ? `, "${schema$1.contentMediaType}"` : ""})`;
		};
		const getPyFiles = (schema$1) => {
			return Object.entries(schema$1.properties ?? {}).reduce((acc, [key, prop]) => {
				const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
				const desc = target.description ?? prop.description ?? void 0;
				if (target.type === "string" && target.format === "binary") acc.push(`${desc ? `${getIndentSpaces(8)}# ${desc}\n` : ""}${getIndentSpaces(8)}('${key}', ${getFileTouple(target)})`);
				else if (target.type === "array" && target.items?.format === "binary") {
					const val = `${desc ? `${getIndentSpaces(8)}# ${desc}\n` : ""}${getIndentSpaces(8)}('${key}', ${getFileTouple(target.items)})`;
					acc.push(val, val);
				}
				return acc;
			}, []);
		};
		const pyFiles = bodyValidation ? getPyFiles(bodyValidation) : null;
		const pyFilesArg = pyFiles?.length ? `${getIndentSpaces(4)}files=[\n${pyFiles.join(",\n")}\n${getIndentSpaces(4)}],` : null;
		const PY_CODE = `from ${packageName} import ${rpcName}
${bodyValidation?.["x-isForm"] ? "from io import BytesIO\n" : ""}
response = ${rpcName}.${handlerNameSnake}(${hasArg ? "\n" + [
			bodyValidation ? `    body=${getPySample(bodyValidation)},` : null,
			pyFilesArg,
			queryValidation ? `    query=${getPySample(queryValidation)},` : null,
			paramsValidation ? `    params=${getPySample(paramsValidation)},` : null
		].filter(Boolean).join("\n") + "\n" : ""})

${outputValidation ? `print(response)\n${getPySample(outputValidation, 0)}` : ""}${iterationValidation ? `for i, item in enumerate(response):
    print(f"iteration #{i}:\\n {item}")
    # iteration #0:
    ${getPySample(iterationValidation)}` : ""}`;
		return PY_CODE.trim();
	}
	function generateRustCode({ handlerName, rpcName, packageName, queryValidation, bodyValidation, paramsValidation, outputValidation, iterationValidation }) {
		const getRsJSONSample = (schema$1, indent) => (0, getJSONSchemaExample_1.getJSONSchemaExample)(schema$1, {
			stripQuotes: false,
			indent: indent ?? 4
		});
		const getRsOutputSample = (schema$1, indent) => (0, getJSONSchemaExample_1.getJSONSchemaExample)(schema$1, {
			stripQuotes: true,
			indent: indent ?? 4
		});
		const getRsFormSample = (schema$1) => {
			let formSample = "let form = multipart::Form::new()";
			for (const [key, prop] of Object.entries(schema$1.properties || {})) {
				const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
				const desc = target.description ?? prop.description ?? void 0;
				if (target.type === "array" && target.items) {
					formSample += getRsFormPart(target.items, key, desc);
					formSample += getRsFormPart(target.items, key, desc);
				} else formSample += getRsFormPart(target, key, desc);
			}
			return formSample;
		};
		const getRsFormPart = (schema$1, key, description) => {
			let sampleValue;
			if (schema$1.type === "string" && schema$1.format === "binary") {
				sampleValue = isTextFormat(schema$1.contentMediaType) ? "multipart::Part::text(\"text_content\")" : "multipart::Part::bytes(binary_data)";
				if (schema$1.contentMediaType) sampleValue += `.mime_str("${schema$1.contentMediaType}").unwrap()`;
			} else if (schema$1.type === "object") sampleValue = "\"object_unknown\"";
			else sampleValue = `"${(0, getJSONSchemaExample_1.getSampleValue)(schema$1)}"`;
			const desc = schema$1.description ?? description;
			return `\n${getIndentSpaces(4)}${desc ? `// ${desc}\n` : ""}${getIndentSpaces(4)}.part("${key}", ${sampleValue});`;
		};
		const getBody = (schema$1) => {
			if (schema$1["x-isForm"]) return "form";
			return serdeUnwrap(getRsJSONSample(schema$1));
		};
		const handlerNameSnake = toSnakeCase(handlerName);
		const rpcNameSnake = toSnakeCase(rpcName);
		const serdeUnwrap = (fake) => `from_value(json!(${fake})).unwrap()`;
		const RS_CODE = `use ${packageName}::${rpcNameSnake};
use serde_json::{ 
  from_value, 
  json 
};
${bodyValidation?.["x-isForm"] ? `use multipart;` : ""}

pub fn main() {${bodyValidation?.["x-isForm"] ? "\n  " + getRsFormSample(bodyValidation) + "\n" : ""}
  let response = ${rpcNameSnake}::${handlerNameSnake}(
    ${bodyValidation ? getBody(bodyValidation) : "()"}, /* body */ 
    ${queryValidation ? serdeUnwrap(getRsJSONSample(queryValidation)) : "()"}, /* query */ 
    ${paramsValidation ? serdeUnwrap(getRsJSONSample(paramsValidation)) : "()"}, /* params */ 
    None, /* headers (HashMap) */ 
    None, /* api_root */ 
    false, /* disable_client_validation */
  );${outputValidation ? `\n\nmatch response {
    Ok(output) => println!("{:?}", output),
    /* 
    output ${getRsOutputSample(outputValidation)} 
    */
    Err(e) => println!("error: {:?}", e),
  }` : ""}${iterationValidation ? `\n\nmatch response {
    Ok(stream) => {
      for (i, item) in stream.enumerate() {
        println!("#{}: {:?}", i, item);
        /*
        #0: iteration ${getRsOutputSample(iterationValidation, 8)}
        */
      }
    },
    Err(e) => println!("Error initiating stream: {:?}", e),
  }` : ""}
}`;
		return RS_CODE.trim();
	}
	function createCodeExamples({ handlerName, handlerSchema, controllerSchema, package: packageJson }) {
		const queryValidation = handlerSchema?.validation?.query;
		const bodyValidation = handlerSchema?.validation?.body;
		const paramsValidation = handlerSchema?.validation?.params;
		const outputValidation = handlerSchema?.validation?.output;
		const iterationValidation = handlerSchema?.validation?.iteration;
		const hasArg = !!queryValidation || !!bodyValidation || !!paramsValidation;
		const rpcName = controllerSchema.rpcModuleName;
		const packageName = packageJson?.name || "vovk-client";
		const packageNameSnake = toSnakeCase(packageName);
		const pyPackageName = packageJson?.py_name ?? packageNameSnake;
		const rsPackageName = packageJson?.rs_name ?? packageNameSnake;
		const commonParams = {
			handlerName,
			rpcName,
			packageName,
			queryValidation,
			bodyValidation,
			paramsValidation,
			outputValidation,
			iterationValidation,
			hasArg
		};
		const ts = generateTypeScriptCode(commonParams);
		const py = generatePythonCode({
			...commonParams,
			packageName: pyPackageName
		});
		const rs = generateRustCode({
			...commonParams,
			packageName: rsPackageName
		});
		return {
			ts,
			py,
			rs
		};
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/getJSONSchemaSample.js
var require_getJSONSchemaSample = __commonJS({ "../packages/vovk/cjs/utils/getJSONSchemaSample.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getJSONSchemaSample = getJSONSchemaSample;
	function getJSONSchemaSample(schema$1, rootSchema) {
		if (!schema$1 || typeof schema$1 !== "object") return null;
		rootSchema = rootSchema || schema$1;
		if (schema$1.example !== void 0) return schema$1.example;
		if (schema$1.examples && schema$1.examples.length > 0) return schema$1.examples[0];
		if (schema$1.const !== void 0) return schema$1.const;
		if (schema$1.$ref) return handleRef(schema$1.$ref, rootSchema);
		if (schema$1.enum && schema$1.enum.length > 0) return schema$1.enum[0];
		if (schema$1.oneOf && schema$1.oneOf.length > 0) return getJSONSchemaSample(schema$1.oneOf[0], rootSchema);
		if (schema$1.anyOf && schema$1.anyOf.length > 0) return getJSONSchemaSample(schema$1.anyOf[0], rootSchema);
		if (schema$1.allOf && schema$1.allOf.length > 0) {
			const mergedSchema = schema$1.allOf.reduce((acc, s) => ({
				...acc,
				...s
			}), {});
			return getJSONSchemaSample(mergedSchema, rootSchema);
		}
		if (schema$1.type) switch (schema$1.type) {
			case "string": return handleString(schema$1);
			case "number":
			case "integer": return handleNumber(schema$1);
			case "boolean": return handleBoolean();
			case "object": return handleObject(schema$1, rootSchema);
			case "array": return handleArray(schema$1, rootSchema);
			case "null": return null;
			default: return null;
		}
		if (schema$1.properties) return handleObject(schema$1, rootSchema);
		return null;
	}
	function handleRef(ref, rootSchema) {
		const path = ref.split("/").slice(1);
		let current = rootSchema;
		for (const segment of path) {
			current = current[segment];
			if (current === void 0) return null;
		}
		return getJSONSchemaSample(current, rootSchema);
	}
	function handleString(schema$1) {
		if (schema$1.format) switch (schema$1.format) {
			case "email":
			case "idn-email": return "user@example.com";
			case "uri":
			case "url":
			case "iri": return "https://example.com";
			case "date": return "2023-01-01";
			case "date-time": return "2023-01-01T00:00:00Z";
			case "time": return "12:00:00Z";
			case "duration": return "PT1H";
			case "uuid": return "00000000-0000-0000-0000-000000000000";
			case "regex": return "^[a-zA-Z0-9]+$";
			case "relative-json-pointer": return "/some/relative/path";
			case "color": return "#000000";
			case "hostname": return "example.com";
			case "zipcode": return "12345";
			case "phone": return "+123-456-7890";
			case "password": return "******";
			default: return "string";
		}
		if (schema$1.pattern) return "pattern-string";
		return "string";
	}
	function handleNumber(schema$1) {
		if (schema$1.minimum !== void 0 && schema$1.maximum !== void 0) return schema$1.minimum;
		else if (schema$1.minimum !== void 0) return schema$1.minimum;
		else if (schema$1.maximum !== void 0) return schema$1.maximum;
		return 0;
	}
	function handleBoolean() {
		return true;
	}
	function handleObject(schema$1, rootSchema) {
		const result = {};
		if (schema$1.properties) {
			const required = schema$1.required || [];
			for (const [key, propSchema] of Object.entries(schema$1.properties)) if (required.includes(key) || required.length === 0) result[key] = getJSONSchemaSample(propSchema, rootSchema);
		}
		if (schema$1.additionalProperties && typeof schema$1.additionalProperties === "object") result["additionalProp"] = getJSONSchemaSample(schema$1.additionalProperties, rootSchema);
		return result;
	}
	function handleArray(schema$1, rootSchema) {
		if (schema$1.items) {
			const itemSchema = schema$1.items;
			const minItems = schema$1.minItems || 1;
			const numItems = Math.min(minItems, 3);
			return Array.from({ length: numItems }, () => getJSONSchemaSample(itemSchema, rootSchema));
		}
		return [];
	}
} });

//#endregion
//#region ../packages/vovk/cjs/openapi/vovkSchemaToOpenAPI.js
var require_vovkSchemaToOpenAPI = __commonJS({ "../packages/vovk/cjs/openapi/vovkSchemaToOpenAPI.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.vovkSchemaToOpenAPI = vovkSchemaToOpenAPI;
	const createCodeExamples_1$1 = require_createCodeExamples();
	const types_1$5 = require_types();
	const getJSONSchemaSample_1 = require_getJSONSchemaSample();
	function extractComponents(schema$1) {
		if (!schema$1) return [void 0, {}];
		const components = {};
		const process$1 = (obj, path = []) => {
			if (!obj || typeof obj !== "object") return obj;
			if (Array.isArray(obj)) return obj.map((item) => process$1(item, path));
			const result = {};
			Object.entries({
				...obj.definitions,
				...obj.$defs
			}).forEach(([key, value]) => {
				components[key] = process$1(value, [...path, key]);
			});
			for (const [key, value] of Object.entries(obj ?? {})) {
				if (key === "$defs" || key === "definitions") continue;
				if (key === "$ref" && typeof value === "string") {
					const refParts = value.split("/");
					const refName = refParts[refParts.length - 1];
					result[key] = `#/components/schemas/${refName}`;
				} else result[key] = process$1(value, [...path, key]);
			}
			return result;
		};
		const processedSchema = process$1(schema$1);
		return [processedSchema, components];
	}
	function vovkSchemaToOpenAPI({ rootEntry, schema: fullSchema, openAPIObject = {}, package: packageJson = { name: "my-rpc-client" } }) {
		const paths = {};
		const components = {};
		for (const [segmentName$2, segmentSchema] of Object.entries(fullSchema.segments ?? {})) for (const c of Object.values(segmentSchema.controllers)) for (const [handlerName, h] of Object.entries(c.handlers ?? {})) if (h.openapi) {
			const [queryValidation, queryComponents] = extractComponents(h?.validation?.query);
			const [bodyValidation, bodyComponents] = extractComponents(h?.validation?.body);
			const [paramsValidation, paramsComponents] = extractComponents(h?.validation?.params);
			const [outputValidation, outputComponents] = extractComponents(h?.validation?.output);
			const [iterationValidation, iterationComponents] = extractComponents(h?.validation?.iteration);
			Object.assign(components, queryComponents, bodyComponents, paramsComponents, outputComponents, iterationComponents);
			const { ts, rs, py } = (0, createCodeExamples_1$1.createCodeExamples)({
				package: packageJson,
				handlerName,
				handlerSchema: h,
				controllerSchema: c
			});
			const queryParameters = queryValidation && "type" in queryValidation && "properties" in queryValidation ? Object.entries(queryValidation.properties ?? {}).map(([propName, propSchema]) => ({
				name: propName,
				in: "query",
				required: queryValidation.required ? queryValidation.required.includes(propName) : false,
				schema: propSchema
			})) : null;
			const pathParameters = paramsValidation && "type" in paramsValidation && "properties" in paramsValidation ? Object.entries(paramsValidation.properties ?? {}).map(([propName, propSchema]) => ({
				name: propName,
				in: "path",
				required: paramsValidation.required ? paramsValidation.required.includes(propName) : false,
				schema: propSchema
			})) : null;
			const path = "/" + [
				rootEntry.replace(/^\/+|\/+$/g, ""),
				segmentName$2,
				c.prefix,
				h.path
			].filter(Boolean).join("/");
			paths[path] = paths[path] ?? {};
			const httpMethod = h.httpMethod.toLowerCase();
			paths[path][httpMethod] ??= {};
			paths[path][httpMethod] = {
				...h.openapi,
				...paths[path][httpMethod],
				"x-codeSamples": [
					...paths[path][httpMethod]["x-codeSamples"] ?? [],
					...h.openapi["x-codeSamples"] ?? [],
					{
						label: "TypeScript RPC",
						lang: "typescript",
						source: ts
					},
					{
						label: "Python RPC",
						lang: "python",
						source: py
					},
					{
						label: "Rust RPC",
						lang: "rust",
						source: rs
					}
				],
				...queryParameters || pathParameters ? { parameters: h.openapi.parameters ?? [...queryParameters || [], ...pathParameters || []] } : {},
				...paths[path][httpMethod].parameters ? { parameters: paths[path][httpMethod].parameters } : {},
				...outputValidation && "type" in outputValidation ? { responses: {
					200: {
						description: "description" in outputValidation ? outputValidation.description : "Success",
						content: { "application/json": { schema: outputValidation } }
					},
					...h.openapi?.responses
				} } : {},
				...iterationValidation && "type" in iterationValidation ? { responses: {
					200: {
						description: "description" in iterationValidation ? iterationValidation.description : "JSON Lines response",
						content: { "application/jsonl": { schema: {
							...iterationValidation,
							examples: iterationValidation.examples ?? [[
								JSON.stringify((0, getJSONSchemaSample_1.getJSONSchemaSample)(iterationValidation)),
								JSON.stringify((0, getJSONSchemaSample_1.getJSONSchemaSample)(iterationValidation)),
								JSON.stringify((0, getJSONSchemaSample_1.getJSONSchemaSample)(iterationValidation))
							].join("\n")]
						} } }
					},
					...h.openapi?.responses
				} } : {},
				...paths[path][httpMethod].responses ? { responses: paths[path][httpMethod].responses } : {},
				...bodyValidation && "type" in bodyValidation ? { requestBody: h.openapi?.requestBody ?? {
					description: "description" in bodyValidation ? bodyValidation.description : "Request body",
					required: true,
					content: { "application/json": { schema: bodyValidation } }
				} } : {},
				...paths[path][httpMethod].requestBody ? { requestBody: paths[path][httpMethod].requestBody } : {},
				tags: paths[path][httpMethod].tags ?? h.openapi?.tags
			};
		}
		return {
			...openAPIObject,
			openapi: "3.1.0",
			info: {
				title: packageJson?.description ?? "API",
				version: packageJson?.version ?? "0.0.1",
				...openAPIObject?.info
			},
			components: { schemas: {
				...openAPIObject?.components?.schemas ?? components,
				HttpStatus: {
					type: "integer",
					description: "HTTP status code",
					enum: Object.keys(types_1$5.HttpStatus).map((k) => types_1$5.HttpStatus[k]).filter(Boolean).filter((v) => typeof v === "number")
				},
				VovkErrorResponse: {
					type: "object",
					description: "Vovk error response",
					properties: {
						cause: { description: "Error cause of any shape" },
						statusCode: { $ref: "#/components/schemas/HttpStatus" },
						message: {
							type: "string",
							description: "Error message"
						},
						isError: {
							type: "boolean",
							const: true,
							description: "Indicates that this object represents an error"
						}
					},
					required: [
						"statusCode",
						"message",
						"isError"
					],
					additionalProperties: false
				},
				...openAPIObject?.components?.schemas
			} },
			paths
		};
	}
} });

//#endregion
//#region ../packages/vovk/cjs/openapi/generateFnName.js
var require_generateFnName = __commonJS({ "../packages/vovk/cjs/openapi/generateFnName.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VERB_MAP = void 0;
	exports.capitalize = capitalize;
	exports.generateFnName = generateFnName;
	exports.VERB_MAP = {
		GET: {
			noParams: "list",
			withParams: "get"
		},
		POST: { default: "create" },
		PUT: { default: "update" },
		PATCH: { default: "patch" },
		DELETE: { default: "delete" },
		HEAD: { default: "head" },
		OPTIONS: { default: "options" }
	};
	function capitalize(str$2) {
		if (str$2.length === 0) return "";
		return str$2[0].toUpperCase() + str$2.slice(1);
	}
	const DEFAULT_OPTIONS = { ignoreSegments: ["api"] };
	/**
	* Turn an HTTP method + OpenAPI path into a camelCased function name.
	*
	* Examples:
	*   generateFnName('GET', '/users')                     // "listUsers"
	*   generateFnName('GET', '/users/{id}')                // "getUsersById"
	*   generateFnName('POST', '/v1/api/orders')            // "createOrders"
	*   generateFnName('PATCH', '/users/{userId}/profile')  // "patchUsersProfileByUserId"
	*/
	function generateFnName(method, rawPath, opts = {}) {
		const { ignoreSegments } = {
			...DEFAULT_OPTIONS,
			...opts
		};
		const parts = rawPath.replace(/^\/|\/$/g, "").split("/").filter((seg) => !ignoreSegments?.includes(seg.toLowerCase())).filter(Boolean);
		const resources = [];
		const params = [];
		parts.forEach((seg) => {
			const match = seg.match(/^{?([^}]+)}?$/);
			if (match) params.push(match[1]);
			else resources.push(seg);
		});
		let baseVerb;
		if (method === "GET") baseVerb = params.length ? exports.VERB_MAP.GET.withParams : exports.VERB_MAP.GET.noParams;
		else baseVerb = exports.VERB_MAP[method].default;
		const resourcePart = resources.map(capitalize).join("");
		const byParams = params.length ? "By" + params.map(capitalize).join("") : "";
		const rawName = `${baseVerb}${resourcePart}${byParams}`;
		return rawName[0].toLowerCase() + rawName.slice(1);
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/camelCase.js
var require_camelCase = __commonJS({ "../packages/vovk/cjs/utils/camelCase.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.camelCase = camelCase;
	function toString(value) {
		return value == null ? "" : String(value);
	}
	const reUnicodeWord = /[\p{Lu}]{2,}(?=[\p{Lu}][\p{Ll}]+[0-9]*|\b)|[\p{Lu}]?[\p{Ll}]+[0-9]*|[\p{Lu}]|[0-9]+/gu;
	/**
	* Splits string into an array of words based on Unicode word boundaries
	* @param {string} str
	* @returns {string[]}
	*/
	function unicodeWords(str$2) {
		return str$2.match(reUnicodeWord) || [];
	}
	/**
	* Converts string to camel case.
	* @param {*} input - The value to convert to camel case.
	* @returns {string}
	*/
	function camelCase(input) {
		const str$2 = toString(input);
		const sanitized = str$2.replace(/[\s_-]+/g, " ").trim();
		const words = unicodeWords(sanitized);
		return words.map((word, index) => {
			const lower = word.toLowerCase();
			if (index === 0) return lower;
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		}).join("");
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/upperFirst.js
var require_upperFirst = __commonJS({ "../packages/vovk/cjs/utils/upperFirst.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.upperFirst = upperFirst;
	function upperFirst(str$2) {
		return str$2.charAt(0).toUpperCase() + str$2.slice(1);
	}
} });

//#endregion
//#region ../packages/vovk/cjs/openapi/openAPIToVovkSchema/applyComponentsSchemas.js
var require_applyComponentsSchemas = __commonJS({ "../packages/vovk/cjs/openapi/openAPIToVovkSchema/applyComponentsSchemas.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.applyComponentsSchemas = applyComponentsSchemas;
	const camelCase_1$1 = require_camelCase();
	const upperFirst_1 = require_upperFirst();
	function cloneJSON(obj) {
		if (obj === null || typeof obj !== "object") return obj;
		if (Array.isArray(obj)) return obj.map(cloneJSON);
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			if (value instanceof Date || value instanceof RegExp || typeof value === "function") continue;
			result[key] = cloneJSON(value);
		}
		return result;
	}
	function applyComponentsSchemas(schema$1, components, mixinName) {
		const key = "components/schemas";
		if (!components || !Object.keys(components).length) return schema$1;
		const result = cloneJSON(schema$1);
		result.$defs = result.$defs || {};
		const addedComponents = /* @__PURE__ */ new Set();
		function processSchema(obj) {
			if (!obj || typeof obj !== "object") return obj;
			if (Array.isArray(obj)) return obj.map((item) => processSchema(item));
			const newObj = { ...obj };
			const $ref = newObj.$ref;
			if ($ref && typeof $ref === "string" && $ref.startsWith(`#/${key}/`)) {
				const componentName = $ref.replace(`#/${key}/`, "");
				if (components[componentName]) {
					newObj.$ref = `#/$defs/${componentName}`;
					newObj["x-tsType"] ??= `Mixins.${(0, upperFirst_1.upperFirst)((0, camelCase_1$1.camelCase)(mixinName))}.${(0, upperFirst_1.upperFirst)((0, camelCase_1$1.camelCase)(componentName))}`;
				} else delete newObj.$ref;
				if (!addedComponents.has(componentName) && components[componentName]) {
					addedComponents.add(componentName);
					result.$defs[componentName] = processSchema(cloneJSON(components[componentName]));
				}
			}
			for (const key$1 in newObj) if (Object.prototype.hasOwnProperty.call(newObj, key$1)) newObj[key$1] = processSchema(newObj[key$1]);
			return newObj;
		}
		return processSchema(result);
	}
} });

//#endregion
//#region ../packages/vovk/cjs/openapi/openAPIToVovkSchema/inlineRefs.js
var require_inlineRefs = __commonJS({ "../packages/vovk/cjs/openapi/openAPIToVovkSchema/inlineRefs.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.inlineRefs = inlineRefs;
	/**
	* Resolves $ref references at the first level only (except for components/schemas references)
	* For arrays, checks each item at the first level
	* @param obj - The object to process (may contain $ref properties)
	* @param openAPIObject - The complete OpenAPI document containing definitions
	* @returns The object with resolved references (except components/schemas)
	*/
	function inlineRefs(obj, openAPIObject) {
		if (obj === null || obj === void 0) return obj;
		if (Array.isArray(obj)) return obj.map((item) => {
			if (item && typeof item === "object" && "$ref" in item && typeof item.$ref === "string") {
				if (item.$ref.startsWith("#/components/schemas/")) return item;
				const resolved = resolveRef(item.$ref, openAPIObject);
				if (resolved !== void 0) {
					const { $ref: _$ref,...additionalProps } = item;
					if (Object.keys(additionalProps).length > 0) return {
						...resolved,
						...additionalProps
					};
					return resolved;
				}
			}
			return item;
		});
		if (typeof obj !== "object") return obj;
		if ("$ref" in obj && typeof obj.$ref === "string") {
			if (obj.$ref.startsWith("#/components/schemas/")) return obj;
			const resolved = resolveRef(obj.$ref, openAPIObject);
			if (resolved !== void 0) {
				const { $ref: _$ref,...additionalProps } = obj;
				if (Object.keys(additionalProps).length > 0) return {
					...resolved,
					...additionalProps
				};
				return resolved;
			}
		}
		return obj;
	}
	/**
	* Resolves a JSON Reference ($ref) to its target value
	* @param ref - The reference string (e.g., "#/components/parameters/id")
	* @param openAPIObject - The complete OpenAPI document
	* @returns The resolved value or undefined if not found
	*/
	function resolveRef(ref, openAPIObject) {
		if (!ref.startsWith("#/")) {
			console.warn(`External references are not supported: ${ref}`);
			return void 0;
		}
		const path = ref.substring(1).split("/").filter((p) => p !== "");
		let current = openAPIObject;
		for (const segment of path) {
			const decodedSegment = segment.replace(/~1/g, "/").replace(/~0/g, "~");
			if (current && typeof current === "object" && decodedSegment in current) current = current[decodedSegment];
			else {
				console.warn(`Could not resolve reference: ${ref}`);
				return void 0;
			}
		}
		return current;
	}
} });

//#endregion
//#region ../packages/vovk/cjs/openapi/openAPIToVovkSchema/index.js
var require_openAPIToVovkSchema = __commonJS({ "../packages/vovk/cjs/openapi/openAPIToVovkSchema/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.openAPIToVovkSchema = openAPIToVovkSchema;
	const types_1$4 = require_types();
	const generateFnName_1 = require_generateFnName();
	const camelCase_1 = require_camelCase();
	const applyComponentsSchemas_1 = require_applyComponentsSchemas();
	const inlineRefs_1 = require_inlineRefs();
	const getNamesNestJS = (operationObject) => {
		const operationId = operationObject.operationId;
		if (!operationId) throw new Error("Operation ID is required for NestJS module name generation");
		const controllerHandlerMatch = operationId?.match(/^([A-Z][a-zA-Z0-9]*)_([a-zA-Z0-9_]+)/);
		if (!controllerHandlerMatch) throw new Error(`Invalid operationId format for NestJS: ${operationId}`);
		const [controllerName, handlerName] = controllerHandlerMatch.slice(1, 3);
		return [controllerName.replace(/Controller$/, "RPC"), handlerName];
	};
	const normalizeGetModuleName = (getModuleName) => {
		if (getModuleName === "nestjs-operation-id") getModuleName = ({ operationObject }) => getNamesNestJS(operationObject)[0];
		else if (typeof getModuleName === "string") {
			const moduleName = getModuleName;
			getModuleName = () => moduleName;
		} else if (typeof getModuleName !== "function") throw new Error("getModuleName must be a function or one of the predefined strings");
		return getModuleName;
	};
	const normalizeGetMethodName = (getMethodName) => {
		if (getMethodName === "nestjs-operation-id") getMethodName = ({ operationObject }) => getNamesNestJS(operationObject)[1];
		else if (getMethodName === "camel-case-operation-id") getMethodName = ({ operationObject }) => {
			const operationId = operationObject.operationId;
			if (!operationId) throw new Error("Operation ID is required for camel-case method name generation");
			return (0, camelCase_1.camelCase)(operationId);
		};
		else if (getMethodName === "auto") getMethodName = ({ operationObject, method, path }) => {
			const operationId = operationObject.operationId;
			const isCamelCase = operationId && /^[a-z][a-zA-Z0-9]*$/.test(operationId);
			const isSnakeCase = operationId && /^[a-z][a-z0-9_]+$/.test(operationId);
			return isCamelCase ? operationId : isSnakeCase ? (0, camelCase_1.camelCase)(operationId) : (0, generateFnName_1.generateFnName)(method, path);
		};
		else if (typeof getMethodName !== "function") throw new Error("getMethodName must be a function or one of the predefined strings");
		return getMethodName;
	};
	function openAPIToVovkSchema({ apiRoot, source: { object: openAPIObject }, getModuleName = "api", getMethodName = "auto", errorMessageKey, package: packageJson, mixinName }) {
		const forceApiRoot = apiRoot ?? openAPIObject.servers?.[0]?.url ?? ("host" in openAPIObject ? `https://${openAPIObject.host}${"basePath" in openAPIObject ? openAPIObject.basePath : ""}` : null);
		if (!forceApiRoot) throw new Error("API root URL is required in OpenAPI configuration");
		const schema$1 = {
			$schema: types_1$4.VovkSchemaIdEnum.SCHEMA,
			segments: { [mixinName]: {
				$schema: types_1$4.VovkSchemaIdEnum.SEGMENT,
				emitSchema: true,
				segmentName: mixinName,
				segmentType: "mixin",
				controllers: {},
				meta: {
					components: openAPIObject.components,
					package: Object.assign({}, packageJson, openAPIObject.info ? { description: packageJson?.description ?? `**${openAPIObject.info.title}**\n${openAPIObject.info.description ?? ""}` } : {})
				}
			} }
		};
		const segment = schema$1.segments[mixinName];
		getModuleName = normalizeGetModuleName(getModuleName);
		getMethodName = normalizeGetMethodName(getMethodName);
		return Object.entries(openAPIObject.paths ?? {}).reduce((acc, [path, operations]) => {
			Object.entries(operations ?? {}).filter(([, operation]) => operation && typeof operation === "object").forEach(([method, operation]) => {
				const rpcModuleName = getModuleName({
					method: method.toUpperCase(),
					path,
					openAPIObject,
					operationObject: operation
				});
				const handlerName = getMethodName({
					method: method.toUpperCase(),
					path,
					openAPIObject,
					operationObject: operation
				});
				segment.controllers[rpcModuleName] ??= {
					forceApiRoot,
					rpcModuleName,
					handlers: {}
				};
				const parameters = (0, inlineRefs_1.inlineRefs)(operation.parameters ?? [], openAPIObject);
				const queryProperties = parameters.filter((p) => p.in === "query") ?? null;
				const pathProperties = parameters.filter((p) => p.in === "path") ?? null;
				const query = queryProperties?.length ? {
					type: "object",
					properties: Object.fromEntries(queryProperties.map((p) => [p.name, p.schema])),
					required: queryProperties.filter((p) => p.required).map((p) => p.name)
				} : null;
				const params = pathProperties?.length ? {
					type: "object",
					properties: Object.fromEntries(pathProperties.map((p) => [p.name, p.schema])),
					required: pathProperties.filter((p) => p.required).map((p) => p.name)
				} : null;
				const requestBodyContent = (0, inlineRefs_1.inlineRefs)(operation.requestBody, openAPIObject)?.content ?? {};
				const jsonBody = requestBodyContent["application/json"]?.schema ?? null;
				const formDataBody = requestBodyContent["multipart/form-data"]?.schema ?? null;
				let urlEncodedBody = requestBodyContent["application/x-www-form-urlencoded"]?.schema ?? null;
				if (formDataBody && urlEncodedBody && JSON.stringify(formDataBody) === JSON.stringify(urlEncodedBody)) urlEncodedBody = null;
				if (formDataBody) Object.assign(formDataBody, {
					"x-isForm": true,
					"x-tsType": "FormData"
				});
				if (urlEncodedBody) Object.assign(urlEncodedBody, {
					"x-isForm": true,
					"x-tsType": "FormData"
				});
				const bodySchemas = [
					jsonBody,
					formDataBody,
					urlEncodedBody
				].filter(Boolean);
				const body = !bodySchemas.length ? null : bodySchemas.length === 1 ? bodySchemas[0] : { anyOf: bodySchemas };
				const output = operation.responses?.["200"]?.content?.["application/json"]?.schema ?? operation.responses?.["201"]?.content?.["application/json"]?.schema ?? null;
				const iteration = operation.responses?.["200"]?.content?.["application/jsonl"]?.schema ?? operation.responses?.["201"]?.content?.["application/jsonl"]?.schema ?? operation.responses?.["200"]?.content?.["application/jsonlines"]?.schema ?? operation.responses?.["201"]?.content?.["application/jsonlines"]?.schema ?? null;
				if (errorMessageKey) operation["x-errorMessageKey"] = errorMessageKey;
				const componentsSchemas = openAPIObject.components?.schemas ?? ("definitions" in openAPIObject ? openAPIObject.definitions : {});
				segment.controllers[rpcModuleName].handlers[handlerName] = {
					httpMethod: method.toUpperCase(),
					path,
					openapi: operation,
					validation: {
						...query && { query: (0, applyComponentsSchemas_1.applyComponentsSchemas)(query, componentsSchemas, mixinName) },
						...params && { params: (0, applyComponentsSchemas_1.applyComponentsSchemas)(params, componentsSchemas, mixinName) },
						...body && { body: (0, applyComponentsSchemas_1.applyComponentsSchemas)(body, componentsSchemas, mixinName) },
						...output && { output: (0, applyComponentsSchemas_1.applyComponentsSchemas)(output, componentsSchemas, mixinName) },
						...iteration && { iteration: (0, applyComponentsSchemas_1.applyComponentsSchemas)(iteration, componentsSchemas, mixinName) }
					}
				};
			});
			return acc;
		}, schema$1);
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/createDecorator.js
var require_createDecorator = __commonJS({ "../packages/vovk/cjs/utils/createDecorator.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createDecorator = createDecorator;
	function createDecorator(handler, initHandler) {
		return function decoratorCreator(...args) {
			return function decorator(target, propertyKey) {
				const controller = target;
				const originalMethod = controller[propertyKey];
				if (typeof originalMethod !== "function") throw new Error(`Unable to decorate: ${propertyKey} is not a function`);
				const sourceMethod = originalMethod._sourceMethod ?? originalMethod;
				const method = function method$1(req, params) {
					const next$1 = async () => {
						return await originalMethod.call(controller, req, params);
					};
					return handler ? handler.call(controller, req, next$1, ...args) : next$1();
				};
				controller[propertyKey] = method;
				method._controller = controller;
				method._sourceMethod = sourceMethod;
				method.fn = originalMethod.fn;
				method.models = originalMethod.models;
				sourceMethod.wrapper = method;
				originalMethod._controller = controller;
				const handlerSchema = controller._handlers?.[propertyKey] ?? null;
				const initResultReturn = initHandler?.call(controller, ...args);
				const initResult = typeof initResultReturn === "function" ? initResultReturn(handlerSchema, { handlerName: propertyKey }) : initResultReturn;
				const methodSchema = {
					...handlerSchema,
					...initResult?.validation ? { validation: initResult.validation } : {},
					...initResult?.openapi ? { openapi: initResult.openapi } : {},
					...initResult?.misc ? { misc: initResult.misc } : {}
				};
				method.schema = methodSchema;
				controller._handlers = {
					...controller._handlers,
					[propertyKey]: methodSchema
				};
			};
		};
	}
} });

//#endregion
//#region ../packages/vovk/cjs/openapi/error.js
var require_error = __commonJS({ "../packages/vovk/cjs/openapi/error.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.error = void 0;
	const types_1$3 = require_types();
	const createDecorator_1$2 = require_createDecorator();
	const statusDisplayText = {
		[types_1$3.HttpStatus.NULL]: "Error",
		[types_1$3.HttpStatus.CONTINUE]: "Continue",
		[types_1$3.HttpStatus.SWITCHING_PROTOCOLS]: "Switching Protocols",
		[types_1$3.HttpStatus.PROCESSING]: "Processing",
		[types_1$3.HttpStatus.EARLYHINTS]: "Early Hints",
		[types_1$3.HttpStatus.OK]: "OK",
		[types_1$3.HttpStatus.CREATED]: "Created",
		[types_1$3.HttpStatus.ACCEPTED]: "Accepted",
		[types_1$3.HttpStatus.NON_AUTHORITATIVE_INFORMATION]: "Non Authoritative Information",
		[types_1$3.HttpStatus.NO_CONTENT]: "No Content",
		[types_1$3.HttpStatus.RESET_CONTENT]: "Reset Content",
		[types_1$3.HttpStatus.PARTIAL_CONTENT]: "Partial Content",
		[types_1$3.HttpStatus.AMBIGUOUS]: "Ambiguous",
		[types_1$3.HttpStatus.MOVED_PERMANENTLY]: "Moved Permanently",
		[types_1$3.HttpStatus.FOUND]: "Found",
		[types_1$3.HttpStatus.SEE_OTHER]: "See Other",
		[types_1$3.HttpStatus.NOT_MODIFIED]: "Not Modified",
		[types_1$3.HttpStatus.TEMPORARY_REDIRECT]: "Temporary Redirect",
		[types_1$3.HttpStatus.PERMANENT_REDIRECT]: "Permanent Redirect",
		[types_1$3.HttpStatus.BAD_REQUEST]: "Bad Request",
		[types_1$3.HttpStatus.UNAUTHORIZED]: "Unauthorized",
		[types_1$3.HttpStatus.PAYMENT_REQUIRED]: "Payment Required",
		[types_1$3.HttpStatus.FORBIDDEN]: "Forbidden",
		[types_1$3.HttpStatus.NOT_FOUND]: "Not Found",
		[types_1$3.HttpStatus.METHOD_NOT_ALLOWED]: "Method Not Allowed",
		[types_1$3.HttpStatus.NOT_ACCEPTABLE]: "Not Acceptable",
		[types_1$3.HttpStatus.PROXY_AUTHENTICATION_REQUIRED]: "Proxy Authentication Required",
		[types_1$3.HttpStatus.REQUEST_TIMEOUT]: "Request Timeout",
		[types_1$3.HttpStatus.CONFLICT]: "Conflict",
		[types_1$3.HttpStatus.GONE]: "Gone",
		[types_1$3.HttpStatus.LENGTH_REQUIRED]: "Length Required",
		[types_1$3.HttpStatus.PRECONDITION_FAILED]: "Precondition Failed",
		[types_1$3.HttpStatus.PAYLOAD_TOO_LARGE]: "Payload Too Large",
		[types_1$3.HttpStatus.URI_TOO_LONG]: "URI Too Long",
		[types_1$3.HttpStatus.UNSUPPORTED_MEDIA_TYPE]: "Unsupported Media Type",
		[types_1$3.HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]: "Requested Range Not Satisfiable",
		[types_1$3.HttpStatus.EXPECTATION_FAILED]: "Expectation Failed",
		[types_1$3.HttpStatus.I_AM_A_TEAPOT]: "I am a teapot",
		[types_1$3.HttpStatus.MISDIRECTED]: "Misdirected",
		[types_1$3.HttpStatus.UNPROCESSABLE_ENTITY]: "Unprocessable Entity",
		[types_1$3.HttpStatus.FAILED_DEPENDENCY]: "Failed Dependency",
		[types_1$3.HttpStatus.PRECONDITION_REQUIRED]: "Precondition Required",
		[types_1$3.HttpStatus.TOO_MANY_REQUESTS]: "Too Many Requests",
		[types_1$3.HttpStatus.INTERNAL_SERVER_ERROR]: "Internal Server Error",
		[types_1$3.HttpStatus.NOT_IMPLEMENTED]: "Not Implemented",
		[types_1$3.HttpStatus.BAD_GATEWAY]: "Bad Gateway",
		[types_1$3.HttpStatus.SERVICE_UNAVAILABLE]: "Service Unavailable",
		[types_1$3.HttpStatus.GATEWAY_TIMEOUT]: "Gateway Timeout",
		[types_1$3.HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: "HTTP Version Not Supported"
	};
	exports.error = (0, createDecorator_1$2.createDecorator)(null, (status, message) => {
		return (handlerSchema) => {
			return {
				...handlerSchema,
				openapi: {
					...handlerSchema?.openapi,
					responses: {
						...handlerSchema?.openapi?.responses,
						[status]: {
							description: `${status} ${statusDisplayText[status]}`,
							content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/VovkErrorResponse" }, {
								type: "object",
								properties: {
									message: {
										type: "string",
										enum: [message, ...handlerSchema?.openapi?.responses?.[status]?.content?.["application/json"]?.schema?.allOf?.[1]?.properties?.message?.enum ?? []]
									},
									statusCode: {
										type: "integer",
										enum: [status]
									}
								}
							}] } } }
						}
					}
				}
			};
		};
	});
} });

//#endregion
//#region ../packages/vovk/cjs/openapi/index.js
var require_openapi = __commonJS({ "../packages/vovk/cjs/openapi/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.openAPIToVovkSchema = exports.vovkSchemaToOpenAPI = exports.openapi = exports.openapiDecorator = void 0;
	const vovkSchemaToOpenAPI_1 = require_vovkSchemaToOpenAPI();
	Object.defineProperty(exports, "vovkSchemaToOpenAPI", {
		enumerable: true,
		get: function() {
			return vovkSchemaToOpenAPI_1.vovkSchemaToOpenAPI;
		}
	});
	const index_1$1 = require_openAPIToVovkSchema();
	Object.defineProperty(exports, "openAPIToVovkSchema", {
		enumerable: true,
		get: function() {
			return index_1$1.openAPIToVovkSchema;
		}
	});
	const error_1 = require_error();
	const createDecorator_1$1 = require_createDecorator();
	exports.openapiDecorator = (0, createDecorator_1$1.createDecorator)(null, (openAPIOperationObject = {}) => {
		return (handlerSchema) => {
			return {
				...handlerSchema,
				openapi: {
					...handlerSchema?.openapi,
					...openAPIOperationObject
				}
			};
		};
	});
	exports.openapi = Object.assign(exports.openapiDecorator, { error: error_1.error });
} });

//#endregion
//#region ../packages/vovk/cjs/utils/generateStaticAPI.js
var require_generateStaticAPI = __commonJS({ "../packages/vovk/cjs/utils/generateStaticAPI.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateStaticAPI = generateStaticAPI;
	function generateStaticAPI(c, slug = "vovk") {
		const controllers$2 = c;
		return [{ [slug]: ["_schema_"] }, ...Object.values(controllers$2).map((controller) => {
			const handlers = controller._handlers;
			const splitPrefix = controller._prefix?.split("/") ?? [];
			return Object.entries(handlers ?? {}).map(([name, handler]) => {
				const staticParams = controller._handlersMetadata?.[name]?.staticParams;
				if (staticParams?.length) return staticParams.map((paramsItem) => {
					let path = handler.path;
					for (const [key, value] of Object.entries(paramsItem ?? {})) path = path.replace(`{${key}}`, value);
					return { [slug]: [...splitPrefix, ...path.split("/")].filter(Boolean) };
				});
				return [{ [slug]: [...splitPrefix, ...handler.path.split("/")].filter(Boolean) }];
			}).flat();
		}).flat()];
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/setHandlerSchema.js
var require_setHandlerSchema = __commonJS({ "../packages/vovk/cjs/utils/setHandlerSchema.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.setHandlerSchema = setHandlerSchema;
	async function setHandlerSchema(h, schema$1) {
		h._getSchema = (controller) => {
			if (!controller) throw new Error("Error setting client validators. Controller not found. Did you forget to use an HTTP decorator?");
			const handlerName = Object.getOwnPropertyNames(controller).find((key) => controller[key]._sourceMethod === h);
			if (!handlerName) throw new Error("Error setting client validators. Handler not found.");
			return schema$1;
		};
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/withValidationLibrary.js
var require_withValidationLibrary = __commonJS({ "../packages/vovk/cjs/utils/withValidationLibrary.js"(exports) {
	var __importDefault$1 = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.withValidationLibrary = withValidationLibrary;
	const HttpException_1$2 = require_HttpException();
	const types_1$2 = require_types();
	const reqMeta_1 = __importDefault$1(require_reqMeta());
	const setHandlerSchema_1 = require_setHandlerSchema();
	const validationTypes = [
		"body",
		"query",
		"params",
		"output",
		"iteration"
	];
	function withValidationLibrary({ isForm, disableServerSideValidation, skipSchemaEmission, validateEachIteration, body, query, params, output, iteration, handle, toJSONSchema, validate: validate$1 }) {
		const disableServerSideValidationKeys = disableServerSideValidation === false ? [] : disableServerSideValidation === true ? validationTypes : disableServerSideValidation ?? [];
		const skipSchemaEmissionKeys = skipSchemaEmission === false ? [] : skipSchemaEmission === true ? validationTypes : skipSchemaEmission ?? [];
		const outputHandler = async (req, handlerParams) => {
			const { __disableClientValidation } = req.vovk.meta();
			let data = await handle(req, handlerParams);
			if (__disableClientValidation) return data;
			if (output && iteration) throw new HttpException_1$2.HttpException(types_1$2.HttpStatus.INTERNAL_SERVER_ERROR, "Output and iteration are mutually exclusive. You can't use them together.");
			if (output && !disableServerSideValidationKeys.includes("output")) {
				if (!data) throw new HttpException_1$2.HttpException(types_1$2.HttpStatus.INTERNAL_SERVER_ERROR, "Output is required. You probably forgot to return something from your handler.");
				data = await validate$1(data, output, {
					type: "output",
					req
				}) ?? data;
			}
			if (iteration && !disableServerSideValidationKeys.includes("iteration")) {
				if (!data || typeof data[Symbol.asyncIterator] !== "function") throw new HttpException_1$2.HttpException(types_1$2.HttpStatus.INTERNAL_SERVER_ERROR, "Data is not an async iterable but iteration validation is defined.");
				return async function* () {
					let i = 0;
					for await (let item of data) {
						if (validateEachIteration || i === 0) item = await validate$1(item, iteration, {
							type: "iteration",
							req,
							status: 200,
							i
						}) ?? item;
						i++;
						yield item;
					}
				}();
			} else if (validateEachIteration) throw new HttpException_1$2.HttpException(types_1$2.HttpStatus.INTERNAL_SERVER_ERROR, "validateEachIteration is set but iteration is not defined.");
			return data;
		};
		const resultHandler = async (req, handlerParams) => {
			const { __disableClientValidation } = req.vovk.meta();
			if (!__disableClientValidation) {
				if (body && !disableServerSideValidationKeys.includes("body")) {
					const data = await req.vovk[isForm ? "form" : "body"]();
					const instance = await validate$1(data, body, {
						type: isForm ? "form" : "body",
						req
					}) ?? data;
					req.json = () => Promise.resolve(data);
					req.vovk[isForm ? "form" : "body"] = () => Promise.resolve(instance);
				}
				if (query && !disableServerSideValidationKeys.includes("query")) {
					const data = req.vovk.query();
					const instance = await validate$1(data, query, {
						type: "query",
						req
					}) ?? data;
					req.vovk.query = () => instance;
				}
				if (params && !disableServerSideValidationKeys.includes("params")) {
					const data = req.vovk.params();
					const instance = await validate$1(data, params, {
						type: "params",
						req
					}) ?? data;
					req.vovk.params = () => instance;
				}
			}
			return outputHandler(req, handlerParams);
		};
		function fn(input) {
			const fakeReq = { vovk: {
				body: () => Promise.resolve(input?.body ?? {}),
				query: () => input?.query ?? {},
				params: () => input?.params ?? {},
				meta: (meta) => (0, reqMeta_1.default)(fakeReq, meta),
				form: () => {
					throw new Error("Form data is not supported in this context.");
				}
			} };
			fakeReq.vovk.meta({
				__disableClientValidation: input?.disableClientValidation,
				...input?.meta
			});
			return (resultHandler.wrapper ?? resultHandler)(fakeReq, input?.params ?? {});
		}
		const models = {
			...body !== void 0 ? { body } : {},
			...query !== void 0 ? { query } : {},
			...params !== void 0 ? { params } : {},
			...output !== void 0 ? { output } : {},
			...iteration !== void 0 ? { iteration } : {}
		};
		const resultHandlerEnhanced = Object.assign(resultHandler, {
			fn,
			models
		});
		if (toJSONSchema) {
			const getJsonSchema = (model, type) => Object.assign(toJSONSchema(model, { type }), type === "body" && isForm ? { "x-isForm": isForm } : {});
			const validation$3 = {};
			if (body && !skipSchemaEmissionKeys.includes("body")) validation$3.body = getJsonSchema(body, "body");
			if (query && !skipSchemaEmissionKeys.includes("query")) validation$3.query = getJsonSchema(query, "query");
			if (params && !skipSchemaEmissionKeys.includes("params")) validation$3.params = getJsonSchema(params, "params");
			if (output && !skipSchemaEmissionKeys.includes("output")) validation$3.output = getJsonSchema(output, "output");
			if (iteration && !skipSchemaEmissionKeys.includes("iteration")) validation$3.iteration = getJsonSchema(iteration, "iteration");
			(0, setHandlerSchema_1.setHandlerSchema)(resultHandlerEnhanced, { validation: validation$3 });
		}
		return resultHandlerEnhanced;
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/createStandardValidation.js
var require_createStandardValidation = __commonJS({ "../packages/vovk/cjs/utils/createStandardValidation.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createStandardValidation = createStandardValidation;
	const types_1$1 = require_types();
	const withValidationLibrary_1$1 = require_withValidationLibrary();
	const HttpException_1$1 = require_HttpException();
	function createStandardValidation({ toJSONSchema }) {
		function withStandard({ isForm, body, query, params, output, iteration, handle, disableServerSideValidation, skipSchemaEmission, validateEachIteration }) {
			return (0, withValidationLibrary_1$1.withValidationLibrary)({
				isForm,
				body,
				query,
				params,
				output,
				iteration,
				disableServerSideValidation,
				skipSchemaEmission,
				validateEachIteration,
				handle,
				toJSONSchema,
				validate: async (data, model, { type, i }) => {
					const result = await model["~standard"].validate(data);
					if (result.issues?.length) throw new HttpException_1$1.HttpException(types_1$1.HttpStatus.BAD_REQUEST, `Validation failed. Invalid ${type === "iteration" ? `${type} #${i}` : type} on server: ${result.issues.map(({ message, path }) => `${message}${path ? ` at ${path.join(".")}` : ""}`).join(", ")}`, {
						[type]: data,
						result
					});
					return result.value;
				}
			});
		}
		return withStandard;
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/multitenant.js
var require_multitenant = __commonJS({ "../packages/vovk/cjs/utils/multitenant.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.multitenant = multitenant;
	const getReservedPaths = (overrides) => {
		return Object.keys(overrides).filter((key) => !key.includes("[") && !key.includes("]"));
	};
	/**
	* Convert a pattern with [placeholders] to a regex pattern and extract placeholder names
	*/
	const patternToRegex = (pattern) => {
		const paramNames = [];
		const regexPattern = pattern.replace(/\[([^\]]+)\]/g, (_$2, name) => {
			paramNames.push(name);
			return "([^.]+)";
		}).replace(/\./g, "\\.");
		return {
			regex: new RegExp(`^${regexPattern}$`),
			paramNames
		};
	};
	function multitenant(config$1) {
		const { requestUrl, requestHost, targetHost, overrides } = config$1;
		const urlObj = new URL(requestUrl);
		const pathname = urlObj.pathname.slice(1);
		if (pathname.endsWith("_schema_")) return {
			action: null,
			destination: null,
			message: "Schema endpoint, bypassing overrides",
			subdomains: null
		};
		const pathSegments = pathname.split("/").filter(Boolean);
		const reservedPaths = getReservedPaths(overrides);
		for (let i = 0; i < pathSegments.length; i++) {
			const segment = pathSegments[i];
			if (reservedPaths.includes(segment)) {
				const destinationHost = `${segment}.${targetHost}`;
				const beforeSegments = pathSegments.slice(0, i);
				const afterSegments = pathSegments.slice(i + 1);
				const newPath = [...beforeSegments, ...afterSegments].join("/");
				const destinationUrl = new URL(`${urlObj.protocol}//${destinationHost}`);
				if (newPath) destinationUrl.pathname = `/${newPath}`;
				destinationUrl.search = urlObj.search;
				return {
					action: "redirect",
					destination: destinationUrl.toString(),
					message: `Redirecting to ${segment} subdomain`,
					subdomains: null
				};
			}
		}
		for (const pattern in overrides) {
			const fullPattern = `${pattern}.${targetHost}`;
			const { regex: regex$1, paramNames } = patternToRegex(fullPattern);
			const match = requestHost.match(regex$1);
			if (match) {
				const overrideRules = overrides[pattern];
				const params = {};
				if (match.length > 1) for (let i = 0; i < paramNames.length; i++) params[paramNames[i]] = match[i + 1];
				for (const rule of overrideRules) if (pathname === rule.from || pathname.startsWith(`${rule.from}/`)) {
					let destination = pathname.replace(rule.from, rule.to);
					if (Object.keys(params).length > 0) Object.entries(params).forEach(([key, value]) => {
						destination = destination.replace(`[${key}]`, value);
					});
					const wildcardSubdomains = paramNames.length > 0 ? params : null;
					return {
						action: "rewrite",
						destination: `${urlObj.protocol}//${urlObj.host}/${destination}${urlObj.search}`,
						message: `Rewriting to ${destination}`,
						subdomains: wildcardSubdomains
					};
				}
			}
		}
		if (pathSegments.length > 0 && reservedPaths.includes(pathSegments[0])) {
			const reservedPath = pathSegments[0];
			const restPath = pathSegments.slice(1).join("/");
			const destinationHost = `${reservedPath}.${targetHost}`;
			const destinationUrl = new URL(`${urlObj.protocol}//${destinationHost}`);
			if (restPath) destinationUrl.pathname = `/${restPath}`;
			destinationUrl.search = urlObj.search;
			return {
				action: "redirect",
				destination: destinationUrl.toString(),
				message: `Redirecting to ${reservedPath} subdomain`,
				subdomains: null
			};
		}
		return {
			action: null,
			destination: null,
			message: "No action",
			subdomains: null
		};
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/createLLMTools.js
var require_createLLMTools = __commonJS({ "../packages/vovk/cjs/utils/createLLMTools.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createLLMTools = createLLMTools;
	const createLLMTool = ({ moduleName, handlerName, caller, module: module$1, init, meta, onExecute, onError }) => {
		if (!module$1) throw new Error(`Module "${moduleName}" not found.`);
		const handler = module$1[handlerName];
		if (!handler) throw new Error(`Handler "${handlerName}" not found in module "${moduleName}".`);
		const { schema: schema$1, models } = handler;
		if (!schema$1 || !schema$1.openapi) throw new Error(`Handler "${handlerName}" in module "${moduleName}" does not have a valid schema.`);
		const execute = (input, options) => {
			const { body, query, params } = input;
			const callerInput = {
				schema: schema$1,
				models,
				handler,
				body,
				query,
				params,
				init,
				meta,
				handlerName,
				moduleName
			};
			return caller(callerInput, options).then((data) => onExecute(data, callerInput, options) ?? data).catch((error$41) => onError?.(error$41, callerInput, options) ?? error$41);
		};
		const parametersProperties = {
			...schema$1?.validation?.body ? { body: schema$1.validation.body } : {},
			...schema$1?.validation?.query ? { query: schema$1.validation.query } : {},
			...schema$1?.validation?.params ? { params: schema$1.validation.params } : {}
		};
		return {
			type: "function",
			execute,
			name: `${moduleName}_${handlerName}`,
			description: schema$1.openapi?.["x-tool-description"] ?? ([schema$1.openapi?.summary ?? "", schema$1.openapi?.description ?? ""].filter(Boolean).join("\n") || handlerName),
			parameters: {
				type: "object",
				properties: parametersProperties,
				required: Object.keys(parametersProperties),
				additionalProperties: false
			},
			models
		};
	};
	async function defaultCaller({ handler, body, query, params, init, meta }, _options) {
		if (handler.isRPC) return handler({
			handler,
			body,
			query,
			params,
			init,
			meta
		});
		if (handler.fn) return handler.fn({
			body,
			query,
			params,
			meta
		});
		throw new Error("Handler is not a valid RPC or controller method");
	}
	function createLLMTools({ modules, caller = defaultCaller, meta, onExecute = (result) => result, onError = () => {} }) {
		const moduleWithConfig = modules;
		const tools = Object.entries(moduleWithConfig ?? {}).map(([moduleName, moduleWithconfig]) => {
			let init;
			let module$1;
			if (Array.isArray(moduleWithconfig)) [module$1, {init}] = moduleWithconfig;
			else module$1 = moduleWithconfig;
			return Object.entries(module$1 ?? {}).filter(([, handler]) => handler?.schema?.openapi && !handler?.schema?.openapi?.["x-tool-exclude"]).map(([handlerName]) => createLLMTool({
				moduleName,
				handlerName,
				caller,
				module: module$1,
				init,
				meta,
				onExecute,
				onError
			}));
		}).flat();
		return { tools };
	}
} });

//#endregion
//#region ../packages/vovk/cjs/utils/createValidateOnClient.js
var require_createValidateOnClient = __commonJS({ "../packages/vovk/cjs/utils/createValidateOnClient.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createValidateOnClient = createValidateOnClient;
	function createValidateOnClient({ validate: validate$1 }) {
		const validateOnClient$1 = async function validateOnClient$2(input, validation$3, meta) {
			const newInput = { ...input };
			if (input.body && validation$3.body) newInput.body = await validate$1(input.body, validation$3.body, {
				...meta,
				type: "body"
			}) ?? input.body;
			if (input.query && validation$3.query) newInput.query = await validate$1(input.query, validation$3.query, {
				...meta,
				type: "query"
			}) ?? input.query;
			if (input.params && validation$3.params) newInput.params = await validate$1(input.params, validation$3.params, {
				...meta,
				type: "params"
			}) ?? input.params;
			return newInput;
		};
		return validateOnClient$1;
	}
} });

//#endregion
//#region ../packages/vovk/cjs/index.js
var require_cjs = __commonJS({ "../packages/vovk/cjs/index.js"(exports) {
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.initSegment = exports.prefix = exports.options = exports.head = exports.del = exports.patch = exports.put = exports.post = exports.get = exports.vovkSchemaToOpenAPI = exports.openAPIToVovkSchema = exports.openapi = exports.progressive = exports.createValidateOnClient = exports.createCodeExamples = exports.createLLMTools = exports.multitenant = exports.createStandardValidation = exports.withValidationLibrary = exports.generateStaticAPI = exports.createFetcher = exports.fetcher = exports.createRPC = exports.createDecorator = exports.createVovkApp = exports.HttpMethod = exports.HttpStatus = exports.HttpException = exports.JSONLinesResponse = exports.VovkSchemaIdEnum = void 0;
	const createVovkApp_1 = require_createVovkApp();
	Object.defineProperty(exports, "createVovkApp", {
		enumerable: true,
		get: function() {
			return createVovkApp_1.createVovkApp;
		}
	});
	const types_1 = require_types();
	Object.defineProperty(exports, "HttpStatus", {
		enumerable: true,
		get: function() {
			return types_1.HttpStatus;
		}
	});
	Object.defineProperty(exports, "HttpMethod", {
		enumerable: true,
		get: function() {
			return types_1.HttpMethod;
		}
	});
	Object.defineProperty(exports, "VovkSchemaIdEnum", {
		enumerable: true,
		get: function() {
			return types_1.VovkSchemaIdEnum;
		}
	});
	const index_1 = require_client();
	Object.defineProperty(exports, "createRPC", {
		enumerable: true,
		get: function() {
			return index_1.createRPC;
		}
	});
	Object.defineProperty(exports, "fetcher", {
		enumerable: true,
		get: function() {
			return index_1.fetcher;
		}
	});
	Object.defineProperty(exports, "createFetcher", {
		enumerable: true,
		get: function() {
			return index_1.createFetcher;
		}
	});
	Object.defineProperty(exports, "progressive", {
		enumerable: true,
		get: function() {
			return index_1.progressive;
		}
	});
	const index_2 = require_openapi();
	Object.defineProperty(exports, "openapi", {
		enumerable: true,
		get: function() {
			return index_2.openapi;
		}
	});
	Object.defineProperty(exports, "openAPIToVovkSchema", {
		enumerable: true,
		get: function() {
			return index_2.openAPIToVovkSchema;
		}
	});
	Object.defineProperty(exports, "vovkSchemaToOpenAPI", {
		enumerable: true,
		get: function() {
			return index_2.vovkSchemaToOpenAPI;
		}
	});
	const HttpException_1 = require_HttpException();
	Object.defineProperty(exports, "HttpException", {
		enumerable: true,
		get: function() {
			return HttpException_1.HttpException;
		}
	});
	const createDecorator_1 = require_createDecorator();
	Object.defineProperty(exports, "createDecorator", {
		enumerable: true,
		get: function() {
			return createDecorator_1.createDecorator;
		}
	});
	const JSONLinesResponse_1 = require_JSONLinesResponse();
	Object.defineProperty(exports, "JSONLinesResponse", {
		enumerable: true,
		get: function() {
			return JSONLinesResponse_1.JSONLinesResponse;
		}
	});
	const generateStaticAPI_1 = require_generateStaticAPI();
	Object.defineProperty(exports, "generateStaticAPI", {
		enumerable: true,
		get: function() {
			return generateStaticAPI_1.generateStaticAPI;
		}
	});
	const withValidationLibrary_1 = require_withValidationLibrary();
	Object.defineProperty(exports, "withValidationLibrary", {
		enumerable: true,
		get: function() {
			return withValidationLibrary_1.withValidationLibrary;
		}
	});
	const createStandardValidation_1 = require_createStandardValidation();
	Object.defineProperty(exports, "createStandardValidation", {
		enumerable: true,
		get: function() {
			return createStandardValidation_1.createStandardValidation;
		}
	});
	const multitenant_1 = require_multitenant();
	Object.defineProperty(exports, "multitenant", {
		enumerable: true,
		get: function() {
			return multitenant_1.multitenant;
		}
	});
	const createLLMTools_1 = require_createLLMTools();
	Object.defineProperty(exports, "createLLMTools", {
		enumerable: true,
		get: function() {
			return createLLMTools_1.createLLMTools;
		}
	});
	const createCodeExamples_1 = require_createCodeExamples();
	Object.defineProperty(exports, "createCodeExamples", {
		enumerable: true,
		get: function() {
			return createCodeExamples_1.createCodeExamples;
		}
	});
	const createValidateOnClient_1 = require_createValidateOnClient();
	Object.defineProperty(exports, "createValidateOnClient", {
		enumerable: true,
		get: function() {
			return createValidateOnClient_1.createValidateOnClient;
		}
	});
	_a = (0, createVovkApp_1.createVovkApp)(), exports.get = _a.get, exports.post = _a.post, exports.put = _a.put, exports.patch = _a.patch, exports.del = _a.del, exports.head = _a.head, exports.options = _a.options, exports.prefix = _a.prefix, exports.initSegment = _a.initSegment;
} });

//#endregion
//#region ../packages/vovk-ajv/index.js
var require_vovk_ajv = __commonJS({ "../packages/vovk-ajv/index.js"(exports) {
	var __importDefault = void 0 && (void 0).__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateOnClient = void 0;
	const ajv_1 = require_ajv$1();
	const _2020_1 = __importDefault(require__2020());
	const ajv_formats_1 = __importDefault(require_dist$1());
	const ajv_i18n_1 = __importDefault(require_localize());
	const ajv_errors_1 = __importDefault(require_dist());
	const vovk_1 = require_cjs();
	const createAjv = (options, target) => {
		const AjvClass = target === "draft-2020-12" ? _2020_1.default : ajv_1.Ajv;
		const ajv = new AjvClass({
			allErrors: true,
			...options
		});
		(0, ajv_formats_1.default)(ajv);
		(0, ajv_errors_1.default)(ajv);
		ajv.addKeyword("x-isDto");
		ajv.addKeyword("x-isForm");
		ajv.addKeyword("x-tsType");
		return ajv;
	};
	const validate = ({ input, schema: schema$1, localize = "en", type, endpoint, options, target }) => {
		if (input && schema$1) {
			const schemaTarget = schema$1.$schema?.includes("://json-schema.org/draft-07/schema") ? "draft-07" : "draft-2020-12";
			const ajv = createAjv(options ?? {}, target ?? schemaTarget);
			const isFormData = input instanceof FormData;
			if (input instanceof FormData) {
				const formDataEntries = Array.from(input.entries());
				const result = {};
				formDataEntries.forEach(([key, value]) => {
					let processedValue;
					if (value instanceof Blob) processedValue = "<binary>";
					else if (Array.isArray(value)) processedValue = value.map((item) => item instanceof Blob ? "<binary>" : item);
					else processedValue = value;
					if (key in result) if (Array.isArray(result[key])) result[key].push(processedValue);
					else result[key] = [result[key], processedValue];
					else result[key] = processedValue;
				});
				input = result;
			}
			const isValid = ajv.validate(schema$1, input);
			if (!isValid) {
				ajv_i18n_1.default[localize](ajv.errors);
				throw new vovk_1.HttpException(vovk_1.HttpStatus.NULL, `Ajv validation failed. Invalid ${isFormData ? "form" : type} on client: ${ajv.errorsText()}`, {
					input,
					errors: ajv.errors,
					endpoint
				});
			}
		}
	};
	const getConfig = (schema$1) => {
		const config$1 = schema$1.meta?.config?.libs?.ajv;
		const options = config$1?.options ?? {};
		const localize = config$1?.localize ?? "en";
		const target = config$1?.target;
		return {
			options,
			localize,
			target
		};
	};
	const validateOnClientAjv = (0, vovk_1.createValidateOnClient)({ validate: (input, schema$1, { endpoint, type, fullSchema }) => {
		const { options, localize, target } = getConfig(fullSchema);
		validate({
			input,
			schema: schema$1,
			target,
			localize,
			endpoint,
			options,
			type
		});
	} });
	const configure = ({ options: givenOptions, localize: givenLocalize, target: givenTarget }) => (0, vovk_1.createValidateOnClient)({ validate: (input, schema$1, { endpoint, type, fullSchema }) => {
		const { options, localize, target } = getConfig(fullSchema);
		validate({
			input,
			schema: schema$1,
			target: givenTarget ?? target,
			localize: givenLocalize ?? localize,
			endpoint,
			options: givenOptions ?? options,
			type
		});
	} });
	exports.validateOnClient = Object.assign(validateOnClientAjv, { configure });
} });

//#endregion
//#region tmp_prebundle/index.ts
var import_mjs = __toESM(require_mjs(), 1);
var import_mjs$1 = __toESM(require_mjs(), 1);
var import_vovk_ajv = __toESM(require_vovk_ajv(), 1);
const CommonControllerRPC = (0, import_mjs$1.createRPC)(schema, "foo/client", "CommonControllerRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const StreamingControllerRPC = (0, import_mjs$1.createRPC)(schema, "foo/client", "StreamingControllerRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const StreamingGeneratorControllerRPC = (0, import_mjs$1.createRPC)(schema, "foo/client", "StreamingGeneratorControllerRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const CustomSchemaControllerRPC = (0, import_mjs$1.createRPC)(schema, "foo/client", "CustomSchemaControllerRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const WithZodClientControllerRPC = (0, import_mjs$1.createRPC)(schema, "foo/client", "WithZodClientControllerRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const WithYupClientControllerRPC = (0, import_mjs$1.createRPC)(schema, "foo/client", "WithYupClientControllerRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const WithDtoClientControllerRPC = (0, import_mjs$1.createRPC)(schema, "foo/client", "WithDtoClientControllerRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const OpenApiControllerRPC = (0, import_mjs$1.createRPC)(schema, "foo/client", "OpenApiControllerRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const NoValidationControllerOnlyEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "NoValidationControllerOnlyEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const NoValidationControllerAndServiceEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "NoValidationControllerAndServiceEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const ZodControllerOnlyEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "ZodControllerOnlyEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const ZodControllerAndServiceEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "ZodControllerAndServiceEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const YupControllerOnlyEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "YupControllerOnlyEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const YupControllerAndServiceEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "YupControllerAndServiceEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const DtoControllerOnlyEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "DtoControllerOnlyEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const DtoControllerAndServiceEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "DtoControllerAndServiceEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const ValibotControllerOnlyEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "ValibotControllerOnlyEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const ValibotControllerAndServiceEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "ValibotControllerAndServiceEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const ArktypeControllerOnlyEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "ArktypeControllerOnlyEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});
const ArktypeControllerAndServiceEntityRPC = (0, import_mjs$1.createRPC)(schema, "generated", "ArktypeControllerAndServiceEntityRPC", import_mjs.fetcher, {
	validateOnClient: import_vovk_ajv.validateOnClient,
	apiRoot: "http://localhost:3210/api"
});

//#endregion
exports.ArktypeControllerAndServiceEntityRPC = ArktypeControllerAndServiceEntityRPC;
exports.ArktypeControllerOnlyEntityRPC = ArktypeControllerOnlyEntityRPC;
exports.CommonControllerRPC = CommonControllerRPC;
exports.CustomSchemaControllerRPC = CustomSchemaControllerRPC;
exports.DtoControllerAndServiceEntityRPC = DtoControllerAndServiceEntityRPC;
exports.DtoControllerOnlyEntityRPC = DtoControllerOnlyEntityRPC;
exports.NoValidationControllerAndServiceEntityRPC = NoValidationControllerAndServiceEntityRPC;
exports.NoValidationControllerOnlyEntityRPC = NoValidationControllerOnlyEntityRPC;
exports.OpenApiControllerRPC = OpenApiControllerRPC;
exports.StreamingControllerRPC = StreamingControllerRPC;
exports.StreamingGeneratorControllerRPC = StreamingGeneratorControllerRPC;
exports.ValibotControllerAndServiceEntityRPC = ValibotControllerAndServiceEntityRPC;
exports.ValibotControllerOnlyEntityRPC = ValibotControllerOnlyEntityRPC;
exports.WithDtoClientControllerRPC = WithDtoClientControllerRPC;
exports.WithYupClientControllerRPC = WithYupClientControllerRPC;
exports.WithZodClientControllerRPC = WithZodClientControllerRPC;
exports.YupControllerAndServiceEntityRPC = YupControllerAndServiceEntityRPC;
exports.YupControllerOnlyEntityRPC = YupControllerOnlyEntityRPC;
exports.ZodControllerAndServiceEntityRPC = ZodControllerAndServiceEntityRPC;
exports.ZodControllerOnlyEntityRPC = ZodControllerOnlyEntityRPC;
exports.schema = schema;