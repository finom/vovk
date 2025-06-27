import { initSegment } from 'vovk';
import trimControllers from '../../../core/TrimControllers.ts';
import InputController from '../../../core/InputController.ts';
import CustomDecoratorController from '../../../core/CustomDecoratorController.ts';
import AllDecoratorsController from '../../../core/AllDecoratorsController.ts';
import DuplicatedParameterController from '../../../core/DuplicatedParameterController.ts';
import ConflictingRoutesController from '../../../core/ConflictingRoutesController.ts';
import DesNotExistController from '../../../core/DesNotExistController.ts';
import ErrorController from '../../../core/ErrorController.ts';
import NextResponseController from '../../../core/NextResponseController.ts';
import HeadersController from '../../../core/HeadersController.ts';
import RedirectController from '../../../core/RedirectController.ts';
import AutoDecoratorsController from '../../../core/AutoDecoratorsController.ts';
import StaticApiController from '../../../core/StaticApiController.ts';

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
    StaticApiController,
  },
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('\x1b[42m onError \x1b[0m', err.message, req.url);
  },
});
