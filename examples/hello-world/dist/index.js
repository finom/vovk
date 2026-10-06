//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region ../../packages/vovk/dist/core/http-exception.js
var HTTP_EXCEPTION_BRAND, HttpException;
var init_http_exception = __esmMin(() => {
	HTTP_EXCEPTION_BRAND = Symbol.for("vovk.HttpException");
	HttpException = class extends Error {
		statusCode;
		message;
		cause;
		constructor(statusCode, message, cause) {
			super(message);
			this.statusCode = statusCode;
			this.message = message;
			this.cause = cause;
		}
		toJSON() {
			return {
				isError: true,
				statusCode: this.statusCode,
				message: this.message,
				...this.cause ? { cause: this.cause } : {}
			};
		}
	};
	Object.defineProperty(HttpException.prototype, HTTP_EXCEPTION_BRAND, { value: true });
});
//#endregion
//#region ../../packages/vovk/dist/types/enums.js
var HttpMethod, HttpStatus, VovkSchemaIdEnum;
var init_enums = __esmMin(() => {
	(function(HttpMethod) {
		HttpMethod["GET"] = "GET";
		HttpMethod["POST"] = "POST";
		HttpMethod["PUT"] = "PUT";
		HttpMethod["PATCH"] = "PATCH";
		HttpMethod["DELETE"] = "DELETE";
		HttpMethod["HEAD"] = "HEAD";
		HttpMethod["OPTIONS"] = "OPTIONS";
	})(HttpMethod || (HttpMethod = {}));
	(function(HttpStatus) {
		HttpStatus[HttpStatus["NULL"] = 0] = "NULL";
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
	})(HttpStatus || (HttpStatus = {}));
	(function(VovkSchemaIdEnum) {
		VovkSchemaIdEnum["META"] = "https://vovk.dev/api/schema/v3/meta.json";
		VovkSchemaIdEnum["CONFIG"] = "https://vovk.dev/api/schema/v3/config.json";
		VovkSchemaIdEnum["SEGMENT"] = "https://vovk.dev/api/schema/v3/segment.json";
		VovkSchemaIdEnum["SCHEMA"] = "https://vovk.dev/api/schema/v3/schema.json";
	})(VovkSchemaIdEnum || (VovkSchemaIdEnum = {}));
});
//#endregion
//#region ../../packages/vovk/dist/utils/deep-extend.js
init_http_exception();
init_enums();
/*!
* @description Recursive object extending
* @author Viacheslav Lotsmanov <lotsmanov89@gmail.com>
* @license MIT
*
* The MIT License (MIT)
*
* Copyright (c) 2013-2018 Viacheslav Lotsmanov
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of
* this software and associated documentation files (the "Software"), to deal in
* the Software without restriction, including without limitation the rights to
* use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
* the Software, and to permit persons to whom the Software is furnished to do so,
* subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
* FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
* COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
* IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
* CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
function isBuffer(val) {
	return typeof Buffer !== "undefined" && val instanceof Buffer;
}
function isSpecificValue(val) {
	return isBuffer(val) || val instanceof Date || val instanceof RegExp;
}
function isPlainObject(val) {
	const proto = Object.getPrototypeOf(val);
	return proto === null || Object.getPrototypeOf(proto) === null;
}
function cloneSpecificValue(val) {
	if (isBuffer(val)) return Buffer.from(val);
	else if (val instanceof Date) return new Date(val.getTime());
	else if (val instanceof RegExp) return new RegExp(val);
	else throw new Error("Unexpected situation");
}
function deepCloneArray(arr) {
	const clone = [];
	arr.forEach((item, index) => {
		if (typeof item === "object" && item !== null) if (Array.isArray(item)) clone[index] = deepCloneArray(item);
		else if (isSpecificValue(item)) clone[index] = cloneSpecificValue(item);
		else if (!isPlainObject(item)) clone[index] = item;
		else clone[index] = deepExtend({}, item);
		else clone[index] = item;
	});
	return clone;
}
function safeGetProperty(object, property) {
	return property === "__proto__" ? void 0 : object[property];
}
function deepExtend(...args) {
	if (args.length < 1 || typeof args[0] !== "object") return false;
	if (args.length < 2) return args[0];
	const target = args[0];
	args.slice(1).forEach((obj) => {
		if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return;
		Object.keys(obj).forEach((key) => {
			const old = safeGetProperty(target, key);
			const val = safeGetProperty(obj, key);
			if (val === target) return;
			else if (typeof val !== "object" || val === null) {
				target[key] = val;
				return;
			} else if (Array.isArray(val)) {
				target[key] = deepCloneArray(val);
				return;
			} else if (isSpecificValue(val)) {
				target[key] = cloneSpecificValue(val);
				return;
			} else if (!isPlainObject(val)) {
				target[key] = val;
				return;
			} else if (typeof old !== "object" || old === null || Array.isArray(old) || !isPlainObject(old)) {
				target[key] = deepExtend({}, val);
				return;
			} else {
				target[key] = deepExtend(old, val);
				return;
			}
		});
	});
	return target;
}
const getNestedValue = (obj, path) => {
	return path.split(".").reduce((o, key) => o && typeof o === "object" ? o[key] : void 0, obj);
};
const defaultHandler = async ({ response, schema }) => {
	let result;
	try {
		const text = response.body === null ? "" : await response.text();
		result = text === "" ? null : JSON.parse(text);
	} catch (e) {
		throw new HttpException(response.status, e?.message ?? "Unknown error at defaultHandler");
	}
	if (!response.ok) {
		const errorKey = schema.operationObject && "x-errorMessageKey" in schema.operationObject ? schema.operationObject["x-errorMessageKey"] : "message";
		const errorResponse = result ?? {};
		const message = getNestedValue(errorResponse, errorKey) ?? errorResponse.detail ?? errorResponse.title;
		throw new HttpException(response.status, message ?? "Unknown error at defaultHandler", errorResponse.cause ?? JSON.stringify(result));
	}
	return result;
};
//#endregion
//#region ../../packages/vovk/dist/utils/shim.js
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
//#endregion
//#region ../../packages/vovk/dist/client/default-stream-handler.js
init_http_exception();
const ERROR_LINE_KEYS = /* @__PURE__ */ new Set([
	"isError",
	"reason",
	"statusCode"
]);
const isErrorLine = (data) => typeof data === "object" && data !== null && data.isError === true && "reason" in data && Object.keys(data).every((key) => ERROR_LINE_KEYS.has(key));
const toStreamError = ({ reason, statusCode }) => {
	if (reason !== null && reason !== void 0 && typeof reason !== "string") return reason;
	const message = reason ?? "An unknown error at the default stream handler";
	return typeof statusCode === "number" ? new HttpException(statusCode, message) : new Error(message);
};
const toJSONLinesError = (cause) => {
	const error = /* @__PURE__ */ new Error(`JSONLines stream error. ${String(cause)}`);
	error.cause = cause;
	return error;
};
const readableStreamToAsyncIterable = ({ readableStream, abortController }) => {
	const reader = readableStream.getReader();
	const subscribers = /* @__PURE__ */ new Set();
	const decoder = new TextDecoder();
	let text = "";
	const kept = [];
	let keptFrom = 0;
	const cursors = /* @__PURE__ */ new Set();
	let exhausted = false;
	let stopped = false;
	let hasStreamError = false;
	let streamError = null;
	let errorIndex = -1;
	let reading = null;
	let collecting = null;
	const dropPassed = (leftAt = keptFrom) => {
		let oldest = cursors.size ? Number.POSITIVE_INFINITY : leftAt;
		for (const cursor of cursors) oldest = Math.min(oldest, cursor.index);
		if (oldest > keptFrom) {
			kept.splice(0, oldest - keptFrom);
			keptFrom = oldest;
		}
	};
	const fail = (error) => {
		hasStreamError = true;
		streamError = error;
		errorIndex = keptFrom + kept.length;
		exhausted = true;
	};
	const release = (reason) => {
		exhausted = true;
		abortController?.abort(reason);
		reader.cancel().catch(() => {});
	};
	const stop = (reason) => {
		stopped = true;
		kept.length = 0;
		release(reason);
	};
	const isStopped = () => stopped || !!abortController?.signal.aborted;
	const handleLine = (line) => {
		if (!line.trim()) return true;
		let data;
		try {
			data = JSON.parse(line);
		} catch (error) {
			fail(toJSONLinesError(error));
			release(error);
			return false;
		}
		if (isErrorLine(data)) {
			fail(toStreamError(data));
			release(data.reason);
			return false;
		}
		const index = keptFrom + kept.length;
		for (const cb of subscribers) if (!isStopped()) cb(data, index);
		if (isStopped()) return false;
		kept.push(data);
		return true;
	};
	const handleText = (isLast) => {
		let lineStart = 0;
		let newlineIndex = text.indexOf("\n");
		while (newlineIndex !== -1) {
			const line = text.slice(lineStart, newlineIndex);
			lineStart = newlineIndex + 1;
			if (!handleLine(line)) {
				text = "";
				return;
			}
			newlineIndex = text.indexOf("\n", lineStart);
		}
		text = text.slice(lineStart);
		if (isLast && text.trim()) handleLine(text.trim());
	};
	const readChunk = async () => {
		let result;
		try {
			result = await reader.read();
		} catch (error) {
			if (!exhausted) fail(toJSONLinesError(error));
			return;
		}
		if (exhausted) return;
		const { done, value } = result;
		text += done ? decoder.decode() : typeof value === "string" ? value : typeof value === "number" ? String.fromCharCode(value) : decoder.decode(value, { stream: true });
		try {
			handleText(done);
		} catch (error) {
			text = "";
			fail(error);
			release(error);
			return;
		}
		if (done) exhausted = true;
	};
	const read = () => {
		reading ??= readChunk().finally(() => {
			reading = null;
		});
		return reading;
	};
	async function* iterate() {
		const cursor = { index: keptFrom };
		cursors.add(cursor);
		try {
			while (!stopped) if (cursor.index < keptFrom + kept.length) {
				const item = kept[cursor.index - keptFrom];
				cursor.index++;
				dropPassed();
				yield item;
			} else if (hasStreamError && cursor.index >= errorIndex) throw streamError;
			else if (exhausted) return;
			else await read();
		} finally {
			cursors.delete(cursor);
			dropPassed(cursor.index);
			if (!cursors.size && !exhausted) release("Stream iteration stopped");
		}
	}
	const asPromise = async () => {
		collecting ??= (async () => {
			const items = [];
			for await (const item of iterate()) items.push(item);
			return items;
		})();
		return [...await collecting];
	};
	return {
		asPromise,
		[Symbol.asyncIterator]: iterate,
		[Symbol.dispose]: () => stop("Stream disposed"),
		[Symbol.asyncDispose]: async () => stop("Stream async disposed"),
		abortSilently: stop,
		onIterate: (cb) => {
			if (abortController?.signal.aborted) return () => {};
			subscribers.add(cb);
			return () => subscribers.delete(cb);
		}
	};
};
const defaultStreamHandler = ({ response, abortController }) => {
	if (!response.ok) {
		let cachedError = null;
		let errorParsed = false;
		response.json().then((res) => {
			cachedError = new HttpException(response.status, res.message ?? "An unknown error at the default stream handler");
		}).catch((e) => {
			cachedError = new HttpException(response.status, e.message ?? "An unknown error at the default stream handler", e);
		}).finally(() => {
			errorParsed = true;
		});
		const getError = async () => {
			while (!errorParsed) await new Promise((resolve) => setTimeout(resolve, 0));
			return cachedError ?? new HttpException(response.status, "An unknown error at the default stream handler");
		};
		const errorIterator = () => ({ async next() {
			throw await getError();
		} });
		const noop = () => {};
		return {
			status: response.status,
			asPromise: async () => {
				throw await getError();
			},
			abortController,
			[Symbol.asyncIterator]: errorIterator,
			[Symbol.dispose]: noop,
			[Symbol.asyncDispose]: async () => {},
			abortSilently: noop,
			onIterate: () => noop
		};
	}
	if (!response.body) throw new HttpException(HttpStatus.NULL, "Stream body is falsy");
	return {
		status: response.status,
		abortController,
		...readableStreamToAsyncIterable({
			readableStream: response.body,
			abortController
		})
	};
};
//#endregion
//#region ../../packages/vovk/dist/utils/file-name-to-disposition.js
function fileNameToDisposition(filename) {
	return `attachment; filename="${filename.replace(/[^\x20-\x7E]|"/g, "_")}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
var init_file_name_to_disposition = __esmMin(() => {});
//#endregion
//#region ../../packages/vovk/dist/utils/media-types.js
function getBinaryContentType(ownType, declared) {
	const takes = (mediaType) => !declared.length || declared.some((pattern) => matchesMediaType(mediaType, pattern));
	if (ownType) {
		if (takes(ownType.split(";")[0].trim().toLowerCase())) return ownType;
		return declared.includes("application/octet-stream") ? "application/octet-stream" : ownType;
	}
	const binaryType = declared.find((type) => !type.includes("*") && !FORM_MEDIA_TYPES.includes(type) && !isJSONMediaType(type)) ?? declared.find((type) => type !== "*/*" && type.endsWith("/*"));
	if (binaryType) return binaryType;
	if (takes("application/octet-stream")) return "application/octet-stream";
	return declared.find((type) => isJSONMediaType(type) || type === "application/x-www-form-urlencoded") ?? "application/octet-stream";
}
var JSON_LINES_MEDIA_TYPES, FORM_MEDIA_TYPES, isJSONMediaType, matchesMediaType;
var init_media_types = __esmMin(() => {
	JSON_LINES_MEDIA_TYPES = [
		"application/jsonl",
		"application/jsonlines",
		"application/x-ndjson"
	];
	FORM_MEDIA_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
	isJSONMediaType = (mediaType) => mediaType === "application/json" || mediaType.endsWith("+json");
	matchesMediaType = (mediaType, pattern) => pattern === "*/*" || (pattern.endsWith("/*") ? mediaType.startsWith(pattern.slice(0, -1)) : mediaType === pattern);
});
//#endregion
//#region ../../packages/vovk/dist/client/takes-null-body.js
var acceptsNull, isJSONContentType$1, takesNullBody;
var init_takes_null_body = __esmMin(() => {
	acceptsNull = (schema) => {
		if (typeof schema !== "object" || schema === null) return false;
		const { type, nullable, anyOf, oneOf } = schema;
		return type === "null" || Array.isArray(type) && type.includes("null") || nullable === true || [anyOf, oneOf].some((branches) => Array.isArray(branches) && branches.some(acceptsNull));
	};
	isJSONContentType$1 = (contentType) => {
		const mediaType = contentType.split(";")[0].trim().toLowerCase();
		return mediaType === "application/json" || mediaType.endsWith("+json");
	};
	takesNullBody = (bodySchema) => {
		if (!acceptsNull(bodySchema)) return false;
		const declared = bodySchema["x-contentType"];
		return !declared || declared.some(isJSONContentType$1);
	};
});
//#endregion
//#region ../../packages/vovk/dist/client/fetcher.js
var fetcher_exports = /* @__PURE__ */ __exportAll({
	createFetcher: () => createFetcher,
	fetcher: () => fetcher
});
function wrapStreamErrors(stream, emitError) {
	let emitted = false;
	const emitOnce = async (error) => {
		if (emitted) return;
		emitted = true;
		await emitError(error);
	};
	const getIterator = stream[Symbol.asyncIterator].bind(stream);
	const asPromise = stream.asPromise.bind(stream);
	return Object.assign(stream, {
		[Symbol.asyncIterator]: () => {
			const iterator = getIterator();
			return {
				next: async () => {
					try {
						return await iterator.next();
					} catch (error) {
						await emitOnce(error);
						throw error;
					}
				},
				return: iterator.return?.bind(iterator),
				throw: iterator.throw?.bind(iterator)
			};
		},
		asPromise: async () => {
			try {
				return await asPromise();
			} catch (error) {
				await emitOnce(error);
				throw error;
			}
		}
	});
}
function anySignal(controller, signal) {
	if (typeof AbortSignal.any === "function") return AbortSignal.any([controller.signal, signal]);
	if (signal.aborted) controller.abort(signal.reason);
	else signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
	return controller.signal;
}
/**
* Creates a customizable fetcher function for client requests.
* @see https://vovk.dev/imports
*/
function createFetcher({ prepareRequestInit, transformResponse, onSuccess: onSuccessInit, onError: onErrorInit } = {}) {
	const onSuccessCallbacks = onSuccessInit ? [onSuccessInit] : [];
	const onErrorCallbacks = onErrorInit ? [onErrorInit] : [];
	const newFetcher = async ({ httpMethod, getURL, validate, defaultHandler, defaultStreamHandler, schema }, inputOptions) => {
		let response = null;
		let respData = null;
		let requestInit = null;
		try {
			const { meta, apiRoot, disableClientValidation, init, interpretAs } = inputOptions;
			let { body, query, params } = inputOptions;
			if (!disableClientValidation) {
				const endpoint = getURL({
					apiRoot,
					params,
					query
				});
				try {
					({body, query, params} = await validate(inputOptions, { endpoint }) ?? {
						body,
						query,
						params
					});
				} catch (e) {
					if (e instanceof HttpException) throw e;
					throw new HttpException(HttpStatus.NULL, e.message ?? DEFAULT_ERROR_MESSAGE, {
						body,
						query,
						params,
						endpoint
					});
				}
			}
			const endpoint = getURL({
				apiRoot,
				params,
				query
			});
			const missingParams = Array.from(endpoint.split("?")[0].matchAll(/\{([^}]+)\}/g), ([, name]) => name);
			if (missingParams.length) throw new HttpException(HttpStatus.NULL, `Missing params: ${missingParams.join(", ")} in ${endpoint}`, {
				body,
				query,
				params,
				endpoint
			});
			const bodySchema = schema.validation?.body;
			const declaredContentTypes = (bodySchema?.["x-contentType"] ?? (bodySchema ? ["application/json"] : [])).map(getMediaType);
			const hasBody = body !== void 0 && (body !== null || takesNullBody(bodySchema));
			const isBinary = body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body);
			const resolvedContentType = !hasBody ? void 0 : body instanceof FormData ? void 0 : body instanceof URLSearchParams ? "application/x-www-form-urlencoded" : typeof body === "string" ? getStringBodyContentType(declaredContentTypes) : isBinary ? getBinaryContentType(body instanceof Blob ? body.type : "", declaredContentTypes) : "application/json";
			const resolvedFileName = body instanceof File ? body.name : void 0;
			const defaultHeaders = {
				accept: [...JSON_LINES_MEDIA_TYPES, "application/json"].join(", "),
				...resolvedContentType ? { "content-type": resolvedContentType } : {},
				...resolvedFileName ? { "content-disposition": fileNameToDisposition(resolvedFileName) } : {},
				...meta ? { "x-meta": toAsciiJson(meta) } : {}
			};
			const userHeaders = init?.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {};
			requestInit = {
				method: httpMethod,
				...init,
				headers: {
					...defaultHeaders,
					...userHeaders
				}
			};
			if (body instanceof FormData || body instanceof URLSearchParams || isBinary) requestInit.body = body;
			else if (typeof body === "string") requestInit.body = resolvedContentType === "application/json" ? JSON.stringify(body) : body;
			else if (hasBody) requestInit.body = JSON.stringify(body);
			const abortController = new AbortController();
			requestInit.signal = init?.signal ? anySignal(abortController, init.signal) : abortController.signal;
			requestInit = prepareRequestInit ? await prepareRequestInit(requestInit, inputOptions) : requestInit;
			try {
				response = await fetch(endpoint, requestInit);
			} catch (e) {
				if (requestInit.signal?.aborted) throw e;
				throw new HttpException(HttpStatus.NULL, `${e?.message ?? DEFAULT_ERROR_MESSAGE} ${endpoint}`, e);
			}
			const mediaType = getMediaType(interpretAs ?? response.headers.get("content-type"));
			const isJSONLines = JSON_LINES_MEDIA_TYPES.includes(mediaType);
			if (isJSONLines && response.body) respData = wrapStreamErrors(defaultStreamHandler({
				response,
				abortController
			}), async (error) => {
				for (const cb of [...onErrorCallbacks]) await cb(error, inputOptions, {
					response,
					init: requestInit,
					respData,
					schema
				});
			});
			else if (isJSONLines || isJSONMediaType(mediaType)) respData = await defaultHandler({
				response,
				schema
			});
			else if (response.status >= 400) {
				const text = await response.text().catch(() => "");
				throw new HttpException(response.status, text || response.statusText || DEFAULT_ERROR_MESSAGE);
			} else respData = response;
			respData = transformResponse ? await transformResponse(respData, inputOptions, {
				response,
				init: requestInit,
				schema
			}) : respData;
			for (const cb of [...onSuccessCallbacks]) await cb(respData, inputOptions, {
				response,
				init: requestInit,
				schema
			});
			return [respData, response];
		} catch (error) {
			for (const cb of [...onErrorCallbacks]) await cb(error, inputOptions, {
				response,
				init: requestInit,
				respData,
				schema
			});
			throw error;
		}
	};
	return Object.assign(newFetcher, {
		onSuccess(cb) {
			onSuccessCallbacks.push(cb);
			return () => {
				const index = onSuccessCallbacks.indexOf(cb);
				if (index !== -1) onSuccessCallbacks.splice(index, 1);
			};
		},
		onError(cb) {
			onErrorCallbacks.push(cb);
			return () => {
				const index = onErrorCallbacks.indexOf(cb);
				if (index !== -1) onErrorCallbacks.splice(index, 1);
			};
		}
	});
}
var DEFAULT_ERROR_MESSAGE, toAsciiJson, getMediaType, getStringBodyContentType, fetcher;
var init_fetcher = __esmMin(() => {
	init_http_exception();
	init_enums();
	init_file_name_to_disposition();
	init_media_types();
	init_takes_null_body();
	DEFAULT_ERROR_MESSAGE = "Unknown error at default fetcher";
	toAsciiJson = (value) => JSON.stringify(value).replace(/[\u007f-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
	getMediaType = (contentType) => contentType?.split(";")[0].trim().toLowerCase() ?? "";
	getStringBodyContentType = (declared) => declared.find((type) => !type.includes("*") && !FORM_MEDIA_TYPES.includes(type) && !isJSONMediaType(type)) ?? (!declared.length || declared.some(isJSONMediaType) ? "application/json" : "text/plain");
	fetcher = createFetcher();
});
//#endregion
//#region ../../packages/vovk/dist/client/serialize-query.js
init_fetcher();
const encodeURIComponentWellFormed = (value) => encodeURIComponent(value.replace(/[\uD800-\uDFFF]/gu, "�"));
function buildParams(key, value, isToJSONResult = false) {
	if (value === null || value === void 0) return [];
	if (!isToJSONResult && typeof value.toJSON === "function") return buildParams(key, value.toJSON(), true);
	if (typeof value === "object") {
		if (Array.isArray(value)) {
			let index = 0;
			return value.flatMap((v) => {
				const params = buildParams(`${key}[${index}]`, v);
				if (params.length) index++;
				return params;
			});
		}
		return Object.keys(value).flatMap((k) => {
			return buildParams(`${key}[${k}]`, value[k]);
		});
	}
	return [`${encodeURIComponentWellFormed(key)}=${encodeURIComponentWellFormed(String(value))}`];
}
function serializeQuery(obj) {
	if (!obj || typeof obj !== "object") return "";
	const segments = [];
	for (const key in obj) if (Object.hasOwn(obj, key)) {
		const value = obj[key];
		segments.push(...buildParams(key, value));
	}
	return segments.join("&");
}
//#endregion
//#region ../../packages/vovk/dist/client/serialize-styled.js
const DELIMITERS = {
	form: ",",
	spaceDelimited: " ",
	pipeDelimited: "|"
};
const isObject = (value) => typeof value === "object" && value !== null && !(value instanceof Date);
const fromJSON = (value) => typeof value?.toJSON === "function" ? value.toJSON() : value;
const toPart = (given) => {
	const value = fromJSON(given);
	if (value === null || value === void 0) return null;
	return isObject(value) ? JSON.stringify(value) : String(value);
};
function toDeepFields(key, given) {
	const value = fromJSON(given);
	if (isObject(value)) return Object.entries(value).flatMap(([k, v]) => toDeepFields(`${key}[${k}]`, v));
	const part = toPart(value);
	return part === null ? [] : [{
		key,
		parts: [part],
		delimiter: ""
	}];
}
function toFields(name, given, { style = "form", explode = style === "form" }) {
	const value = fromJSON(given);
	if (style === "deepObject" && isObject(value)) return toDeepFields(name, value);
	const delimiter = DELIMITERS[style] ?? ",";
	if (isObject(value)) {
		const kept = (Array.isArray(value) ? value.map((item) => [name, toPart(item)]) : Object.entries(value).map(([key, item]) => [key, toPart(item)])).filter((entry) => entry[1] !== null);
		if (!kept.length) return [];
		if (explode) return kept.map(([key, part]) => ({
			key,
			parts: [part],
			delimiter
		}));
		return [{
			key: name,
			parts: Array.isArray(value) ? kept.map(([, part]) => part) : kept.flat(),
			delimiter
		}];
	}
	const part = toPart(value);
	return part === null ? [] : [{
		key: name,
		parts: [part],
		delimiter
	}];
}
const encodeField = ({ key, parts, delimiter }) => `${encodeURIComponentWellFormed(key)}=${parts.map(encodeURIComponentWellFormed).join(delimiter === " " ? "%20" : delimiter)}`;
function getStyledSerializers(handlerSchema) {
	const { misc } = handlerSchema;
	if (!misc?.isOpenAPIMixin) return null;
	const queryStyles = misc.queryStyles ?? {};
	const formStyles = misc.formStyles ?? {};
	return {
		serializeQuery: (query) => Object.entries(query).flatMap(([name, value]) => toFields(name, value, queryStyles[name] ?? {})).map(encodeField).join("&"),
		appendFormField: (form, name, value) => {
			if (!Object.hasOwn(formStyles, name)) return false;
			const fields = toFields(name, value, formStyles[name]);
			for (const { key, parts, delimiter } of fields) form.append(key, parts.join(delimiter));
			return true;
		}
	};
}
//#endregion
//#region ../../packages/vovk/dist/client/create-rpc.js
init_http_exception();
init_enums();
init_takes_null_body();
const trimPath = (path) => path.trim().replace(/^\/|\/$/g, "");
const isUnsafeSegment = (value) => /^(?:\.|%2e){0,2}$/i.test(value);
const getHandlerPath = (endpoint, params) => {
	let result = endpoint;
	for (const [key, given] of Object.entries(params ?? {})) {
		const placeholder = `{${key}}`;
		const value = fromJSON(given);
		if (!result.includes(placeholder) || value === void 0 || value === null) continue;
		const segment = String(value);
		if (isUnsafeSegment(segment)) throw new HttpException(HttpStatus.NULL, `Param "${key}" can't be empty, "." or "..", got ${JSON.stringify(segment)} in ${endpoint}`, { params });
		result = result.replaceAll(placeholder, () => encodeURIComponentWellFormed(segment));
	}
	return result;
};
const FORM_CONTENT_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
const toFormValue = (value) => {
	if (value === void 0 || value === null) return null;
	if (value instanceof Blob) return value;
	if (value instanceof Date) return value.toJSON();
	return typeof value === "object" ? JSON.stringify(value) : String(value);
};
const isFormSource = (body) => typeof body === "object" && body !== null && !(body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob);
const isJSONContentType = (type) => type === "application/json" || type.endsWith("+json");
const holdsBlob = (source) => Object.values(source).some((value) => [value].flat().some((item) => item instanceof Blob));
const toFormBody = (source, contentTypes, appendStyledField) => {
	const form = contentTypes.includes("multipart/form-data") ? new FormData() : new URLSearchParams();
	for (const [key, value] of Object.entries(source)) {
		if (form instanceof URLSearchParams && appendStyledField?.(form, key, value)) continue;
		for (const item of Array.isArray(value) ? value : [value]) {
			const formValue = toFormValue(item);
			if (formValue === null) continue;
			if (form instanceof FormData) form.append(key, formValue);
			else form.append(key, String(formValue));
		}
	}
	return form;
};
const toURLEncodedForm = (form, contentTypes) => contentTypes.includes("application/x-www-form-urlencoded") && !contentTypes.includes("multipart/form-data") && !Array.from(form.values()).some((value) => value instanceof Blob) ? new URLSearchParams(Array.from(form.entries())) : form;
const resolveValidateOnClient = async (validateOnClient) => validateOnClient instanceof Promise ? (await validateOnClient)?.validateOnClient : validateOnClient;
const mergeOptions = (...layers) => {
	const merged = deepExtend({}, ...layers);
	const headerLayers = layers.map((layer) => layer?.init?.headers);
	if (!headerLayers.some(Boolean)) return merged;
	const headers = new Headers();
	for (const layer of headerLayers) for (const [key, value] of new Headers(layer)) headers.set(key, value);
	merged.init = {
		...merged.init,
		headers: Object.fromEntries(headers.entries())
	};
	return merged;
};
/**
* Creates a client-side RPC module for interacting with server-side controllers.
* @see https://vovk.dev/typescript
*/
const createRPC = (givenSchema, segmentName, rpcModuleName, givenFetcher, options) => {
	const schema = givenSchema;
	const segmentNamePath = options?.segmentNameOverride ?? segmentName;
	const segmentSchema = schema.segments[segmentName];
	if (!segmentSchema) throw new Error(`Unable to create RPC module. Segment schema is missing for segment "${segmentName}".`);
	let controllerSchema = schema.segments[segmentName]?.controllers[rpcModuleName];
	const client = {};
	if (!controllerSchema) {
		console.warn(`🐺 Unable to create RPC module. Controller schema is missing for module "${rpcModuleName}" from segment "${segmentName}". Assuming that schema is not ready yet and a segment is importing an uncompiled RPC module.`);
		controllerSchema = {
			rpcModuleName,
			prefix: "",
			handlers: {}
		};
	}
	const controllerPrefix = trimPath(controllerSchema.prefix ?? "");
	const forceApiRoot = segmentSchema.forceApiRoot;
	const configRootEntry = schema.meta?.config?.rootEntry;
	const originalApiRoot = forceApiRoot ?? options?.apiRoot ?? (typeof configRootEntry === "string" ? `/${configRootEntry}` : "/api");
	for (const [staticMethodName, handlerSchema] of Object.entries(controllerSchema.handlers ?? {})) {
		const { path, httpMethod, validation } = handlerSchema;
		const styled = getStyledSerializers(handlerSchema);
		const getURL = ({ apiRoot, params, query } = {}) => {
			apiRoot = apiRoot ?? originalApiRoot;
			const hasHost = /^([a-z][a-z\d+.-]*:)?\/\//i.test(apiRoot);
			const endpoint = [
				apiRoot,
				forceApiRoot ? "" : segmentNamePath,
				getHandlerPath([controllerPrefix, path].filter(Boolean).join("/"), params)
			].filter(Boolean).join("/").replace(/([^:])\/+/g, "$1/");
			const queryStr = query ? (styled?.serializeQuery ?? serializeQuery)(query) : "";
			const url = hasHost ? endpoint : `/${endpoint.replace(/^\/+/, "")}`;
			return queryStr ? `${url}?${queryStr}` : url;
		};
		const handler = (async (input = {}) => {
			const optionsResolvedValidateOnClient = await resolveValidateOnClient(options?.validateOnClient);
			const inputResolvedValidateOnClient = await resolveValidateOnClient(input.validateOnClient);
			const fetcher$1 = input.fetcher ?? (givenFetcher instanceof Promise ? (await givenFetcher).fetcher : givenFetcher ?? fetcher);
			const contentTypes = validation?.body?.["x-contentType"] ?? [];
			const givenBody = input.body === null && !takesNullBody(validation?.body) ? void 0 : input.body;
			const formSource = contentTypes.some((type) => FORM_CONTENT_TYPES.includes(type)) && isFormSource(givenBody) && (!contentTypes.some(isJSONContentType) || holdsBlob(givenBody)) ? givenBody : null;
			const body = formSource ? toFormBody(formSource, contentTypes, styled?.appendFormField) : givenBody instanceof FormData ? toURLEncodedForm(givenBody, contentTypes) : givenBody;
			const validate = async (validationInput, { endpoint }) => {
				const validateOnClient = inputResolvedValidateOnClient ?? optionsResolvedValidateOnClient;
				if (validateOnClient && validation) {
					if (typeof validateOnClient !== "function") throw new Error("validateOnClient must be a function");
					const validatesFormSource = formSource !== null && validationInput.body === body;
					const toValidate = validatesFormSource ? {
						...validationInput,
						body: formSource
					} : { ...validationInput };
					const validated = await validateOnClient(toValidate, validation, {
						fullSchema: schema,
						endpoint
					}) ?? toValidate;
					return validatesFormSource && isFormSource(validated.body) ? {
						...validated,
						body: toFormBody(validated.body, contentTypes, styled?.appendFormField)
					} : validated;
				}
				return validationInput;
			};
			const internalOptions = {
				name: staticMethodName,
				httpMethod,
				getURL,
				validate,
				defaultHandler,
				defaultStreamHandler,
				schema: handlerSchema
			};
			const internalInput = {
				...mergeOptions(options, { validateOnClient: optionsResolvedValidateOnClient }, input),
				body,
				query: input.query ?? {},
				params: input.params ?? {}
			};
			if (!fetcher$1) throw new Error("Fetcher is not provided");
			const [respData, resp] = await fetcher$1(internalOptions, internalInput);
			return input.transform ? input.transform(respData, resp) : respData;
		});
		handler.schema = handlerSchema;
		handler.controllerSchema = controllerSchema;
		handler.segmentSchema = segmentSchema;
		handler.fullSchema = schema;
		handler.isRPC = true;
		handler.apiRoot = originalApiRoot;
		handler.getURL = getURL;
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
	Object.defineProperty(client, "withDefaults", {
		value: (newOptions) => {
			return createRPC(schema, segmentName, rpcModuleName, givenFetcher, mergeOptions(options, newOptions));
		},
		enumerable: false,
		writable: false,
		configurable: false
	});
	return client;
};
const schema = {
	$schema: "https://vovk.dev/api/schema/v3/schema.json",
	segments: {
		"": {
			$schema: "https://vovk.dev/api/schema/v3/segment.json",
			emitSchema: true,
			segmentName: "",
			segmentType: "segment",
			controllers: {
				"UserRPC": {
					"rpcModuleName": "UserRPC",
					"originalControllerName": "UserController",
					"prefix": "users",
					"handlers": { "updateUser": {
						"validation": {
							"body": {
								"$schema": "https://json-schema.org/draft/2020-12/schema",
								"type": "object",
								"properties": {
									"email": {
										"type": "string",
										"format": "email",
										"pattern": "^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
										"description": "User email",
										"examples": ["john@example.com", "jane@example.com"]
									},
									"profile": {
										"type": "object",
										"properties": {
											"name": {
												"type": "string",
												"minLength": 2,
												"description": "User full name",
												"examples": ["John Doe", "Jane Smith"]
											},
											"age": {
												"type": "integer",
												"minimum": 16,
												"maximum": 120,
												"description": "User age",
												"examples": [25, 30]
											}
										},
										"required": ["name", "age"],
										"description": "User profile object"
									}
								},
								"required": ["email", "profile"],
								"description": "User data object"
							},
							"query": {
								"$schema": "https://json-schema.org/draft/2020-12/schema",
								"type": "object",
								"properties": { "notify": {
									"type": "string",
									"enum": [
										"email",
										"push",
										"none"
									],
									"description": "Notification type"
								} },
								"required": ["notify"],
								"description": "Query parameters"
							},
							"params": {
								"$schema": "https://json-schema.org/draft/2020-12/schema",
								"type": "object",
								"properties": { "id": {
									"type": "string",
									"format": "uuid",
									"pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
									"description": "User ID",
									"examples": ["123e4567-e89b-12d3-a456-426614174000"]
								} },
								"required": ["id"],
								"description": "Path parameters"
							},
							"output": {
								"$schema": "https://json-schema.org/draft/2020-12/schema",
								"type": "object",
								"properties": {
									"success": {
										"type": "boolean",
										"description": "Success status"
									},
									"id": {
										"type": "string",
										"format": "uuid",
										"pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
										"description": "User ID"
									},
									"notify": {
										"type": "string",
										"enum": [
											"email",
											"push",
											"none"
										],
										"description": "Notification type"
									}
								},
								"required": [
									"success",
									"id",
									"notify"
								],
								"additionalProperties": false,
								"description": "Response object"
							}
						},
						"operationObject": {
							"summary": "Update user",
							"description": "Update user by ID"
						},
						"path": "{id}",
						"httpMethod": "POST"
					} }
				},
				"StreamRPC": {
					"rpcModuleName": "StreamRPC",
					"originalControllerName": "StreamController",
					"prefix": "streams",
					"handlers": { "streamTokens": {
						"validation": { "iteration": {
							"$schema": "https://json-schema.org/draft/2020-12/schema",
							"type": "object",
							"properties": { "message": {
								"type": "string",
								"description": "Message from the token"
							} },
							"required": ["message"],
							"additionalProperties": false,
							"description": "Streamed token object"
						} },
						"operationObject": {
							"summary": "Stream tokens",
							"description": "Stream tokens to the client"
						},
						"path": "tokens",
						"httpMethod": "GET"
					} }
				}
			}
		},
		static: {
			$schema: "https://vovk.dev/api/schema/v3/segment.json",
			emitSchema: true,
			segmentName: "static",
			segmentType: "segment",
			controllers: { "OpenApiRPC": {
				"rpcModuleName": "OpenApiRPC",
				"originalControllerName": "OpenApiController",
				"prefix": "",
				"handlers": { "getSpec": {
					"path": "openapi.json",
					"httpMethod": "GET",
					"operationObject": {
						"summary": "OpenAPI spec",
						"description": "Get the OpenAPI spec for the \"Hello World\" app API"
					}
				} }
			} }
		}
	},
	meta: {
		$schema: "https://vovk.dev/api/schema/v3/meta.json",
		config: {
			"libs": {},
			"rootEntry": "api",
			"$schema": "https://vovk.dev/api/schema/v3/config.json"
		}
	}
};
//#endregion
//#region tmp_prebundle/index.ts
const UserRPC = createRPC(schema, "", "UserRPC", Promise.resolve().then(() => (init_fetcher(), fetcher_exports)), {
	validateOnClient: void 0,
	apiRoot: "https://hello-world.vovk.dev/api"
});
const StreamRPC = createRPC(schema, "", "StreamRPC", Promise.resolve().then(() => (init_fetcher(), fetcher_exports)), {
	validateOnClient: void 0,
	apiRoot: "https://hello-world.vovk.dev/api"
});
const OpenApiRPC = createRPC(schema, "static", "OpenApiRPC", Promise.resolve().then(() => (init_fetcher(), fetcher_exports)), {
	validateOnClient: void 0,
	apiRoot: "https://hello-world.vovk.dev/api"
});
//#endregion
export { OpenApiRPC, StreamRPC, UserRPC, schema };
