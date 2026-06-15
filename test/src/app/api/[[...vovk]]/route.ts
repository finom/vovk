import { initSegment } from 'vovk';
import AllDecoratorsController from '../../../core/all-decorators-controller.ts';
import AutoDecoratorsController from '../../../core/auto-decorators-controller.ts';
import ConflictingRoutesController from '../../../core/conflicting-routes-controller.ts';
import CustomDecoratorController from '../../../core/custom-decorator-controller.ts';
import DecorateClassController, { DecorateClonedController } from '../../../core/decorate-class-controller.ts';
import DecorateController from '../../../core/decorate-controller.ts';
import DesNotExistController from '../../../core/des-not-exist-controller.ts';
import DuplicatedParameterController from '../../../core/duplicated-parameter-controller.ts';
import ErrorController from '../../../core/error-controller.ts';
import HeadersController from '../../../core/headers-controller.ts';
import InputController from '../../../core/input-controller.ts';
import NextResponseController from '../../../core/next-response-controller.ts';
import RedirectController from '../../../core/redirect-controller.ts';
import StaticApiController from '../../../core/static-api-controller.ts';
import trimControllers from '../../../core/trim-controllers.ts';

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: false,
  controllers: {
    ...trimControllers,
    InputController,
    CustomDecoratorController,
    AllDecoratorsController,
    DuplicatedParameterController,
    ConflictingRoutesController,
    DesNotExistController,
    ErrorController,
    NextResponseController,
    HeadersController,
    RedirectController,
    AutoDecoratorsController,
    DecorateController,
    DecorateClassController,
    DecorateClonedController,
    StaticApiController,
  },
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('\x1b[42m onError \x1b[0m', err.message, req.url);
  },
});
