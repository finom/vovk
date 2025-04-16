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
    pub custom: Option<HashMap<String, Value>>,
}

/// Controller schema
#[derive(Debug, Deserialize, Serialize)]
#[allow(non_snake_case)]
pub struct ControllerSchema {
    pub controllerName: String,
    pub originalControllerName: String,
    pub prefix: String,
    pub handlers: HashMap<String, HandlerSchema>,
}

/// Schema for individual segment
#[derive(Debug, Deserialize, Serialize)]
#[allow(non_snake_case)]
pub struct VovkSchema {
    pub emitSchema: bool,
    pub segmentName: String,
    pub controllers: HashMap<String, ControllerSchema>,
}

/// Complete Vovk schema with config and multiple segments
#[derive(Debug, Deserialize, Serialize)]
pub struct VovkFullSchema {
    pub config: HashMap<String, Value>,
    pub segments: HashMap<String, VovkSchema>,
}

/// Read the complete Vovk schema from a JSON file
pub fn read_full_schema() -> Result<VovkFullSchema, Box<dyn std::error::Error>> {
    // Get the path to the project root (where Cargo.toml is)
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    
    // Build the full path to the data file
    let json_path = Path::new(manifest_dir).join("data/full-schema.json");

    // Open the file
    let file = File::open(&json_path)?;
    let reader = BufReader::new(file);
    
    // Parse the JSON
    let schema: VovkFullSchema = serde_json::from_reader(reader)?;
     
    Ok(schema)
}

/// Helper function to get a specific segment from the full schema
pub fn get_segment<'a>(schema: &'a VovkFullSchema, segment_name: &str) -> Option<&'a VovkSchema> {
    schema.segments.get(segment_name)
}

/// Helper function to get the root segment from the full schema
pub fn get_root_segment<'a>(schema: &'a VovkFullSchema) -> Option<&'a VovkSchema> {
    schema.segments.get("root")
}

/// Helper function to extract all controller names from all segments
pub fn get_all_controllers<'a>(schema: &'a VovkFullSchema) -> Vec<(&'a str, &'a str, &'a ControllerSchema)> {
    let mut controllers = Vec::new();
    
    for (segment_name, segment) in &schema.segments {
        for (controller_name, controller) in &segment.controllers {
            controllers.push((segment_name.as_str(), controller_name.as_str(), controller));
        }
    }
    
    controllers
}

/// Optional helper function to read schema from a custom path
pub fn read_schema_from_path(path: &Path) -> Result<VovkFullSchema, Box<dyn std::error::Error>> {
    let file = File::open(path)?;
    let reader = BufReader::new(file);
    let schema: VovkFullSchema = serde_json::from_reader(reader)?;
    Ok(schema)
}