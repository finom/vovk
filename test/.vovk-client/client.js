// auto-generated
 
const { clientizeController } = require('vovk/client');
const { promisifyWorker } = require('vovk/worker');
const { default: fetcher } = require('vovk/client/defaultFetcher');
const schema = require('../.vovk-schema');

const { default: validateOnClient = null } = require('vovk-zod/validateOnClient');
const prefix = 'http://localhost:3000/api';
exports.ClientController = clientizeController(schema['foo/client'].controllers.ClientController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.ClientController5x = clientizeController(schema['foo/client'].controllers.ClientController5x, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.StreamingController = clientizeController(schema['foo/client'].controllers.StreamingController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.StreamingGeneratorController = clientizeController(schema['foo/client'].controllers.StreamingGeneratorController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.CostomSchemaController = clientizeController(schema['foo/client'].controllers.CostomSchemaController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.WithZodClientController = clientizeController(schema['foo/client'].controllers.WithZodClientController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.WithYupClientController = clientizeController(schema['foo/client'].controllers.WithYupClientController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.WithDtoClientController = clientizeController(schema['foo/client'].controllers.WithDtoClientController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.MyWorker = promisifyWorker(null, schema['workers'].workers.MyWorker);
exports.MyInnerWorker = promisifyWorker(null, schema['workers'].workers.MyInnerWorker);
exports.MyInnerWorkerX = promisifyWorker(null, schema['workers'].workers.MyInnerWorkerX);
