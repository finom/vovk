import { RouteHandlers } from '../../../../../src';
import '../../controllers/TrimControllers';
import '../../controllers/InputController';
import '../../controllers/CustomDecoratorController';
import '../../controllers/AllDecoratorsService';
import '../../controllers/DuplicatedParameterService';
import '../../controllers/ConflictingRoutesService';
import '../../controllers/DesNotExistService';

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = RouteHandlers;
