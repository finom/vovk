import { describe, it } from 'node:test';
import assert from 'node:assert';
import diffSchema from '../../src/dev/diffSchema.mjs';
import type { HttpMethod as VovkHttpMethod, VovkSchema } from 'vovk';

// got some problems importing it from "vovk"
enum _HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

const HttpMethod = _HttpMethod as unknown as typeof VovkHttpMethod;

await describe('diffSchema', async () => {
  await it('Test case 1: No changes', () => {
    const oldJson: VovkSchema = {
      emitSchema: true,
      segmentName: '',
      workers: {
        WorkerA: {
          workerName: 'WorkerA',
          originalWorkerName: 'WorkerA',
          handlers: { handlerA: {} },
        },
      },
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
            handlerB: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
          },
        },
      },
    };

    const newJson: VovkSchema = { ...oldJson };

    const diff = diffSchema(oldJson, newJson);

    assert.deepStrictEqual(diff, {
      workers: {
        added: [],
        removed: [],
        handlers: [],
      },
      controllers: {
        added: [],
        removed: [],
        handlers: [],
      },
    });
  });

  await it('Test case 2: Workers and Controllers added and removed', () => {
    const oldJson: VovkSchema = {
      emitSchema: true,
      segmentName: '',
      workers: {
        WorkerA: {
          workerName: 'WorkerA',
          originalWorkerName: 'WorkerA',
          handlers: { handlerA: {} },
        },
        WorkerB: {
          workerName: 'WorkerB',
          originalWorkerName: 'WorkerB',
          handlers: { handlerB: {} },
        },
      },
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
            handlerC: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
          },
        },
      },
    };

    const newJson: VovkSchema = {
      emitSchema: true,
      segmentName: '',
      workers: {
        WorkerB: {
          workerName: 'WorkerB',
          originalWorkerName: 'WorkerB',
          handlers: { handlerB: {} },
        },
        WorkerC: {
          workerName: 'WorkerC',
          originalWorkerName: 'WorkerC',
          handlers: { handlerD: {} },
        },
      },
      controllers: {
        ControllerB: {
          controllerName: 'ControllerB',
          originalControllerName: 'ControllerB',
          handlers: {
            handlerE: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
          },
        },
      },
    };

    const diff = diffSchema(oldJson, newJson);

    assert.deepStrictEqual(diff, {
      workers: {
        added: ['WorkerC'],
        removed: ['WorkerA'],
        handlers: [],
      },
      controllers: {
        added: ['ControllerB'],
        removed: ['ControllerA'],
        handlers: [],
      },
    });
  });

  await it('Test case 3: Handlers added, removed, and changed', () => {
    const oldJson: VovkSchema = {
      emitSchema: true,
      segmentName: '',
      workers: {
        WorkerA: {
          workerName: 'WorkerA',
          originalWorkerName: 'WorkerA',
          handlers: { handlerA: {}, handlerB: {} },
        },
      },
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
            handlerC: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
          },
        },
      },
    };

    const newJson: VovkSchema = {
      emitSchema: true,
      segmentName: '',
      workers: {
        WorkerA: {
          workerName: 'WorkerA',
          originalWorkerName: 'WorkerA',
          handlers: {
            handlerB: {}, // Unchanged
            handlerE: {}, // Added
            handlerA: { isGenerator: true }, // Changed
          },
        },
      },
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
            handlerF: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
            handlerC: {
              path: 'newPath', // Changed
              httpMethod: HttpMethod.GET,
              validation: {},
            },
          },
        },
      },
    };

    const diff = diffSchema(oldJson, newJson);

    assert.deepStrictEqual(diff, {
      workers: {
        added: [],
        removed: [],
        handlers: [
          {
            nameOfClass: 'WorkerA',
            added: ['handlerE'],
            removed: [],
            changed: ['handlerA'],
          },
        ],
      },
      controllers: {
        added: [],
        removed: [],
        handlers: [
          {
            nameOfClass: 'ControllerA',
            added: ['handlerF'],
            removed: [],
            changed: ['handlerC'],
          },
        ],
      },
    });
  });

  await it('Test case 4: Complex changes', () => {
    const oldJson: VovkSchema = {
      emitSchema: true,
      segmentName: '',
      workers: {
        WorkerA: {
          workerName: 'WorkerA',
          originalWorkerName: 'WorkerA',
          handlers: { handlerA: {}, handlerB: {} },
        },
        WorkerB: {
          workerName: 'WorkerB',
          originalWorkerName: 'WorkerB',
          handlers: { handlerC: {} },
        },
      },
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
          },
        },
      },
    };

    const newJson: VovkSchema = {
      emitSchema: true,
      segmentName: '',
      workers: {
        WorkerA: {
          workerName: 'WorkerA',
          originalWorkerName: 'WorkerA',
          handlers: { handlerB: {}, handlerE: {} },
        },
        WorkerC: {
          workerName: 'WorkerC',
          originalWorkerName: 'WorkerC',
          handlers: { handlerF: {} },
        },
      },
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
            handlerG: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
          },
        },
        ControllerB: {
          controllerName: 'ControllerB',
          originalControllerName: 'ControllerB',
          handlers: {
            handlerH: {
              path: 'path',
              httpMethod: HttpMethod.GET,
              validation: {},
            },
          },
        },
      },
    };

    const diff = diffSchema(oldJson, newJson);

    assert.deepStrictEqual(diff, {
      workers: {
        added: ['WorkerC'],
        removed: ['WorkerB'],
        handlers: [
          {
            nameOfClass: 'WorkerA',
            added: ['handlerE'],
            removed: ['handlerA'],
            changed: [],
          },
        ],
      },
      controllers: {
        added: ['ControllerB'],
        removed: [],
        handlers: [
          {
            nameOfClass: 'ControllerA',
            added: ['handlerG'],
            removed: [],
            changed: [],
          },
        ],
      },
    });
  });
});
