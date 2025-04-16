use serde::{Serialize, de::DeserializeOwned};
use reqwest::blocking::Client;
use reqwest::Method;
use reqwest::header::HeaderMap;
use std::error::Error;
use std::fmt;
use jsonschema::JSONSchema;
use serde_json::Value;
use urlencoding;
use crate::read_full_schema;
use once_cell::sync::Lazy;

// Custom error type for HTTP exceptions
#[derive(Debug)]
struct HttpException {
    message: String,
    status_code: i32,
    cause: Option<Value>,
}

impl fmt::Display for HttpException {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for HttpException {}

// Enum to represent the API response, which can be a single value or a stream
pub enum ApiResponse<T> {
    Single(T),
    Stream(Box<dyn Iterator<Item = Result<T, Box<dyn Error>>>>),
}

// Load the full schema only once using lazy initialization
static FULL_SCHEMA: Lazy<Result<Value, Box<dyn Error + Send + Sync>>> = Lazy::new(|| {
    read_full_schema::read_full_schema()
        .map(|schema| serde_json::to_value(schema).expect("Failed to convert schema to Value"))
        .map_err(|e| Box::<dyn Error + Send + Sync>::from(format!("Failed to read schema: {}", e)))
});

// The main request function - now generic over all parameter types
pub fn http_request<T, B, Q, P>(
    default_api_root: &str,
    segment_name: &str,
    controller_name: &str,
    handler_name: &str,
    body: Option<&B>,
    query: Option<&Q>,
    params: Option<&P>,
    api_root: Option<&str>,
    disable_client_validation: bool,
) -> Result<ApiResponse<T>, Box<dyn Error>> 
where 
    T: DeserializeOwned + 'static,
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
        .and_then(|s| s.get(segment_name))
        .ok_or("Segment not found")?;
    
    let controller = segment.get("controllers")
        .and_then(|c| c.get(controller_name))
        .ok_or("Controller not found")?;
    
    let handlers = controller.get("handlers")
        .and_then(|h| h.as_object())
        .ok_or("Handlers not found")?;
    
    let handler = handlers.get(handler_name).ok_or("Handler not found")?;
    let prefix = controller.get("prefix")
        .and_then(|p| p.as_str())
        .ok_or("Prefix not found")?;
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

    // Construct the base URL
    let url_parts: Vec<&str> = vec![api_root.unwrap_or(default_api_root), segment_name, prefix, handler_path]
        .into_iter()
        .filter(|s| !s.is_empty())
        .collect();
    let mut url = url_parts.join("/");

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

    // Perform JSON validation if not disabled
    if !disable_client_validation {
        if let Some(body_schema) = validation.get("body") {
            if let Some(ref body_val) = body_value {
                let schema =
                    JSONSchema::compile(body_schema).map_err(|e| format!("Invalid body schema: {}", e))?;
                schema
                    .validate(body_val)
                    .map_err(|e| {
                        let error_msgs: Vec<String> = e.map(|err| err.to_string()).collect();
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
                        let error_msgs: Vec<String> = e.map(|err| err.to_string()).collect();
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
                        let error_msgs: Vec<String> = e.map(|err| err.to_string()).collect();
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
                let pattern = format!(":{}", key);
                if let Value::String(s) = value {
                    url = url.replace(&pattern, s);
                } else {
                    return Err(format!("Param {} must be a string", key).into());
                }
            }
        } else {
            return Err("Params must be an object".into());
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
    let mut headers = HeaderMap::new();
    headers.insert("Accept", "application/jsonl, application/json".parse().unwrap());
    if body_value.is_some() {
        headers.insert("Content-Type", "application/json".parse().unwrap());
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

    // Build and send the HTTP request
    let client = Client::new();
    let mut request = client.request(method, &url).headers(headers);
    if let Some(body_val) = body_value {
        request = request.json(&body_val);
    }
    let response = request.send()?;

    // Handle the response based on Content-Type
    let content_type = response
        .headers()
        .get("Content-Type")
        .and_then(|v| v.to_str().ok());
    
    match content_type {
        Some(ct) if ct.contains("application/jsonl") => {
            let json_stream = JsonlStream {
                reader: std::io::BufReader::new(response),
                buffer: String::new(),
            };
            
            let typed_stream = json_stream.map(|result| {
                result.and_then(|value| {
                    if value.get("isError").is_some() {
                        let message = value["reason"]
                            .as_str()
                            .unwrap_or("Unknown error")
                            .to_string();
                        Err(Box::new(HttpException {
                            message,
                            status_code: 0,
                            cause: None,
                        }) as Box<dyn Error>)
                    } else {
                        serde_json::from_value::<T>(value)
                            .map_err(|e| Box::new(e) as Box<dyn Error>)
                    }
                })
            });
            
            Ok(ApiResponse::Stream(Box::new(typed_stream)))
        }
        Some(ct) if ct.contains("application/json") => {
            let value: Value = response.json()?;
            if value.get("isError").is_some() {
                let message = value["message"]
                    .as_str()
                    .unwrap_or("Unknown error")
                    .to_string();
                let status_code = value["statusCode"].as_i64().unwrap_or(0) as i32;
                let cause = value.get("cause").cloned();
                return Err(Box::new(HttpException {
                    message,
                    status_code,
                    cause,
                }));
            }
            
            let typed_value = serde_json::from_value::<T>(value)?;
            Ok(ApiResponse::Single(typed_value))
        }
        _ => {
            let text = response.text()?;
            let typed_value = serde_json::from_str::<T>(&text)?;
            Ok(ApiResponse::Single(typed_value))
        }
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
                .collect();
            parts.join("&")
        }
        Value::Null => String::new(),
        _ => {
            let value_str = match data {
                Value::String(s) => s.clone(),
                _ => data.to_string(),
            };
            format!("{}={}", prefix, urlencoding::encode(&value_str))
        }
    }
}

// Struct and Iterator implementation for streaming JSONL responses
struct JsonlStream {
    reader: std::io::BufReader<reqwest::blocking::Response>,
    buffer: String,
}

impl Iterator for JsonlStream {
    type Item = Result<Value, Box<dyn Error>>;

    fn next(&mut self) -> Option<Self::Item> {
        loop {
            if let Some(line_end) = self.buffer.find('\n') {
                let line = self.buffer[..line_end].to_string();
                self.buffer = self.buffer[line_end + 1..].to_string();
                if !line.is_empty() {
                    match serde_json::from_str::<Value>(&line) {
                        Ok(value) => {
                            if value.get("isError").is_some() {
                                let message = value["reason"]
                                    .as_str()
                                    .unwrap_or("Unknown error")
                                    .to_string();
                                return Some(Err(Box::new(HttpException {
                                    message,
                                    status_code: 0,
                                    cause: None,
                                })));
                            }
                            return Some(Ok(value));
                        }
                        Err(e) => return Some(Err(Box::new(e))),
                    }
                }
            } else {
                match std::io::Read::read_to_string(&mut self.reader, &mut self.buffer) {
                    Ok(0) => {
                        if !self.buffer.is_empty() {
                            let line = std::mem::take(&mut self.buffer);
                            if !line.is_empty() {
                                match serde_json::from_str::<Value>(&line) {
                                    Ok(value) => {
                                        if value.get("isError").is_some() {
                                            let message = value["reason"]
                                                .as_str()
                                                .unwrap_or("Unknown error")
                                                .to_string();
                                            return Some(Err(Box::new(HttpException {
                                                message,
                                                status_code: 0,
                                                cause: None,
                                            })));
                                        }
                                        return Some(Ok(value));
                                    }
                                    Err(e) => return Some(Err(Box::new(e))),
                                }
                            }
                        }
                        return None;
                    }
                    Ok(_) => {
                        // Continue the loop to process more data
                    }
                    Err(e) => return Some(Err(Box::new(e))),
                }
            }
        }
    }
}