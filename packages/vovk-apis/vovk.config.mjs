// @ts-check

import camelCase from 'lodash/camelCase.js';
import startCase from 'lodash/startCase.js';

/** @type {import('vovk').VovkConfig} */
const config = {
  segmentedClient: {
    enabled: true,
    fromTemplates: ['cjs', 'mjs', 'readme'],
    outDir: './dist',
    prettifyClient: false, // takes too much time and memory on Github Mixin
  },
  composedClient: {
    enabled: false,
  },
  logLevel: 'debug',
  clientTemplateDefs: {
    readme: {
      extends: 'readme',
      outputConfig: {
        readme: {
          installCommand: 'npm install vovk-apis',
        },
      },
    },
  },
  libs: {
    /** @type {import('vovk-ajv').VovkAjvConfig} */
    ajv: {
      options: {
        strict: false, // Petstore provides "xml" keyword that gives errors in strict mode, proably fixes other issues
      },
    },
  },
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
    segments: {
      petstore: {
        openAPIMixin: {
          source: {
            url: 'https://petstore3.swagger.io/api/v3/openapi.json',
            fallback: './.openapi-cache/petstore.json',
          },
          getModuleName: 'PetstoreAPI',
          getMethodName: 'auto',
          apiRoot: 'https://petstore3.swagger.io/api/v3',
        },
        package: { name: 'vovk-apis/petstore' },
      },
      github: {
        openAPIMixin: {
          source: {
            url: 'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json',
            fallback: './.openapi-cache/github.json',
          },
          getModuleName: ({ operationObject }) => {
            const [operationNs] = operationObject.operationId?.split('/') ?? ['unknown'];
            return `Github${startCase(camelCase(operationNs)).replace(/ /g, '')}API`;
          },
          getMethodName: ({ operationObject }) => {
            const [, operationName] = operationObject.operationId?.split('/') ?? ['', 'ERROR'];
            return camelCase(operationName);
          },
        },
        package: { name: 'vovk-apis/github' },
        samples: {
          headers: {
            Authorization: 'Bearer ABC123',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      },
      telegram: {
        openAPIMixin: {
          source: {
            url: 'https://raw.githubusercontent.com/sys-001/telegram-bot-api-versions/refs/heads/main/files/openapi/yaml/v183.yaml',
            fallback: './.openapi-cache/telegram.yaml',
          },
          getModuleName: 'TelegramAPI',
          getMethodName: ({ path }) => path.replace(/^\//, ''),
          errorMessageKey: 'description',
        },
        package: { name: 'vovk-apis/telegram' },
        samples: {
          apiRoot: 'https://api.telegram.org/bot${token}',
        },
      },
    },
  },
};

export default config;
