import { prefix, get, put, post, del, type VovkRequest } from 'vovk';
import MyThingService from './MyThingService.s.template';

@prefix('my-things')
export default class MyThingController {
  @get()
  static getMyThingsExample(req: VovkRequest<null, { q: string }>) {
    const q = req.nextUrl.searchParams.get('q');

    return MyThingService.getMyThingsExample(q);
  }

  @put(':id')
  static updateMyThingExample = async (
    req: VovkRequest<{ foo: 'bar' | 'baz' }, { q: string }>,
    params: { id: string }
  ) => {
    const { id } = params;
    const body = await req.json();
    const q = req.nextUrl.searchParams.get('q');

    return MyThingService.updateMyThingExample(id, q, body);
  };

  @post()
  static createMyThingExample = () => {
    // ...
  };

  @del(':id')
  static deleteMyThingExample = () => {
    // ...
  };
}
