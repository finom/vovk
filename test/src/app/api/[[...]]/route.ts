import { activateControllers } from '../../../../../src';
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

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = activateControllers(
  [
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
  ],
  {
    onError: (err) => {
      console.log('onError', err);
    },
  }
);

// generate metadata for client controller only
activateControllers([ClientController, StreamingController], {
  onMetadata: async (metadata, deepEqual) => {
    if (process.env.NODE_ENV === 'development') {
      const [fs, path] = await Promise.all([import('fs/promises'), import('path')]);
      const metadataPath = path.join(__dirname.replace('.next/server/app', 'src'), '../../controllers-metadata.json');
      const existingMetadata = await fs.readFile(metadataPath, 'utf-8').catch(() => '{}');
      if (deepEqual(JSON.parse(existingMetadata), metadata)) return;
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    }
  },
});
