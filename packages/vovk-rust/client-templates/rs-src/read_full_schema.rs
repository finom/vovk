use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::Value;

// compiled in: a binary deployed without the source tree still has it
const SCHEMA_JSON: &str = include_str!("schema.json");

/// Validation schema structure
#[derive(Debug, Deserialize, Serialize)]
pub struct ValidationSchema {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub iteration: Option<Value>,
}

/// OpenAPI documentation
#[derive(Debug, Deserialize, Serialize)]
pub struct OpenApiDocs {
    pub summary: Option<String>,
    pub description: Option<String>,
    #[serde(flatten)]
    pub additional_fields: HashMap<String, Value>,
}

/// Handler schema
#[derive(Debug, Deserialize, Serialize)]
#[allow(non_snake_case)]
pub struct HandlerSchema {
    pub path: String,
    pub httpMethod: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validation: Option<ValidationSchema>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub openapi: Option<OpenApiDocs>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub misc: Option<HashMap<String, Value>>,
}

/// Controller schema
#[derive(Debug, Deserialize, Serialize)]
#[allow(non_snake_case)]
pub struct ControllerSchema {
    pub rpcModuleName: String,
    pub originalControllerName: String,
    pub prefix: String,
    pub handlers: HashMap<String, HandlerSchema>,
}

/// Schema for individual segment
#[derive(Debug, Deserialize, Serialize)]
#[allow(non_snake_case)]
pub struct VovkSegmentSchema {
    pub emitSchema: bool,
    pub segmentName: String,
    pub controllers: HashMap<String, ControllerSchema>,
}

/// Complete Vovk schema with meta and multiple segments
#[derive(Debug, Deserialize, Serialize)]
pub struct VovkSchema {
    pub meta: HashMap<String, Value>,
    pub segments: HashMap<String, VovkSegmentSchema>,
}

/// Read the complete Vovk schema, embedded from schema.json
pub fn read_full_schema() -> Result<VovkSchema, Box<dyn std::error::Error>> {
    Ok(serde_json::from_str(SCHEMA_JSON)?)
}
