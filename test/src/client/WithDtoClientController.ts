import {
  post,
  put,
  get,
  prefix,
  HttpStatus,
  type VovkControllerBody,
  type VovkControllerQuery,
  type VovkControllerParams,
  type VovkControllerOutput,
  type VovkRequest,
} from 'vovk';
import { openapi } from 'vovk-openapi';
import { withDto } from 'vovk-dto';
import { validateOnClient } from 'vovk-dto/validateOnClient';
import {
  HandleAllBodyDto,
  HandleAllOutputDto,
  HandleAllParamsDto,
  HandleAllQueryDto,
  HandleBodyBodyDto,
  HandleNestedQueryDto,
  HandleOutputOutputDto,
  HandleOutputQueryDto,
  HandleParamsDto,
  HandleQueryQueryDto,
  HandleStreamQueryDto,
  IterationDto,
} from './WithDtoClientController.dto';
import { WithDtoClientControllerRPC } from 'vovk-client';
import { plainToInstance } from 'class-transformer';
import { ok } from 'node:assert';

class WithDtoClientService {
  static handleAll({
    body,
    query,
    params,
    vovkParams,
  }: {
    body: VovkControllerBody<typeof WithDtoClientController.handleAll>;
    query: VovkControllerQuery<typeof WithDtoClientController.handleAll>;
    params: VovkControllerParams<typeof WithDtoClientController.handleAll>;
    vovkParams: VovkControllerParams<typeof WithDtoClientController.handleAll>;
  }) {
    return {
      body,
      query,
      params,
      vovkParams,
    } satisfies VovkControllerOutput<typeof WithDtoClientController.handleAll>;
  }
}

@prefix('with-dto')
export default class WithDtoClientController {
  @openapi({
    summary: 'This is a summary',
  })
  @openapi.error(HttpStatus.BAD_REQUEST, 'This is a bad request')
  @post('all/:foo/:bar')
  static handleAll = withDto({
    body: HandleAllBodyDto,
    query: HandleAllQueryDto,
    params: HandleAllParamsDto,
    output: HandleAllOutputDto,
    handle: async (req, params) => {
      const body = await req.vovk.body();
      const query = req.vovk.query();
      const vovkParams = req.vovk.params();

      ok(body instanceof HandleAllBodyDto, 'Body is not an instance of HandleAllBodyDto');
      ok(query instanceof HandleAllQueryDto, 'Query is not an instance of HandleAllQueryDto');
      ok(vovkParams instanceof HandleAllParamsDto, 'Params is not an instance of HandleAllParamsDto');

      return WithDtoClientService.handleAll({
        body,
        query,
        params,
        vovkParams,
      });
    },
  });

  // The tests are run on nodejs without TS compilator so decorators are not supported and it's not possible import a DTO at .test.ts file
  // this endpoint and other ones ended with "Client" implement a proxy to be able to test errors on client side
  @post('all/:foo/:bar/client')
  static handleAllClient = async (
    req: VovkRequest<HandleAllBodyDto, HandleAllQueryDto>,
    params: HandleAllParamsDto
  ) => {
    const body = await req.json();
    const query = { search: req.nextUrl.searchParams.get('search') };
    const result = await WithDtoClientControllerRPC.handleAll({
      body: plainToInstance(HandleAllBodyDto, body),
      query: plainToInstance(HandleAllQueryDto, query),
      params: plainToInstance(HandleAllParamsDto, params),
      transform: (resp) => plainToInstance(HandleAllOutputDto, resp),
      validateOnClient,
    });

    ok(result instanceof HandleAllOutputDto, 'Output is not an instance of HandleAllOutputDto');

    return result;
  };

  @get.auto()
  static handleQuery = withDto({
    query: HandleQueryQueryDto,
    handle: (req) => {
      return req.vovk.query();
    },
  });

  @get.auto()
  static handleQueryClient = async (req: VovkRequest<never, HandleQueryQueryDto>) => {
    const query = { search: req.nextUrl.searchParams.get('search') };
    return WithDtoClientControllerRPC.handleQuery({
      query: plainToInstance(HandleQueryQueryDto, query),
      validateOnClient,
    });
  };

  @post.auto()
  static handleBody = withDto({
    body: HandleBodyBodyDto,
    handle: async (req) => {
      return req.vovk.body();
    },
  });

  @post.auto()
  static handleBodyClient = async (req: VovkRequest<HandleBodyBodyDto>) => {
    const body = await req.json();
    return WithDtoClientControllerRPC.handleBody({
      body: plainToInstance(HandleBodyBodyDto, body),
      validateOnClient,
    });
  };

  @put('x/:foo/:bar/y')
  static handleParams = withDto({
    params: HandleParamsDto,
    handle: async (req) => {
      return req.vovk.params();
    },
  });

  @put('x/:foo/:bar/y/client')
  static handleParamsClient = async (_req: VovkRequest, params: HandleParamsDto) => {
    return WithDtoClientControllerRPC.handleParams({
      params: plainToInstance(HandleParamsDto, params),
      validateOnClient,
    });
  };

  @get.auto()
  static handleNestedQuery = withDto({
    query: HandleNestedQueryDto,
    handle: (req) => {
      return req.vovk.query();
    },
  });

  @get.auto()
  static handleNestedQueryClient = async (req: VovkRequest<never, HandleNestedQueryDto>) => {
    const query = { ...req.vovk.query() };
    return WithDtoClientControllerRPC.handleNestedQuery({
      query: plainToInstance(HandleNestedQueryDto, query),
      validateOnClient,
    });
  };

  @get.auto()
  static handleOutput = withDto({
    query: HandleOutputQueryDto,
    output: HandleOutputOutputDto,
    handle: async (req) => {
      // We expect the query.helloOutput to be "world" to match output shape
      return { hello: req.vovk.query().helloOutput as 'world' };
    },
  });

  @get.auto()
  static handleOutputClient = async (req: VovkRequest<never, HandleOutputQueryDto>) => {
    const query = { helloOutput: req.nextUrl.searchParams.get('helloOutput') };
    return WithDtoClientControllerRPC.handleOutput({
      query: plainToInstance(HandleOutputQueryDto, query),
      validateOnClient,
    });
  };

  @get.auto()
  static handleStream = withDto({
    query: HandleStreamQueryDto,
    iteration: IterationDto,
    async *handle(req) {
      for (const value of req.vovk.query().values) {
        yield { value };
      }
    },
  });

  @post.auto()
  static handleNothitng = withDto({
    // no DTOs required here
    handle: async () => {
      return { nothing: 'here' } as const;
    },
  });

  @post.auto()
  static handleFormData = withDto({
    body: withDto.formData,
    query: HandleQueryQueryDto,
    handle: async (req) => {
      const formData = await req.vovk.form<{ hello: 'world' }>();
      const search = req.vovk.query().search;
      return { formData, search };
    },
  });
}
