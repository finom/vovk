import { __decorate, __metadata } from "tslib";
import { headers } from 'next/headers';
import { HttpException, HttpStatus, get, post, prefix } from 'vovk';
import { NextResponse } from 'next/server';
let CommonController = class CommonController {
    static getHelloWorldResponseObject() {
        return NextResponse.json({ hello: 'world' });
    }
    static getHelloWorldObjectLiteral() {
        return { hello: 'world' };
    }
    static async getHelloWorldNextResponseObjectPromise() {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return NextResponse.json({ hello: 'world' });
    }
    static async getHelloWorldRawResponseObjectPromise() {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return Response.json({ hello: 'world' });
    }
    static async getHelloWorldObjectLiteralPromise() {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { hello: 'world' };
    }
    static async getHelloWorldHeaders() {
        const headerList = await headers();
        const hello = headerList.get('x-test');
        return { hello };
    }
    static getHelloWorldArray() {
        return [{ hello: 'world' }];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static getHelloWorldAndEmptyGeneric(_req) {
        return { hello: 'world' };
    }
    static getWithParams(_req, { hello }) {
        return { hello };
    }
    static async postWithAll(req, params) {
        const body = await req.json();
        const simpleQueryParam = req.nextUrl.searchParams.get('simpleQueryParam');
        // check if forEach inferred properly
        req.nextUrl.searchParams.forEach((value, key) => {
            key;
            value;
        });
        // check if keys inferred properly
        req.nextUrl.searchParams.keys();
        // check if values inferred properly
        req.nextUrl.searchParams.values();
        return { params, body, query: { simpleQueryParam } };
    }
    static async postWithBodyAndQueryUsingReqVovk(req) {
        req.vovk.meta({ isMeta1: true });
        req.vovk.meta({ isMeta2: true });
        const body = await req.vovk.body();
        const query = req.vovk.query();
        const meta = req.vovk.meta();
        req.vovk.meta(null);
        const metaNulled = req.vovk.meta();
        return { body, query, meta, metaNulled };
    }
    static getNestedQuery(req) {
        return { query: req.vovk.query(), search: decodeURIComponent(req.nextUrl.search) };
    }
    static async postWithFormDataUsingReqVovk(req) {
        const formData = await req.vovk.form();
        return formData;
    }
    static getErrorResponse() {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'This is an error', { theCause: 'This is the cause' });
    }
    static getJsonTextResponse() {
        return new Response('{"hello": "world"}', {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    }
    static getJsonlResponse() {
        return new Response('{"hello": "world1"}\n{"hello": "world2"}', {
            headers: {
                'Content-Type': 'application/jsonl',
            },
        });
    }
    static getJsonlTextResponse() {
        return new Response('{"hello": "world1"}\n{"hello": "world2"}', {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    }
};
__decorate([
    get.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommonController, "getHelloWorldResponseObject", null);
__decorate([
    get.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommonController, "getHelloWorldObjectLiteral", null);
__decorate([
    get.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommonController, "getHelloWorldNextResponseObjectPromise", null);
__decorate([
    get.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommonController, "getHelloWorldRawResponseObjectPromise", null);
__decorate([
    get.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommonController, "getHelloWorldObjectLiteralPromise", null);
__decorate([
    get.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommonController, "getHelloWorldHeaders", null);
__decorate([
    get.auto(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommonController, "getHelloWorldArray", null);
__decorate([
    get.auto()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommonController, "getHelloWorldAndEmptyGeneric", null);
__decorate([
    get('with-params/:hello'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommonController, "getWithParams", null);
__decorate([
    post('with-all/:hello'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CommonController, "postWithAll", null);
__decorate([
    post('with-all-using-req-vovk'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommonController, "postWithBodyAndQueryUsingReqVovk", null);
__decorate([
    get('nested-query'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommonController, "getNestedQuery", null);
__decorate([
    post('form-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommonController, "postWithFormDataUsingReqVovk", null);
__decorate([
    get('error'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommonController, "getErrorResponse", null);
__decorate([
    get('json-text'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommonController, "getJsonTextResponse", null);
__decorate([
    get('jsonl'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommonController, "getJsonlResponse", null);
__decorate([
    get('jsonl-text'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommonController, "getJsonlTextResponse", null);
CommonController = __decorate([
    prefix('common')
], CommonController);
export default CommonController;
//# sourceMappingURL=CommonController.js.map