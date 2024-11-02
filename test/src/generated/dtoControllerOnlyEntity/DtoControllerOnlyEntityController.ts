import { prefix, get, put, post, del } from 'vovk';
import { withDto } from 'vovk-dto';
import { IsString, IsIn } from 'class-validator';

export class GetDtoControllerOnlyEntitiesQueryDto {
  @IsString()
  search: string;
}

export class UpdateDtoControllerOnlyEntityBodyDto {
  @IsIn(['bar', 'baz'])
  foo: 'bar' | 'baz';
}

export class UpdateDtoControllerOnlyEntityQueryDto {
  @IsString()
  q: string;
}

@prefix('dto-controller-only-entity')
export default class DtoControllerOnlyEntityController {
  @get()
  static getDtoControllerOnlyEntities = withDto(null, GetDtoControllerOnlyEntitiesQueryDto, (req) => {
    const { search } = req.vovk.query();

    return { results: [], search };
  });

  @put(':id')
  static updateDtoControllerOnlyEntity = withDto(
    UpdateDtoControllerOnlyEntityBodyDto,
    UpdateDtoControllerOnlyEntityQueryDto,
    async (req, params: { id: string }) => {
      const { id } = params;
      const body = await req.vovk.body();
      const { q } = req.vovk.query();

      return { id, body, q };
    }
  );

  @post()
  static createDtoControllerOnlyEntity = () => {
    // ...
  };

  @del(':id')
  static deleteDtoControllerOnlyEntity = () => {
    // ...
  };
}
