use serde::{Serialize, de::DeserializeOwned};
use reqwest::{Client, Method};
use reqwest::multipart;
use std::collections::HashMap;
use std::error::Error;
use std::fmt;
use std::pin::Pin;
use jsonschema::JSONSchema;
use serde_json::Value;
use urlencoding;
use crate::read_full_schema;
use once_cell::sync::Lazy;
use futures_util::{Stream, StreamExt, TryStreamExt};
use tokio_util::codec::{FramedRead, LinesCodec};
use tokio_util::io::StreamReader;

// Custom error type for HTTP exceptions
#[derive(Debug, Serialize)]
pub struct HttpException {
    message: String,
    status_code: i32,
    #[allow(dead_code)]
    cause: Option<Value>,
}

impl fmt::Display for HttpException {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[Status: {}] {}", self.status_code, self.message)
    }
}

impl Error for HttpException {}

/// Where a handler is: the segment's root, its path in the URL and the names that find it in the schema
pub struct Endpoint {
    pub api_root: &'static str,
    // empty for an OpenAPI mixin, whose root already points at the API
    pub segment_path: &'static str,
    pub segment_name: &'static str,
    pub controller_name: &'static str,
    pub handler_name: &'static str,
}

// Load the full schema only once using lazy initialization
static FULL_SCHEMA: Lazy<Result<Value, String>> = Lazy::new(|| {
    read_full_schema::read_full_schema()
        .map(|schema| serde_json::to_value(schema).expect("Failed to convert schema to Value"))
        .map_err(|e| format!("Failed to read schema: {}", e))
});

// Private helper function for request preparation
fn prepare_request<B, Q, P>(
    endpoint: &Endpoint,
    body: Option<&B>,
    form: Option<multipart::Form>,
    text_body: Option<String>,
    binary_body: Option<(Vec<u8>, String)>,
    query: Option<&Q>,
    params: Option<&P>,
    headers: Option<&HashMap<String, String>>,
    api_root: Option<&str>,
    disable_client_validation: bool,
) -> Result<(reqwest::RequestBuilder, String), Box<dyn Error + Send + Sync>>
where
    B: Serialize + ?Sized,
    Q: Serialize + ?Sized,
    P: Serialize + ?Sized,
{
    // Extract schema information
    let schema = match &*FULL_SCHEMA {
        Ok(schema) => schema,
        Err(e) => return Err(format!("Failed to load schema: {}", e).into()),
    };
    
    let segment = schema.get("segments")
        .and_then(|s| s.get(endpoint.segment_name))
        .ok_or("Segment not found")?;
    
    let controller = segment.get("controllers")
        .and_then(|c| c.get(endpoint.controller_name))
        .ok_or("Controller not found")?;
    
    let handlers = controller.get("handlers")
        .and_then(|h| h.as_object())
        .ok_or("Handlers not found")?;
    
    let handler = handlers.get(endpoint.handler_name).ok_or("Handler not found")?;
    // an OpenAPI mixin's controller has no prefix
    let prefix = controller.get("prefix")
        .and_then(|p| p.as_str())
        .unwrap_or("");
    let handler_path = handler.get("path")
        .and_then(|p| p.as_str())
        .ok_or("Path not found")?;
    let http_method = handler.get("httpMethod")
        .ok_or("HTTP method not found")?
        .as_str()
        .ok_or("HTTP method is not a string")?;
    let default_validation = Value::Object(serde_json::Map::new());
    let validation = handler
        .get("validation")
        .unwrap_or(&default_validation);

    // Construct the base URL, the parts are joined with single slashes whatever slashes they start or end with
    let path = [endpoint.segment_path, prefix, handler_path]
        .iter()
        .flat_map(|part| part.split('/'))
        .filter(|piece| !piece.is_empty())
        .collect::<Vec<_>>()
        .join("/");
    let root = api_root.unwrap_or(endpoint.api_root).trim_end_matches('/');
    let mut url = if path.is_empty() { root.to_string() } else { format!("{}/{}", root, path) };

    // Convert generic types to Value for validation if needed
    let body_value = body.map(|b| serde_json::to_value(b))
        .transpose()
        .map_err(|e| format!("Failed to serialize body: {}", e))?;
        
    let query_value = query.map(|q| serde_json::to_value(q))
        .transpose()
        .map_err(|e| format!("Failed to serialize query: {}", e))?;
        
    let params_value = params.map(|p| serde_json::to_value(p))
        .transpose()
        .map_err(|e| format!("Failed to serialize params: {}", e))?;

    // Perform JSON validation if not disabled and no form/text/binary data is provided
    if !disable_client_validation && form.is_none() && text_body.is_none() && binary_body.is_none() {
        if let Some(body_schema) = validation.get("body") {
            if let Some(ref body_val) = body_value {
                let schema =
                    JSONSchema::compile(body_schema).map_err(|e| format!("Invalid body schema: {}", e))?;
                schema
                    .validate(body_val)
                    .map_err(|e| {
                        let error_msgs: Vec<String> = e.map(|err| format!("{}: {}", err.instance_path, err.to_string())).collect();
                        format!("Body validation failed: {}", error_msgs.join(", "))
                    })?;
            } else if http_method != "GET" {
                return Err("Body is required for validation but not provided".into());
            }
        }
        
        if let Some(query_schema) = validation.get("query") {
            if let Some(ref query_val) = query_value {
                let schema =
                    JSONSchema::compile(query_schema).map_err(|e| format!("Invalid query schema: {}", e))?;
                schema
                    .validate(query_val)
                    .map_err(|e| {
                        let error_msgs: Vec<String> = e.map(|err| format!("{}: {}", err.instance_path, err.to_string())).collect();
                        format!("Query validation failed: {}", error_msgs.join(", "))
                    })?;
            } else {
                return Err("Query is required for validation but not provided".into());
            }
        }
        
        if let Some(params_schema) = validation.get("params") {
            if let Some(ref params_val) = params_value {
                let schema = JSONSchema::compile(params_schema)
                    .map_err(|e| format!("Invalid params schema: {}", e))?;
                schema
                    .validate(params_val)
                    .map_err(|e| {
                        let error_msgs: Vec<String> = e.map(|err| format!("{}: {}", err.instance_path, err.to_string())).collect();
                        format!("Params validation failed: {}", error_msgs.join(", "))
                    })?;
            } else {
                return Err("Params are required for validation but not provided".into());
            }
        }
    }

    // Substitute path parameters in the URL
    if let Some(ref params_val) = params_value {
        if let Value::Object(map) = params_val {
            for (key, value) in map {
                let pattern = format!("{{{}}}", key);
                if let Value::String(s) = value {
                    // "." and ".." would leave the handler's path once the URL is normalized
                    if s == "." || s == ".." {
                        return Err(format!("Param {} cannot be \"{}\"", key, s).into());
                    }
                    url = url.replace(&pattern, &urlencoding::encode(s));
                } else {
                    return Err(format!("Param {} must be a string", key).into());
                }
            }
        }
    }

    // Append query string if query parameters are provided
    if let Some(ref query_val) = query_value {
        let query_string = build_query_string(query_val, "");
        if !query_string.is_empty() {
            if url.contains('?') {
                url += "&";
            } else {
                url += "?";
            }
            url += &query_string;
        }
    }

    // Set up request headers
    let mut headers_map = reqwest::header::HeaderMap::new();
    headers_map.insert("Accept", "application/jsonl, application/json".parse().unwrap());
    if body_value.is_some() && form.is_none() && text_body.is_none() && binary_body.is_none() {
        headers_map.insert("Content-Type", "application/json".parse().unwrap());
    } else if text_body.is_some() {
        headers_map.insert("Content-Type", "text/plain".parse().unwrap());
    } else if let Some((_, ref content_type)) = binary_body {
        headers_map.insert("Content-Type", content_type.parse().unwrap());
    }

    // Merge with user-provided headers if any
    if let Some(provided_headers) = headers {
        for (key, value) in provided_headers {
            if let Ok(header_name) = reqwest::header::HeaderName::from_bytes(key.as_bytes()) {
                if let Ok(header_value) = reqwest::header::HeaderValue::from_str(value) {
                    headers_map.insert(header_name, header_value);
                }
            }
        }
    }

    // Map HTTP method string to reqwest::Method
    let method = match http_method.to_uppercase().as_str() {
        "GET" => Method::GET,
        "POST" => Method::POST,
        "PUT" => Method::PUT,
        "DELETE" => Method::DELETE,
        "PATCH" => Method::PATCH,
        "OPTIONS" => Method::OPTIONS,
        "HEAD" => Method::HEAD,
        _ => return Err("Invalid HTTP method".into()),
    };

    // Build the HTTP request
    let client = Client::new();
    let mut request = client.request(method, &url).headers(headers_map);
    
    // Apply form data, text body, binary body, or JSON body to the request
    if let Some(form_data) = form {
        request = request.multipart(form_data);
    } else if let Some(text) = text_body {
        request = request.body(text);
    } else if let Some((bytes, _)) = binary_body {
        request = request.body(bytes);
    } else if let Some(body_val) = body_value {
        request = request.json(&body_val);
    }
    
    Ok((request, http_method.to_string()))
}

// Main request function for regular (non-streaming) responses
#[allow(dead_code)]
pub async fn http_request<T, B, Q, P>(
    endpoint: &Endpoint,
    body: Option<&B>,
    form: Option<multipart::Form>,
    text_body: Option<String>,
    binary_body: Option<(Vec<u8>, String)>,
    query: Option<&Q>,
    params: Option<&P>,
    headers: Option<&HashMap<String, String>>,
    api_root: Option<&str>,
    disable_client_validation: bool,
) -> Result<T, HttpException> 
where 
    T: DeserializeOwned + 'static,
    B: Serialize + ?Sized,
    Q: Serialize + ?Sized,
    P: Serialize + ?Sized,
{
    let (request, _) = prepare_request(
        endpoint,
        body,
        form,
        text_body,
        binary_body,
        query,
        params,
        headers,
        api_root,
        disable_client_validation,
    ).map_err(|e| HttpException {
        message: e.to_string(),
        status_code: 0,
        cause: None,
    })?;

    let response = request.send().await.map_err(|e| HttpException {
        message: e.to_string(),
        status_code: 0,
        cause: None,
    })?;

    let status = response.status();
    let status_code = status.as_u16() as i32;

    let content_type = response
        .headers()
        .get("Content-Type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    if content_type.contains("application/json") {
        let value: Value = response.json().await.map_err(|e| HttpException {
            message: e.to_string(),
            status_code,
            cause: None,
        })?;

        if status.is_client_error() || status.is_server_error() || value.get("isError").is_some() {
            let message = value
                .get("message")
                .and_then(|m| m.as_str())
                .unwrap_or("Unknown error")
                .to_string();
            let cause = value.get("cause").cloned();

            return Err(HttpException {
                message,
                status_code,
                cause,
            });
        }

        serde_json::from_value::<T>(value).map_err(|e| HttpException {
            message: e.to_string(),
            status_code,
            cause: None,
        })
    } else {
        let text = response.text().await.map_err(|e| HttpException {
            message: e.to_string(),
            status_code,
            cause: None,
        })?;

        if status.is_client_error() || status.is_server_error() {
            return Err(HttpException {
                message: text.clone(),
                status_code,
                cause: None,
            });
        }

        serde_json::from_str::<T>(&text).map_err(|e| HttpException {
            message: e.to_string(),
            status_code,
            cause: None,
        })
    }
}

// Request function specifically for streaming responses
#[allow(dead_code)]
pub async fn http_request_stream<T, B, Q, P>(
    endpoint: &Endpoint,
    body: Option<&B>,
    form: Option<multipart::Form>,
    text_body: Option<String>,
    binary_body: Option<(Vec<u8>, String)>,
    query: Option<&Q>,
    params: Option<&P>,
    headers: Option<&HashMap<String, String>>,
    api_root: Option<&str>,
    disable_client_validation: bool,
) -> Result<Pin<Box<dyn Stream<Item = Result<T, HttpException>> + Send>>, HttpException> 
where 
    T: DeserializeOwned + 'static,
    B: Serialize + ?Sized,
    Q: Serialize + ?Sized,
    P: Serialize + ?Sized,
{
    let (request, _) = prepare_request(
        endpoint,
        body,
        form,
        text_body,
        binary_body,
        query,
        params,
        headers,
        api_root,
        disable_client_validation,
    ).map_err(|e| HttpException {
        message: e.to_string(),
        status_code: 0,
        cause: None,
    })?;

    let response = request.send().await.map_err(|e| HttpException {
        message: e.to_string(),
        status_code: 0,
        cause: None,
    })?;

    let status = response.status();
    let status_code = status.as_u16() as i32;

    if !status.is_success() {
        let message = response
            .text()
            .await
            .unwrap_or_else(|_| "Streaming request failed".to_string());

        return Err(HttpException {
            message,
            status_code,
            cause: None,
        });
    }

    let byte_stream = response
        .bytes_stream()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e));

    let reader = StreamReader::new(byte_stream);
    let lines = FramedRead::new(reader, LinesCodec::new());

    let json_stream = lines.filter_map(move |line| async move {
        match line {
            Ok(content) => {
                let trimmed = content.trim();
                if trimmed.is_empty() {
                    return None;
                }

                match serde_json::from_str::<Value>(trimmed) {
                    Ok(value) => Some(Ok(value)),
                    Err(e) => Some(Err(HttpException {
                        message: e.to_string(),
                        status_code,
                        cause: None,
                    })),
                }
            }
            Err(e) => Some(Err(HttpException {
                message: e.to_string(),
                status_code,
                cause: None,
            })),
        }
    });

    let typed_stream = json_stream.map(move |result| {
        result.and_then(|value| {
            if is_error_line(&value) {
                let message = match &value["reason"] {
                    Value::String(reason) => reason.clone(),
                    reason => reason.to_string(),
                };
                let line_status_code = value["statusCode"].as_i64().map(|code| code as i32);

                Err(HttpException {
                    message,
                    status_code: line_status_code.unwrap_or(status_code),
                    cause: None,
                })
            } else {
                serde_json::from_value::<T>(value).map_err(|e| HttpException {
                    message: e.to_string(),
                    status_code,
                    cause: None,
                })
            }
        })
    });

    Ok(Box::pin(typed_stream))
}

// only the envelope a responder writes ends the stream, not a data item that happens to have these keys
fn is_error_line(value: &Value) -> bool {
    match value {
        Value::Object(map) => {
            map.get("isError") == Some(&Value::Bool(true))
                && map.contains_key("reason")
                && map.keys().all(|key| key == "isError" || key == "reason" || key == "statusCode")
        }
        _ => false,
    }
}

// Helper function to build query strings from nested JSON
fn build_query_string(data: &Value, prefix: &str) -> String {
    match data {
        Value::Object(map) => {
            let parts: Vec<String> = map
                .iter()
                .map(|(k, v)| {
                    let new_prefix = if prefix.is_empty() {
                        k.to_string()
                    } else {
                        format!("{}[{}]", prefix, k)
                    };
                    build_query_string(v, &new_prefix)
                })
                .filter(|part| !part.is_empty())
                .collect();
            parts.join("&")
        }
        Value::Array(arr) => {
            let parts: Vec<String> = arr
                .iter()
                .enumerate()
                .map(|(i, v)| {
                    let new_prefix = format!("{}[{}]", prefix, i);
                    build_query_string(v, &new_prefix)
                })
                .filter(|part| !part.is_empty())
                .collect();
            parts.join("&")
        }
        Value::Null => String::new(),
        _ => {
            let value_str = match data {
                Value::String(s) => s.clone(),
                _ => data.to_string(),
            };
            format!("{}={}", urlencoding::encode(prefix), urlencoding::encode(&value_str))
        }
    }
}

