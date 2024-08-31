import { describe, test } from 'node:test';
import assert from 'node:assert';
import diffMetadata from '../src/server/diffMetadata.mjs';
import { HttpMethod, type VovkMetadata } from 'vovk';

void describe('diffJson', async () => {
  await test('Test case 1: No changes', () => {
    const oldJson: VovkMetadata = {
      emitMetadata: true,
      segmentName: '',
      workers: {
        WorkerA: {
          _workerName: 'WorkerA',
          _handlers: { handlerA: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
          _handlers: {
            handlerB: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
          },
        },
      },
    };

    const newJson: VovkMetadata = { ...oldJson };

    const diff = diffMetadata(oldJson, newJson);

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

  await test('Test case 2: Workers and Controllers added and removed', () => {
    const oldJson: VovkMetadata = {
      emitMetadata: true,
      segmentName: '',
      workers: {
        WorkerA: {
          _workerName: 'WorkerA',
          _handlers: { handlerA: {} },
        },
        WorkerB: {
          _workerName: 'WorkerB',
          _handlers: { handlerB: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
          _handlers: {
            handlerC: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
          },
        },
      },
    };

    const newJson: VovkMetadata = {
      emitMetadata: true,
      segmentName: '',
      workers: {
        WorkerB: {
          _workerName: 'WorkerB',
          _handlers: { handlerB: {} },
        },
        WorkerC: { _workerName: 'WorkerC', _handlers: { handlerD: {} } },
      },
      controllers: {
        ControllerB: {
          _controllerName: 'ControllerB',
          _handlers: {
            handlerE: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
          },
        },
      },
    };

    const diff = diffMetadata(oldJson, newJson);

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

  await test('Test case 3: Handlers added, removed, and changed', () => {
    const oldJson: VovkMetadata = {
      emitMetadata: true,
      segmentName: '',
      workers: {
        WorkerA: {
          _workerName: 'WorkerA',
          _handlers: { handlerA: {}, handlerB: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
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

    const newJson: VovkMetadata = {
      emitMetadata: true,
      segmentName: '',
      workers: {
        WorkerA: {
          _workerName: 'WorkerA',
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

    const diff = diffMetadata(oldJson, newJson);

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

  await test('Test case 4: Complex changes', () => {
    const oldJson: VovkMetadata = {
      emitMetadata: true,
      segmentName: '',
      workers: {
        WorkerA: {
          _workerName: 'WorkerA',
          _handlers: { handlerA: {}, handlerB: {} },
        },
        WorkerB: {
          _workerName: 'WorkerB',
          _handlers: { handlerC: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
          _handlers: {
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
          },
        },
      },
    };

    const newJson: VovkMetadata = {
      emitMetadata: true,
      segmentName: '',
      workers: {
        WorkerA: {
          _workerName: 'WorkerA',
          _handlers: { handlerB: {}, handlerE: {} },
        },
        WorkerC: {
          _workerName: 'WorkerC',
          _handlers: { handlerF: {} },
        },
      },
      controllers: {
        ControllerA: {
          _controllerName: 'ControllerA',
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
          _handlers: {
            handlerH: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
          },
        },
      },
    };

    const diff = diffMetadata(oldJson, newJson);

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
