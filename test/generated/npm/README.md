# test

## CommonControllerRPC

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getHelloWorldResponseObject();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getHelloWorldObjectLiteral();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getHelloWorldNextResponseObjectPromise();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getHelloWorldRawResponseObjectPromise();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getHelloWorldObjectLiteralPromise();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getHelloWorldHeaders();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getHelloWorldArray();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getHelloWorldAndEmptyGeneric();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getWithParams();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.postWithAll();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.postWithBodyAndQueryUsingReqVovk();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getNestedQuery();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.postWithFormDataUsingReqVovk();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getErrorResponse();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getJsonTextResponse();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getJsonlResponse();
```

```ts
import { CommonControllerRPC } from 'vovk-client';

const response = await CommonControllerRPC.getJsonlTextResponse();
```

## StreamingControllerRPC

```ts
import { StreamingControllerRPC } from 'vovk-client';

const response = await StreamingControllerRPC.postWithStreaming();
```

```ts
import { StreamingControllerRPC } from 'vovk-client';

const response = await StreamingControllerRPC.postWithStreamingAndImmediateError();
```

```ts
import { StreamingControllerRPC } from 'vovk-client';

const response = await StreamingControllerRPC.postWithStreamingAndDelayedError();
```

```ts
import { StreamingControllerRPC } from 'vovk-client';

const response = await StreamingControllerRPC.postWithStreamingAndDelayedCustomError();
```

```ts
import { StreamingControllerRPC } from 'vovk-client';

const response = await StreamingControllerRPC.postWithStreamingAndDelayedUnhandledError();
```

## StreamingGeneratorControllerRPC

```ts
import { StreamingGeneratorControllerRPC } from 'vovk-client';

const response = await StreamingGeneratorControllerRPC.getWithStreaming();
```

```ts
import { StreamingGeneratorControllerRPC } from 'vovk-client';

const response = await StreamingGeneratorControllerRPC.postWithAsyncStreaming();
```

```ts
import { StreamingGeneratorControllerRPC } from 'vovk-client';

const response = await StreamingGeneratorControllerRPC.postWithStreaming();
```

```ts
import { StreamingGeneratorControllerRPC } from 'vovk-client';

const response = await StreamingGeneratorControllerRPC.postWithStreamingAndImmediateError();
```

```ts
import { StreamingGeneratorControllerRPC } from 'vovk-client';

const response = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedError();
```

```ts
import { StreamingGeneratorControllerRPC } from 'vovk-client';

const response = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedCustomError();
```

```ts
import { StreamingGeneratorControllerRPC } from 'vovk-client';

const response = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedUnhandledError();
```

## CustomSchemaControllerRPC

```ts
import { CustomSchemaControllerRPC } from 'vovk-client';

const response = await CustomSchemaControllerRPC.getWithCustomSchema();
```

## WithZodClientControllerRPC

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

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

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.handleQuery({
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.handleBody({
  body: {
    hello: 'strin',
  },
});
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.handleParams({
  params: {
    foo: 'strin',
    bar: 'strin',
  },
});
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

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

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

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

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.handleStream({
  query: {
    values: ['string'],
  },
});
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

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

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.handleNothitng();
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.handleFormData({
  query: {
    search: 'string',
  },
});
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.disableServerSideValidationBool({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'string',
  },
});
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.disableServerSideValidationStrings({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.skipSchemaEmissionBool();
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.skipSchemaEmissionStrings({
  query: {
    search: 'string',
  },
});
```

```ts
import { WithZodClientControllerRPC } from 'vovk-client';

const response = await WithZodClientControllerRPC.validateEachIteration({
  query: {
    values: ['string'],
  },
});
```

## WithYupClientControllerRPC

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

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

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.handleQuery({
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.handleBody({
  body: {
    hello: 'strin',
  },
});
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.handleParams({
  params: {
    foo: 'strin',
    bar: 'strin',
  },
});
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

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

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

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

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.handleStream({
  query: {
    values: ['string'],
  },
});
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.handleSchemaComplaints({
  body: {
    logical_allOf: {},
    obj_strict: {},
    obj_required: {},
  },
});
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.handleNothitng();
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.handleFormData({
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.disableServerSideValidationBool({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.disableServerSideValidationStrings({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.skipSchemaEmissionBool();
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.skipSchemaEmissionStrings({
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithYupClientControllerRPC } from 'vovk-client';

const response = await WithYupClientControllerRPC.validateEachIteration({
  query: {
    values: ['string'],
  },
});
```

## WithDtoClientControllerRPC

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

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

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleNestedQuery({
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

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleNestedQueryClient();
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

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

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleOutputClient();
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleStream({
  query: {
    values: ['string'],
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

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
    obj_required: {
      requiredField: 'string',
      optionalField: 0,
    },
    obj_strict: {
      knownField: 'string',
    },
    logical_allOf: {},
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleNothitng();
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleFormData({
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.disableServerSideValidationBool({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.disableServerSideValidationStrings({
  body: {
    hello: 'strin',
  },
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.skipSchemaEmissionBool();
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.skipSchemaEmissionStrings({
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.validateEachIteration({
  query: {
    values: [null],
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleAllClient();
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleQuery({
  query: {
    search: 'strin',
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleQueryClient();
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleBody({
  body: {
    hello: 'strin',
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleBodyClient();
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleParams({
  params: {
    foo: 'strin',
    bar: 'strin',
  },
});
```

```ts
import { WithDtoClientControllerRPC } from 'vovk-client';

const response = await WithDtoClientControllerRPC.handleParamsClient();
```

## OpenApiControllerRPC

```ts
import { OpenApiControllerRPC } from 'vovk-client';

const response = await OpenApiControllerRPC.getFromSchema();
```

## NoValidationControllerOnlyEntityRPC

```ts
import { NoValidationControllerOnlyEntityRPC } from 'vovk-client';

const response = await NoValidationControllerOnlyEntityRPC.getNoValidationControllerOnlyEntities();
```

```ts
import { NoValidationControllerOnlyEntityRPC } from 'vovk-client';

const response = await NoValidationControllerOnlyEntityRPC.updateNoValidationControllerOnlyEntity();
```

```ts
import { NoValidationControllerOnlyEntityRPC } from 'vovk-client';

const response = await NoValidationControllerOnlyEntityRPC.createNoValidationControllerOnlyEntity();
```

```ts
import { NoValidationControllerOnlyEntityRPC } from 'vovk-client';

const response = await NoValidationControllerOnlyEntityRPC.deleteNoValidationControllerOnlyEntity();
```

## NoValidationControllerAndServiceEntityRPC

```ts
import { NoValidationControllerAndServiceEntityRPC } from 'vovk-client';

const response = await NoValidationControllerAndServiceEntityRPC.getNoValidationControllerAndServiceEntities();
```

```ts
import { NoValidationControllerAndServiceEntityRPC } from 'vovk-client';

const response = await NoValidationControllerAndServiceEntityRPC.updateNoValidationControllerAndServiceEntity();
```

```ts
import { NoValidationControllerAndServiceEntityRPC } from 'vovk-client';

const response = await NoValidationControllerAndServiceEntityRPC.createNoValidationControllerAndServiceEntity();
```

```ts
import { NoValidationControllerAndServiceEntityRPC } from 'vovk-client';

const response = await NoValidationControllerAndServiceEntityRPC.deleteNoValidationControllerAndServiceEntity();
```

## ZodControllerOnlyEntityRPC

```ts
import { ZodControllerOnlyEntityRPC } from 'vovk-client';

const response = await ZodControllerOnlyEntityRPC.getZodControllerOnlyEntities({
  query: {
    search: 'string',
  },
});
```

```ts
import { ZodControllerOnlyEntityRPC } from 'vovk-client';

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

```ts
import { ZodControllerOnlyEntityRPC } from 'vovk-client';

const response = await ZodControllerOnlyEntityRPC.createZodControllerOnlyEntity();
```

```ts
import { ZodControllerOnlyEntityRPC } from 'vovk-client';

const response = await ZodControllerOnlyEntityRPC.deleteZodControllerOnlyEntity();
```

## ZodControllerAndServiceEntityRPC

```ts
import { ZodControllerAndServiceEntityRPC } from 'vovk-client';

const response = await ZodControllerAndServiceEntityRPC.getZodControllerAndServiceEntities({
  query: {
    search: 'string',
  },
});
```

```ts
import { ZodControllerAndServiceEntityRPC } from 'vovk-client';

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

```ts
import { ZodControllerAndServiceEntityRPC } from 'vovk-client';

const response = await ZodControllerAndServiceEntityRPC.createZodControllerAndServiceEntity();
```

```ts
import { ZodControllerAndServiceEntityRPC } from 'vovk-client';

const response = await ZodControllerAndServiceEntityRPC.deleteZodControllerAndServiceEntity();
```

## YupControllerOnlyEntityRPC

```ts
import { YupControllerOnlyEntityRPC } from 'vovk-client';

const response = await YupControllerOnlyEntityRPC.getYupControllerOnlyEntities({
  query: {},
});
```

```ts
import { YupControllerOnlyEntityRPC } from 'vovk-client';

const response = await YupControllerOnlyEntityRPC.updateYupControllerOnlyEntity({
  body: {
    foo: 'bar',
  },
  query: {},
});
```

```ts
import { YupControllerOnlyEntityRPC } from 'vovk-client';

const response = await YupControllerOnlyEntityRPC.createYupControllerOnlyEntity();
```

```ts
import { YupControllerOnlyEntityRPC } from 'vovk-client';

const response = await YupControllerOnlyEntityRPC.deleteYupControllerOnlyEntity();
```

## YupControllerAndServiceEntityRPC

```ts
import { YupControllerAndServiceEntityRPC } from 'vovk-client';

const response = await YupControllerAndServiceEntityRPC.getYupControllerAndServiceEntities({
  query: {},
});
```

```ts
import { YupControllerAndServiceEntityRPC } from 'vovk-client';

const response = await YupControllerAndServiceEntityRPC.updateYupControllerAndServiceEntity({
  body: {
    foo: 'bar',
  },
  query: {},
});
```

```ts
import { YupControllerAndServiceEntityRPC } from 'vovk-client';

const response = await YupControllerAndServiceEntityRPC.createYupControllerAndServiceEntity();
```

```ts
import { YupControllerAndServiceEntityRPC } from 'vovk-client';

const response = await YupControllerAndServiceEntityRPC.deleteYupControllerAndServiceEntity();
```

## DtoControllerOnlyEntityRPC

```ts
import { DtoControllerOnlyEntityRPC } from 'vovk-client';

const response = await DtoControllerOnlyEntityRPC.getDtoControllerOnlyEntities({
  query: {
    search: 'string',
  },
});
```

```ts
import { DtoControllerOnlyEntityRPC } from 'vovk-client';

const response = await DtoControllerOnlyEntityRPC.updateDtoControllerOnlyEntity({
  body: {
    foo: 'bar',
  },
  query: {
    q: 'string',
  },
});
```

```ts
import { DtoControllerOnlyEntityRPC } from 'vovk-client';

const response = await DtoControllerOnlyEntityRPC.createDtoControllerOnlyEntity();
```

```ts
import { DtoControllerOnlyEntityRPC } from 'vovk-client';

const response = await DtoControllerOnlyEntityRPC.deleteDtoControllerOnlyEntity();
```

## DtoControllerAndServiceEntityRPC

```ts
import { DtoControllerAndServiceEntityRPC } from 'vovk-client';

const response = await DtoControllerAndServiceEntityRPC.getDtoControllerAndServiceEntities({
  query: {
    search: 'string',
  },
});
```

```ts
import { DtoControllerAndServiceEntityRPC } from 'vovk-client';

const response = await DtoControllerAndServiceEntityRPC.updateDtoControllerAndServiceEntity({
  body: {
    foo: 'bar',
  },
  query: {
    q: 'string',
  },
});
```

```ts
import { DtoControllerAndServiceEntityRPC } from 'vovk-client';

const response = await DtoControllerAndServiceEntityRPC.createDtoControllerAndServiceEntity();
```

```ts
import { DtoControllerAndServiceEntityRPC } from 'vovk-client';

const response = await DtoControllerAndServiceEntityRPC.deleteDtoControllerAndServiceEntity();
```
