# test v0.1.1-beta.0

> Vovk test app

License: **MIT**

```bash
# Install the package
npm install test
```

## CommonControllerRPC

### CommonControllerRPC.getHelloWorldResponseObject

Endpoint: http://localhost:3000/api/foo/client/common/get-hello-world-response-object

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getHelloWorldResponseObject();
```

### CommonControllerRPC.getHelloWorldObjectLiteral

Endpoint: http://localhost:3000/api/foo/client/common/get-hello-world-object-literal

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getHelloWorldObjectLiteral();
```

### CommonControllerRPC.getHelloWorldNextResponseObjectPromise

Endpoint: http://localhost:3000/api/foo/client/common/get-hello-world-next-response-object-promise

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getHelloWorldNextResponseObjectPromise();
```

### CommonControllerRPC.getHelloWorldRawResponseObjectPromise

Endpoint: http://localhost:3000/api/foo/client/common/get-hello-world-raw-response-object-promise

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getHelloWorldRawResponseObjectPromise();
```

### CommonControllerRPC.getHelloWorldObjectLiteralPromise

Endpoint: http://localhost:3000/api/foo/client/common/get-hello-world-object-literal-promise

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getHelloWorldObjectLiteralPromise();
```

### CommonControllerRPC.getHelloWorldHeaders

Endpoint: http://localhost:3000/api/foo/client/common/get-hello-world-headers

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getHelloWorldHeaders();
```

### CommonControllerRPC.getHelloWorldArray

Endpoint: http://localhost:3000/api/foo/client/common/get-hello-world-array

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getHelloWorldArray();
```

### CommonControllerRPC.getHelloWorldAndEmptyGeneric

Endpoint: http://localhost:3000/api/foo/client/common/get-hello-world-and-empty-generic

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getHelloWorldAndEmptyGeneric();
```

### CommonControllerRPC.getWithParams

Endpoint: http://localhost:3000/api/foo/client/common/with-params/:hello

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getWithParams();
```

### CommonControllerRPC.postWithAll

Endpoint: http://localhost:3000/api/foo/client/common/with-all/:hello

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.postWithAll();
```

### CommonControllerRPC.postWithBodyAndQueryUsingReqVovk

Endpoint: http://localhost:3000/api/foo/client/common/with-all-using-req-vovk

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.postWithBodyAndQueryUsingReqVovk();
```

### CommonControllerRPC.getNestedQuery

Endpoint: http://localhost:3000/api/foo/client/common/nested-query

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getNestedQuery();
```

### CommonControllerRPC.postWithFormDataUsingReqVovk

Endpoint: http://localhost:3000/api/foo/client/common/form-data

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.postWithFormDataUsingReqVovk();
```

### CommonControllerRPC.getErrorResponse

Endpoint: http://localhost:3000/api/foo/client/common/error

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getErrorResponse();
```

### CommonControllerRPC.getJsonTextResponse

Endpoint: http://localhost:3000/api/foo/client/common/json-text

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getJsonTextResponse();
```

### CommonControllerRPC.getJsonlResponse

Endpoint: http://localhost:3000/api/foo/client/common/jsonl

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getJsonlResponse();
```

### CommonControllerRPC.getJsonlTextResponse

Endpoint: http://localhost:3000/api/foo/client/common/jsonl-text

```ts
import { CommonControllerRPC } from 'test';

const response = await CommonControllerRPC.getJsonlTextResponse();
```

## StreamingControllerRPC

### StreamingControllerRPC.postWithStreaming

Endpoint: http://localhost:3000/api/foo/client/streaming/post-with-streaming

```ts
import { StreamingControllerRPC } from 'test';

const response = await StreamingControllerRPC.postWithStreaming();
```

### StreamingControllerRPC.postWithStreamingAndImmediateError

Endpoint: http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-immediate-error

```ts
import { StreamingControllerRPC } from 'test';

const response = await StreamingControllerRPC.postWithStreamingAndImmediateError();
```

### StreamingControllerRPC.postWithStreamingAndDelayedError

Endpoint: http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-error

```ts
import { StreamingControllerRPC } from 'test';

const response = await StreamingControllerRPC.postWithStreamingAndDelayedError();
```

### StreamingControllerRPC.postWithStreamingAndDelayedCustomError

Endpoint: http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-custom-error

```ts
import { StreamingControllerRPC } from 'test';

const response = await StreamingControllerRPC.postWithStreamingAndDelayedCustomError();
```

### StreamingControllerRPC.postWithStreamingAndDelayedUnhandledError

Endpoint: http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-unhandled-error

```ts
import { StreamingControllerRPC } from 'test';

const response = await StreamingControllerRPC.postWithStreamingAndDelayedUnhandledError();
```

## StreamingGeneratorControllerRPC

### StreamingGeneratorControllerRPC.getWithStreaming

Endpoint: http://localhost:3000/api/foo/client/streaming-generator/get-with-streaming

```ts
import { StreamingGeneratorControllerRPC } from 'test';

const response = await StreamingGeneratorControllerRPC.getWithStreaming();
```

### StreamingGeneratorControllerRPC.postWithAsyncStreaming

Endpoint: http://localhost:3000/api/foo/client/streaming-generator/post-with-async-streaming

```ts
import { StreamingGeneratorControllerRPC } from 'test';

const response = await StreamingGeneratorControllerRPC.postWithAsyncStreaming();
```

### StreamingGeneratorControllerRPC.postWithStreaming

Endpoint: http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming

```ts
import { StreamingGeneratorControllerRPC } from 'test';

const response = await StreamingGeneratorControllerRPC.postWithStreaming();
```

### StreamingGeneratorControllerRPC.postWithStreamingAndImmediateError

Endpoint: http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-immediate-error

```ts
import { StreamingGeneratorControllerRPC } from 'test';

const response = await StreamingGeneratorControllerRPC.postWithStreamingAndImmediateError();
```

### StreamingGeneratorControllerRPC.postWithStreamingAndDelayedError

Endpoint: http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-error

```ts
import { StreamingGeneratorControllerRPC } from 'test';

const response = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedError();
```

### StreamingGeneratorControllerRPC.postWithStreamingAndDelayedCustomError

Endpoint: http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-custom-error

```ts
import { StreamingGeneratorControllerRPC } from 'test';

const response = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedCustomError();
```

### StreamingGeneratorControllerRPC.postWithStreamingAndDelayedUnhandledError

Endpoint: http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-unhandled-error

```ts
import { StreamingGeneratorControllerRPC } from 'test';

const response = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedUnhandledError();
```

## CustomSchemaControllerRPC

### CustomSchemaControllerRPC.getWithCustomSchema

Endpoint: http://localhost:3000/api/foo/client//get-with-custom-schema

```ts
import { CustomSchemaControllerRPC } from 'test';

const response = await CustomSchemaControllerRPC.getWithCustomSchema();
```

## WithZodClientControllerRPC

### WithZodClientControllerRPC.handleAll

> This is a summary

This is a description

Endpoint: http://localhost:3000/api/foo/client/with-zod/all/:foo/:bar

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleAll({
  params: {
    foo: 'string',
    bar: 'string',
  },
  body: {
    hello: 'string',
  },
  query: {
    search: 'string',
  },
});

console.log(response);
/* 
{
    body: {
      hello: "string"
    },
    query: {
      search: "string"
    },
    params: {
      foo: "string",
      bar: "string"
    },
    vovkParams: {
      foo: "string",
      bar: "string"
    }
}
*/
```

### WithZodClientControllerRPC.handleQuery

Endpoint: http://localhost:3000/api/foo/client/with-zod/handle-query

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleQuery({
  query: {
    search: 'strin',
  },
});
```

### WithZodClientControllerRPC.handleBody

Endpoint: http://localhost:3000/api/foo/client/with-zod/handle-body

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleBody({
  body: {
    hello: 'strin',
  },
});
```

### WithZodClientControllerRPC.handleParams

Endpoint: http://localhost:3000/api/foo/client/with-zod/x/:foo/:bar/y

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleParams({
  params: {
    foo: 'strin',
    bar: 'strin',
  },
});
```

### WithZodClientControllerRPC.handleNestedQuery

Endpoint: http://localhost:3000/api/foo/client/with-zod/handle-nested-query

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleNestedQuery({
  query: {
    x: 'strin',
    y: ['string'],
    z: {
      f: 'string',
      u: ['string'],
      d: {
        x: 'string',
        arrOfObjects: [
          {
            foo: 'string',
            nestedArr: ['string'],
            nestedObj: {
              deepKey: 'string',
            },
          },
        ],
      },
    },
  },
});
```

### WithZodClientControllerRPC.handleOutput

Endpoint: http://localhost:3000/api/foo/client/with-zod/handle-output

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleOutput({
  query: {
    helloOutput: 'string',
  },
});

console.log(response);
/* 
{
    hello: "strin"
}
*/
```

### WithZodClientControllerRPC.handleStream

Endpoint: http://localhost:3000/api/foo/client/with-zod/handle-stream

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleStream({
  query: {
    values: ['string'],
  },
});
```

### WithZodClientControllerRPC.handleSchemaComplaints

Endpoint: http://localhost:3000/api/foo/client/with-zod/handle-schema-complaints

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleSchemaComplaints({
  body: {
    enum_value: 'a',
    num_minimum: 1,
    num_maximum: 100,
    num_exclusiveMinimum: 2,
    num_exclusiveMaximum: 99,
    num_multipleOf: 0,
    num_int: -9007199254740991,
    num_int32: -2147483648,
    str_minLength: 'string',
    str_maxLength: 'string',
    str_pattern: '/regex/',
    str_email: 'user@example.com',
    str_url: 'http://example.com',
    str_uuid: '30a51d0d-4eb4-4772-81f1-8bdffd892358',
    str_datetime: '2019-08-24T14:15:22Z',
    arr_minItems: ['string'],
    arr_maxItems: ['string'],
    obj_required: {
      requiredField: 'string',
      optionalField: 0,
    },
    obj_strict: {
      knownField: 'string',
      property1: null,
      property2: null,
    },
    logical_anyOf: 'strin',
    logical_allOf: {
      a: 'string',
      b: 0,
    },
  },
});
```

### WithZodClientControllerRPC.handleNothitng

Endpoint: http://localhost:3000/api/foo/client/with-zod/handle-nothitng

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleNothitng();
```

### WithZodClientControllerRPC.handleFormData

Endpoint: http://localhost:3000/api/foo/client/with-zod/handle-form-data

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.handleFormData({
  query: {
    search: 'string',
  },
});
```

### WithZodClientControllerRPC.disableServerSideValidationBool

Endpoint: http://localhost:3000/api/foo/client/with-zod/disable-server-side-validation-bool

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.disableServerSideValidationBool({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'string',
  },
});
```

### WithZodClientControllerRPC.disableServerSideValidationStrings

Endpoint: http://localhost:3000/api/foo/client/with-zod/disable-server-side-validation-strings

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.disableServerSideValidationStrings({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

### WithZodClientControllerRPC.skipSchemaEmissionBool

Endpoint: http://localhost:3000/api/foo/client/with-zod/skip-schema-emission-bool

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.skipSchemaEmissionBool();
```

### WithZodClientControllerRPC.skipSchemaEmissionStrings

Endpoint: http://localhost:3000/api/foo/client/with-zod/skip-schema-emission-strings

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.skipSchemaEmissionStrings({
  query: {
    search: 'string',
  },
});
```

### WithZodClientControllerRPC.validateEachIteration

Endpoint: http://localhost:3000/api/foo/client/with-zod/validate-each-iteration

```ts
import { WithZodClientControllerRPC } from 'test';

const response = await WithZodClientControllerRPC.validateEachIteration({
  query: {
    values: ['string'],
  },
});
```

## WithYupClientControllerRPC

### WithYupClientControllerRPC.handleAll

> This is a summary

This is a description

Endpoint: http://localhost:3000/api/foo/client/with-yup/all/:foo/:bar

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleAll({
  params: {
    foo: 'strin',
    bar: 'strin',
  },
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});

console.log(response);
/* 
{
    body: {
      hello: "strin"
    },
    query: {
      search: "strin"
    },
    params: {
      foo: "strin",
      bar: "strin"
    },
    vovkParams: {
      foo: "strin",
      bar: "strin"
    }
}
*/
```

### WithYupClientControllerRPC.handleQuery

Endpoint: http://localhost:3000/api/foo/client/with-yup/handle-query

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleQuery({
  query: {
    search: 'strin',
  },
});
```

### WithYupClientControllerRPC.handleBody

Endpoint: http://localhost:3000/api/foo/client/with-yup/handle-body

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleBody({
  body: {
    hello: 'strin',
  },
});
```

### WithYupClientControllerRPC.handleParams

Endpoint: http://localhost:3000/api/foo/client/with-yup/x/:foo/:bar/y

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleParams({
  params: {
    foo: 'strin',
    bar: 'strin',
  },
});
```

### WithYupClientControllerRPC.handleNestedQuery

Endpoint: http://localhost:3000/api/foo/client/with-yup/handle-nested-query

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleNestedQuery({
  query: {
    x: 'strin',
    y: ['string'],
    z: {
      f: 'string',
      u: ['string'],
      d: {
        x: 'string',
        arrOfObjects: [
          {
            nestedObj: {},
          },
        ],
      },
    },
  },
});
```

### WithYupClientControllerRPC.handleOutput

Endpoint: http://localhost:3000/api/foo/client/with-yup/handle-output

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleOutput({
  query: {
    helloOutput: 'string',
  },
});

console.log(response);
/* 
{
    hello: "strin"
}
*/
```

### WithYupClientControllerRPC.handleStream

Endpoint: http://localhost:3000/api/foo/client/with-yup/handle-stream

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleStream({
  query: {
    values: ['string'],
  },
});
```

### WithYupClientControllerRPC.handleSchemaComplaints

Endpoint: http://localhost:3000/api/foo/client/with-yup/handle-schema-complaints

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleSchemaComplaints({
  body: {
    logical_allOf: {},
    obj_strict: {},
    obj_required: {},
  },
});
```

### WithYupClientControllerRPC.handleNothitng

Endpoint: http://localhost:3000/api/foo/client/with-yup/handle-nothitng

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleNothitng();
```

### WithYupClientControllerRPC.handleFormData

Endpoint: http://localhost:3000/api/foo/client/with-yup/handle-form-data

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.handleFormData({
  query: {
    search: 'strin',
  },
});
```

### WithYupClientControllerRPC.disableServerSideValidationBool

Endpoint: http://localhost:3000/api/foo/client/with-yup/disable-server-side-validation-bool

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.disableServerSideValidationBool({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

### WithYupClientControllerRPC.disableServerSideValidationStrings

Endpoint: http://localhost:3000/api/foo/client/with-yup/disable-server-side-validation-strings

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.disableServerSideValidationStrings({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

### WithYupClientControllerRPC.skipSchemaEmissionBool

Endpoint: http://localhost:3000/api/foo/client/with-yup/skip-schema-emission-bool

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.skipSchemaEmissionBool();
```

### WithYupClientControllerRPC.skipSchemaEmissionStrings

Endpoint: http://localhost:3000/api/foo/client/with-yup/skip-schema-emission-strings

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.skipSchemaEmissionStrings({
  query: {
    search: 'strin',
  },
});
```

### WithYupClientControllerRPC.validateEachIteration

Endpoint: http://localhost:3000/api/foo/client/with-yup/validate-each-iteration

```ts
import { WithYupClientControllerRPC } from 'test';

const response = await WithYupClientControllerRPC.validateEachIteration({
  query: {
    values: ['string'],
  },
});
```

## WithDtoClientControllerRPC

### WithDtoClientControllerRPC.handleAll

> This is a summary

This is a description

Endpoint: http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleAll({
  params: {
    foo: 'strin',
    bar: 'strin',
  },
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});

console.log(response);
/* 
{
    body: {
      hello: "strin"
    },
    query: {
      search: "strin"
    },
    params: {
      foo: "strin",
      bar: "strin"
    },
    vovkParams: {
      foo: "strin",
      bar: "strin"
    }
}
*/
```

### WithDtoClientControllerRPC.handleNestedQuery

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-nested-query

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleNestedQuery({
  query: {
    x: 'strin',
    y: ['string'],
  },
});
```

### WithDtoClientControllerRPC.handleNestedQueryClient

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-nested-query-client

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleNestedQueryClient();
```

### WithDtoClientControllerRPC.handleOutput

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-output

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleOutput({
  query: {
    helloOutput: 'string',
  },
});

console.log(response);
/* 
{
    hello: "strin"
}
*/
```

### WithDtoClientControllerRPC.handleOutputClient

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-output-client

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleOutputClient();
```

### WithDtoClientControllerRPC.handleStream

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-stream

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleStream({
  query: {
    values: ['string'],
  },
});
```

### WithDtoClientControllerRPC.handleSchemaComplaints

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-schema-complaints

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleSchemaComplaints({
  body: {
    enum_value: 'a',
    num_minimum: 1,
    num_maximum: 100,
    num_exclusiveMinimum: 0,
    num_exclusiveMaximum: 0,
    num_multipleOf: 0,
    num_int: 0,
    num_int32: -2147483648,
    str_minLength: 'string',
    str_maxLength: 'string',
    str_pattern: 'string',
    str_email: 'user@example.com',
    str_url: 'http://example.com',
    str_uuid: '30a51d0d-4eb4-4772-81f1-8bdffd892358',
    str_datetime: '2019-08-24',
    arr_minItems: ['string'],
    arr_maxItems: ['string'],
    logical_allOf: {},
  },
});
```

### WithDtoClientControllerRPC.handleNothitng

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-nothitng

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleNothitng();
```

### WithDtoClientControllerRPC.handleFormData

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-form-data

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleFormData({
  query: {
    search: 'strin',
  },
});
```

### WithDtoClientControllerRPC.disableServerSideValidationBool

Endpoint: http://localhost:3000/api/foo/client/with-dto/disable-server-side-validation-bool

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.disableServerSideValidationBool({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

### WithDtoClientControllerRPC.disableServerSideValidationStrings

Endpoint: http://localhost:3000/api/foo/client/with-dto/disable-server-side-validation-strings

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.disableServerSideValidationStrings({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

### WithDtoClientControllerRPC.skipSchemaEmissionBool

Endpoint: http://localhost:3000/api/foo/client/with-dto/skip-schema-emission-bool

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.skipSchemaEmissionBool();
```

### WithDtoClientControllerRPC.skipSchemaEmissionStrings

Endpoint: http://localhost:3000/api/foo/client/with-dto/skip-schema-emission-strings

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.skipSchemaEmissionStrings({
  query: {
    search: 'strin',
  },
});
```

### WithDtoClientControllerRPC.validateEachIteration

Endpoint: http://localhost:3000/api/foo/client/with-dto/validate-each-iteration

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.validateEachIteration({
  query: {
    values: [null],
  },
});
```

### WithDtoClientControllerRPC.handleAllClient

Endpoint: http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar/client

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleAllClient();
```

### WithDtoClientControllerRPC.handleQuery

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-query

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleQuery({
  query: {
    search: 'strin',
  },
});
```

### WithDtoClientControllerRPC.handleQueryClient

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-query-client

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleQueryClient();
```

### WithDtoClientControllerRPC.handleBody

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-body

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleBody({
  body: {
    hello: 'strin',
  },
});
```

### WithDtoClientControllerRPC.handleBodyClient

Endpoint: http://localhost:3000/api/foo/client/with-dto/handle-body-client

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleBodyClient();
```

### WithDtoClientControllerRPC.handleParams

Endpoint: http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleParams({
  params: {
    foo: 'strin',
    bar: 'strin',
  },
});
```

### WithDtoClientControllerRPC.handleParamsClient

Endpoint: http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y/client

```ts
import { WithDtoClientControllerRPC } from 'test';

const response = await WithDtoClientControllerRPC.handleParamsClient();
```

## OpenApiControllerRPC

### OpenApiControllerRPC.getFromSchema

> Hello, World!

Endpoint: http://localhost:3000/api/foo/client/openapi/

```ts
import { OpenApiControllerRPC } from 'test';

const response = await OpenApiControllerRPC.getFromSchema();
```

## NoValidationControllerOnlyEntityRPC

### NoValidationControllerOnlyEntityRPC.getNoValidationControllerOnlyEntities

Endpoint: http://localhost:3000/api/generated/no-validation-controller-only-entities/

```ts
import { NoValidationControllerOnlyEntityRPC } from 'test';

const response = await NoValidationControllerOnlyEntityRPC.getNoValidationControllerOnlyEntities();
```

### NoValidationControllerOnlyEntityRPC.updateNoValidationControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/no-validation-controller-only-entities/:id

```ts
import { NoValidationControllerOnlyEntityRPC } from 'test';

const response = await NoValidationControllerOnlyEntityRPC.updateNoValidationControllerOnlyEntity();
```

### NoValidationControllerOnlyEntityRPC.createNoValidationControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/no-validation-controller-only-entities/

```ts
import { NoValidationControllerOnlyEntityRPC } from 'test';

const response = await NoValidationControllerOnlyEntityRPC.createNoValidationControllerOnlyEntity();
```

### NoValidationControllerOnlyEntityRPC.deleteNoValidationControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/no-validation-controller-only-entities/:id

```ts
import { NoValidationControllerOnlyEntityRPC } from 'test';

const response = await NoValidationControllerOnlyEntityRPC.deleteNoValidationControllerOnlyEntity();
```

## NoValidationControllerAndServiceEntityRPC

### NoValidationControllerAndServiceEntityRPC.getNoValidationControllerAndServiceEntities

Endpoint: http://localhost:3000/api/generated/no-validation-controller-and-service-entities/

```ts
import { NoValidationControllerAndServiceEntityRPC } from 'test';

const response = await NoValidationControllerAndServiceEntityRPC.getNoValidationControllerAndServiceEntities();
```

### NoValidationControllerAndServiceEntityRPC.updateNoValidationControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id

```ts
import { NoValidationControllerAndServiceEntityRPC } from 'test';

const response = await NoValidationControllerAndServiceEntityRPC.updateNoValidationControllerAndServiceEntity();
```

### NoValidationControllerAndServiceEntityRPC.createNoValidationControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/no-validation-controller-and-service-entities/

```ts
import { NoValidationControllerAndServiceEntityRPC } from 'test';

const response = await NoValidationControllerAndServiceEntityRPC.createNoValidationControllerAndServiceEntity();
```

### NoValidationControllerAndServiceEntityRPC.deleteNoValidationControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id

```ts
import { NoValidationControllerAndServiceEntityRPC } from 'test';

const response = await NoValidationControllerAndServiceEntityRPC.deleteNoValidationControllerAndServiceEntity();
```

## ZodControllerOnlyEntityRPC

### ZodControllerOnlyEntityRPC.getZodControllerOnlyEntities

Endpoint: http://localhost:3000/api/generated/zod-controller-only-entities/

```ts
import { ZodControllerOnlyEntityRPC } from 'test';

const response = await ZodControllerOnlyEntityRPC.getZodControllerOnlyEntities({
  query: {
    search: 'string',
  },
});
```

### ZodControllerOnlyEntityRPC.updateZodControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/zod-controller-only-entities/:id

```ts
import { ZodControllerOnlyEntityRPC } from 'test';

const response = await ZodControllerOnlyEntityRPC.updateZodControllerOnlyEntity({
  params: {
    id: 'string',
  },
  body: {
    foo: 'bar',
  },
  query: {
    q: 'string',
  },
});
```

### ZodControllerOnlyEntityRPC.createZodControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/zod-controller-only-entities/

```ts
import { ZodControllerOnlyEntityRPC } from 'test';

const response = await ZodControllerOnlyEntityRPC.createZodControllerOnlyEntity();
```

### ZodControllerOnlyEntityRPC.deleteZodControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/zod-controller-only-entities/:id

```ts
import { ZodControllerOnlyEntityRPC } from 'test';

const response = await ZodControllerOnlyEntityRPC.deleteZodControllerOnlyEntity();
```

## ZodControllerAndServiceEntityRPC

### ZodControllerAndServiceEntityRPC.getZodControllerAndServiceEntities

Endpoint: http://localhost:3000/api/generated/zod-controller-and-service-entities/

```ts
import { ZodControllerAndServiceEntityRPC } from 'test';

const response = await ZodControllerAndServiceEntityRPC.getZodControllerAndServiceEntities({
  query: {
    search: 'string',
  },
});
```

### ZodControllerAndServiceEntityRPC.updateZodControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/zod-controller-and-service-entities/:id

```ts
import { ZodControllerAndServiceEntityRPC } from 'test';

const response = await ZodControllerAndServiceEntityRPC.updateZodControllerAndServiceEntity({
  params: {
    id: 'string',
  },
  body: {
    foo: 'bar',
  },
  query: {
    q: 'string',
  },
});
```

### ZodControllerAndServiceEntityRPC.createZodControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/zod-controller-and-service-entities/

```ts
import { ZodControllerAndServiceEntityRPC } from 'test';

const response = await ZodControllerAndServiceEntityRPC.createZodControllerAndServiceEntity();
```

### ZodControllerAndServiceEntityRPC.deleteZodControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/zod-controller-and-service-entities/:id

```ts
import { ZodControllerAndServiceEntityRPC } from 'test';

const response = await ZodControllerAndServiceEntityRPC.deleteZodControllerAndServiceEntity();
```

## YupControllerOnlyEntityRPC

### YupControllerOnlyEntityRPC.getYupControllerOnlyEntities

Endpoint: http://localhost:3000/api/generated/yup-controller-only-entities/

```ts
import { YupControllerOnlyEntityRPC } from 'test';

const response = await YupControllerOnlyEntityRPC.getYupControllerOnlyEntities({
  query: {},
});
```

### YupControllerOnlyEntityRPC.updateYupControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/yup-controller-only-entities/:id

```ts
import { YupControllerOnlyEntityRPC } from 'test';

const response = await YupControllerOnlyEntityRPC.updateYupControllerOnlyEntity({
  body: {
    foo: 'bar',
  },
  query: {},
});
```

### YupControllerOnlyEntityRPC.createYupControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/yup-controller-only-entities/

```ts
import { YupControllerOnlyEntityRPC } from 'test';

const response = await YupControllerOnlyEntityRPC.createYupControllerOnlyEntity();
```

### YupControllerOnlyEntityRPC.deleteYupControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/yup-controller-only-entities/:id

```ts
import { YupControllerOnlyEntityRPC } from 'test';

const response = await YupControllerOnlyEntityRPC.deleteYupControllerOnlyEntity();
```

## YupControllerAndServiceEntityRPC

### YupControllerAndServiceEntityRPC.getYupControllerAndServiceEntities

Endpoint: http://localhost:3000/api/generated/yup-controller-and-service-entities/

```ts
import { YupControllerAndServiceEntityRPC } from 'test';

const response = await YupControllerAndServiceEntityRPC.getYupControllerAndServiceEntities({
  query: {},
});
```

### YupControllerAndServiceEntityRPC.updateYupControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/yup-controller-and-service-entities/:id

```ts
import { YupControllerAndServiceEntityRPC } from 'test';

const response = await YupControllerAndServiceEntityRPC.updateYupControllerAndServiceEntity({
  body: {
    foo: 'bar',
  },
  query: {},
});
```

### YupControllerAndServiceEntityRPC.createYupControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/yup-controller-and-service-entities/

```ts
import { YupControllerAndServiceEntityRPC } from 'test';

const response = await YupControllerAndServiceEntityRPC.createYupControllerAndServiceEntity();
```

### YupControllerAndServiceEntityRPC.deleteYupControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/yup-controller-and-service-entities/:id

```ts
import { YupControllerAndServiceEntityRPC } from 'test';

const response = await YupControllerAndServiceEntityRPC.deleteYupControllerAndServiceEntity();
```

## DtoControllerOnlyEntityRPC

### DtoControllerOnlyEntityRPC.getDtoControllerOnlyEntities

Endpoint: http://localhost:3000/api/generated/dto-controller-only-entities/

```ts
import { DtoControllerOnlyEntityRPC } from 'test';

const response = await DtoControllerOnlyEntityRPC.getDtoControllerOnlyEntities({
  query: {
    search: 'string',
  },
});
```

### DtoControllerOnlyEntityRPC.updateDtoControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/dto-controller-only-entities/:id

```ts
import { DtoControllerOnlyEntityRPC } from 'test';

const response = await DtoControllerOnlyEntityRPC.updateDtoControllerOnlyEntity({
  body: {
    foo: 'bar',
  },
  query: {
    q: 'string',
  },
});
```

### DtoControllerOnlyEntityRPC.createDtoControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/dto-controller-only-entities/

```ts
import { DtoControllerOnlyEntityRPC } from 'test';

const response = await DtoControllerOnlyEntityRPC.createDtoControllerOnlyEntity();
```

### DtoControllerOnlyEntityRPC.deleteDtoControllerOnlyEntity

Endpoint: http://localhost:3000/api/generated/dto-controller-only-entities/:id

```ts
import { DtoControllerOnlyEntityRPC } from 'test';

const response = await DtoControllerOnlyEntityRPC.deleteDtoControllerOnlyEntity();
```

## DtoControllerAndServiceEntityRPC

### DtoControllerAndServiceEntityRPC.getDtoControllerAndServiceEntities

Endpoint: http://localhost:3000/api/generated/dto-controller-and-service-entities/

```ts
import { DtoControllerAndServiceEntityRPC } from 'test';

const response = await DtoControllerAndServiceEntityRPC.getDtoControllerAndServiceEntities({
  query: {
    search: 'string',
  },
});
```

### DtoControllerAndServiceEntityRPC.updateDtoControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/dto-controller-and-service-entities/:id

```ts
import { DtoControllerAndServiceEntityRPC } from 'test';

const response = await DtoControllerAndServiceEntityRPC.updateDtoControllerAndServiceEntity({
  body: {
    foo: 'bar',
  },
  query: {
    q: 'string',
  },
});
```

### DtoControllerAndServiceEntityRPC.createDtoControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/dto-controller-and-service-entities/

```ts
import { DtoControllerAndServiceEntityRPC } from 'test';

const response = await DtoControllerAndServiceEntityRPC.createDtoControllerAndServiceEntity();
```

### DtoControllerAndServiceEntityRPC.deleteDtoControllerAndServiceEntity

Endpoint: http://localhost:3000/api/generated/dto-controller-and-service-entities/:id

```ts
import { DtoControllerAndServiceEntityRPC } from 'test';

const response = await DtoControllerAndServiceEntityRPC.deleteDtoControllerAndServiceEntity();
```
