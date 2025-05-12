import { __decorate, __metadata } from "tslib";
import { headers } from 'next/headers';
import { post, prefix } from 'vovk';
import { JSONLinesResponse } from 'vovk';
let StreamingController = class StreamingController {
    static async postWithStreaming(req) {
        const body = await req.json();
        const query = req.nextUrl.searchParams.get('query');
        const response = new JSONLinesResponse(await headers());
        void (async () => {
            for (const token of body) {
                await new Promise((resolve) => setTimeout(resolve, 200));
                response.send({ ...token, query });
            }
            response.close();
        })();
        return response;
    }
    static async postWithStreamingAndImmediateError(req) {
        if (req) {
            throw new Error('Immediate error');
        }
        const response = new JSONLinesResponse(await headers());
        return response;
    }
    static async postWithStreamingAndDelayedError(req) {
        const body = await req.json();
        const query = req.nextUrl.searchParams.get('query');
        const response = new JSONLinesResponse(await headers());
        let count = 0;
        void (async () => {
            for (const token of body) {
                if (++count === 3) {
                    return response.throw('oh no');
                }
                await new Promise((resolve) => setTimeout(resolve, 200));
                response.send({ ...token, query });
            }
        })();
        return response;
    }
    static async postWithStreamingAndDelayedCustomError(req) {
        const body = await req.json();
        const query = req.nextUrl.searchParams.get('query');
        const response = new JSONLinesResponse(await headers());
        let count = 0;
        void (async () => {
            for (const token of body) {
                if (++count === 3) {
                    return response.throw({ customError: 'custom error' });
                }
                await new Promise((resolve) => setTimeout(resolve, 200));
                response.send({ ...token, query });
            }
        })();
        return response;
    }
    static async postWithStreamingAndDelayedUnhandledError(req) {
        const body = await req.json();
        const query = req.nextUrl.searchParams.get('query');
        const response = new JSONLinesResponse(await headers());
        let count = 0;
        void (async () => {
            for (const token of body) {
                if (++count === 3) {
                    throw new Error('Unhandled error');
                }
                await new Promise((resolve) => setTimeout(resolve, 200));
                response.send({ ...token, query });
            }
        })();
        return response;
    }
};
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamingController, "postWithStreaming", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamingController, "postWithStreamingAndImmediateError", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamingController, "postWithStreamingAndDelayedError", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamingController, "postWithStreamingAndDelayedCustomError", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamingController, "postWithStreamingAndDelayedUnhandledError", null);
StreamingController = __decorate([
    prefix('streaming')
], StreamingController);
export default StreamingController;
//# sourceMappingURL=StreamingController.js.map