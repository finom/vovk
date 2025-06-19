use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::Value;

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

/// Read the complete Vovk schema from a JSON file
pub fn read_full_schema() -> Result<VovkSchema, Box<dyn std::error::Error>> {
    // Get the path to the project root (where Cargo.toml is)
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    
    // Build the full path to the data file
    let json_path = Path::new(manifest_dir).join("data/schema.json");

    // Open the file
    let file = File::open(&json_path)?;
    let reader = BufReader::new(file);
    
    // Parse the JSON
    let schema: VovkSchema = serde_json::from_reader(reader)?;
     
    Ok(schema)
}
