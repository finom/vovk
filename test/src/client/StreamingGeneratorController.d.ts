import { type VovkRequest } from 'vovk';
export type Token = {
    token: string;
    query: 'queryValue';
};
export default class StreamingGeneratorController {
    static getWithStreaming(req: VovkRequest<null, {
        query: 'queryValue';
    }>): AsyncGenerator<Token, void, unknown>;
    static postWithAsyncStreaming(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): AsyncGenerator<{
        query: "queryValue";
        token: string;
    }, void, unknown>;
    static postWithStreaming(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): AsyncGenerator<{
        query: "queryValue";
        token: string;
    }, void, unknown>;
    static postWithStreamingAndImmediateError(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): AsyncGenerator<Token, void, unknown>;
    static postWithStreamingAndDelayedError(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): AsyncGenerator<{
        query: "queryValue";
        token: string;
    }, void, unknown>;
    static postWithStreamingAndDelayedCustomError(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): AsyncGenerator<{
        query: "queryValue";
        token: string;
    }, void, unknown>;
    static postWithStreamingAndDelayedUnhandledError(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): AsyncGenerator<{
        query: "queryValue";
        token: string;
    }, void, unknown>;
}
