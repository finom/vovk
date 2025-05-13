import * as vovk0 from "vovk";
import * as vovk_dist_client_types279 from "vovk/dist/client/types";
import * as openapi3_ts_oas31561 from "openapi3-ts/oas31";

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
declare class NestedObjDto {
  deepKey: string;
}
declare class ArrOfObjectsDto {
  foo: string;
  nestedArr?: string[];
  nestedObj?: NestedObjDto;
}
declare class DDto {
  x: string;
  arrOfObjects: ArrOfObjectsDto[];
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
declare class ComplainingDto {
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
} //#endregion
//#region .tmp-ts-rpc/fullSchema.d.ts
declare const fullSchema: {
  $schema: string;
  config: {
    libs: {};
    $schema: string;
  };
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
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
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
                };
                output: {
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
                    };
                    query: {
                      type: string;
                      properties: {
                        search: {
                          type: string;
                        };
                      };
                      required: string[];
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
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                responses: {
                  "400": {
                    description: string;
                    content: {
                      "application/json": {
                        schema: {
                          allOf: ({
                            $ref: string;
                            type?: undefined;
                            properties?: undefined;
                          } | {
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
                          })[];
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
            handleSchemaComplaints: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    enum_value: {
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
                      format: string;
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
                    };
                    obj_strict: {
                      type: string;
                      properties: {
                        knownField: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: {
                        not: {};
                      };
                    };
                    logical_anyOf: {
                      anyOf: ({
                        type: string;
                        maxLength: number;
                      } | {
                        type: string;
                        maxLength?: undefined;
                      })[];
                    };
                    logical_allOf: {
                      allOf: ({
                        type: string;
                        properties: {
                          a: {
                            type: string;
                          };
                          b?: undefined;
                        };
                        required: string[];
                      } | {
                        type: string;
                        properties: {
                          b: {
                            type: string;
                          };
                          a?: undefined;
                        };
                        required: string[];
                      })[];
                    };
                  };
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
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
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
                  "400": {
                    description: string;
                    content: {
                      "application/json": {
                        schema: {
                          allOf: ({
                            $ref: string;
                            type?: undefined;
                            properties?: undefined;
                          } | {
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
                          })[];
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
            handleSchemaComplaints: {
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "400": {
                    description: string;
                    content: {
                      "application/json": {
                        schema: {
                          allOf: ({
                            $ref: string;
                            type?: undefined;
                            properties?: undefined;
                          } | {
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
                          })[];
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
                  "x-isDto": boolean;
                  definitions: {};
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
            handleSchemaComplaints: {
              validation: {
                body: {
                  "x-isDto": boolean;
                  definitions: {};
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
                query: {
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "418": {
                    description: string;
                    content: {
                      "application/json": {
                        schema: {
                          allOf: ({
                            $ref: string;
                            type?: undefined;
                            properties?: undefined;
                          } | {
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
                          })[];
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
            };
            updateNoValidationControllerOnlyEntity: {
              path: string;
              httpMethod: string;
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
            };
            updateNoValidationControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
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
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
            };
            updateZodControllerOnlyEntity: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    foo: {
                      anyOf: {
                        const: string;
                      }[];
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                };
                params: {
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
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
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
            };
            updateZodControllerAndServiceEntity: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    foo: {
                      anyOf: {
                        const: string;
                      }[];
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                };
                params: {
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
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
                  "x-isDto": boolean;
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
            };
            updateDtoControllerOnlyEntity: {
              validation: {
                body: {
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
            };
            updateDtoControllerAndServiceEntity: {
              validation: {
                body: {
                  "x-isDto": boolean;
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
                  "x-isDto": boolean;
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
}; //#endregion
//#region .tmp-ts-rpc/index.d.ts
declare const CommonControllerRPC: {
  getHelloWorldResponseObject: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string;
    }) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    hello: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getHelloWorldObjectLiteral: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string;
    }) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    hello: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getHelloWorldNextResponseObjectPromise: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string;
    }) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    hello: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getHelloWorldRawResponseObjectPromise: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: Response) => R;
  }>) => R extends object ? Promise<R> : Promise<Response>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getHelloWorldObjectLiteralPromise: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string;
    }) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    hello: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getHelloWorldHeaders: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string | null;
    }) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    hello: string | null;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getHelloWorldArray: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string;
    }[]) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    hello: string;
  }[]>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getHelloWorldAndEmptyGeneric: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string;
    }) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    hello: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getWithParams: (<R>(options: {
    body?: undefined;
  } & {
    query?: undefined;
  } & {
    params: {
      hello: "world";
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: "world";
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    hello: "world";
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithAll: (<R>(options: {
    body: {
      isBody: true;
    };
  } & {
    query: {
      simpleQueryParam: "queryValue";
    };
  } & {
    params: {
      hello: "world";
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      params: {
        hello: "world";
      };
      body: {
        isBody: true;
      };
      query: {
        simpleQueryParam: "queryValue";
      };
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    params: {
      hello: "world";
    };
    body: {
      isBody: true;
    };
    query: {
      simpleQueryParam: "queryValue";
    };
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithBodyAndQueryUsingReqVovk: (<R>(options: {
    body: {
      isBody: true;
    };
  } & {
    query: {
      simpleQueryParam: "queryValue";
      array1: readonly ["foo"];
      array2: readonly ["bar", "baz"];
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: {
        isBody: true;
      };
      query: {
        simpleQueryParam: "queryValue";
        array1: readonly ["foo"];
        array2: readonly ["bar", "baz"];
      };
      meta: {
        isMeta1: true;
        isMeta2: true;
      };
      metaNulled: Record<any, any>;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: {
      isBody: true;
    };
    query: {
      simpleQueryParam: "queryValue";
      array1: readonly ["foo"];
      array2: readonly ["bar", "baz"];
    };
    meta: {
      isMeta1: true;
      isMeta2: true;
    };
    metaNulled: Record<any, any>;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getNestedQuery: (<R>(options: {
    body?: undefined;
  } & {
    query: {
      x: string;
      y: string[];
      z: {
        f: string;
        u: string[];
        d: {
          x: string;
          arrOfObjects: ({
            foo: string;
            nestedArr: string[];
            nestedObj?: undefined;
          } | {
            foo: string;
            nestedObj: {
              deepKey: string;
            };
            nestedArr?: undefined;
          })[];
        };
      };
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      query: {
        x: string;
        y: string[];
        z: {
          f: string;
          u: string[];
          d: {
            x: string;
            arrOfObjects: ({
              foo: string;
              nestedArr: string[];
              nestedObj?: undefined;
            } | {
              foo: string;
              nestedObj: {
                deepKey: string;
              };
              nestedArr?: undefined;
            })[];
          };
        };
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    query: {
      x: string;
      y: string[];
      z: {
        f: string;
        u: string[];
        d: {
          x: string;
          arrOfObjects: ({
            foo: string;
            nestedArr: string[];
            nestedObj?: undefined;
          } | {
            foo: string;
            nestedObj: {
              deepKey: string;
            };
            nestedArr?: undefined;
          })[];
        };
      };
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithFormDataUsingReqVovk: (<R>(options: {
    body: FormData;
  } & {
    query?: undefined;
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      field: "value";
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    field: "value";
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getErrorResponse: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: void) => R;
  }>) => R extends object ? Promise<R> : Promise<void>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getJsonTextResponse: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: Response) => R;
  }>) => R extends object ? Promise<R> : Promise<Response>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getJsonlResponse: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: vovk0.JSONLinesResponse<{
      hello: string;
    }>) => R;
  }>) => Promise<vovk0.VovkStreamAsyncIterable<{
    hello: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  getJsonlTextResponse: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: vovk0.JSONLinesResponse<{
      hello: string;
    }>) => R;
  }>) => Promise<vovk0.VovkStreamAsyncIterable<{
    hello: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
};
declare const StreamingControllerRPC: {
  postWithStreaming: (<R>(options: {
    body: Omit<Token$1, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithStreamingAndImmediateError: (<R>(options: {
    body: Omit<Token$1, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithStreamingAndDelayedError: (<R>(options: {
    body: Omit<Token$1, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithStreamingAndDelayedCustomError: (<R>(options: {
    body: Omit<Token$1, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithStreamingAndDelayedUnhandledError: (<R>(options: {
    body: Omit<Token$1, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: vovk0.JSONLinesResponse<Token$1>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<Token$1>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
};
declare const StreamingGeneratorControllerRPC: {
  getWithStreaming: (<R>(options: {
    body?: null;
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<Token, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<Token>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithAsyncStreaming: (<R>(options: {
    body: Omit<Token, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      query: "queryValue";
      token: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    query: "queryValue";
    token: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithStreaming: (<R>(options: {
    body: Omit<Token, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      query: "queryValue";
      token: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    query: "queryValue";
    token: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithStreamingAndImmediateError: (<R>(options: {
    body: Omit<Token, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<Token, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<Token>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithStreamingAndDelayedError: (<R>(options: {
    body: Omit<Token, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      query: "queryValue";
      token: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    query: "queryValue";
    token: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithStreamingAndDelayedCustomError: (<R>(options: {
    body: Omit<Token, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      query: "queryValue";
      token: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    query: "queryValue";
    token: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
  postWithStreamingAndDelayedUnhandledError: (<R>(options: {
    body: Omit<Token, "query">[];
  } & {
    query: {
      query: "queryValue";
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      query: "queryValue";
      token: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    query: "queryValue";
    token: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
};
declare const CustomSchemaControllerRPC: {
  getWithCustomSchema: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: null) => R;
  }>) => R extends object ? Promise<R> : Promise<null>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
};
declare const WithZodClientControllerRPC: {
  handleAll: (<R>(options: {
    body: {
      hello: string;
    };
  } & {
    query: {
      search: string;
    };
  } & {
    params: {
      foo: string;
      bar: string;
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
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
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
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
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: {
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
    __iteration: any;
  };
  handleQuery: (<R>(options: {
    body?: undefined;
  } & {
    query: {
      search: string;
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleBody: (<R>(options: {
    body: {
      hello: string;
    };
  } & {
    query?: undefined;
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    hello: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleParams: (<R>(options: {
    body?: undefined;
  } & {
    query?: undefined;
  } & {
    params: {
      foo: string;
      bar: string;
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      foo: string;
      bar: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    foo: string;
    bar: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleNestedQuery: (<R>(options: {
    body?: undefined;
  } & {
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
            nestedObj?: {
              deepKey: string;
            } | undefined;
          }[];
        };
      };
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
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
            nestedObj?: {
              deepKey: string;
            } | undefined;
          }[];
        };
      };
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
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
          nestedObj?: {
            deepKey: string;
          } | undefined;
        }[];
      };
    };
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleOutput: (<R>(options: {
    body?: undefined;
  } & {
    query: {
      helloOutput: string;
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    hello: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: {
      hello: string;
    };
    __iteration: any;
  };
  handleStream: (<R>(options: {
    body?: undefined;
  } & {
    query: {
      values: string[];
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      value: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    value: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: {
      value: string;
    };
  };
  handleSchemaComplaints: (<R>(options: {
    body: {
      enum_value: "a" | "b" | "c";
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
        a: string;
      } & {
        b: number;
      };
    };
  } & {
    query?: undefined;
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      enum_value: "a" | "b" | "c";
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
        a: string;
      } & {
        b: number;
      };
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    enum_value: "a" | "b" | "c";
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
      a: string;
    } & {
      b: number;
    };
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleNothitng: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      readonly nothing: "here";
    }) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    readonly nothing: "here";
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleFormData: (<R>(options: {
    body: FormData;
  } & {
    query: {
      search: string;
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      formData: {
        hello: "world";
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    formData: {
      hello: "world";
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  disableServerSideValidationBool: (<R>(options: {
    body: {
      hello: string;
    };
  } & {
    query: {
      search: string;
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: {
        hello: string;
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  disableServerSideValidationStrings: (<R>(options: {
    body: {
      hello: string;
    };
  } & {
    query: {
      search: string;
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: {
        hello: string;
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  skipSchemaEmissionBool: (<R>(options: {
    body: {
      hello: string;
    };
  } & {
    query: {
      search: string;
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: {
        hello: string;
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  skipSchemaEmissionStrings: (<R>(options: {
    body: {
      hello: string;
    };
  } & {
    query: {
      search: string;
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: {
        hello: string;
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  validateEachIteration: (<R>(options: {
    body?: undefined;
  } & {
    query: {
      values: string[];
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      value: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    value: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: {
      value: string;
    };
  };
};
declare const WithYupClientControllerRPC: {
  handleAll: (<R>(options: {
    body: {
      hello: string;
    };
  } & {
    query: {
      search: string;
    };
  } & {
    params: {
      foo: string;
      bar: string;
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
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
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
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
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: {
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
    __iteration: any;
  };
  handleQuery: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, {
    search: string;
  }, any>) => {
    search: string;
  }) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleBody: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<{
    hello: string;
  }, any, any>) => Promise<{
    hello: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    hello: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleParams: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, any, {
    foo: string;
    bar: string;
  }>) => Promise<{
    foo: string;
    bar: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      foo: string;
      bar: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    foo: string;
    bar: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleNestedQuery: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, {
    x: string;
    y: string[];
    z: {
      f: string;
      u: string[];
      d: {
        x: string;
        arrOfObjects: {
          nestedObj?: {
            deepKey?: string | undefined;
          } | undefined;
          nestedArr?: (string | undefined)[] | undefined;
          foo: string;
        }[];
      };
    };
  }, any>) => {
    x: string;
    y: string[];
    z: {
      f: string;
      u: string[];
      d: {
        x: string;
        arrOfObjects: {
          nestedObj?: {
            deepKey?: string | undefined;
          } | undefined;
          nestedArr?: (string | undefined)[] | undefined;
          foo: string;
        }[];
      };
    };
  }) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      x: string;
      y: string[];
      z: {
        f: string;
        u: string[];
        d: {
          x: string;
          arrOfObjects: {
            nestedObj?: {
              deepKey?: string | undefined;
            } | undefined;
            nestedArr?: (string | undefined)[] | undefined;
            foo: string;
          }[];
        };
      };
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    x: string;
    y: string[];
    z: {
      f: string;
      u: string[];
      d: {
        x: string;
        arrOfObjects: {
          nestedObj?: {
            deepKey?: string | undefined;
          } | undefined;
          nestedArr?: (string | undefined)[] | undefined;
          foo: string;
        }[];
      };
    };
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleOutput: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, {
    helloOutput: string;
  }, any>) => Promise<{
    hello: "world";
  }>) & {
    __output: {
      hello: string;
    };
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: "world";
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    hello: "world";
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: {
      hello: string;
    };
    __iteration: any;
  };
  handleStream: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, {
    values: string[];
  }, any>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __output: any;
    __iteration: {
      value: string;
    };
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      value: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    value: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: {
      value: string;
    };
  };
  handleSchemaComplaints: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<{
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
  }, any, any>) => Promise<{
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
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
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
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
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
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleNothitng: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      readonly nothing: "here";
    }) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    readonly nothing: "here";
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleFormData: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<FormData, {
    search: string;
  }, any>) => Promise<{
    formData: {
      hello: "world";
    };
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      formData: {
        hello: "world";
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    formData: {
      hello: "world";
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  disableServerSideValidationBool: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, any>) => Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: {
        hello: string;
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  disableServerSideValidationStrings: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, any>) => Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: {
        hello: string;
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  skipSchemaEmissionBool: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, any>) => Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: {
        hello: string;
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  skipSchemaEmissionStrings: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, any>) => Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: {
        hello: string;
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  validateEachIteration: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, {
    values: string[];
  }, any>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __output: any;
    __iteration: {
      value: string;
    };
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      value: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    value: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: {
      value: string;
    };
  };
};
declare const WithDtoClientControllerRPC: {
  handleAll: (<R>(options: {
    body: HandleAllBodyDto;
  } & {
    query: HandleAllQueryDto;
  } & {
    params: HandleAllParamsDto;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: HandleAllBodyDto;
      query: HandleAllQueryDto;
      params: HandleAllParamsDto;
      vovkParams: HandleAllParamsDto;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: HandleAllBodyDto;
    query: HandleAllQueryDto;
    params: HandleAllParamsDto;
    vovkParams: HandleAllParamsDto;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: HandleAllOutputDto;
    __iteration: any;
  };
  handleNestedQuery: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, HandleNestedQueryDto, any>) => HandleNestedQueryDto) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: HandleNestedQueryDto) => R;
  }>)) => R extends object ? Promise<R> : Promise<HandleNestedQueryDto>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleNestedQueryClient: (req: vovk0.VovkRequest<never, HandleNestedQueryDto>) => Promise<HandleNestedQueryDto>;
  handleOutput: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, HandleOutputQueryDto, any>) => Promise<{
    hello: "world";
  }>) & {
    __output: HandleOutputOutputDto;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      hello: "world";
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    hello: "world";
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: HandleOutputOutputDto;
    __iteration: any;
  };
  handleOutputClient: (req: vovk0.VovkRequest<never, HandleOutputQueryDto>) => Promise<{
    hello: "world";
  }>;
  handleStream: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, HandleStreamQueryDto, any>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __output: any;
    __iteration: IterationDto;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      value: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    value: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: IterationDto;
  };
  handleSchemaComplaints: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<ComplainingDto, any, any>) => Promise<ComplainingDto>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: ComplainingDto) => R;
  }>)) => R extends object ? Promise<R> : Promise<ComplainingDto>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleNothitng: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      readonly nothing: "here";
    }) => R;
  }>) => R extends object ? Promise<R> : Promise<{
    readonly nothing: "here";
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleFormData: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<FormData, HandleQueryQueryDto, any>) => Promise<{
    formData: {
      hello: "world";
    };
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      formData: {
        hello: "world";
      };
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    formData: {
      hello: "world";
    };
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  disableServerSideValidationBool: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: HandleBodyBodyDto;
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  disableServerSideValidationStrings: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: HandleBodyBodyDto;
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  skipSchemaEmissionBool: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: HandleBodyBodyDto;
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  skipSchemaEmissionStrings: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      body: HandleBodyBodyDto;
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  validateEachIteration: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, QueryValuesDto, any>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __output: any;
    __iteration: IterationDto;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: AsyncGenerator<{
      value: string;
    }, void, unknown>) => R;
  }>)) => Promise<vovk0.VovkStreamAsyncIterable<{
    value: string;
  }>>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: IterationDto;
  };
  handleAllClient: (req: vovk0.VovkRequest<HandleAllBodyDto, HandleAllQueryDto>, params: HandleAllParamsDto) => Promise<HandleAllOutputDto>;
  handleQuery: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, HandleQueryQueryDto, any>) => HandleQueryQueryDto) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: HandleQueryQueryDto) => R;
  }>)) => R extends object ? Promise<R> : Promise<HandleQueryQueryDto>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleQueryClient: (req: vovk0.VovkRequest<never, HandleQueryQueryDto>) => Promise<HandleQueryQueryDto>;
  handleBody: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<HandleBodyBodyDto, any, any>) => Promise<HandleBodyBodyDto>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: HandleBodyBodyDto) => R;
  }>)) => R extends object ? Promise<R> : Promise<HandleBodyBodyDto>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleBodyClient: (req: vovk0.VovkRequest<HandleBodyBodyDto>) => Promise<HandleBodyBodyDto>;
  handleParams: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, any, HandleParamsDto>) => Promise<HandleParamsDto>) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: HandleParamsDto) => R;
  }>)) => R extends object ? Promise<R> : Promise<HandleParamsDto>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  handleParamsClient: (_req: vovk0.VovkRequest, params: HandleParamsDto) => Promise<HandleParamsDto>;
};
declare const OpenApiControllerRPC: {
  getFromSchema: (<R>(options: void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: openapi3_ts_oas31561.OpenAPIObject) => R;
  }>) => R extends object ? Promise<R> : Promise<openapi3_ts_oas31561.OpenAPIObject>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: unknown;
    __iteration: unknown;
  };
};
declare const NoValidationControllerOnlyEntityRPC: {
  getNoValidationControllerOnlyEntities: (req: vovk0.VovkRequest<null, {
    search: string;
  }>) => Promise<{
    results: never[];
    search: string;
  }>;
  updateNoValidationControllerOnlyEntity: (req: vovk0.VovkRequest<{
    foo: "bar" | "baz";
  }, {
    q: string;
  }>, params: {
    id: string;
  }) => Promise<{
    id: string;
    body: {
      foo: "bar" | "baz";
    };
    q: string;
  }>;
  createNoValidationControllerOnlyEntity: () => void;
  deleteNoValidationControllerOnlyEntity: () => void;
};
declare const NoValidationControllerAndServiceEntityRPC: {
  getNoValidationControllerAndServiceEntities: (req: vovk0.VovkRequest<null, {
    search: string;
  }>) => Promise<{
    results: never[];
    search: string;
  }>;
  updateNoValidationControllerAndServiceEntity: (req: vovk0.VovkRequest<{
    foo: "bar" | "baz";
  }, {
    q: string;
  }>, params: {
    id: string;
  }) => Promise<{
    id: string;
    q: string;
    body: {
      foo: "bar" | "baz";
    };
  }>;
  createNoValidationControllerAndServiceEntity: () => void;
  deleteNoValidationControllerAndServiceEntity: () => void;
};
declare const ZodControllerOnlyEntityRPC: {
  getZodControllerOnlyEntities: (<R>(options: {
    body?: undefined;
  } & {
    query: {
      search: string;
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      results: never[];
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    results: never[];
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  updateZodControllerOnlyEntity: (<R>(options: {
    body: {
      foo: "bar" | "baz";
    };
  } & {
    query: {
      q: string;
    };
  } & {
    params: {
      id: string;
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      id: string;
      body: {
        foo: "bar" | "baz";
      };
      q: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    id: string;
    body: {
      foo: "bar" | "baz";
    };
    q: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  createZodControllerOnlyEntity: () => void;
  deleteZodControllerOnlyEntity: () => void;
};
declare const ZodControllerAndServiceEntityRPC: {
  getZodControllerAndServiceEntities: (<R>(options: {
    body?: undefined;
  } & {
    query: {
      search: string;
    };
  } & {
    params?: undefined;
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      results: never[];
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    results: never[];
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  updateZodControllerAndServiceEntity: (<R>(options: {
    body: {
      foo: "bar" | "baz";
    };
  } & {
    query: {
      q: string;
    };
  } & {
    params: {
      id: string;
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      id: string;
      q: string;
      body: {
        foo: "bar" | "baz";
      };
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    id: string;
    q: string;
    body: {
      foo: "bar" | "baz";
    };
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  createZodControllerAndServiceEntity: () => void;
  deleteZodControllerAndServiceEntity: () => void;
};
declare const YupControllerOnlyEntityRPC: {
  getYupControllerOnlyEntities: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, {
    search?: string | undefined;
  }, any>) => {
    results: never[];
    search: string | undefined;
  }) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      results: never[];
      search: string | undefined;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    results: never[];
    search: string | undefined;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  updateYupControllerOnlyEntity: (<R>(options: {
    body: {
      foo: {};
    };
  } & {
    query: {
      q?: string | undefined;
    };
  } & {
    params: {
      id: string;
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      id: string;
      body: {
        foo: {};
      };
      q: string | undefined;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    id: string;
    body: {
      foo: {};
    };
    q: string | undefined;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  createYupControllerOnlyEntity: () => void;
  deleteYupControllerOnlyEntity: () => void;
};
declare const YupControllerAndServiceEntityRPC: {
  getYupControllerAndServiceEntities: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, {
    search?: string | undefined;
  }, any>) => {
    results: never[];
    search: string | undefined;
  }) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      results: never[];
      search: string | undefined;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    results: never[];
    search: string | undefined;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  updateYupControllerAndServiceEntity: (<R>(options: {
    body: {
      foo: {};
    };
  } & {
    query: {
      q?: string | undefined;
    };
  } & {
    params: {
      id: string;
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      id: string;
      q: string | undefined;
      body: {
        foo: {};
      };
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    id: string;
    q: string | undefined;
    body: {
      foo: {};
    };
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  createYupControllerAndServiceEntity: () => void;
  deleteYupControllerAndServiceEntity: () => void;
};
declare const DtoControllerOnlyEntityRPC: {
  getDtoControllerOnlyEntities: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, {
    search: string;
  }, any>) => {
    results: never[];
    search: string;
  }) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      results: never[];
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    results: never[];
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  updateDtoControllerOnlyEntity: (<R>(options: {
    body: {
      foo: "bar" | "baz";
    };
  } & {
    query: {
      q: string;
    };
  } & {
    params: {
      id: string;
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      id: string;
      body: {
        foo: "bar" | "baz";
      };
      q: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    id: string;
    body: {
      foo: "bar" | "baz";
    };
    q: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  createDtoControllerOnlyEntity: () => void;
  deleteDtoControllerOnlyEntity: () => void;
};
declare const DtoControllerAndServiceEntityRPC: {
  getDtoControllerAndServiceEntities: (<R>(options: vovk_dist_client_types279.StaticMethodInput<((req: vovk0.VovkRequest<any, {
    search: string;
  }, any>) => {
    results: never[];
    search: string;
  }) & {
    __output: any;
    __iteration: any;
  }> & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      results: never[];
      search: string;
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    results: never[];
    search: string;
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  updateDtoControllerAndServiceEntity: (<R>(options: {
    body: {
      foo: "bar" | "baz";
    };
  } & {
    query: {
      q: string;
    };
  } & {
    params: {
      id: string;
    };
  } & (void | Partial<vovk0.VovkDefaultFetcherOptions & {
    transform: (staticMethodReturn: {
      id: string;
      q: string;
      body: {
        foo: "bar" | "baz";
      };
    }) => R;
  }>)) => R extends object ? Promise<R> : Promise<{
    id: string;
    q: string;
    body: {
      foo: "bar" | "baz";
    };
  }>) & {
    isRPC: true;
    schema: vovk0.VovkHandlerSchema;
    controllerSchema: vovk0.VovkControllerSchema;
    segmentSchema: vovk0.VovkSegmentSchema;
    fullSchema: vovk0.VovkFullSchema;
    __output: any;
    __iteration: any;
  };
  createDtoControllerAndServiceEntity: () => void;
  deleteDtoControllerAndServiceEntity: () => void;
}; //#endregion
export { CommonControllerRPC, CustomSchemaControllerRPC, DtoControllerAndServiceEntityRPC, DtoControllerOnlyEntityRPC, NoValidationControllerAndServiceEntityRPC, NoValidationControllerOnlyEntityRPC, OpenApiControllerRPC, StreamingControllerRPC, StreamingGeneratorControllerRPC, WithDtoClientControllerRPC, WithYupClientControllerRPC, WithZodClientControllerRPC, YupControllerAndServiceEntityRPC, YupControllerOnlyEntityRPC, ZodControllerAndServiceEntityRPC, ZodControllerOnlyEntityRPC, fullSchema };