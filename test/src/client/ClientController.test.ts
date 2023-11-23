import metadata from '../controllers-metadata.json';
import type ClientController from './ClientController';
import { clientizeController, defaultFetcher, type DefaultFetcherOptions } from '../../../src/client';
import { SmoothieBody, SmoothieParams, SmoothieQuery } from '../../../src';

type ClientControllerType = typeof ClientController;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = clientizeController<typeof ClientController, DefaultFetcherOptions>(metadata.ClientController, defaultFetcher, {
    defaultOptions: { prefix },
});

describe('Client', () => {
    it(`Should handle simple requests + headers`, async () => {
        const noOptionsController = clientizeController<typeof ClientController, DefaultFetcherOptions>(metadata.ClientController, defaultFetcher);
        const result = await noOptionsController.getHelloWorld({
            prefix,
            headers: { 'x-test': 'world' },
        });
        expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
    });

    it(`Should handle simple requests with default options`, async () => {
        const result = await defaultController.getHelloWorld({
            headers: { 'x-test': 'world' },
        });
        expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
    });

    it('Should handle requests with params', async () => {
        const result = await defaultController.getWithParams({ 
            params: { hello: 'world' },
        });

        type Params = SmoothieParams<ClientControllerType['getWithParams']>;

        (null as unknown as SmoothieParams<ClientControllerType['getWithParams']>) satisfies Params;
        // @ts-expect-error
        (null as unknown as SmoothieBody<ClientControllerType['getWithParams']>) satisfies { hello: 'world' };
        (null as unknown as SmoothieBody<ClientControllerType['getWithParams']>) satisfies undefined;

        // @ts-expect-error
        (null as unknown as SmoothieQuery<ClientControllerType['getWithParams']>) satisfies { hello: 'world' };
        (null as unknown as SmoothieQuery<ClientControllerType['getWithParams']>) satisfies undefined;

        expect(result satisfies { hello: 'world' }).toEqual({ hello: 'world' });
    });

    it('Should handle requests with params, body and query', async () => {
        const result = await defaultController.postWithParams({ 
            params: { hello: 'world' },
            body: { isBody: true },
            query: { query: 'queryValue' },
        });

        type Body = SmoothieBody<ClientControllerType['postWithParams']>;
        const bodySatisfies = result.body satisfies Body;

        type Query = SmoothieQuery<ClientControllerType['postWithParams']>
        const querySatisfies = result.query satisfies Query;
        
        type Params = SmoothieParams<ClientControllerType['postWithParams']>;
        const paramsSatisfies = result.params satisfies Params;

        expect(result satisfies { params: { hello: 'world' }, body: { isBody: true }, query: { query: 'queryValue' } })
            .toEqual({ params: { hello: 'world' }, body: { isBody: true }, query: {query: 'queryValue'} });
    });

    
    // Basic validation

    // zod validation
});

