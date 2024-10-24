import { describe, it } from 'node:test';
import assert from 'node:assert';
import diffSchema from '../../src/watcher/diffSchema.mjs';
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

const HttpMethod = _HttpMethod as typeof VovkHttpMethod;

void describe('diffSchema', async () => {
  await it('Test case 1: No changes', () => {
    const oldJson: VovkSchema = {
      emitSchema: true,
      segmentName: '',
      workers: {
        WorkerA: {
          _workerName: 'WorkerA',
          _originalWorkerName: 'WorkerA',
          _handlers: { handlerA: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
          _originalControllerName: 'ControllerA',
          _handlers: {
            handlerB: {
              path: 'path',
              httpMethod: HttpMethod.GET,
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
          _workerName: 'WorkerA',
          _originalWorkerName: 'WorkerA',
          _handlers: { handlerA: {} },
        },
        WorkerB: {
          _workerName: 'WorkerB',
          _originalWorkerName: 'WorkerB',
          _handlers: { handlerB: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
          _originalControllerName: 'ControllerA',
          _handlers: {
            handlerC: {
              path: 'path',
              httpMethod: HttpMethod.GET,
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
          _workerName: 'WorkerB',
          _originalWorkerName: 'WorkerB',
          _handlers: { handlerB: {} },
        },
        WorkerC: {
          _workerName: 'WorkerC',
          _originalWorkerName: 'WorkerC',
          _handlers: { handlerD: {} },
        },
      },
      controllers: {
        ControllerB: {
          _controllerName: 'ControllerB',
          _originalControllerName: 'ControllerB',
          _handlers: {
            handlerE: {
              path: 'path',
              httpMethod: HttpMethod.GET,
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
          _workerName: 'WorkerA',
          _originalWorkerName: 'WorkerA',
          _handlers: { handlerA: {}, handlerB: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
          _originalControllerName: 'ControllerA',
          _handlers: {
            handlerC: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
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
          _workerName: 'WorkerA',
          _originalWorkerName: 'WorkerA',
          _handlers: {
            handlerB: {}, // Unchanged
            handlerE: {}, // Added
            handlerA: { isGenerator: true }, // Changed
          },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
          _originalControllerName: 'ControllerA',
          _handlers: {
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
            handlerF: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
            handlerC: {
              path: 'newPath', // Changed
              httpMethod: HttpMethod.GET,
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
          _workerName: 'WorkerA',
          _originalWorkerName: 'WorkerA',
          _handlers: { handlerA: {}, handlerB: {} },
        },
        WorkerB: {
          _workerName: 'WorkerB',
          _originalWorkerName: 'WorkerB',
          _handlers: { handlerC: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
          _originalControllerName: 'ControllerA',
          _handlers: {
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
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
          _workerName: 'WorkerA',
          _originalWorkerName: 'WorkerA',
          _handlers: { handlerB: {}, handlerE: {} },
        },
        WorkerC: {
          _workerName: 'WorkerC',
          _originalWorkerName: 'WorkerC',
          _handlers: { handlerF: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
          _originalControllerName: 'ControllerA',
          _handlers: {
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
            handlerG: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
          },
        },
        ControllerB: {
          _controllerName: 'ControllerB',
          _originalControllerName: 'ControllerB',
          _handlers: {
            handlerH: {
              path: 'path',
              httpMethod: HttpMethod.GET,
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
