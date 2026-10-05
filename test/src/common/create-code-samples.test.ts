import assert from 'node:assert';
import { createRequire } from 'node:module';
import { describe, test } from 'node:test';
import ts from 'typescript';
import type { VovkJSONSchemaBase } from 'vovk';
import {
  createCodeSamples,
  openAPIToVovkSchema,
  type VovkControllerSchema,
  type VovkHandlerSchema,
} from 'vovk/internal';
import { toPythonIdentifier } from '../../../packages/vovk-python/index.js';
import { toRustIdent } from '../../../packages/vovk-rust/index.js';

type Language = 'ts' | 'py' | 'rs';

// where a line ends for a comment in each language
const lineBreaks = { ts: '\n\r\u2028\u2029', py: '\n\r', rs: '\n' };

// the length of the escape at source[i] in a string literal, 0 when the language doesn't take it
function escapeLength(source: string, i: number, language: Language): number {
  const rest = source.slice(i + 1, i + 12);
  if (language === 'py') {
    const match = /^(?:u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8}|x[0-9a-fA-F]{2}|[0-7]{1,3}|[\\'"abfnrtv\n])/.exec(rest);
    return match ? match[0].length + 1 : 0;
  }
  const braced = /^u\{([0-9a-fA-F]{1,6})\}/.exec(rest);
  if (braced) {
    const codePoint = Number.parseInt(braced[1], 16);
    // no Rust string holds a lone surrogate
    const isSurrogate = codePoint >= 0xd800 && codePoint <= 0xdfff;
    return codePoint <= 0x10ffff && (language === 'ts' || !isSurrogate) ? braced[0].length + 1 : 0;
  }
  const match =
    language === 'rs'
      ? /^(?:x[0-7][0-9a-fA-F]|[nrt\\0'"\n])/.exec(rest)
      : /^(?:u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|0(?![0-9])|[^0-9xu])/.exec(rest);
  return match ? match[0].length + 1 : 0;
}

// the code of a sample, its comments and string literals left out, and the escapes its strings hold that the language
// doesn't take; a comment ends where its language ends a line, a TypeScript or Python string also at a raw line break
function lex(source: string, language: Language): { code: string; badEscapes: string[] } {
  const lineComment = language === 'py' ? '#' : '//';
  const badEscapes: string[] = [];
  let code = '';
  let i = 0;
  while (i < source.length) {
    if (source.startsWith(lineComment, i)) {
      while (i < source.length && !lineBreaks[language].includes(source[i])) i++;
    } else if (language !== 'py' && source.startsWith('/*', i)) {
      // a Rust block comment nests, a TypeScript one ends at the first */
      let depth = 0;
      do {
        if (source.startsWith('/*', i)) {
          depth = language === 'rs' ? depth + 1 : 1;
          i += 2;
        } else if (source.startsWith('*/', i)) {
          depth--;
          i += 2;
        } else i++;
      } while (depth > 0 && i < source.length);
    } else if (source[i] === '"' || source[i] === "'") {
      const quote = source[i++];
      while (i < source.length && source[i] !== quote && (language === 'rs' || !'\n\r'.includes(source[i]))) {
        if (source[i] === '\\') {
          const length = escapeLength(source, i, language);
          if (!length) badEscapes.push(source.slice(i, i + 8));
          i += length || 2;
        } else i++;
      }
      i++;
      code += '""';
    } else code += source[i++];
  }
  return { code, badEscapes };
}

describe('createCodeSamples', () => {
  describe('JSON body with query and params', () => {
    const controllerSchema: VovkControllerSchema = {
      rpcModuleName: 'UserZodRPC',
      originalControllerName: 'UserZodController',
      prefix: 'users-zod',
      handlers: {},
    };

    const handlerSchema: VovkHandlerSchema = {
      httpMethod: 'PUT',
      path: '',
      validation: {
        body: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          description: 'User object',
          type: 'object',
          properties: {
            name: {
              description: 'User full name',
              type: 'string',
            },
            age: {
              description: 'User age',
              type: 'number',
              minimum: 0,
              maximum: 120,
            },
            email: {
              description: 'User email',
              type: 'string',
              format: 'email',
            },
          },
          required: ['name', 'age', 'email'],
          additionalProperties: false,
        },
        query: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: {
            notify: {
              description: 'Notification type',
              type: 'string',
              enum: ['email', 'push', 'none'],
            },
          },
          required: ['notify'],
          additionalProperties: false,
        },
        params: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: {
            id: {
              description: 'User ID',
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['id'],
          additionalProperties: false,
        },
        output: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          description: 'Response object',
          type: 'object',
          properties: {
            success: {
              description: 'Success status',
              type: 'boolean',
            },
          },
          required: ['success'],
          additionalProperties: false,
        },
      },
    };

    test('TypeScript JSON body', () => {
      const result = createCodeSamples({
        handlerName: 'updateUser',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expected = `import { UserZodRPC } from 'vovk-client';

const response = await UserZodRPC.updateUser({
    body: {
        // -----
        // User object
        // -----
        // User full name
        name: "string",
        // User age
        age: 0,
        // User email
        email: "user@example.com"
    },
    query: {
        // Notification type
        notify: "email"
    },
    params: {
        // User ID
        id: "00000000-0000-0000-0000-000000000000"
    },
});

console.log(response); 
/* 
{
    // -----
    // Response object
    // -----
    // Success status
    success: true
}
*/`;

      assert.strictEqual(result.ts, expected);
    });

    test('Python JSON body', () => {
      const result = createCodeSamples({
        handlerName: 'updateUser',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expected = `from vovk_client import UserZodRPC

response = UserZodRPC.update_user(
    body={
        # -----
        # User object
        # -----
        # User full name
        "name": "string",
        # User age
        "age": 0,
        # User email
        "email": "user@example.com"
    },
    query={
        # Notification type
        "notify": "email"
    },
    params={
        # User ID
        "id": "00000000-0000-0000-0000-000000000000"
    },
)

print(response)
# {
#     # -----
#     # Response object
#     # -----
#     # Success status
#     "success": True
# }`;

      assert.strictEqual(result.py, expected);
    });

    test('Rust JSON body', () => {
      const result = createCodeSamples({
        handlerName: 'updateUser',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expected = `use vovk_client::user_zod_rpc;
use serde_json::{ 
  from_value, 
  json 
};
#[tokio::main]
async fn main() {
  let response = user_zod_rpc::update_user(
    from_value(json!({
        // -----
        // User object
        // -----
        // User full name
        "name": "string",
        // User age
        "age": 0,
        // User email
        "email": "user@example.com"
    })).unwrap(), /* body */ 
    from_value(json!({
        // Notification type
        "notify": "email"
    })).unwrap(), /* query */ 
    from_value(json!({
        // User ID
        "id": "00000000-0000-0000-0000-000000000000"
    })).unwrap(), /* params */ 
    None, /* headers (HashMap) */ 
    None, /* api_root */
    false, /* disable_client_validation */
  ).await;

match response {
    Ok(output) => println!("{:?}", output),
    /* 
    output {
        // -----
        // Response object
        // -----
        // Success status
        success: true
    } 
    */
    Err(e) => println!("error: {:?}", e),
  }
}`;

      assert.strictEqual(result.rs, expected);
    });
  });

  describe('Form body with files', () => {
    const controllerSchema: VovkControllerSchema = {
      rpcModuleName: 'FormZodRPC',
      originalControllerName: 'FormZodController',
      prefix: 'forms-zod',
      handlers: {},
    };

    const handlerSchema: VovkHandlerSchema = {
      httpMethod: 'POST',
      path: 'submit',
      validation: {
        body: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          'x-contentType': ['multipart/form-data'],
          properties: {
            email: {
              description: 'User email',
              type: 'string',
              format: 'email',
            },
            resume: {
              description: 'Resume file',
              type: 'string',
              format: 'binary',
              contentMediaType: 'image/png',
            },
            portfolioSamples: {
              description: 'Portfolio samples',
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
            },
          },
          required: ['email', 'resume', 'portfolioSamples'],
          additionalProperties: false,
        },
        params: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: {
            id: {
              description: 'User ID',
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['id'],
          additionalProperties: false,
        },
        output: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          description: 'Response object',
          type: 'object',
          properties: {
            email: {
              description: 'User email',
              type: 'string',
            },
            resume: {
              type: 'object',
              properties: {
                name: {
                  description: 'Resume file name',
                  type: 'string',
                },
                size: {
                  description: 'Resume file size',
                  type: 'number',
                },
                type: {
                  description: 'Resume file type',
                  type: 'string',
                },
              },
            },
            portfolioSamples: {
              description: 'Array of portfolio sample files',
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    description: 'Portfolio sample file name',
                    type: 'string',
                  },
                  size: {
                    description: 'Portfolio sample file size',
                    type: 'number',
                  },
                  type: {
                    description: 'Portfolio sample file type',
                    type: 'string',
                  },
                },
              },
            },
          },
          required: ['email', 'resume', 'portfolioSamples'],
          additionalProperties: false,
        },
      },
    };

    test('TypeScript form body', () => {
      const result = createCodeSamples({
        handlerName: 'submitForm',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expected = `import { FormZodRPC } from 'vovk-client';

const formData = new FormData();
// User email
formData.append("email", "user@example.com");
// Resume file
formData.append("resume", new Blob([binary_data], { type: "image/png" }));
// Portfolio samples
formData.append("portfolioSamples", new Blob([binary_data]));
// Portfolio samples
formData.append("portfolioSamples", new Blob([binary_data]));

const response = await FormZodRPC.submitForm({
    body: formData,
    params: {
        // User ID
        id: "00000000-0000-0000-0000-000000000000"
    },
});

console.log(response); 
/* 
{
    // -----
    // Response object
    // -----
    // User email
    email: "string",
    resume: {
        // Resume file name
        name: "string",
        // Resume file size
        size: 0,
        // Resume file type
        type: "string"
    },
    // Array of portfolio sample files
    portfolioSamples: [
        {
            // Portfolio sample file name
            name: "string",
            // Portfolio sample file size
            size: 0,
            // Portfolio sample file type
            type: "string"
        }
    ]
}
*/`;

      assert.strictEqual(result.ts, expected);
    });

    test('Python form body', () => {
      const result = createCodeSamples({
        handlerName: 'submitForm',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expected = `from vovk_client import FormZodRPC
from io import BytesIO

response = FormZodRPC.submit_form(
    body={
        # User email
        "email": "user@example.com"
    },
    files=[
        # Resume file
        ('resume', ('name.ext', BytesIO(binary_data), "image/png")),
        # Portfolio samples
        ('portfolioSamples', ('name.ext', BytesIO(binary_data))),
        # Portfolio samples
        ('portfolioSamples', ('name.ext', BytesIO(binary_data)))
    ],
    params={
        # User ID
        "id": "00000000-0000-0000-0000-000000000000"
    },
)

print(response)
# {
#     # -----
#     # Response object
#     # -----
#     # User email
#     "email": "string",
#     "resume": {
#         # Resume file name
#         "name": "string",
#         # Resume file size
#         "size": 0,
#         # Resume file type
#         "type": "string"
#     },
#     # Array of portfolio sample files
#     "portfolioSamples": [
#         {
#             # Portfolio sample file name
#             "name": "string",
#             # Portfolio sample file size
#             "size": 0,
#             # Portfolio sample file type
#             "type": "string"
#         }
#     ]
# }`;

      assert.strictEqual(result.py, expected);
    });

    test('Rust form body', () => {
      const result = createCodeSamples({
        handlerName: 'submitForm',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expected = `use vovk_client::form_zod_rpc;
use serde_json::{ 
  from_value, 
  json 
};
use reqwest::multipart;
#[tokio::main]
async fn main() {
  let form = reqwest::multipart::Form::new()
    // User email
    .part("email", "user@example.com");
    // Resume file
    .part("resume", reqwest::multipart::Part::bytes(binary_data).mime_str("image/png").unwrap());
    // Portfolio samples
    .part("portfolioSamples", reqwest::multipart::Part::bytes(binary_data));
    // Portfolio samples
    .part("portfolioSamples", reqwest::multipart::Part::bytes(binary_data));

  let response = form_zod_rpc::submit_form(
    form, /* body */ 
    (), /* query */ 
    from_value(json!({
        // User ID
        "id": "00000000-0000-0000-0000-000000000000"
    })).unwrap(), /* params */ 
    None, /* headers (HashMap) */ 
    None, /* api_root */
    false, /* disable_client_validation */
  ).await;

match response {
    Ok(output) => println!("{:?}", output),
    /* 
    output {
        // -----
        // Response object
        // -----
        // User email
        email: "string",
        resume: {
            // Resume file name
            name: "string",
            // Resume file size
            size: 0,
            // Resume file type
            type: "string"
        },
        // Array of portfolio sample files
        portfolioSamples: [
            {
                // Portfolio sample file name
                name: "string",
                // Portfolio sample file size
                size: 0,
                // Portfolio sample file type
                type: "string"
            }
        ]
    } 
    */
    Err(e) => println!("error: {:?}", e),
  }
}`;

      assert.strictEqual(result.rs, expected);
    });
  });

  describe('Streaming/Iteration responses', () => {
    const controllerSchema: VovkControllerSchema = {
      rpcModuleName: 'StreamRPC',
      originalControllerName: 'StreamController',
      prefix: 'stream',
      handlers: {},
    };

    const handlerSchema: VovkHandlerSchema = {
      httpMethod: 'GET',
      path: 'stream',
      validation: {
        iteration: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: {
            message: {
              description: 'Stream message',
              type: 'string',
            },
          },
          required: ['message'],
        },
      },
    };

    test('TypeScript streaming', () => {
      const result = createCodeSamples({
        handlerName: 'streamTokens',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expected = `import { StreamRPC } from 'vovk-client';

using response = await StreamRPC.streamTokens();

for await (const item of response) {
    console.log(item); 
    /*
    {
        // Stream message
        message: "string"
    }
    */
}`;

      assert.strictEqual(result.ts, expected);
    });

    test('Python streaming', () => {
      const result = createCodeSamples({
        handlerName: 'streamTokens',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expected = `from vovk_client import StreamRPC

response = StreamRPC.stream_tokens()

for i, item in enumerate(response):
    print(f"iteration #{i}:\\n {item}")
    # iteration #0:
    # {
    #     # Stream message
    #     "message": "string"
    # }`;

      assert.strictEqual(result.py, expected);
    });

    test('Rust streaming', () => {
      const result = createCodeSamples({
        handlerName: 'streamTokens',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expected = `use vovk_client::stream_rpc;
use serde_json::{ 
  from_value, 
  json 
};
use futures_util::StreamExt;
#[tokio::main]
async fn main() {
  let response = stream_rpc::stream_tokens(
    (), /* body */ 
    (), /* query */ 
    (), /* params */ 
    None, /* headers (HashMap) */ 
    None, /* api_root */
    false, /* disable_client_validation */
  ).await;

match response {
    Ok(mut stream) => {
      let mut i = 0;
      while let Some(item) = stream.next().await {
        match item {
          Ok(value) => {
            println!("#{}: {:?}", i, value);
            /*
            #0: iteration {
            // Stream message
            message: "string"
        }
            */
            i += 1;
          }
          Err(e) => {
            eprintln!("stream error: {:?}", e);
            break;
          }
        }
      }
    },
    Err(e) => println!("Error initiating stream: {:?}", e),
  }
}`;

      assert.strictEqual(result.rs, expected);
    });
  });

  describe('Config options (apiRoot and headers)', () => {
    const controllerSchema: VovkControllerSchema = {
      rpcModuleName: 'ConfigRPC',
      originalControllerName: 'ConfigController',
      prefix: 'config',
      handlers: {},
    };

    const handlerSchema: VovkHandlerSchema = {
      httpMethod: 'POST',
      path: 'submit',
      validation: {
        body: {
          type: 'object',
          properties: {
            data: { type: 'string' },
          },
        },
      },
    };

    const config = {
      apiRoot: 'https://api.example.com',
      headers: {
        Authorization: 'Bearer token123',
        'X-Custom-Header': 'custom-value',
      },
    };

    test('TypeScript with config', () => {
      const result = createCodeSamples({
        handlerName: 'sendData',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config,
      });

      const expected = `import { ConfigRPC } from 'vovk-client';

const response = await ConfigRPC.sendData({
    body: {
        data: "string"
    },
    apiRoot: 'https://api.example.com',
    init: {
      headers: {
          Authorization: "Bearer token123",
          "X-Custom-Header": "custom-value"
      }
    },
});`;

      assert.strictEqual(result.ts, expected);
    });

    test('Python with config', () => {
      const result = createCodeSamples({
        handlerName: 'sendData',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config,
      });

      const expected = `from vovk_client import ConfigRPC

response = ConfigRPC.send_data(
    body={
        "data": "string"
    },
    api_root="https://api.example.com",
    headers={
        "Authorization": "Bearer token123",
        "X-Custom-Header": "custom-value"
    },
)`;

      assert.strictEqual(result.py, expected);
    });

    test('Rust with config', () => {
      const result = createCodeSamples({
        handlerName: 'sendData',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config,
      });

      const expected = `use vovk_client::config_rpc;
use serde_json::{ 
  from_value, 
  json 
};
#[tokio::main]
async fn main() {
  let response = config_rpc::send_data(
    from_value(json!({
        "data": "string"
    })).unwrap(), /* body */ 
    (), /* query */ 
    (), /* params */ 
    Some(&HashMap::from([
      ("Authorization".to_string(), "Bearer token123".to_string()),
      ("X-Custom-Header".to_string(), "custom-value".to_string())
    ])), /* headers */
    Some("https://api.example.com"), /* api_root */
    false, /* disable_client_validation */
  ).await;
}`;

      assert.strictEqual(result.rs, expected);
    });
  });

  describe('Edge cases', () => {
    test('No parameters at all', () => {
      const controllerSchema: VovkControllerSchema = {
        rpcModuleName: 'SimpleRPC',
        originalControllerName: 'SimpleController',
        prefix: 'simple',
        handlers: {},
      };

      const handlerSchema: VovkHandlerSchema = {
        httpMethod: 'GET',
        path: 'ping',
        validation: {},
      };

      const result = createCodeSamples({
        handlerName: 'ping',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expectedTs = `import { SimpleRPC } from 'vovk-client';

const response = await SimpleRPC.ping();`;

      const expectedPy = `from vovk_client import SimpleRPC

response = SimpleRPC.ping()`;

      const expectedRs = `use vovk_client::simple_rpc;
use serde_json::{ 
  from_value, 
  json 
};
#[tokio::main]
async fn main() {
  let response = simple_rpc::ping(
    (), /* body */ 
    (), /* query */ 
    (), /* params */ 
    None, /* headers (HashMap) */ 
    None, /* api_root */
    false, /* disable_client_validation */
  ).await;
}`;

      assert.strictEqual(result.ts, expectedTs);
      assert.strictEqual(result.py, expectedPy);
      assert.strictEqual(result.rs, expectedRs);
    });

    test('Only query parameters', () => {
      const controllerSchema: VovkControllerSchema = {
        rpcModuleName: 'QueryRPC',
        originalControllerName: 'QueryController',
        prefix: 'query',
        handlers: {},
      };

      const handlerSchema: VovkHandlerSchema = {
        httpMethod: 'GET',
        path: 'search',
        validation: {
          query: {
            type: 'object',
            properties: {
              search: { type: 'string', description: 'Search term' },
              limit: { type: 'number', description: 'Result limit' },
            },
          },
        },
      };

      const result = createCodeSamples({
        handlerName: 'search',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expectedTs = `import { QueryRPC } from 'vovk-client';

const response = await QueryRPC.search({
    query: {
        // Search term
        search: "string",
        // Result limit
        limit: 0
    },
});`;

      assert.strictEqual(result.ts, expectedTs);
    });

    test('Mixed text and binary form fields', () => {
      const controllerSchema: VovkControllerSchema = {
        rpcModuleName: 'MixedFormRPC',
        originalControllerName: 'MixedFormController',
        prefix: 'mixed-form',
        handlers: {},
      };

      const handlerSchema: VovkHandlerSchema = {
        httpMethod: 'POST',
        path: 'upload',
        validation: {
          body: {
            type: 'object',
            'x-contentType': ['multipart/form-data'],
            properties: {
              username: {
                description: 'Username',
                type: 'string',
              },
              age: {
                description: 'User age',
                type: 'number',
              },
              avatar: {
                description: 'Avatar image',
                type: 'string',
                format: 'binary',
                contentMediaType: 'image/jpeg',
              },
              documents: {
                description: 'Document files',
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                  contentMediaType: 'application/pdf',
                },
              },
            },
          },
        },
      };

      const result = createCodeSamples({
        handlerName: 'uploadProfile',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      const expectedTs = `import { MixedFormRPC } from 'vovk-client';

const formData = new FormData();
// Username
formData.append("username", "string");
// User age
formData.append("age", "0");
// Avatar image
formData.append("avatar", new Blob([binary_data], { type: "image/jpeg" }));
// Document files
formData.append("documents", new Blob([binary_data], { type: "application/pdf" }));
// Document files
formData.append("documents", new Blob([binary_data], { type: "application/pdf" }));

const response = await MixedFormRPC.uploadProfile({
    body: formData,
});`;

      assert.strictEqual(result.ts, expectedTs);
    });

    test('Package name conversions', () => {
      const controllerSchema: VovkControllerSchema = {
        rpcModuleName: 'TestRPC',
        originalControllerName: 'TestController',
        prefix: 'test',
        handlers: {},
      };

      const handlerSchema: VovkHandlerSchema = {
        httpMethod: 'GET',
        path: 'ping',
        validation: {},
      };

      // Test Python snake_case conversion
      const resultPy = createCodeSamples({
        handlerName: 'testMethod',
        handlerSchema,
        controllerSchema,
        package: { name: 'my-package-name' },
        config: {},
      });

      assert.ok(resultPy.py.includes('from my_package_name import TestRPC'));
      assert.ok(resultPy.py.includes('TestRPC.test_method()'));

      // Test Rust snake_case conversion (just replaces - with _)
      const resultRs = createCodeSamples({
        handlerName: 'testMethod',
        handlerSchema,
        controllerSchema,
        package: { name: 'my-package-name' },
        config: {},
      });

      assert.ok(resultRs.rs.includes('use my_package_name::test_rpc;'));
      assert.ok(resultRs.rs.includes('test_rpc::test_method('));

      // Test custom Python and Rust package names
      const resultCustom = createCodeSamples({
        handlerName: 'testMethod',
        handlerSchema,
        controllerSchema,
        package: {
          name: 'my-package',
          py_name: 'custom_python_package',
          rs_name: 'custom_rust_package',
        },
        config: {},
      });

      assert.ok(resultCustom.py.includes('from custom_python_package import TestRPC'));
      assert.ok(resultCustom.rs.includes('use custom_rust_package::test_rpc;'));
    });

    test('Text content in form with contentMediaType', () => {
      const controllerSchema: VovkControllerSchema = {
        rpcModuleName: 'TextFormRPC',
        originalControllerName: 'TextFormController',
        prefix: 'text-form',
        handlers: {},
      };

      const handlerSchema: VovkHandlerSchema = {
        httpMethod: 'POST',
        path: 'upload',
        validation: {
          body: {
            type: 'object',
            'x-contentType': ['multipart/form-data'],
            properties: {
              config: {
                description: 'Config file',
                type: 'string',
                format: 'binary',
                contentMediaType: 'application/json',
              },
              script: {
                description: 'Script file',
                type: 'string',
                format: 'binary',
                contentMediaType: 'text/javascript',
              },
            },
          },
        },
      };

      const result = createCodeSamples({
        handlerName: 'uploadText',
        handlerSchema,
        controllerSchema,
        package: { name: 'vovk-client' },
        config: {},
      });

      // TypeScript should use text for text content types
      assert.ok(result.ts.includes('new Blob(["text_content"], { type: "application/json" })'));
      assert.ok(result.ts.includes('new Blob(["text_content"], { type: "text/javascript" })'));

      // Python should use text encoding for text content types
      assert.ok(result.py.includes('"text_content".encode("utf-8")'));

      // Rust should use reqwest::multipart::Part::text for text content types
      assert.ok(result.rs.includes('reqwest::multipart::Part::text("text_content")'));
    });
  });

  describe('Circular $refs', () => {
    const controllerSchema: VovkControllerSchema = {
      rpcModuleName: 'NodeRPC',
      prefix: '',
      handlers: {},
    };

    const makeHandlerSchema = (body: Record<string, unknown>): VovkHandlerSchema => ({
      httpMethod: 'POST',
      path: 'nodes',
      validation: { body },
    });

    test('self referential $ref terminates instead of overflowing', () => {
      const result = createCodeSamples({
        handlerName: 'createNode',
        handlerSchema: makeHandlerSchema({
          $ref: '#/$defs/Node',
          $defs: {
            Node: { type: 'object', properties: { name: { type: 'string' }, child: { $ref: '#/$defs/Node' } } },
          },
        }),
        controllerSchema,
        config: { apiRoot: '/api' },
      });

      assert.ok(result.ts.includes('name: "string"'));
      assert.ok(result.ts.includes('child: null'));
    });

    test('mutually referential $refs terminate', () => {
      const result = createCodeSamples({
        handlerName: 'createNode',
        handlerSchema: makeHandlerSchema({
          $ref: '#/$defs/A',
          $defs: {
            A: { type: 'object', properties: { b: { $ref: '#/$defs/B' } } },
            B: { type: 'object', properties: { a: { $ref: '#/$defs/A' } } },
          },
        }),
        controllerSchema,
        config: { apiRoot: '/api' },
      });

      assert.ok(result.ts.includes('NodeRPC.createNode'));
    });

    test('self referential array items terminate', () => {
      const result = createCodeSamples({
        handlerName: 'createNode',
        handlerSchema: makeHandlerSchema({
          $ref: '#/$defs/Tree',
          $defs: {
            Tree: { type: 'object', properties: { kids: { type: 'array', items: { $ref: '#/$defs/Tree' } } } },
          },
        }),
        controllerSchema,
        config: { apiRoot: '/api' },
      });

      assert.ok(result.ts.includes('NodeRPC.createNode'));
    });
  });

  describe('Python literals', () => {
    const controllerSchema: VovkControllerSchema = {
      rpcModuleName: 'TaskRPC',
      prefix: 'tasks',
      handlers: {},
    };
    const task: VovkJSONSchemaBase = {
      type: 'object',
      properties: {
        done: { type: 'boolean' },
        note: { type: 'null' },
        flags: { type: 'array', items: { type: 'boolean' } },
      },
    };

    // Python spells true, false and null as True, False and None, so a JSON literal in the code is a NameError
    const jsonLiteralsInCode = (python: string) =>
      python.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|#.*$/gm, '').match(/\b(?:true|false|null)\b/g) ?? [];

    test('Python JSON body, query and output', () => {
      const { py } = createCodeSamples({
        handlerName: 'updateTask',
        handlerSchema: {
          httpMethod: 'PUT',
          path: '',
          validation: {
            body: task,
            query: { type: 'object', properties: { notify: { type: 'boolean' } } },
            output: task,
          },
        },
        controllerSchema,
        config: {},
      });

      assert.deepStrictEqual(jsonLiteralsInCode(py), [], py);
    });

    test('Python streaming items', () => {
      const { py } = createCodeSamples({
        handlerName: 'streamTasks',
        handlerSchema: { httpMethod: 'GET', path: 'stream', validation: { iteration: task } },
        controllerSchema,
        config: {},
      });

      assert.deepStrictEqual(jsonLiteralsInCode(py), [], py);
    });
  });

  describe('Descriptions that are not strings', () => {
    // a third-party OpenAPI document may hold a number or any other JSON as a description
    const controllerSchema: VovkControllerSchema = { rpcModuleName: 'ThingRPC', prefix: 'things', handlers: {} };
    const objectWith = (description: unknown, extra: Record<string, unknown> = {}) =>
      ({
        type: 'object',
        ...(description !== undefined && { description }),
        properties: {
          name: { type: 'string', ...(description !== undefined && { description }) },
          file: { type: 'string', format: 'binary', ...(description !== undefined && { description }) },
        },
        required: ['name', 'file'],
        ...extra,
      }) as VovkJSONSchemaBase;
    const samplesWith = (description: unknown) => [
      createCodeSamples({
        handlerName: 'updateThing',
        handlerSchema: {
          httpMethod: 'POST',
          path: 'thing',
          validation: {
            body: objectWith(description),
            query: objectWith(description),
            output: objectWith(description),
          },
        },
        controllerSchema,
        config: {},
      }),
      createCodeSamples({
        handlerName: 'uploadThing',
        handlerSchema: {
          httpMethod: 'POST',
          path: 'upload',
          validation: { body: objectWith(description, { 'x-contentType': ['multipart/form-data'] }) },
        },
        controllerSchema,
        config: {},
      }),
    ];

    test('a description that is not a string is left out', () => {
      for (const description of [123, true, ['a list'], { text: 'an object' }]) {
        assert.deepStrictEqual(samplesWith(description), samplesWith(undefined), JSON.stringify(description));
      }
    });
  });

  describe('Descriptions over several lines', () => {
    const controllerSchema: VovkControllerSchema = { rpcModuleName: 'ThingRPC', prefix: 'things', handlers: {} };
    const objectWith = (description: string) =>
      ({
        type: 'object',
        description,
        properties: {
          name: { type: 'string', description },
          // a value inside a block comment, as the output samples are written
          note: { type: 'string', example: '*/ PWNED() /*' },
        },
        required: ['name', 'note'],
      }) as VovkJSONSchemaBase;
    const formWith = (description: string) =>
      ({
        type: 'object',
        'x-contentType': ['multipart/form-data'],
        properties: {
          file: { type: 'string', format: 'binary', description },
          files: { type: 'array', items: { type: 'string', format: 'binary' }, description },
          name: { type: 'string', description },
        },
        required: ['file', 'files', 'name'],
      }) as VovkJSONSchemaBase;
    const samplesWith = (description: string) =>
      [
        { body: objectWith(description), query: objectWith(description), output: objectWith(description) },
        { iteration: objectWith(description) },
        { body: formWith(description) },
      ].map((validation) =>
        createCodeSamples({
          handlerName: 'updateThing',
          handlerSchema: { httpMethod: 'POST', path: 'thing', validation },
          controllerSchema,
          config: {},
        })
      );

    test('every line of a description stays in its comment', () => {
      for (const lineBreak of ['\n', '\r\n', '\r', '\u2028', '\u2029']) {
        for (const samples of samplesWith(`line one${lineBreak}PWNED()`)) {
          for (const language of ['ts', 'py', 'rs'] as const) {
            assert.ok(
              !lex(samples[language], language).code.includes('PWNED'),
              `${language} ${JSON.stringify(lineBreak)}:\n${samples[language]}`
            );
          }
        }
      }
    });

    test('a description or a value in a block comment does not end it', () => {
      for (const samples of samplesWith('x */ PWNED() /* y')) {
        for (const language of ['ts', 'py', 'rs'] as const) {
          assert.ok(!lex(samples[language], language).code.includes('PWNED'), `${language}:\n${samples[language]}`);
        }
      }
    });
  });

  describe('Method names alike in snake_case', () => {
    // the Python and Rust clients name the methods of a module in schema order, a taken name gets the first free suffix
    const handlers = {
      getUserByID: { httpMethod: 'GET', path: 'by-id' },
      getUserById: { httpMethod: 'POST', path: 'by-id' },
      get_user_by_id: { httpMethod: 'PUT', path: 'by-id' },
      httpRequest: { httpMethod: 'GET', path: 'request' },
    } as VovkControllerSchema['handlers'];
    const controllerSchema: VovkControllerSchema = { rpcModuleName: 'UserRPC', prefix: 'users', handlers };
    const methodsCalled = (handlerName: string) => {
      const { py, rs } = createCodeSamples({
        handlerName,
        handlerSchema: handlers[handlerName],
        controllerSchema,
        package: { name: 'client' },
        config: {},
      });
      return [py.match(/UserRPC\.(\w+)\(/)?.[1], rs.match(/user_rpc::(\w+)\(/)?.[1]];
    };

    test('each handler calls the method the client gives it', () => {
      assert.deepStrictEqual(methodsCalled('getUserByID'), ['get_user_by_id', 'get_user_by_id']);
      assert.deepStrictEqual(methodsCalled('getUserById'), ['get_user_by_id_2', 'get_user_by_id_2']);
      assert.deepStrictEqual(methodsCalled('get_user_by_id'), ['get_user_by_id_3', 'get_user_by_id_3']);
      // the Rust module imports functions named http_request and http_request_stream
      assert.deepStrictEqual(methodsCalled('httpRequest'), ['http_request', 'http_request_2']);
    });
  });

  describe('Names the clients have', () => {
    // the templates name a Python class toPythonIdentifier(rpcModuleName) and its methods
    // toPythonIdentifier(snakeCase(handlerName)), a Rust module and its functions toRustIdent(snakeCase(name)),
    // with the lodash snakeCase vovk-cli gives them; a Rust module imports http_request and http_request_stream
    const lodashSnakeCase: (name: string) => string = createRequire(
      new URL('../../../packages/vovk-cli/package.json', import.meta.url)
    )('lodash/snakeCase');
    const clientNames = (rpcModuleName: string, handlerName: string) => {
      const rsFunction = toRustIdent(lodashSnakeCase(handlerName));
      return {
        py: [toPythonIdentifier(rpcModuleName), toPythonIdentifier(lodashSnakeCase(handlerName))],
        rs: [
          toRustIdent(lodashSnakeCase(rpcModuleName)),
          ['http_request', 'http_request_stream'].includes(rsFunction) ? `${rsFunction}_2` : rsFunction,
        ],
      };
    };
    const sampleNames = (rpcModuleName: string, handlerName: string) => {
      const controllerSchema: VovkControllerSchema = {
        rpcModuleName,
        prefix: 'things',
        handlers: { [handlerName]: { httpMethod: 'GET', path: 'thing' } },
      };
      const { py, rs } = createCodeSamples({
        handlerName,
        handlerSchema: controllerSchema.handlers[handlerName],
        controllerSchema,
        package: { name: 'client' },
        config: {},
      });
      return {
        py: py.match(/^response = (\w+)\.(\w+)\(/m)?.slice(1),
        rs: rs.match(/^ {2}let response = (\w+)::(\w+)\(/m)?.slice(1),
      };
    };

    test('a sample calls the method its client has', () => {
      // biome-ignore format: a table
      const handlerNames = ['getV2Users', 'listV1', 'getOAuth2Token', 'users.list', 'a/b', 'getÜber', 'HTTPServer', 'import', 'type', 'self', 'match', 'httpRequest'];
      for (const handlerName of handlerNames) {
        assert.deepStrictEqual(sampleNames('ThingRPC', handlerName), clientNames('ThingRPC', handlerName), handlerName);
      }
    });

    test('a sample names the module its client has', () => {
      for (const rpcModuleName of ['ThingV2RPC', 'HTTPServerRPC', 'things.API', 'ÜberRPC', 'self']) {
        assert.deepStrictEqual(
          sampleNames(rpcModuleName, 'getThing'),
          clientNames(rpcModuleName, 'getThing'),
          rpcModuleName
        );
      }
    });

    test('a sample names any handler as its client does', () => {
      // names made of these pieces, seeded so a failure repeats
      // biome-ignore format: a word list
      const pieces = [
        'get', 'User', 'ID', 'HTTP', 'Server', 'v2', 'V1', 'x', 'Q', '0', '42', '1st', '2ND', '3rd', '11th', '_', '$',
        '-', '.', '/', ' ', "'", '\u2019', 'Ü', 'über', 'ß', 'Æ', 'ø', 'Ł', 'ŉ', 'ĳ', 'ǅ', 'Σσ', 'Жж', '中', '😀',
        '\u2713', '\u0301', '\u200d', '\ufe0f', '\u00d7', '\u2028', 'import', 'type',
      ];
      let seed = 2026;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      for (let n = 0; n < 2000; n++) {
        let handlerName = '';
        for (let length = 1 + Math.floor(random() * 6); length > 0; length--) {
          handlerName += pieces[Math.floor(random() * pieces.length)];
        }
        assert.deepStrictEqual(
          sampleNames('ThingRPC', handlerName),
          clientNames('ThingRPC', handlerName),
          JSON.stringify(handlerName)
        );
      }
    });
  });

  describe('Text from the schema in string literals', () => {
    // what would end a string literal, or make one invalid, in TypeScript, Python or Rust
    const text = [
      '"); PWNED(); ("',
      "'), PWNED(), ('",
      '\\',
      '\n PWNED() \r PWNED() \t',
      // biome-ignore lint/suspicious/noTemplateCurlyInString: what a template literal would run
      '${PWNED()}',
      String.fromCharCode(0x01, 0x08, 0x0c, 0x7f, 0x85, 0x2028, 0x202e, 0xd800),
    ].join('');
    const controllerSchema: VovkControllerSchema = { rpcModuleName: 'ThingRPC', prefix: 'things', handlers: {} };
    const samplesOf = (validation: VovkHandlerSchema['validation']) =>
      createCodeSamples({
        handlerName: 'updateThing',
        handlerSchema: { httpMethod: 'POST', path: 'thing', validation },
        controllerSchema,
        config: {},
      });
    const json = {
      type: 'object',
      properties: { [text]: { type: 'string', example: text } },
      required: [text],
    } as VovkJSONSchemaBase;
    const form = {
      type: 'object',
      'x-contentType': ['multipart/form-data'],
      properties: {
        [text]: { type: 'string', example: text },
        [`${text}file`]: { type: 'string', format: 'binary', contentMediaType: text },
        files: { type: 'array', items: { type: 'string', format: 'binary', contentMediaType: text } },
      },
      required: [text, `${text}file`, 'files'],
    } as VovkJSONSchemaBase;

    test('a name, a value or a media type stays inside its string literal', () => {
      for (const samples of [
        samplesOf({ body: json, query: json, params: json, output: json }),
        samplesOf({ iteration: json }),
        samplesOf({ body: form }),
      ]) {
        for (const language of ['ts', 'py', 'rs'] as const) {
          const { code, badEscapes } = lex(samples[language], language);
          assert.ok(!code.includes('PWNED'), `${language}:\n${samples[language]}`);
          assert.deepStrictEqual(badEscapes, [], `${language}:\n${samples[language]}`);
        }
        const { diagnostics } = ts.transpileModule(samples.ts, {
          compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
          reportDiagnostics: true,
        });
        assert.deepStrictEqual(
          diagnostics?.map(({ messageText }) => messageText),
          [],
          samples.ts
        );
      }
    });

    test('a media type that is not a string is left out', () => {
      const formWith = (contentMediaType?: unknown) =>
        ({
          type: 'object',
          'x-contentType': ['multipart/form-data'],
          properties: {
            file: { type: 'string', format: 'binary', ...(contentMediaType !== undefined && { contentMediaType }) },
          },
          required: ['file'],
        }) as VovkJSONSchemaBase;
      assert.deepStrictEqual(samplesOf({ body: formWith(5) }), samplesOf({ body: formWith() }));
    });
  });

  describe('TypeScript method names', () => {
    // the receiver and the name of the method a TypeScript sample calls for its response
    function calledMethod(sample: string): string[] | undefined {
      const file = ts.createSourceFile('sample.ts', sample, ts.ScriptTarget.ESNext);
      let called: string[] | undefined;
      const visit = (node: ts.Node) => {
        if (
          ts.isVariableDeclaration(node) &&
          node.name.getText(file) === 'response' &&
          node.initializer &&
          ts.isAwaitExpression(node.initializer) &&
          ts.isCallExpression(node.initializer.expression)
        ) {
          const callee = node.initializer.expression.expression;
          if (ts.isPropertyAccessExpression(callee)) called = [callee.expression.getText(file), callee.name.text];
          if (ts.isElementAccessExpression(callee) && ts.isStringLiteral(callee.argumentExpression)) {
            called = [callee.expression.getText(file), callee.argumentExpression.text];
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(file);
      return called;
    }

    test('a sample calls a method whose name is not an identifier as the client has it', () => {
      // the client takes the handler names of a mixin as they are, so these are methods of ThingsAPI
      const operationIds = ['users.list', 'repos/get', 'get-user', 'a b', '2fa', "it's", 'getÜber', 'delete', 'list'];
      const spec = {
        openapi: '3.1.0',
        info: { title: 'Names', version: '1.0.0' },
        servers: [{ url: 'https://api.example.com' }],
        paths: Object.fromEntries(
          operationIds.map((operationId, i) => [
            `/things/${i}`,
            { get: { operationId, responses: { '200': { description: 'ok' } } } },
          ])
        ),
      };
      const segment = openAPIToVovkSchema({
        source: { object: spec },
        getModuleName: () => 'ThingsAPI',
        getMethodName: ({ operationObject }: { operationObject: { operationId?: string } }) =>
          operationObject.operationId ?? 'op',
        segmentName: 'things',
      } as unknown as Parameters<typeof openAPIToVovkSchema>[0]);
      const controllerSchema = segment.segments.things.controllers.ThingsAPI;

      assert.deepStrictEqual(Object.keys(controllerSchema.handlers), operationIds);
      for (const handlerName of operationIds) {
        const { ts: sample } = createCodeSamples({
          handlerName,
          handlerSchema: controllerSchema.handlers[handlerName],
          controllerSchema,
          package: { name: 'my-client' },
          config: {},
        });
        assert.deepStrictEqual(calledMethod(sample), ['ThingsAPI', handlerName], sample);
      }
    });
  });

  // SEC-03: the sample generator expands every $ref with a fresh "seen" set per branch, so a component
  // that references one of depth N twice is inlined 2^N times. A tiny malicious OpenAPI spec (a developer
  // generates its README, Rust or Python client) produces a gigantic sample and exhausts memory.
  describe('malicious OpenAPI spec: deeply shared refs', () => {
    test('does not expand a diamond-ref spec into an exponential code sample', () => {
      const depth = 12;
      const schemas: Record<string, unknown> = {
        C0: { type: 'object', properties: { leaf: { type: 'string' } }, required: ['leaf'] },
      };
      for (let i = 1; i <= depth; i++) {
        schemas[`C${i}`] = {
          type: 'object',
          properties: {
            left: { $ref: `#/components/schemas/C${i - 1}` },
            right: { $ref: `#/components/schemas/C${i - 1}` },
          },
          required: ['left', 'right'],
        };
      }
      const spec = {
        openapi: '3.1.0',
        info: { title: 'Evil', version: '1.0.0' },
        servers: [{ url: 'https://api.example.com' }],
        paths: {
          '/things': {
            post: {
              operationId: 'createThing',
              requestBody: { content: { 'application/json': { schema: { $ref: `#/components/schemas/C${depth}` } } } },
              responses: { '200': { description: 'ok' } },
            },
          },
        },
        components: { schemas },
      };
      const specBytes = JSON.stringify(spec).length;

      const segment = openAPIToVovkSchema({
        source: { object: spec },
        getModuleName: () => 'ThingsAPI',
        getMethodName: ({ operationObject }: { operationObject: { operationId?: string } }) =>
          operationObject.operationId ?? 'op',
        segmentName: 'things',
      } as unknown as Parameters<typeof openAPIToVovkSchema>[0]);

      const controllerSchema = segment.segments.things.controllers.ThingsAPI;
      const { ts } = createCodeSamples({
        handlerName: 'createThing',
        handlerSchema: controllerSchema.handlers.createThing,
        controllerSchema,
        package: { name: 'my-client' },
        config: {},
      });

      // the sample should stay proportional to the schema, not to 2^depth
      assert.ok(
        ts.length < specBytes * 50,
        `a ${specBytes}-byte spec produced a ${ts.length}-char code sample (2^${depth} inlining)`
      );
    });
  });

  describe('malicious OpenAPI spec: nested arrays', () => {
    test('does not expand arrays nested with minItems into an exponential code sample', () => {
      const depth = 10;
      let schema: Record<string, unknown> = { type: 'string' };
      for (let i = 0; i < depth; i++) schema = { type: 'array', minItems: 3, items: schema };
      const spec = {
        openapi: '3.1.0',
        info: { title: 'Evil', version: '1.0.0' },
        servers: [{ url: 'https://api.example.com' }],
        paths: {
          '/things': {
            post: {
              operationId: 'createThing',
              requestBody: { content: { 'application/json': { schema } } },
              responses: { '200': { description: 'ok' } },
            },
          },
        },
      };
      const specBytes = JSON.stringify(spec).length;

      const segment = openAPIToVovkSchema({
        source: { object: spec },
        getModuleName: () => 'ThingsAPI',
        getMethodName: ({ operationObject }: { operationObject: { operationId?: string } }) =>
          operationObject.operationId ?? 'op',
        segmentName: 'things',
      } as unknown as Parameters<typeof openAPIToVovkSchema>[0]);

      const controllerSchema = segment.segments.things.controllers.ThingsAPI;
      const samples = createCodeSamples({
        handlerName: 'createThing',
        handlerSchema: controllerSchema.handlers.createThing,
        controllerSchema,
        package: { name: 'my-client' },
        config: {},
      });

      // 3 items per level would make 3^depth strings
      for (const [lang, sample] of Object.entries(samples)) {
        assert.ok(
          sample.length < specBytes * 50,
          `a ${specBytes}-byte spec produced a ${sample.length}-char ${lang} code sample (3^${depth} items)`
        );
      }
    });
  });
});
