import * as vovk0 from 'vovk';
import { VovkClientFetcher } from 'vovk';
import * as openapi3_ts_oas31811 from 'openapi3-ts/oas31';

//#region src/client/StreamingController.d.ts
type Token$1 = {
  token: string;
  query: 'queryValue';
};
//#endregion
//#region src/client/StreamingGeneratorController.d.ts
type Token = {
  token: string;
  query: 'queryValue';
};
//#endregion
//#region src/client/WithDtoClientController.dto.d.ts
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleAll
 * -------------------------------------------------------------------------
 */
declare class HandleAllBodyDto {
  hello: string;
}
declare class HandleAllQueryDto {
  search: string;
}
declare class HandleAllParamsDto {
  foo: string;
  bar: string;
}
declare class HandleAllOutputDto {
  body: HandleAllBodyDto;
  query: HandleAllQueryDto;
  params: HandleAllParamsDto;
  vovkParams: HandleAllParamsDto;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleQuery
 * -------------------------------------------------------------------------
 */
declare class HandleQueryQueryDto {
  search: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleBody
 * -------------------------------------------------------------------------
 */
declare class HandleBodyBodyDto {
  hello: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleParams
 * -------------------------------------------------------------------------
 */
declare class HandleParamsDto {
  foo: string;
  bar: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleNestedQuery
 * -------------------------------------------------------------------------
 */

declare class DDto {
  x: string;
}
declare class ZDto {
  f: string;
  u: string[];
  d: DDto;
}
declare class HandleNestedQueryDto {
  x: string;
  y: string[];
  z: ZDto;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleOutput
 * -------------------------------------------------------------------------
 */
declare class HandleOutputQueryDto {
  helloOutput: string;
}
declare class HandleOutputOutputDto {
  hello: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleStream
 * -------------------------------------------------------------------------
 */
declare class HandleStreamQueryDto {
  values: string[];
}
/**
 * -------------------------------------------------------------------------
 * DTOs for handleStream with iteration
 * -------------------------------------------------------------------------
 * */
declare class IterationDto {
  value: 'a' | 'b' | 'c' | 'd';
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for values with a, b, c, d
 * -------------------------------------------------------------------------
 */
declare class QueryValuesDto {
  values: string[];
}
declare class RequiredObject {
  requiredField: string;
  optionalField?: number;
}
declare class StrictObject {
  knownField: string;
}
declare class AllOfDtoA {
  a: string;
}
declare class AllOfDtoB {
  b: number;
}
declare class ConstrainingDto {
  enum_value: 'a' | 'b' | 'c';
  num_minimum: number;
  num_maximum: number;
  num_exclusiveMinimum: number;
  num_exclusiveMaximum: number;
  num_multipleOf: number;
  num_int: number;
  num_int32: number;
  str_minLength: string;
  str_maxLength: string;
  str_pattern: string;
  str_email: string;
  str_url: string;
  str_uuid: string;
  str_datetime: string;
  arr_minItems: string[];
  arr_maxItems: string[];
  obj_required: RequiredObject;
  obj_strict: StrictObject;
  logical_anyOf: string | number | boolean;
  logical_allOf: AllOfDtoA & AllOfDtoB;
}
//#endregion
//#region tmp_ts_rpc/schema.d.ts
declare const schema: {
  $schema: string;
  segments: {
    'foo/client': {
      $schema: string;
      emitSchema: boolean;
      segmentName: string;
      controllers: {
        CommonControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getHelloWorldResponseObject: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldObjectLiteral: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldNextResponseObjectPromise: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldRawResponseObjectPromise: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldObjectLiteralPromise: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldHeaders: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldArray: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldAndEmptyGeneric: {
              httpMethod: string;
              path: string;
            };
            getWithParams: {
              path: string;
              httpMethod: string;
            };
            postWithAll: {
              path: string;
              httpMethod: string;
            };
            postWithBodyAndQueryUsingReqVovk: {
              path: string;
              httpMethod: string;
            };
            getNestedQuery: {
              path: string;
              httpMethod: string;
            };
            postWithFormDataUsingReqVovk: {
              path: string;
              httpMethod: string;
            };
            getErrorResponse: {
              path: string;
              httpMethod: string;
            };
            getJsonTextResponse: {
              path: string;
              httpMethod: string;
            };
            getJsonlResponse: {
              path: string;
              httpMethod: string;
            };
            getJsonlTextResponse: {
              path: string;
              httpMethod: string;
            };
          };
        };
        StreamingControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            postWithStreaming: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndImmediateError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedCustomError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedUnhandledError: {
              httpMethod: string;
              path: string;
            };
          };
        };
        StreamingGeneratorControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getWithStreaming: {
              httpMethod: string;
              path: string;
            };
            postWithAsyncStreaming: {
              httpMethod: string;
              path: string;
            };
            postWithStreaming: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndImmediateError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedCustomError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedUnhandledError: {
              httpMethod: string;
              path: string;
            };
          };
        };
        CustomSchemaControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getWithCustomSchema: {
              misc: {
                hello: string;
              };
              httpMethod: string;
              path: string;
            };
          };
        };
        WithZodClientControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            handleAll: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                    };
                    bar: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    body: {
                      type: string;
                      properties: {
                        hello: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    query: {
                      type: string;
                      properties: {
                        search: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    params: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    vovkParams: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                responses: {
                  '400': {
                    description: string;
                    content: {
                      'application/json': {
                        schema: {
                          allOf: (
                            | {
                                $ref: string;
                                type?: undefined;
                                properties?: undefined;
                              }
                            | {
                                type: string;
                                properties: {
                                  message: {
                                    type: string;
                                    enum: string[];
                                  };
                                  statusCode: {
                                    type: string;
                                    enum: number[];
                                  };
                                };
                                $ref?: undefined;
                              }
                          )[];
                        };
                      };
                    };
                  };
                };
                summary: string;
                description: string;
              };
            };
            handleQuery: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleBody: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleParams: {
              validation: {
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                      maxLength: number;
                    };
                    bar: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
            };
            handleNestedQuery: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    x: {
                      type: string;
                      maxLength: number;
                    };
                    y: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                    z: {
                      type: string;
                      properties: {
                        f: {
                          type: string;
                        };
                        u: {
                          type: string;
                          items: {
                            type: string;
                          };
                        };
                        d: {
                          type: string;
                          properties: {
                            x: {
                              type: string;
                            };
                            arrOfObjects: {
                              type: string;
                              items: {
                                type: string;
                                properties: {
                                  foo: {
                                    type: string;
                                  };
                                  nestedArr: {
                                    type: string;
                                    items: {
                                      type: string;
                                    };
                                  };
                                  nestedObj: {
                                    type: string;
                                    properties: {
                                      deepKey: {
                                        type: string;
                                      };
                                    };
                                    required: string[];
                                    additionalProperties: boolean;
                                  };
                                };
                                required: string[];
                                additionalProperties: boolean;
                              };
                            };
                          };
                          required: string[];
                          additionalProperties: boolean;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleOutput: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    helloOutput: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleStream: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    values: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                iteration: {
                  $schema: string;
                  type: string;
                  properties: {
                    value: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleSchemaConstraints: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    enum_value: {
                      type: string;
                      enum: string[];
                    };
                    num_minimum: {
                      type: string;
                      minimum: number;
                    };
                    num_maximum: {
                      type: string;
                      maximum: number;
                    };
                    num_exclusiveMinimum: {
                      type: string;
                      exclusiveMinimum: number;
                    };
                    num_exclusiveMaximum: {
                      type: string;
                      exclusiveMaximum: number;
                    };
                    num_multipleOf: {
                      type: string;
                      multipleOf: number;
                    };
                    num_int: {
                      type: string;
                      minimum: number;
                      maximum: number;
                    };
                    num_int32: {
                      type: string;
                      minimum: number;
                      maximum: number;
                    };
                    str_minLength: {
                      type: string;
                      minLength: number;
                    };
                    str_maxLength: {
                      type: string;
                      maxLength: number;
                    };
                    str_pattern: {
                      type: string;
                      pattern: string;
                    };
                    str_email: {
                      type: string;
                      format: string;
                      pattern: string;
                    };
                    str_url: {
                      type: string;
                      format: string;
                    };
                    str_uuid: {
                      type: string;
                      format: string;
                      pattern: string;
                    };
                    str_datetime: {
                      type: string;
                      format: string;
                      pattern: string;
                    };
                    arr_minItems: {
                      minItems: number;
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                    arr_maxItems: {
                      maxItems: number;
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                    obj_required: {
                      type: string;
                      properties: {
                        requiredField: {
                          type: string;
                        };
                        optionalField: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    obj_strict: {
                      type: string;
                      properties: {
                        knownField: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    logical_anyOf: {
                      anyOf: (
                        | {
                            type: string;
                            maxLength: number;
                          }
                        | {
                            type: string;
                            maxLength?: undefined;
                          }
                      )[];
                    };
                    logical_allOf: {
                      allOf: (
                        | {
                            type: string;
                            properties: {
                              a: {
                                type: string;
                              };
                              b?: undefined;
                            };
                            required: string[];
                            additionalProperties: {};
                          }
                        | {
                            type: string;
                            properties: {
                              b: {
                                type: string;
                              };
                              a?: undefined;
                            };
                            required: string[];
                            additionalProperties: {};
                          }
                      )[];
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleNothitng: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            handleFormData: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                  'x-formData': boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleFormDataWithFile: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                    file: {
                      type: string;
                      format: string;
                      contentEncoding: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                  'x-formData': boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationBool: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationStrings: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionBool: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionStrings: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            validateEachIteration: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    values: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                iteration: {
                  $schema: string;
                  type: string;
                  properties: {
                    value: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleAllAsFunction: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                    };
                    bar: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    body: {
                      type: string;
                      properties: {
                        hello: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    query: {
                      type: string;
                      properties: {
                        search: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    params: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    vovkParams: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
            };
            handleAllNoHttpAsFunction: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                    };
                    bar: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    body: {
                      type: string;
                      properties: {
                        hello: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    query: {
                      type: string;
                      properties: {
                        search: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    params: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    vovkParams: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
            };
          };
        };
        WithYupClientControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            handleAll: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                params: {
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                      maxLength: number;
                    };
                    bar: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                output: {
                  type: string;
                  properties: {
                    body: {
                      type: string;
                      properties: {
                        hello: {
                          type: string;
                          maxLength: number;
                        };
                      };
                      required: string[];
                    };
                    query: {
                      type: string;
                      properties: {
                        search: {
                          type: string;
                          maxLength: number;
                        };
                      };
                      required: string[];
                    };
                    params: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                          maxLength: number;
                        };
                        bar: {
                          type: string;
                          maxLength: number;
                        };
                      };
                      required: string[];
                    };
                    vovkParams: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                          maxLength: number;
                        };
                        bar: {
                          type: string;
                          maxLength: number;
                        };
                      };
                      required: string[];
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                responses: {
                  '400': {
                    description: string;
                    content: {
                      'application/json': {
                        schema: {
                          allOf: (
                            | {
                                $ref: string;
                                type?: undefined;
                                properties?: undefined;
                              }
                            | {
                                type: string;
                                properties: {
                                  message: {
                                    type: string;
                                    enum: string[];
                                  };
                                  statusCode: {
                                    type: string;
                                    enum: number[];
                                  };
                                };
                                $ref?: undefined;
                              }
                          )[];
                        };
                      };
                    };
                  };
                };
                summary: string;
                description: string;
              };
            };
            handleQuery: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleBody: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleParams: {
              validation: {
                params: {
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                      maxLength: number;
                    };
                    bar: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
            };
            handleNestedQuery: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    x: {
                      type: string;
                      maxLength: number;
                    };
                    y: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                    z: {
                      type: string;
                      properties: {
                        f: {
                          type: string;
                        };
                        u: {
                          type: string;
                          items: {
                            type: string;
                          };
                        };
                        d: {
                          type: string;
                          properties: {
                            x: {
                              type: string;
                            };
                            arrOfObjects: {
                              type: string;
                              items: {
                                type: string;
                                default: {
                                  nestedObj: {};
                                };
                                properties: {
                                  foo: {
                                    type: string;
                                  };
                                  nestedArr: {
                                    type: string;
                                    items: {
                                      type: string;
                                    };
                                  };
                                  nestedObj: {
                                    type: string;
                                    default: {};
                                    properties: {
                                      deepKey: {
                                        type: string;
                                      };
                                    };
                                  };
                                };
                                required: string[];
                              };
                            };
                          };
                          required: string[];
                        };
                      };
                      required: string[];
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleOutput: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    helloOutput: {
                      type: string;
                    };
                  };
                  required: string[];
                };
                output: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleStream: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    values: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                  };
                  required: string[];
                };
                iteration: {
                  type: string;
                  properties: {
                    value: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleSchemaConstraints: {
              validation: {
                body: {
                  type: string;
                  default: {
                    logical_allOf: {};
                    obj_strict: {};
                    obj_required: {};
                  };
                  properties: {
                    enum_value: {
                      type: string;
                      enum: string[];
                    };
                    num_minimum: {
                      type: string;
                      minimum: number;
                    };
                    num_maximum: {
                      type: string;
                      maximum: number;
                    };
                    num_exclusiveMinimum: {
                      type: string;
                      exclusiveMinimum: number;
                    };
                    num_exclusiveMaximum: {
                      type: string;
                      exclusiveMaximum: number;
                    };
                    num_multipleOf: {
                      type: string;
                    };
                    num_int: {
                      type: string;
                    };
                    num_int32: {
                      type: string;
                      maximum: number;
                      minimum: number;
                    };
                    str_minLength: {
                      type: string;
                      minLength: number;
                    };
                    str_maxLength: {
                      type: string;
                      maxLength: number;
                    };
                    str_pattern: {
                      type: string;
                      pattern: string;
                    };
                    str_email: {
                      type: string;
                      format: string;
                    };
                    str_url: {
                      type: string;
                      format: string;
                    };
                    str_uuid: {
                      type: string;
                      pattern: string;
                    };
                    str_datetime: {
                      type: string;
                    };
                    arr_minItems: {
                      type: string;
                      items: {
                        type: string;
                      };
                      minItems: number;
                    };
                    arr_maxItems: {
                      type: string;
                      items: {
                        type: string;
                      };
                      maxItems: number;
                    };
                    obj_required: {
                      type: string;
                      default: {};
                      properties: {
                        requiredField: {
                          type: string;
                        };
                        optionalField: {
                          type: string;
                        };
                      };
                      required: string[];
                    };
                    obj_strict: {
                      type: string;
                      default: {};
                      properties: {
                        knownField: {
                          type: string;
                        };
                      };
                    };
                    logical_anyOf: {
                      type: string;
                      maxLength: number;
                    };
                    logical_allOf: {
                      type: string;
                      properties: {
                        a: {
                          type: string;
                        };
                        b: {
                          type: string;
                        };
                      };
                      required: string[];
                    };
                  };
                };
              };
              httpMethod: string;
              path: string;
            };
            handleNothitng: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            handleFormData: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  'x-formData': boolean;
                };
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationBool: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationStrings: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionBool: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionStrings: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            validateEachIteration: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    values: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                  };
                  required: string[];
                };
                iteration: {
                  type: string;
                  properties: {
                    value: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
          };
        };
        WithDtoClientControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            handleAll: {
              validation: {
                body: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                params: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    foo: {
                      maxLength: number;
                      type: string;
                    };
                    bar: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                output: {
                  'x-isDto': boolean;
                  definitions: {
                    HandleAllBodyDto: {
                      properties: {
                        hello: {
                          maxLength: number;
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                    HandleAllQueryDto: {
                      properties: {
                        search: {
                          maxLength: number;
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                    HandleAllParamsDto: {
                      properties: {
                        foo: {
                          maxLength: number;
                          type: string;
                        };
                        bar: {
                          maxLength: number;
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                  };
                  properties: {
                    body: {
                      $ref: string;
                    };
                    query: {
                      $ref: string;
                    };
                    params: {
                      $ref: string;
                    };
                    vovkParams: {
                      $ref: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                responses: {
                  '400': {
                    description: string;
                    content: {
                      'application/json': {
                        schema: {
                          allOf: (
                            | {
                                $ref: string;
                                type?: undefined;
                                properties?: undefined;
                              }
                            | {
                                type: string;
                                properties: {
                                  message: {
                                    type: string;
                                    enum: string[];
                                  };
                                  statusCode: {
                                    type: string;
                                    enum: number[];
                                  };
                                };
                                $ref?: undefined;
                              }
                          )[];
                        };
                      };
                    };
                  };
                };
                summary: string;
                description: string;
              };
            };
            handleNestedQuery: {
              validation: {
                query: {
                  'x-isDto': boolean;
                  definitions: {
                    ZDto: {
                      properties: {
                        f: {
                          type: string;
                        };
                        u: {
                          items: {
                            type: string;
                          };
                          type: string;
                        };
                        d: {
                          $ref: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                    DDto: {
                      properties: {
                        x: {
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                  };
                  properties: {
                    x: {
                      type: string;
                      maxLength: number;
                    };
                    y: {
                      items: {
                        type: string;
                      };
                      type: string;
                    };
                    z: {
                      $ref: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleNestedQueryClient: {
              httpMethod: string;
              path: string;
            };
            handleOutput: {
              validation: {
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    helloOutput: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                output: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleOutputClient: {
              httpMethod: string;
              path: string;
            };
            handleStream: {
              validation: {
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    values: {
                      items: {
                        type: string;
                      };
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                iteration: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    value: {
                      type: string;
                      enum: string[];
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleSchemaConstraints: {
              validation: {
                body: {
                  'x-isDto': boolean;
                  definitions: {
                    RequiredObject: {
                      properties: {
                        requiredField: {
                          type: string;
                          not: {
                            type: string;
                          };
                        };
                        optionalField: {
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                    StrictObject: {
                      properties: {
                        knownField: {
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                  };
                  properties: {
                    enum_value: {
                      type: string;
                      enum: string[];
                    };
                    num_minimum: {
                      minimum: number;
                      type: string;
                    };
                    num_maximum: {
                      maximum: number;
                      type: string;
                    };
                    num_exclusiveMinimum: {
                      type: string;
                    };
                    num_exclusiveMaximum: {
                      type: string;
                    };
                    num_multipleOf: {
                      type: string;
                    };
                    num_int: {
                      type: string;
                    };
                    num_int32: {
                      minimum: number;
                      type: string;
                      maximum: number;
                    };
                    str_minLength: {
                      minLength: number;
                      type: string;
                    };
                    str_maxLength: {
                      maxLength: number;
                      type: string;
                    };
                    str_pattern: {
                      pattern: string;
                      type: string;
                    };
                    str_email: {
                      format: string;
                      type: string;
                    };
                    str_url: {
                      format: string;
                      type: string;
                    };
                    str_uuid: {
                      format: string;
                      type: string;
                    };
                    str_datetime: {
                      oneOf: {
                        format: string;
                        type: string;
                      }[];
                    };
                    arr_minItems: {
                      items: {
                        type: string;
                      };
                      type: string;
                      maxItems: number;
                      minItems: number;
                    };
                    arr_maxItems: {
                      items: {
                        type: string;
                      };
                      type: string;
                      maxItems: number;
                      minItems: number;
                    };
                    obj_required: {
                      $ref: string;
                    };
                    obj_strict: {
                      $ref: string;
                    };
                    logical_allOf: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleNothitng: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            handleFormData: {
              validation: {
                body: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                  'x-formData': boolean;
                };
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationBool: {
              validation: {
                body: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationStrings: {
              validation: {
                body: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionBool: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionStrings: {
              validation: {
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            validateEachIteration: {
              validation: {
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    values: {
                      items: {};
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                iteration: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    value: {
                      type: string;
                      enum: string[];
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleAllClient: {
              path: string;
              httpMethod: string;
            };
            handleQuery: {
              validation: {
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleQueryClient: {
              httpMethod: string;
              path: string;
            };
            handleBody: {
              validation: {
                body: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleBodyClient: {
              httpMethod: string;
              path: string;
            };
            handleParams: {
              validation: {
                params: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    foo: {
                      maxLength: number;
                      type: string;
                    };
                    bar: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
            };
            handleParamsClient: {
              path: string;
              httpMethod: string;
            };
          };
        };
        OpenApiControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getFromSchema: {
              openapi: {
                responses: {
                  '418': {
                    description: string;
                    content: {
                      'application/json': {
                        schema: {
                          allOf: (
                            | {
                                $ref: string;
                                type?: undefined;
                                properties?: undefined;
                              }
                            | {
                                type: string;
                                properties: {
                                  message: {
                                    type: string;
                                    enum: string[];
                                  };
                                  statusCode: {
                                    type: string;
                                    enum: number[];
                                  };
                                };
                                $ref?: undefined;
                              }
                          )[];
                        };
                      };
                    };
                  };
                };
                summary: string;
              };
              path: string;
              httpMethod: string;
            };
          };
        };
      };
    };
    generated: {
      $schema: string;
      emitSchema: boolean;
      segmentName: string;
      controllers: {
        NoValidationControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getNoValidationControllerOnlyEntities: {
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateNoValidationControllerOnlyEntity: {
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createNoValidationControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteNoValidationControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        NoValidationControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getNoValidationControllerAndServiceEntities: {
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateNoValidationControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createNoValidationControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteNoValidationControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        ZodControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getZodControllerOnlyEntities: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateZodControllerOnlyEntity: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      anyOf: {
                        type: string;
                        const: string;
                      }[];
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createZodControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteZodControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        ZodControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getZodControllerAndServiceEntities: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateZodControllerAndServiceEntity: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      anyOf: {
                        type: string;
                        const: string;
                      }[];
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createZodControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteZodControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        YupControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getYupControllerOnlyEntities: {
              validation: {
                query: {
                  type: string;
                  default: {};
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateYupControllerOnlyEntity: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    foo: {
                      type: string[];
                      enum: string[];
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  default: {};
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createYupControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteYupControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        YupControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getYupControllerAndServiceEntities: {
              validation: {
                query: {
                  type: string;
                  default: {};
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateYupControllerAndServiceEntity: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    foo: {
                      type: string[];
                      enum: string[];
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  default: {};
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createYupControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteYupControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        DtoControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getDtoControllerOnlyEntities: {
              validation: {
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateDtoControllerOnlyEntity: {
              validation: {
                body: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    foo: {
                      type: string;
                      enum: string[];
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createDtoControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteDtoControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        DtoControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getDtoControllerAndServiceEntities: {
              validation: {
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateDtoControllerAndServiceEntity: {
              validation: {
                body: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    foo: {
                      type: string;
                      enum: string[];
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  'x-isDto': boolean;
                  definitions: {};
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createDtoControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteDtoControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
      };
    };
  };
  meta: {
    config: {
      $schema: string;
      libs: {};
    };
    $schema: string;
    apiRoot: string;
  };
};
//#endregion
//#region tmp_ts_rpc/index.d.ts
declare const CommonControllerRPC: {
  getHelloWorldResponseObject: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getHelloWorldObjectLiteral: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getHelloWorldNextResponseObjectPromise: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getHelloWorldRawResponseObjectPromise: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: Response) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object ? Promise<Awaited<R>> : Promise<Response>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getHelloWorldObjectLiteralPromise: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getHelloWorldHeaders: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string | null }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: string | null;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getHelloWorldArray: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: {
                  hello: string;
                }[]
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<
        {
          hello: string;
        }[]
      >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getHelloWorldAndEmptyGeneric: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getWithParams: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    params: {
      hello: 'world';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: { hello: 'world' }) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: 'world';
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithAll: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: {
      isBody: true;
    };
    query: {
      simpleQueryParam: 'queryValue';
    };
    params: {
      hello: 'world';
    } & {
      hello: 'world';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          params: {
            hello: 'world';
          };
          body: {
            isBody: true;
          };
          query: {
            simpleQueryParam: 'queryValue';
          };
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        params: {
          hello: 'world';
        };
        body: {
          isBody: true;
        };
        query: {
          simpleQueryParam: 'queryValue';
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithBodyAndQueryUsingReqVovk: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: {
      isBody: true;
    };
    query: {
      simpleQueryParam: 'queryValue';
      array1: readonly ['foo'];
      array2: readonly ['bar', 'baz'];
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            isBody: true;
          };
          query: {
            simpleQueryParam: 'queryValue';
            array1: readonly ['foo'];
            array2: readonly ['bar', 'baz'];
          };
          meta: {
            isMeta1: true;
            isMeta2: true;
          };
          metaNulled: Record<any, any>;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          isBody: true;
        };
        query: {
          simpleQueryParam: 'queryValue';
          array1: readonly ['foo'];
          array2: readonly ['bar', 'baz'];
        };
        meta: {
          isMeta1: true;
          isMeta2: true;
        };
        metaNulled: Record<any, any>;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getNestedQuery: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    query: {
      x: string;
      y: string[];
      z: {
        f: string;
        u: string[];
        d: {
          x: string;
          arrOfObjects: (
            | {
                foo: string;
                nestedArr: string[];
                nestedObj?: undefined;
              }
            | {
                foo: string;
                nestedObj: {
                  deepKey: string;
                };
                nestedArr?: undefined;
              }
          )[];
        };
      };
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          query: {
            x: string;
            y: string[];
            z: {
              f: string;
              u: string[];
              d: {
                x: string;
                arrOfObjects: (
                  | {
                      foo: string;
                      nestedArr: string[];
                      nestedObj?: undefined;
                    }
                  | {
                      foo: string;
                      nestedObj: {
                        deepKey: string;
                      };
                      nestedArr?: undefined;
                    }
                )[];
              };
            };
          };
          search: string;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        query: {
          x: string;
          y: string[];
          z: {
            f: string;
            u: string[];
            d: {
              x: string;
              arrOfObjects: (
                | {
                    foo: string;
                    nestedArr: string[];
                    nestedObj?: undefined;
                  }
                | {
                    foo: string;
                    nestedObj: {
                      deepKey: string;
                    };
                    nestedArr?: undefined;
                  }
              )[];
            };
          };
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithFormDataUsingReqVovk: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: FormData;
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: { field: 'value' }) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        field: 'value';
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getErrorResponse: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: void) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object ? Promise<Awaited<R>> : Promise<void>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getJsonTextResponse: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: Response) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object ? Promise<Awaited<R>> : Promise<Response>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getJsonlResponse: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: vovk0.JSONLinesResponse<{
                  hello: string;
                }>
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      hello: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  getJsonlTextResponse: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: vovk0.JSONLinesResponse<{
                  hello: string;
                }>
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      hello: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
};
declare const StreamingControllerRPC: {
  postWithStreaming: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token$1, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithStreamingAndImmediateError: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token$1, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithStreamingAndDelayedError: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token$1, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithStreamingAndDelayedCustomError: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token$1, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithStreamingAndDelayedUnhandledError: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token$1, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
};
declare const StreamingGeneratorControllerRPC: {
  getWithStreaming: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: AsyncGenerator<Token, void, unknown>) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<vovk0.VovkStreamAsyncIterable<Token>>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithAsyncStreaming: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((
          staticMethodReturn: AsyncGenerator<
            {
              query: 'queryValue';
              token: string;
            },
            void,
            unknown
          >
        ) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      query: 'queryValue';
      token: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithStreaming: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((
          staticMethodReturn: AsyncGenerator<
            {
              query: 'queryValue';
              token: string;
            },
            void,
            unknown
          >
        ) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      query: 'queryValue';
      token: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithStreamingAndImmediateError: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: AsyncGenerator<Token, void, unknown>) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<vovk0.VovkStreamAsyncIterable<Token>>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithStreamingAndDelayedError: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((
          staticMethodReturn: AsyncGenerator<
            {
              query: 'queryValue';
              token: string;
            },
            void,
            unknown
          >
        ) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      query: 'queryValue';
      token: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithStreamingAndDelayedCustomError: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((
          staticMethodReturn: AsyncGenerator<
            {
              query: 'queryValue';
              token: string;
            },
            void,
            unknown
          >
        ) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      query: 'queryValue';
      token: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
  postWithStreamingAndDelayedUnhandledError: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: Omit<Token, 'query'>[];
    query: {
      query: 'queryValue';
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((
          staticMethodReturn: AsyncGenerator<
            {
              query: 'queryValue';
              token: string;
            },
            void,
            unknown
          >
        ) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      query: 'queryValue';
      token: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
};
declare const CustomSchemaControllerRPC: {
  getWithCustomSchema: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: null) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object ? Promise<Awaited<R>> : Promise<null>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
};
declare const WithZodClientControllerRPC: {
  handleAll: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    query: {
      search: string;
    };
    params: {
      foo: string;
      bar: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            hello: string;
          };
          query: {
            search: string;
          };
          params: {
            foo: string;
            bar: string;
          };
          vovkParams: {
            foo: string;
            bar: string;
          };
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      output: {
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      };
      iteration: unknown;
      isForm: any;
    };
  };
  handleQuery: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    query: {
      search: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: { search: string }) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: unknown;
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  handleBody: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: unknown;
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  handleParams: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    params: {
      foo: string;
      bar: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: { foo: string; bar: string }) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        foo: string;
        bar: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: unknown;
      query: unknown;
      params: {
        foo: string;
        bar: string;
      };
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  handleNestedQuery: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    query: {
      x: string;
      y: string[];
      z: {
        f: string;
        u: string[];
        d: {
          x: string;
          arrOfObjects: {
            foo: string;
            nestedArr?: string[] | undefined;
            nestedObj?:
              | {
                  deepKey: string;
                }
              | undefined;
          }[];
        };
      };
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          x: string;
          y: string[];
          z: {
            f: string;
            u: string[];
            d: {
              x: string;
              arrOfObjects: {
                foo: string;
                nestedArr?: string[] | undefined;
                nestedObj?:
                  | {
                      deepKey: string;
                    }
                  | undefined;
              }[];
            };
          };
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        x: string;
        y: string[];
        z: {
          f: string;
          u: string[];
          d: {
            x: string;
            arrOfObjects: {
              foo: string;
              nestedArr?: string[] | undefined;
              nestedObj?:
                | {
                    deepKey: string;
                  }
                | undefined;
            }[];
          };
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: unknown;
      query: {
        x: string;
        y: string[];
        z: {
          f: string;
          u: string[];
          d: {
            x: string;
            arrOfObjects: {
              foo: string;
              nestedArr?: string[] | undefined;
              nestedObj?:
                | {
                    deepKey: string;
                  }
                | undefined;
            }[];
          };
        };
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  handleOutput: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    query: {
      helloOutput: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: unknown;
      query: {
        helloOutput: string;
      };
      params: unknown;
      output: {
        hello: string;
      };
      iteration: unknown;
      isForm: any;
    };
  };
  handleStream: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    query: {
      values: string[];
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((
          staticMethodReturn: AsyncGenerator<
            {
              value: string;
            },
            void,
            unknown
          >
        ) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      value: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: unknown;
      query: {
        values: string[];
      };
      params: unknown;
      output: unknown;
      iteration: {
        value: string;
      };
      isForm: any;
    };
  };
  handleSchemaConstraints: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          enum_value: 'a' | 'b' | 'c';
          num_minimum: number;
          num_maximum: number;
          num_exclusiveMinimum: number;
          num_exclusiveMaximum: number;
          num_multipleOf: number;
          num_int: number;
          num_int32: number;
          str_minLength: string;
          str_maxLength: string;
          str_pattern: string;
          str_email: string;
          str_url: string;
          str_uuid: string;
          str_datetime: string;
          arr_minItems: string[];
          arr_maxItems: string[];
          obj_required: {
            requiredField: string;
            optionalField?: number | undefined;
          };
          obj_strict: {
            knownField: string;
          };
          logical_anyOf: string | number | boolean;
          logical_allOf: {
            [x: string]: unknown;
            a: string;
          } & {
            [x: string]: unknown;
            b: number;
          };
        };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          enum_value: 'a' | 'b' | 'c';
          num_minimum: number;
          num_maximum: number;
          num_exclusiveMinimum: number;
          num_exclusiveMaximum: number;
          num_multipleOf: number;
          num_int: number;
          num_int32: number;
          str_minLength: string;
          str_maxLength: string;
          str_pattern: string;
          str_email: string;
          str_url: string;
          str_uuid: string;
          str_datetime: string;
          arr_minItems: string[];
          arr_maxItems: string[];
          obj_required: {
            requiredField: string;
            optionalField?: number | undefined;
          };
          obj_strict: {
            knownField: string;
          };
          logical_anyOf: string | number | boolean;
          logical_allOf: {
            [x: string]: unknown;
            a: string;
          } & {
            [x: string]: unknown;
            b: number;
          };
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        enum_value: 'a' | 'b' | 'c';
        num_minimum: number;
        num_maximum: number;
        num_exclusiveMinimum: number;
        num_exclusiveMaximum: number;
        num_multipleOf: number;
        num_int: number;
        num_int32: number;
        str_minLength: string;
        str_maxLength: string;
        str_pattern: string;
        str_email: string;
        str_url: string;
        str_uuid: string;
        str_datetime: string;
        arr_minItems: string[];
        arr_maxItems: string[];
        obj_required: {
          requiredField: string;
          optionalField?: number | undefined;
        };
        obj_strict: {
          knownField: string;
        };
        logical_anyOf: string | number | boolean;
        logical_allOf: {
          [x: string]: unknown;
          a: string;
        } & {
          [x: string]: unknown;
          b: number;
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        enum_value: 'a' | 'b' | 'c';
        num_minimum: number;
        num_maximum: number;
        num_exclusiveMinimum: number;
        num_exclusiveMaximum: number;
        num_multipleOf: number;
        num_int: number;
        num_int32: number;
        str_minLength: string;
        str_maxLength: string;
        str_pattern: string;
        str_email: string;
        str_url: string;
        str_uuid: string;
        str_datetime: string;
        arr_minItems: string[];
        arr_maxItems: string[];
        obj_required: {
          requiredField: string;
          optionalField?: number | undefined;
        };
        obj_strict: {
          knownField: string;
        };
        logical_anyOf: string | number | boolean;
        logical_allOf: {
          [x: string]: unknown;
          a: string;
        } & {
          [x: string]: unknown;
          b: number;
        };
      };
      query: unknown;
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  handleNothitng: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { readonly nothing: 'here' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        readonly nothing: 'here';
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: unknown;
      query: unknown;
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  handleFormData: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: FormData;
    query: {
      search: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          formData: {
            hello: string;
          };
          search: string;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        formData: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: true;
    };
  };
  handleFormDataWithFile: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: FormData;
    query: {
      search: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          formData: {
            hello: string;
            file: File;
          };
          search: string;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        formData: {
          hello: string;
          file: File;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
        file: File;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: true;
    };
  };
  disableServerSideValidationBool: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    query: {
      search: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            hello: string;
          };
          search: string;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  disableServerSideValidationStrings: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    query: {
      search: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            hello: string;
          };
          search: string;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  skipSchemaEmissionBool: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    query: {
      search: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            hello: string;
          };
          search: string;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  skipSchemaEmissionStrings: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    query: {
      search: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            hello: string;
          };
          search: string;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  validateEachIteration: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    query: {
      values: string[];
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((
          staticMethodReturn: AsyncGenerator<
            {
              value: string;
            },
            void,
            unknown
          >
        ) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      value: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: unknown;
      query: {
        values: string[];
      };
      params: unknown;
      output: unknown;
      iteration: {
        value: string;
      };
      isForm: any;
    };
  };
  handleAllNoHTTP: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    query: {
      search: string;
    };
    params: {
      foo: string;
      bar: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            hello: string;
          };
          query: {
            search: string;
          };
          params: {
            foo: string;
            bar: string;
          };
          vovkParams: {
            foo: string;
            bar: string;
          };
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      output: {
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      };
      iteration: unknown;
      isForm: any;
    };
  };
  handleAllAsFunction: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    query: {
      search: string;
    };
    params: {
      foo: string;
      bar: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            hello: string;
          };
          query: {
            search: string;
          };
          params: {
            foo: string;
            bar: string;
          };
          vovkParams: {
            foo: string;
            bar: string;
          };
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      output: {
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      };
      iteration: unknown;
      isForm: any;
    };
  };
  handleAllNoHttpAsFunction: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    query: {
      search: string;
    };
    params: {
      foo: string;
      bar: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            hello: string;
          };
          query: {
            search: string;
          };
          params: {
            foo: string;
            bar: string;
          };
          vovkParams: {
            foo: string;
            bar: string;
          };
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      output: {
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      };
      iteration: unknown;
      isForm: any;
    };
  };
};
declare const WithYupClientControllerRPC: {
  handleAll: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          hello: string;
        };
    query: {
      search: string;
    };
    params: {
      foo: string;
      bar: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: {
            hello: string;
          };
          query: {
            search: string;
          };
          params: {
            foo: string;
            bar: string;
          };
          vovkParams: {
            foo: string;
            bar: string;
          };
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      output: {
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      };
      iteration: any;
      isForm: any;
    };
  };
  handleQuery: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleBody: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: any;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleParams: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          params: {
            foo: string;
            bar: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { foo: string; bar: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: any;
          params: {
            foo: string;
            bar: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { foo: string; bar: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          params: {
            foo: string;
            bar: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { foo: string; bar: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: any;
          params: {
            foo: string;
            bar: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { foo: string; bar: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        foo: string;
        bar: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: any;
      params: {
        foo: string;
        bar: string;
      };
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleNestedQuery: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: {
            x: string;
            y: string[];
            z: {
              f: string;
              u: string[];
              d: {
                x: string;
                arrOfObjects: {
                  nestedObj?:
                    | {
                        deepKey?: string | undefined;
                      }
                    | undefined;
                  nestedArr?: (string | undefined)[] | undefined;
                  foo: string;
                }[];
              };
            };
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                x: string;
                y: string[];
                z: {
                  f: string;
                  u: string[];
                  d: {
                    x: string;
                    arrOfObjects: {
                      nestedObj?:
                        | {
                            deepKey?: string | undefined;
                          }
                        | undefined;
                      nestedArr?: (string | undefined)[] | undefined;
                      foo: string;
                    }[];
                  };
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: {
            x: string;
            y: string[];
            z: {
              f: string;
              u: string[];
              d: {
                x: string;
                arrOfObjects: {
                  nestedObj?:
                    | {
                        deepKey?: string | undefined;
                      }
                    | undefined;
                  nestedArr?: (string | undefined)[] | undefined;
                  foo: string;
                }[];
              };
            };
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                x: string;
                y: string[];
                z: {
                  f: string;
                  u: string[];
                  d: {
                    x: string;
                    arrOfObjects: {
                      nestedObj?:
                        | {
                            deepKey?: string | undefined;
                          }
                        | undefined;
                      nestedArr?: (string | undefined)[] | undefined;
                      foo: string;
                    }[];
                  };
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            x: string;
            y: string[];
            z: {
              f: string;
              u: string[];
              d: {
                x: string;
                arrOfObjects: {
                  nestedObj?:
                    | {
                        deepKey?: string | undefined;
                      }
                    | undefined;
                  nestedArr?: (string | undefined)[] | undefined;
                  foo: string;
                }[];
              };
            };
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                x: string;
                y: string[];
                z: {
                  f: string;
                  u: string[];
                  d: {
                    x: string;
                    arrOfObjects: {
                      nestedObj?:
                        | {
                            deepKey?: string | undefined;
                          }
                        | undefined;
                      nestedArr?: (string | undefined)[] | undefined;
                      foo: string;
                    }[];
                  };
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            x: string;
            y: string[];
            z: {
              f: string;
              u: string[];
              d: {
                x: string;
                arrOfObjects: {
                  nestedObj?:
                    | {
                        deepKey?: string | undefined;
                      }
                    | undefined;
                  nestedArr?: (string | undefined)[] | undefined;
                  foo: string;
                }[];
              };
            };
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                x: string;
                y: string[];
                z: {
                  f: string;
                  u: string[];
                  d: {
                    x: string;
                    arrOfObjects: {
                      nestedObj?:
                        | {
                            deepKey?: string | undefined;
                          }
                        | undefined;
                      nestedArr?: (string | undefined)[] | undefined;
                      foo: string;
                    }[];
                  };
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        x: string;
        y: string[];
        z: {
          f: string;
          u: string[];
          d: {
            x: string;
            arrOfObjects: {
              nestedObj?:
                | {
                    deepKey?: string | undefined;
                  }
                | undefined;
              nestedArr?: (string | undefined)[] | undefined;
              foo: string;
            }[];
          };
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: {
        x: string;
        y: string[];
        z: {
          f: string;
          u: string[];
          d: {
            x: string;
            arrOfObjects: {
              nestedObj?:
                | {
                    deepKey?: string | undefined;
                  }
                | undefined;
              nestedArr?: (string | undefined)[] | undefined;
              foo: string;
            }[];
          };
        };
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleOutput: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: {
            helloOutput: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: 'world' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: {
            helloOutput: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: 'world' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            helloOutput: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: 'world' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            helloOutput: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: 'world' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: 'world';
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: {
        helloOutput: string;
      };
      params: any;
      output: {
        hello: string;
      };
      iteration: any;
      isForm: any;
    };
  };
  handleStream: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: {
            values: string[];
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: {
            values: string[];
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            values: string[];
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            values: string[];
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      value: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: {
        values: string[];
      };
      params: any;
      output: any;
      iteration: {
        value: string;
      };
      isForm: any;
    };
  };
  handleSchemaConstraints: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                enum_value?: string | undefined;
                num_minimum?: number | undefined;
                num_maximum?: number | undefined;
                num_exclusiveMinimum?: number | undefined;
                num_exclusiveMaximum?: number | undefined;
                num_multipleOf?: number | undefined;
                num_int?: number | undefined;
                num_int32?: number | undefined;
                str_minLength?: string | undefined;
                str_maxLength?: string | undefined;
                str_pattern?: string | undefined;
                str_email?: string | undefined;
                str_url?: string | undefined;
                str_uuid?: string | undefined;
                str_datetime?: string | undefined;
                arr_minItems?: (string | undefined)[] | undefined;
                arr_maxItems?: (string | undefined)[] | undefined;
                obj_required: {
                  optionalField?: number | undefined;
                  requiredField: string;
                };
                obj_strict: {
                  knownField?: string | undefined;
                };
                logical_anyOf: string | number | boolean;
                logical_allOf: {
                  a: string;
                  b: number;
                };
              };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                enum_value?: string | undefined;
                num_minimum?: number | undefined;
                num_maximum?: number | undefined;
                num_exclusiveMinimum?: number | undefined;
                num_exclusiveMaximum?: number | undefined;
                num_multipleOf?: number | undefined;
                num_int?: number | undefined;
                num_int32?: number | undefined;
                str_minLength?: string | undefined;
                str_maxLength?: string | undefined;
                str_pattern?: string | undefined;
                str_email?: string | undefined;
                str_url?: string | undefined;
                str_uuid?: string | undefined;
                str_datetime?: string | undefined;
                arr_minItems?: (string | undefined)[] | undefined;
                arr_maxItems?: (string | undefined)[] | undefined;
                obj_required: {
                  optionalField?: number | undefined;
                  requiredField: string;
                };
                obj_strict: {
                  knownField?: string | undefined;
                };
                logical_anyOf: string | number | boolean;
                logical_allOf: {
                  a: string;
                  b: number;
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                enum_value?: string | undefined;
                num_minimum?: number | undefined;
                num_maximum?: number | undefined;
                num_exclusiveMinimum?: number | undefined;
                num_exclusiveMaximum?: number | undefined;
                num_multipleOf?: number | undefined;
                num_int?: number | undefined;
                num_int32?: number | undefined;
                str_minLength?: string | undefined;
                str_maxLength?: string | undefined;
                str_pattern?: string | undefined;
                str_email?: string | undefined;
                str_url?: string | undefined;
                str_uuid?: string | undefined;
                str_datetime?: string | undefined;
                arr_minItems?: (string | undefined)[] | undefined;
                arr_maxItems?: (string | undefined)[] | undefined;
                obj_required: {
                  optionalField?: number | undefined;
                  requiredField: string;
                };
                obj_strict: {
                  knownField?: string | undefined;
                };
                logical_anyOf: string | number | boolean;
                logical_allOf: {
                  a: string;
                  b: number;
                };
              };
          query: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                enum_value?: string | undefined;
                num_minimum?: number | undefined;
                num_maximum?: number | undefined;
                num_exclusiveMinimum?: number | undefined;
                num_exclusiveMaximum?: number | undefined;
                num_multipleOf?: number | undefined;
                num_int?: number | undefined;
                num_int32?: number | undefined;
                str_minLength?: string | undefined;
                str_maxLength?: string | undefined;
                str_pattern?: string | undefined;
                str_email?: string | undefined;
                str_url?: string | undefined;
                str_uuid?: string | undefined;
                str_datetime?: string | undefined;
                arr_minItems?: (string | undefined)[] | undefined;
                arr_maxItems?: (string | undefined)[] | undefined;
                obj_required: {
                  optionalField?: number | undefined;
                  requiredField: string;
                };
                obj_strict: {
                  knownField?: string | undefined;
                };
                logical_anyOf: string | number | boolean;
                logical_allOf: {
                  a: string;
                  b: number;
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                enum_value?: string | undefined;
                num_minimum?: number | undefined;
                num_maximum?: number | undefined;
                num_exclusiveMinimum?: number | undefined;
                num_exclusiveMaximum?: number | undefined;
                num_multipleOf?: number | undefined;
                num_int?: number | undefined;
                num_int32?: number | undefined;
                str_minLength?: string | undefined;
                str_maxLength?: string | undefined;
                str_pattern?: string | undefined;
                str_email?: string | undefined;
                str_url?: string | undefined;
                str_uuid?: string | undefined;
                str_datetime?: string | undefined;
                arr_minItems?: (string | undefined)[] | undefined;
                arr_maxItems?: (string | undefined)[] | undefined;
                obj_required: {
                  optionalField?: number | undefined;
                  requiredField: string;
                };
                obj_strict: {
                  knownField?: string | undefined;
                };
                logical_anyOf: string | number | boolean;
                logical_allOf: {
                  a: string;
                  b: number;
                };
              };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                enum_value?: string | undefined;
                num_minimum?: number | undefined;
                num_maximum?: number | undefined;
                num_exclusiveMinimum?: number | undefined;
                num_exclusiveMaximum?: number | undefined;
                num_multipleOf?: number | undefined;
                num_int?: number | undefined;
                num_int32?: number | undefined;
                str_minLength?: string | undefined;
                str_maxLength?: string | undefined;
                str_pattern?: string | undefined;
                str_email?: string | undefined;
                str_url?: string | undefined;
                str_uuid?: string | undefined;
                str_datetime?: string | undefined;
                arr_minItems?: (string | undefined)[] | undefined;
                arr_maxItems?: (string | undefined)[] | undefined;
                obj_required: {
                  optionalField?: number | undefined;
                  requiredField: string;
                };
                obj_strict: {
                  knownField?: string | undefined;
                };
                logical_anyOf: string | number | boolean;
                logical_allOf: {
                  a: string;
                  b: number;
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                enum_value?: string | undefined;
                num_minimum?: number | undefined;
                num_maximum?: number | undefined;
                num_exclusiveMinimum?: number | undefined;
                num_exclusiveMaximum?: number | undefined;
                num_multipleOf?: number | undefined;
                num_int?: number | undefined;
                num_int32?: number | undefined;
                str_minLength?: string | undefined;
                str_maxLength?: string | undefined;
                str_pattern?: string | undefined;
                str_email?: string | undefined;
                str_url?: string | undefined;
                str_uuid?: string | undefined;
                str_datetime?: string | undefined;
                arr_minItems?: (string | undefined)[] | undefined;
                arr_maxItems?: (string | undefined)[] | undefined;
                obj_required: {
                  optionalField?: number | undefined;
                  requiredField: string;
                };
                obj_strict: {
                  knownField?: string | undefined;
                };
                logical_anyOf: string | number | boolean;
                logical_allOf: {
                  a: string;
                  b: number;
                };
              };
          query: any;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                enum_value?: string | undefined;
                num_minimum?: number | undefined;
                num_maximum?: number | undefined;
                num_exclusiveMinimum?: number | undefined;
                num_exclusiveMaximum?: number | undefined;
                num_multipleOf?: number | undefined;
                num_int?: number | undefined;
                num_int32?: number | undefined;
                str_minLength?: string | undefined;
                str_maxLength?: string | undefined;
                str_pattern?: string | undefined;
                str_email?: string | undefined;
                str_url?: string | undefined;
                str_uuid?: string | undefined;
                str_datetime?: string | undefined;
                arr_minItems?: (string | undefined)[] | undefined;
                arr_maxItems?: (string | undefined)[] | undefined;
                obj_required: {
                  optionalField?: number | undefined;
                  requiredField: string;
                };
                obj_strict: {
                  knownField?: string | undefined;
                };
                logical_anyOf: string | number | boolean;
                logical_allOf: {
                  a: string;
                  b: number;
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        enum_value?: string | undefined;
        num_minimum?: number | undefined;
        num_maximum?: number | undefined;
        num_exclusiveMinimum?: number | undefined;
        num_exclusiveMaximum?: number | undefined;
        num_multipleOf?: number | undefined;
        num_int?: number | undefined;
        num_int32?: number | undefined;
        str_minLength?: string | undefined;
        str_maxLength?: string | undefined;
        str_pattern?: string | undefined;
        str_email?: string | undefined;
        str_url?: string | undefined;
        str_uuid?: string | undefined;
        str_datetime?: string | undefined;
        arr_minItems?: (string | undefined)[] | undefined;
        arr_maxItems?: (string | undefined)[] | undefined;
        obj_required: {
          optionalField?: number | undefined;
          requiredField: string;
        };
        obj_strict: {
          knownField?: string | undefined;
        };
        logical_anyOf: string | number | boolean;
        logical_allOf: {
          a: string;
          b: number;
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        enum_value?: string | undefined;
        num_minimum?: number | undefined;
        num_maximum?: number | undefined;
        num_exclusiveMinimum?: number | undefined;
        num_exclusiveMaximum?: number | undefined;
        num_multipleOf?: number | undefined;
        num_int?: number | undefined;
        num_int32?: number | undefined;
        str_minLength?: string | undefined;
        str_maxLength?: string | undefined;
        str_pattern?: string | undefined;
        str_email?: string | undefined;
        str_url?: string | undefined;
        str_uuid?: string | undefined;
        str_datetime?: string | undefined;
        arr_minItems?: (string | undefined)[] | undefined;
        arr_maxItems?: (string | undefined)[] | undefined;
        obj_required: {
          optionalField?: number | undefined;
          requiredField: string;
        };
        obj_strict: {
          knownField?: string | undefined;
        };
        logical_anyOf: string | number | boolean;
        logical_allOf: {
          a: string;
          b: number;
        };
      };
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleNothitng: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { readonly nothing: 'here' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        readonly nothing: 'here';
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleFormData: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body: FormData;
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                formData: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData;
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                formData: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        formData: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: true;
    };
  };
  disableServerSideValidationBool: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                body: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                body: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  disableServerSideValidationStrings: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                body: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                body: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  skipSchemaEmissionBool: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                body: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                body: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  skipSchemaEmissionStrings: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                body: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                hello: string;
              };
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                body: {
                  hello: string;
                };
                search: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  validateEachIteration: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: {
            values: string[];
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: {
            values: string[];
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            values: string[];
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            values: string[];
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      value: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: {
        values: string[];
      };
      params: any;
      output: any;
      iteration: {
        value: string;
      };
      isForm: any;
    };
  };
};
declare const WithDtoClientControllerRPC: {
  handleAll: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body: FormData | HandleAllBodyDto;
    query: HandleAllQueryDto;
    params: HandleAllParamsDto;
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          body: HandleAllBodyDto;
          query: HandleAllQueryDto;
          params: HandleAllParamsDto;
          vovkParams: HandleAllParamsDto;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: HandleAllBodyDto;
        query: HandleAllQueryDto;
        params: HandleAllParamsDto;
        vovkParams: HandleAllParamsDto;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: HandleAllBodyDto;
      query: HandleAllQueryDto;
      params: HandleAllParamsDto;
      output: HandleAllOutputDto;
      iteration: any;
      isForm: any;
    };
  };
  handleNestedQuery: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: HandleNestedQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleNestedQueryDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: HandleNestedQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleNestedQueryDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: HandleNestedQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleNestedQueryDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: HandleNestedQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleNestedQueryDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object ? Promise<Awaited<R>> : Promise<HandleNestedQueryDto>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: HandleNestedQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleNestedQueryClient: (req: vovk0.VovkRequest<unknown, HandleNestedQueryDto>) => Promise<HandleNestedQueryDto>;
  handleOutput: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: HandleOutputQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: 'world' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: HandleOutputQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: 'world' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: HandleOutputQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: 'world' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: HandleOutputQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { hello: 'world' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        hello: 'world';
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: HandleOutputQueryDto;
      params: any;
      output: HandleOutputOutputDto;
      iteration: any;
      isForm: any;
    };
  };
  handleOutputClient: (req: vovk0.VovkRequest<never, HandleOutputQueryDto>) => Promise<{
    hello: 'world';
  }>;
  handleStream: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: HandleStreamQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: HandleStreamQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: HandleStreamQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: HandleStreamQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      value: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: HandleStreamQueryDto;
      params: any;
      output: any;
      iteration: IterationDto;
      isForm: any;
    };
  };
  handleSchemaConstraints: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body: FormData | ConstrainingDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: ConstrainingDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | ConstrainingDto;
          query: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: ConstrainingDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | ConstrainingDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: ConstrainingDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | ConstrainingDto;
          query: any;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: ConstrainingDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object ? Promise<Awaited<R>> : Promise<ConstrainingDto>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: ConstrainingDto;
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleNothitng: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { readonly nothing: 'here' }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        readonly nothing: 'here';
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleFormData: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body: FormData;
          query: HandleQueryQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { formData: HandleAllBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData;
          query: HandleQueryQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { formData: HandleAllBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        formData: HandleAllBodyDto;
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: HandleAllBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: true;
    };
  };
  disableServerSideValidationBool: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body: FormData | HandleBodyBodyDto;
          query: HandleQueryQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { body: HandleBodyBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | HandleBodyBodyDto;
          query: HandleQueryQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { body: HandleBodyBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: HandleBodyBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  disableServerSideValidationStrings: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body: FormData | HandleBodyBodyDto;
          query: HandleQueryQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { body: HandleBodyBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | HandleBodyBodyDto;
          query: HandleQueryQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { body: HandleBodyBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: HandleBodyBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  skipSchemaEmissionBool: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body: FormData | HandleBodyBodyDto;
          query: HandleQueryQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { body: HandleBodyBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | HandleBodyBodyDto;
          query: HandleQueryQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { body: HandleBodyBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: HandleBodyBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  skipSchemaEmissionStrings: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body: FormData | HandleBodyBodyDto;
          query: HandleQueryQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { body: HandleBodyBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | HandleBodyBodyDto;
          query: HandleQueryQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { body: HandleBodyBodyDto; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: HandleBodyBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  validateEachIteration: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: QueryValuesDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: QueryValuesDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: QueryValuesDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: QueryValuesDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((
                staticMethodReturn: AsyncGenerator<
                  {
                    value: string;
                  },
                  void,
                  unknown
                >
              ) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => Promise<
    vovk0.VovkStreamAsyncIterable<{
      value: string;
    }>
  >) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: QueryValuesDto;
      params: any;
      output: any;
      iteration: IterationDto;
      isForm: any;
    };
  };
  handleAllClient: (
    req: vovk0.VovkRequest<HandleAllBodyDto, HandleAllQueryDto>,
    params: HandleAllParamsDto
  ) => Promise<HandleAllOutputDto>;
  handleQuery: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: HandleQueryQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleQueryQueryDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: HandleQueryQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleQueryQueryDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: HandleQueryQueryDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleQueryQueryDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: HandleQueryQueryDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleQueryQueryDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object ? Promise<Awaited<R>> : Promise<HandleQueryQueryDto>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleQueryClient: (req: vovk0.VovkRequest<unknown, HandleQueryQueryDto>) => Promise<HandleQueryQueryDto>;
  handleBody: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body: FormData | HandleBodyBodyDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleBodyBodyDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | HandleBodyBodyDto;
          query: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleBodyBodyDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | HandleBodyBodyDto;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleBodyBodyDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: FormData | HandleBodyBodyDto;
          query: any;
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleBodyBodyDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object ? Promise<Awaited<R>> : Promise<HandleBodyBodyDto>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: HandleBodyBodyDto;
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleBodyClient: (req: vovk0.VovkRequest<HandleBodyBodyDto>) => Promise<HandleBodyBodyDto>;
  handleParams: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          params: HandleParamsDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleParamsDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: any;
          params: HandleParamsDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleParamsDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          params: HandleParamsDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleParamsDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: any;
          params: HandleParamsDto;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: HandleParamsDto) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object ? Promise<Awaited<R>> : Promise<HandleParamsDto>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: any;
      params: HandleParamsDto;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  handleParamsClient: (_req: vovk0.VovkRequest, params: HandleParamsDto) => Promise<HandleParamsDto>;
};
declare const OpenApiControllerRPC: {
  getFromSchema: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options?:
      | {
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: openapi3_ts_oas31811.OpenAPIObject) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | undefined
  ) => R extends object ? Promise<Awaited<R>> : Promise<openapi3_ts_oas31811.OpenAPIObject>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: unknown;
  };
};
declare const NoValidationControllerOnlyEntityRPC: {
  getNoValidationControllerOnlyEntities: (
    req: vovk0.VovkRequest<
      null,
      {
        search: string;
      }
    >
  ) => Promise<{
    results: never[];
    search: string;
  }>;
  updateNoValidationControllerOnlyEntity: (
    req: vovk0.VovkRequest<
      {
        foo: 'bar' | 'baz';
      },
      {
        q: string;
      }
    >,
    params: {
      id: string;
    }
  ) => Promise<{
    id: string;
    body: {
      foo: 'bar' | 'baz';
    };
    q: string;
  }>;
  createNoValidationControllerOnlyEntity: () => void;
  deleteNoValidationControllerOnlyEntity: () => void;
};
declare const NoValidationControllerAndServiceEntityRPC: {
  getNoValidationControllerAndServiceEntities: (
    req: vovk0.VovkRequest<
      null,
      {
        search: string;
      }
    >
  ) => Promise<{
    results: never[];
    search: string;
  }>;
  updateNoValidationControllerAndServiceEntity: (
    req: vovk0.VovkRequest<
      {
        foo: 'bar' | 'baz';
      },
      {
        q: string;
      }
    >,
    params: {
      id: string;
    }
  ) => Promise<{
    id: string;
    q: string;
    body: {
      foo: 'bar' | 'baz';
    };
  }>;
  createNoValidationControllerAndServiceEntity: () => void;
  deleteNoValidationControllerAndServiceEntity: () => void;
};
declare const ZodControllerOnlyEntityRPC: {
  getZodControllerOnlyEntities: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    query: {
      search: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        results: never[];
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: unknown;
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  updateZodControllerOnlyEntity: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          foo: 'bar' | 'baz';
        };
    query: {
      q: string;
    };
    params: {
      id: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          id: string;
          body: {
            foo: 'bar' | 'baz';
          };
          q: string;
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        id: string;
        body: {
          foo: 'bar' | 'baz';
        };
        q: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        foo: 'bar' | 'baz';
      };
      query: {
        q: string;
      };
      params: {
        id: string;
      };
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  createZodControllerOnlyEntity: () => void;
  deleteZodControllerOnlyEntity: () => void;
};
declare const ZodControllerAndServiceEntityRPC: {
  getZodControllerAndServiceEntities: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    query: {
      search: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        results: never[];
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: unknown;
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  updateZodControllerAndServiceEntity: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(options: {
    body:
      | FormData
      | {
          foo: 'bar' | 'baz';
        };
    query: {
      q: string;
    };
    params: {
      id: string;
    };
    apiRoot?: string | undefined;
    disableClientValidation?: boolean | undefined;
    validateOnClient?: vovk0.VovkValidateOnClient | undefined;
    interpretAs?: string | undefined;
    init?: RequestInit | undefined;
    transform?:
      | ((staticMethodReturn: {
          id: string;
          q: string;
          body: {
            foo: 'bar' | 'baz';
          };
        }) => R)
      | undefined;
    fetcher?: VovkClientFetcher<F> | undefined;
  }) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        id: string;
        q: string;
        body: {
          foo: 'bar' | 'baz';
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        foo: 'bar' | 'baz';
      };
      query: {
        q: string;
      };
      params: {
        id: string;
      };
      output: unknown;
      iteration: unknown;
      isForm: any;
    };
  };
  createZodControllerAndServiceEntity: () => void;
  deleteZodControllerAndServiceEntity: () => void;
};
declare const YupControllerOnlyEntityRPC: {
  getYupControllerOnlyEntities: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: {
            search?: string | undefined;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string | undefined }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: {
            search?: string | undefined;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string | undefined }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search?: string | undefined;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string | undefined }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search?: string | undefined;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string | undefined }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        results: never[];
        search: string | undefined;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: {
        search?: string | undefined;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  updateYupControllerOnlyEntity: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                foo: {};
              };
          query: {
            q?: string | undefined;
          };
          params: {
            id: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                id: string;
                body: {
                  foo: {};
                };
                q: string | undefined;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                foo: {};
              };
          query: {
            q?: string | undefined;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                id: string;
                body: {
                  foo: {};
                };
                q: string | undefined;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        id: string;
        body: {
          foo: {};
        };
        q: string | undefined;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        foo: {};
      };
      query: {
        q?: string | undefined;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  createYupControllerOnlyEntity: () => void;
  deleteYupControllerOnlyEntity: () => void;
};
declare const YupControllerAndServiceEntityRPC: {
  getYupControllerAndServiceEntities: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: {
            search?: string | undefined;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string | undefined }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: {
            search?: string | undefined;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string | undefined }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search?: string | undefined;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string | undefined }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search?: string | undefined;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string | undefined }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        results: never[];
        search: string | undefined;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: {
        search?: string | undefined;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  updateYupControllerAndServiceEntity: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                foo: {};
              };
          query: {
            q?: string | undefined;
          };
          params: {
            id: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                id: string;
                q: string | undefined;
                body: {
                  foo: {};
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                foo: {};
              };
          query: {
            q?: string | undefined;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                id: string;
                q: string | undefined;
                body: {
                  foo: {};
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        id: string;
        q: string | undefined;
        body: {
          foo: {};
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        foo: {};
      };
      query: {
        q?: string | undefined;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  createYupControllerAndServiceEntity: () => void;
  deleteYupControllerAndServiceEntity: () => void;
};
declare const DtoControllerOnlyEntityRPC: {
  getDtoControllerOnlyEntities: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        results: never[];
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  updateDtoControllerOnlyEntity: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                foo: 'bar' | 'baz';
              };
          query: {
            q: string;
          };
          params: {
            id: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                id: string;
                body: {
                  foo: 'bar' | 'baz';
                };
                q: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                foo: 'bar' | 'baz';
              };
          query: {
            q: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                id: string;
                body: {
                  foo: 'bar' | 'baz';
                };
                q: string;
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        id: string;
        body: {
          foo: 'bar' | 'baz';
        };
        q: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        foo: 'bar' | 'baz';
      };
      query: {
        q: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  createDtoControllerOnlyEntity: () => void;
  deleteDtoControllerOnlyEntity: () => void;
};
declare const DtoControllerAndServiceEntityRPC: {
  getDtoControllerAndServiceEntities: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body: any;
          query: {
            search: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?: ((staticMethodReturn: { results: never[]; search: string }) => R) | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        results: never[];
        search: string;
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: any;
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  updateDtoControllerAndServiceEntity: (<
    R,
    F extends unknown = vovk0.VovkDefaultFetcherOptions<{
      apiRoot?: string;
      disableClientValidation?: boolean;
      validateOnClient?: vovk0.VovkValidateOnClient;
      interpretAs?: string;
      init?: RequestInit;
    }>,
  >(
    options:
      | {
          body:
            | FormData
            | {
                foo: 'bar' | 'baz';
              };
          query: {
            q: string;
          };
          params: {
            id: string;
          };
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                id: string;
                q: string;
                body: {
                  foo: 'bar' | 'baz';
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
      | {
          body:
            | FormData
            | {
                foo: 'bar' | 'baz';
              };
          query: {
            q: string;
          };
          params: any;
          apiRoot?: string | undefined;
          disableClientValidation?: boolean | undefined;
          validateOnClient?: vovk0.VovkValidateOnClient | undefined;
          interpretAs?: string | undefined;
          init?: RequestInit | undefined;
          transform?:
            | ((staticMethodReturn: {
                id: string;
                q: string;
                body: {
                  foo: 'bar' | 'baz';
                };
              }) => R)
            | undefined;
          fetcher?: VovkClientFetcher<F> | undefined;
        }
  ) => R extends object
    ? Promise<Awaited<R>>
    : Promise<{
        id: string;
        q: string;
        body: {
          foo: 'bar' | 'baz';
        };
      }>) & {
    isRPC: true;
    path: string;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkSchema;
    __types: {
      body: {
        foo: 'bar' | 'baz';
      };
      query: {
        q: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: any;
    };
  };
  createDtoControllerAndServiceEntity: () => void;
  deleteDtoControllerAndServiceEntity: () => void;
};
//#endregion
export {
  CommonControllerRPC,
  CustomSchemaControllerRPC,
  DtoControllerAndServiceEntityRPC,
  DtoControllerOnlyEntityRPC,
  NoValidationControllerAndServiceEntityRPC,
  NoValidationControllerOnlyEntityRPC,
  OpenApiControllerRPC,
  StreamingControllerRPC,
  StreamingGeneratorControllerRPC,
  WithDtoClientControllerRPC,
  WithYupClientControllerRPC,
  WithZodClientControllerRPC,
  YupControllerAndServiceEntityRPC,
  YupControllerOnlyEntityRPC,
  ZodControllerAndServiceEntityRPC,
  ZodControllerOnlyEntityRPC,
  schema,
};
