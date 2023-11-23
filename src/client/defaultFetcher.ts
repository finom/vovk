import { _SmoothieClientFetcher as SmoothieClientFetcher } from "./types";
import { _ErrorResponseBody as ErrorResponseBody, _HttpStatus as HttpStatus } from '../types';

export interface _DefaultFetcherOptions extends Omit<RequestInit, 'body' | 'method'> {
    prefix?: string;
}

export const _defaultFetcher: SmoothieClientFetcher<_DefaultFetcherOptions> = async (
    { httpMethod, getPath, validate },
    { params, query, body, prefix = '', ...options }
) => {
    const endpoint = (prefix.endsWith('/') ? prefix : `${prefix}/`) + getPath(params, query);

    try {
        validate({ body, query }); 
    } catch (e) {
        const err: ErrorResponseBody = {
            statusCode: HttpStatus.NULL,
            message: String(e),
            isError: true
        }

        return err;
    }

    const init: RequestInit = {
        method: httpMethod,
        body: body ? JSON.stringify(body) : undefined,
        ...options
    };

    const response = await fetch(endpoint, init);

    return response.json();
};
