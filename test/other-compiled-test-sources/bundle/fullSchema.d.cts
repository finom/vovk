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
export { fullSchema };