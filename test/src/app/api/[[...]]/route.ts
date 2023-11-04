import { RouteHandlers } from '../../../../../src';
import '../../../controllers/TrimControllers';
import '../../../controllers/InputController';
import '../../../controllers/CustomDecoratorController';
import '../../../controllers/AllDecoratorsController';
import '../../../controllers/DuplicatedParameterController';
import '../../../controllers/ConflictingRoutesController';
import '../../../controllers/DesNotExistController';
import '../../../controllers/ErrorController';
import '../../../controllers/NextResponseController';
import '../../../controllers/HeadersController';
import '../../../controllers/RedirectController';

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = RouteHandlers;
