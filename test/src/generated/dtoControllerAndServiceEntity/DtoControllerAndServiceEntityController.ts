import { prefix, get, put, post, del } from 'vovk';
import { withDto } from 'vovk-dto';
import { IsString, IsIn } from 'class-validator';

import DtoControllerAndServiceEntityService from './DtoControllerAndServiceEntityService';

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
  @get()
  static getDtoControllerAndServiceEntities = withDto(null, GetDtoControllerAndServiceEntitiesQueryDto, (req) => {
    const { search } = req.vovk.query();

    return DtoControllerAndServiceEntityService.getDtoControllerAndServiceEntities(search);
  });

  @put(':id')
  static updateDtoControllerAndServiceEntity = withDto(
    UpdateDtoControllerAndServiceEntityBodyDto,
    UpdateDtoControllerAndServiceEntityQueryDto,
    async (req, params: { id: string }) => {
      const { id } = params;
      const body = await req.vovk.body();
      const { q } = req.vovk.query();

      return DtoControllerAndServiceEntityService.updateDtoControllerAndServiceEntity(id, q, body);
    }
  );

  @post()
  static createDtoControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteDtoControllerAndServiceEntity = () => {
    // ...
  };
}
