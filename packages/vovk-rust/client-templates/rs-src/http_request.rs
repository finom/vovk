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

#[derive(Debug, Serialize)]
pub struct HttpException {
    message: String,
    status_code: i32,
    cause: Option<Value>,
    // the error behind a call that got no response or a broken one, such as reqwest's
    #[serde(skip)]
    source: Option<Box<dyn Error + Send + Sync>>,
}

impl HttpException {
    fn new(message: impl Into<String>, status_code: i32, cause: Option<Value>) -> Self {
        HttpException { message: message.into(), status_code, cause, source: None }
    }

    // a reqwest error without its URL, whose query may hold a token
    fn from_reqwest(error: reqwest::Error, status_code: i32) -> Self {
        Self::with_source(error.without_url(), status_code)
    }

    fn with_source(error: impl Error + Send + Sync + 'static, status_code: i32) -> Self {
        HttpException { message: error.to_string(), status_code, cause: None, source: Some(Box::new(error)) }
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

impl Error for HttpException {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        self.source.as_deref().map(|error| error as &(dyn Error + 'static))
    }
}

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
// a crate builds only the variants its procedures send
#[allow(dead_code)]
pub enum RequestBody<'a, B: ?Sized> {
    None,
    Json(&'a B),
    UrlEncoded(&'a B),
    Multipart(multipart::Form),
    Text(String, &'static str),
    Binary(Vec<u8>, &'static str),
}

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

    let path = [endpoint.segment_path, prefix, handler_path]
        .iter()
        .flat_map(|part| part.split('/'))
        .filter(|piece| !piece.is_empty())
        .collect::<Vec<_>>()
        .join("/");
    let root = api_root.unwrap_or(endpoint.api_root).trim_end_matches('/');
    let mut url = if path.is_empty() { root.to_string() } else { format!("{}/{}", root, path) };

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

    // a value goes out without the spaces, tabs and line breaks around it, as fetch sends it; a name or value that is
    // still invalid fails the call, which otherwise would go out without it (the value stays out of the message)
    if let Some(provided_headers) = headers {
        for (key, value) in provided_headers {
            let header_name = reqwest::header::HeaderName::from_bytes(key.as_bytes())
                .map_err(|_| format!("Invalid header name {:?}", key))?;
            let header_value =
                reqwest::header::HeaderValue::from_str(value.trim_matches(|c| matches!(c, ' ' | '\t' | '\r' | '\n')))
                    .map_err(|_| format!("Invalid value of header {:?}", key))?;
            headers_map.insert(header_name, header_value);
        }
    }

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

    let client = CLIENT.with(Client::clone);
    let request = client.request(method, &url).headers(headers_map);

    let request = match body {
        RequestBody::None => request,
        RequestBody::Json(_) => request.json(&body_value),
        RequestBody::UrlEncoded(_) => request.form(&to_form_fields(body_value.as_ref().unwrap_or(&Value::Null))?),
        // names go out raw in quotes, as browsers write them: the server reads no name*=utf-8''... form
        RequestBody::Multipart(form) => request.multipart(form.percent_encode_noop()),
        RequestBody::Text(text, _) => request.body(text),
        RequestBody::Binary(bytes, _) => request.body(bytes),
    };

    Ok((request, http_method.to_string()))
}

fn location(response: &reqwest::Response) -> Option<String> {
    let value = response.headers().get(reqwest::header::LOCATION)?;
    value.to_str().ok().map(str::to_string)
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
    matches!(media_type, "application/jsonl" | "application/jsonlines" | "application/x-ndjson")
}

// text/* or any type that names a charset
fn is_text(response: &reqwest::Response, media_type: &str) -> bool {
    media_type.starts_with("text/")
        || response
            .headers()
            .get(reqwest::header::CONTENT_TYPE)
            .and_then(|v| v.to_str().ok())
            .is_some_and(|v| v.split(';').skip(1).any(|p| p.trim().to_ascii_lowercase().starts_with("charset=")))
}

// as the TypeScript client reads an error: the JSON message, else the detail or title of a problem document, else the
// text a proxy sent; the cause is the body's cause, or the whole JSON body
fn error_from_body(body: &[u8], media_type: &str, status: reqwest::StatusCode, location: Option<&str>) -> HttpException {
    let status_code = status.as_u16() as i32;
    if let (true, Some(location)) = (status.is_redirection(), location) {
        let reason = status.canonical_reason().unwrap_or("Redirect");
        return HttpException::new(format!("{} to {} was not followed", reason, location), status_code, None);
    }
    let text = String::from_utf8_lossy(body).trim().to_string();
    let json = if is_json(media_type) { serde_json::from_slice::<Value>(body).ok() } else { None };
    let message = json
        .as_ref()
        .and_then(|value| ["message", "detail", "title"].iter().find_map(|key| value.get(*key)?.as_str()))
        .map(str::to_string)
        .unwrap_or(if text.is_empty() {
            status.canonical_reason().unwrap_or("Unknown error").to_string()
        } else {
            text
        });
    let cause = json.map(|value| match value.get("cause") {
        Some(cause) if !cause.is_null() => cause.clone(),
        _ => value,
    });
    HttpException::new(message, status_code, cause)
}

// a text success that is not JSON: an empty body is null, text is a string unless the output type wants JSON
fn read_text<T: DeserializeOwned>(text: &str, status_code: i32) -> Result<T, HttpException> {
    let to_error = |e: serde_json::Error| HttpException::new(e.to_string(), status_code, None);
    if text.is_empty() {
        return serde_json::from_value(Value::Null).map_err(to_error);
    }
    serde_json::from_value(Value::String(text.to_string()))
        .or_else(|e| serde_json::from_str(text).map_err(|_| e))
        .map_err(to_error)
}

// a success of any other type, as a file: an empty body is null, the bytes are a base64 string, the one form a JSON
// value holds at about their size
fn read_bytes<T: DeserializeOwned>(body: &[u8], status_code: i32) -> Result<T, HttpException> {
    let value = if body.is_empty() { Value::Null } else { Value::String(base64(body)) };
    serde_json::from_value(value).map_err(|e| HttpException::new(e.to_string(), status_code, None))
}

// standard base64 with padding
fn base64(bytes: &[u8]) -> String {
    const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let n = (chunk[0] as u32) << 16 | (*chunk.get(1).unwrap_or(&0) as u32) << 8 | *chunk.get(2).unwrap_or(&0) as u32;
        for i in 0..4 {
            out.push(if i <= chunk.len() { ALPHABET[(n >> (18 - 6 * i) & 63) as usize] as char } else { '=' });
        }
    }
    out
}

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
    ).map_err(|e| HttpException::new(e.to_string(), 0, None))?;

    let response = request.send().await.map_err(|e| HttpException::from_reqwest(e, 0))?;

    let status = response.status();
    let status_code = status.as_u16() as i32;
    let media_type = media_type(&response);
    let location = location(&response);

    // decoded by the charset it names, UTF-8 by default
    if status.is_success() && !is_json(&media_type) && !is_json_lines(&media_type) && is_text(&response, &media_type) {
        let text = response.text().await.map_err(|e| HttpException::from_reqwest(e, status_code))?;
        return read_text(&text, status_code);
    }

    let bytes = response.bytes().await.map_err(|e| HttpException::from_reqwest(e, status_code))?;

    // a 2xx body may hold any keys; a redirect reqwest didn't follow, as for a multipart body it can't send again,
    // is an error like any other status
    if !status.is_success() {
        return Err(error_from_body(&bytes, &media_type, status, location.as_deref()));
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

    read_bytes(&bytes, status_code)
}

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
    ).map_err(|e| HttpException::new(e.to_string(), 0, None))?;

    let response = request.send().await.map_err(|e| HttpException::from_reqwest(e, 0))?;

    let status = response.status();
    let status_code = status.as_u16() as i32;

    if !status.is_success() {
        let media_type = media_type(&response);
        let location = location(&response);
        let bytes = response.bytes().await.unwrap_or_default();
        return Err(error_from_body(&bytes, &media_type, status, location.as_deref()));
    }

    let byte_stream = response
        .bytes_stream()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.without_url()));

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
                    Err(e) => Some(Err(HttpException::new(e.to_string(), status_code, None))),
                }
            }
            // a stream cut or broken on the way
            Err(e) => Some(Err(HttpException::with_source(e, status_code))),
        }
    });

    let typed_stream = json_stream.map(move |result| {
        result.and_then(|value| {
            if is_error_line(&value) {
                Err(error_from_line(&value, status_code))
            } else {
                serde_json::from_value::<T>(value).map_err(|e| HttpException::new(e.to_string(), status_code, None))
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
            // an item that sends nothing, such as null, takes no index: the server reads indexes with a gap as an object
            let mut parts: Vec<String> = Vec::new();
            for item in arr {
                let part = build_query_string(item, &format!("{}[{}]", prefix, parts.len()));
                if !part.is_empty() {
                    parts.push(part);
                }
            }
            parts.join("&")
        }
        Value::Null => String::new(),
        _ => {
            let value_str = match data {
                Value::String(s) => s.clone(),
                Value::Number(n) => number_to_string(n),
                _ => data.to_string(),
            };
            format!("{}={}", urlencoding::encode(prefix), urlencoding::encode(&value_str))
        }
    }
}

