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
} from 'vovk';
import { openapi } from 'vovk-openapi';
import { withDto } from 'vovk-dto';
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
} from './WithDtoClientController.dto';

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

/**
 * -------------------------------------------------------------------------
 *  Example controller updated to use withDto
 * -------------------------------------------------------------------------
 */
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
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      const vovkParams = req.vovk.params();
      return WithDtoClientService.handleAll({
        body,
        query: { search },
        params,
        vovkParams,
      });
    },
  });

  @get.auto()
  static handleQuery = withDto({
    query: HandleQueryQueryDto,
    handle: (req) => {
      return req.vovk.query();
    },
  });

  @post.auto()
  static handleBody = withDto({
    body: HandleBodyBodyDto,
    handle: async (req) => {
      return req.vovk.body();
    },
  });

  @put('x/:foo/:bar/y')
  static handleParams = withDto({
    params: HandleParamsDto,
    handle: async (req) => {
      return req.vovk.params();
    },
  });

  @get.auto()
  static handleNestedQuery = withDto({
    query: HandleNestedQueryDto,
    handle: (req) => {
      return req.vovk.query();
    },
  });

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
  static handleStream = withDto({
    query: HandleStreamQueryDto,
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
}
