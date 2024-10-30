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
exports.MyWorkerWPC = promisifyWorker(null, schema['workers'].workers.MyWorkerWPC);
exports.MyInnerWorkerWPC = promisifyWorker(null, schema['workers'].workers.MyInnerWorkerWPC);
