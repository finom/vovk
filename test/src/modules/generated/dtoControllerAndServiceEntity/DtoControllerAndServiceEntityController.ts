import { prefix, get, put, post, del, operation } from 'vovk';
import { withDto } from 'vovk-dto';
import { IsString, IsIn } from 'class-validator';

import DtoControllerAndServiceEntityService from './DtoControllerAndServiceEntityService.ts';

class GetDtoControllerAndServiceEntitiesQueryDto {
  @IsString()
  search: string;
}

class UpdateDtoControllerAndServiceEntityBodyDto {
  @IsIn(['bar', 'baz'])
  foo: 'bar' | 'baz';
}

class UpdateDtoControllerAndServiceEntityQueryDto {
  @IsString()
  q: string;
}

@prefix('dto-controller-and-service-entities')
export default class DtoControllerAndServiceEntityController {
  @operation({
    summary: 'Get DtoControllerAndServiceEntities',
  })
  @get()
  static getDtoControllerAndServiceEntities = withDto({
    query: GetDtoControllerAndServiceEntitiesQueryDto,
    handle(req) {
      const { search } = req.vovk.query();

      return DtoControllerAndServiceEntityService.getDtoControllerAndServiceEntities(search);
    },
  });

  @operation({
    summary: 'Update DtoControllerAndServiceEntity',
  })
  @put('{id}')
  static updateDtoControllerAndServiceEntity = withDto({
    body: UpdateDtoControllerAndServiceEntityBodyDto,
    query: UpdateDtoControllerAndServiceEntityQueryDto,
    async handle(req, params: { id: string }) {
      const { id } = params;
      const body = await req.vovk.body();
      const { q } = req.vovk.query();

      return DtoControllerAndServiceEntityService.updateDtoControllerAndServiceEntity(id, q, body);
    },
  });

  @post()
  static createDtoControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteDtoControllerAndServiceEntity = () => {
    // ...
  };
}
