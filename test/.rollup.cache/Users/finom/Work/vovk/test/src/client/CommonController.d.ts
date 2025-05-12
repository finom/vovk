import { JSONLinesResponse, type VovkRequest } from 'vovk';
import { NextResponse } from 'next/server';
import { NESTED_QUERY_EXAMPLE } from '../lib';
export default class CommonController {
    static getHelloWorldResponseObject(): NextResponse<{
        hello: string;
    }>;
    static getHelloWorldObjectLiteral(): {
        hello: string;
    };
    static getHelloWorldNextResponseObjectPromise(): Promise<NextResponse<{
        hello: string;
    }>>;
    static getHelloWorldRawResponseObjectPromise(): Promise<Response>;
    static getHelloWorldObjectLiteralPromise(): Promise<{
        hello: string;
    }>;
    static getHelloWorldHeaders(): Promise<{
        hello: string | null;
    }>;
    static getHelloWorldArray(): {
        hello: string;
    }[];
    static getHelloWorldAndEmptyGeneric(_req: VovkRequest): {
        hello: string;
    };
    static getWithParams(_req: VovkRequest<undefined>, { hello }: {
        hello: 'world';
    }): {
        hello: "world";
    };
    static postWithAll(req: VovkRequest<{
        isBody: true;
    }, {
        simpleQueryParam: 'queryValue';
    }>, params: {
        hello: 'world';
    }): Promise<{
        params: {
            hello: "world";
        };
        body: {
            isBody: true;
        };
        query: {
            simpleQueryParam: "queryValue";
        };
    }>;
    static postWithBodyAndQueryUsingReqVovk(req: VovkRequest<{
        isBody: true;
    }, {
        simpleQueryParam: 'queryValue';
        array1: readonly ['foo'];
        array2: readonly ['bar', 'baz'];
    }>): Promise<{
        body: {
            isBody: true;
        };
        query: {
            simpleQueryParam: "queryValue";
            array1: readonly ["foo"];
            array2: readonly ["bar", "baz"];
        };
        meta: {
            isMeta1: true;
            isMeta2: true;
        };
        metaNulled: Record<any, any>;
    }>;
    static getNestedQuery(req: VovkRequest<undefined, typeof NESTED_QUERY_EXAMPLE>): {
        query: {
            x: string;
            y: string[];
            z: {
                f: string;
                u: string[];
                d: {
                    x: string;
                    arrOfObjects: ({
                        foo: string;
                        nestedArr: string[];
                        nestedObj?: undefined;
                    } | {
                        foo: string;
                        nestedObj: {
                            deepKey: string;
                        };
                        nestedArr?: undefined;
                    })[];
                };
            };
        };
        search: string;
    };
    static postWithFormDataUsingReqVovk(req: VovkRequest<FormData>): Promise<{
        field: "value";
    }>;
    static getErrorResponse(): void;
    static getJsonTextResponse(): Response;
    static getJsonlResponse(): JSONLinesResponse<{
        hello: string;
    }>;
    static getJsonlTextResponse(): JSONLinesResponse<{
        hello: string;
    }>;
}
