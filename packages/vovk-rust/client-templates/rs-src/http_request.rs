use serde::{Serialize, de::DeserializeOwned};
use reqwest::{Client, Method};
use reqwest::multipart;
use std::collections::HashMap;
use std::error::Error;
use std::fmt;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use jsonschema::{Draft, Validator};
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
    cause: Option<Value>,
}

impl HttpException {
    fn new(message: impl Into<String>, status_code: i32, cause: Option<Value>) -> Self {
        HttpException { message: message.into(), status_code, cause }
    }

    /// The error message
    pub fn message(&self) -> &str {
        &self.message
    }

    /// The HTTP status code, 0 when the call failed before a response came
    pub fn status_code(&self) -> i32 {
        self.status_code
    }

    /// The cause the server sent with the error
    pub fn cause(&self) -> Option<&Value> {
        self.cause.as_ref()
    }
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

/// The request body, as the handler's content type sends it
pub enum RequestBody<'a, B: ?Sized> {
    None,
    Json(&'a B),
    UrlEncoded(&'a B),
    Multipart(multipart::Form),
    Text(String, &'static str),
    Binary(Vec<u8>, &'static str),
}

// Load the full schema only once using lazy initialization
static FULL_SCHEMA: Lazy<Result<Value, String>> = Lazy::new(|| {
    read_full_schema::read_full_schema()
        .map(|schema| serde_json::to_value(schema).expect("Failed to convert schema to Value"))
        .map_err(|e| format!("Failed to read schema: {}", e))
});

// segment, controller, handler and slot
type ValidatorKey = (&'static str, &'static str, &'static str, &'static str);

// each schema is compiled on its first use
static VALIDATORS: Lazy<Mutex<HashMap<ValidatorKey, Arc<Validator>>>> = Lazy::new(|| Mutex::new(HashMap::new()));

thread_local! {
    // a pooled connection runs on the runtime that opened it, so each thread keeps its own client
    static CLIENT: Client = Client::new();
}

// draft 7 only when the schema declares it, any other schema is read as 2020-12, as vovk-ajv does
fn compile_schema(schema: &Value) -> Result<Validator, String> {
    let is_draft7 = schema
        .get("$schema")
        .and_then(Value::as_str)
        .map_or(false, |uri| uri.contains("://json-schema.org/draft-07/schema"));
    jsonschema::options()
        .with_draft(if is_draft7 { Draft::Draft7 } else { Draft::Draft202012 })
        .should_validate_formats(true)
        .offline()
        .build(schema)
        .map_err(|e| e.to_string())
}

fn validate(endpoint: &Endpoint, label: &'static str, schema: &Value, value: &Value) -> Result<(), String> {
    let key = (endpoint.segment_name, endpoint.controller_name, endpoint.handler_name, label);
    let cached = VALIDATORS.lock().unwrap_or_else(|e| e.into_inner()).get(&key).cloned();
    let validator = match cached {
        Some(validator) => validator,
        None => {
            let validator = Arc::new(
                compile_schema(schema).map_err(|e| format!("Invalid {} schema: {}", label.to_lowercase(), e))?,
            );
            VALIDATORS.lock().unwrap_or_else(|e| e.into_inner()).insert(key, validator.clone());
            validator
        }
    };
    let errors: Vec<String> = validator
        .iter_errors(value)
        .map(|err| format!("{}: {}", err.instance_path(), err))
        .collect();
    if errors.is_empty() {
        Ok(())
    } else {
        Err(format!("{} validation failed: {}", label, errors.join(", ")))
    }
}

// a number as JavaScript prints it, so 5.0 stays "5"
fn number_to_string(number: &serde_json::Number) -> String {
    match number.as_f64() {
        Some(float) if number.is_f64() && float.fract() == 0.0 && float.abs() < 9_007_199_254_740_992.0 => {
            format!("{}", float as i64)
        }
        _ => number.to_string(),
    }
}

// "", "." and ".." (also percent-encoded) would drop or climb a path segment and so reach another route
fn is_unsafe_segment(value: &str) -> bool {
    let mut rest = value.to_ascii_lowercase();
    for _ in 0..2 {
        if let Some(stripped) = rest.strip_prefix('.') {
            rest = stripped.to_string();
        } else if let Some(stripped) = rest.strip_prefix("%2e") {
            rest = stripped.to_string();
        }
    }
    rest.is_empty()
}

// a form field is text: null is left out, an array repeats its key and an object is sent as JSON
fn to_form_fields(value: &Value) -> Result<Vec<(String, String)>, String> {
    let map = value.as_object().ok_or("A form body must be an object")?;
    let mut fields = Vec::new();
    for (key, value) in map {
        let items = match value {
            Value::Array(items) => items.iter().collect(),
            other => vec![other],
        };
        for item in items {
            match item {
                Value::Null => {}
                Value::String(text) => fields.push((key.clone(), text.clone())),
                Value::Number(number) => fields.push((key.clone(), number_to_string(number))),
                Value::Bool(flag) => fields.push((key.clone(), flag.to_string())),
                other => fields.push((key.clone(), other.to_string())),
            }
        }
    }
    Ok(fields)
}

// Private helper function for request preparation
fn prepare_request<B, Q, P>(
    endpoint: &Endpoint,
    body: RequestBody<'_, B>,
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
    let body_value = match &body {
        RequestBody::Json(b) | RequestBody::UrlEncoded(b) => {
            Some(serde_json::to_value(b).map_err(|e| format!("Failed to serialize body: {}", e))?)
        }
        _ => None,
    };
        
    let query_value = query.map(|q| serde_json::to_value(q))
        .transpose()
        .map_err(|e| format!("Failed to serialize query: {}", e))?;
        
    let params_value = params.map(|p| serde_json::to_value(p))
        .transpose()
        .map_err(|e| format!("Failed to serialize params: {}", e))?;

    if !disable_client_validation {
        // a multipart, text or binary body is left to the server
        if let Some(body_schema) = validation.get("body") {
            if let Some(ref body_val) = body_value {
                validate(endpoint, "Body", body_schema, body_val)?;
            } else if matches!(body, RequestBody::None) && http_method != "GET" {
                return Err("Body is required for validation but not provided".into());
            }
        }
        
        if let Some(query_schema) = validation.get("query") {
            if let Some(ref query_val) = query_value {
                validate(endpoint, "Query", query_schema, query_val)?;
            } else {
                return Err("Query is required for validation but not provided".into());
            }
        }
        
        if let Some(params_schema) = validation.get("params") {
            if let Some(ref params_val) = params_value {
                validate(endpoint, "Params", params_schema, params_val)?;
            } else {
                return Err("Params are required for validation but not provided".into());
            }
        }
    }

    // Substitute path parameters in the URL
    if let Some(Value::Object(map)) = &params_value {
        for (key, value) in map {
            let placeholder = format!("{{{}}}", key);
            if !url.contains(&placeholder) {
                continue;
            }
            let segment = match value {
                Value::String(s) => s.clone(),
                Value::Number(n) => number_to_string(n),
                Value::Bool(b) => b.to_string(),
                // a missing value keeps its placeholder, which is reported below
                Value::Null => continue,
                _ => return Err(format!("Param {} must be a string, a number or a boolean", key).into()),
            };
            if is_unsafe_segment(&segment) {
                return Err(format!("Param {} can't be empty, \".\" or \"..\", got {:?}", key, segment).into());
            }
            url = url.replace(&placeholder, &urlencoding::encode(&segment));
        }
    }

    let missing: Vec<&str> = url
        .split('{')
        .skip(1)
        .filter_map(|rest| rest.split_once('}').map(|(name, _)| name))
        .collect();
    if !missing.is_empty() {
        return Err(format!("Missing params: {}", missing.join(", ")).into());
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
    let content_type = match &body {
        RequestBody::Json(_) => Some("application/json"),
        RequestBody::UrlEncoded(_) => Some("application/x-www-form-urlencoded"),
        RequestBody::Text(_, content_type) | RequestBody::Binary(_, content_type) => Some(*content_type),
        // reqwest writes the multipart boundary itself
        RequestBody::Multipart(_) | RequestBody::None => None,
    };
    if let Some(content_type) = content_type {
        let value = reqwest::header::HeaderValue::from_str(content_type)
            .map_err(|e| format!("Invalid content type {}: {}", content_type, e))?;
        headers_map.insert("Content-Type", value);
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
    let client = CLIENT.with(Client::clone);
    let request = client.request(method, &url).headers(headers_map);

    let request = match body {
        RequestBody::None => request,
        RequestBody::Json(_) => request.json(&body_value),
        RequestBody::UrlEncoded(_) => request.form(&to_form_fields(body_value.as_ref().unwrap_or(&Value::Null))?),
        RequestBody::Multipart(form) => request.multipart(form),
        RequestBody::Text(text, _) => request.body(text),
        RequestBody::Binary(bytes, _) => request.body(bytes),
    };

    Ok((request, http_method.to_string()))
}

// "application/json; charset=utf-8" => "application/json"
fn media_type(response: &reqwest::Response) -> String {
    response
        .headers()
        .get("Content-Type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .split(';')
        .next()
        .unwrap_or("")
        .trim()
        .to_ascii_lowercase()
}

fn is_json(media_type: &str) -> bool {
    media_type == "application/json" || media_type.ends_with("+json")
}

fn is_json_lines(media_type: &str) -> bool {
    media_type == "application/jsonl" || media_type == "application/x-ndjson"
}

// the message of a JSON error, or the text a proxy sent
fn error_from_body(body: &[u8], media_type: &str, status: reqwest::StatusCode) -> HttpException {
    let status_code = status.as_u16() as i32;
    if is_json(media_type) {
        if let Ok(value) = serde_json::from_slice::<Value>(body) {
            let message = value
                .get("message")
                .and_then(|m| m.as_str())
                .unwrap_or("Unknown error")
                .to_string();
            return HttpException::new(message, status_code, value.get("cause").cloned());
        }
    }
    let text = String::from_utf8_lossy(body).trim().to_string();
    let message = if text.is_empty() {
        status.canonical_reason().unwrap_or("Unknown error").to_string()
    } else {
        text
    };
    HttpException::new(message, status_code, None)
}

// a success that is not JSON: an empty body is null, text is a string unless the type wants JSON, bytes are a byte list
fn read_non_json<T: DeserializeOwned>(body: &[u8], status_code: i32) -> Result<T, HttpException> {
    let to_error = |e: serde_json::Error| HttpException::new(e.to_string(), status_code, None);
    if body.is_empty() {
        return serde_json::from_value(Value::Null).map_err(to_error);
    }
    match std::str::from_utf8(body) {
        Ok(text) => serde_json::from_value(Value::String(text.to_string()))
            .or_else(|e| serde_json::from_str(text).map_err(|_| e))
            .map_err(to_error),
        Err(_) => serde_json::from_value(Value::Array(body.iter().map(|byte| Value::from(*byte)).collect()))
            .map_err(to_error),
    }
}

// Main request function for regular (non-streaming) responses
#[allow(dead_code)]
pub async fn http_request<T, B, Q, P>(
    endpoint: &Endpoint,
    body: RequestBody<'_, B>,
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
    let media_type = media_type(&response);

    let bytes = response
        .bytes()
        .await
        .map_err(|e| HttpException::new(e.to_string(), status_code, None))?;

    // only an error status makes an error, a 2xx body may hold any keys
    if status.is_client_error() || status.is_server_error() {
        return Err(error_from_body(&bytes, &media_type, status));
    }

    if is_json_lines(&media_type) {
        // a stream read in one call: its items as an array, an error line fails the call
        let mut items = Vec::new();
        for line in String::from_utf8_lossy(&bytes).lines() {
            let line = line.trim();
            if line.is_empty() {
                continue;
            }
            let value: Value =
                serde_json::from_str(line).map_err(|e| HttpException::new(e.to_string(), status_code, None))?;
            if is_error_line(&value) {
                return Err(error_from_line(&value, status_code));
            }
            items.push(value);
        }
        return serde_json::from_value(Value::Array(items))
            .map_err(|e| HttpException::new(e.to_string(), status_code, None));
    }

    if is_json(&media_type) && !bytes.is_empty() {
        return serde_json::from_slice::<T>(&bytes).map_err(|e| HttpException::new(e.to_string(), status_code, None));
    }

    read_non_json(&bytes, status_code)
}

// Request function specifically for streaming responses
#[allow(dead_code)]
pub async fn http_request_stream<T, B, Q, P>(
    endpoint: &Endpoint,
    body: RequestBody<'_, B>,
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
        let media_type = media_type(&response);
        let bytes = response.bytes().await.unwrap_or_default();
        return Err(error_from_body(&bytes, &media_type, status));
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
                Err(error_from_line(&value, status_code))
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

fn error_from_line(value: &Value, status_code: i32) -> HttpException {
    let message = match &value["reason"] {
        Value::String(reason) => reason.clone(),
        reason => reason.to_string(),
    };
    let line_status_code = value["statusCode"].as_i64().map(|code| code as i32);
    HttpException::new(message, line_status_code.unwrap_or(status_code), None)
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

