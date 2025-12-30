import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createCodeSamples, type VovkControllerSchema, type VovkHandlerSchema } from 'vovk/internal';

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
{
    # -----
    # Response object
    # -----
    # Success status
    "success": true
}`;

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
          'x-isForm': true,
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
{
    # -----
    # Response object
    # -----
    # User email
    "email": "string",
    "resume": {
        # Resume file name
        "name": "string",
        # Resume file size
        "size": 0,
        # Resume file type
        "type": "string"
    },
    # Array of portfolio sample files
    "portfolioSamples": [
        {
            # Portfolio sample file name
            "name": "string",
            # Portfolio sample file size
            "size": 0,
            # Portfolio sample file type
            "type": "string"
        }
    ]
}`;

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
    {
        # Stream message
        "message": "string"
    }`;

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
            'x-isForm': true,
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
            'x-isForm': true,
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
});
