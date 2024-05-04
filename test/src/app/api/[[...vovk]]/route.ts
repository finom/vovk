import { initVovk } from '../../../../../src';
import trimControllers from '../../../controllers/TrimControllers';
import InputController from '../../../controllers/InputController';
import CustomDecoratorController from '../../../controllers/CustomDecoratorController';
import AllDecoratorsController from '../../../controllers/AllDecoratorsController';
import DuplicatedParameterController from '../../../controllers/DuplicatedParameterController';
import ConflictingRoutesController from '../../../controllers/ConflictingRoutesController';
import DesNotExistController from '../../../controllers/DesNotExistController';
import ErrorController from '../../../controllers/ErrorController';
import NextResponseController from '../../../controllers/NextResponseController';
import HeadersController from '../../../controllers/HeadersController';
import RedirectController from '../../../controllers/RedirectController';
import MiscController from '../../../controllers/MiscController';
import AutoDecoratorsController from '../../../controllers/AutoDecoratorsController';
import ClientController from '../../../client/ClientController';
import StreamingController from '../../../client/StreamingController';
import MyWorker from '../../../worker/MyWorker';
import MyInnerWorker from '../../../worker/MyInnerWorker';
import StreamingGeneratorController from '../../../client/StreamingGeneratorController';

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  emitMetadata: false,
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
    MiscController,
    AutoDecoratorsController,
    ClientController,
    StreamingController,
    StreamingGeneratorController,
  },
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('onError', err.message, req);
  },
});

const controllers = { ClientController, StreamingController, StreamingGeneratorController };
const workers = { MyWorker, MyInnerWorker };

export type Controllers = typeof controllers;
export type Workers = typeof workers;

// generate metadata for client controller only
initVovk({
  controllers,
  workers,
});
