import { __decorate, __metadata } from "tslib";
import { get, post, prefix } from 'vovk';
let StreamingGeneratorController = class StreamingGeneratorController {
    static async *getWithStreaming(req) {
        const query = req.nextUrl.searchParams.get('query');
        const tokens = [
            { token: 'first', query },
            { token: 'second', query },
            { token: 'third', query },
        ];
        for (const token of tokens) {
            yield token;
        }
    }
    static async *postWithAsyncStreaming(req) {
        const body = await req.json();
        const query = req.nextUrl.searchParams.get('query');
        for (const token of body) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            yield { ...token, query };
        }
    }
    static async *postWithStreaming(req) {
        const body = await req.json();
        const query = req.nextUrl.searchParams.get('query');
        for (const token of body) {
            yield { ...token, query };
        }
    }
    static async *postWithStreamingAndImmediateError(req) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (req) {
            throw new Error('Immediate error');
        }
        yield {};
    }
    static async *postWithStreamingAndDelayedError(req) {
        const body = await req.json();
        const query = req.nextUrl.searchParams.get('query');
        let count = 0;
        for (const token of body) {
            if (++count === 3) {
                throw new Error('oh no');
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
            yield { ...token, query };
        }
    }
    static async *postWithStreamingAndDelayedCustomError(req) {
        const body = await req.json();
        const query = req.nextUrl.searchParams.get('query');
        let count = 0;
        for (const token of body) {
            if (++count === 3) {
                throw { customError: 'custom error' };
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
            yield { ...token, query };
        }
    }
    static async *postWithStreamingAndDelayedUnhandledError(req) {
        const body = await req.json();
        const query = req.nextUrl.searchParams.get('query');
        let count = 0;
        for (const token of body) {
            if (++count === 3) {
                throw new Error('Unhandled error');
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
            yield { ...token, query };
        }
    }
};
__decorate([
    get.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StreamingGeneratorController, "getWithStreaming", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StreamingGeneratorController, "postWithAsyncStreaming", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StreamingGeneratorController, "postWithStreaming", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StreamingGeneratorController, "postWithStreamingAndImmediateError", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StreamingGeneratorController, "postWithStreamingAndDelayedError", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StreamingGeneratorController, "postWithStreamingAndDelayedCustomError", null);
__decorate([
    post.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StreamingGeneratorController, "postWithStreamingAndDelayedUnhandledError", null);
StreamingGeneratorController = __decorate([
    prefix('streaming-generator')
], StreamingGeneratorController);
export default StreamingGeneratorController;
//# sourceMappingURL=StreamingGeneratorController.js.map