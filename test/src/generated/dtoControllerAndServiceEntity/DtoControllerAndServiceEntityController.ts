import { prefix, get, put, post, del } from 'vovk';
import { withDto } from 'vovk-dto';
import { IsString, IsIn } from 'class-validator';

import DtoControllerAndServiceEntityService from './DtoControllerAndServiceEntityService';

export class GetDtoControllerAndServiceEntitiesQueryDto {
  @IsString()
  search: string;
}

export class UpdateDtoControllerAndServiceEntityBodyDto {
  @IsIn(['bar', 'baz'])
  foo: 'bar' | 'baz';
}

export class UpdateDtoControllerAndServiceEntityQueryDto {
  @IsString()
  q: string;
}

@prefix('dto-controller-and-service-entity')
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


function withCallback<T, R>(arg: T, handler: (arg2: T) => R) {
  console.log(arg);
  return handler;
}

const foo = withCallback('hello', (arg) => {
  return bar(arg);
});

function bar(arg: Parameters<typeof foo>[0]) {
   console.log(arg);
}