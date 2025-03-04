import { describe, it } from 'node:test';
import assert from 'node:assert';
import diffSchema from '../../../src/dev/diffSegmentSchema.mts';
import type { HttpMethod as VovkHttpMethod, VovkSegmentSchema } from 'vovk';

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
    const oldJson: VovkSegmentSchema = {
      emitSchema: true,
      segmentName: '',
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
            handlerB: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
          },
        },
      },
    };

    const newJson: VovkSegmentSchema = { ...oldJson };

    const diff = diffSchema(oldJson, newJson);

    assert.deepStrictEqual(diff, {
      controllers: {
        added: [],
        removed: [],
        handlers: [],
      },
    });
  });

  await it('Test case 2: Controllers added and removed', () => {
    const oldJson: VovkSegmentSchema = {
      emitSchema: true,
      segmentName: '',
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
            handlerC: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
          },
        },
      },
    };

    const newJson: VovkSegmentSchema = {
      emitSchema: true,
      segmentName: '',
      controllers: {
        ControllerB: {
          controllerName: 'ControllerB',
          originalControllerName: 'ControllerB',
          handlers: {
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
      controllers: {
        added: ['ControllerB'],
        removed: ['ControllerA'],
        handlers: [],
      },
    });
  });

  await it('Test case 3: Handlers added, removed, and changed', () => {
    const oldJson: VovkSegmentSchema = {
      emitSchema: true,
      segmentName: '',
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
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

    const newJson: VovkSegmentSchema = {
      emitSchema: true,
      segmentName: '',
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
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
    const oldJson: VovkSegmentSchema = {
      emitSchema: true,
      segmentName: '',
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
            handlerD: {
              path: 'path',
              httpMethod: HttpMethod.GET,
            },
          },
        },
      },
    };

    const newJson: VovkSegmentSchema = {
      emitSchema: true,
      segmentName: '',
      controllers: {
        ControllerA: {
          controllerName: 'ControllerA',
          originalControllerName: 'ControllerA',
          handlers: {
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
          controllerName: 'ControllerB',
          originalControllerName: 'ControllerB',
          handlers: {
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
