import { prefix, get, put, post, del, operation } from 'vovk';
import { withDto } from 'vovk-dto';
import { IsString, IsIn } from 'class-validator';

class DtoControllerOnlyEntityBodyDto {
  @IsIn([true])
  todo: true;
}

class DtoControllerOnlyEntityParamsDto {
  @IsString()
  id: string;
}

@prefix('dto-controller-only-entities')
export default class DtoControllerOnlyEntityController {
  @operation({
    summary: 'Get DtoControllerOnlyEntities',
  })
  @get()
  static getDtoControllerOnlyEntities = withDto({
    handle() {
      return { message: 'TODO: get dtoControllerOnlyEntities' };
    },
  });

  @operation({
    summary: 'Update DtoControllerOnlyEntity',
  })
  @put('{id}')
  static updateDtoControllerOnlyEntity = withDto({
    body: DtoControllerOnlyEntityBodyDto,
    params: DtoControllerOnlyEntityParamsDto,
    async handle(req, params: { id: string }) {
      const { id } = req.vovk.params();
      const body = await req.vovk.body();

      return { message: `TODO: update dtoControllerOnlyEntity`, id, body };
    },
  });

  @post()
  static createDtoControllerOnlyEntity = withDto({
    body: DtoControllerOnlyEntityBodyDto,
    async handle(req) {
      const body = await req.vovk.body();

      return { message: `TODO: create dtoControllerOnlyEntity`, body };
    },
  });

  @del('{id}')
  static deleteDtoControllerOnlyEntity = withDto({
    params: DtoControllerOnlyEntityParamsDto,
    handle(req, params) {
      const { id } = req.vovk.params();

      return { message: `TODO: delete dtoControllerOnlyEntity`, id };
    },
  });
}
