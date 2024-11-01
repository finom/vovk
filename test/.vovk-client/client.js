// auto-generated
/* eslint-disable */
const { clientizeController } = require('vovk/client');
const { promisifyWorker } = require('vovk/worker');
const { default: fetcher } = require('vovk/client/defaultFetcher');
const schema = require('../.vovk-schema');

const { default: validateOnClient = null } = require('vovk-zod/validateOnClient');
const prefix = 'http://localhost:3000/api';
exports.ClientControllerRPC = clientizeController(schema['foo/client'].controllers.ClientControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.StreamingControllerRPC = clientizeController(schema['foo/client'].controllers.StreamingControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.StreamingGeneratorControllerRPC = clientizeController(schema['foo/client'].controllers.StreamingGeneratorControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.CostomSchemaControllerRPC = clientizeController(schema['foo/client'].controllers.CostomSchemaControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.WithZodClientControllerRPC = clientizeController(schema['foo/client'].controllers.WithZodClientControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.WithYupClientControllerRPC = clientizeController(schema['foo/client'].controllers.WithYupClientControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.WithDtoClientControllerRPC = clientizeController(schema['foo/client'].controllers.WithDtoClientControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.NoValidationControllerOnlyEntityRPC = clientizeController(schema['generated'].controllers.NoValidationControllerOnlyEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.NoValidationControllerServiceAndWorkerEntityRPC = clientizeController(schema['generated'].controllers.NoValidationControllerServiceAndWorkerEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.ZodControllerOnlyEntityRPC = clientizeController(schema['generated'].controllers.ZodControllerOnlyEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.ZodControllerAndServiceEntityRPC = clientizeController(schema['generated'].controllers.ZodControllerAndServiceEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.YupControllerOnlyEntityRPC = clientizeController(schema['generated'].controllers.YupControllerOnlyEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.YupControllerAndServiceEntityRPC = clientizeController(schema['generated'].controllers.YupControllerAndServiceEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.DtoControllerOnlyEntityRPC = clientizeController(schema['generated'].controllers.DtoControllerOnlyEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.DtoControllerAndServiceEntityRPC = clientizeController(schema['generated'].controllers.DtoControllerAndServiceEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.NoValidationControllerServiceAndWorkerEntityWPC = promisifyWorker(null, schema['generated'].workers.NoValidationControllerServiceAndWorkerEntityWPC);
exports.MyWorkerWPC = promisifyWorker(null, schema['workers'].workers.MyWorkerWPC);
exports.MyInnerWorkerWPC = promisifyWorker(null, schema['workers'].workers.MyInnerWorkerWPC);
