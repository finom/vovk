import { initVovk } from 'vovk';
import trimControllers from '../../../core/TrimControllers';
import InputController from '../../../core/InputController';
import CustomDecoratorController from '../../../core/CustomDecoratorController';
import AllDecoratorsController from '../../../core/AllDecoratorsController';
import DuplicatedParameterController from '../../../core/DuplicatedParameterController';
import ConflictingRoutesController from '../../../core/ConflictingRoutesController';
import DesNotExistController from '../../../core/DesNotExistController';
import ErrorController from '../../../core/ErrorController';
import NextResponseController from '../../../core/NextResponseController';
import HeadersController from '../../../core/HeadersController';
import RedirectController from '../../../core/RedirectController';
import AutoDecoratorsController from '../../../core/AutoDecoratorsController';
import StaticApiController from '../../../core/StaticApiController';

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
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
