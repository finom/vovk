import { get, prefix, operation } from 'vovk';
import BasicService from './basic-service.ts';

@prefix('basic-with-service')
export default class BasicControllerWithService {
  @operation({
    summary: 'Get a greeting using a service',
    description: 'Get a greeting from the server using a service',
  })
  @get('greeting')
  static getHello() {
    return BasicService.getHello();
  }
}
