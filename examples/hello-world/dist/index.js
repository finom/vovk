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
//#region ../../packages/vovk/dist/utils/deep-extend.js
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
function isSpecificValue(val) {
	return val instanceof Buffer || val instanceof Date || val instanceof RegExp;
}
function isPlainObject(val) {
	const proto = Object.getPrototypeOf(val);
	return proto === Object.prototype || proto === null;
}
function cloneSpecificValue(val) {
	if (val instanceof Buffer) {
		const x = Buffer.alloc ? Buffer.alloc(val.length) : Buffer.from(val);
		val.copy(x);
		return x;
	} else if (val instanceof Date) return new Date(val.getTime());
	else if (val instanceof RegExp) return new RegExp(val);
	else throw new Error("Unexpected situation");
}
/**
* Recursive cloning array.
*/
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
			const src = safeGetProperty(target, key);
			const val = safeGetProperty(obj, key);
			if (val === target) return;
			else if (typeof val !== "object" || val === null) {
				/**
				* if new value isn't object then just overwrite by new value
				* instead of extending.
				*/
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
			} else if (typeof src !== "object" || src === null || Array.isArray(src) || !isPlainObject(src)) {
				target[key] = deepExtend({}, val);
				return;
			} else {
				target[key] = deepExtend(src, val);
				return;
			}
		});
	});
	return target;
}
//#endregion
//#region ../../packages/vovk/dist/core/http-exception.js
var HttpException;
var init_http_exception = __esmMin(() => {
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
});
//#endregion
//#region ../../packages/vovk/dist/client/default-handler.js
init_http_exception();
const getNestedValue = (obj, path) => {
	return path.split(".").reduce((o, key) => o && typeof o === "object" ? o[key] : void 0, obj);
};
const defaultHandler = async ({ response, schema }) => {
	let result;
	try {
		result = await response.json();
	} catch (e) {
		throw new HttpException(response.status, e?.message ?? "Unknown error at defaultHandler");
	}
	if (!response.ok) {
		const errorKey = schema.operationObject && "x-errorMessageKey" in schema.operationObject ? schema.operationObject["x-errorMessageKey"] : "message";
		const errorResponse = result;
		throw new HttpException(response.status, getNestedValue(errorResponse, errorKey) ?? "Unknown error at defaultHandler", errorResponse?.cause ?? JSON.stringify(result));
	}
	return result;
};
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
//#region ../../packages/vovk/dist/utils/shim.js
init_enums();
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
/** ReadableStream of JSON Lines to VovkStreamAsyncIterable, reusable outside HTTP contexts. @see https://vovk.dev/jsonlines */
const readableStreamToAsyncIterable = ({ readableStream, abortController }) => {
	const reader = readableStream.getReader();
	const subscribers = /* @__PURE__ */ new Set();
	let isAbortedWithoutError = false;
	let streamExhausted = false;
	let streamError = null;
	let errorIndex = -1;
	let primaryStarted = false;
	let activeIterators = 0;
	const cachedItems = [];
	const waiters = [];
	const notifyWaiters = () => {
		for (let i = waiters.length - 1; i >= 0; i--) {
			const waiter = waiters[i];
			let handled = false;
			if (streamError && waiter.index >= errorIndex) {
				waiter.reject(streamError);
				handled = true;
			} else if (waiter.index < cachedItems.length) {
				waiter.resolve({
					value: cachedItems[waiter.index],
					done: false
				});
				handled = true;
			} else if (streamExhausted || abortController?.signal.aborted && isAbortedWithoutError) {
				waiter.resolve({
					value: void 0,
					done: true
				});
				handled = true;
			}
			if (handled) waiters.splice(i, 1);
		}
	};
	const setStreamError = (error) => {
		errorIndex = cachedItems.length;
		streamError = error;
		notifyWaiters();
	};
	const disposeStream = (reason) => {
		isAbortedWithoutError = true;
		streamExhausted = true;
		notifyWaiters();
		abortController?.abort(reason);
		reader.cancel().catch(() => {});
	};
	const runPrimaryReader = async () => {
		let buffer = "";
		let iterationIndex = 0;
		const processLine = (line) => {
			let data;
			try {
				data = JSON.parse(line);
			} catch {
				return false;
			}
			if (data) {
				if (typeof data === "object" && data !== null && "isError" in data && "reason" in data) {
					const upcomingError = data.reason;
					abortController?.abort(upcomingError);
					const error = typeof upcomingError === "string" ? new Error(upcomingError) : upcomingError;
					setStreamError(error);
					return true;
				}
				subscribers.forEach((cb) => {
					if (!abortController?.signal.aborted) cb(data, iterationIndex);
				});
				iterationIndex++;
				if (!abortController?.signal.aborted) {
					cachedItems.push(data);
					notifyWaiters();
				}
			}
			return false;
		};
		try {
			while (true) {
				if (abortController?.signal.aborted && isAbortedWithoutError) break;
				let value;
				let done;
				try {
					({value, done} = await reader.read());
					if (done) break;
				} catch (error) {
					if (error?.name === "AbortError" && isAbortedWithoutError) break;
					const err = /* @__PURE__ */ new Error(`JSONLines stream error. ${String(error)}`);
					err.cause = error;
					setStreamError(err);
					return;
				}
				const chunk = typeof value === "string" ? value : typeof value === "number" ? String.fromCharCode(value) : new TextDecoder().decode(value);
				buffer += chunk;
				let newlineIdx;
				while (true) {
					newlineIdx = buffer.indexOf("\n");
					if (newlineIdx === -1) break;
					if (abortController?.signal.aborted && isAbortedWithoutError) break;
					const line = buffer.slice(0, newlineIdx);
					buffer = buffer.slice(newlineIdx + 1);
					if (!line) continue;
					if (processLine(line)) return;
				}
				if (abortController?.signal.aborted && isAbortedWithoutError) break;
			}
			const remaining = buffer.trim();
			if (remaining) processLine(remaining);
		} finally {
			streamExhausted = true;
			notifyWaiters();
		}
	};
	async function* asyncIterator() {
		if (!primaryStarted) {
			primaryStarted = true;
			runPrimaryReader();
		}
		activeIterators++;
		let index = 0;
		try {
			while (true) {
				if (streamError && index >= errorIndex) throw streamError;
				if (abortController?.signal.aborted && isAbortedWithoutError) return;
				if (index < cachedItems.length) {
					yield cachedItems[index++];
					continue;
				}
				if (streamExhausted) return;
				const result = await new Promise((resolve, reject) => {
					if (streamError && index >= errorIndex) {
						reject(streamError);
						return;
					}
					if (abortController?.signal.aborted && isAbortedWithoutError) {
						resolve({
							value: void 0,
							done: true
						});
						return;
					}
					if (index < cachedItems.length) {
						resolve({
							value: cachedItems[index],
							done: false
						});
						return;
					}
					if (streamExhausted) {
						resolve({
							value: void 0,
							done: true
						});
						return;
					}
					waiters.push({
						index,
						resolve,
						reject
					});
				});
				if (result.done) return;
				index++;
				yield result.value;
			}
		} finally {
			activeIterators--;
			if (activeIterators === 0 && !streamExhausted) disposeStream("Stream iteration stopped");
		}
	}
	const asPromise = async () => {
		const items = [];
		for await (const item of asyncIterator()) items.push(item);
		return items;
	};
	const abortSilently = (reason) => {
		isAbortedWithoutError = true;
		streamExhausted = true;
		notifyWaiters();
		abortController?.abort(reason);
		reader.cancel().catch(() => {});
	};
	return {
		asPromise,
		[Symbol.asyncIterator]: asyncIterator,
		[Symbol.dispose]: () => disposeStream("Stream disposed"),
		[Symbol.asyncDispose]: async () => disposeStream("Stream async disposed"),
		abortSilently,
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
//#region ../../packages/vovk/dist/client/fetcher.js
var fetcher_exports = /* @__PURE__ */ __exportAll({
	DEFAULT_ERROR_MESSAGE: () => DEFAULT_ERROR_MESSAGE,
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
			const endpoint = getURL({
				apiRoot,
				params,
				query
			});
			const unusedParams = Array.from(new URL(endpoint.startsWith("/") ? `http://localhost${endpoint}` : endpoint).pathname.matchAll(/\{([^}]+)\}/g)).map((m) => m[1]);
			if (unusedParams.length) throw new HttpException(HttpStatus.NULL, `Unused params: ${unusedParams.join(", ")} in ${endpoint}`, {
				body,
				query,
				params,
				endpoint
			});
			if (!disableClientValidation) try {
				({body, query, params} = await validate(inputOptions, { endpoint }) ?? {
					body,
					query,
					params
				});
			} catch (e) {
				if (e instanceof HttpException) throw e;
				throw new HttpException(HttpStatus.NULL, e.message ?? "Unknown error at default fetcher", {
					body,
					query,
					params,
					endpoint
				});
			}
			const resolvedContentType = body instanceof FormData ? void 0 : body instanceof URLSearchParams ? "application/x-www-form-urlencoded" : typeof body === "string" ? "text/plain" : body instanceof Blob ? body.type || "application/octet-stream" : body instanceof ArrayBuffer || body instanceof Uint8Array ? "application/octet-stream" : "application/json";
			const resolvedFileName = body instanceof File ? body.name : void 0;
			const defaultHeaders = {
				accept: "application/jsonl, application/json",
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
			if (body instanceof FormData || body instanceof URLSearchParams) requestInit.body = body;
			else if (body instanceof Blob) requestInit.body = body;
			else if (body instanceof ArrayBuffer || body instanceof Uint8Array) requestInit.body = body;
			else if (typeof body === "string") requestInit.body = body;
			else if (body) requestInit.body = JSON.stringify(body);
			const abortController = new AbortController();
			requestInit.signal = init?.signal ? AbortSignal.any([abortController.signal, init.signal]) : abortController.signal;
			requestInit = prepareRequestInit ? await prepareRequestInit(requestInit, inputOptions) : requestInit;
			try {
				response = await fetch(endpoint, requestInit);
			} catch (e) {
				throw new HttpException(HttpStatus.NULL, `${e?.message ?? "Unknown error at default fetcher"} ${endpoint}`, {
					body,
					query,
					params,
					endpoint
				});
			}
			const contentType = interpretAs ?? response.headers.get("content-type");
			if (contentType?.startsWith("application/jsonl")) respData = wrapStreamErrors(defaultStreamHandler({
				response,
				abortController
			}), async (error) => {
				for (const cb of onErrorCallbacks) await cb(error, inputOptions, {
					response,
					init: requestInit,
					respData,
					schema
				});
			});
			else if (contentType?.startsWith("application/json")) respData = await defaultHandler({
				response,
				schema
			});
			else respData = response;
			respData = transformResponse ? await transformResponse(respData, inputOptions, {
				response,
				init: requestInit,
				schema
			}) : respData;
			for (const cb of onSuccessCallbacks) await cb(respData, inputOptions, {
				response,
				init: requestInit,
				schema
			});
			return [respData, response];
		} catch (error) {
			for (const cb of onErrorCallbacks) await cb(error, inputOptions, {
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
var DEFAULT_ERROR_MESSAGE, toAsciiJson, fetcher;
var init_fetcher = __esmMin(() => {
	init_http_exception();
	init_enums();
	init_file_name_to_disposition();
	DEFAULT_ERROR_MESSAGE = "Unknown error at default fetcher";
	toAsciiJson = (value) => JSON.stringify(value).replace(/[\u007f-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
	fetcher = createFetcher();
});
//#endregion
//#region ../../packages/vovk/dist/client/serialize-query.js
init_fetcher();
function buildParams(key, value) {
	if (value === null || value === void 0) return [];
	if (typeof value === "object") {
		if (Array.isArray(value)) return value.flatMap((v, i) => {
			return buildParams(`${key}[${i}]`, v);
		});
		return Object.keys(value).flatMap((k) => {
			return buildParams(`${key}[${k}]`, value[k]);
		});
	}
	return [`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`];
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
//#region ../../packages/vovk/dist/client/create-rpc.js
const trimPath = (path) => path.trim().replace(/^\/|\/$/g, "");
const getHandlerPath = (endpoint, params, query) => {
	let result = endpoint;
	const queryStr = query ? serializeQuery(query) : null;
	for (const [key, value] of Object.entries(params ?? {})) result = result.replaceAll(`{${key}}`, () => encodeURIComponent(String(value)));
	return `${result}${queryStr ? `?${queryStr}` : ""}`;
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
	const originalApiRoot = forceApiRoot ?? options?.apiRoot ?? (configRootEntry ? `/${configRootEntry}` : "/api");
	for (const [staticMethodName, handlerSchema] of Object.entries(controllerSchema.handlers ?? {})) {
		const { path, httpMethod, validation } = handlerSchema;
		const getURL = ({ apiRoot, params, query } = {}) => {
			apiRoot = apiRoot ?? originalApiRoot;
			return [
				apiRoot.startsWith("http://") || apiRoot.startsWith("https://") || apiRoot.startsWith("/") ? "" : "/",
				apiRoot,
				forceApiRoot ? "" : segmentNamePath,
				getHandlerPath([controllerPrefix, path].filter(Boolean).join("/"), params, query)
			].filter(Boolean).join("/").replace(/([^:])\/+/g, "$1/");
		};
		const handler = (async (input = {}) => {
			const optionsResolvedValidateOnClient = options?.validateOnClient instanceof Promise ? (await options?.validateOnClient)?.validateOnClient : options?.validateOnClient;
			const fetcher$1 = givenFetcher instanceof Promise ? (await givenFetcher).fetcher : givenFetcher ?? fetcher;
			const validate = async (validationInput, { endpoint }) => {
				const validateOnClient = input.validateOnClient ?? optionsResolvedValidateOnClient;
				if (validateOnClient && validation) {
					if (typeof validateOnClient !== "function") throw new Error("validateOnClient must be a function");
					return await validateOnClient({ ...validationInput }, validation, {
						fullSchema: schema,
						endpoint
					}) ?? validationInput;
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
			let processedBody = input.body;
			if ((validation?.body?.["x-contentType"]?.includes("multipart/form-data") || validation?.body?.["x-contentType"]?.includes("application/x-www-form-urlencoded")) && input.body && !(input.body instanceof FormData || input.body instanceof URLSearchParams || input.body instanceof Blob)) {
				processedBody = new FormData();
				for (const [key, value] of Object.entries(input.body)) if (Array.isArray(value)) value.forEach((item) => {
					processedBody.append(key, item);
				});
				else processedBody.append(key, value);
			} else processedBody = input.body;
			const internalInput = {
				...deepExtend({}, options, { validateOnClient: optionsResolvedValidateOnClient }, input),
				body: processedBody ?? null,
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
			return createRPC(schema, segmentName, rpcModuleName, givenFetcher, deepExtend({}, options, newOptions));
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
										"pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
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
