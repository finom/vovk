// auto-generated
/* eslint-disable */
const { clientizeController } = require('vovk/client');
const { promisifyWorker } = require('vovk/worker');
const { default: fetcher } = require('vovk/client/defaultFetcher');
const metadata = require('../.vovk-schema');

const { default: validateOnClient = null } = require('vovk-zod/validateOnClient');
const prefix = 'http://localhost:3210/api';
exports.ClientController = clientizeController(metadata['foo/client'].controllers.ClientController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.ClientController5x = clientizeController(metadata['foo/client'].controllers.ClientController5x, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.StreamingController = clientizeController(metadata['foo/client'].controllers.StreamingController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.StreamingGeneratorController = clientizeController(metadata['foo/client'].controllers.StreamingGeneratorController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.CostomMetadataController = clientizeController(metadata['foo/client'].controllers.CostomMetadataController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.WithZodClientController = clientizeController(metadata['foo/client'].controllers.WithZodClientController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.WithYupClientController = clientizeController(metadata['foo/client'].controllers.WithYupClientController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.WithDtoClientController = clientizeController(metadata['foo/client'].controllers.WithDtoClientController, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
exports.MyWorker = promisifyWorker(null, metadata['workers'].workers.MyWorker);
exports.MyInnerWorker = promisifyWorker(null, metadata['workers'].workers.MyInnerWorker);
exports.MyInnerWorkerX = promisifyWorker(null, metadata['workers'].workers.MyInnerWorkerX);
