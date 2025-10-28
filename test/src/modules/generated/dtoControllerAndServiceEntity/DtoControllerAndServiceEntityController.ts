import { prefix, get, put, post, del, operation } from 'vovk';
import { withDto } from 'vovk-dto';
import { IsString, IsIn } from 'class-validator';

import DtoControllerAndServiceEntityService from './DtoControllerAndServiceEntityService.ts';

class DtoControllerAndServiceEntityBodyDto {
  @IsIn([true])
  todo: true;
}

class DtoControllerAndServiceEntityParamsDto {
  @IsString()
  id: string;
}

@prefix('dto-controller-and-service-entities')
export default class DtoControllerAndServiceEntityController {
  @operation({
    summary: 'Get DtoControllerAndServiceEntities',
  })
  @get()
  static getDtoControllerAndServiceEntities = withDto({
    handle() {
      return DtoControllerAndServiceEntityService.getDtoControllerAndServiceEntities();
    },
  });

  @operation({
    summary: 'Update DtoControllerAndServiceEntity',
  })
  @put('{id}')
  static updateDtoControllerAndServiceEntity = withDto({
    body: DtoControllerAndServiceEntityBodyDto,
    params: DtoControllerAndServiceEntityParamsDto,
    async handle(req, params: { id: string }) {
      const { id } = req.vovk.params();
      const body = await req.vovk.body();

      return DtoControllerAndServiceEntityService.updateDtoControllerAndServiceEntity(id, body);
    },
  });

  @post()
  static createDtoControllerAndServiceEntity = withDto({
    body: DtoControllerAndServiceEntityBodyDto,
    async handle(req) {
      const body = await req.vovk.body();

      return DtoControllerAndServiceEntityService.createDtoControllerAndServiceEntity(body);
    },
  });

  @del('{id}')
  static deleteDtoControllerAndServiceEntity = withDto({
    params: DtoControllerAndServiceEntityParamsDto,
    handle(req, params) {
      const { id } = req.vovk.params();

      return DtoControllerAndServiceEntityService.deleteDtoControllerAndServiceEntity(id);
    },
  });
}
