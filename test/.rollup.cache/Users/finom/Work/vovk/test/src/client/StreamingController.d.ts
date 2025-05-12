import { type VovkRequest } from 'vovk';
import { JSONLinesResponse } from 'vovk';
export type Token = {
    token: string;
    query: 'queryValue';
};
export default class StreamingController {
    static postWithStreaming(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): Promise<JSONLinesResponse<Token>>;
    static postWithStreamingAndImmediateError(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): Promise<JSONLinesResponse<Token>>;
    static postWithStreamingAndDelayedError(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): Promise<JSONLinesResponse<Token>>;
    static postWithStreamingAndDelayedCustomError(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): Promise<JSONLinesResponse<Token>>;
    static postWithStreamingAndDelayedUnhandledError(req: VovkRequest<Omit<Token, 'query'>[], {
        query: 'queryValue';
    }>): Promise<JSONLinesResponse<Token>>;
}
